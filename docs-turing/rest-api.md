---
sidebar_position: 6
title: REST API Reference
description: REST API endpoints for Semantic Navigation search, autocomplete, spell check, and more.
---

# REST API Reference

Turing ES exposes a REST API for integrating search and AI capabilities into any application. All endpoints use **JSON**. Public endpoints (search, chat, autocomplete) require no authentication. Administrative endpoints require a `Key` header.

For authentication details, see [Authentication](./security-authentication.md). For the interactive API explorer, visit `http://localhost:2700/swagger-ui.html`.

---

## Authentication

Protected endpoints require an **API Token** in the `Key` request header:

```
Key: <YOUR_API_TOKEN>
```

Create tokens in **Administration → API Tokens**. See [Authentication](./security-authentication.md) for step-by-step instructions.

**Example, authenticated API call:**

```bash
curl "http://localhost:2700/api/sn/Sample/search?q=cloud&_setlocale=en_US" \
  -H "Key: <YOUR_API_TOKEN>" \
  -H "Accept: application/json"
```

### Public Endpoints (no authentication required)

Certain endpoints are publicly accessible, allowing client applications to perform searches and chat without managing sessions:

| Endpoint | Purpose |
|---|---|
| `GET /api/sn/*/search` | Semantic Navigation search |
| `POST /api/sn/*/search/query` | Semantic Navigation search, JSON body ([POST-native search](#post-native-search)) |
| `POST /api/sn/*/search/list/query` | Select-list projection, JSON body |
| `GET /api/sn/*/chat` | GenAI chat on an SN Site |
| `GET /api/sn/*/ac` | Autocomplete |
| `POST /api/sn/*/ac/query` | Autocomplete, JSON body |
| `POST /api/genai/chat` | Direct GenAI chat |
| `POST /api/ocr/**` | OCR text extraction |
| `POST /api/v2/integration/**` | External integration endpoints |
| `GET /api/v2/guest/**` | Guest access endpoints |
| `POST /graphql` | GraphQL queries |
| `GET /api/login` | Login endpoint |

All other endpoints require authentication, including the full administration API, user management, site configuration, and AI Agent management.

---

## OpenAPI & Swagger

Explore and test every endpoint interactively:

| Interface | URL |
|---|---|
| **Swagger UI** | `http://localhost:2700/swagger-ui.html` |
| **OpenAPI 3.0 spec** | `http://localhost:2700/v3/api-docs` |

---

## Semantic Navigation API

### Search

The core search endpoint. Returns results, facets, spotlights, spell-check suggestions, and pagination.

```
GET  http://localhost:2700/api/sn/{siteName}/search
POST http://localhost:2700/api/sn/{siteName}/search
```

**Query Parameters (GET):**

| Parameter | Required | Description |
|---|---|---|
| `q` | ✅ | Search query |
| `_setlocale` | ✅ | Locale code (e.g., `en_US`, `pt_BR`) |
| `p` | | Page number (default: `1`) |
| `rows` | | Results per page (overrides site default) |
| `sort` | | Sort field and direction (e.g., `date desc`) |
| `fq[]` | | Filter query: apply a facet filter (e.g., `fq[]=type:news`) |
| `group` | | Group results by a field value |

**Example (GET):**

```bash
curl "http://localhost:2700/api/sn/Sample/search?q=enterprise+search&p=1&_setlocale=en_US&rows=10" \
  -H "Accept: application/json"
```

#### Search Response Structure

The search response is a **self-describing navigational JSON**: every link a user might follow (apply a filter, remove a filter, paginate, filter by metadata) is pre-built and ready to use. The front-end does not need to construct query strings or manage filter state.

```json
{
  "pagination": [
    { "type": "CURRENT", "text": "1", "href": "...", "page": 1 },
    { "type": "NEXT",    "text": "Next", "href": "...", "page": 2 }
  ],
  "queryContext": {
    "count": 42,
    "index": "Sample",
    "limit": 10,
    "offset": 0,
    "page": 1,
    "pageCount": 5,
    "pageEnd": 10,
    "pageStart": 1,
    "responseTime": 23,
    "query": { ... },
    "defaultFields": { ... },
    "facetType": "AND",
    "facetItemType": "AND"
  },
  "results": {
    "document": [
      {
        "source": "TURING",
        "elevate": false,
        "fields": { "title": "...", "url": "...", ... },
        "metadata": [
          { "name": "type", "values": [ { "label": "article", "link": "..." } ] }
        ]
      }
    ]
  },
  "widget": {
    "facet": [ ... ],
    "secondaryFacet": [ ... ],
    "facetToRemove": { ... },
    "similar": [ ... ],
    "spellCheck": { ... },
    "spotlights": [ ... ],
    "locales": [ ... ],
    "cleanUpFacets": "...",
    "selectedFilterQueries": [ ... ]
  },
  "groups": [ ... ]
}
```

**Top-level sections:**

| Section | Description |
|---|---|
| **pagination** | Pre-built page links (`FIRST`, `PREVIOUS`, `CURRENT`, `NEXT`, `LAST`), the front-end follows them directly |
| **queryContext** | Result count, page info, response time, active facet operators, and default field mappings |
| **results.document** | Array of matched documents. Each contains `fields` (all indexed values), `metadata` (facet values with pre-built filter links), `source`, and `elevate` flag |
| **widget.facet** | Primary facet groups with counts and pre-built filter/clear links per value. Enabled by `Facet = true` |
| **widget.secondaryFacet** | Separate facet groups for fields promoted to Secondary Facet, independent from `facet`, for different UI treatment (e.g., tabs) |
| **widget.similar** | More Like This results. Enabled by `MLT = true` |
| **widget.spellCheck** | Spelling correction with `original`, `corrected` text, and `usingCorrectedText` flag. Enabled by `Spell Check = true` |
| **widget.spotlights** | Curated documents injected at configured positions when the query matches a spotlight term |
| **widget.locales** | All configured locales with pre-built links: use as valid values for `_setlocale` |
| **widget.cleanUpFacets** | Pre-built link to clear all active facet filters |
| **groups** | Grouped results when the `group` parameter is used |

**Self-describing navigation** operates at three levels:

1. **Facet navigation**: Each facet value carries pre-built links for applying, removing, or clearing filters
2. **Document metadata navigation**: Each result's metadata values carry filter links (e.g., click a `type:article` tag to filter all articles)
3. **Pagination**: Next/previous/specific page links are included; no offset calculation needed

A Turing ES search UI can be built as a **pure rendering layer**: render results, facets, tags, pagination, and locale switchers directly from the response. Adding a new facet to the SN Site configuration propagates automatically, with no client code changes.

**Locale selection:**

```
GET /api/sn/{siteName}/search?q=annual+report&_setlocale=pt_BR
```

#### POST Body Parameters

The POST endpoint accepts the same query parameters plus additional fields in the JSON body:

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | User identifier (for metrics and latest searches) |
| `query` | `string` | Search query (alternative to `q` query param) |
| `locale` | `string` | Locale code (alternative to `_setlocale` query param) |
| `page` | `integer` | Page number |
| `rows` | `integer` | Results per page |
| `sort` | `string` | Sort field and direction |
| `group` | `string` | Group results by field |
| `fq` | `string[]` | Filter queries |
| `fqAnd` | `string[]` | AND filter queries |
| `fqOr` | `string[]` | OR filter queries |
| `fqOperator` | `string` | Filter query operator between facets |
| `fqItemOperator` | `string` | Filter query operator within facet values |
| `fieldList` | `string[]` | Restrict which fields are returned |
| `disableAutoComplete` | `boolean` | Disable autocomplete suggestions (default: `false`) |
| `populateMetrics` | `boolean` | Enable search metrics recording (default: `true`) |
| `targetingRules` | `string[]` | Targeting rules: see [Targeting Rules](./semantic-navigation.md#targeting-rules) |
| `targetingRulesWithCondition` | `map` | Targeting rules with conditions |
| `targetingRulesWithConditionAND` | `map` | Targeting rules with AND conditions |
| `targetingRulesWithConditionOR` | `map` | Targeting rules with OR conditions |

**Example (POST with targeting rules):**

```bash
curl -X POST "http://localhost:2700/api/sn/Sample/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "benefits",
    "locale": "en_US",
    "rows": 10,
    "targetingRules": ["department:HR", "department:Finance"]
  }'
```

For the full Targeting Rules reference (rule types, Solr query generation, fallback clause, and practical examples) see [Semantic Navigation → Targeting Rules](./semantic-navigation.md#targeting-rules).

---

### POST-native search {#post-native-search}

`POST /api/sn/{siteName}/search` above is the **authenticated** endpoint: it accepts
the impersonation fields (`userId`, `populateMetrics`, the conditional targeting
maps) and returns `401` without a principal.

For public, client-side search there is a second, **anonymous** POST endpoint that
takes a clean read-only JSON body:

```
POST http://localhost:2700/api/sn/{siteName}/search/query
```

Use it when a filter value can contain a character that means something in a query
string — `&`, `=`, `+`, `#`, `%` or a space. A JSON body has no query-string
grammar, so a value like `section:RAG & Chat` cannot be mis-read as query
structure. Nothing is deprecated: `GET /search` and its links stay, and are still
the right choice for deep-linkable, bookmarkable, SEO-crawlable and no-JS search
pages.

| Field | Type | Description |
|---|---|---|
| `q` (alias `query`) | `string` | Search query (default `*`) |
| `locale` | `string` | Locale code, e.g. `en_US` |
| `page` (alias `p`) | `integer` | Page number (default `1`) |
| `rows` | `integer` | Results per page |
| `sort` | `string` | `relevance`, `newest`, `oldest` or a custom sort name |
| `group` | `string` | Group results by field |
| `fq` / `fqAnd` / `fqOr` | `string[]` | Filter queries, each a raw `field:value` |
| `fqOperator` / `fqItemOperator` | `string` | Operators between / within facet groups |
| `fieldList` (alias `fl`) | `string[]` | Restrict which fields are returned |
| `targetingRules` | `string[]` | Targeting rules (no conditional maps — read-only) |
| `autoCorrectionDisabled` | `boolean` | Skip spelling auto-correction (default `true`) |
| `responseFormat` | `string` | `LINKS` (default) or `STRUCTURED` — see below |

The endpoint is anonymous and **CSRF-exempt**, so a browser client needs no
`/csrf` priming round-trip.

```bash
curl -X POST "http://localhost:2700/api/sn/Sample/search/query"   -H "Content-Type: application/json"   -d '{
    "q": "chat",
    "locale": "en_US",
    "fq": ["section:RAG & Chat"],
    "responseFormat": "STRUCTURED"
  }'
```

#### The `STRUCTURED` response

`responseFormat: "LINKS"` (the default) returns the same link-bearing body as the
GET endpoint, so a client can move to POST without changing how it reads the
response.

`responseFormat: "STRUCTURED"` returns a **link-free** body instead. The contract
is: *take the echoed `request`, apply one structured change, send it back.*

```json
{
  "request": { "q": "chat", "page": 1, "locale": "en_US", "fq": ["section:RAG & Chat"] },
  "queryContext": { "count": 42 },
  "results": { "document": [] },
  "pagination": [
    { "type": "CURRENT", "text": "1", "page": 1, "current": true },
    { "type": "NEXT",    "text": "Next", "page": 2, "current": false }
  ],
  "facets": [
    {
      "name": "section",
      "label": "Section",
      "multiValued": true,
      "clearFilterQueries": ["section:RAG & Chat"],
      "items": [
        {
          "field": "section",
          "value": "RAG & Chat",
          "filterQuery": "section:RAG & Chat",
          "label": "RAG & Chat",
          "count": 12,
          "selected": true,
          "action": "REMOVE"
        }
      ]
    }
  ],
  "selectedFilterQueries": ["section:RAG & Chat"],
  "spellCheck": { "correctedText": false, "usingCorrectedText": false },
  "locales": [{ "locale": "en_US", "selected": true }]
}
```

Every navigation that used to be a URL is now a value to put on the next request:

| Instead of following… | Do this |
|---|---|
| a facet item's `link` | apply `item.action` (`ADD` / `REMOVE` / `REPLACE`) to `request.fq` using `item.filterQuery` |
| a facet's `cleanUpLink` | remove `facet.clearFilterQueries` from `request.fq` |
| the widget's `cleanUpFacets` | clear `request.fq` (see `selectedFilterQueries`) |
| a pagination `href` | set `request.page = page.page` |
| a locale `link` | set `request.locale` |
| a spell-check `link` | set `request.q = spellCheck.correctedTextValue` |

Both JavaScript SDKs do this for you — see
[`@viglet/turing-sdk`](./javascript-sdk.md) (`toggleFacet`, `clearFacet`,
`clearAllFilters`, `goToPage`, `applySpellCheck`) and
[`@viglet/turing-react-sdk`](./react-sdk.md).

#### Autocomplete and select-list over POST

The same body works on the other two read endpoints, so a whole search surface can
be POST-only:

```
POST http://localhost:2700/api/sn/{siteName}/ac/query
POST http://localhost:2700/api/sn/{siteName}/search/list/query
```

Both return exactly what their GET counterparts return (a list of suggestions and
a select-list projection). Neither carries links, so `responseFormat` does not
apply to them.

```bash
curl -X POST "http://localhost:2700/api/sn/Sample/ac/query"   -H "Content-Type: application/json"   -d '{ "q": "enter", "locale": "en_US", "rows": 10 }'
```

---

### Auto Complete

Returns suggestions for the given prefix. Ideal for search-as-you-type UIs.

```
GET http://localhost:2700/api/sn/{siteName}/ac
```

| Parameter | Required | Description |
|---|---|---|
| `q` | ✅ | Prefix to complete |
| `_setlocale` | ✅ | Locale |
| `rows` | | Maximum number of suggestions |

**Example:**

```bash
curl "http://localhost:2700/api/sn/Sample/ac?q=enter&_setlocale=en_US"
```

**Response:**

```json
["enterprise", "enterprise search", "enterprise AI", "entries"]
```

A `POST /api/sn/{siteName}/ac/query` variant takes the same JSON body as
[POST-native search](#post-native-search) — use it when a filter narrowing the
suggestions contains a query-string character.

---

### Latest Searches

Returns the most recent search terms for a given user: useful for personalised search history UIs.

```
POST http://localhost:2700/api/sn/{siteName}/search/latest
```

| Parameter | Location | Description |
|---|---|---|
| `q` | Query | Current query |
| `rows` | Query | Max results (default: `5`) |
| `_setlocale` | Query | Locale |
| `userId` | Body (JSON) | User identifier |

**Example:**

```bash
curl -X POST "http://localhost:2700/api/sn/Sample/search/latest?q=cloud&rows=5&_setlocale=en_US" \
  -H "Key: <API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "userId": "user123" }'
```

**Response:**

```json
["cloud computing", "cloud storage", "cloud security"]
```

---

### Search Locales

Lists all configured locales for a Semantic Navigation Site.

```
GET http://localhost:2700/api/sn/{siteName}/search/locales
```

**Response:**

```json
[
  { "locale": "en_US", "link": "/api/sn/Sample/search?_setlocale=en_US" },
  { "locale": "pt_BR", "link": "/api/sn/Sample/search?_setlocale=pt_BR" }
]
```

---

### Spell Check

Corrects a query against the site's indexed vocabulary.

```
GET http://localhost:2700/api/sn/{siteName}/{locale}/spell-check
```

| Parameter | Required | Description |
|---|---|---|
| `q` | ✅ | Text to check |

**Example:**

```bash
curl "http://localhost:2700/api/sn/Sample/en_US/spell-check?q=entirprise"
```

---

## GenAI API

:::note Streaming responses
Both chat endpoints return **Server-Sent Events (SSE)** streams: content is delivered progressively as the model generates it. Clients should consume the response as an event stream rather than waiting for a single JSON payload.
:::

### RAG Chat (SN Site)

Sends a question to the GenAI engine of a Semantic Navigation Site. Returns a streaming SSE response grounded in the site's indexed content.

```
GET http://localhost:2700/api/sn/{siteName}/chat?q={question}
```

**Example:**

```bash
curl "http://localhost:2700/api/sn/Sample/chat?q=What+are+the+main+features?" \
  -H "Key: <YOUR_API_TOKEN>"
```

### AI Agent Chat

Sends a message to a specific AI Agent. Returns a streaming SSE response.

```
POST http://localhost:2700/api/v2/llm/agent/{agentId}/chat
```

**Example:**

```bash
curl -X POST "http://localhost:2700/api/v2/llm/agent/my-agent/chat" \
  -H "Key: <YOUR_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "message": "Summarise the latest quarterly report" }'
```

See [Chat](./chat.md) for the full chat interface documentation.

---

## Token Usage API

Returns token consumption statistics for a given month.

```
GET http://localhost:2700/api/v2/llm/token-usage?month=YYYY-MM
```

**Example:**

```bash
curl "http://localhost:2700/api/v2/llm/token-usage?month=2025-01" \
  -H "Key: <YOUR_API_TOKEN>"
```

Authentication required. See [Token Usage](./token-usage.md) for details.

---

## Integration API

The Integration API provides a **reverse-proxy** endpoint that forwards requests to a configured external integration instance (e.g., an AEM connector or Web Crawler). All HTTP methods are supported. The proxy validates the target host and path to prevent SSRF attacks.

### Proxy Endpoint

```
GET|POST|PUT|DELETE  http://localhost:2700/api/v2/integration/{integrationId}/**
```

The `{integrationId}` maps to an Integration Instance configured in Administration. The remainder of the path (`**`) is forwarded to the instance's endpoint URL.

**Example:**

```bash
curl -X POST "http://localhost:2700/api/v2/integration/my-aem-instance/index" \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://example.com/content/page.html" }'
```

This endpoint is **public** (no authentication required).

### Integration Instance CRUD (Admin)

Manage integration instances. Authentication required.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/integration` | List all integration instances |
| `GET` | `/api/integration/{id}` | Get an integration instance |
| `POST` | `/api/integration` | Create an integration instance |
| `PUT` | `/api/integration/{id}` | Update an integration instance |
| `DELETE` | `/api/integration/{id}` | Delete an integration instance |
| `GET` | `/api/integration/vendor` | List available integration vendors |

---

## Assets API

Manage files and the RAG Knowledge Base. All endpoints require authentication.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/asset?prefix=` | List files and folders in a prefix (folder) |
| `POST` | `/api/asset` | Upload one or more files (`multipart/form-data`) |
| `GET` | `/api/asset/download?objectName=` | Download a file (`Content-Disposition: attachment`) |
| `GET` | `/api/asset/preview?objectName=` | Preview a file inline (`Content-Disposition: inline`) |
| `GET` | `/api/asset/metadata?objectName=` | Retrieve file metadata (size, type, date) |
| `POST` | `/api/asset/folder?path=` | Create a new folder |
| `DELETE` | `/api/asset?objectName=` | Delete a file or folder |
| `POST` | `/api/asset/train` | Start batch AI Training |
| `GET` | `/api/asset/train/status` | Poll current training status |
| `GET` | `/api/asset/train/records?objectNames=` | Get training timestamps for specific files |

After upload, an asynchronous event triggers AI indexing for each file. When a file is deleted, its embeddings are automatically removed from the vector store.

For full details, see [Assets](./assets.md).

---

## AI Agent API

### Agent Management

Manage AI Agents. Authentication required.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai-agent` | List all agents (ordered by title) |
| `GET` | `/api/ai-agent/structure` | Get empty structure template for a new agent |
| `GET` | `/api/ai-agent/{id}` | Get a specific agent |
| `POST` | `/api/ai-agent` | Create a new agent |
| `PUT` | `/api/ai-agent/{id}` | Update an existing agent |
| `DELETE` | `/api/ai-agent/{id}` | Delete an agent |

### Agent Chat

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v2/ai-agent/{agentId}/chat` | Stream chat response (SSE). Request body: `{ llmInstanceId, messages[] }` |
| `GET` | `/api/v2/ai-agent/{agentId}/chat/context-info` | Get LLM context window size. Query param: `llmInstanceId` |

### Native Tools

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/native-tool` | List all available tool groups with tool names and descriptions |

For full details, see [AI Agents](./ai-agents.md).

---

## Administration API

The following endpoints manage SN Sites, fields, and spotlights. All require authentication via the `Key` header. For full details, explore the Swagger UI at `http://localhost:2700/swagger-ui.html`.

### SN Site Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sn` | List all SN Sites |
| `GET` | `/api/sn/{id}` | Get an SN Site |
| `POST` | `/api/sn` | Create an SN Site |
| `PUT` | `/api/sn/{id}` | Update an SN Site |
| `DELETE` | `/api/sn/{id}` | Delete an SN Site (removes index cores) |
| `GET` | `/api/sn/{id}/monitoring` | Site monitoring status (document count, queue size) |
| `GET` | `/api/sn/{id}/export` | Export an SN Site configuration |
| `GET` | `/api/sn/export` | Export all SN Site configurations |

**Example: list sites:**

```bash
curl "http://localhost:2700/api/sn" \
  -H "Key: <YOUR_API_TOKEN>"
```

### Field Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sn/{snSiteId}/field` | List fields for a site |
| `GET` | `/api/sn/{snSiteId}/field/{id}` | Get a field |
| `POST` | `/api/sn/{snSiteId}/field` | Create a field |
| `PUT` | `/api/sn/{snSiteId}/field/{id}` | Update a field |
| `DELETE` | `/api/sn/{snSiteId}/field/{id}` | Delete a field |

### Spotlight Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sn/{snSiteId}/spotlight` | List spotlights for a site |
| `GET` | `/api/sn/{snSiteId}/spotlight/{id}` | Get a spotlight |
| `POST` | `/api/sn/{snSiteId}/spotlight` | Create a spotlight |
| `PUT` | `/api/sn/{snSiteId}/spotlight/{id}` | Update a spotlight |
| `DELETE` | `/api/sn/{snSiteId}/spotlight/{id}` | Delete a spotlight |

### Intent Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/intent` | List all intents |
| `GET` | `/api/intent/enabled` | List enabled intents (sorted by display order) |
| `GET` | `/api/intent/{id}` | Get an intent with its actions |
| `POST` | `/api/intent` | Create an intent |
| `PUT` | `/api/intent/{id}` | Update an intent |
| `DELETE` | `/api/intent/{id}` | Delete an intent |

For full details, see [Intent](./intent.md).

### Import / Export

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/import` | Import SN Site configurations from a ZIP file |
| `POST` | `/api/sn/import` | Import content (JSON job items) |
| `POST` | `/api/sn/import/zip` | Import content from a ZIP with file attachments |

For full details, see [Import & Export](./import-export.md).

### Logging

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/logging` | Server logs (paginated, filterable) |
| `GET` | `/api/logging/indexing` | Indexing pipeline logs |
| `GET` | `/api/logging/aem` | AEM connector logs |

For full details, see [Logging](./logging.md).

---

## GraphQL API

Turing ES exposes a GraphQL endpoint that provides the same Semantic Navigation search capabilities as the REST API using GraphQL queries. The endpoint is **public** (no authentication required).

```
POST http://localhost:2700/graphql
```

| Query | Description |
|---|---|
| `siteNames` | Returns all configured SN Site names as a string array |
| `siteSearch(siteName, searchParams, locale)` | Performs a search against an SN Site |

An interactive GraphQL IDE is available at `/graphiql` with schema introspection, auto-completion, and query validation.

**Example:**

```bash
curl -X POST "http://localhost:2700/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { siteSearch(siteName: SAMPLE, searchParams: { q: \"enterprise search\", rows: 10 }, locale: \"en_US\") { queryContext { count } results { document { fields { title url } } } } }"
  }'
```

For the full schema reference, query examples, dynamic fields, filter operators, and response types, see **[GraphQL API](./graphql.md)**.

---

## OCR API

Extracts text from documents via OCR. Two endpoints are available, one for file uploads and one for URLs. Both are **public** (no authentication required).

### Extract Text from File

```
POST http://localhost:2700/api/ocr/file
```

Accepts a `multipart/form-data` request with a `file` parameter.

**Example:**

```bash
curl -X POST "http://localhost:2700/api/ocr/file" \
  -F "file=@/path/to/document.pdf"
```

### Extract Text from URL

```
POST http://localhost:2700/api/ocr/url
```

Accepts a JSON body with a `url` field pointing to a remote document.

**Example:**

```bash
curl -X POST "http://localhost:2700/api/ocr/url" \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://example.com/report.pdf" }'
```

Both endpoints return a JSON object containing the extracted text and file metadata.

---

## Related Pages

| Page | Description |
|---|---|
| [Authentication](./security-authentication.md) | How to create and use API Tokens |
| [Semantic Navigation](./semantic-navigation.md) | SN Site configuration and the search response structure |
| [Chat](./chat.md) | Front-end chat interface and GenAI API |
| [AI Agents](./ai-agents.md) | Agent composition, tool selection, and MCP Servers |
| [Assets](./assets.md) | File management and RAG Knowledge Base |
| [Intent](./intent.md) | Chat prompt suggestions API |
| [Import & Export](./import-export.md) | Site configuration and content import |
| [Logging](./logging.md) | Application and indexing log API |
| [Token Usage](./token-usage.md) | Token consumption reporting |

---

