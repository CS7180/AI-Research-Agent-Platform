# DocMind — AI Research Agent Platform

DocMind is a full-stack AI-powered research agent platform designed for CS students who accumulate lecture slides, research papers, project documents, and course notes across multiple classes but struggle to extract useful information from them quickly. Users upload documents to build a private knowledge base, then query it via text and image inputs through an intelligent LangGraph agent that orchestrates retrieval, web search, and code execution.

## 🚀 Key Features

- **Document Processing Pipeline**: Upload PDFs, Markdown, and TXT files. Async processing extracts text, chunks, and generates vector embeddings automatically.
- **RAG Query Engine**: Hybrid search (BM25 + Semantic) combined with LangGraph provider-agnostic agents (supports Gemini, OpenAI, Qwen) to generate grounded responses with citations.
- **Multi-Modal Support**: Leverages Gemini 2.5 Flash native vision capabilities to analyze whiteboard photos and diagrams as part of the RAG pipeline.
- **Agentic Workflow**: Intelligent tool selection, dynamically routing between Knowledge Base Retrieval, Web Search fallbacks, and Code Execution.
- **Multiple Entry Points**: Accessible via a Next.js Web UI, an MCP Server (for Cursor/Claude integration), and Slack (via n8n workflows).
- **Secure & Private**: Powered by Supabase Auth and Row Level Security (RLS) to ensure per-user data isolation.

## 🛠️ Tech Stack

### Backend
- **Framework**: Python FastAPI
- **Agent Orchestration**: LangGraph + LangChain
- **Database & Storage**: Supabase (PostgreSQL + pgvector + Storage)
- **Task Queue**: Celery + Redis
- **Evaluation**: RAGAS

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Streaming**: Server-Sent Events (SSE)

## 📁 Project Structure

```text
AI-Research-Agent-Platform/
├── backend/               # FastAPI application, LangGraph agent, and Celery workers
├── frontend/              # Next.js web interface
├── backend/mcp_server/     # Model Context Protocol server for AI IDE/client integration
├── docker-compose.yml     # Production services orchestration
├── docker-compose.dev.yml # Local development orchestration with hot-reloading
├── docs/api/              # OpenAPI spec + Swagger UI static viewer
└── .agents/rules.md       # Project conventions and AI-assistant guardrails
```

## 💻 Getting Started (Local Development)

### 1. Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+ (We use `uv` for ultra-fast dependency management: `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Supabase Project (Get your keys from the dashboard)
- Google Gemini API Key (or OpenAI/Qwen depending on configuration)

### 2. Environment Setup

Copy the environment templates and fill in your keys:

```bash
# Backend (.env)
cp backend/.env.example backend/.env

# Frontend (.env)
cp frontend/.env.example frontend/.env.local
```

### 3. Run the Backend (Docker or Local)

#### Option A: Docker Compose (Easiest)
Start the FastAPI backend, Celery worker, and Redis queue using Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up --build
```
The API will be available at `http://localhost:8000`.

#### Option B: Local Development (Using `uv`)
Navigate to the backend directory, sync dependencies, and start the development server:
```bash
cd backend
uv sync --all-extras
uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

### 4. Run the Frontend (Next.js)

In a new terminal, navigate to the frontend directory, install dependencies, and start the Next.js development server:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## 📚 API Documentation

- OpenAPI spec: `docs/api/openapi.yaml`
- Human-friendly Swagger UI: open `docs/api/index.html` (it loads `openapi.yaml`)

## 🤖 Switching LLM Providers / Models

The backend LLM is configured via `backend/.env`:

- `LLM_PROVIDER` / `LLM_MODEL` control the chat model used for answering.
- `EMBEDDING_PROVIDER` / `EMBEDDING_MODEL` control embeddings (changing this typically requires re-embedding existing documents).

## 🧪 Evaluation

DocMind uses the RAGAS framework to quantitatively evaluate RAG pipeline quality. A benchmark set of 30 questions with ground-truth answers ensures we meet our target metrics:
- Faithfulness ≥ 0.85
- Answer Relevancy ≥ 0.80
- Context Precision ≥ 0.75
- Context Recall ≥ 0.70

## ✅ Local Checks (Recommended)

We recommend installing `pre-commit` hooks so formatting/lint failures are caught before CI:

```bash
pre-commit install
pre-commit install --hook-type pre-push
pre-commit run --all-files
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
