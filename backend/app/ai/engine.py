from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Any

from openai import OpenAI

from app.ai.prompts import SYSTEM_PROMPT
from app.env import load_backend_env

load_backend_env()


SAFE_FALLBACK_ANSWER = "I don't have enough information."


@dataclass(frozen=True)
class AIAnswerMeta:
    model: str
    latency_ms: int
    usage: dict[str, int]
    error_type: str | None


class AIEngine:
    def __init__(self) -> None:
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set in ai-retail-system/backend/.env")

        self._client = OpenAI(base_url=base_url, api_key=api_key)
        self._model = model

    @property
    def model(self) -> str:
        return self._model

    def answer_with_meta(
        self,
        *,
        context: str,
        question: str,
        max_response_tokens: int | None = None,
        timeout_seconds: float | None = None,
    ) -> tuple[str, AIAnswerMeta]:
        """Answer using the LLM.

        Phase 5 requirements:
        - Timeout
        - Retry (max 2)
        - Graceful failure message
        - Capture model + latency + token usage for logging/metrics
        """

        prompt = (
            "CONTEXT\n"
            f"{context}\n\n"
            "USER QUESTION\n"
            f"{question}\n"
        )

        retries = 2
        timeout = float(timeout_seconds or float(os.getenv("AI_TIMEOUT_SECONDS", "15") or "15"))
        max_tokens = max_response_tokens
        if max_tokens is None:
            max_tokens = int(os.getenv("MAX_RESPONSE_TOKENS", "300") or "300")

        last_err_type: str | None = None
        start = time.perf_counter()
        for attempt in range(retries + 1):
            try:
                client = self._client
                try:
                    # openai>=1.0 supports per-request options via with_options
                    client = self._client.with_options(timeout=timeout)
                except Exception:
                    client = self._client

                resp = client.chat.completions.create(
                    model=self._model,
                    temperature=0,
                    max_tokens=max_tokens,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                )

                content = (resp.choices[0].message.content or "").strip()
                usage: dict[str, int] = {}
                try:
                    u = getattr(resp, "usage", None)
                    if u is not None:
                        usage = {
                            "prompt_tokens": int(getattr(u, "prompt_tokens", 0) or 0),
                            "completion_tokens": int(getattr(u, "completion_tokens", 0) or 0),
                            "total_tokens": int(getattr(u, "total_tokens", 0) or 0),
                        }
                except Exception:
                    usage = {}

                if not content:
                    content = SAFE_FALLBACK_ANSWER

                normalized = content.lower().strip().rstrip(".")
                if normalized in {
                    "i don't know",
                    "i dont know",
                    "i do not know",
                    "unknown",
                    "i don’t have enough information",
                    "i don't have enough information",
                    "i dont have enough information",
                }:
                    content = SAFE_FALLBACK_ANSWER

                meta = AIAnswerMeta(
                    model=self._model,
                    latency_ms=int((time.perf_counter() - start) * 1000),
                    usage=usage,
                    error_type=None,
                )
                return content, meta
            except Exception as exc:
                last_err_type = type(exc).__name__
                if attempt >= retries:
                    break
                # Small backoff; keep it simple.
                time.sleep(0.25 * (attempt + 1))

        meta = AIAnswerMeta(
            model=self._model,
            latency_ms=int((time.perf_counter() - start) * 1000),
            usage={},
            error_type=last_err_type or "AIError",
        )
        return SAFE_FALLBACK_ANSWER, meta

    def answer(self, *, context: str, question: str) -> str:
        content, _ = self.answer_with_meta(context=context, question=question)
        return content
