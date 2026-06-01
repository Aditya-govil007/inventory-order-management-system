from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

@router.post(
    "/",
    response_model=schemas.Customer,
    status_code=201,
    summary="Create a New Customer",
    description="Registers a new customer. The email address must be valid and unique across the system."
)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db=db, customer=customer)

@router.get(
    "/",
    response_model=List[schemas.Customer],
    summary="List All Customers",
    description="Returns a paginated list of all registered customers."
)
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_customers(db, skip=skip, limit=limit)

@router.get(
    "/{customer_id}",
    response_model=schemas.Customer,
    summary="Get Customer by ID",
    description="Retrieves a specific customer's details using their unique ID."
)
def read_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.delete(
    "/{customer_id}",
    response_model=schemas.Customer,
    summary="Delete a Customer",
    description="Permanently removes a customer. Note: This action may fail if the customer has existing orders depending on database constraints."
)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud.delete_customer(db, customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer
