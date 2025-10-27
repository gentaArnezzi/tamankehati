# apps/backend/core/notifications/handlers.py
import logging
logger = logging.getLogger("notifications")

def notify_review_submitted(entity: str, entity_id: int, region_code: str):
    # ganti dengan kirim email/Slack/webhook
    logger.info(f"[NOTIF] {entity}#{entity_id} submitted for review @ {region_code}")

def notify_approved(entity: str, entity_id: int, region_code: str):
    logger.info(f"[NOTIF] {entity}#{entity_id} APPROVED @ {region_code}")

def notify_rejected(entity: str, entity_id: int, region_code: str, reason: str):
    logger.info(f"[NOTIF] {entity}#{entity_id} REJECTED @ {region_code} reason={reason}")
