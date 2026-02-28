"""Unit tests for app.core.security – Supabase JWT validation.

Test matrix
-----------
Each scenario is documented with the stage it exercises (Stage 1 = local
PyJWT structural check; Stage 2 = Supabase server-side call).

Happy path
~~~~~~~~~~
- Valid token → returns user ID string

Stage-1 failures (no Supabase call expected)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- Malformed / non-JWT string → 401
- Structurally valid but no ``exp`` and ``sub`` present (minimal claims)
- Missing ``sub`` claim → 401
- Expired token → 401

Stage-2 failures (Supabase call expected)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- Supabase returns user=None → 401
- Supabase raises an arbitrary exception → 401
- Supabase returns a None response object → 401

Return value contract
~~~~~~~~~~~~~~~~~~~~~
- Returns a plain ``str`` (UUID), not a ``dict``
"""

from __future__ import annotations

import time
from unittest.mock import AsyncMock, MagicMock, patch

import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.core.security import _decode_unverified, get_current_user

# ── Helpers ────────────────────────────────────────────────────────────────

_FAKE_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
_FAKE_EMAIL = "user@example.com"
_FAKE_SECRET = "test-secret-not-used-for-verification"


def _make_token(payload: dict) -> str:
    """Encode *payload* as a signed HS256 JWT (signature not verified by app)."""
    return jwt.encode(payload, _FAKE_SECRET, algorithm="HS256")


def _make_valid_payload(sub: str = _FAKE_USER_ID, offset: int = 3600) -> dict:
    """Return a minimal Supabase-like JWT payload with ``exp`` in the future."""
    now = int(time.time())
    return {
        "sub": sub,
        "aud": "authenticated",
        "role": "authenticated",
        "iat": now,
        "exp": now + offset,
        "email": _FAKE_EMAIL,
    }


def _make_credentials(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _make_supabase_mock(user_id: str = _FAKE_USER_ID) -> MagicMock:
    """Mock Supabase client whose ``auth.get_user`` returns a valid user."""
    mock_user = MagicMock()
    mock_user.id = user_id

    mock_response = MagicMock()
    mock_response.user = mock_user

    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value = mock_response
    return mock_supabase


# ── _decode_unverified unit tests ──────────────────────────────────────────


class TestDecodeUnverified:
    """Tests for the internal structural pre-check helper."""

    def test_valid_token_returns_payload(self) -> None:
        payload = _make_valid_payload()
        token = _make_token(payload)
        result = _decode_unverified(token)
        assert result["sub"] == _FAKE_USER_ID

    def test_malformed_string_raises_401(self) -> None:
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified("not.a.jwt.at.all.extra")
        assert exc_info.value.status_code == 401

    def test_completely_invalid_string_raises_401(self) -> None:
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified("garbage")
        assert exc_info.value.status_code == 401

    def test_empty_string_raises_401(self) -> None:
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified("")
        assert exc_info.value.status_code == 401

    def test_expired_token_raises_401(self) -> None:
        payload = _make_valid_payload(offset=-1)  # exp already in the past
        token = _make_token(payload)
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified(token)
        assert exc_info.value.status_code == 401
        assert "expired" in exc_info.value.detail.lower()

    def test_missing_sub_claim_raises_401(self) -> None:
        payload = _make_valid_payload()
        del payload["sub"]
        token = _make_token(payload)
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified(token)
        assert exc_info.value.status_code == 401
        assert "claims" in exc_info.value.detail.lower()

    def test_empty_sub_claim_raises_401(self) -> None:
        payload = _make_valid_payload()
        payload["sub"] = ""
        token = _make_token(payload)
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified(token)
        assert exc_info.value.status_code == 401

    def test_www_authenticate_header_present_on_malformed(self) -> None:
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified("bad-token")
        assert exc_info.value.headers is not None
        assert "WWW-Authenticate" in exc_info.value.headers

    def test_www_authenticate_header_present_on_expired(self) -> None:
        payload = _make_valid_payload(offset=-1)
        token = _make_token(payload)
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified(token)
        assert exc_info.value.headers is not None
        assert "WWW-Authenticate" in exc_info.value.headers

    def test_token_with_null_sub_raises_401(self) -> None:
        payload = _make_valid_payload()
        payload["sub"] = None
        token = _make_token(payload)
        with pytest.raises(HTTPException) as exc_info:
            _decode_unverified(token)
        assert exc_info.value.status_code == 401


# ── get_current_user integration-style unit tests ─────────────────────────


class TestGetCurrentUser:
    """Tests for the public FastAPI dependency ``get_current_user``."""

    # ── happy path ────────────────────────────────────────────────────────

    @pytest.mark.asyncio
    async def test_valid_token_returns_user_id(self) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)
        supabase = _make_supabase_mock()

        result = await get_current_user(credentials, supabase)

        assert result == _FAKE_USER_ID

    @pytest.mark.asyncio
    async def test_return_type_is_str(self) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)
        supabase = _make_supabase_mock()

        result = await get_current_user(credentials, supabase)

        assert isinstance(result, str)

    @pytest.mark.asyncio
    async def test_returns_correct_user_id_from_supabase_response(self) -> None:
        other_id = "00000000-0000-0000-0000-000000000001"
        token = _make_token(_make_valid_payload(sub=other_id))
        credentials = _make_credentials(token)
        supabase = _make_supabase_mock(user_id=other_id)

        result = await get_current_user(credentials, supabase)

        assert result == other_id

    @pytest.mark.asyncio
    async def test_supabase_get_user_called_once(self) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)
        supabase = _make_supabase_mock()

        await get_current_user(credentials, supabase)

        supabase.auth.get_user.assert_called_once_with(token)

    # ── Stage-1 short-circuits (Supabase should NOT be called) ───────────

    @pytest.mark.asyncio
    async def test_malformed_token_raises_401_before_supabase_call(self) -> None:
        credentials = _make_credentials("not-a-real-jwt")
        supabase = _make_supabase_mock()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.status_code == 401
        supabase.auth.get_user.assert_not_called()

    @pytest.mark.asyncio
    async def test_expired_token_raises_401_before_supabase_call(self) -> None:
        token = _make_token(_make_valid_payload(offset=-1))
        credentials = _make_credentials(token)
        supabase = _make_supabase_mock()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.status_code == 401
        supabase.auth.get_user.assert_not_called()

    @pytest.mark.asyncio
    async def test_missing_sub_raises_401_before_supabase_call(self) -> None:
        payload = _make_valid_payload()
        del payload["sub"]
        token = _make_token(payload)
        credentials = _make_credentials(token)
        supabase = _make_supabase_mock()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.status_code == 401
        supabase.auth.get_user.assert_not_called()

    # ── Stage-2 failures (Supabase rejects the token) ────────────────────

    @pytest.mark.asyncio
    async def test_supabase_returns_none_user_raises_401(self) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)

        mock_response = MagicMock()
        mock_response.user = None
        supabase = MagicMock()
        supabase.auth.get_user.return_value = mock_response

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.status_code == 401
        assert "invalid" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_supabase_returns_none_response_raises_401(self) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)

        supabase = MagicMock()
        supabase.auth.get_user.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_supabase_raises_exception_returns_401(self) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)

        supabase = MagicMock()
        supabase.auth.get_user.side_effect = RuntimeError("network error")

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.status_code == 401
        assert "validate" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_supabase_raises_value_error_returns_401(self) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)

        supabase = MagicMock()
        supabase.auth.get_user.side_effect = ValueError("bad response")

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.status_code == 401

    # ── Response headers ──────────────────────────────────────────────────

    @pytest.mark.asyncio
    async def test_401_includes_www_authenticate_header_on_supabase_failure(
        self,
    ) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)

        mock_response = MagicMock()
        mock_response.user = None
        supabase = MagicMock()
        supabase.auth.get_user.return_value = mock_response

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.headers is not None
        assert "WWW-Authenticate" in exc_info.value.headers

    @pytest.mark.asyncio
    async def test_401_includes_www_authenticate_header_on_supabase_exception(
        self,
    ) -> None:
        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)

        supabase = MagicMock()
        supabase.auth.get_user.side_effect = Exception("auth service down")

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, supabase)

        assert exc_info.value.headers is not None
        assert "WWW-Authenticate" in exc_info.value.headers

    # ── User ID coercion ──────────────────────────────────────────────────

    @pytest.mark.asyncio
    async def test_user_id_coerced_to_str(self) -> None:
        """Ensure user.id is always returned as str even if Supabase returns UUID."""
        import uuid

        uid = uuid.UUID(_FAKE_USER_ID)
        token = _make_token(_make_valid_payload(sub=str(uid)))
        credentials = _make_credentials(token)
        supabase = _make_supabase_mock(user_id=uid)  # type: ignore[arg-type]

        result = await get_current_user(credentials, supabase)

        assert isinstance(result, str)
        assert result == str(uid)

    # ── Logging (smoke test, not asserting format) ────────────────────────

    @pytest.mark.asyncio
    async def test_warning_logged_on_supabase_exception(self, caplog) -> None:
        import logging

        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)

        supabase = MagicMock()
        supabase.auth.get_user.side_effect = RuntimeError("boom")

        with caplog.at_level(logging.WARNING, logger="app.core.security"):
            with pytest.raises(HTTPException):
                await get_current_user(credentials, supabase)

        assert any("exception" in r.message.lower() or "boom" in r.message.lower() for r in caplog.records)

    @pytest.mark.asyncio
    async def test_warning_logged_when_supabase_returns_no_user(self, caplog) -> None:
        import logging

        token = _make_token(_make_valid_payload())
        credentials = _make_credentials(token)

        mock_response = MagicMock()
        mock_response.user = None
        supabase = MagicMock()
        supabase.auth.get_user.return_value = mock_response

        with caplog.at_level(logging.WARNING, logger="app.core.security"):
            with pytest.raises(HTTPException):
                await get_current_user(credentials, supabase)

        assert len(caplog.records) >= 1
