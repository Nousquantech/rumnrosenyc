from __future__ import annotations

import json
import os
import re
import time
from dataclasses import asdict
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.eval.cases import CASES
from app.services.chat_service import ChatService


def _now_stamp() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _check_patterns(text: str, patterns: list[str]) -> list[str]:
    failures: list[str] = []
    for pat in patterns:
        if not re.search(pat, text or "", flags=re.IGNORECASE):
            failures.append(f"missing:{pat}")
    return failures


def _check_forbidden(text: str, patterns: list[str]) -> list[str]:
    failures: list[str] = []
    for pat in patterns:
        if re.search(pat, text or "", flags=re.IGNORECASE):
            failures.append(f"forbidden:{pat}")
    return failures


def run() -> int:
    service = ChatService()

    results: list[dict] = []
    passed = 0

    with SessionLocal() as db:  # type: ignore
        for case in CASES:
            started = time.perf_counter()
            out = service.handle(query=case["query"], session_id=None, db=db)

            checks: list[str] = []
            checks += _check_patterns(out.answer, list(case.get("must_match") or []))
            checks += _check_forbidden(out.answer, list(case.get("must_not_match") or []))

            ok = len(checks) == 0
            if ok:
                passed += 1

            results.append(
                {
                    "case_id": case["id"],
                    "query": case["query"],
                    "ok": ok,
                    "checks": checks,
                    "answer": out.answer,
                    "session_id": out.session_id,
                    "retrieved_product_ids": out.retrieved_product_ids,
                    "retrieved_policy_types": out.retrieved_policy_types,
                    "model": out.model,
                    "ai": asdict(out.ai),
                    "validation_error": out.validation_error,
                    "latency_ms": int((time.perf_counter() - started) * 1000),
                }
            )

    report = {
        "ts": _now_stamp(),
        "total": len(CASES),
        "passed": passed,
        "failed": len(CASES) - passed,
        "results": results,
    }

    out_dir = os.getenv("EVAL_OUTPUT_DIR", "eval_results")
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"eval_{int(time.time())}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"Wrote {path}")
    print(f"Passed {passed}/{len(CASES)}")
    return 0 if passed == len(CASES) else 2


if __name__ == "__main__":
    raise SystemExit(run())
