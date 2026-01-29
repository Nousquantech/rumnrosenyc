from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.database import SessionLocal, init_db
from app.models import Policy


REQUIRED_COLUMNS = {"type", "content"}


def main() -> None:
    init_db()

    csv_path = Path(__file__).resolve().parents[1] / "data" / "policies.csv"
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
            policy_type = str(row["type"]).strip().lower()
            content = str(row["content"]).strip()
            if not policy_type or not content:
                continue

            existing = db.query(Policy).filter(Policy.type == policy_type).one_or_none()
            if existing is None:
                db.add(Policy(type=policy_type, content=content))
                inserted += 1
            else:
                existing.content = content
                updated += 1

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print(f"Policies load complete. Inserted={inserted}, Updated={updated}")


if __name__ == "__main__":
    main()
