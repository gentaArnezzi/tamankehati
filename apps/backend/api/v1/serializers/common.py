# apps/backend/api/v1/serializers/common.py
from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel
from enum import Enum

T = TypeVar('T')

class ErrorResponse(BaseModel):
    """Standard error response model"""
    code: str
    message: str
    details: Optional[dict] = None

class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated response model"""
    items: List[T]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool

# Workflow Status Enum for OpenAPI
class WorkflowStatus(str, Enum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"

# IUCN Status Enum for OpenAPI
class IUCNStatus(str, Enum):
    EX = "EX"  # Extinct
    EW = "EW"  # Extinct in the Wild
    CR = "CR"  # Critically Endangered
    EN = "EN"  # Endangered
    VU = "VU"  # Vulnerable
    NT = "NT"  # Near Threatened
    LC = "LC"  # Least Concern
    DD = "DD"  # Data Deficient
    NE = "NE"  # Not Evaluated

# User Role Enum for OpenAPI
class UserRole(str, Enum):
    super_admin = "super_admin"
    regional_admin = "regional_admin"
    ranger = "ranger"
    volunteer = "volunteer"
    public = "public"
