from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ExtractedPreferences:
    preferred_fit: str | None = None
    preferred_color: str | None = None
    max_price: float | None = None
    preferred_size: str | None = None


def merge_active_filters(current: dict[str, Any] | None, extracted: ExtractedPreferences) -> dict[str, Any]:
    """Merge extracted preferences into a single progressive filter object.

    This is the canonical "activeFilters" state shape.

    Keys:
      - size: str
      - fit: str
      - color: str
      - max_price: float

    New explicit values override previous ones; missing values do not reset.
    """

    out = dict(current or {})
    if extracted.preferred_size:
        out["size"] = extracted.preferred_size
    if extracted.preferred_fit:
        out["fit"] = extracted.preferred_fit
    if extracted.preferred_color:
        out["color"] = extracted.preferred_color
    if extracted.max_price is not None:
        out["max_price"] = extracted.max_price
    return out


_FIT_PATTERNS: list[tuple[str, str]] = [
    (r"\bskinny\s+fit\b|\bskinny\b", "skinny"),
    (r"\bslim\s+fit\b|\bslim\b", "slim"),
    (r"\bregular\s+fit\b|\bregular\b", "regular"),
    (r"\brelaxed\s+fit\b|\brelaxed\b", "relaxed"),
    (r"\bstraight\s+fit\b|\bstraight\b", "straight"),
    (r"\btapered\s+fit\b|\btapered\b", "tapered"),
]

_COLOR_PATTERNS: list[tuple[str, str]] = [
    (r"\bblack\b", "black"),
    (r"\bwhite\b", "white"),
    (r"\bgray\b|\bgrey\b", "gray"),
    (r"\bnavy\b", "navy"),
    (r"\bindigo\b", "indigo"),
    (r"\bblue\b", "blue"),
    (r"\bdark\s+wash\b", "dark wash"),
    (r"\blight\s+wash\b", "light wash"),
]

_MAX_PRICE_PATTERNS: list[re.Pattern[str]] = [
    # Common when user replies directly to "max budget?" like "$200"
    re.compile(r"^\s*\$\s*(\d+(?:\.\d+)?)\s*$", re.IGNORECASE),
    re.compile(r"^\s*(\d+(?:\.\d+)?)\s*(?:usd|dollars?)\s*$", re.IGNORECASE),
    re.compile(r"\bunder\s*\$?\s*(\d+(?:\.\d+)?)\b", re.IGNORECASE),
    re.compile(r"\bbelow\s*\$?\s*(\d+(?:\.\d+)?)\b", re.IGNORECASE),
    re.compile(r"\bno\s+more\s+than\s*\$?\s*(\d+(?:\.\d+)?)\b", re.IGNORECASE),
    re.compile(r"\bmax\s*\$?\s*(\d+(?:\.\d+)?)\b", re.IGNORECASE),
    re.compile(r"\b(?:up\s*to|at\s*most)\s*\$?\s*(\d+(?:\.\d+)?)\b", re.IGNORECASE),
    re.compile(r"\bbudget\s*(?:is|:|=)?\s*\$?\s*(\d+(?:\.\d+)?)\b", re.IGNORECASE),
    re.compile(r"\b(?:usd|dollars?)\s*(\d+(?:\.\d+)?)\b", re.IGNORECASE),
    re.compile(r"\$\s*(\d+(?:\.\d+)?)\b", re.IGNORECASE),
]


_SIZE_CANONICAL = {
    "xxs": "XXS",
    "xs": "XS",
    "s": "S",
    "m": "M",
    "l": "L",
    "xl": "XL",
    "xxl": "XXL",
}

_SIZE_PATTERNS: list[re.Pattern[str]] = [
    # size L / size: L / I'm L / I wear L
    re.compile(r"\bsize\s*[:=]?\s*(xxs|xs|s|m|l|xl|xxl)\b", re.IGNORECASE),
    re.compile(r"\bi\s*(?:am|'m)\s*(xxs|xs|s|m|l|xl|xxl)\b", re.IGNORECASE),
    re.compile(r"\bi\s*(?:wear|take)\s*(?:a\s*)?(xxs|xs|s|m|l|xl|xxl)\b", re.IGNORECASE),
]


def extract_explicit_filters(text: str) -> dict[str, Any]:
    """Extract hard constraints from the current user query.

    These are treated as authoritative constraints (must not be overridden by memory).
    """

    prefs = extract_preferences(text)
    out: dict[str, Any] = {}
    if prefs.preferred_fit:
        out["fit"] = prefs.preferred_fit
    if prefs.preferred_color:
        out["color"] = prefs.preferred_color
    if prefs.max_price is not None:
        out["max_price"] = prefs.max_price
    if prefs.preferred_size:
        out["size"] = prefs.preferred_size
    return out


def extract_preferences(text: str) -> ExtractedPreferences:
    """Extract explicit preference statements from user text.

    This is intentionally conservative and only detects explicit mentions.
    It does not infer any sensitive attributes.
    """

    t = (text or "").strip().lower()
    if not t:
        return ExtractedPreferences()

    fit: str | None = None
    for pat, canonical in _FIT_PATTERNS:
        if re.search(pat, t, flags=re.IGNORECASE):
            fit = canonical
            break

    color: str | None = None
    for pat, canonical in _COLOR_PATTERNS:
        if re.search(pat, t, flags=re.IGNORECASE):
            color = canonical
            break

    max_price: float | None = None
    for rx in _MAX_PRICE_PATTERNS:
        m = rx.search(t)
        if m:
            try:
                max_price = float(m.group(1))
            except Exception:
                max_price = None
            break

    # If the user replies with just a number (common after we ask for max budget),
    # treat it as a budget only if it's plausibly a price.
    if max_price is None:
        m_num = re.fullmatch(r"\s*(\d+(?:\.\d+)?)\s*", t)
        if m_num:
            try:
                v = float(m_num.group(1))
                if 50.0 <= v <= 5000.0:
                    max_price = v
            except Exception:
                pass

    preferred_size: str | None = None
    # If the entire message is just a size (e.g. "L"), accept it.
    if t in _SIZE_CANONICAL:
        preferred_size = _SIZE_CANONICAL[t]
    else:
        for rx in _SIZE_PATTERNS:
            m = rx.search(t)
            if m:
                preferred_size = _SIZE_CANONICAL.get(m.group(1).lower())
                break

    return ExtractedPreferences(
        preferred_fit=fit,
        preferred_color=color,
        max_price=max_price,
        preferred_size=preferred_size,
    )


def merge_preferences(current: dict[str, Any], extracted: ExtractedPreferences) -> dict[str, Any]:
    """Merge newly extracted (explicit) preferences into stored ones.

    New explicit preferences override previous ones.
    """

    out = dict(current or {})
    if extracted.preferred_fit:
        out["preferred_fit"] = extracted.preferred_fit
    if extracted.preferred_color:
        out["preferred_color"] = extracted.preferred_color
    if extracted.max_price is not None:
        out["max_price"] = extracted.max_price
    if extracted.preferred_size:
        out["preferred_size"] = extracted.preferred_size
    return out
