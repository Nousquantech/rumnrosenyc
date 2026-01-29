from __future__ import annotations

import json
import os
from dataclasses import dataclass
from hashlib import blake2b
from pathlib import Path
from typing import Any

from app.ai.embeddings import EmbeddingsClient
from app.env import load_backend_env

load_backend_env()


@dataclass(frozen=True)
class VectorDoc:
    id: str
    text: str
    metadata: dict


@dataclass(frozen=True)
class SearchResult:
    id: str
    text: str
    metadata: dict
    distance: float


class VectorStore:
    """Minimal persistent vector store wrapper (FAISS).

    Why FAISS:
    - Windows wheels are available for Python 3.14.
    - Chroma currently depends on onnxruntime, which (as of now) does not ship
      wheels for Python 3.14, making installation fail in this environment.

    Provides:
    - add_documents(documents)
    - similarity_search(query, k)
    """

    def __init__(self, *, collection_name: str) -> None:
        # Prefer a generic env var, but allow older config names.
        persist_dir = (
            os.getenv("VECTOR_STORE_DIR")
            or os.getenv("FAISS_PERSIST_DIR")
            or os.getenv("CHROMA_PERSIST_DIR")
            or ".faiss"
        ).strip() or ".faiss"

        base_dir = Path(__file__).resolve().parents[2]  # ai-retail-system/backend
        persist_path = (base_dir / persist_dir).resolve()
        persist_path.mkdir(parents=True, exist_ok=True)

        try:
            import faiss  # type: ignore
        except Exception as exc:  # pragma: no cover
            raise RuntimeError(
                "faiss-cpu is not installed. Install it (pip install faiss-cpu) or update requirements.txt"
            ) from exc

        self._faiss = faiss
        self._embeddings = EmbeddingsClient()

        self._collection_name = collection_name
        self._persist_path = persist_path
        self._meta_path = persist_path / f"{collection_name}.json"
        self._index_path = persist_path / f"{collection_name}.faiss"

        self._id_map: dict[str, int] = {}
        self._docs: dict[str, dict[str, Any]] = {}
        self._dim: int | None = None

        # Placeholder until we know dimension.
        self._index = self._faiss.IndexIDMap2(self._faiss.IndexFlatIP(1))

        self._load()

    def _load(self) -> None:
        meta_exists = self._meta_path.exists()
        index_exists = self._index_path.exists()

        if meta_exists:
            data = json.loads(self._meta_path.read_text(encoding="utf-8"))
            self._id_map = {str(k): int(v) for k, v in (data.get("id_map") or {}).items()}
            self._docs = {str(k): dict(v) for k, v in (data.get("docs") or {}).items()}
            self._dim = int(data.get("dim")) if data.get("dim") is not None else None

        if index_exists:
            loaded = self._faiss.read_index(str(self._index_path))
            if not isinstance(loaded, self._faiss.IndexIDMap2):
                loaded = self._faiss.IndexIDMap2(loaded)
            self._index = loaded

        # Only infer dimension from an actually persisted index.
        if self._dim is None and index_exists and getattr(self._index, "d", None):
            self._dim = int(self._index.d)

        # Ensure index matches expected dimension (only when we know dim).
        if self._dim is not None and int(getattr(self._index, "d", 0) or 0) != int(self._dim):
            self._index = self._faiss.IndexIDMap2(self._faiss.IndexFlatIP(self._dim))

    def _save(self) -> None:
        payload = {"dim": self._dim, "id_map": self._id_map, "docs": self._docs}
        self._meta_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        self._faiss.write_index(self._index, str(self._index_path))

    @staticmethod
    def _stable_int_id(doc_id: str) -> int:
        digest = blake2b(doc_id.encode("utf-8"), digest_size=8).digest()
        value = int.from_bytes(digest, byteorder="little", signed=False)
        return int(value & ((1 << 63) - 1))

    def _ensure_dim(self, dim: int) -> None:
        if self._dim is None:
            self._dim = int(dim)
            self._index = self._faiss.IndexIDMap2(self._faiss.IndexFlatIP(self._dim))
            return

        if int(self._dim) != int(dim):
            raise RuntimeError(
                f"Embedding dimension changed for collection '{self._collection_name}': "
                f"existing={self._dim}, new={dim}. Delete persisted index under '{self._persist_path}'."
            )

    @staticmethod
    def _normalize(vectors):
        import numpy as np

        arr = np.asarray(vectors, dtype="float32")
        if arr.ndim == 1:
            arr = arr.reshape(1, -1)
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return arr / norms

    def add_documents(self, documents: list[VectorDoc]) -> int:
        if not documents:
            return 0

        ids = [d.id for d in documents]
        texts = [d.text for d in documents]
        metadatas = [d.metadata for d in documents]

        embeddings = self._embeddings.embed_texts(texts)
        if not embeddings:
            return 0

        self._ensure_dim(len(embeddings[0]))
        vecs = self._normalize(embeddings)

        import numpy as np

        int_ids: list[int] = []
        used = set(self._id_map.values())
        for doc_id, text, meta in zip(ids, texts, metadatas):
            int_id = self._id_map.get(doc_id)
            if int_id is None:
                attempt = 0
                int_id = self._stable_int_id(doc_id)
                while int_id in used:
                    attempt += 1
                    int_id = self._stable_int_id(f"{doc_id}#{attempt}")
                self._id_map[doc_id] = int_id
                used.add(int_id)

            self._docs[doc_id] = {"text": text, "metadata": dict(meta or {})}
            int_ids.append(int_id)

        ids_arr = np.asarray(int_ids, dtype="int64")
        selector = self._faiss.IDSelectorBatch(int(ids_arr.size), self._faiss.swig_ptr(ids_arr))
        self._index.remove_ids(selector)

        self._index.add_with_ids(vecs, ids_arr)

        self._save()
        return len(documents)

    def similarity_search(self, query: str, k: int) -> list[SearchResult]:
        query = (query or "").strip()
        if not query:
            return []

        if self._dim is None or self._index.ntotal == 0:
            return []

        k = max(1, int(k))
        query_embedding = self._embeddings.embed_texts([query])
        if not query_embedding:
            return []

        q = self._normalize(query_embedding)
        scores, found_ids = self._index.search(q, k)

        rev: dict[int, str] = {v: k for k, v in self._id_map.items()}
        out: list[SearchResult] = []

        for score, int_id in zip(scores[0].tolist(), found_ids[0].tolist()):
            if int_id == -1:
                continue
            doc_id = rev.get(int(int_id))
            if not doc_id:
                continue
            doc = self._docs.get(doc_id) or {}
            text = str(doc.get("text") or "")
            meta = dict(doc.get("metadata") or {})
            distance = float(1.0 - float(score))
            out.append(SearchResult(id=doc_id, text=text, metadata=meta, distance=distance))

        return out
