from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get(
    "/",
    response_model=schemas.DashboardResponse,
    summary="Get Dashboard Statistics",
    description="Retrieves aggregate metrics including total products, customers, and orders, along with an array of products currently below the low-stock threshold."
)
def get_dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)
