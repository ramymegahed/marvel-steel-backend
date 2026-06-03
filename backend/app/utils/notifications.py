import httpx
import logging
from app.core.config import settings
from app.schemas.order import OrderResponse

logger = logging.getLogger(__name__)

async def send_telegram_notification(order: OrderResponse):
    bot_token = settings.TELEGRAM_BOT_TOKEN
    if not bot_token:
        logger.warning("Telegram Bot Token not configured — skipping notification")
        return

    if not settings.TELEGRAM_CHAT_IDS:
        logger.warning("TELEGRAM_CHAT_IDS not configured — skipping notification")
        return

    chat_ids = [cid.strip() for cid in settings.TELEGRAM_CHAT_IDS.split(",") if cid.strip()]

    message = (
        f"🚨 *New Order Received!* 🚨\n\n"
        f"📦 *Order ID:* `{order.id}`\n"
        f"👤 *Customer:* {order.customer_name}\n"
        f"📞 *Phone:* {order.phone}\n"
        f"💵 *Total Amount:* {order.total_price:.2f} EGP\n"
        f"🔢 *Items:* {len(order.items)}\n"
        f"📅 *Status:* {order.status.value}"
    )

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    try:
        async with httpx.AsyncClient() as client:
            for chat_id in chat_ids:
                try:
                    response = await client.post(url, json={
                        "chat_id": chat_id,
                        "text": message,
                        "parse_mode": "Markdown",
                    })
                    response.raise_for_status()
                except Exception as e:
                    logger.error(f"Failed to send Telegram notification to {chat_id}: {e}")
    except Exception as e:
        logger.error(f"Telegram notification error: {e}")
