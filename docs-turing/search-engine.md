---
sidebar_position: 1
title: Search Engine
description: Configure and manage Search Engine instances in Viglet Turing ES.
---

# Search Engine

The **Search Engine** page (`/admin/se/instance`) manages the search backends that power Semantic Navigation Sites. It is accessible from the **Enterprise Search** section of the sidebar.

Each **Search Engine instance** is a configured connection to a search backend. Semantic Navigation Sites bind to a specific instance when their cores (collections) are created. Turing ES supports three backends via a plugin architecture: **Apache Solr** (recommended), **Apache Lucene** (embedded), and **Elasticsearch**.

---

## Instance Listing

The page displays all configured instances as a grid of cards (title and description). Use the **"New"** button to add an instance. When no instances exist, a blank state guides you to create the first one.

---

## Create / Edit Form

### General Information

| Field | Required | Description |
|---|---|---|
| **Title** | ✅ | Display name for this instance — shown in SN Site dropdowns |
| **Description** | | Free-text notes about this instance |

### Connection Settings

| Field | Required | Description |
|---|---|---|
| **Vendor** | ✅ | Backend type: `SOLR`, `LUCENE`, or `ES` |
| **Endpoint URL** | ✅ | Connection URL for the backend service |

Default endpoint URLs per vendor:

| Vendor | Default Endpoint URL |
|---|---|
| **SOLR** (Apache Solr) | `http://localhost:8983/solr` |
| **LUCENE** (embedded Apache Lucene) | `/data/turing/lucene` |
| **ES** (Elasticsearch) | `http://localhost:9200` |

---

## Instance Detail Pages

After creating an instance, its detail page exposes three navigation sections.

### Settings

Editing form for all fields listed above, plus a **Delete instance** button. An instance cannot be deleted if any SN Site cores are still using it.

---

### Cores (Collections)

Manages the search indices — called **cores** in Solr terminology — within this search engine instance. Each Semantic Navigation Site locale maps to one core.

#### Core Listing

The list shows all cores found in the connected backend:

| Column | Description |
|---|---|
| **Name** | Core identifier (e.g., `my-site_en_US`) |
| **Documents** | Number of indexed documents (`numDocs`) reported by the engine |
| **Sites** | Badges showing each SN Site and locale using this core, with a country flag for quick recognition |

Cores are grouped by locale pattern: `{base}_{lang}_{COUNTRY}` (e.g., `product-docs_pt_BR`). A **search/filter** field at the top narrows the list by core name.

#### Core Actions

| Action | Description |
|---|---|
| **Delete core** | Permanently removes the core and all its indexed data. **Blocked** if the core is in use by any SN Site — the UI shows which sites and locales are preventing deletion. |
| **Clear documents** | Erases all indexed documents from the core without removing the core itself. Useful for a clean re-index without reconfiguring site associations. |

#### Create a New Core

| Field | Required | Description |
|---|---|---|
| **Name / Name Prefix** | ✅ | Core name or prefix |
| **Locale** | ✅ | Language and country (e.g., `en_US`, `pt_BR`) |
| **Append locale to name** | | Toggle — when enabled, the locale is automatically appended to the prefix, generating the canonical name (e.g., prefix `my-site` + locale `en_US` → `my-site_en_US`) |

A **name preview** shows the final core name as you type, before saving.

:::tip Naming convention
Use the `{site-name}_{lang}_{COUNTRY}` pattern consistently. This makes it easy to identify which site and locale each core belongs to when browsing multiple instances.
:::

---

### System Information

Live monitoring panel for the connected backend:

| Item | Description |
|---|---|
| **Status badge** | `UP` (green) or `DOWN` (red) — real-time connectivity check |
| **Engine version** | Solr or Elasticsearch version string |
| **Lucene version** | Underlying Lucene library version |
| **Operating system** | OS name and version of the engine host |
| **Java version** | JVM version running the search engine |
| **JVM memory** | Heap usage reported by the engine |
| **Other properties** | Additional dynamic properties returned by the engine's status API |

---

## Plugin Architecture

Turing ES uses a plugin architecture to support multiple search backends behind a unified `TurSearchEnginePlugin` interface. The active plugin is resolved at runtime based on the vendor configured per instance. If a vendor is unrecognised, the factory falls back to Solr.

For the full interface reference — all methods across search, index management, schema management, and document operations — and instructions on implementing a new backend, see [Developer Guide → Search Engine Plugin Architecture](./developer-guide.md#search-engine-plugin-architecture).

---

## Protections

| Scenario | Behaviour |
|---|---|
| **Delete core in use** | Blocked — the UI displays a list of SN Sites and locales currently using the core |
| **Delete instance in use** | Should be avoided — removing an instance with active sites will break indexing and search for those sites |

Repository-level **caching** is enabled for search engine instances to avoid repeated database reads during high-frequency searches.

---

## Related Pages

| Page | Description |
|---|---|
| [Administration Guide](./administration-guide.md) | Full console reference |
| [Semantic Navigation](./semantic-navigation.md) | How SN Sites use cores and search engines |
| [Architecture Overview](./architecture-overview.md) | Solr, Elasticsearch, and Lucene in the system architecture |
| [Configuration Reference](./configuration-reference.md#solr) | Solr and Elasticsearch timeout settings in `application.yaml` |

---

