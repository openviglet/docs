---
sidebar_position: 5
title: Tool Calling
description: Native tool calling capabilities available to AI Agents in Turing ES — DSL-based search tools, RAG, web crawling, and more.
---

# Tool Calling

A **Tool Calling** is a function that the LLM can invoke autonomously during a conversation to retrieve information or perform an action. Instead of relying purely on training data, the LLM calls tools to fetch live data, search indexed content, execute code, and more — then incorporates the results into its reasoning.

Turing ES includes native tools organized into categories, plus support for external tools via [MCP Servers](./mcp-servers.md). Tools are enabled per [AI Agent](./ai-agents.md) — each agent selects only the tools it needs.

---

## DSL Search — 6 tools

These tools provide **Elasticsearch-compatible Query DSL** access to any Semantic Navigation Site. Inspired by the [Elasticsearch MCP Server](https://github.com/elastic/mcp-server-elasticsearch), they allow the LLM to build and execute full DSL queries, aggregations, and analytics — automatically translated to the site's configured search engine (Elasticsearch, Solr, or Lucene).

| Tool | Description |
|---|---|
| `dsl_list_indices` | Lists all available SN Sites with engine type, locales, and status |
| `dsl_get_mappings` | Returns field mappings (types, facets, multi-valued) in Elasticsearch format |
| `dsl_search` | Executes a full Elasticsearch Query DSL search (40 query types, 35 aggregations) |
| `dsl_get_document` | Retrieves a document by ID with all stored fields |
| `dsl_suggest` | Autocomplete suggestions and spell-check corrections |
| `dsl_get_shards` | Shard/core information: document counts, engine type, endpoints, locales |

### How the LLM uses DSL tools

The LLM follows a pattern similar to how a developer uses the Elasticsearch API:

1. **Discover** → `dsl_list_indices("*")` to find available sites
2. **Understand schema** → `dsl_get_mappings("mySite")` to see fields and types
3. **Search** → `dsl_search("mySite", "en", queryBody)` with full DSL
4. **Deep dive** → `dsl_get_document("mySite", "en", "doc-123")` for full content
5. **Correct typos** → `dsl_suggest("mySite", "en", "enterprse")` for corrections

### The `dsl_search` tool

This is the most powerful tool. The `queryBody` parameter accepts the complete Elasticsearch `_search` request body as a JSON string. The LLM constructs the query based on the user's intent:

**Simple search:**
```json
{"query":{"match":{"title":"machine learning"}},"size":5}
```

**Filtered search with aggregations:**
```json
{
  "query":{"bool":{"must":[{"match":{"title":"security"}}],"filter":[{"term":{"type":"article"}}]}},
  "size":10,
  "aggs":{"by_author":{"terms":{"field":"author","size":5}}},
  "highlight":{"fields":{"title":{},"body":{}}}
}
```

**Date range with sorting:**
```json
{
  "query":{"range":{"date":{"gte":"2025-01-01"}}},
  "sort":[{"date":"desc"}],
  "size":20
}
```

**Similar documents (More Like This):**
```json
{"query":{"more_like_this":{"fields":["title","body"],"like":"enterprise search platform","min_term_freq":1}}}
```

**Facet value discovery (terms aggregation):**
```json
{"query":{"match_all":{}},"size":0,"aggs":{"categories":{"terms":{"field":"category","size":50}}}}
```

For the complete DSL reference, see [DSL Query API](./dsl-query.md) and [DSL Compatibility Matrix](./dsl-compatibility.md).

### Prompt examples

- *"Search for documents about authentication in the Sample site"* → `dsl_search` with `match` query
- *"What fields can I filter by on the Sample site?"* → `dsl_get_mappings`
- *"Show me the full content of document ID abc-123"* → `dsl_get_document`
- *"How many documents do we have per content type?"* → `dsl_search` with `terms` aggregation
- *"Find documents similar to the article about Solr configuration"* → `dsl_search` with `more_like_this`
- *"What articles were updated in the last 7 days about security?"* → `dsl_search` with `range` + `sort`
- *"Compare the features of Product A and Product B"* → `dsl_get_document` called for each product
- *"What categories are available?"* → `dsl_search` with `size:0` and `terms` aggregation
- *"How many documents per locale does the site have?"* → `dsl_get_shards`

---

## RAG / Knowledge Base — 4 tools

These tools enable the LLM to query the **Knowledge Base** — files indexed from MinIO via the [Assets](./assets.md) section — using semantic similarity search.

| Tool | Description |
|---|---|
| `search_knowledge_base` | Searches for relevant documents by semantic similarity (top 10, threshold 0.7) |
| `knowledge_base_stats` | Returns statistics: total files, chunks, and storage size |
| `list_knowledge_base_files` | Lists all indexed files, with optional keyword filter |
| `get_file_from_knowledge_base` | Retrieves the full indexed content of a specific file |

**Prompt examples:**

- *"What does our internal documentation say about deployment procedures?"* → triggers `search_knowledge_base`
- *"How many files are indexed in the knowledge base?"* → triggers `knowledge_base_stats`
- *"Show me the full content of the file onboarding-guide.pdf"* → triggers `list_knowledge_base_files` then `get_file_from_knowledge_base`

---

## Web Crawler — 2 tools

| Tool | Description |
|---|---|
| `fetch_webpage` | Fetches a web page by URL and returns its content as plain text |
| `extract_links` | Extracts all links from a web page, with optional keyword filter |

**Prompt examples:**

- *"What does the Apache Solr documentation say about faceted search?"* → triggers `fetch_webpage`
- *"List all links on our company blog homepage"* → triggers `extract_links`

---

## Finance — 2 tools

| Tool | Description |
|---|---|
| `get_stock_quote` | Current price and market data for a stock ticker symbol |
| `search_ticker` | Looks up a ticker symbol by company name or keyword |

**Prompt examples:**

- *"What is the current stock price of Apple?"* → triggers `search_ticker` then `get_stock_quote`
- *"Show me the market data for MSFT"* → triggers `get_stock_quote`

---

## Weather — 1 tool

| Tool | Description |
|---|---|
| `get_weather` | Current weather and forecast for a city (1–7 day range) |

**Prompt examples:**

- *"What's the weather forecast for São Paulo this week?"* → triggers `get_weather`

---

## Image Search — 1 tool

| Tool | Description |
|---|---|
| `search_images` | Searches the web for images and returns URLs and descriptions |

**Prompt examples:**

- *"Find images of enterprise search architecture diagrams"* → triggers `search_images`

---

## DateTime — 1 tool

| Tool | Description |
|---|---|
| `get_current_time` | Returns the current date and time for a given IANA timezone |

**Prompt examples:**

- *"What time is it right now in Tokyo?"* → triggers `get_current_time`

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

**Prompt examples:**

- *"Calculate the compound interest on $10,000 at 5% for 10 years"* → triggers `execute_python`
- *"Generate a bar chart showing monthly sales: Jan=100, Feb=150, Mar=120"* → triggers `execute_python` with matplotlib

---

## External Tools via MCP Servers

Beyond the native tools, AI Agents can access tools from any external server implementing the **Model Context Protocol (MCP)**. This covers company-internal systems, proprietary data APIs, and the growing ecosystem of public MCP servers.

See [MCP Servers](./mcp-servers.md) for configuration details.

---

## Related Pages

| Page | Description |
|---|---|
| [AI Agents](./ai-agents.md) | How to compose agents with the tools they need |
| [MCP Servers](./mcp-servers.md) | Extend agents with external tools via MCP |
| [DSL Query API](./dsl-query.md) | Full reference for the Elasticsearch-compatible DSL |
| [DSL Compatibility Matrix](./dsl-compatibility.md) | Engine compatibility for all DSL features |
| [Assets](./assets.md) | Knowledge Base files queried by RAG tools |
| [Semantic Navigation](./semantic-navigation.md) | The search experience powering DSL tools |

---
