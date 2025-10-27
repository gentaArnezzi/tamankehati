"""
Access Control Logic for Enhanced Announcement System
Defines permissions and authorization rules for Super Admin and Regional Admin
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from users.models import User, UserRole
from .enhanced_models import Announcement, AnnouncementRead, AnnouncementComment, AnnouncementReaction


class AnnouncementPermission(str, Enum):
    """Permission levels for announcement operations"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    PUBLISH = "publish"
    ARCHIVE = "archive"
    VIEW_ANALYTICS = "view_analytics"
    MODERATE_COMMENTS = "moderate_comments"


class AccessControlService:
    """Service for managing announcement access control"""
    
    @staticmethod
    def get_user_permissions(user: User) -> List[AnnouncementPermission]:
        """Get list of permissions for a user based on their role"""
        if user.role == UserRole.super_admin:
            return [
                AnnouncementPermission.CREATE,
                AnnouncementPermission.READ,
                AnnouncementPermission.UPDATE,
                AnnouncementPermission.DELETE,
                AnnouncementPermission.PUBLISH,
                AnnouncementPermission.ARCHIVE,
                AnnouncementPermission.VIEW_ANALYTICS,
                AnnouncementPermission.MODERATE_COMMENTS,
            ]
        elif user.role == UserRole.regional_admin:
            return [
                AnnouncementPermission.READ,
            ]
        else:
            return []  # No permissions for other roles
    
    @staticmethod
    def can_user_access_announcement(user: User, announcement: Announcement) -> bool:
        """Check if user can access a specific announcement"""
        if user.role == UserRole.super_admin:
            return True  # Super Admin can access all announcements
        
        if user.role != UserRole.regional_admin:
            return False  # Only Regional Admins can access announcements
        
        # Check if announcement is published
        if announcement.status != "published":
            return False
        
        # Check targeting rules
        return AccessControlService._check_targeting(user, announcement)
    
    @staticmethod
    def _check_targeting(user: User, announcement: Announcement) -> bool:
        """Check if announcement is targeted to the user"""
        target_audience = announcement.target_audience
        
        if target_audience == "all_park_admins":
            return True
        
        elif target_audience == "specific_parks":
            if not announcement.target_parks:
                return False
            return user.park_id in announcement.target_parks
        
        elif target_audience == "specific_users":
            if not announcement.target_user_ids:
                return False
            return user.id in announcement.target_user_ids
        
        return False
    
    @staticmethod
    def get_visible_announcements_for_user(db: Session, user: User, 
                                         status: Optional[str] = None,
                                         limit: int = 50, 
                                         offset: int = 0) -> List[Announcement]:
        """Get announcements visible to a specific user"""
        if user.role == UserRole.super_admin:
            # Super Admin can see all announcements
            query = db.query(Announcement).filter(Announcement.deleted_at.is_(None))
            if status:
                query = query.filter(Announcement.status == status)
            return query.order_by(Announcement.created_at.desc()).offset(offset).limit(limit).all()
        
        elif user.role == UserRole.regional_admin:
            # Regional Admin can only see published announcements targeted to them
            query = db.query(Announcement).filter(
                and_(
                    Announcement.deleted_at.is_(None),
                    Announcement.status == "published",
                    or_(
                        Announcement.target_audience == "all_park_admins",
                        and_(
                            Announcement.target_audience == "specific_users",
                            Announcement.target_user_ids.contains([user.id])
                        )
                    )
                )
            )
            return query.order_by(
                Announcement.priority.desc(),
                Announcement.created_at.desc()
            ).offset(offset).limit(limit).all()
        
        return []  # No announcements for other roles
    
    @staticmethod
    def can_user_comment(user: User, announcement: Announcement) -> bool:
        """Check if user can comment on an announcement"""
        if user.role != UserRole.regional_admin:
            return False
        
        # Must be able to read the announcement first
        if not AccessControlService.can_user_access_announcement(user, announcement):
            return False
        
        # Check if comments are enabled (could be a field in announcement)
        # For now, assume all announcements allow comments
        return True
    
    @staticmethod
    def can_user_react(user: User, announcement: Announcement) -> bool:
        """Check if user can react to an announcement"""
        if user.role != UserRole.regional_admin:
            return False
        
        # Must be able to read the announcement first
        if not AccessControlService.can_user_access_announcement(user, announcement):
            return False
        
        return True
    
    @staticmethod
    def track_announcement_read(db: Session, user: User, announcement: Announcement,
                              ip_address: Optional[str] = None,
                              user_agent: Optional[str] = None) -> AnnouncementRead:
        """Track when a user reads an announcement"""
        # Check if read already exists
        existing_read = db.query(AnnouncementRead).filter(
            and_(
                AnnouncementRead.announcement_id == announcement.id,
                AnnouncementRead.user_id == user.id
            )
        ).first()
        
        if existing_read:
            return existing_read
        
        # Create new read record
        read_record = AnnouncementRead(
            announcement_id=announcement.id,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        db.add(read_record)
        db.commit()
        db.refresh(read_record)
        
        # Update announcement view count
        announcement.view_count += 1
        db.commit()
        
        return read_record
    
    @staticmethod
    def acknowledge_announcement(db: Session, user: User, announcement: Announcement) -> bool:
        """Mark announcement as acknowledged by user"""
        if not announcement.requires_acknowledgment:
            return False
        
        # Find existing read record
        read_record = db.query(AnnouncementRead).filter(
            and_(
                AnnouncementRead.announcement_id == announcement.id,
                AnnouncementRead.user_id == user.id
            )
        ).first()
        
        if not read_record:
            return False
        
        # Update acknowledgment
        read_record.acknowledged = True
        read_record.acknowledged_at = db.execute("SELECT NOW()").scalar()
        db.commit()
        
        return True
    
    @staticmethod
    def get_announcement_analytics(db: Session, announcement: Announcement) -> Dict[str, Any]:
        """Get analytics data for an announcement (Super Admin only)"""
        # Get read statistics
        read_count = db.query(AnnouncementRead).filter(
            AnnouncementRead.announcement_id == announcement.id
        ).count()
        
        acknowledged_count = db.query(AnnouncementRead).filter(
            and_(
                AnnouncementRead.announcement_id == announcement.id,
                AnnouncementRead.acknowledged == True
            )
        ).count()
        
        # Get comment statistics
        comment_count = db.query(AnnouncementComment).filter(
            and_(
                AnnouncementComment.announcement_id == announcement.id,
                AnnouncementComment.deleted_at.is_(None)
            )
        ).count()
        
        # Get reaction statistics
        reaction_count = db.query(AnnouncementReaction).filter(
            AnnouncementReaction.announcement_id == announcement.id
        ).count()
        
        return {
            "announcement_id": announcement.id,
            "title": announcement.title,
            "view_count": announcement.view_count,
            "read_count": read_count,
            "acknowledged_count": acknowledged_count,
            "comment_count": comment_count,
            "reaction_count": reaction_count,
            "acknowledgment_rate": acknowledged_count / read_count if read_count > 0 else 0,
            "engagement_rate": (comment_count + reaction_count) / read_count if read_count > 0 else 0
        }
    
    @staticmethod
    def get_user_announcement_activity(db: Session, user: User) -> Dict[str, Any]:
        """Get announcement activity for a user"""
        if user.role != UserRole.regional_admin:
            return {}
        
        # Get read announcements
        read_announcements = db.query(AnnouncementRead).filter(
            AnnouncementRead.user_id == user.id
        ).count()
        
        # Get acknowledged announcements
        acknowledged_announcements = db.query(AnnouncementRead).filter(
            and_(
                AnnouncementRead.user_id == user.id,
                AnnouncementRead.acknowledged == True
            )
        ).count()
        
        # Get comments made
        comments_made = db.query(AnnouncementComment).filter(
            and_(
                AnnouncementComment.user_id == user.id,
                AnnouncementComment.deleted_at.is_(None)
            )
        ).count()
        
        # Get reactions given
        reactions_given = db.query(AnnouncementReaction).filter(
            AnnouncementReaction.user_id == user.id
        ).count()
        
        return {
            "user_id": user.id,
            "read_announcements": read_announcements,
            "acknowledged_announcements": acknowledged_announcements,
            "comments_made": comments_made,
            "reactions_given": reactions_given,
            "acknowledgment_rate": acknowledged_announcements / read_announcements if read_announcements > 0 else 0
        }


class AnnouncementAuthorization:
    """Authorization decorator and middleware for announcement operations"""
    
    @staticmethod
    def require_permission(permission: AnnouncementPermission):
        """Decorator to require specific permission for announcement operations"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                # Extract user from arguments (implementation depends on your framework)
                user = kwargs.get('user') or args[0] if args else None
                if not user:
                    raise PermissionError("User not found in request")
                
                user_permissions = AccessControlService.get_user_permissions(user)
                if permission not in user_permissions:
                    raise PermissionError(f"User lacks permission: {permission}")
                
                return func(*args, **kwargs)
            return wrapper
        return decorator
    
    @staticmethod
    def require_super_admin():
        """Decorator to require super admin role"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                user = kwargs.get('user') or args[0] if args else None
                if not user or user.role != UserRole.super_admin:
                    raise PermissionError("Super admin role required")
                return func(*args, **kwargs)
            return wrapper
        return decorator
    
    @staticmethod
    def require_regional_admin():
        """Decorator to require regional admin role"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                user = kwargs.get('user') or args[0] if args else None
                if not user or user.role != UserRole.regional_admin:
                    raise PermissionError("Regional admin role required")
                return func(*args, **kwargs)
            return wrapper
        return decorator
