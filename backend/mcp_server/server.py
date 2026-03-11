"""DocMind MCP Server — expose KB retrieval as MCP tools.

This server allows external MCP clients (Cursor, Claude Desktop,
custom integrations) to query a user's knowledge base directly.

Usage:
    python -m mcp_server.server
"""

from __future__ import annotations

import asyncio
import logging
import os

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

logger = logging.getLogger(__name__)

# ── Server Setup ─────────────────────────────────────────────────────────────

app = Server("docmind-mcp")


# ── Tool Definitions ─────────────────────────────────────────────────────────


@app.list_tools()
async def list_tools() -> list[Tool]:
    """Expose available MCP tools to clients."""
    return [
        Tool(
            name="search_knowledge_base",
            description=(
                "Search the user's uploaded research documents "
                "(PDFs, notes, papers) using hybrid semantic + "
                "keyword search. Returns the most relevant "
                "passages with source citations."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language search query",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of results (default 5)",
                        "default": 5,
                    },
                },
                "required": ["query"],
            },
        ),
        Tool(
            name="list_documents",
            description=(
                "List all documents in the user's knowledge base "
                "with their processing status and metadata."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
    ]


@app.call_tool()
async def call_tool(
    name: str,
    arguments: dict,
) -> list[TextContent]:
    """Handle MCP tool calls."""
    if name == "search_knowledge_base":
        return await _handle_search(arguments)
    if name == "list_documents":
        return await _handle_list_documents()
    return [TextContent(
        type="text",
        text=f"Unknown tool: {name}",
    )]


async def _handle_search(
    arguments: dict,
) -> list[TextContent]:
    """Execute KB search and return formatted results."""
    from app.api.dependencies import get_supabase_client
    from app.services.retrieval import retrieve

    query = arguments.get("query", "")
    top_k = arguments.get("top_k", 5)
    user_id = os.environ.get("MCP_USER_ID", "")

    if not user_id:
        return [TextContent(
            type="text",
            text="Error: MCP_USER_ID env var not set.",
        )]

    supabase = get_supabase_client()
    chunks = await retrieve(supabase, query, user_id, top_k=top_k)

    if not chunks:
        return [TextContent(
            type="text",
            text=f"No results found for: '{query}'",
        )]

    parts: list[str] = []
    for i, chunk in enumerate(chunks, 1):
        doc_id = chunk.get("document_id", "unknown")
        content = chunk.get("content", "")[:500]
        score = chunk.get("rrf_score", chunk.get("similarity", 0))
        parts.append(
            f"**[Result {i}]** (doc: {doc_id}, "
            f"score: {score:.3f})\n{content}"
        )

    return [TextContent(
        type="text",
        text="\n\n---\n\n".join(parts),
    )]


async def _handle_list_documents() -> list[TextContent]:
    """List all user documents."""
    from app.api.dependencies import get_supabase_client
    from app.services.document import list_documents

    user_id = os.environ.get("MCP_USER_ID", "")
    if not user_id:
        return [TextContent(
            type="text",
            text="Error: MCP_USER_ID env var not set.",
        )]

    supabase = get_supabase_client()
    docs = await list_documents(supabase, user_id)

    if not docs:
        return [TextContent(
            type="text",
            text="No documents in knowledge base.",
        )]

    lines = [
        f"- **{d['filename']}** | "
        f"{d.get('mime_type', '?')} | "
        f"{d.get('status', '?')} | "
        f"{d.get('file_size_bytes', 0) / 1024:.1f} KB"
        for d in docs
    ]
    return [TextContent(
        type="text",
        text="## Documents\n" + "\n".join(lines),
    )]


# ── Entry Point ──────────────────────────────────────────────────────────────


async def main() -> None:
    """Run the MCP server via stdio transport."""
    logger.info("Starting DocMind MCP server")
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options(),
        )


if __name__ == "__main__":
    asyncio.run(main())
