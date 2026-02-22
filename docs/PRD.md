# DocMind — Product Requirements Document

> **AI Research Agent Platform** | Version 1.0 | February 2026 | Team: Shanshou Li, Yachen Wang

---

## 1. Executive Summary

DocMind is a full-stack AI-powered research agent platform designed for CS students who accumulate lecture slides, research papers, project documents, and course notes across multiple classes but struggle to extract useful information from them quickly. Users upload documents to build a private knowledge base, then query it via text and image inputs through an intelligent agent that orchestrates retrieval, web search, and code execution.

The platform is accessible through three entry points:

| Entry Point | Target Scenario | Communication |
|---|---|---|
| **Web UI** (Next.js) | Primary experience — chat, document upload, management | REST API + SSE streaming |
| **MCP Server** | AI clients (Claude Desktop, Cursor) query knowledge base directly | MCP protocol over stdio/SSE |
| **n8n + Slack** | Team members query from Slack without context-switching | Slack trigger → n8n HTTP → REST API |

---

## 2. Problem Statement

CS students face a growing information management problem: they accumulate hundreds of files across multiple courses each semester — lecture slides, research papers, project documentation, and personal notes — but have no efficient way to search across all of them. When exam review or project deadlines approach, students resort to manually opening dozens of files to locate specific concepts, wasting significant time and often missing connections between materials from different sources.

Existing solutions fall short:

- **Manual search:** Ctrl+F across 30+ files is tedious and misses semantic connections.
- **Generic AI chatbots:** ChatGPT/Claude have no access to personal course materials and cannot ground answers in specific lecture content.
- **Note-taking apps:** Notion, Obsidian, etc. provide organization but lack AI-powered cross-document retrieval.
- **Workflow fragmentation:** Group project members must leave their IDE or Slack to search shared documents, breaking concentration.

---

## 3. Target Audience

### 3.1 User Personas

**Persona 1: Individual CS Student**

A graduate or undergraduate CS student who takes 3–4 courses per semester, each generating dozens of PDFs, slides, and notes. They need to quickly find specific concepts (e.g., "how does 2PC handle node failure") before exams or project deadlines without opening each file manually. They value speed and accuracy of retrieval over complex features.

**Persona 2: Group Project Team Member**

A student working on a team project who needs to share a knowledge base with teammates and query it from Slack or their IDE without breaking workflow. They collaborate across different tools (Slack, VS Code / Cursor, Google Docs) and need a unified way to access shared project documentation.

### 3.2 User Stories

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-01 | As a student, I want to upload course materials (PDF, Markdown, TXT) so that I can build a searchable knowledge base. | Files are accepted, chunked, embedded, and searchable within 60 seconds. Unsupported file types are rejected with a clear error message. | Must Have |
| US-02 | As a student, I want to ask natural language questions about my uploaded documents so that I can review across all materials at once. | Agent retrieves relevant chunks, generates a grounded answer with source citations, and streams the response in real-time via SSE. | Must Have |
| US-03 | As a student, I want to upload a whiteboard photo and ask the agent to explain it using my notes. | Gemini 2.5 Flash vision extracts content from the image; the extracted text enters the RAG pipeline; the agent produces an explanation grounded in uploaded documents. | Must Have |
| US-04 | As a team member, I want to query shared documents from Slack without leaving the workflow. | Slack trigger sends query to FastAPI via n8n; response posts back within 15 seconds for typical queries. | Should Have |
| US-05 | As a developer, I want to connect Cursor IDE to the knowledge base via MCP to pull up references while coding. | MCP Server exposes retrieval, web search, and code execution tools; Cursor connects via standard MCP protocol and returns results. | Should Have |
| US-06 | As a student, I want to manage my uploaded documents (view, delete) through the web UI. | Document list shows filename, upload date, processing status. Delete removes Supabase Storage object, DB record, and associated vector embeddings. | Must Have |
| US-07 | As a student, I want to sign in securely with my Google account so that my knowledge base is private. | Supabase Auth with Google OAuth provider; unauthenticated users cannot access any endpoints; JWT tokens issued by Supabase expire and refresh correctly. Row Level Security (RLS) enforces data isolation at the database level. | Must Have |
| US-08 | As a student, I want the agent to fall back to web search when my documents don't contain the answer. | LangGraph agent detects low retrieval confidence and autonomously triggers web search tool; response indicates source (docs vs. web). | Should Have |
| US-09 | As a developer, I want to evaluate RAG quality with standard metrics so that I can measure and improve answer accuracy. | RAGAS evaluation suite runs on a 30-question benchmark; faithfulness, answer relevancy, context precision/recall are computed and visualized. | Could Have |
| US-10 | As a student, I want the agent to execute code snippets when my question involves computation. | Agent detects computational intent, executes code in a sandboxed environment, and returns the result inline with the answer. | Could Have |

---

## 4. Tech Stack

### 4.1 Backend

| Component | Technology | Rationale |
|---|---|---|
| Framework | Python FastAPI | Async-native with best AI/ML ecosystem compatibility |
| Agent Orchestration | LangGraph | Stateful workflow with conditional branching and tool selection |
| Tool Protocol | MCP (Python SDK) | Industry-standard protocol for external AI client integration |
| Task Queue | Redis + Celery | Async document processing without Kafka overhead |
| Authentication | Supabase Auth (Google OAuth) | Built-in JWT + Google OAuth with Row Level Security; eliminates custom auth code |

### 4.2 Frontend

| Component | Technology | Rationale |
|---|---|---|
| Framework | Next.js + TypeScript | Server-side rendering, type safety, built-in API routes |
| Styling | Tailwind CSS | Rapid UI development with utility-first approach |
| Streaming | Server-Sent Events (SSE) | Unidirectional LLM streaming, simpler than WebSocket for this use case |

### 4.3 Database & Storage

| Component | Technology | Rationale |
|---|---|---|
| Platform | Supabase | Managed PostgreSQL + Auth + Storage as a unified BaaS; eliminates self-hosted DB and custom auth/storage code |
| Vector Search | pgvector (Supabase extension) | Enable via Supabase dashboard; single database for relational data + vector similarity search |
| File Storage | Supabase Storage | S3-compatible object storage with RLS policies; replaces custom StorageService |
| Cache / Queue Broker | Redis | Conversation cache, Celery message broker (not replaceable by Supabase) |

### 4.4 AI / Multi-Modal

The AI layer uses a **provider-agnostic** design — all LLM, vision, and embedding calls are routed through a configurable adapter so the underlying provider can be switched via environment variables without code changes.

| Component | Primary Technology | Alternatives | Rationale |
|---|---|---|---|
| LLM | Google Gemini 2.5 Flash | GPT-4o-mini, Qwen-Plus | Free tier (250 req/day), built-in vision + tool-calling, 1M context window, ~75% cheaper than GPT-4o on paid tier |
| Embeddings | gemini-embedding-001 | OpenAI text-embedding-3-small, Qwen text-embedding-v4 | Free tier (1000 req/day); paid at $0.15/1M tokens |
| Image Input | Gemini 2.5 Flash (built-in vision) | GPT-4o-mini Vision, Qwen-VL | No separate vision API needed — multimodal is native to the primary LLM |
| Fallback LLM | Gemini 2.5 Pro | GPT-4o | For complex reasoning queries requiring deeper intelligence |
| Evaluation | RAGAS | — | Standard RAG evaluation: faithfulness, precision, recall |

**Provider switching** is controlled via environment variables:

```
LLM_PROVIDER=gemini            # gemini | openai | qwen
LLM_MODEL=gemini-2.5-flash     # or gpt-4o-mini, qwen-plus
EMBEDDING_PROVIDER=gemini       # gemini | openai | qwen
EMBEDDING_MODEL=gemini-embedding-001
```

LangGraph + LangChain natively supports multiple providers (`langchain-google-genai`, `langchain-openai`, `langchain-community`), making provider switching a configuration change rather than a code refactor.

### 4.5 Infrastructure

| Component | Technology | Rationale |
|---|---|---|
| Backend-as-a-Service | Supabase (Cloud) | Managed PostgreSQL + pgvector + Auth + Storage; eliminates self-hosted DB ops |
| Containers | Docker Compose | Local orchestration for FastAPI, Redis, and Celery worker |
| CI/CD | GitHub Actions | Automated linting, testing, building, and security scanning |
| Integration | n8n + Slack | Low-code workflow for Slack-based knowledge base queries |

---

## 5. System Architecture

### 5.1 High-Level Architecture

DocMind follows a modular, **provider-agnostic** architecture with three access points converging on a single FastAPI backend. The backend delegates AI orchestration to a LangGraph agent, which autonomously selects tools based on query intent. The AI provider (Gemini, OpenAI, or Qwen) is configurable via environment variables, enabling cost optimization and vendor flexibility without code changes.

```
Web UI (Next.js)  ─────────────────→ REST API
MCP Client (Claude/Cursor) → MCP Server → REST API
Slack → n8n workflow ──────────────→ REST API
                                        │
                                   FastAPI Backend
                                        │
                              ┌─────────┴─────────┐
                        Supabase Auth        LangGraph Agent
                                                  │
                                           MCP Client (tools)
                                                  │
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              KB Retrieval   Code Exec     Web Search
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
              Supabase DB     Supabase Storage   Redis
            (PostgreSQL +       (file objects)
              pgvector)
```

### 5.2 Data Flow

**Document Ingestion Flow:** User uploads file → FastAPI validates → file stored in Supabase Storage → Celery task dispatched → Text extraction → Chunking (512 tokens, 64 overlap) → Embedding via gemini-embedding-001 → Vectors stored in Supabase DB (pgvector).

**Query Flow:** User sends query (text or image) → LangGraph agent receives → Agent selects tool(s): KB Retrieval (hybrid BM25 + semantic → re-ranking), Web Search, or Code Execution → Configured LLM (Gemini 2.5 Flash by default) generates grounded response → SSE streams answer to client.

### 5.3 Component Layers

| Layer | Components | Responsibility |
|---|---|---|
| Client Layer | Web UI, MCP Clients, Slack | User interaction and query submission |
| API Layer | FastAPI + Supabase Auth | Request routing, authentication, authorization |
| Agent Layer | LangGraph Agent + MCP Client | Intent classification, tool selection, workflow orchestration |
| Tool Layer | KB Retrieval, Code Exec, Web Search | Specialized capabilities exposed as MCP tools |
| Data Layer | Supabase (PostgreSQL + pgvector + Storage), Redis | Persistent storage, vector search, file objects, caching, task queue |

---

## 6. Core Features

### 6.1 Document Processing Pipeline

Upload PDF, Markdown, and TXT files for automatic processing into a searchable knowledge base.

- **Input:** User uploads file via Web UI or API; raw file stored in Supabase Storage.
- **Processing:** Async Celery task handles text extraction, chunking (512 tokens, 64 token overlap), and embedding generation.
- **Storage:** Vectors stored in Supabase DB (PostgreSQL + pgvector) for similarity search.
- **Status tracking:** Document lifecycle: `PENDING → PROCESSING → READY | FAILED`. Users see real-time status in the UI.
- **Validation:** MIME type whitelist, file size limit (50MB), and clear error messages for rejected files.

### 6.2 RAG Query Engine

Natural language question-answering grounded in the user's uploaded documents.

- **Hybrid Search:** Combines BM25 (keyword) and semantic (vector) retrieval for comprehensive coverage.
- **Re-ranking:** Retrieved chunks are re-ranked for relevance before passing to the LLM.
- **Grounded Generation:** LLM (Gemini 2.5 Flash by default) generates answers explicitly grounded in retrieved context with source citations.
- **SSE Streaming:** Responses stream to the client in real-time via Server-Sent Events.

### 6.3 LangGraph Agent

Stateful AI agent that orchestrates multi-step workflows with autonomous tool selection.

- **Workflow Graph:** Conditional branching based on query intent — the agent decides whether to retrieve from KB, search the web, or execute code.
- **Tool Selection:** Agent autonomously selects one or more tools per query based on intent classification.
- **Retry & Fallback:** Structured retry logic on tool failures; graceful fallback to alternative tools.
- **State Management:** Conversation state maintained across multi-turn interactions.

### 6.4 MCP Server Integration

Expose knowledge base capabilities as MCP tools for external AI clients.

- **Tools Exposed:** Retrieval, web search, and code execution available via standard MCP protocol.
- **Client Compatibility:** Claude Desktop, Cursor, and any MCP-compatible client can connect.
- **Protocol:** Industry-standard MCP Python SDK for reliable interoperability.

### 6.5 Image Input (Multi-Modal)

Accept image inputs alongside text queries for a multi-modal experience.

- **Image Processing:** Gemini 2.5 Flash (built-in vision) extracts content from whiteboard photos, diagrams, and screenshots — no separate vision API required.
- **RAG Integration:** Extracted text enters the same RAG pipeline as document content.
- **Use Case:** Student photographs a whiteboard diagram and asks the agent to explain it using uploaded lecture notes.

### 6.6 n8n + Slack Integration

Enable team members to query the shared knowledge base directly from Slack.

- **Trigger:** Slack message triggers n8n workflow via webhook.
- **Processing:** n8n sends HTTP request to FastAPI backend with query payload.
- **Response:** Answer posted back to the Slack channel. No code required on the n8n side.

---

## 7. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| Performance | Document processing time (upload to searchable) | ≤ 60 seconds for files under 10MB |
| Performance | Query response time (first token) | ≤ 3 seconds for typical queries |
| Performance | Slack query round-trip | ≤ 15 seconds |
| Scalability | Concurrent document uploads | Support 10+ simultaneous uploads via Celery |
| Security | Authentication | Supabase Auth with Google OAuth; all endpoints require valid Supabase JWT |
| Security | Data isolation | Supabase Row Level Security (RLS) policies enforce per-user access at the database level |
| Security | Secrets management | No hardcoded credentials; environment-variable based config for all services including LLM provider selection |
| Reliability | Async task retry | 3 retries with 60s delay; FAILED status on exhaustion |
| Reliability | Graceful degradation | Agent falls back to web search if KB retrieval yields low confidence |
| Quality | RAG evaluation | RAGAS benchmark suite with 30 questions; visualized metrics |
| DevOps | CI/CD pipeline | GitHub Actions: lint, test, build, security scan on every PR |
| DevOps | Containerization | Docker Compose for local services (API, Redis, Worker); Supabase hosted in cloud |

---

## 8. Evaluation Strategy

DocMind uses the RAGAS framework to quantitatively evaluate RAG pipeline quality. A benchmark set of 30 questions with ground-truth answers is maintained for reproducible evaluation.

### 8.1 Metrics

| Metric | Description | Target |
|---|---|---|
| Faithfulness | Is the answer supported by the retrieved context? | ≥ 0.85 |
| Answer Relevancy | Does the answer address the original question? | ≥ 0.80 |
| Context Precision | Are the retrieved chunks relevant to the question? | ≥ 0.75 |
| Context Recall | Are all necessary chunks retrieved? | ≥ 0.70 |

Evaluation results are visualized as charts and tracked across iterations to measure improvement.

---

## 9. Sprint Plan

### 9.1 Sprint 1: Core Infrastructure

Focus: Build the foundational document pipeline, authentication, and basic query functionality.

| Issue | Feature | Priority | Estimate |
|---|---|---|---|
| #1 | Project scaffolding (FastAPI + Next.js + Supabase + Docker Compose) | Must Have | 3 pts |
| #2 | Supabase Auth with Google OAuth + RLS policies | Must Have | 3 pts |
| #3 | Document upload (Supabase Storage) and async processing pipeline | Must Have | 8 pts |
| #4 | Supabase pgvector schema and vector store service | Must Have | 5 pts |
| #5 | Basic RAG query endpoint with hybrid search | Must Have | 8 pts |
| #6 | Document management UI (upload, list, delete) | Must Have | 5 pts |
| #7 | SSE streaming for chat responses | Must Have | 3 pts |

### 9.2 Sprint 2: Agent & Integrations

Focus: Implement the LangGraph agent, MCP server, multi-modal input, and external integrations.

| Issue | Feature | Priority | Estimate |
|---|---|---|---|
| #8 | LangGraph agent with conditional tool selection | Must Have | 8 pts |
| #9 | MCP Server exposing retrieval, search, code exec tools | Should Have | 5 pts |
| #10 | Image input via Gemini 2.5 Flash vision | Should Have | 5 pts |
| #11 | n8n + Slack integration workflow | Should Have | 3 pts |
| #12 | RAGAS evaluation suite and benchmark set | Could Have | 5 pts |
| #13 | Code execution sandbox tool | Could Have | 5 pts |

---

## 10. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Gemini API rate limits or free tier quota exhaustion | High | Medium | Provider-agnostic architecture enables switching to GPT-4o-mini or Qwen-Plus via env config; cache frequent queries in Redis |
| Poor retrieval quality on diverse document types | High | Medium | Hybrid BM25 + semantic search; RAGAS benchmark to measure and iterate |
| Celery worker failures during processing | Medium | Low | `acks_late=True`, max 3 retries, FAILED status visible in UI |
| MCP protocol changes or client incompatibility | Medium | Low | Pin MCP SDK version; integration tests against Claude Desktop and Cursor |
| Scope creep in Sprint 2 features | Medium | High | MoSCoW prioritization; code execution and evaluation are Could Have |
| Supabase free tier limits (500MB DB, 1GB storage) | Medium | Medium | Monitor usage; upgrade to Pro if needed; keep file processing lean |
| Docker Compose complexity for local development | Low | Medium | Provide `docker-compose.dev.yml` with hot reload and clear README setup guide |

---

## 11. Glossary

| Term | Definition |
|---|---|
| **RAG** | Retrieval-Augmented Generation — combining document retrieval with LLM generation for grounded answers |
| **Supabase** | Open-source Backend-as-a-Service providing managed PostgreSQL, Auth, Storage, and Edge Functions |
| **LangGraph** | A framework for building stateful, multi-step AI agent workflows with conditional branching |
| **MCP** | Model Context Protocol — an industry-standard protocol for AI tool integration |
| **pgvector** | A PostgreSQL extension enabling vector similarity search for embedding-based retrieval |
| **RAGAS** | Retrieval-Augmented Generation Assessment — a framework for evaluating RAG pipeline quality |
| **SSE** | Server-Sent Events — a protocol for unidirectional server-to-client streaming |
| **BM25** | A probabilistic ranking function for keyword-based document retrieval |
| **Gemini** | Google's multimodal AI model family; Gemini 2.5 Flash is DocMind's primary LLM with built-in vision and tool-calling |
| **n8n** | An open-source workflow automation tool used for Slack integration |
| **Celery** | A distributed task queue for Python, used for async document processing |
| **RLS** | Row Level Security — PostgreSQL/Supabase feature enforcing per-user data access at the database level |
