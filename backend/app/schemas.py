from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Ergonomic Office Chair",
                "sku": "CHAIR-001",
                "price": 199.99,
                "stock_quantity": 50
            }
        }
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "price": 179.99,
                "stock_quantity": 45
            }
        }

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Jane Doe",
                "email": "jane.doe@example.com",
                "phone": "+1234567890"
            }
        }

class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]

    class Config:
        json_schema_extra = {
            "example": {
                "customer_id": 1,
                "items": [
                    {
                        "product_id": 1,
                        "quantity": 2
                    }
                ]
            }
        }

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_time_of_order: float
    product: Product

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    customer: Customer
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

# --- Dashboard Schemas ---
class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[Product]
