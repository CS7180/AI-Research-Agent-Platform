"""Pytest configuration and shared fixtures."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_authenticated_user, get_supabase_client
from app.main import app


@pytest.fixture
def mock_user() -> dict:
    """A mock authenticated user payload."""
    return {"id": "test-user-uuid", "email": "test@example.com"}


@pytest.fixture
def mock_supabase() -> MagicMock:
    """A mock Supabase client."""
    return MagicMock()


@pytest.fixture
def client(mock_user: dict, mock_supabase: MagicMock) -> TestClient:
    """Test client with auth and Supabase dependencies overridden."""
    app.dependency_overrides[get_authenticated_user] = lambda: mock_user
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
