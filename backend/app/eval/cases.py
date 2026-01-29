from __future__ import annotations

# Fixed evaluation set (Phase 5). Keep small and repeatable.
# Patterns are regex strings applied case-insensitively.

CASES: list[dict] = [
    {
        "id": "policy_returns",
        "query": "What is your return policy?",
        "must_match": [r"\b30\s+days\b"],
        "must_not_match": [r"\b90\s+days\b"],
    },
    {
        "id": "policy_shipping",
        "query": "How long does standard shipping take?",
        "must_match": [r"\b3\s*[–-]\s*7\s+business\s+days\b"],
        "must_not_match": [],
    },
    {
        "id": "product_black_slim",
        "query": "I want black slim jeans under $130. What do you recommend?",
        "must_match": [r"SKU-D004|Black\s+Selvedge\s+Jeans"],
        "must_not_match": [r"SKU-D999"],
    },
    {
        "id": "unknown_policy",
        "query": "Do you offer free hemming?",
        "must_match": [r"don.t have enough information|i don.t know"],
        "must_not_match": [r"yes"],
    },
]
