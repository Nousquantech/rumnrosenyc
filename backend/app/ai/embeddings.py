from __future__ import annotations

import os
import re
from hashlib import blake2b
from openai import OpenAI

from app.env import load_backend_env


load_backend_env()


class EmbeddingsClient:
    """Embeddings client for OpenAI-compatible APIs with a local fallback.

    Why fallback:
    - In some environments (e.g. dev laptops) the API key may be missing or have no quota.
    - Phase 2 retrieval still needs deterministic vectors to run embedding/retrieval flows.

    Local fallback is a lightweight hashing-vectorizer style embedding (no external deps)
    suitable for development and basic semantic-ish matching.
    """

    def __init__(self) -> None:
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small").strip()

        provider = os.getenv("EMBEDDINGS_PROVIDER", "openai").strip().lower() or "openai"
        allow_fallback = (os.getenv("EMBEDDINGS_ALLOW_FALLBACK", "1").strip() or "1") not in {"0", "false", "no"}
        local_dim = int(os.getenv("LOCAL_EMBEDDING_DIM", "384") or "384")

        self._provider = provider
        self._allow_fallback = allow_fallback
        self._local_dim = max(32, local_dim)

        self._client: OpenAI | None = None
        self._model = model

        if provider == "openai":
            if api_key:
                self._client = OpenAI(base_url=base_url, api_key=api_key)
            elif not allow_fallback:
                raise RuntimeError("OPENAI_API_KEY is not set in ai-retail-system/backend/.env")
        elif provider in {"local", "hash"}:
            # Local-only embeddings.
            self._client = None
        else:
            raise RuntimeError(f"Unknown EMBEDDINGS_PROVIDER='{provider}'. Use 'openai' or 'local'.")

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        return re.findall(r"[a-z0-9']+", (text or "").lower())

    def _embed_local_one(self, text: str) -> list[float]:
        # Hashing trick into a fixed-dimension dense vector.
        # Deterministic across runs; no training required.
        dim = self._local_dim
        vec = [0.0] * dim
        tokens = self._tokenize(text)
        if not tokens:
            return vec

        for tok in tokens:
            h = blake2b(tok.encode("utf-8"), digest_size=8).digest()
            value = int.from_bytes(h, byteorder="little", signed=False)
            idx = value % dim
            sign = -1.0 if (value >> 63) & 1 else 1.0
            vec[idx] += sign

        # L2 normalize
        norm = sum(v * v for v in vec) ** 0.5
        if norm > 0:
            inv = 1.0 / norm
            vec = [v * inv for v in vec]
        return vec

    def _embed_local(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_local_one(t) for t in texts]

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        if self._provider in {"local", "hash"}:
            return self._embed_local(texts)

        # Default: OpenAI-compatible embeddings.
        if self._client is None:
            if self._allow_fallback:
                return self._embed_local(texts)
            raise RuntimeError("OPENAI_API_KEY is not set in ai-retail-system/backend/.env")

        try:
            resp = self._client.embeddings.create(
                model=self._model,
                input=texts,
            )
            return [item.embedding for item in resp.data]
        except Exception:
            if self._allow_fallback:
                return self._embed_local(texts)
            raise
