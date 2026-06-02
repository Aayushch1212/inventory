from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.models import Product, Customer, Order, OrderItem, OrderStatus
from app.schemas.schemas import (
    ProductCreate, ProductUpdate,
    CustomerCreate, CustomerUpdate,
    OrderCreate, OrderUpdate,
)


# ── Products ──────────────────────────────────────────────────────────────────
def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def create_product(db: Session, product: ProductCreate):
    if db.query(Product).filter(Product.sku == product.sku).first():
        raise HTTPException(status_code=400, detail=f"SKU '{product.sku}' already exists")
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(db: Session, product_id: int, product: ProductUpdate):
    db_product = get_product(db, product_id)
    for field, value in product.model_dump(exclude_unset=True).items():
        setattr(db_product, field, value)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}


# ── Customers ─────────────────────────────────────────────────────────────────
def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Customer).offset(skip).limit(limit).all()


def get_customer(db: Session, customer_id: int):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


def create_customer(db: Session, customer: CustomerCreate):
    if db.query(Customer).filter(Customer.email == customer.email).first():
        raise HTTPException(status_code=400, detail=f"Email '{customer.email}' already registered")
    db_customer = Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def update_customer(db: Session, customer_id: int, customer: CustomerUpdate):
    db_customer = get_customer(db, customer_id)
    data = customer.model_dump(exclude_unset=True)
    if "email" in data:
        existing = db.query(Customer).filter(Customer.email == data["email"], Customer.id != customer_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Email '{data['email']}' already registered")
    for field, value in data.items():
        setattr(db_customer, field, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted"}


# ── Orders ────────────────────────────────────────────────────────────────────
def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Order).offset(skip).limit(limit).all()


def get_order(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def create_order(db: Session, order: OrderCreate):
    # Validate customer
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Validate stock for all items first
    total = 0.0
    items_data = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}, Requested: {item.quantity}"
            )
        items_data.append((product, item.quantity, product.price))
        total += product.price * item.quantity

    # Create order
    db_order = Order(customer_id=order.customer_id, notes=order.notes, total_amount=total)
    db.add(db_order)
    db.flush()

    # Create items and reduce stock
    for product, qty, price in items_data:
        db_item = OrderItem(order_id=db_order.id, product_id=product.id, quantity=qty, unit_price=price)
        db.add(db_item)
        product.stock_quantity -= qty

    db.commit()
    db.refresh(db_order)
    return db_order


def update_order(db: Session, order_id: int, order: OrderUpdate):
    db_order = get_order(db, order_id)
    for field, value in order.model_dump(exclude_unset=True).items():
        setattr(db_order, field, value)
    db.commit()
    db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    # Restore stock
    for item in db_order.items:
        item.product.stock_quantity += item.quantity
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted"}


# ── Dashboard ─────────────────────────────────────────────────────────────────
def get_dashboard_stats(db: Session):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    low_stock = db.query(Product).filter(Product.stock_quantity <= 5).count()
    pending = db.query(Order).filter(Order.status == OrderStatus.pending).count()
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "low_stock_products": low_stock,
        "pending_orders": pending,
    }
