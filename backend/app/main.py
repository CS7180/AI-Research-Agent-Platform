"""FastAPI application entry point."""

from __future__ import annotations

import logging
import logging.config

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, documents, health
from app.core.config import settings

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered research agent platform for CS students.",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(settings.FRONTEND_ORIGIN)],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("DocMind API starting up — version %s", settings.APP_VERSION)


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("DocMind API shutting down.")
