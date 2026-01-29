from __future__ import annotations
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.database import get_db
from app.models import Product


router = APIRouter(prefix="/products", tags=["products"])


class ProductOut(BaseModel):
    id: str
    name: str
    category: str
    price: float
    sizes: str
    colors: str
    material: str
    fit: str
    style: str
    description: str

    model_config = {"from_attributes": True}

# ForNext.js pagination components


class ProductPagination(BaseModel):
    items: List[ProductOut]
    total: int
    limit: int
    offset: int


@router.get("/", response_model=ProductPagination)
def list_products(
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    stmt = select(Product).order_by(
        Product.name.asc()).offset(offset).limit(limit)
    products = db.execute(stmt).scalars().all()

    total_count = db.execute(select(func.count(Product.id))).scalar() or 0

    return {
        "items": products,
        "total": total_count,
        "limit": limit,
        "offset": offset,
    }


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    stmt = select(Product).where(Product.id == product_id)
    product = db.execute(stmt).scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Product with ID {product_id} not found")
    return product
