# apps/backend/core/audit.py
import logging

logger = logging.getLogger("audit")

async def emit_audit(actor_id: int, action: str, entity: str, entity_id: int, meta: dict = None):
    """No-op audit logger for now. In production, this would write to audit tables or external systems."""
    logger.info(f"[AUDIT] actor_id={actor_id} action={action} entity={entity} entity_id={entity_id} meta={meta or {}}")
    # TODO: Implement actual audit logging to database or external service
