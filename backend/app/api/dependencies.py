"""Shared FastAPI dependencies (auth, Supabase client, etc.)."""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated

from fastapi import Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from app.core.config import settings
from app.core.security import get_current_user

bearer_scheme = HTTPBearer()


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Return a cached Supabase client using the service role key.

    The service role key bypasses RLS — only use on the backend.
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


async def get_authenticated_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Security(bearer_scheme)],
    supabase: Annotated[Client, Depends(get_supabase_client)],
) -> dict:
    """Dependency that validates the JWT and returns the current user."""
    return await get_current_user(credentials, supabase)


# Type aliases for route signatures
CurrentUser = Annotated[str, Depends(get_authenticated_user)]
SupabaseClient = Annotated[Client, Depends(get_supabase_client)]
