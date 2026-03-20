---
sidebar_position: 4
title: Architecture Overview
description: System architecture of Viglet Dumont DEP — components, data flows, internal modules, and technology stack.
---

# Dumont DEP — Architecture Overview

## Introduction

Viglet Dumont DEP is a modular data extraction platform that runs connectors independently and delivers indexed documents to a search engine via an asynchronous message queue. It is designed as a companion application to Viglet Turing ES, but can also deliver content directly to Apache Solr or Elasticsearch.

---

## System Overview

The system has three layers: content sources on the left, the Dumont DEP pipeline in the center, and search engines on the right.

![Dumont DEP — High-Level Architecture](/img/diagrams/dumont-architecture.svg)

Each numbered block is detailed in its own diagram below.

---

## ① Connectors — How Content Enters the Pipeline

Connectors extract content and feed it into the pipeline. They come in three forms: Java plugins, standalone CLI tools, and the WordPress PHP plugin.

![Dumont DEP — Connector Types](/img/diagrams/dumont-connectors.svg)

| Type | Connectors | How they connect |
|---|---|---|
| **Java Plugins** | Web Crawler, AEM | Loaded into `dumont-connector.jar` via `-Dloader.path` — one plugin per JVM |
| **Standalone CLI** | Database, FileSystem | Separate JARs that connect to a running Dumont DEP instance via REST API |
| **PHP Plugin** | WordPress | Installed inside WordPress — sends content directly to Turing ES, bypasses Dumont |

For details on each connector, see [Connectors Overview](./connectors/overview.md).

---

<div className="page-break" />

## ② Pipeline Engine — How Content Is Processed

Once a connector produces a Job Item, it passes through a multi-stage pipeline before reaching the search engine.

![Dumont DEP — Pipeline Detail](/img/diagrams/dumont-pipeline-detail.svg)

| Stage | Component | What it does |
|---|---|---|
| **①** | **Job Item** | A single document with fields, an action (INDEX / DELETE), and a locale |
| **②** | **Processing Strategies** | Priority chain: deindex (P10) → ignore rules (P20) → index new (P30) → reindex changed (P40) → skip unchanged (P50) |
| **③** | **Batch Processor + Queue** | Groups items into batches of 50, sends to Apache Artemis persistent queue |
| **④** | **Indexing Plugin** | Delivers to Turing ES (default), Apache Solr, or Elasticsearch |

The **Indexing DB** stores checksums and status for every processed document — enabling incremental indexing on subsequent runs.

For the conceptual explanation of each stage, see [Core Concepts — The Processing Pipeline](./getting-started/core-concepts.md#the-processing-pipeline).

---

## ③ Data Flow — Indexing Sequence

The complete sequence from content source to search engine:

![Dumont DEP — Indexing Flow](/img/diagrams/dumont-indexing-flow.svg)

---

<div className="page-break" />

## Internal Module Structure

| Module | Package | Responsibility |
|---|---|---|
| **Connector Core** | `connector` | Plugin interface, session management, and REST API controllers |
| **Processing Strategies** | `connector/strategy` | Priority-based chain — index, re-index, de-index, ignore, or skip |
| **Batch Processor** | `connector/batch` | Thread-safe buffer that groups Job Items before queue delivery |
| **Message Queue** | `connector/queue` | JMS listener on Apache Artemis — delegates to indexing plugins |
| **Indexing Plugins** | `connector/indexing` | Output adapters: Turing ES, Apache Solr, Elasticsearch |
| **Web Crawler** | `web-crawler` | JSoup, URL filtering, authentication, locale detection |
| **Database** | `db` | JDBC queries, batch chunking, multi-database support |
| **FileSystem** | `filesystem` | Apache Tika text extraction, OCR, metadata mapping |
| **AEM** | `aem` | infinity.json, tags, model.json, delta tracking, custom extensions |
| **WordPress** | `wordpress` | PHP plugin — event-driven indexing inside WordPress |
| **Commons** | `commons` | Shared models, interfaces, utilities |
| **AEM Commons** | `aem-commons` | AEM extension interfaces (published to Maven Central) |
| **DB Commons** | `db-commons` | DB extension interface (published to Maven Central) |

---

## Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| **Runtime** | Java 21 | Minimum supported version |
| **Framework** | Spring Boot 4.0.3 | JMS, caching, async, scheduling |
| **Message Broker** | Apache Artemis | Embedded, persistent queues |
| **Database** | H2 (dev) / PostgreSQL (prod) | Indexing state, checksums, config |
| **HTML Parsing** | JSoup 1.22.1 | Web Crawler |
| **Text Extraction** | Apache Tika 3.2.3 | FileSystem — PDF, DOCX, images (OCR) |
| **Search Clients** | Turing Java SDK, SolrJ 10.0.0, ES Client 9.3.2 | One active per deployment |
| **Build** | Apache Maven | Multi-module project |

---

## Deployment Topologies

### Development

```
Dumont DEP (H2 embedded + Artemis embedded)
    → Turing ES (http://localhost:2700)
```

### Production

```
Dumont DEP + PostgreSQL
    → Turing ES + Apache Solr
```

### Direct Indexing (without Turing ES)

```
Dumont DEP + PostgreSQL
    → Apache Solr (direct via SolrJ)
    → Elasticsearch (direct via ES Client)
```

---

## Related Pages

| Page | Description |
|---|---|
| [Core Concepts](./getting-started/core-concepts.md) | Pipeline stages, strategies, and change detection |
| [Connectors Overview](./connectors/overview.md) | All connectors and deployment types |
| [Indexing Plugins](./indexing-plugins.md) | Turing ES, Solr, Elasticsearch output targets |
| [Installation Guide](./installation-guide.md) | Setup with `-Dloader.path` and systemd |
