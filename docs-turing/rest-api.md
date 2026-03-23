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

**Example — authenticated API call:**

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
| `GET /api/sn/*/chat` | GenAI chat on an SN Site |
| `GET /api/sn/*/ac` | Autocomplete |
| `POST /api/genai/chat` | Direct GenAI chat |
| `POST /api/ocr/**` | OCR text extraction |
| `POST /api/v2/integration/**` | External integration endpoints |
| `GET /api/v2/guest/**` | Guest access endpoints |
| `POST /graphql` | GraphQL queries |
| `GET /api/login` | Login endpoint |

All other endpoints require authentication — including the full administration API, user management, site configuration, and AI Agent management.

---

## OpenAPI & Swagger

Explore and test every endpoint interactively:

| Interface | URL |
|---|---|
| **Swagger UI** | `http://localhost:2700/swagger-ui.html` |
| **OpenAPI 3.0 spec** | `http://localhost:2700/v3/api-docs` |

---

<div className="page-break" />

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
| `fq[]` | | Filter query — apply a facet filter (e.g., `fq[]=type:news`) |
| `group` | | Group results by a field value |

**Example (GET):**

```bash
curl "http://localhost:2700/api/sn/Sample/search?q=enterprise+search&p=1&_setlocale=en_US&rows=10" \
  -H "Accept: application/json"
```

#### Search Response Structure

The search response is a **self-describing navigational JSON**: every link a user might follow — apply a filter, remove a filter, paginate, filter by metadata — is pre-built and ready to use. The front-end does not need to construct query strings or manage filter state.

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
| **pagination** | Pre-built page links (`FIRST`, `PREVIOUS`, `CURRENT`, `NEXT`, `LAST`) — the front-end follows them directly |
| **queryContext** | Result count, page info, response time, active facet operators, and default field mappings |
| **results.document** | Array of matched documents. Each contains `fields` (all indexed values), `metadata` (facet values with pre-built filter links), `source`, and `elevate` flag |
| **widget.facet** | Primary facet groups with counts and pre-built filter/clear links per value. Enabled by `Facet = true` |
| **widget.secondaryFacet** | Separate facet groups for fields promoted to Secondary Facet — independent from `facet`, for different UI treatment (e.g., tabs) |
| **widget.similar** | More Like This results. Enabled by `MLT = true` |
| **widget.spellCheck** | Spelling correction with `original`, `corrected` text, and `usingCorrectedText` flag. Enabled by `Spell Check = true` |
| **widget.spotlights** | Curated documents injected at configured positions when the query matches a spotlight term |
| **widget.locales** | All configured locales with pre-built links — use as valid values for `_setlocale` |
| **widget.cleanUpFacets** | Pre-built link to clear all active facet filters |
| **groups** | Grouped results when the `group` parameter is used |

**Self-describing navigation** operates at three levels:

1. **Facet navigation** — Each facet value carries pre-built links for applying, removing, or clearing filters
2. **Document metadata navigation** — Each result's metadata values carry filter links (e.g., click a `type:article` tag to filter all articles)
3. **Pagination** — Next/previous/specific page links are included; no offset calculation needed

A Turing ES search UI can be built as a **pure rendering layer** — render results, facets, tags, pagination, and locale switchers directly from the response. Adding a new facet to the SN Site configuration propagates automatically, with no client code changes.

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
| `targetingRules` | `string[]` | Targeting rules — see [Targeting Rules](./semantic-navigation.md#targeting-rules) |
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

For the full Targeting Rules reference — rule types, Solr query generation, fallback clause, and practical examples — see [Semantic Navigation → Targeting Rules](./semantic-navigation.md#targeting-rules).

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

---

### Latest Searches

Returns the most recent search terms for a given user — useful for personalised search history UIs.

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

<div className="page-break" />

## GenAI API

:::note Streaming responses
Both chat endpoints return **Server-Sent Events (SSE)** streams — content is delivered progressively as the model generates it. Clients should consume the response as an event stream rather than waiting for a single JSON payload.
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

<div className="page-break" />

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

<div className="page-break" />

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

**Example — list sites:**

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

<div className="page-break" />

## GraphQL API

Turing exposes a GraphQL endpoint that provides the same Semantic Navigation search capabilities as the REST search API but using GraphQL queries. The endpoint is **public** (no authentication required).

```
POST http://localhost:2700/graphql
```

### Interactive Explorer (GraphiQL)

An interactive GraphQL IDE is available at `/graphiql`. It provides schema introspection, auto-completion, and query validation — ideal for exploring the API and testing queries before integrating them into your application.

### Available Queries

| Query | Description |
|---|---|
| `siteNames` | Returns all configured SN Site names as a string array |
| `siteSearch(siteName, searchParams, locale)` | Performs a search against an SN Site |

### Site Name Enum

Site names are exposed as a **dynamic GraphQL enum** (`TurSNSiteName`) generated from configured sites. Special characters are converted to underscores, and names starting with a number are prefixed with `SITE_`. For example, a site named "My Sample Site" becomes `MY_SAMPLE_SITE`.

### SearchParamsInput

| Field | Type | Default | Description |
|---|---|---|---|
| `q` | `String` | `*` | Search query |
| `rows` | `Int` | Site default | Results per page |
| `p` | `Int` | `1` | Page number |
| `sort` | `String` | `relevance` | Sort field |
| `group` | `String` | | Group results by field |
| `nfpr` | `Int` | `1` | Number of facets per row |
| `fq` | `[String]` | | Filter queries |
| `fqAnd` | `[String]` | | AND filter queries |
| `fqOr` | `[String]` | | OR filter queries |
| `fqOp` | `String` | `NONE` | Filter operator between facets (`AND`, `OR`, `NONE`) |
| `fqiOp` | `String` | `NONE` | Filter operator within facet values |
| `locale` | `String` | | Locale code (e.g., `en_US`) |
| `fl` | `[String]` | | Field list — restrict which fields are returned |

### Response Structure

The response mirrors the REST search structure:

| Field | Type | Description |
|---|---|---|
| `pagination` | `[SearchPagination]` | Page links with `text`, `href`, `page`, `current` |
| `queryContext` | `SearchQueryContext` | Result count, page info, response time, default fields |
| `results` | `SearchResults` | Document list with `numFound`, `start`, and `document` array |
| `groups` | `[SearchGroup]` | Grouped results (when `group` parameter is used) |
| `widget` | `SearchWidget` | Facets, spell check, spotlights, and locale information |

Each document contains `fields` (static: `id`, `title`, `text`, `url`, `date`, `description`, `image` — plus any dynamic fields from the site configuration), `source`, and `metadata`.

:::tip Dynamic fields
The GraphQL schema is **dynamically extended** with custom fields from your SN Site configuration. If your site defines a field called `category`, it will appear as a queryable field in `SearchDocumentFields` alongside the standard fields.
:::

### Examples

**Basic Search:**

```graphql
query BasicSearch {
  siteSearch(
    siteName: SAMPLE
    searchParams: {
      q: "technology"
      rows: 10
      p: 1
      sort: "relevance"
    }
    locale: "en"
  ) {
    queryContext { count, page, pageCount, responseTime }
    results {
      numFound
      document {
        fields { title, text, url, date }
        source
      }
    }
    pagination { text, href, page, current }
  }
}
```

**Search with Filters:**

```graphql
query FilteredSearch {
  siteSearch(
    siteName: SAMPLE
    searchParams: {
      q: "annual report"
      rows: 10
      fq: ["type:article", "department:Finance"]
      fqOp: "AND"
    }
    locale: "en_US"
  ) {
    queryContext { count }
    results {
      document {
        fields { title, url }
      }
    }
    widget {
      facet { label, facetItems { label, count, link } }
    }
  }
}
```

**Grouped Search:**

```graphql
query GroupedSearch {
  siteSearch(
    siteName: SAMPLE
    searchParams: {
      q: "*"
      group: "category"
      rows: 5
    }
    locale: "en_US"
  ) {
    groups {
      name
      count
      results { document { fields { title, url } } }
      pagination { text, page, current }
    }
  }
}
```

**List Available Sites:**

```graphql
query ListSites {
  siteNames
}
```

**cURL Example:**

```bash
curl -X POST "http://localhost:2700/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { siteSearch(siteName: SAMPLE, searchParams: { q: \"enterprise search\", rows: 10 }, locale: \"en_US\") { queryContext { count } results { document { fields { title url } } } } }"
  }'
```

For GraphQL configuration (endpoint path, GraphiQL, CORS), see [Configuration Reference → GraphQL](./configuration-reference.md#graphql).

---

## OCR API

Extracts text from documents via OCR. Two endpoints are available — one for file uploads and one for URLs. Both are **public** (no authentication required).

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

Both endpoints return a `TurFileAttributes` JSON object containing the extracted text and file metadata.

---

## Related Pages

| Page | Description |
|---|---|
| [Authentication](./security-authentication.md) | How to create and use API Tokens |
| [Semantic Navigation](./semantic-navigation.md) | SN Site configuration and the search response structure |
| [Chat](./chat.md) | Front-end chat interface and GenAI API |
| [Intent](./intent.md) | Chat prompt suggestions API |
| [Import & Export](./import-export.md) | Site configuration and content import |
| [Logging](./logging.md) | Application and indexing log API |
| [Token Usage](./token-usage.md) | Token consumption reporting |

---

