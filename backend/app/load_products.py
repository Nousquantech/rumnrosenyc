from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.database import SessionLocal, init_db
from app.models import Product


REQUIRED_COLUMNS = {
    "id",
    "name",
    "category",
    "price",
    "sizes",
    "colors",
    "material",
    "fit",
    "style",
    "description",
}


def main() -> None:
    init_db()

    csv_path = Path(__file__).resolve().parents[1] / "data" / "denim_products.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Missing CSV: {csv_path}")

    df = pd.read_csv(csv_path)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"CSV missing required columns: {sorted(missing)}")

    inserted = 0
    updated = 0

    db = SessionLocal()
    try:
        for _, row in df.iterrows():
            product_id = str(row["id"]).strip()
            if not product_id:
                continue

            existing = db.get(Product, product_id)

            payload = dict(
                id=product_id,
                name=str(row["name"]).strip(),
                category=str(row["category"]).strip(),
                price=float(row["price"]),
                sizes=str(row["sizes"]).strip(),
                colors=str(row["colors"]).strip(),
                material=str(row["material"]).strip(),
                fit=str(row["fit"]).strip(),
                style=str(row["style"]).strip(),
                description=str(row["description"]).strip(),
            )

            if existing is None:
                db.add(Product(**payload))
                inserted += 1
            else:
                for key, value in payload.items():
                    setattr(existing, key, value)
                updated += 1

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print(f"Products load complete. Inserted={inserted}, Updated={updated}")


if __name__ == "__main__":
    main()
