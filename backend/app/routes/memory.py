from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.memory.store import MemoryStore


router = APIRouter(prefix="/memory", tags=["memory"])


class ResetMemoryRequest(BaseModel):
    session_id: str


class ResetMemoryResponse(BaseModel):
    ok: bool


@router.post("/reset", response_model=ResetMemoryResponse)
def reset_memory(payload: ResetMemoryRequest) -> Any:
    store = MemoryStore()
    store.clear(payload.session_id)
    return ResetMemoryResponse(ok=True)
