from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import models, schemas
from fastapi import HTTPException
from app.core.config import settings

# --- Product CRUD ---
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="SKU already exists")

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    try:
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="SKU already exists")

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def get_low_stock_products(db: Session):
    return db.query(models.Product).filter(models.Product.stock_quantity <= settings.LOW_STOCK_THRESHOLD).all()


# --- Customer CRUD ---
def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.model_dump())
    try:
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer


# --- Order CRUD ---
def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas.OrderCreate):
    # Check if customer exists
    customer = get_customer(db, order.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = 0.0
    order_items_to_create = []

    try:
        # We start a logical transaction here.
        # SQLAlchemy Session acts as a transaction until commit or rollback.

        # 1. Verify stock and calculate total amount
        for item in order.items:
            product = get_product(db, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
            
            if product.stock_quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name} (SKU: {product.sku})")
            
            # Deduct stock
            product.stock_quantity -= item.quantity
            
            # Calculate item cost
            item_cost = product.price * item.quantity
            total_amount += item_cost
            
            # Prepare OrderItem
            order_items_to_create.append(
                models.OrderItem(
                    product_id=product.id,
                    quantity=item.quantity,
                    price_at_time_of_order=product.price
                )
            )

        # 2. Create Order
        db_order = models.Order(customer_id=order.customer_id, total_amount=total_amount)
        db.add(db_order)
        db.flush() # Get order ID without committing

        # 3. Attach OrderItems to Order
        for order_item in order_items_to_create:
            order_item.order_id = db_order.id
            db.add(order_item)
        
        # 4. Commit transaction
        db.commit()
        db.refresh(db_order)
        return db_order

    except HTTPException:
        # Re-raise HTTPExceptions (like insufficient stock) after rolling back
        db.rollback()
        raise
    except Exception as e:
        # Catch any other database errors
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        db.delete(db_order)
        db.commit()
    return db_order

# --- Dashboard CRUD ---
def get_dashboard_stats(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock_products = get_low_stock_products(db)

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products
    }
