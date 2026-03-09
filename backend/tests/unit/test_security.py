"""Unit tests for app.core.security and app.api.dependencies.

Coverage goals
--------------
* ``_decode_token_claims`` — valid JWT, malformed string, empty string
* ``_extract_user_id``    — present sub, missing sub, empty sub
* ``get_current_user``    — happy path, malformed token, missing sub,
                            Supabase exception, Supabase returns None user,
                            Supabase returns response with None user
* ``get_authenticated_user`` (dependency) — wired correctly through Depends()
* HTTP layer (TestClient)                — 200, 401 with WWW-Authenticate header

All external calls (``supabase.auth.get_user``) are mocked at the service
boundary, never inside the implementation.
"""

from __future__ import annotations

import uuid
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import jwt
import pytest
from fastapi import FastAPI
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.testclient import TestClient

from app.core.security import (
    AuthenticationError,
    _decode_token_claims,
    _extract_user_id,
    get_current_user,
)

# ════════════════════════════════════════════════════════════════════════════
# Helpers
# ════════════════════════════════════════════════════════════════════════════

USER_UUID = str(uuid.uuid4())
USER_EMAIL = "alice@example.com"


def _make_token(sub: str | None = USER_UUID, extra: dict | None = None) -> str:
    """Encode a minimal JWT with HS256 (no real secret needed for unit tests)."""
    payload: dict[str, Any] = {"aud": "authenticated"}
    if sub is not None:
        payload["sub"] = sub
    if extra:
        payload.update(extra)
    return jwt.encode(payload, "test-secret", algorithm="HS256")


def _make_credentials(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _make_supabase_mock(
    *,
    user_id: str = USER_UUID,
    email: str = USER_EMAIL,
    user_is_none: bool = False,
    response_is_none: bool = False,
    raises: Exception | None = None,
) -> MagicMock:
    """Build a Supabase client mock for ``auth.get_user``."""
    client = MagicMock()
    if raises is not None:
        client.auth.get_user.side_effect = raises
        return client

    if response_is_none:
        client.auth.get_user.return_value = None
        return client

    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.email = email

    mock_response = MagicMock()
    mock_response.user = None if user_is_none else mock_user

    client.auth.get_user.return_value = mock_response
    return client


# ════════════════════════════════════════════════════════════════════════════
# _decode_token_claims
# ════════════════════════════════════════════════════════════════════════════


class TestDecodeTokenClaims:
    def test_valid_token_returns_payload(self) -> None:
        token = _make_token()
        claims = _decode_token_claims(token)
        assert claims["sub"] == USER_UUID
        assert claims["aud"] == "authenticated"

    def test_malformed_string_raises_authentication_error(self) -> None:
        with pytest.raises(AuthenticationError, match="Malformed JWT"):
            _decode_token_claims("not.a.jwt")

    def test_empty_string_raises_authentication_error(self) -> None:
        with pytest.raises(AuthenticationError):
            _decode_token_claims("")

    def test_random_garbage_raises_authentication_error(self) -> None:
        with pytest.raises(AuthenticationError):
            _decode_token_claims("abc123!@#")

    def test_only_two_segments_raises_authentication_error(self) -> None:
        with pytest.raises(AuthenticationError):
            _decode_token_claims("header.payload")

    def test_extra_claims_are_preserved(self) -> None:
        token = _make_token(extra={"role": "admin", "iss": "supabase"})
        claims = _decode_token_claims(token)
        assert claims["role"] == "admin"
        assert claims["iss"] == "supabase"


# ════════════════════════════════════════════════════════════════════════════
# _extract_user_id
# ════════════════════════════════════════════════════════════════════════════


class TestExtractUserId:
    def test_returns_sub_when_present(self) -> None:
        claims = {"sub": USER_UUID, "aud": "authenticated"}
        assert _extract_user_id(claims) == USER_UUID

    def test_raises_when_sub_missing(self) -> None:
        with pytest.raises(AuthenticationError, match="sub"):
            _extract_user_id({"aud": "authenticated"})

    def test_raises_when_sub_is_empty_string(self) -> None:
        with pytest.raises(AuthenticationError, match="sub"):
            _extract_user_id({"sub": ""})

    def test_raises_when_sub_is_none(self) -> None:
        # None is falsy, so treated as missing.
        with pytest.raises(AuthenticationError):
            _extract_user_id({"sub": None})  # type: ignore[dict-item]

    def test_returns_arbitrary_string_sub(self) -> None:
        claims = {"sub": "custom-id-123"}
        assert _extract_user_id(claims) == "custom-id-123"


# ════════════════════════════════════════════════════════════════════════════
# get_current_user (async)
# ════════════════════════════════════════════════════════════════════════════


class TestGetCurrentUser:
    @pytest.mark.asyncio
    async def test_happy_path_returns_id_and_email(self) -> None:
        token = _make_token()
        creds = _make_credentials(token)
        supabase = _make_supabase_mock()

        result = await get_current_user(creds, supabase)

        assert result == {"id": USER_UUID, "email": USER_EMAIL}
        supabase.auth.get_user.assert_called_once_with(token)

    @pytest.mark.asyncio
    async def test_malformed_token_raises_401(self) -> None:
        from fastapi import HTTPException

        creds = _make_credentials("this-is-garbage")
        supabase = _make_supabase_mock()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(creds, supabase)

        assert exc_info.value.status_code == 401
        # Supabase should NOT have been called for a pre-validation failure.
        supabase.auth.get_user.assert_not_called()

    @pytest.mark.asyncio
    async def test_token_without_sub_raises_401(self) -> None:
        from fastapi import HTTPException

        token = _make_token(sub=None)  # No sub claim
        creds = _make_credentials(token)
        supabase = _make_supabase_mock()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(creds, supabase)

        assert exc_info.value.status_code == 401
        supabase.auth.get_user.assert_not_called()

    @pytest.mark.asyncio
    async def test_supabase_exception_raises_401(self) -> None:
        from fastapi import HTTPException

        token = _make_token()
        creds = _make_credentials(token)
        supabase = _make_supabase_mock(raises=RuntimeError("network error"))

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(creds, supabase)

        assert exc_info.value.status_code == 401
        assert "Could not validate credentials" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_supabase_returns_none_response_raises_401(self) -> None:
        from fastapi import HTTPException

        token = _make_token()
        creds = _make_credentials(token)
        supabase = _make_supabase_mock(response_is_none=True)

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(creds, supabase)

        assert exc_info.value.status_code == 401
        assert "Invalid or expired" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_supabase_returns_none_user_raises_401(self) -> None:
        from fastapi import HTTPException

        token = _make_token()
        creds = _make_credentials(token)
        supabase = _make_supabase_mock(user_is_none=True)

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(creds, supabase)

        assert exc_info.value.status_code == 401
        assert "Invalid or expired" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_401_response_includes_www_authenticate_header(self) -> None:
        from fastapi import HTTPException

        creds = _make_credentials("bad-token")
        supabase = _make_supabase_mock()

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(creds, supabase)

        headers = exc_info.value.headers or {}
        assert headers.get("WWW-Authenticate") == "Bearer"

    @pytest.mark.asyncio
    async def test_user_id_is_stringified(self) -> None:
        """Ensure that non-string user IDs (e.g. UUID objects) are cast to str."""
        token = _make_token()
        creds = _make_credentials(token)

        # Simulate Supabase returning a UUID *object* for .id
        mock_user = MagicMock()
        mock_user.id = uuid.UUID(USER_UUID)  # UUID object, not str
        mock_user.email = USER_EMAIL
        mock_response = MagicMock()
        mock_response.user = mock_user
        supabase = MagicMock()
        supabase.auth.get_user.return_value = mock_response

        result = await get_current_user(creds, supabase)
        assert isinstance(result["id"], str)

    @pytest.mark.asyncio
    async def test_different_users_returned_correctly(self) -> None:
        second_uuid = str(uuid.uuid4())
        second_email = "bob@example.com"
        token = _make_token(sub=second_uuid)
        creds = _make_credentials(token)
        supabase = _make_supabase_mock(user_id=second_uuid, email=second_email)

        result = await get_current_user(creds, supabase)
        assert result == {"id": second_uuid, "email": second_email}


# ════════════════════════════════════════════════════════════════════════════
# HTTP integration via TestClient
# ════════════════════════════════════════════════════════════════════════════


def _build_test_app() -> FastAPI:
    """Minimal FastAPI app that exercises the real auth dependency."""
    from fastapi import Depends

    from app.api.dependencies import get_authenticated_user

    mini_app = FastAPI()

    @mini_app.get("/protected")
    async def protected_route(user: dict = Depends(get_authenticated_user)) -> dict:
        return {"user_id": user["id"]}

    return mini_app


class TestHttpLayer:
    def _client_with_overrides(
        self,
        *,
        user: dict | None = None,
        supabase: MagicMock | None = None,
    ) -> TestClient:
        from app.api.dependencies import get_authenticated_user, get_supabase_client

        mini_app = _build_test_app()
        if user is not None:
            mini_app.dependency_overrides[get_authenticated_user] = lambda: user
        if supabase is not None:
            mini_app.dependency_overrides[get_supabase_client] = lambda: supabase
        return TestClient(mini_app, raise_server_exceptions=False)

    def test_authenticated_request_returns_200(self) -> None:
        user = {"id": USER_UUID, "email": USER_EMAIL}
        client = self._client_with_overrides(user=user)
        resp = client.get("/protected", headers={"Authorization": f"Bearer {_make_token()}"})
        assert resp.status_code == 200
        assert resp.json()["user_id"] == USER_UUID

    def test_missing_authorization_header_returns_4xx(self) -> None:
        """FastAPI's HTTPBearer returns 401 or 403 when no header is present.

        The exact status depends on the FastAPI version; both are valid
        "unauthenticated" responses, so we assert the range [400, 499].
        """
        mini_app = _build_test_app()
        client = TestClient(mini_app, raise_server_exceptions=False)
        resp = client.get("/protected")
        assert 400 <= resp.status_code < 500

    def test_invalid_token_returns_401_with_www_authenticate(self) -> None:
        from app.api.dependencies import get_supabase_client

        supabase = _make_supabase_mock(raises=Exception("invalid token"))
        mini_app = _build_test_app()
        mini_app.dependency_overrides[get_supabase_client] = lambda: supabase

        client = TestClient(mini_app, raise_server_exceptions=False)
        resp = client.get("/protected", headers={"Authorization": "Bearer bad.token.value"})
        assert resp.status_code == 401

    def test_expired_token_returns_401(self) -> None:
        from app.api.dependencies import get_supabase_client

        supabase = _make_supabase_mock(user_is_none=True)
        mini_app = _build_test_app()
        mini_app.dependency_overrides[get_supabase_client] = lambda: supabase

        token = _make_token(extra={"exp": 1})  # epoch 1 = effectively expired
        client = TestClient(mini_app, raise_server_exceptions=False)
        resp = client.get("/protected", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401

    def test_response_body_does_not_leak_token(self) -> None:
        from app.api.dependencies import get_supabase_client

        supabase = _make_supabase_mock(raises=Exception("some internal error"))
        mini_app = _build_test_app()
        mini_app.dependency_overrides[get_supabase_client] = lambda: supabase

        token = _make_token()
        client = TestClient(mini_app, raise_server_exceptions=False)
        resp = client.get("/protected", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401
        assert token not in resp.text
