"""Unit-test-specific conftest.

This conftest is scoped to tests/unit/ and does NOT import app.main
(which triggers full app initialization including Supabase/Redis
connections and the LangGraph agent build). Unit tests should only
test pure functions and mock all I/O boundaries.
"""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest


@pytest.fixture
def mock_user() -> dict:
    """A mock authenticated user payload."""
    return {"id": "test-user-uuid", "email": "test@example.com"}


@pytest.fixture
def mock_supabase() -> MagicMock:
    """A mock Supabase client."""
    return MagicMock()
