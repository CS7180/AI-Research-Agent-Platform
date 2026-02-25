"""MCP Server entry point.

Exposes DocMind capabilities (KB retrieval, web search, code execution)
as standard MCP tools for external AI clients (Claude Desktop, Cursor).

# TODO(#9): Implement MCP tool handlers.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def main() -> None:
    """Start the MCP server.

    # TODO(#9): Initialize MCP server with tool definitions.
    """
    logger.info("DocMind MCP Server starting — tools: retrieval, web_search, code_exec")
    raise NotImplementedError("MCP Server not yet implemented (Issue #9).")


if __name__ == "__main__":
    main()
