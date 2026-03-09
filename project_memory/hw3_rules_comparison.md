# Branch Comparison: With Rules vs. Without Rules
**Feature tested:** Supabase JWT validation (`backend/app/core/security.py`)  
**Branch A (control):** `chores/hw3-create-function-without-rule-file`  
**Branch B (experiment):** `chores/hw3-create-function-with-rule-file`  

---

## 1. Code Quality & Consistency with Project Patterns

### Error Handling Architecture
This is the biggest structural difference. The without-rules version collapses all error handling directly into the two-stage validator, raising `HTTPException` at every error site inside `_decode_unverified`. The rules file pushed the AI to separate concerns properly.

| Without Rules | With Rules |
|---|---|
| `_decode_unverified()` raises `HTTPException` directly — error handling is mixed into a low-level helper | Introduces `AuthenticationError` custom exception class. Helpers raise `AuthenticationError`; only `get_current_user()` (the HTTP layer) translates it to `HTTPException` |
| Business logic is coupled to the HTTP framework all the way down | Clean separation: inner functions are testable without a web context |

```python
# WITHOUT rules — helper raises HTTP exception directly
except jwt.DecodeError as exc:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, ...) from exc

# WITH rules — helper raises domain exception; HTTP layer handles it separately
except jwt.DecodeError as exc:
    raise AuthenticationError("Malformed JWT: cannot decode token.") from exc
```

This directly reflects rule §6.1: *"handle errors explicitly — use custom exception classes, not bare except"*.

### Function Decomposition
The rules version further splits the single `_decode_unverified` into two focused helpers: `_decode_token_claims` (decodes) and `_extract_user_id` (validates the sub claim). Each is under 15 lines — consistent with the rule *"keep functions under 50 lines; extract helpers for complex logic"*.

### Return Type Contract
The rules version changed the return type of `get_current_user` from `str` to `dict[str, str]` with both `id` and `email`, which matches how authenticated user data is typically needed downstream (routes need both). The `CurrentUser` type alias in `dependencies.py` was updated accordingly:

```python
# WITHOUT rules
CurrentUser = Annotated[str, Depends(get_authenticated_user)]

# WITH rules
CurrentUser = Annotated[dict, Depends(get_authenticated_user)]
```

---

## 2. How Well the AI Understood the Design/Mockup Intent

### Without Rules
The AI knew the generic problem (validate a JWT with Supabase) but made standalone implementation choices:
- Hard-coded a manual `exp` check using `int(time.time())` instead of trusting Supabase to validate expiry server-side — added complexity that's fragile and unnecessary
- Returned only a `str` user ID, missing that routes typically need both `id` and `email`
- Used generic variable names (`_FAKE_USER_ID`, `_FAKE_SECRET`) instead of domain-specific language

### With Rules
The rules file references the PRD and architecture. The AI understood:
- The file belongs in `backend/app/core/security.py` — it placed it there
- Supabase is the **authoritative** auth backend. The local JWT decode is just a "fast pre-check". It didn't try to re-implement what Supabase already handles
- The module-level docstring now explicitly describes the two-stage design rationale

---

## 3. Adherence to Naming Conventions and Architecture

| Convention | Without Rules | With Rules |
|---|---|---|
| `from __future__ import annotations` | ✅ present | ✅ present |
| Google-style docstrings | ✅ present (both had this) | ✅ present, more consistent |
| Import grouping (stdlib → third-party → local) | ✅ | ✅ |
| `async def` on the public dependency | ✅ | ✅ |
| Type hints on all signatures | Partial — `_JWT_OPTIONS_STRUCTURAL_ONLY: dict` is unparameterized | Full — `dict[str, Any]` used consistently |
| Custom exception class for domain errors | ❌ missing | ✅ `AuthenticationError` class added |
| File location (`app/core/security.py`) | ✅ | ✅ |
| `logger = logging.getLogger(__name__)` | ✅ | ✅ |

The **most notable gap** in the without-rules branch is the unparameterized `dict` type annotation (should be `dict[str, Any]` per strict mode TypeScript equivalent in Python), and the absence of a custom exception class which the rules explicitly require.

---

## 4. Quality of Tests Generated

This is where the rules made the **largest measurable difference**.

### Test File Structure

| Aspect | Without Rules | With Rules |
|---|---|---|
| Test file name | `backend/tests/unit/test_security.py` ✅ | `backend/tests/unit/test_security.py` ✅ |
| Number of test classes | 2 (`TestDecodeUnverified`, `TestGetCurrentUser`) | 4 (`TestDecodeTokenClaims`, `TestExtractUserId`, `TestGetCurrentUser`, `TestHttpLayer`) |
| HTTP integration tests | ❌ None | ✅ Full `TestClient` integration test class |
| Security-focused tests | Partial | ✅ `test_response_body_does_not_leak_token` added |

### Mock Quality (Rules §3.1 — "Mock at the service boundary")

Without rules: `_make_supabase_mock` only supports the happy path. To test failure scenarios in `TestGetCurrentUser`, each test manually set up a separate `MagicMock` inline. This causes duplication.

With rules: `_make_supabase_mock` is parametrized with keyword args (`user_is_none`, `response_is_none`, `raises`), making it reusable across all failure scenarios — consistent with the rule about mocking at the service boundary, not inside implementation.

```python
# WITHOUT rules — reusable only for happy path
def _make_supabase_mock(user_id: str = _FAKE_USER_ID) -> MagicMock:

# WITH rules — handles all cases via keyword args
def _make_supabase_mock(*, user_id, email, user_is_none, response_is_none, raises) -> MagicMock:
```

### Test Coverage of New Code Paths

The with-rules version added `AuthenticationError` as a new class. The test suite immediately covers it with dedicated tests for `_extract_user_id` and tests asserting `AuthenticationError` is raised before falling through to the HTTP layer. The without-rules branch has no equivalent because there's no custom exception to test.

### Integration Test (Biggest Delta)

The with-rules branch added a `TestHttpLayer` class using FastAPI's `TestClient` — something not present at all without the rules. This verifies:
- `200` returned for a valid authenticated request
- `401` returned when Supabase raises an error
- Response body **does not leak the raw token** (security test)
- Missing `Authorization` header returns a 4xx response

This aligns directly with the rules §3.1 key scenario: *"Auth: valid JWT → access; invalid/expired JWT → 401; wrong user → 403"*.

---

## Summary

| Category | Winner | Key Reason |
|---|---|---|
| Code quality | **With rules** | Custom exception class, cleaner separation of concerns |
| Design intent | **With rules** | Correctly treated Supabase as authoritative, returned `dict` not `str` |
| Naming/architecture | **Tie** (mostly) | Both followed file path, async, docstrings. Rules added `dict[str, Any]` precision |
| Test quality | **With rules** significantly | HTTP integration tests, parametrized mocks, security-focused test cases |
