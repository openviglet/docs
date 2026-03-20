---
sidebar_position: 5
title: Tool Calling
description: Native tool calling capabilities available to AI Agents in Turing ES — 27 tools across 7 categories.
---

# Tool Calling

A **Tool Calling** is a function that the LLM can invoke autonomously during a conversation to retrieve information or perform an action. Instead of relying purely on training data, the LLM calls tools to fetch live data, search indexed content, execute code, and more — then incorporates the results into its reasoning.

Turing ES includes **27 native tools** organized into 7 categories, plus support for external tools via [MCP Servers](./mcp-servers.md). Tools are enabled per [AI Agent](./ai-agents.md) — each agent selects only the tools it needs.

---

## Semantic Navigation — 15 tools

These tools allow the LLM to interact with any Semantic Navigation Site as a structured knowledge source, enabling rich search-based reasoning over your indexed content.

| Tool | Description |
|---|---|
| `list_sites` | Lists all available SN Sites with their locales |
| `get_site_fields` | Returns valid facet fields for filtering a specific site |
| `get_valid_filter_values` | Returns valid values for a specific filter or facet |
| `search_site` | Searches a site and returns compact results (ID, title, URL, snippet) |
| `get_document_details` | Retrieves full text and metadata of a document by ID |
| `get_search_suggestions` | Autocomplete and spelling corrections for a search query |
| `find_similar_documents` | Finds semantically similar documents (More Like This) |
| `get_aggregated_stats` | Calculates totals and distributions by category via facet aggregation |
| `get_document_highlights` | Extracts snippets from a document where search terms appear |
| `compare_items` | Compares specific fields of two or more documents side by side |
| `search_recent_updates` | Retrieves the most recently updated content on a topic |
| `get_facet_summary` | Statistical summary of all available categories and attributes |
| `search_by_date_range` | Searches documents within a date range |
| `lookup_facet_value` | Searches a term across all facets to find exact values |
| `discover_facet_values` | Splits a phrase into words and searches across all facets |

---

## RAG / Knowledge Base — 4 tools

These tools enable the LLM to query the **Knowledge Base** — files indexed from MinIO via the [Assets](./assets.md) section — using semantic similarity search.

| Tool | Description |
|---|---|
| `search_knowledge_base` | Searches for relevant documents by semantic similarity (top 10, threshold 0.7) |
| `knowledge_base_stats` | Returns statistics: total files, chunks, and storage size |
| `list_knowledge_base_files` | Lists all indexed files, with optional keyword filter |
| `get_file_from_knowledge_base` | Retrieves the full indexed content of a specific file |

---

## Web Crawler — 2 tools

| Tool | Description |
|---|---|
| `fetch_webpage` | Fetches a web page by URL and returns its content as plain text |
| `extract_links` | Extracts all links from a web page, with optional keyword filter |

---

## Finance — 2 tools

| Tool | Description |
|---|---|
| `get_stock_quote` | Current price and market data for a stock ticker symbol |
| `search_ticker` | Looks up a ticker symbol by company name or keyword |

---

## Weather — 1 tool

| Tool | Description |
|---|---|
| `get_weather` | Current weather and forecast for a city (1–7 day range) |

---

## Image Search — 1 tool

| Tool | Description |
|---|---|
| `search_images` | Searches the web for images and returns URLs and descriptions |

---

## DateTime — 1 tool

| Tool | Description |
|---|---|
| `get_current_time` | Returns the current date and time for a given IANA timezone |

---

## Code Interpreter — 1 tool

| Tool | Description |
|---|---|
| `execute_python` | Executes Python code in a sandboxed environment and returns stdout/stderr |

The Code Interpreter runs Python in an isolated sandbox directory with a **30-second execution timeout**. It supports:

- Standard output capture
- Matplotlib chart generation (with `Agg` backend — no display required)
- Automatic `print()` wrapping for bare expressions

The Python executable path is configured in **Administration → Settings → Python Path**.

---

## External Tools via MCP Servers

Beyond the 27 native tools, AI Agents can access tools from any external server implementing the **Model Context Protocol (MCP)**. This covers company-internal systems, proprietary data APIs, and the growing ecosystem of public MCP servers.

See [MCP Servers](./mcp-servers.md) for configuration details.

---

## Related Pages

| Page | Description |
|---|---|
| [AI Agents](./ai-agents.md) | How to compose agents with the tools they need |
| [MCP Servers](./mcp-servers.md) | Extend agents with external tools via MCP |
| [Assets](./assets.md) | Knowledge Base files queried by RAG tools |
| [Semantic Navigation](./semantic-navigation.md) | The search experience powering SN tool callings |

---

*Previous: [Embedding Stores & Models](./embedding-stores.md) | Next: [MCP Servers](./mcp-servers.md)*
