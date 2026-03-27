---
sidebar_position: 3
title: Search & Caching
description: Viglet Turing ES integration, Hazelcast distributed cache and full-text search in Shio CMS.
---

# Search & Caching

Shio CMS provides automatic content indexing with full-text search capabilities, and a distributed caching layer powered by Hazelcast for high-performance website delivery.

---

## Full-Text Search

### Automatic Indexing

Content in Shio CMS is **automatically indexed** when created or updated. This means your site has search functionality out of the box — no additional configuration required.

### Built-in Search

The embedded search engine provides:
- Full-text search across all content
- Search API endpoint (`/api/v2/search`)
- Site-scoped search results

---

## Viglet Turing ES Integration

For advanced search capabilities, Shio CMS integrates with **Viglet Turing ES** — an enterprise search platform with semantic navigation and generative AI.

### What Turing ES adds

| Feature | Description |
|---|---|
| **Faceted Search** | Filter results by category, date, author, or any attribute |
| **Autocomplete** | Type-ahead suggestions as users type |
| **Semantic Navigation** | Configurable search experience with result ranking |
| **Generative AI** | RAG-powered AI answers grounded in your content |
| **Spotlights** | Curated results pinned to specific search terms |

### Search Field Mapping

When configuring Post Type fields, you can map each field to a Turing Semantic Navigation field:

- **Search Field Association** — map to a default Turing SN field:
  - Title, Description, Text, Date, URL, Image

- **Create Additional Search Field** — map to a custom field for facets or advanced filtering

### Turing Search Endpoint

Shio CMS exposes a Turing search context at:

```
/__tur/sn/{siteName}
```

This endpoint proxies search requests to the configured Turing ES instance, allowing your site to use Turing's full search capabilities without direct client-server communication.

### Configuration

Search providers are configured in the **Configuration Console > Search Providers** section. Define:
- Turing ES server URL
- Search site name
- Authentication credentials

---

<div className="page-break" />

## Hazelcast Cache

Shio CMS uses **Hazelcast** as a distributed caching layer for website rendering. The cache dramatically improves response times by storing rendered page HTML and content objects.

### How it works

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '13px', 'primaryColor': '#fff', 'primaryBorderColor': '#c0c0c0', 'lineColor': '#888', 'textColor': '#333'}}}%%
graph LR
    A["🌐 Request"] --> B{"Cache Hit?"}
    B -->|Yes| C["⚡ Return cached HTML"]
    B -->|No| D["⚙️ Render page"]
    D --> E["💾 Store in cache"]
    E --> C

    classDef blue fill:#dbeafe,stroke:#4A90D9,stroke-width:2px,color:#1a1a1a
    classDef green fill:#dcfce7,stroke:#50B86C,stroke-width:2px,color:#1a1a1a
    classDef amber fill:#fef3c7,stroke:#E8A838,stroke-width:2px,color:#1a1a1a

    class A amber
    class B blue
    class C green
    class D,E blue
```

### Cache Behavior

| Aspect | Details |
|---|---|
| **Scope** | Page-level and object-level caching |
| **TTL** | Default 24 hours (configurable per region) |
| **Invalidation** | Automatic when content is created, updated, or deleted |
| **Distribution** | Hazelcast distributes cache across multiple Shio CMS nodes |
| **Disable** | Set TTL to `0` on a region to disable caching for that region |

### Cache Configuration

Hazelcast is configured via `hazelcast.xml` in the application resources. Key settings:

- **Cluster name** — identifies the Hazelcast cluster
- **Network** — multicast or TCP/IP discovery for multi-node setups
- **Map configuration** — TTL, max size, and eviction policies per cache map

### Multi-Node Caching

In a multi-node deployment, Hazelcast automatically discovers other nodes and distributes the cache. When content is updated on one node, the cache is invalidated across all nodes.

---

## Related Pages

| Page | Description |
|---|---|
| [Content Modeling](./content-modeling.md) | Search field mapping in Post Types |
| [Website Development](./website-development.md) | Region caching and TTL configuration |
| [Configuration Reference](./configuration-reference.md) | Application properties |
| [Architecture Overview](./architecture-overview.md) | System components and deployment topologies |

---
