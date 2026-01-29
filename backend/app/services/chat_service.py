from __future__ import annotations

import os
import re
import time
from dataclasses import dataclass
from typing import Any

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.ai.engine import AIAnswerMeta, AIEngine, SAFE_FALLBACK_ANSWER
from app.ai.vector_store import VectorStore
from app.memory.preferences import extract_explicit_filters, extract_preferences, merge_active_filters
from app.memory.store import MemoryStore
from app.models import Policy, Product
from app.safety.validator import validate_final_answer


@dataclass(frozen=True)
class ChatServiceResult:
    answer: str
    session_id: str
    retrieved_product_ids: list[str]
    retrieved_policy_types: list[str]
    recommended_products: list[dict[str, Any]] | None
    follow_up_question: str | None
    model: str
    total_latency_ms: int
    ai: AIAnswerMeta
    validation_error: str | None


def _build_context(*, products: list[Product], policies: list[Policy]) -> str:
    lines: list[str] = []
    lines.append("PRODUCTS (RELEVANT):")
    for p in products:
        lines.append(f"{p.name} | {p.category} | {p.price:.2f} | {p.fit} | {p.style} | {p.description}")

    lines.append("")
    lines.append("POLICIES (RELEVANT):")
    for pol in policies:
        lines.append(f"{pol.type}: {pol.content}")

    return "\n".join(lines)


def _build_memory_section(*, preferences: dict[str, Any], history: list[dict[str, str]]) -> str:
    lines: list[str] = []

    active = (preferences or {}).get("active_filters")
    if not isinstance(active, dict):
        active = {}
    pref_fit = active.get("fit")
    pref_color = active.get("color")
    pref_max = active.get("max_price")
    pref_size = active.get("size")
    pref_focus = active.get("focus")

    if pref_fit or pref_color or pref_max is not None or pref_size or pref_focus:
        lines.append("USER PREFERENCES (ADVISORY):")
        if pref_fit:
            lines.append(f"- fit: {pref_fit}")
        if pref_color:
            lines.append(f"- color: {pref_color}")
        if pref_max is not None:
            lines.append(f"- max_price: {pref_max}")
        if pref_size:
            lines.append(f"- size: {pref_size}")
        if pref_focus:
            lines.append(f"- focus: {pref_focus}")
        lines.append("")

    if history:
        lines.append("CONVERSATION CONTEXT (LAST TURNS):")
        for msg in history:
            role = (msg.get("role") or "").strip().lower()
            content = (msg.get("content") or "").strip()
            if not role or not content:
                continue
            if role == "user":
                lines.append(f"User: {content}")
            else:
                lines.append(f"Assistant: {content}")
        lines.append("")

    return "\n".join(lines).strip()


def _parse_prefixed_id(doc_id: str, prefix: str) -> str | None:
    if not doc_id:
        return None
    if not doc_id.startswith(prefix):
        return None
    return doc_id[len(prefix) :]


def _dedupe_keep_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for v in values:
        if v in seen:
            continue
        seen.add(v)
        out.append(v)
    return out


def _product_matches_color(p: Product, color: str) -> bool:
    if not color:
        return True
    colors = (p.colors or "").lower()
    return color.lower() in colors


def _product_matches_fit(p: Product, fit: str) -> bool:
    if not fit:
        return True
    return (p.fit or "").strip().lower() == fit.strip().lower()


def _product_matches_size(p: Product, size: str) -> bool:
    if not size:
        return True
    s = size.strip().upper()
    available = [x.strip().upper() for x in str(p.sizes or "").split(",") if x.strip()]
    return s in available


def _apply_explicit_filters(products: list[Product], explicit: dict[str, Any]) -> list[Product]:
    fit = (explicit or {}).get("fit")
    color = (explicit or {}).get("color")
    max_price = (explicit or {}).get("max_price")
    size = (explicit or {}).get("size")

    out: list[Product] = []
    for p in products:
        if fit and not _product_matches_fit(p, str(fit)):
            continue
        if color and not _product_matches_color(p, str(color)):
            continue
        if size and not _product_matches_size(p, str(size)):
            continue
        if max_price is not None:
            try:
                if float(p.price) > float(max_price):
                    continue
            except Exception:
                pass
        out.append(p)
    return out


def _rank_with_preferences(
    *,
    products: list[Product],
    base_distance_by_id: dict[str, float],
    preferences: dict[str, Any],
    explicit: dict[str, Any],
) -> list[Product]:
    pref_fit = None if (explicit or {}).get("fit") else (preferences or {}).get("fit")
    pref_color = None if (explicit or {}).get("color") else (preferences or {}).get("color")
    pref_max_price = None if (explicit or {}).get("max_price") is not None else (preferences or {}).get("max_price")

    def score(p: Product) -> float:
        base = -float(base_distance_by_id.get(p.id, 1e9))

        boost = 0.0
        if pref_fit and _product_matches_fit(p, str(pref_fit)):
            boost += 0.25
        if pref_color and _product_matches_color(p, str(pref_color)):
            boost += 0.15

        if pref_max_price is not None:
            try:
                maxp = float(pref_max_price)
                price = float(p.price)
                if maxp > 0 and price <= maxp:
                    boost += 0.10 * max(0.0, (maxp - price) / maxp)
            except Exception:
                pass

        return base + boost

    return sorted(products, key=score, reverse=True)


def _truncate(text: str, *, max_chars: int) -> str:
    if max_chars <= 0:
        return text
    s = text or ""
    if len(s) <= max_chars:
        return s
    return s[:max_chars]


def _last_meaningful_user_query(history: list[dict[str, str]]) -> str | None:
    """Return the most recent user message that looks like a product query.

    Useful when the current turn is just a preference-only reply like "200".
    """

    for msg in reversed(history or []):
        if (msg.get("role") or "").strip().lower() != "user":
            continue
        content = (msg.get("content") or "").strip()
        if not content:
            continue
        # Needs at least one letter to be a meaningful retrieval query.
        if re.search(r"[a-zA-Z]", content):
            return content
    return None


def _extract_focus(text: str) -> str | None:
    t = (text or "").strip().lower()
    if not t:
        return None
    if re.search(r"\b(outfit|look|full\s+outfit)\b", t):
        return "outfit"
    if re.search(r"\bjeans?\b", t):
        return "jeans"
    if re.search(r"\b(jacket|trucker|coat)\b", t):
        return "jacket"
    return None


def _load_products_by_ids_preserve_order(db: Session, ids: list[str]) -> list[Product]:
    if not ids:
        return []
    rows = db.query(Product).filter(Product.id.in_(ids)).all()
    by_id = {p.id: p for p in rows}
    return [by_id[i] for i in ids if i in by_id]


def _is_preference_only_turn(query: str) -> bool:
    """Heuristic: reply is mostly a preference/value, not a new search.

    Examples: "L", "size L", "regular", "indigo", "200", "$200", "jeans".
    """

    q = (query or "").strip().lower()
    if not q:
        return True
    if _extract_focus(q) and len(q.split()) <= 2:
        return True
    # Numeric-only or currency-only budget replies.
    if re.fullmatch(r"\$?\s*\d+(?:\.\d+)?\s*(?:usd|dollars?)?\s*", q):
        return True
    # Single token size like "L" or fit words.
    if len(q.split()) <= 2 and q in {"xxs", "xs", "s", "m", "l", "xl", "xxl", "skinny", "slim", "regular", "relaxed", "straight", "tapered"}:
        return True
    # Simple color replies.
    if len(q.split()) <= 2 and q in {"black", "indigo", "blue", "navy", "white", "gray", "grey"}:
        return True
    return False


def _apply_progressive_filters(*, products: list[Product], prefs: dict[str, Any]) -> list[Product]:
    """Apply stored preferences as hard filters (intersection) in a stable way."""

    out = list(products)

    focus = (prefs or {}).get("focus")
    if focus == "jeans":
        out = [p for p in out if (p.category or "").strip().lower() == "jeans"]
    elif focus == "jacket":
        out = [p for p in out if (p.category or "").strip().lower() in {"jacket", "jackets"}]

    size = (prefs or {}).get("size")
    if size:
        out = [p for p in out if _product_matches_size(p, str(size))]

    fit = (prefs or {}).get("fit")
    if fit:
        out = [p for p in out if _product_matches_fit(p, str(fit))]

    color = (prefs or {}).get("color")
    if color:
        out = [p for p in out if _product_matches_color(p, str(color))]

    max_price = (prefs or {}).get("max_price")
    if max_price is not None:
        try:
            maxp = float(max_price)
            out = [p for p in out if float(p.price) <= maxp]
        except Exception:
            pass

    return out


def _dedupe_str_keep_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for v in values:
        key = v.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(v.strip())
    return out


def _available_fits(products: list[Product]) -> list[str]:
    return _dedupe_str_keep_order([(p.fit or "").strip().lower() for p in (products or []) if (p.fit or "").strip()])


def _available_sizes(products: list[Product]) -> list[str]:
    sizes: list[str] = []
    for p in products or []:
        for s in str(p.sizes or "").split(","):
            s2 = s.strip().upper()
            if not s2:
                continue
            sizes.append(s2)

    # Prefer a nice ordering: alpha sizes first, then numeric.
    alpha_order = {"XXS": 0, "XS": 1, "S": 2, "M": 3, "L": 4, "XL": 5, "XXL": 6}

    def key(v: str) -> tuple[int, int, str]:
        if v in alpha_order:
            return (0, alpha_order[v], v)
        if v.isdigit():
            return (1, int(v), v)
        return (2, 0, v)

    deduped = _dedupe_str_keep_order(sizes)
    return sorted(deduped, key=key)


def _available_colors(products: list[Product]) -> list[str]:
    colors: list[str] = []
    for p in products or []:
        raw = str(p.colors or "")
        if not raw.strip():
            continue
        # Split on common delimiters.
        parts = re.split(r"[,/|]", raw)
        for c in parts:
            c2 = c.strip().lower()
            if c2:
                colors.append(c2)
    return _dedupe_str_keep_order(colors)


def _format_options(options: list[str], *, limit: int = 5) -> str:
    opts = [o for o in (options or []) if o]
    if not opts:
        return ""
    opts = opts[:limit]
    if len(opts) == 1:
        return opts[0]
    if len(opts) == 2:
        return f"{opts[0]} or {opts[1]}"
    return ", ".join(opts[:-1]) + f", or {opts[-1]}"


def _build_dynamic_follow_up(*, active_filters: dict[str, Any], candidates: list[Product]) -> str:
    """Build a follow-up question using only options that exist in the current candidate set."""

    af = dict(active_filters or {})

    sizes = _available_sizes(candidates)
    fits = _available_fits(candidates)
    colors = _available_colors(candidates)

    # If the user selected something that's not available, ask them to choose from what's available.
    if af.get("size") and str(af.get("size")).strip().upper() not in {s.upper() for s in sizes} and sizes:
        want = str(af.get("size")).strip().upper()
        return f"We don't have size {want} in this selection. What size do you want? (Available: {_format_options(sizes)})"

    if af.get("fit") and str(af.get("fit")).strip().lower() not in {f.lower() for f in fits} and fits:
        want = str(af.get("fit")).strip().lower()
        return f"We don't have {want} fit in this selection. Do you prefer {_format_options(fits)}?"

    if af.get("color") and str(af.get("color")).strip().lower() not in {c.lower() for c in colors} and colors:
        want = str(af.get("color")).strip().lower()
        return f"We don't have {want} in this selection. Which color do you prefer? (Available: {_format_options(colors)})"

    # Next missing filter in order.
    if not af.get("size"):
        if sizes:
            return f"What size do you need? (Available: {_format_options(sizes)})"
        return "What size do you need?"

    if not af.get("fit"):
        if fits:
            return f"What fit do you prefer? ({_format_options(fits)})"
        return "What fit do you prefer?"

    if not af.get("color"):
        if colors:
            return f"Any color preference? ({_format_options(colors)})"
        return "Any color preference?"

    if af.get("max_price") is None:
        return "Do you have a max budget?"

    # Focus comes last (optional).
    if not af.get("focus"):
        return "Want to focus on jackets, jeans, or a full outfit?"

    focus = str(af.get("focus")).strip().lower()
    if focus == "jeans":
        return "What waist size do you wear (e.g., 30/32/34)?"
    if focus == "jacket":
        # Use available fits if we have them.
        if fits:
            return f"Which jacket fit do you prefer? ({_format_options(fits)})"
        return "Which jacket fit do you prefer?"
    if focus == "outfit":
        return "Are you building the outfit around jeans or a jacket?"

    return "Anything else you want to refine (color, fit, budget)?"


def _keyword_fallback_products(*, db: Session, query: str, limit: int) -> list[Product]:
    """Fallback retrieval when vector indexes are empty.

    Keeps Phase 6 demo UX usable without requiring embeddings to be generated.
    """

    q = (query or "").strip().lower()
    if not q:
        return []

    # Light stopword set; keep it minimal.
    stop = {
        "a",
        "an",
        "the",
        "and",
        "or",
        "to",
        "for",
        "of",
        "in",
        "on",
        "with",
        "me",
        "my",
        "show",
        "need",
        "want",
        "looking",
    }

    tokens = [t for t in (q.replace("/", " ").replace("-", " ").split()) if len(t) >= 3 and t not in stop]
    if not tokens:
        tokens = [q]

    fields = [Product.name, Product.category, Product.colors, Product.style, Product.description]
    clauses = []
    for t in tokens[:6]:
        pattern = f"%{t}%"
        for f in fields:
            clauses.append(func.lower(func.coalesce(f, "")).like(pattern))

    if not clauses:
        return []

    return db.query(Product).filter(or_(*clauses)).limit(int(max(1, limit))).all()


class ChatService:
    def __init__(self) -> None:
        self._engine = AIEngine()

    def handle(self, *, query: str, session_id: str | None, db: Session) -> ChatServiceResult:
        started = time.perf_counter()

        q = (query or "").strip()
        if not q:
            sid = MemoryStore.ensure_session_id(session_id)
            ai_meta = AIAnswerMeta(model=self._engine.model, latency_ms=0, usage={}, error_type=None)
            return ChatServiceResult(
                answer=SAFE_FALLBACK_ANSWER,
                session_id=sid,
                retrieved_product_ids=[],
                retrieved_policy_types=[],
                recommended_products=None,
                follow_up_question=None,
                model=self._engine.model,
                total_latency_ms=0,
                ai=ai_meta,
                validation_error=None,
            )

        store = MemoryStore()
        sid = store.ensure_session_id(session_id)
        mem = store.load(sid)

        # Canonical progressive state: all filters live under preferences['active_filters'].
        prefs_state = dict(mem.preferences or {})
        active_filters = prefs_state.get("active_filters")
        if not isinstance(active_filters, dict):
            active_filters = {}

        # Back-compat migration: if old keys exist, migrate them into active_filters once.
        if (not active_filters) and (mem.preferences or {}):
            legacy = mem.preferences or {}
            if legacy.get("preferred_size"):
                active_filters["size"] = legacy.get("preferred_size")
            if legacy.get("preferred_fit"):
                active_filters["fit"] = legacy.get("preferred_fit")
            if legacy.get("preferred_color"):
                active_filters["color"] = legacy.get("preferred_color")
            if legacy.get("max_price") is not None:
                active_filters["max_price"] = legacy.get("max_price")
            if legacy.get("focus"):
                active_filters["focus"] = legacy.get("focus")

        prefs_state["active_filters"] = active_filters

        # Extract preferences early so preference-only replies are persisted even if retrieval is empty.
        extracted = extract_preferences(q)
        active_filters = merge_active_filters(active_filters, extracted)
        focus_now = _extract_focus(q)
        if focus_now:
            active_filters["focus"] = focus_now
        prefs_state["active_filters"] = active_filters

        # Progressive filtering: keep a working set of candidate ids so new turns
        # filter the previously filtered set (not a brand-new retrieval).
        prior_candidate_ids = (mem.preferences or {}).get("candidate_ids")
        if isinstance(prior_candidate_ids, list) and all(isinstance(x, str) for x in prior_candidate_ids):
            candidate_ids: list[str] | None = list(prior_candidate_ids)
        else:
            candidate_ids = None

        top_k_products = int(os.getenv("TOP_K_PRODUCTS", "5") or "5")
        top_k_policies = int(os.getenv("TOP_K_POLICIES", "3") or "3")
        candidates_products = int(os.getenv("RETRIEVAL_CANDIDATES_PRODUCTS", "15") or "15")
        candidates_policies = int(os.getenv("RETRIEVAL_CANDIDATES_POLICIES", "8") or "8")

        products_store = VectorStore(collection_name="products")
        policies_store = VectorStore(collection_name="policies")

        retrieval_query = q
        product_hits = products_store.similarity_search(retrieval_query, k=max(top_k_products, candidates_products))
        policy_hits = policies_store.similarity_search(retrieval_query, k=max(top_k_policies, candidates_policies))

        base_distance_by_id: dict[str, float] = {}
        for hit in product_hits:
            pid = _parse_prefixed_id(hit.id, "product:")
            if pid:
                base_distance_by_id[pid] = float(hit.distance)

        product_ids = _dedupe_keep_order([pid for pid in (_parse_prefixed_id(h.id, "product:") for h in product_hits) if pid])
        policy_types = _dedupe_keep_order([pt for pt in (_parse_prefixed_id(h.id, "policy:") for h in policy_hits) if pt])

        # If this turn is likely preference-only and retrieval returns nothing, try using the
        # last meaningful user query from history to keep the flow consistent.
        if not product_ids and not policy_types and (
            extracted.preferred_fit
            or extracted.preferred_color
            or extracted.preferred_size
            or extracted.max_price is not None
            or focus_now
        ):
            alt = _last_meaningful_user_query(mem.history)
            if alt:
                retrieval_query = alt
                product_hits = products_store.similarity_search(retrieval_query, k=max(top_k_products, candidates_products))
                policy_hits = policies_store.similarity_search(retrieval_query, k=max(top_k_policies, candidates_policies))

                base_distance_by_id = {}
                for hit in product_hits:
                    pid = _parse_prefixed_id(hit.id, "product:")
                    if pid:
                        base_distance_by_id[pid] = float(hit.distance)

                product_ids = _dedupe_keep_order(
                    [pid for pid in (_parse_prefixed_id(h.id, "product:") for h in product_hits) if pid]
                )
                policy_types = _dedupe_keep_order(
                    [pt for pt in (_parse_prefixed_id(h.id, "policy:") for h in policy_hits) if pt]
                )

        if not product_ids:
            # If embeddings haven't been generated yet (or the products index is empty), FAISS will be empty and
            # similarity_search returns nothing. Fall back to a keyword search over the catalog so the demo remains usable.
            try:
                has_any_products = db.query(Product.id).limit(1).first() is not None
            except Exception:
                has_any_products = False

            if has_any_products:
                fallback = _keyword_fallback_products(
                    db=db, query=retrieval_query, limit=max(top_k_products, candidates_products)
                )
                if fallback:
                    product_ids = [p.id for p in fallback]
                    base_distance_by_id.update({p.id: 0.0 for p in fallback})

        if not product_ids and not policy_types:
            # No retrieval results.
            # - If this turn is preference-only, acknowledge + advance.
            # - Otherwise, apologize for no exact match and suggest alternatives.
            ai_meta = AIAnswerMeta(model=self._engine.model, latency_ms=0, usage={}, error_type=None)

            preferred_fit = active_filters.get("fit")
            preferred_size = active_filters.get("size")
            preferred_color = active_filters.get("color")
            preferred_max = active_filters.get("max_price")
            focus = active_filters.get("focus")

            # Build/refresh progressive candidate set.
            base_products: list[Product]
            if candidate_ids and _is_preference_only_turn(q):
                base_products = _load_products_by_ids_preserve_order(db, candidate_ids)
            else:
                base_products = db.query(Product).all()

            # If the user already chose a focus, narrow the working set.
            if focus == "jeans":
                base_products = [p for p in base_products if (p.category or "").strip().lower() == "jeans"]
            elif focus == "jacket":
                base_products = [p for p in base_products if (p.category or "").strip().lower() in {"jacket", "jackets"}]

            # Progressive filter from the current working set.
            filtered = _apply_progressive_filters(products=base_products, prefs=active_filters)
            # Persist the working set for the next turn: if filtering becomes empty, keep base set so user can relax constraints.
            prefs_state["candidate_ids"] = [p.id for p in (filtered or base_products)]

            follow_up_question: str | None = None
            recommended_products: list[Product] | None = None

            if _is_preference_only_turn(q):
                lines: list[str] = []
                if preferred_color:
                    lines.append(f"Color noted - {str(preferred_color).strip().lower()}.")
                if preferred_fit:
                    lines.append(f"Fit noted - {str(preferred_fit).strip().lower()}.")
                if preferred_size:
                    lines.append(f"Got it - size {str(preferred_size).strip().upper()}.")
                if preferred_max is not None:
                    try:
                        lines.append(f"Budget noted - under ${int(round(float(preferred_max)))}.")
                    except Exception:
                        pass
                if not lines:
                    lines.append(SAFE_FALLBACK_ANSWER)

                follow_up_question = _build_dynamic_follow_up(active_filters=active_filters, candidates=filtered or base_products)

                lines.append(follow_up_question)
                answer = "\n".join([s for s in lines if s]).strip()
            else:
                # User asked for something we can't retrieve confidently.
                # Suggest alternatives from the working set.
                pool = filtered or base_products
                recommended_products = pool[: min(3, len(pool))] if pool else None

                lines: list[str] = []
                lines.append("Sorry — I couldn’t find an exact match for that request in our catalog.")
                if recommended_products:
                    lines.append("Here are a few close alternatives you might like:")
                    for p in recommended_products:
                        desc = (p.description or "").strip()
                        if desc:
                            lines.append(f"- {p.name} - ${int(round(float(p.price)))}. {desc}")
                        else:
                            lines.append(f"- {p.name} - ${int(round(float(p.price)))}")
                else:
                    lines.append("I don’t have enough items in the catalog right now to suggest alternatives.")

                follow_up_question = "Want to try jeans or a jacket? Also tell me a color (black/indigo) and a max budget."
                lines.append("")
                lines.append(follow_up_question)
                answer = "\n".join(lines).strip()

            # Persist prefs + turns.
            store.save(sid, preferences=prefs_state, history=mem.history)
            store.append_turn(sid, role="user", content=q)
            store.append_turn(sid, role="assistant", content=answer)

            def _to_product_like(p: Product) -> dict[str, Any]:
                return {
                    "id": p.id,
                    "name": p.name,
                    "price": float(p.price),
                    "fit": p.fit,
                    "wash": p.style,
                }

            return ChatServiceResult(
                answer=answer,
                session_id=sid,
                retrieved_product_ids=[],
                retrieved_policy_types=[],
                recommended_products=[_to_product_like(p) for p in recommended_products] if recommended_products else None,
                follow_up_question=follow_up_question,
                model=self._engine.model,
                total_latency_ms=int((time.perf_counter() - started) * 1000),
                ai=ai_meta,
                validation_error=None,
            )

        products_by_id = {p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()}
        policies_by_type = {p.type: p for p in db.query(Policy).filter(Policy.type.in_(policy_types)).all()}

        products = [products_by_id[pid] for pid in product_ids if pid in products_by_id]
        policies = [policies_by_type[pt] for pt in policy_types if pt in policies_by_type]

        explicit = extract_explicit_filters(q)
        products = _apply_explicit_filters(products, explicit)
        products = _rank_with_preferences(
            products=products,
            base_distance_by_id=base_distance_by_id,
            preferences=active_filters,
            explicit=explicit,
        )[:top_k_products]

        # Save updated filters before LLM call so the memory section includes them.
        store.save(sid, preferences=prefs_state, history=mem.history)
        memory_section = _build_memory_section(preferences=prefs_state, history=mem.history)
        retrieved_context = _build_context(products=products, policies=policies)
        context = (memory_section + "\n\n" + retrieved_context).strip() if memory_section else retrieved_context

        max_context_chars = int(os.getenv("MAX_CONTEXT_CHARS", "12000") or "12000")
        context = _truncate(context, max_chars=max_context_chars)

        answer, ai_meta = self._engine.answer_with_meta(
            context=context,
            question=q,
            max_response_tokens=int(os.getenv("MAX_RESPONSE_TOKENS", "300") or "300"),
            timeout_seconds=float(os.getenv("AI_TIMEOUT_SECONDS", "15") or "15"),
        )

        def _to_product_like(p: Product) -> dict[str, Any]:
            return {
                "id": p.id,
                "name": p.name,
                "price": float(p.price),
                "fit": p.fit,
                # Frontend cards support an optional `wash` line; we don't store wash, so use `style`.
                "wash": p.style,
            }

        follow_up_question: str | None = None
        recommended_products: list[Product] = list(products)

        # If the LLM is unavailable (rate limits, network errors, etc.), don't fail the UX.
        # We already have structured product data; provide a concise, helpful fallback.
        if answer == SAFE_FALLBACK_ANSWER and products:
            preferred_size = (explicit or {}).get("size") or (active_filters or {}).get("size")
            preferred_fit = (explicit or {}).get("fit") or (active_filters or {}).get("fit")
            preferred_color = (explicit or {}).get("color") or (active_filters or {}).get("color")
            preferred_max = (explicit or {}).get("max_price")
            if preferred_max is None:
                preferred_max = (active_filters or {}).get("max_price")
            focus = (active_filters or {}).get("focus")

            # Progressive candidate set for fallback browsing:
            # - if we have prior candidates and this is a preference-only turn, filter from that set
            # - otherwise start from the current retrieved products list, and persist candidates for next turn
            if candidate_ids and _is_preference_only_turn(q):
                base_products = _load_products_by_ids_preserve_order(db, candidate_ids)
            else:
                base_products = list(products)

            filtered_products = _apply_progressive_filters(products=base_products, prefs=active_filters)
            if filtered_products:
                products_for_display = filtered_products
            else:
                # Preference-only turns should stay within the existing candidate set,
                # even if the newly added filter makes the set empty (so we can ask the
                # user to pick from what's actually available instead of "jumping" catalogs).
                if candidate_ids and _is_preference_only_turn(q):
                    products_for_display = list(base_products)
                else:
                    products_for_display = list(products)

            prefs_state["candidate_ids"] = [p.id for p in products_for_display]

            ql = q.lower()
            def _fallback_score(p: Product) -> int:
                haystack = " ".join(
                    [
                        (p.name or ""),
                        (p.category or ""),
                        (p.colors or ""),
                        (p.style or ""),
                        (p.description or ""),
                    ]
                ).lower()
                score = 0
                for token in ql.split():
                    if token and token in haystack:
                        score += 1
                if "jacket" in ql and "jacket" in haystack:
                    score += 3
                if "jeans" in ql and "jeans" in haystack:
                    score += 3
                if "black" in ql and "black" in haystack:
                    score += 2

                if preferred_fit and str(preferred_fit).strip().lower() in haystack:
                    score += 2
                if preferred_size and _product_matches_size(p, str(preferred_size)):
                    score += 2
                if preferred_color and str(preferred_color).strip().lower() in haystack:
                    score += 2
                return score

            products_sorted = sorted(products_for_display, key=_fallback_score, reverse=True)

            # If the user asked for something specific and key tokens aren't present in the
            # suggested products, apologize and present these as alternatives.
            no_exact_match = False
            if not _is_preference_only_turn(q) and products_sorted:
                stop = {
                    "a",
                    "an",
                    "the",
                    "and",
                    "or",
                    "to",
                    "for",
                    "of",
                    "in",
                    "on",
                    "with",
                    "me",
                    "my",
                    "do",
                    "you",
                    "have",
                    "show",
                    "need",
                    "want",
                    "like",
                }

                query_tokens = [
                    t
                    for t in re.findall(r"[a-zA-Z]{4,}", ql)
                    if t and t not in stop
                ]

                combined = " ".join(
                    (
                        " ".join(
                            [
                                (p.name or ""),
                                (p.category or ""),
                                (p.colors or ""),
                                (p.style or ""),
                                (p.description or ""),
                            ]
                        ).lower()
                        for p in products_sorted[:5]
                    )
                )

                missing = [t for t in query_tokens if t not in combined]
                if missing:
                    no_exact_match = True

            displayed = list(products_sorted)
            recommended_products = list(displayed)
            lines: list[str] = []
            if preferred_size:
                lines.append(f"Got it - size {str(preferred_size).strip().upper()}.")
            if preferred_fit:
                lines.append(f"Fit noted - {str(preferred_fit).strip().lower()}.")
            if preferred_color:
                lines.append(f"Color noted - {str(preferred_color).strip().lower()}.")
            if preferred_max is not None:
                try:
                    lines.append(f"Budget noted - under ${int(round(float(preferred_max)))}.")
                except Exception:
                    pass
            if no_exact_match:
                lines.append("Sorry — I couldn’t find an exact match for that request.")
                lines.append("Here are a few close alternatives you might like:")
            else:
                lines.append("Here are a couple options I can see in our catalog:")
            for p in displayed[: min(3, len(displayed))]:
                desc = (p.description or "").strip()
                if desc:
                    lines.append(f"- {p.name} - ${int(round(float(p.price)))}. {desc}")
                else:
                    lines.append(f"- {p.name} - ${int(round(float(p.price)))}")

            lines.append("")
            follow_up_question = _build_dynamic_follow_up(active_filters=active_filters, candidates=displayed)
            lines.append(follow_up_question)
            answer = "\n".join(lines).strip()

        # Final response validator (Phase 5): refuse hallucinated SKUs, forbidden phrases.
        validation = validate_final_answer(answer=answer, allowed_product_ids=[p.id for p in products])
        validation_error = None
        if not validation.ok:
            validation_error = validation.reason or "invalid"
            answer = SAFE_FALLBACK_ANSWER

        # Update memory after answering.
        store.save(sid, preferences=prefs_state, history=mem.history)
        store.append_turn(sid, role="user", content=q)
        store.append_turn(sid, role="assistant", content=answer)

        return ChatServiceResult(
            answer=answer,
            session_id=sid,
            retrieved_product_ids=[p.id for p in products],
            retrieved_policy_types=[p.type for p in policies],
            recommended_products=[_to_product_like(p) for p in recommended_products] if recommended_products else None,
            follow_up_question=follow_up_question,
            model=self._engine.model,
            total_latency_ms=int((time.perf_counter() - started) * 1000),
            ai=ai_meta,
            validation_error=validation_error,
        )
