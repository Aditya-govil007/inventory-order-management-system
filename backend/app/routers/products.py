from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.post(
    "/",
    response_model=schemas.Product,
    status_code=201,
    summary="Create a New Product",
    description="Creates a new product in the inventory. SKU must be unique. Price must be strictly greater than 0, and stock quantity cannot be negative."
)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@router.get(
    "/",
    response_model=List[schemas.Product],
    summary="List All Products",
    description="Returns a paginated list of all products in the inventory."
)
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@router.get(
    "/{product_id}",
    response_model=schemas.Product,
    summary="Get Product by ID",
    description="Retrieves the details of a specific product using its unique ID."
)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put(
    "/{product_id}",
    response_model=schemas.Product,
    summary="Update a Product",
    description="Updates specific fields of an existing product. Only provided fields will be modified."
)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = crud.update_product(db, product_id, product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete(
    "/{product_id}",
    response_model=schemas.Product,
    summary="Delete a Product",
    description="Permanently removes a product from the inventory."
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.delete_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product
