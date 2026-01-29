from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.env import load_backend_env


load_backend_env()


DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if not DATABASE_URL:
    # Keep the error explicit; Phase 1 requires a working Postgres connection.
    raise RuntimeError(
        "DATABASE_URL is not set. Create ai-retail-system/backend/.env from ai-retail-system/backend/.env.example"
    )


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models so SQLAlchemy registers them before create_all.
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
