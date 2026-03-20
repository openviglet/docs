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
| `fq[]` | | Filter query — apply a facet filter (e.g., `fq[]=type:news`) |
| `group` | | Group results by a field value |

**Example (GET):**

```bash
curl "http://localhost:2700/api/sn/Sample/search?q=enterprise+search&p=1&_setlocale=en_US&rows=10" \
  -H "Accept: application/json"
```

The response is a self-describing JSON object. For the full response schema — including `facet`, `secondaryFacet`, `spotlight`, `pagination`, and `didYouMean` sections — see [Semantic Navigation Concepts → Search Response Structure](./sn-concepts.md#search-response-structure).

#### Targeting Rules

Targeting Rules personalize results by filtering documents based on user profile attributes (group, role, country, segment, etc.). They are sent in the **POST body** as JSON. Three types are supported:

**`targetingRules` — flat list, AND between attributes, OR within the same attribute:**

```bash
curl -X POST "http://localhost:2700/api/sn/Sample/search" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "benefits",
    "_setlocale": "en_US",
    "targetingRules": ["department:HR", "department:Finance", "clearance:confidential"]
  }'
```

**`targetingRulesWithConditionAND` — map, all attributes must match (AND between groups):**

```bash
curl -X POST "http://localhost:2700/api/sn/Sample/search" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "promotions",
    "_setlocale": "en_US",
    "targetingRulesWithConditionAND": {
      "country": ["BR"],
      "language": ["pt"]
    }
  }'
```

**`targetingRulesWithConditionOR` — map, any attribute is sufficient (OR across all groups):**

```bash
curl -X POST "http://localhost:2700/api/sn/Sample/search" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "discount",
    "_setlocale": "en_US",
    "targetingRulesWithConditionOR": {
      "segment": ["premium", "gold"],
      "loyalty": ["active"]
    }
  }'
```

Documents that have none of the targeted attributes are always included (fallback clause). See [Semantic Navigation Concepts → Targeting Rules](./sn-concepts.md#targeting-rules) for the full reference including Solr query generation and practical examples.

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

## GenAI API

### RAG Chat (SN Site)

Sends a question to the GenAI engine of a Semantic Navigation Site. Returns a streaming SSE response grounded in the site's indexed content.

```
GET http://localhost:2700/api/sn/{siteName}/chat?q={question}
```

### AI Agent Chat

Sends a message to a specific AI Agent. Returns a streaming SSE response.

```
POST http://localhost:2700/api/v2/llm/agent/{agentId}/chat
```

See [Chat](./chat.md) for the full chat interface documentation.

---

## Token Usage API

Returns token consumption statistics for a given month.

```
GET http://localhost:2700/api/v2/llm/token-usage?month=YYYY-MM
```

Authentication required. See [Token Usage](./token-usage.md) for details.

---

## Related Pages

| Page | Description |
|---|---|
| [Authentication](./security-authentication.md) | How to create and use API Tokens |
| [Semantic Navigation](./semantic-navigation.md) | SN Site configuration and the search response structure |
| [Semantic Navigation Concepts](./sn-concepts.md) | Search response JSON schema |
| [Chat](./chat.md) | Front-end chat interface and GenAI API |
| [Token Usage](./token-usage.md) | Token consumption reporting |

---

*Previous: [Developer Guide](./developer-guide.md) | Next: [Architecture Overview](./architecture-overview.md)*
