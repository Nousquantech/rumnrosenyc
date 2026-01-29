from __future__ import annotations

import re
from dataclasses import dataclass


FORBIDDEN_PHRASES = (
    "as an ai language model",
    "i can't browse",
    "i cannot browse",
    "i don't have access to",
)

_SKU_RE = re.compile(r"\bSKU-[A-Z]\d{3}\b", re.IGNORECASE)


@dataclass(frozen=True)
class ValidationResult:
    ok: bool
    reason: str | None


def validate_final_answer(*, answer: str, allowed_product_ids: list[str]) -> ValidationResult:
    text = (answer or "").strip()
    if not text:
        return ValidationResult(ok=False, reason="empty")

    lowered = text.lower()
    for phrase in FORBIDDEN_PHRASES:
        if phrase in lowered:
            return ValidationResult(ok=False, reason=f"forbidden_phrase:{phrase}")

    allowed = {p.strip().lower() for p in (allowed_product_ids or []) if p}
    for sku in _SKU_RE.findall(text):
        if sku.strip().lower() not in allowed:
            return ValidationResult(ok=False, reason=f"hallucinated_sku:{sku}")

    return ValidationResult(ok=True, reason=None)
