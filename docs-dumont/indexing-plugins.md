---
sidebar_position: 5
title: Indexing Plugins
description: Configure where Dumont DEP delivers content — Turing ES (default), Apache Solr, or Elasticsearch.
---

# Indexing Plugins

An **Indexing Plugin** is the output adapter that delivers processed documents from the Dumont DEP pipeline to a search engine. Dumont DEP supports three targets — you choose one per deployment.

---

## Available Plugins

| Plugin | Target | Client Library | Use Case |
|---|---|---|---|
| **Turing** (default) | Viglet Turing ES | Turing Java SDK 2026.1.17 | Full enterprise search with GenAI, facets, spotlights |
| **Solr** | Apache Solr | SolrJ 10.0.0 | Direct Solr indexing without Turing ES |
| **Elasticsearch** | Elasticsearch | ES Java Client 9.3.2 | Direct Elasticsearch indexing without Turing ES |

---

## Turing ES Plugin (default)

The default plugin delivers documents to Turing ES via its REST API, using the official Turing Java SDK.

### Configuration

```yaml
dumont:
  indexing:
    provider: turing

turing:
  url: http://localhost:2700
  apiKey: your-turing-api-token
```

| Property | Description |
|---|---|
| `turing.url` | Base URL of the Turing ES instance |
| `turing.apiKey` | API Token created in Turing ES → Administration → API Tokens |

### How It Works

1. Receives a batch of Job Items from the message queue
2. Creates a `TurSNServer` instance using the Turing Java SDK
3. Calls `TurSNJobUtils.importItems()` to submit the batch
4. Turing ES validates each document against the target SN Site configuration
5. Documents are queued internally in Turing ES for Solr indexing

:::warning API Token required
The Turing plugin cannot deliver content without a valid API Token. Create one in **Turing ES → Administration → API Tokens** before starting Dumont DEP.
:::

---

<div className="page-break" />

## Apache Solr Plugin

The Solr plugin delivers documents directly to an Apache Solr collection, bypassing Turing ES entirely. Use this when you want Dumont DEP as a pure data extraction tool without Turing ES features.

### Configuration

```yaml
dumont:
  indexing:
    provider: solr
    solr:
      url: http://localhost:8983/solr
      collection: my-collection
```

| Property | Description |
|---|---|
| `dumont.indexing.solr.url` | Apache Solr base URL |
| `dumont.indexing.solr.collection` | Target Solr collection name |

### How It Works

1. Receives a batch of Job Items from the message queue
2. Converts each Job Item into a `SolrInputDocument`
3. Adds all documents to the Solr collection via SolrJ
4. Commits the changes

The Solr client is cleaned up automatically when the application shuts down (`@PreDestroy`).

---

## Elasticsearch Plugin

The Elasticsearch plugin delivers documents directly to an Elasticsearch index using bulk requests.

### Configuration

```yaml
dumont:
  indexing:
    provider: elasticsearch
    elasticsearch:
      url: http://localhost:9200
      index: my-index
      username: ~
      password: ~
```

| Property | Description |
|---|---|
| `dumont.indexing.elasticsearch.url` | Elasticsearch base URL |
| `dumont.indexing.elasticsearch.index` | Target index name |
| `dumont.indexing.elasticsearch.username` | Optional authentication username |
| `dumont.indexing.elasticsearch.password` | Optional authentication password |

### How It Works

1. Receives a batch of Job Items from the message queue
2. Builds a bulk request containing all documents
3. Submits the bulk request to Elasticsearch
4. Logs any per-document errors from the bulk response

Authentication is optional — leave `username` and `password` empty for unauthenticated clusters.

---

<div className="page-break" />

## Why Use Turing ES Instead of Solr or Elasticsearch Directly?

The Solr and Elasticsearch plugins deliver raw documents to the search engine — your application is responsible for everything else: building queries, rendering facets, managing spotlights, handling locales, and building the search UI.

**Turing ES adds an entire enterprise search platform on top of the search engine.** Here's what you get by choosing the Turing plugin over direct Solr or Elasticsearch indexing:

### Search Experience Layer

| Capability | With Turing ES | Direct Solr / Elasticsearch |
|---|---|---|
| **Faceted navigation** | Configured per site — facet types, sort, AND/OR operators, secondary facets, custom facets with ranges | Build manually with query params |
| **Spotlights** | Curated results pinned to search terms, injected at configured positions | Not available — build from scratch |
| **Targeting Rules** | Filter results by user profile (department, role, country) at query time | Not available |
| **Merge Providers** | Combine documents from two connectors into one enriched result using a join key | Not available |
| **Spell check** | Built-in with auto-correction mode | Configure Solr/ES suggester manually |
| **Autocomplete** | Ready-to-use endpoint | Configure Solr/ES suggester manually |
| **More Like This** | One toggle per site | Configure MLT handler manually |
| **Result ranking** | Boost rules with conditions and weights via admin UI | Write boost queries manually |
| **Highlighting** | Configurable HTML tags per site | Configure highlight params manually |
| **Self-describing JSON** | Response includes pre-built links for pagination, facet filters, locale switching — the front-end is a pure rendering layer | Build all query logic client-side |

### Generative AI & RAG

| Capability | With Turing ES | Direct Solr / Elasticsearch |
|---|---|---|
| **RAG (Retrieval-Augmented Generation)** | Documents are automatically embedded as vectors during indexing — users ask questions in natural language and get grounded answers | Not available |
| **AI Agents** | Compose assistants that combine LLM + search + web browsing + code execution + MCP tools | Not available |
| **Chat interface** | Built-in UI with direct LLM, Semantic Navigation, and AI Agent tabs | Not available |
| **Knowledge Base** | Upload files to MinIO — automatically indexed as vector embeddings for RAG | Not available |
| **LLM providers** | Anthropic Claude, OpenAI, Azure OpenAI, Google Gemini, Ollama — configured via admin UI | Not available |
| **Tool calling** | 27 native tools across 7 categories available to AI Agents | Not available |
| **Token usage monitoring** | Dashboard showing LLM consumption by model, day, and month | Not available |

### Administration & Operations

| Capability | With Turing ES | Direct Solr / Elasticsearch |
|---|---|---|
| **Admin console** | Browser-based React UI for all configuration | Solr Admin UI (limited) / Kibana (separate) |
| **Multi-site** | Multiple SN Sites on one instance, each with independent fields, facets, and AI settings | Manage collections/indices manually |
| **Multi-language** | Locale-aware indexing and search with per-locale Solr cores | Configure manually per core/index |
| **Connector management** | Integration page with monitoring, stats, double-check, and indexing manager | Not available |
| **Search metrics** | Top search terms by day/week/month/all-time per site | Not available out of the box |
| **Application logs** | MongoDB-backed log viewer in the admin console | External log tools required |
| **Security (SSO)** | Keycloak OAuth2/OIDC with SAML, LDAP, social login, and MFA | Configure separately per product |

### Integration

| Capability | With Turing ES | Direct Solr / Elasticsearch |
|---|---|---|
| **REST API** | Self-describing search response with pre-built navigation links | Raw query/response |
| **GraphQL** | Built-in endpoint | Not available |
| **Java SDK** | Official typed client on Maven Central | Use SolrJ / ES Client directly |
| **JavaScript SDK** | Official `@viglet/turing-sdk` on npm | No official SDK |

### When to Use Direct Solr or Elasticsearch

The Solr and Elasticsearch plugins are appropriate when:

- You already have a search infrastructure and only need Dumont DEP as a **data extraction tool**
- You have your own search UI and query layer built on top of Solr/Elasticsearch
- You don't need the GenAI, faceted navigation, or admin console features
- You're integrating with a third-party system that requires direct Solr/Elasticsearch access

For all other cases — especially when building a new search experience — **Turing ES is the recommended target** because it provides a complete, ready-to-use enterprise search platform with GenAI capabilities on top of the same Apache Solr engine.

---

## Switching Plugins

Change the active plugin by setting `dumont.indexing.provider`:

```bash
# Via JVM property
java -Ddumont.indexing.provider=solr -jar viglet-dumont.jar

# Via environment variable
DUMONT_INDEXING_PROVIDER=elasticsearch 
java -jar viglet-dumont.jar
```

Only one plugin is active per deployment. All connectors share the same output target.

---

## Related Pages

| Page | Description |
|---|---|
| [Configuration Reference](./configuration-reference.md) | All application.yaml properties |
| [Architecture](./architecture.md) | Where indexing plugins fit in the pipeline |
| [Turing ES — REST API](https://docs.viglet.com/turing/rest-api) | Turing ES indexing API reference |

---

