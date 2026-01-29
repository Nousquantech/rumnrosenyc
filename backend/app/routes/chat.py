from __future__ import annotations

from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.chat_service import ChatService


router = APIRouter(prefix="", tags=["chat"])

_service = ChatService()


class ChatRequest(BaseModel):
    query: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    session_id: str


class RecommendedProduct(BaseModel):
    id: str
    name: str
    price: float
    fit: str | None = None
    wash: str | None = None


class ChatResponseV2(BaseModel):
    answer: str
    session_id: str
    recommended_products: list[RecommendedProduct] | None = None
    follow_up_question: str | None = None


@router.post("/chat", response_model=ChatResponseV2)
def chat(payload: ChatRequest, db: Session = Depends(get_db)) -> Any:
    try:
        result = _service.handle(
            query=payload.query, session_id=payload.session_id, db=db)
        return ChatResponseV2(
            answer=result.answer,
            session_id=result.session_id,
            recommended_products=result.recommended_products,
            follow_up_question=result.follow_up_question,
        )
    except Exception as exc:
        _ = exc
        sid = str(uuid4())
        return ChatResponseV2(answer="I don't have enough information.", session_id=sid)
