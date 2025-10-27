# apps/backend/core/notify.py
import logging

logger = logging.getLogger("notifications")

async def emit_notification(recipient: str, subject: str, message: str, notification_type: str = "info", **kwargs):
    """No-op notification sender for now. In production, this would send emails, Slack messages, etc."""
    logger.info(f"[NOTIF] To: {recipient} | Type: {notification_type} | Subject: {subject} | Message: {message}")
    # TODO: Implement actual notification sending (email, Slack, webhook, etc.)
