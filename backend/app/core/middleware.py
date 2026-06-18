from fastapi import Depends, HTTPException, status
from .security import get_current_user
from ..models.user import UserRole


def get_role_value(role):
    """
    Converts Enum role or string role into clean string value.
    Example:
    UserRole.ADMIN -> ADMIN
    "ADMIN"        -> ADMIN
    """
    if hasattr(role, "value"):
        return role.value

    return str(role)


def require_role(*allowed_roles: UserRole):
    """
    Role guard for protected routes.

    Usage:
    require_role(UserRole.ADMIN)
    require_role(UserRole.ADMIN, UserRole.RECRUITER)
    """

    if not allowed_roles:
      raise ValueError("At least one role is required")

    allowed_role_values = [get_role_value(role) for role in allowed_roles]

    def role_checker(user=Depends(get_current_user)):
        user_role_value = get_role_value(user.role)

        if user_role_value not in allowed_role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return user

    return role_checker