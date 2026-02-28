"""Supabase JWT validation utilities.

All protected endpoints must pass through ``get_current_user()``.

Design
------
Validation is intentionally two-stage:

1. **Local structural check** – ``jwt.decode`` with
   ``options={"verify_signature": False}``  inspects the token's claims
   *without* a network call so that obviously malformed or expired tokens are
   rejected cheaply.  Note that disabling signature verification in PyJWT
   also disables its ``exp``/``nbf``/``aud`` checks, so expiry is validated
   manually.

2. **Authoritative server-side check** – ``supabase.auth.get_user(token)``
   calls the Supabase Auth API to confirm the token has not been revoked and
   retrieves the live user record.  This is the single source of trust.

Raises :class:`fastapi.HTTPException` ``401`` on any failure so callers never
have to worry about partial success.
"""

from __future__ import annotations

import logging
import time

import jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from supabase import Client

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

_JWT_OPTIONS_STRUCTURAL_ONLY: dict = {
    # NOTE: disabling signature verification also disables PyJWT's built-in
    # exp/nbf/aud checks, so we perform expiry validation manually below.
    "verify_signature": False,
    "verify_aud": False,
    "verify_exp": False,
}


def _decode_unverified(token: str) -> dict:
    """Decode a JWT without verifying the signature.

    Used only for a *structural pre-check* (malformed / obviously expired
    tokens) before making the authoritative Supabase network call.

    Args:
        token: Raw JWT string from the ``Authorization: Bearer …`` header.

    Returns:
        The decoded payload dict.

    Raises:
        HTTPException: 401 if the token is not a valid JWT structure, is
            missing required claims, or has a clearly expired ``exp``.
    """
    try:
        payload: dict = jwt.decode(
            token,
            key="",  # key is irrelevant when verify_signature=False
            algorithms=["HS256", "RS256"],
            options=_JWT_OPTIONS_STRUCTURAL_ONLY,
        )
    except jwt.DecodeError as exc:
        logger.debug("JWT pre-check: malformed token – %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not decode token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    # Manual expiry check — PyJWT skips this when verify_signature=False.
    exp = payload.get("exp")
    if exp is not None and int(time.time()) >= int(exp):
        logger.debug("JWT pre-check: token has expired (exp=%s)", exp)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ``sub`` is mandatory per the JWT spec; Supabase always populates it.
    if not payload.get("sub"):
        logger.debug("JWT pre-check: missing or empty 'sub' claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing required claims.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


# ---------------------------------------------------------------------------
# Public dependency
# ---------------------------------------------------------------------------


async def get_current_user(
    credentials: HTTPAuthorizationCredentials,
    supabase: Client,
) -> str:
    """Validate a Supabase JWT and return the authenticated user's ID.

    This is the single auth entry point for all protected endpoints.
    Callers receive the user's UUID string; row-level security in Supabase
    enforces per-user data isolation from there.

    Args:
        credentials: Bearer token extracted from the ``Authorization`` header
            by :class:`fastapi.security.HTTPBearer`.
        supabase: Supabase client instance (injected via
            :func:`app.api.dependencies.get_supabase_client`).

    Returns:
        The authenticated user's UUID string (``user.id``).

    Raises:
        HTTPException: ``401 Unauthorized`` if the token is malformed,
            expired, or rejected by the Supabase Auth API.

    Example::

        @router.get("/me")
        async def me(user_id: str = Depends(get_current_user)):
            return {"user_id": user_id}
    """
    token = credentials.credentials

    # Stage 1 – cheap local structural + expiry check.
    _decode_unverified(token)

    # Stage 2 – authoritative Supabase server-side validation.
    try:
        response = supabase.auth.get_user(token)
    except Exception as exc:
        logger.warning("Supabase auth.get_user raised an exception: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if response is None or response.user is None:
        logger.warning("Supabase returned no user for the provided token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = str(response.user.id)
    logger.debug("Authenticated user: %s", user_id)
    return user_id
