from __future__ import annotations

from sqlalchemy.orm import Session

from app.ai.vector_store import VectorDoc, VectorStore
from app.database import SessionLocal, init_db
from app.models import Product


def _product_embedding_text(p: Product) -> str:
    # Phase 2 requirement: must include name, category, price, fit, style, description.
    sizes_value = getattr(p, "sizes", "")
    if isinstance(sizes_value, (list, tuple, set)):
        sizes_str = ", ".join([str(s).strip() for s in sizes_value if str(s).strip()])
    else:
        sizes_str = ", ".join([s.strip() for s in str(sizes_value).split(",") if s.strip()])

    return (
        f"name: {p.name}\n"
        f"category: {p.category}\n"
        f"price: {p.price}\n"
        f"sizes: {sizes_str}\n"
        f"fit: {p.fit}\n"
        f"style: {p.style}\n"
        f"description: {p.description}"
    )


def main() -> None:
    init_db()
    store = VectorStore(collection_name="products")

    db: Session = SessionLocal()
    try:
        products = db.query(Product).order_by(Product.id.asc()).all()
        docs: list[VectorDoc] = []
        for p in products:
            docs.append(
                VectorDoc(
                    id=f"product:{p.id}",
                    text=_product_embedding_text(p),
                    metadata={"product_id": p.id},
                )
            )

        added = store.add_documents(docs)
    finally:
        db.close()

    print(f"Product embeddings upserted: {added}")


if __name__ == "__main__":
    main()
