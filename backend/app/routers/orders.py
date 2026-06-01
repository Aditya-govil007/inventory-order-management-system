from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.post(
    "/",
    response_model=schemas.OrderResponse,
    status_code=201,
    summary="Create a New Order",
    description="Places a new order for a customer. This endpoint transactionally verifies that sufficient stock exists for all items, deducts the stock, and computes the total amount. Rolls back completely if any item is out of stock."
)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    return crud.create_order(db=db, order=order)

@router.get(
    "/",
    response_model=List[schemas.OrderResponse],
    summary="List All Orders",
    description="Returns a paginated list of all historical orders, including their associated items and customer details."
)
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_orders(db, skip=skip, limit=limit)

@router.get(
    "/{order_id}",
    response_model=schemas.OrderResponse,
    summary="Get Order by ID",
    description="Retrieves the full details of a specific order using its unique ID."
)
def read_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@router.delete(
    "/{order_id}",
    response_model=schemas.OrderResponse,
    summary="Delete an Order",
    description="Permanently deletes an order from the system."
)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.delete_order(db, order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order
