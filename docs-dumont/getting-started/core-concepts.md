---
sidebar_position: 2
title: Core Concepts
description: The fundamental concepts of Dumont DEP — connectors, job items, the processing pipeline, strategies, and indexing plugins.
---

# Core Concepts

This page explains the fundamental concepts of Dumont DEP in plain terms. No configuration files, no code — just the mental model you need before diving into the technical documentation.

---

## Connectors

A **Connector** is a component that knows how to extract content from a specific type of source. Each connector:

1. **Connects** to a content source (a website, a database, a file folder, an AEM instance)
2. **Extracts** documents according to its configuration
3. **Emits** each document as a **Job Item** into the processing pipeline

Dumont DEP ships with five connectors:

| Connector | Source | How it works |
|---|---|---|
| **Web Crawler** | Websites | Recursively follows links from a starting URL, extracts page content via HTML parsing |
| **Database** | JDBC databases | Executes SQL queries and maps each result row to a document |
| **FileSystem** | Local/network directories | Walks directory trees, extracts text from files via Apache Tika |
| **AEM** | Adobe Experience Manager | Reads content from AEM author/publish instances via the JCR API |
| **WordPress** | WordPress sites | Pulls posts, pages, and custom content types from WordPress installations |

Each connector implements the `DumConnectorPlugin` interface and provides three operations: **crawl** (full extraction), **indexAll** (re-index a source), and **indexById** (index specific documents by ID).

---

## Job Items

A **Job Item** is a single document moving through the pipeline. It contains:

- **Fields** — key-value pairs representing the document's content (title, text, URL, date, author, and any custom fields)
- **Action** — what to do with this document: `INDEX` (add or update) or `DELETE` (remove from the index)
- **Provider** — which connector produced this item
- **Locale** — the language/country of the content (e.g., `en_US`, `pt_BR`)

Job Items are the universal data format inside Dumont DEP. Every connector produces them, every strategy evaluates them, and every indexing plugin consumes them.

---

<div className="page-break" />

## The Processing Pipeline

When a connector extracts a document, it does not send it directly to the search engine. Instead, the document passes through a multi-stage pipeline designed for reliability, efficiency, and flexibility.

![Dumont DEP — Processing Pipeline](/img/diagrams/dumont-pipeline.svg)

### Stage 1 — Extraction

The connector reads content from the source and produces Job Items. Each item includes all the fields needed for indexing.

### Stage 2 — Strategy Evaluation

Every Job Item passes through a chain of **Processing Strategies**, evaluated in priority order. Each strategy decides whether the item should be indexed, re-indexed, de-indexed, ignored, or skipped:

| Priority | Strategy | What it does |
|---|---|---|
| 10 | **De-index** | Removes documents marked for deletion |
| 20 | **Ignore (Indexing Rules)** | Skips documents matching regex-based ignore rules |
| 30 | **Index** | Indexes new documents (not seen before) |
| 40 | **Re-index** | Updates documents whose content has changed (checksum comparison) |
| 50 | **Unchanged** | Skips documents that haven't changed since the last run |

The strategy chain uses **checksum-based change detection** — each document's content is hashed, and the hash is compared against the last indexed version. Only documents that have actually changed are re-indexed.

### Stage 3 — Batching

Accepted Job Items are collected by the **Batch Processor** into groups (default: 50 items per batch). This reduces the number of messages sent to the queue and improves indexing throughput.

When a batch reaches its configured size, or when the connector signals it has finished, the batch is flushed to the message queue.

### Stage 4 — Queue

The batch is sent to **Apache Artemis** (embedded JMS message queue). The queue decouples extraction from delivery — if the search engine is temporarily unavailable, messages wait in the queue and are delivered when the connection is restored.

Queue messages are persisted to disk (`store/queue/`) and survive application restarts.

### Stage 5 — Delivery

The **Indexing Plugin** consumes messages from the queue and delivers them to the configured search engine. Dumont DEP supports three output targets:

| Plugin | Target | Description |
|---|---|---|
| **Turing** (default) | Viglet Turing ES | Uses the Turing Java SDK to deliver documents via REST API |
| **Solr** | Apache Solr | Uses SolrJ to add documents directly to a Solr collection |
| **Elasticsearch** | Elasticsearch | Uses the Elasticsearch Java Client for bulk indexing |

---

<div className="page-break" />

## Indexing Rules

**Indexing Rules** allow you to filter content during extraction — before it enters the pipeline. A rule defines:

- An **attribute** (a field name in the document)
- A **rule type** (currently `IGNORE`)
- One or more **values** (regex patterns)

When a document's attribute matches any of the values, the document is skipped entirely. For example, a rule with `attribute = template` and `values = [error-page, redirect]` will prevent any document with those templates from being indexed.

Indexing Rules are configured per source in the admin console and are evaluated by the **IgnoreIndexingRuleStrategy** at priority 20 — before the index/re-index/unchanged strategies run.

---

## Change Detection

Dumont DEP tracks every document it has processed using a persistent indexing database. For each document, it stores:

- **Object ID** — the unique identifier from the source
- **Checksum** — a CRC32 hash of the document's content
- **Timestamp** — when the document was last indexed
- **Status** — the current state (preparing, indexed, de-indexed, etc.)

On subsequent runs, the connector compares the new checksum against the stored one. If they match, the document is **unchanged** and skipped. If they differ, the document is **re-indexed**. If a previously indexed document is no longer present in the source, it is **de-indexed**.

This mechanism enables efficient **incremental indexing** — only changed content is sent to the search engine, regardless of how large the source is.

---

<div className="page-break" />

## Indexing Status Values

Every document's journey through the pipeline is tracked with a status code:

| Status | Meaning |
|---|---|
| `PREPARE_INDEX` | Preparing to index the document |
| `PREPARE_UNCHANGED` | No changes detected since last indexing |
| `PREPARE_REINDEX` | Preparing a re-indexation (content changed) |
| `PREPARE_FORCED_REINDEX` | Forced re-indexation triggered |
| `RECEIVED_AND_SENT_TO_TURING` | Document received and forwarded to the search engine |
| `SENT_TO_QUEUE` | Document placed in the Artemis processing queue |
| `RECEIVED_FROM_QUEUE` | Document consumed from the queue by the indexing plugin |
| `INDEXED` | Document successfully indexed |
| `FINISHED` | Operation finished |
| `DEINDEXED` | Document removed from the index |
| `NOT_PROCESSED` / `IGNORED` | Document skipped due to an Indexing Rule or strategy decision |

---

## Ready to go deeper?

| I want to... | Go to |
|---|---|
| Understand the full system architecture | [Architecture](../architecture.md) |
| Install Dumont DEP | [Installation Guide](../installation-guide.md) |
| Configure a Web Crawler | [Web Crawler Connector](../connectors/web-crawler.md) |
| Index a database | [Database Connector](../connectors/database.md) |
| Understand the indexing plugins | [Indexing Plugins](../indexing-plugins.md) |
| See the full configuration reference | [Configuration Reference](../configuration-reference.md) |

---

