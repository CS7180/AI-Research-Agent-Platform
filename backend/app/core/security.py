"""Supabase JWT validation utilities.

All protected endpoints must pass through ``get_current_user()``.

Token flow
----------
1. Extract the raw JWT from the ``Authorization: Bearer <token>`` header.
2. Decode *without* verification to read the ``sub`` (user ID) claim.  We do
   this first so we can return a fast 401 before making a network call.
3. Call ``supabase.auth.get_user(token)`` which validates the JWT signature
   against the Supabase JWKS endpoint and returns the user record.
4. Return a normalised ``AuthenticatedUser`` dict with ``id`` and ``email``.
"""

from __future__ import annotations

import logging
from typing import Any

import jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from supabase import Client

logger = logging.getLogger(__name__)

# ── Custom exception ────────────────────────────────────────────────────────


class AuthenticationError(Exception):
    """Raised when JWT validation fails before the HTTP layer."""


# ── Helpers ─────────────────────────────────────────────────────────────────


def _decode_token_claims(token: str) -> dict[str, Any]:
    """Decode a JWT without signature verification to read its claims.

    This is a *read-only* peek at the payload.  Signature verification is
    delegated to the Supabase auth server in the next step.

    Args:
        token: Raw JWT string from the Authorization header.

    Returns:
        The decoded JWT payload as a plain dict.

    Raises:
        AuthenticationError: If the token is malformed and cannot be decoded.
    """
    try:
        return jwt.decode(
            token,
            options={"verify_signature": False},
            algorithms=["HS256", "RS256"],
        )
    except jwt.DecodeError as exc:
        raise AuthenticationError("Malformed JWT: cannot decode token.") from exc


def _extract_user_id(claims: dict[str, Any]) -> str:
    """Extract the ``sub`` claim (user UUID) from the decoded JWT payload.

    Args:
        claims: Decoded JWT payload dict.

    Returns:
        The user UUID string from the ``sub`` claim.

    Raises:
        AuthenticationError: If the ``sub`` claim is missing or empty.
    """
    user_id: str = claims.get("sub", "")
    if not user_id:
        raise AuthenticationError("JWT is missing required 'sub' claim.")
    return user_id


# ── Public API ───────────────────────────────────────────────────────────────


async def get_current_user(
    credentials: HTTPAuthorizationCredentials,
    supabase: Client,
) -> dict[str, str]:
    """Validate the Supabase JWT and return the authenticated user payload.

    Args:
        credentials: Bearer token extracted from the ``Authorization`` header
            by FastAPI's ``HTTPBearer`` security scheme.
        supabase: Supabase client instance (service role).

    Returns:
        A dict with keys ``id`` (user UUID) and ``email`` (user e-mail).

    Raises:
        HTTPException: HTTP 401 if the token is missing, malformed, expired,
            or does not correspond to a known Supabase user.
    """
    token = credentials.credentials

    # Fast local check — catch obviously bad tokens before hitting the network.
    try:
        claims = _decode_token_claims(token)
        _extract_user_id(claims)
    except AuthenticationError as exc:
        logger.warning("JWT pre-validation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    # Network call — Supabase verifies the signature and checks token expiry.
    try:
        response = supabase.auth.get_user(token)
    except Exception as exc:
        logger.warning("Supabase get_user raised an exception: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if response is None or response.user is None:
        logger.warning("Supabase returned no user for the provided token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"id": str(response.user.id), "email": str(response.user.email)}
