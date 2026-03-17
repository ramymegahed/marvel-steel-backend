from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service
from app.utils.notifications import send_telegram_notification

router = APIRouter()

@router.post("/", response_model=OrderResponse)
def create_order(
    order_in: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    order = order_service.create_order(db, order_in=order_in)
    order_resp = OrderResponse.model_validate(order)
    background_tasks.add_task(send_telegram_notification, order_resp)
    return order

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    # Depending on requirements, maybe customers need a secret key or phone number to view their order to prevent enumeration.
    # For MVP, exposing direct ID view here as specified.
    return order_service.get_order(db, order_id=order_id)
