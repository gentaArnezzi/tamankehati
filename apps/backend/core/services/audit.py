from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.models.audit_logs import AuditLog
from fastapi import Request
import json

class AuditService:
    @staticmethod
    async def log_action(
        db: AsyncSession,
        actor_user_id: int,
        actor_role: str,
        actor_region_code: str,
        action: str,
        resource: str,
        resource_id: int,
        before: dict = None,
        after: dict = None,
        request: Request = None
    ):
        log_entry = AuditLog(
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            actor_region_code=actor_region_code,
            action=action,
            resource=resource,
            resource_id=resource_id,
            before=json.dumps(before) if before else None,
            after=json.dumps(after) if after else None,
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("User-Agent") if request else None
        )
        db.add(log_entry)
        await db.commit()

    @staticmethod
    async def log_create(db: AsyncSession, user, resource: str, resource_id: int, data: dict, request: Request = None):
        await AuditService.log_action(
            db, user.id, user.role.value, user.region_code,
            "create", resource, resource_id, after=data, request=request
        )

    @staticmethod
    async def log_update(db: AsyncSession, user, resource: str, resource_id: int, before: dict, after: dict, request: Request = None):
        await AuditService.log_action(
            db, user.id, user.role.value, user.region_code,
            "update", resource, resource_id, before=before, after=after, request=request
        )

    @staticmethod
    async def log_delete(db: AsyncSession, user, resource: str, resource_id: int, before: dict, request: Request = None):
        await AuditService.log_action(
            db, user.id, user.role.value, user.region_code,
            "delete", resource, resource_id, before=before, request=request
        )

    @staticmethod
    async def log_approve(db: AsyncSession, user, resource: str, resource_id: int, before: dict, after: dict, request: Request = None):
        await AuditService.log_action(
            db, user.id, user.role.value, user.region_code,
            "approve", resource, resource_id, before=before, after=after, request=request
        )

    @staticmethod
    async def log_reject(db: AsyncSession, user, resource: str, resource_id: int, before: dict, after: dict, request: Request = None):
        await AuditService.log_action(
            db, user.id, user.role.value, user.region_code,
            "reject", resource, resource_id, before=before, after=after, request=request
        )
