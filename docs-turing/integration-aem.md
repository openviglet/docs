---
sidebar_position: 4
title: AEM Connector
description: AEM-specific configuration for Turing ES integrations — sources, content types, author/publish environments, delta tracking, locales, indexing rules, and the indexing manager.
---

# AEM Connector

This page covers the configuration sections that are specific to the **Adobe Experience Manager (AEM)** connector. For general integration management — creating instances, monitoring, statistics, and system information — see [Integration](./integration.md).

---

## Sources

Sources define the content origins that this integration reads from. Each integration can have multiple sources, and each source is configured independently.

### General

| Field | Description |
|---|---|
| Name | Source identifier |
| Endpoint | URL of the content source within the connector |
| Username / Password | Credentials for authenticated access |

### Root Path

Defines the root content path within the source (for example, the root node in an AEM repository from which content is traversed).

### Content Types

| Field | Description |
|---|---|
| Content Type | Primary content type to be indexed (for example, `cq:Page`) |
| Sub Type | Optional sub-type filter within the content type |

### Delta Tracking

Controls how incremental indexing is handled.

| Field | Description |
|---|---|
| Once Pattern | Pattern used to identify content that should only be indexed once |
| Delta Class | Java class responsible for detecting changed content since the last run |

### Author / Publish

Configures which AEM environments are indexed and how they map to Turing ES sites.

| Field | Description |
|---|---|
| Author | Enable indexing from the AEM author environment |
| Publish | Enable indexing from the AEM publish environment |
| SN Site (Author) | Semantic Navigation Site that receives author content |
| SN Site (Publish) | Semantic Navigation Site that receives publish content |
| URL Prefix (Author) | URL prefix prepended to document paths in the author index |
| URL Prefix (Publish) | URL prefix prepended to document paths in the publish index |

### Locales

Maps content language codes to repository paths.

| Field | Description |
|---|---|
| Default Locale | Locale used when no language-specific path is matched |
| Locale Class | Java class responsible for resolving document locale |
| Locale → Path | Dynamic list mapping each locale code (for example, `en_US`) to its root path in the repository |

### Source Actions

Each source has two action buttons:

- **Index All** — triggers a full indexing run for all content in this source
- **Reindex All** — forces a full reindexation, replacing all previously indexed content

---

## Indexing Rules

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

## Indexing Manager

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

## Related Pages

| Page | Description |
|---|---|
| [Integration](./integration.md) | General integration management — instances, monitoring, statistics, and system information |
| [Semantic Navigation](./semantic-navigation.md) | Configure the SN Sites that receive indexed content |
| [Semantic Navigation](./semantic-navigation.md) | Merge Providers, Targeting Rules, and indexing pipeline internals |
| [Architecture Overview](./architecture-overview.md) | End-to-end indexing flow from connector to Solr |
| [REST API Reference](./rest-api.md) | API endpoints for programmatic indexing |

---

*Previous: [Integration](./integration.md) | Next: [Assets](./assets.md)*
