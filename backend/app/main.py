from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine, Base
from app.routers import products, customers, orders, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

tags_metadata = [
    {
        "name": "Dashboard",
        "description": "High-level metrics and low-stock alerts for the administrative dashboard.",
    },
    {
        "name": "Products",
        "description": "Manage the inventory catalog including SKUs, pricing, and stock levels.",
    },
    {
        "name": "Customers",
        "description": "Manage customer profiles and contact information.",
    },
    {
        "name": "Orders",
        "description": "Process transactional orders with automatic stock deduction and validation.",
    },
]

app = FastAPI(
    title="Inventory & Order Management System API",
    description="""
Production-ready inventory and order management backend built with FastAPI, PostgreSQL, and SQLAlchemy.

Features:
- Product Management
- Customer Management
- Order Processing
- Inventory Tracking
- Dashboard Analytics
""",
    version="1.0.0",
    openapi_tags=tags_metadata
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost", "http://localhost:80"], # Cannot use "*" with allow_credentials=True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)

@app.get(
    "/",
    tags=["Health & Info"],
    summary="Get API Information",
    description="Returns basic information and status about the API."
)
def root():
    return {
        "name": "Inventory & Order Management System API",
        "status": "online",
        "version": "1.0.0"
    }

@app.get(
    "/health",
    tags=["Health & Info"],
    summary="Health Check",
    description="Returns the health status of the API service."
)
def health_check():
    return {"status": "healthy"}
