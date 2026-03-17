import httpx
import logging
from app.core.config import settings
from app.schemas.order import OrderResponse

logger = logging.getLogger(__name__)

async def send_telegram_notification(order: OrderResponse):
    """
    Asynchronously sends a Telegram message when a new order is placed.
    """
    bot_token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not bot_token or not chat_id:
        logger.warning("Telegram Bot Token or Chat ID not configured. Skipping notification.")
        return

    message = (
        f"🚨 *New Order Received!* 🚨\n\n"
        f"📦 *Order ID:* `{order.id}`\n"
        f"👤 *Customer:* {order.customer_name}\n"
        f"📞 *Phone:* {order.phone}\n"
        f"💵 *Total Amount:* ${order.total_price:.2f}\n"
        f"🔢 *Items:* {len(order.items)}\n"
        f"📅 *Status:* {order.status.value}"
    )

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=5.0)
            response.raise_for_status()
            logger.info(f"Telegram notification sent for Order {order.id}")
    except httpx.HTTPError as e:
        logger.error(f"Failed to send Telegram notification for Order {order.id}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending Telegram notification: {e}")
