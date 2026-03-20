---
sidebar_position: 3
title: Integration
description: Manage content connectors that import and index content from external sources into Turing ES.
---

# Integration

The **Integration** page (`/admin/integration/instance`) manages connectors that import and index content from external sources — such as AEM or web crawlers — into the Turing ES search engine. It is accessible from the **Enterprise Search** section of the sidebar.

Each **Integration instance** represents a configured connection to a content connector application. The connector runs as a separate process (for example, Viglet Dumont DEP) and communicates with Turing ES via REST. Turing ES acts as a proxy: the API path `/api/v2/integration/{integrationId}/**` forwards requests to the configured connector endpoint, with built-in SSRF protection.

---

## Instance Listing

The listing page shows all configured Integration instances as a grid of cards, each displaying the integration's title and description. A button at the top of the page opens the creation form.

---

## Creating or Editing an Integration

The creation and edit form is divided into two sections.

**General Information**

| Field | Description |
|---|---|
| Integration Name | Human-readable identifier for this integration (required) |
| Short Description | Optional description of the integration's purpose |

**Connection Details**

| Field | Description |
|---|---|
| Integration Type | Connector type — **AEM** or **Web Crawler** |
| Endpoint | URL of the connector application |
| Enabled | Toggle to activate or deactivate this integration |

---

## Integration Detail — Sections

After an integration is created, its detail page provides navigation to seven sections.

---

### Settings

The Settings section contains the same form fields as the creation form (General Information and Connection Details), allowing you to edit the integration name, description, endpoint, type, and enabled state.

---

### Sources

Sources define the content origins that this integration reads from. Each integration can have multiple sources, and each source is configured independently.

#### General

| Field | Description |
|---|---|
| Name | Source identifier |
| Endpoint | URL of the content source within the connector |
| Username / Password | Credentials for authenticated access |

#### Root Path

Defines the root content path within the source (for example, the root node in an AEM repository from which content is traversed).

#### Content Types

| Field | Description |
|---|---|
| Content Type | Primary content type to be indexed (for example, `cq:Page`) |
| Sub Type | Optional sub-type filter within the content type |

#### Delta Tracking

Controls how incremental indexing is handled.

| Field | Description |
|---|---|
| Once Pattern | Pattern used to identify content that should only be indexed once |
| Delta Class | Java class responsible for detecting changed content since the last run |

#### Author / Publish

Configures which AEM environments are indexed and how they map to Turing ES sites.

| Field | Description |
|---|---|
| Author | Enable indexing from the AEM author environment |
| Publish | Enable indexing from the AEM publish environment |
| SN Site (Author) | Semantic Navigation Site that receives author content |
| SN Site (Publish) | Semantic Navigation Site that receives publish content |
| URL Prefix (Author) | URL prefix prepended to document paths in the author index |
| URL Prefix (Publish) | URL prefix prepended to document paths in the publish index |

#### Locales

Maps content language codes to repository paths.

| Field | Description |
|---|---|
| Default Locale | Locale used when no language-specific path is matched |
| Locale Class | Java class responsible for resolving document locale |
| Locale → Path | Dynamic list mapping each locale code (for example, `en_US`) to its root path in the repository |

#### Source Actions

Each source has two action buttons:

- **Index All** — triggers a full indexing run for all content in this source
- **Reindex All** — forces a full reindexation, replacing all previously indexed content

---

### Indexing Rules

Indexing Rules allow you to filter content during indexing — for example, to exclude error pages or draft content before it reaches the search index.

**Form fields:**

| Field | Description |
|---|---|
| Name | Rule identifier (required) |
| Description | Purpose of this rule |
| Source | The source this rule applies to |
| Attribute | Document field to evaluate (for example, `template`) |
| Rule Type | How the rule is applied — currently supports **IGNORE** (skip documents that match) |
| Values | Dynamic list of values that trigger the rule (add or remove entries) |

**Example:** A rule with `Attribute = template`, `Rule Type = IGNORE`, and `Values = [error-page]` will prevent any document with `template:error-page` from being indexed.

---

### Indexing Manager

The Indexing Manager provides a stepper form for targeting specific documents for manual operations. Four operation types are available:

| Operation | Description | Colour |
|---|---|---|
| **INDEXING** | Index specific content | Blue |
| **DEINDEXING** | Remove specific content from the index | Red |
| **PUBLISHING** | Publish content | Green |
| **UNPUBLISHING** | Unpublish content | Orange |

Each operation step allows you to:

- Select the **Source** to operate on
- Choose the **attribute** to identify documents: **ID** or **URL**
- Enter one or more specific values (IDs or URLs)
- Expand **Advanced Settings** to toggle **Recursive** mode, which traverses child content in hierarchical repositories

---

### Monitoring

The Monitoring section is a real-time dashboard for tracking the indexing pipeline. It displays indexing events as they are received and processed.

**Filters:**

| Filter | Description |
|---|---|
| Date From / Date To | Restrict results to a time window |
| Object ID | Filter by a specific document ID |
| Status | Filter by processing status (see status table below) |
| Environment | Author or Publish |
| Language | Locale code (for example, `en_US`) |
| Sites | Filter by target SN Site |

**Auto-refresh:** configurable intervals — Off, 1s, 5s, 10s, 30s, 1m, 5m.

**Result columns:** Date, Object ID, Status, Environment, Language, Sites.

Results are paginated and sortable.

#### Indexing Status Values

| Status | Meaning |
|---|---|
| `PREPARE_INDEX` | Preparing to index the document |
| `PREPARE_UNCHANGED` | No changes detected since last indexing |
| `PREPARE_REINDEX` | Preparing a reindexation |
| `PREPARE_FORCED_REINDEX` | Forced reindexation triggered |
| `RECEIVED_AND_SENT_TO_TURING` | Document received by the connector and forwarded to Turing ES |
| `SENT_TO_QUEUE` | Document placed in the Artemis processing queue |
| `RECEIVED_FROM_QUEUE` | Document consumed from the queue by the indexing pipeline |
| `INDEXED` | Document successfully indexed in Solr |
| `FINISHED` | Operation finished |
| `DEINDEXED` | Document removed from the index |
| `NOT_PROCESSED` / `IGNORED` | Document skipped due to an Indexing Rule or connector decision |

---

### Indexing Stats

The Indexing Stats section provides a table of completed bulk indexing operations for this integration.

| Column | Description |
|---|---|
| Start Time | Timestamp when the operation started |
| Source | Source that was operated on |
| Operation | `INDEX_ALL` or `REINDEX_ALL` |
| Documents | Number of documents processed |
| Duration | Total elapsed time |
| Docs/min | Throughput (documents per minute) |

---

### Double Check

The Double Check section validates the consistency between the connector's content and the Turing ES search index. It detects drift between what the connector knows about and what is actually indexed.

- Select a **Source** to inspect
- Results are shown in two views:
  - **Missing** — content that exists in the connector but is not present in the index
  - **Extra** — content that is present in the index but no longer exists in the connector
- Results are grouped by Solr core in an accordion, listing the affected document paths

Use Double Check after a partial failure, a forced reindex, or when users report missing or stale search results.

---

### System Information

Displays live diagnostic information from the remote connector application.

**Status badge:** UP (green) or DOWN (red) — indicates whether the connector endpoint is reachable.

**Application:**

| Item | Description |
|---|---|
| Application | Connector application name |
| Version | Connector build version |
| Java Version | JVM version running the connector |
| Vendor | JVM vendor |
| JVM | JVM identifier |
| OS | Operating system name and version |

**Memory and disk gauges** (progress bars with total, used, and free values):

| Gauge | Description |
|---|---|
| Physical Memory (RAM) | Host system memory |
| JVM Heap Memory | Java heap utilisation and limits |
| Disk Space | Available storage on the connector's host volume |

---

## Architecture

Turing ES acts as a transparent proxy to the connector. The API path `/api/v2/integration/{integrationId}/**` forwards all requests to the configured connector endpoint, including authentication headers. This design keeps the connector application decoupled — it does not need to be publicly accessible, only reachable from the Turing ES server.

Built-in SSRF protection validates the endpoint before forwarding. Requests to private IP ranges, loopback addresses, or disallowed schemes are rejected.

---

## Related Pages

| Page | Description |
|---|---|
| [Semantic Navigation](./semantic-navigation.md) | Configure the SN Sites that receive indexed content |
| [SN Concepts](./sn-concepts.md) | Merge Providers, Targeting Rules, and indexing pipeline internals |
| [Architecture Overview](./architecture-overview.md) | End-to-end indexing flow from connector to Solr |
| [REST API Reference](./rest-api.md) | API endpoints for programmatic indexing |

---

*Previous: [Semantic Navigation](./semantic-navigation.md) | Next: [Assets](./assets.md)*
