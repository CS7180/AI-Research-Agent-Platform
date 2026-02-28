---
description: "DocMind Project Context, Tech Stack, and Guidelines"
always_on: true
---

# DocMind — AI Research Agent Platform
This file provides project-wide context, conventions, and guardrails for AI-assisted development. All agents (Antigravity, Copilot, Cursor, etc.) should treat this as the source of truth for how code is written, reviewed, and shipped in this repository.

## 1. PROJECT CONTEXT

# 1.1 Project Overview
DocMind is a full-stack AI-powered research agent platform for CS students.
Users upload documents (PDF, Markdown, TXT) to build a private knowledge base,
then query it via text and image inputs through an intelligent LangGraph agent
that orchestrates retrieval, web search, and code execution.

Three entry points:
  - Web UI (Next.js) — primary experience (REST API + SSE streaming)
  - MCP Server — AI clients (Claude Desktop, Cursor) query KB directly
  - n8n + Slack — team members query from Slack via webhook workflow

# 1.2 Tech Stack & Versions

## Backend
- Python 3.11+
- FastAPI (async-native)
- LangGraph (agent orchestration with conditional branching)
- LangChain (provider adapters: langchain-google-genai, langchain-openai, langchain-community)
- Celery + Redis (async task queue for document processing)
- MCP Python SDK (Model Context Protocol server)
- Pydantic v2 (request/response validation)
- RAGAS (RAG evaluation framework)

## Frontend
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS (utility-first styling)
- Server-Sent Events (SSE) for LLM streaming

## Database & Storage
- Supabase (managed PostgreSQL + Auth + Storage)
- pgvector (vector similarity search via Supabase extension)
- Supabase Storage (S3-compatible file storage with RLS)
- Redis (conversation cache, Celery broker)

## AI / Multi-Modal
- Primary LLM: Google Gemini 2.5 Flash (vision + tool-calling, 1M context)
- Embeddings: gemini-embedding-001 (768-dim)
- Fallback LLM: Gemini 2.5 Pro (complex reasoning)
- Provider-agnostic: switchable to OpenAI / Qwen via env vars

## Infrastructure
- Docker Compose (FastAPI, Redis, Celery worker)
- GitHub Actions (CI/CD: lint, test, build, security scan)
- n8n (Slack integration workflow)

# 1.3 Architecture — Folder Structure
The project follows a layered monorepo structure:

AI-Research-Agent-Platform/
├── backend/                      # Python FastAPI backend
│   ├── app/
│   │   ├── main.py               # FastAPI application entry point
│   │   ├── api/
│   │   │   ├── routes/           # API route handlers (documents, chat, auth)
│   │   │   ├── dependencies.py   # Shared FastAPI dependencies (auth, DB)
│   │   │   └── middleware.py     # CORS, rate limiting, error handling
│   │   ├── agent/
│   │   │   ├── graph.py          # LangGraph agent workflow definition
│   │   │   ├── nodes.py          # Agent graph nodes (retrieve, search, generate)
│   │   │   ├── tools.py          # Tool definitions (KB retrieval, web search, code exec)
│   │   │   └── state.py          # Agent state schema
│   │   ├── services/
│   │   │   ├── document.py       # Document processing pipeline
│   │   │   ├── embedding.py      # Embedding generation (provider-agnostic)
│   │   │   ├── retrieval.py      # Hybrid search (BM25 + semantic + re-ranking)
│   │   │   ├── llm.py            # LLM adapter (Gemini / OpenAI / Qwen)
│   │   │   └── storage.py        # Supabase Storage interactions
│   │   ├── models/
│   │   │   ├── document.py       # SQLAlchemy / Supabase document models
│   │   │   └── user.py           # User model
│   │   ├── schemas/
│   │   │   ├── document.py       # Pydantic request/response schemas
│   │   │   ├── chat.py           # Chat message schemas
│   │   │   └── common.py         # Shared schemas (pagination, errors)
│   │   ├── core/
│   │   │   ├── config.py         # Settings via pydantic-settings (env vars)
│   │   │   ├── security.py       # Supabase JWT validation
│   │   │   └── constants.py      # App-wide constants
│   │   └── workers/
│   │       └── tasks.py          # Celery tasks (document ingestion)
│   ├── mcp_server/
│   │   ├── server.py             # MCP Server entry point
│   │   └── tools/                # MCP tool implementations
│   ├── tests/
│   │   ├── unit/                 # Unit tests (services, models)
│   │   ├── integration/          # Integration tests (API endpoints)
│   │   └── conftest.py           # Shared fixtures
│   ├── pyproject.toml            # Python project metadata + dependencies
│   ├── Dockerfile                # Backend container
│   └── alembic/                  # Database migrations (if needed)
│
├── frontend/                     # Next.js frontend
│   ├── src/
│   │   ├── app/                  # App Router pages and layouts
│   │   │   ├── (auth)/           # Auth pages (login, callback)
│   │   │   ├── chat/             # Chat interface page
│   │   │   ├── documents/        # Document management page
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI primitives
│   │   │   ├── chat/             # Chat-specific components
│   │   │   └── documents/        # Document-specific components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api.ts            # API client (fetch wrapper)
│   │   │   ├── supabase.ts       # Supabase client initialization
│   │   │   └── sse.ts            # SSE stream handler
│   │   ├── types/                # TypeScript type definitions
│   │   └── styles/               # Global styles
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
│
├── docker-compose.yml            # Production compose
├── docker-compose.dev.yml        # Dev compose (hot reload)
├── docs/
│   ├── PRD.md                    # Product Requirements Document
│   ├── architecture.md           # Architecture diagrams and decisions
│   └── api.md                    # API documentation
├── .github/
│   └── workflows/
│       ├── ci.yml                # CI pipeline (lint, test, build)
│       └── deploy.yml            # Deployment pipeline
├── .env.example                  # Template for environment variables
├── .agents/
│   └── rules.md                  # THIS FILE
└── README.md

# 1.4 Key Architecture Patterns
- Provider-Agnostic AI Layer: All LLM/embedding calls go through adapter classes
  configured via env vars (LLM_PROVIDER, EMBEDDING_PROVIDER). Never hardcode a
  specific AI provider.
- LangGraph Stateful Agent: The agent is a directed graph with conditional edges.
  Nodes = tool invocations. State schema defined in agent/state.py.
- Async-First: FastAPI endpoints are async. Document processing uses Celery tasks.
  Never block the event loop with synchronous I/O.
- Supabase as BaaS: Auth, PostgreSQL, Storage, and pgvector are all managed by
  Supabase. Use Supabase client libraries, not raw SQL, where possible.
- Row Level Security (RLS): All data access is scoped per-user at the DB level.
  Never bypass RLS; always pass authenticated user context.
- SSE Streaming: Chat responses stream via Server-Sent Events. Do not use
  WebSockets for LLM output streaming.

## 2. NAMING CONVENTIONS & CODING STANDARDS

# 2.1 Python (Backend)
- Style: PEP 8 + Black formatter (line length: 88)
- Linter: Ruff (replaces flake8 + isort + pyflakes)
- Type hints: Required on all function signatures (use `from __future__ import annotations`)
- Naming:
    - Files/modules: snake_case (e.g., document_service.py)
    - Classes: PascalCase (e.g., DocumentService, ChatRequest)
    - Functions/methods: snake_case (e.g., process_document, get_user_by_id)
    - Constants: UPPER_SNAKE_CASE (e.g., MAX_FILE_SIZE_MB, DEFAULT_CHUNK_SIZE)
    - Private methods/attrs: single leading underscore (e.g., _validate_mime_type)
- Pydantic models: Use Pydantic v2 with model_validator where needed.
  Schemas go in app/schemas/. DB models go in app/models/.
- Imports: Group in order — stdlib, third-party, local. Use absolute imports.
- Docstrings: Google-style docstrings on all public functions and classes.
- Async: Use `async def` for all FastAPI route handlers and I/O-bound service methods.

# 2.2 TypeScript / React (Frontend)
- Style: Prettier (printWidth: 100, singleQuote: true, semi: true)
- Linter: ESLint with next/core-web-vitals + typescript-eslint
- Type safety: TypeScript strict mode. No `any` types unless explicitly justified.
- Naming:
    - Files: kebab-case for pages/routes (e.g., document-list.tsx)
    - Components: PascalCase files and exports (e.g., ChatMessage.tsx → export ChatMessage)
    - Hooks: camelCase with `use` prefix (e.g., useDocuments.ts → export useDocuments)
    - Types/Interfaces: PascalCase with descriptive names (e.g., DocumentMetadata, ChatMessage)
    - Constants: UPPER_SNAKE_CASE
    - Utilities: camelCase (e.g., formatTimestamp, parseSSEEvent)
- Components: Functional components only. Use React Server Components where possible.
  Client components marked with 'use client' directive.
- State: Use React hooks (useState, useReducer). Avoid external state libraries
  unless complexity demands it.

# 2.4 Tailwind CSS Design Tokens
All project colors, fonts, and design tokens MUST be registered in globals.css
under Tailwind v4's `@theme inline` block so they are usable as native utility
classes. Never use raw CSS variables with inline `style={}` props.

Pattern:
  @theme inline {
    --color-primary: #0071E3;
    --color-text-secondary: #424245;
    --color-nav-bg: rgba(29, 29, 31, 0.85);
    --font-sans: 'Poppins', system-ui, sans-serif;
  }

This makes classes like `bg-primary`, `text-text-secondary`, `bg-nav-bg`,
and `font-sans` available throughout components — eliminating the need
for any `style={{ color: "var(--text-primary)" }}` patterns.

When implementing a mockup or design:
  1. Extract every color, font, shadow, and spacing value from the design
  2. Register each as a `--color-*` or `--font-*` variable in `@theme inline`
  3. Reference exclusively via Tailwind classes (e.g., `bg-primary`, `text-nav-text`)
  4. For gradients, use Tailwind's `bg-gradient-to-*` + `from-*` / `to-*` utilities

# 2.3 General
- Max line length: 88 (Python), 100 (TypeScript)
- UTF-8 encoding everywhere
- LF line endings (no CRLF)
- Trailing newline at end of file
- No trailing whitespace

## 3. TESTING STRATEGY

# 3.1 Backend Testing
- Framework: pytest + pytest-asyncio
- Coverage target: ≥ 80% line coverage on services/ and agent/
- Test structure:
    - tests/unit/ — isolated unit tests (mock external services)
    - tests/integration/ — API endpoint tests (use TestClient + test Supabase project)
- Fixtures: Shared fixtures in conftest.py (mock Supabase client, mock Redis, sample docs)
- Naming: test files mirror source files (e.g., services/document.py → tests/unit/test_document.py)
- Async tests: Use @pytest.mark.asyncio for async test functions
- Mocking: Use unittest.mock or pytest-mock. Mock external APIs (Supabase, Gemini, Redis)
  at the service boundary, not inside implementation.
- Key test scenarios:
    - Document pipeline: upload → validate → chunk → embed → store (happy + error paths)
    - RAG query: retrieval → generation → streaming (with/without relevant docs)
    - Auth: valid JWT → access; invalid/expired JWT → 401; wrong user → 403
    - Agent: tool selection based on intent; retry on tool failure; fallback behavior

# 3.2 Frontend Testing
- Framework: Jest + React Testing Library
- Coverage target: ≥ 70% on components/ and hooks/
- E2E: Playwright for critical user flows (login → upload → chat → receive answer)
- Test naming: ComponentName.test.tsx or hook-name.test.ts
- Key test scenarios:
    - Document upload flow (file validation, progress, success/error states)
    - Chat interface (send message, stream response, display citations)
    - Auth flow (login redirect, session persistence, logout)

# 3.3 AI / RAG Evaluation
- Framework: RAGAS
- Benchmark: 30-question set with ground-truth answers (stored in eval/benchmark.json)
- Metrics: Faithfulness ≥ 0.85, Answer Relevancy ≥ 0.80, Context Precision ≥ 0.75, Context Recall ≥ 0.70
- Run: `python -m pytest tests/eval/ --ragas` or dedicated eval script

## 4. PRD & DESIGN REFERENCES

# 4.1 Product Requirements Document
Location: docs/PRD.md
The PRD is the source of truth for all feature requirements, user stories,
acceptance criteria, and prioritization (MoSCoW). Always consult the PRD
before implementing a new feature.

Key sections:
  - §3: Target Audience & User Stories (US-01 through US-10)
  - §4: Tech Stack (authoritative versions and rationale)
  - §5: System Architecture (data flows, component layers)
  - §6: Core Features (detailed specifications)
  - §7: Non-Functional Requirements (performance targets, security)
  - §9: Sprint Plan (issue numbers and estimates)

# 4.2 Key UI Components & Expected Behavior

## Chat Interface (Primary)
- Full-screen chat layout with message history and input bar
- Messages stream in real-time via SSE (token-by-token rendering)
- Bot responses include inline source citations (clickable → document viewer)
- Image upload button in input bar for multi-modal queries
- Loading skeleton while agent processes query
- Error state with retry option on failure

## Document Management
- Grid/list view of uploaded documents (filename, date, status badge)
- Status badges: PENDING (yellow), PROCESSING (blue/animated), READY (green), FAILED (red)
- Upload dropzone supporting drag-and-drop (PDF, MD, TXT only; max 50MB)
- Delete confirmation modal with warning about permanent removal
- Empty state with CTA to upload first document

## Authentication
- Google OAuth sign-in button (Supabase Auth)
- Protected routes redirect to login if unauthenticated
- Session persisted via Supabase client-side auth helpers

# 4.3 User Flows

## Flow 1: Document Upload
1. User clicks upload / drags file → client validates type & size
2. File uploaded to Supabase Storage via API → returns document ID
3. Status shows PENDING → PROCESSING (Celery task runs)
4. Backend: extract text → chunk (512 tokens, 64 overlap) → embed → store vectors
5. Status updates to READY (or FAILED with error message)
6. Document appears in list, searchable immediately

## Flow 2: Chat Query
1. User types question (optionally attaches image) → sends to /api/chat
2. LangGraph agent receives query → classifies intent
3. Agent selects tool(s): KB Retrieval, Web Search, and/or Code Execution
4. If KB Retrieval: hybrid BM25 + semantic search → re-rank → top-k chunks
5. LLM generates grounded answer with citations → streams via SSE
6. Frontend renders tokens as they arrive + citation links

## Flow 3: MCP Client Query
1. External client (Cursor/Claude) connects to MCP Server
2. Client lists available tools (retrieval, search, code_exec)
3. Client invokes tool with parameters → MCP Server routes to backend service
4. Results returned via MCP protocol

## 5. SCRUM & WORKFLOW INSTRUCTIONS

# 5.1 Branch Naming Convention
Format: <type>/<issue-number>-<short-description>
Examples:
  feature/3-document-upload-pipeline
  feature/8-langgraph-agent
  bugfix/15-fix-embedding-dimension
  chore/20-update-docker-compose
  hotfix/22-auth-token-expiry

Types: feature, bugfix, chore, hotfix, docs, refactor, test
Always branch from `main`. Keep branches short-lived (< 1 week).

# 5.2 Commit Message Format
Follow Conventional Commits (https://www.conventionalcommits.org/):

Format: <type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore, ci, perf
Scope: backend, frontend, agent, docs, docker, ci (optional but encouraged)

Examples:
  feat(backend): add document upload endpoint with Supabase Storage
  fix(agent): handle empty retrieval results gracefully
  test(backend): add unit tests for embedding service
  docs: update PRD with Sprint 2 scope changes
  chore(docker): add hot-reload to dev compose

Body (optional): Explain WHY, not WHAT. Reference issues with "Refs #<number>".
Footer: Use "Closes #<number>" to auto-close GitHub Issues on merge.

Example full commit:
  feat(backend): implement hybrid BM25 + semantic retrieval

  Combines keyword (BM25) and vector (pgvector cosine) search with RRF
  re-ranking to improve recall on diverse query types.

  Closes #5

# 5.3 Pull Request Workflow
1. Create PR from feature branch → main
2. PR title follows commit format: "feat(backend): implement document upload"
3. PR description must include:
   - Summary of changes
   - Link to GitHub Issue: "Closes #<number>" or "Refs #<number>"
   - Screenshots/recordings for UI changes
   - Testing notes (what was tested, how to verify)
4. Required: At least 1 approval from team member
5. Required: All CI checks pass (lint, test, build)
6. Squash merge to main (clean linear history)
7. Delete branch after merge

# 5.4 GitHub Issue References
- In commits: "Refs #3" (reference) or "Closes #3" (auto-close on merge)
- In code comments (sparingly): # TODO(#15): Optimize chunking for large PDFs
- In PR descriptions: Always link the parent issue
- Sprint issues are numbered #1–#13 per the PRD Sprint Plan (§9)

## 6. DO'S AND DON'TS

# 6.1 DO's ✅

## Architecture
- DO use the provider-agnostic adapter pattern for all AI calls (LLM, embeddings, vision)
- DO route all database access through Supabase client with authenticated context (RLS)
- DO use Celery tasks for any processing that takes > 2 seconds
- DO use Pydantic schemas for ALL request/response validation
- DO use environment variables for all configuration (pydantic-settings)
- DO design LangGraph nodes to be idempotent and retriable
- DO use dependency injection via FastAPI's Depends() for services

## Code Quality
- DO write type hints on every function signature (Python and TypeScript)
- DO write Google-style docstrings on all public functions and classes
- DO keep functions under 50 lines; extract helpers for complex logic
- DO handle errors explicitly — use custom exception classes, not bare except
- DO log structured messages (use Python logging with JSON format)
- DO write tests alongside feature code (not as an afterthought)

## Frontend
- DO use React Server Components by default; mark 'use client' only when needed
- DO use Tailwind utility classes; avoid inline styles
- DO implement loading, error, and empty states for every data-fetching component
- DO use semantic HTML elements (main, nav, article, section)
- DO ensure all interactive elements are keyboard-accessible
- DO use real HTML form elements (<input>, <form>, <button>, <label>) — never
  fake interactive controls with <span> or <div>
- DO put shared TypeScript interfaces/types in src/types/ and import them —
  never define data shapes inline within component files
- DO use Tailwind @theme tokens for ALL design values — colors, fonts, shadows.
  If a value comes from a mockup, it goes in @theme first, then is referenced
  via a utility class. Zero tolerance for inline style={{}} on color/font/bg.
- DO map semantic HTML elements to UI roles:
    - Page sections → <main>, <section>
    - Panel/card headers → <header> + <h1>/<h2>
    - Navigation links → <nav>
    - AI responses → <article>
    - Chat messages area → role="log" + aria-live="polite"
    - Lists (sessions, files) → <ul>/<li> or <ol>/<li>
    - Clickable list items → <button> (not clickable <div>)
    - File trees → role="tree" / role="treeitem" + aria-expanded
    - Separators → <hr> (not <div> with border-top)
    - Text inputs → <input> + <label> (with htmlFor or sr-only)

## Security
- DO validate Supabase JWT on every API endpoint
- DO use RLS policies — never trust client-side user ID
- DO sanitize all user inputs (filenames, query text)
- DO set CORS to allow only the frontend origin in production
- DO use HTTPS in production for all API communication

# 6.2 DON'TS ❌

## Architecture
- DON'T hardcode AI provider (OpenAI, Gemini, etc.) — always use the adapter
- DON'T make synchronous blocking calls in async FastAPI handlers
- DON'T bypass Supabase Auth or RLS for "convenience"
- DON'T store secrets in code, .env files committed to git, or frontend bundles
- DON'T use WebSockets for LLM streaming — use SSE
- DON'T put business logic in API route handlers — delegate to services
- DON'T create circular imports between modules

## Code Quality
- DON'T use `any` type in TypeScript (use `unknown` + type guards if needed)
- DON'T use bare `except:` or `except Exception:` without logging
- DON'T leave TODO/FIXME without a GitHub Issue reference (e.g., TODO(#15))
- DON'T use print() for logging — use the logging module
- DON'T commit commented-out code
- DON'T use magic numbers — define named constants

## Frontend
- DON'T use class components — functional components only
- DON'T install heavy state management libraries (Redux, MobX) unless justified
- DON'T fetch data in useEffect when React Server Components or SWR/React Query suffice
- DON'T hardcode API URLs — use environment variables (NEXT_PUBLIC_API_URL)
- DON'T use inline style={{}} for colors, backgrounds, fonts, or borders —
  register values as Tailwind @theme tokens and use utility classes instead
- DON'T use <div> as a catch-all — choose the correct semantic element
  (<header>, <nav>, <main>, <article>, <section>, <form>, <button>, <ul>/<li>)
- DON'T fake interactive elements — a clickable item must be a <button> or <a>,
  a text input must be an <input> with a <label>, not a styled <span>
- DON'T define TypeScript types/interfaces inline in component files —
  put them in src/types/ and import them
- DON'T omit accessibility attributes — every interactive region needs
  an aria-label, every form input needs a label, every live-updating
  region (e.g., chat messages) needs aria-live

## Dependencies
- DON'T install new dependencies without team discussion
- DON'T use unmaintained or low-download packages
- DON'T pin to exact versions — use compatible release specifiers (~= for Python, ^ for npm)

# 6.3 Preferred Dependencies

## Backend (Python)
- HTTP framework: FastAPI
- Agent: LangGraph + LangChain
- AI providers: langchain-google-genai, langchain-openai
- Task queue: Celery + Redis
- Dependency Management: `uv` (replaces pip/venv)
- Validation: Pydantic v2
- Testing: pytest, pytest-asyncio, pytest-mock
- Linting: Ruff, Black
- PDF extraction: PyMuPDF (fitz) or pdfplumber
- MCP: mcp (official Python SDK)
- Evaluation: ragas

## Frontend (TypeScript)
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Auth: @supabase/auth-helpers-nextjs, @supabase/supabase-js
- HTTP: Native fetch (no axios)
- Testing: Jest, React Testing Library, Playwright
- Linting: ESLint, Prettier

## Avoid These
- Flask / Django (use FastAPI)
- SQLAlchemy ORM (use Supabase client; raw SQL only for complex pgvector queries)
- axios (use native fetch)
- Redux / MobX (use React hooks + context)
- Moment.js (use date-fns or Intl API)
- Express.js (backend is Python, not Node)

# 6.4 Security Requirements
- All API endpoints require valid Supabase JWT (except /health)
- File uploads: MIME type whitelist (application/pdf, text/markdown, text/plain)
- File size limit: 50MB
- No user-uploaded files served directly — always through Supabase Storage signed URLs
- Rate limiting on chat and upload endpoints
- Input sanitization on all user-provided strings
- OWASP Top 10 awareness (injection, XSS, CSRF, etc.)
- Content Security Policy headers on frontend

# 6.5 Accessibility Requirements
- WCAG 2.1 Level AA compliance target
- All images have alt text
- All form inputs have associated labels
- Focus management for modals and dynamic content
- Sufficient color contrast ratios (4.5:1 for normal text)
- Keyboard navigation for all interactive elements
- Screen reader support (aria-live regions for streaming chat)
- Semantic HTML structure (landmarks, headings hierarchy)

## 7. ENVIRONMENT VARIABLES
All configuration is via environment variables. See .env.example for the full list.

Required:
  SUPABASE_URL             — Supabase project URL
  SUPABASE_ANON_KEY        — Supabase anonymous (public) key
  SUPABASE_SERVICE_KEY     — Supabase service role key (backend only, never expose)
  REDIS_URL                — Redis connection string
  LLM_PROVIDER             — gemini | openai | qwen
  LLM_MODEL                — e.g., gemini-2.5-flash, gpt-4o-mini
  EMBEDDING_PROVIDER       — gemini | openai | qwen
  EMBEDDING_MODEL          — e.g., gemini-embedding-001
  GOOGLE_API_KEY           — Gemini API key (if LLM_PROVIDER=gemini)

Optional:
  OPENAI_API_KEY           — OpenAI API key (if using OpenAI provider)
  QWEN_API_KEY             — Qwen API key (if using Qwen provider)
  CELERY_BROKER_URL        — Defaults to REDIS_URL
  LOG_LEVEL                — DEBUG | INFO | WARNING | ERROR (default: INFO)
  NEXT_PUBLIC_API_URL      — Backend API URL for frontend
  NEXT_PUBLIC_SUPABASE_URL — Supabase URL for frontend client

## 8. DOCKER & LOCAL DEVELOPMENT
Local dev: `docker compose -f docker-compose.dev.yml up`
Services: FastAPI (port 8000), Redis (port 6379), Celery worker
Frontend: `cd frontend && npm run dev` (port 3000)
Supabase: Cloud-hosted (no local Supabase container needed)

Hot reload:
  - Backend: uvicorn with --reload flag (mounted volume in dev compose)
  - Frontend: Next.js dev server with Fast Refresh
  - Celery: watchmedo auto-restart (or manual restart)

## 9. CI/CD PIPELINE
Triggered on: Every push to main, every PR

Jobs:
  1. Lint (backend): ruff check + black --check
  2. Lint (frontend): eslint + prettier --check
  3. Test (backend): pytest with coverage report
  4. Test (frontend): jest + playwright
  5. Build: Docker image build (verify Dockerfile is valid)
  6. Security: uv pip audit (Python) + npm audit (Node)

PR merge requirements:
  - All CI jobs pass
  - At least 1 approving review
  - No unresolved conversations


