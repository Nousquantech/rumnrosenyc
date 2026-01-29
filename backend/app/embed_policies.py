from __future__ import annotations

from sqlalchemy.orm import Session

from app.ai.vector_store import VectorDoc, VectorStore
from app.database import SessionLocal, init_db
from app.models import Policy


def _policy_embedding_text(p: Policy) -> str:
    # Phase 2 requirement: must include policy type + policy content.
    return f"policy type: {p.type}\npolicy content: {p.content}"


def main() -> None:
    init_db()
    store = VectorStore(collection_name="policies")

    db: Session = SessionLocal()
    try:
        policies = db.query(Policy).order_by(Policy.type.asc()).all()
        docs: list[VectorDoc] = []
        for pol in policies:
            docs.append(
                VectorDoc(
                    id=f"policy:{pol.type}",
                    text=_policy_embedding_text(pol),
                    metadata={"policy_type": pol.type},
                )
            )

        added = store.add_documents(docs)
    finally:
        db.close()

    print(f"Policy embeddings upserted: {added}")


if __name__ == "__main__":
    main()
