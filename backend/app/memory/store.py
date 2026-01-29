from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from typing import Any
from uuid import UUID, uuid4

from app.env import load_backend_env


load_backend_env()


@dataclass(frozen=True)
class SessionMemory:
    session_id: str
    preferences: dict[str, Any]
    history: list[dict[str, str]]


class MemoryStore:
    """Session-scoped memory store.

    Primary backing store is Redis (required for production). For local dev,
    if Redis is not configured/reachable, it falls back to an in-process store.

    Keys:
      memory:{session_id}

    Value:
      {"prefs": {...}, "history": [{"role": "user|assistant", "content": "..."}, ...]}
    """

    # Shared in-process fallback (key -> (expires_at, payload)).
    # This must be class-level so new MemoryStore() instances (created per request)
    # can still access prior turns when Redis isn't configured.
    _LOCAL: dict[str, tuple[float, dict[str, Any]]] = {}

    def __init__(self) -> None:
        self._ttl_seconds = int(os.getenv("SESSION_TTL_SECONDS", "1800") or "1800")
        self._max_turns = int(os.getenv("MEMORY_MAX_TURNS", "5") or "5")
        self._redis_url = (os.getenv("REDIS_URL") or "").strip()

        self._redis = None
        if self._redis_url:
            try:
                import redis  # type: ignore

                self._redis = redis.Redis.from_url(self._redis_url, decode_responses=True)
                # Force a ping early so we know if it's usable.
                self._redis.ping()
            except Exception:
                self._redis = None

    @staticmethod
    def ensure_session_id(session_id: str | None) -> str:
        if session_id:
            try:
                UUID(session_id)
                return session_id
            except Exception:
                pass
        return str(uuid4())

    def _key(self, session_id: str) -> str:
        return f"memory:{session_id}"

    def load(self, session_id: str) -> SessionMemory:
        key = self._key(session_id)
        payload: dict[str, Any] | None = None

        if self._redis is not None:
            raw = self._redis.get(key)
            if raw:
                try:
                    payload = json.loads(raw)
                except Exception:
                    payload = None
        else:
            item = self._LOCAL.get(key)
            if item:
                expires_at, stored = item
                if expires_at <= time.time():
                    self._LOCAL.pop(key, None)
                else:
                    payload = stored

        prefs = dict((payload or {}).get("prefs") or {})
        history = list((payload or {}).get("history") or [])
        history = [
            {"role": str(m.get("role")), "content": str(m.get("content"))}
            for m in history
            if isinstance(m, dict) and m.get("role") and m.get("content")
        ]

        return SessionMemory(session_id=session_id, preferences=prefs, history=history)

    def save(self, session_id: str, *, preferences: dict[str, Any], history: list[dict[str, str]]) -> None:
        key = self._key(session_id)
        payload = {"prefs": dict(preferences or {}), "history": list(history or [])}

        if self._redis is not None:
            self._redis.setex(key, self._ttl_seconds, json.dumps(payload, ensure_ascii=False))
            return

        self._LOCAL[key] = (time.time() + float(self._ttl_seconds), payload)

    def clear(self, session_id: str) -> None:
        key = self._key(session_id)
        if self._redis is not None:
            try:
                self._redis.delete(key)
            except Exception:
                pass
        self._LOCAL.pop(key, None)

    def append_turn(self, session_id: str, *, role: str, content: str) -> SessionMemory:
        mem = self.load(session_id)

        safe_role = "user" if role == "user" else "assistant"
        safe_content = (content or "").strip()
        if len(safe_content) > 1500:
            safe_content = safe_content[:1500]

        history = list(mem.history)
        history.append({"role": safe_role, "content": safe_content})

        # Keep last N turns (user+assistant) => 2N messages.
        max_messages = max(2, self._max_turns * 2)
        if len(history) > max_messages:
            history = history[-max_messages:]

        self.save(session_id, preferences=mem.preferences, history=history)
        return SessionMemory(session_id=session_id, preferences=mem.preferences, history=history)
