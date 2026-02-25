"""Health check endpoint — no authentication required."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Health check")
async def health_check() -> dict[str, str]:
    """Return a simple liveness response."""
    return {"status": "ok"}
