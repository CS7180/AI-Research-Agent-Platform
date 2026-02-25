"""Supabase JWT validation utilities.

All protected endpoints must pass through get_current_user().
"""

from __future__ import annotations

import logging

from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials,
    supabase: Client,
) -> dict:
    """Validate the Supabase JWT and return the authenticated user payload.

    Args:
        credentials: Bearer token from the Authorization header.
        supabase: Supabase client instance.

    Returns:
        The authenticated user dict from Supabase.

    Raises:
        HTTPException: 401 if the token is invalid or expired.
    """
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
            )
        return {"id": response.user.id, "email": response.user.email}
    except Exception as exc:
        logger.warning("JWT validation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        ) from exc
