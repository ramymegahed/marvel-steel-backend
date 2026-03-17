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
        logger.info(f"Preparing to send Telegram notification to chat_id: {chat_id}")
        logger.info(f"Using Bot Token: {bot_token[:10]}... (truncated)")
        logger.debug(f"Payload: {payload}")
        print(f"TELEGRAM DEBUG: Triggering send for Order {order.id}") # Render logs stdout 
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=5.0)
            
            logger.info(f"Telegram API Response Status: {response.status_code}")
            logger.info(f"Telegram API Response Body: {response.text}")
            print(f"TELEGRAM DEBUG: Response Status = {response.status_code}")
            print(f"TELEGRAM DEBUG: Response Body = {response.text}")

            response.raise_for_status()
            logger.info(f"Telegram notification sent successfully for Order {order.id}")
            
    except httpx.HTTPStatusError as e:
        logger.error(f"Telegram API returned an error status for Order {order.id}: {e.response.status_code} - {e.response.text}")
        print(f"TELEGRAM ERROR: HTTPStatusError - {e.response.text}")
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to Telegram API for Order {order.id}. Error: {e}")
        print(f"TELEGRAM ERROR: RequestError - {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending Telegram notification: {e}")
        print(f"TELEGRAM ERROR: Unexpected Exception - {e}")
