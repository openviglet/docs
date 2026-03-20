---
sidebar_position: 4
title: Architecture Overview
description: System architecture of Viglet Dumont DEP — components, data flows, internal modules, and technology stack.
---

# Dumont DEP — Architecture Overview

## Introduction

Viglet Dumont DEP is a modular data extraction platform that runs connectors independently and delivers indexed documents to a search engine via an asynchronous message queue. It is designed as a companion application to Viglet Turing ES, but can also deliver content directly to Apache Solr or Elasticsearch.

This document describes the system's components, internal modules, and the core data flow from content source to search engine.

---

## High-Level Component Diagram

![Dumont DEP — High-Level Architecture](/img/diagrams/dumont-architecture.svg)

---

<div className="page-break" />

## Internal Module Structure

The Dumont DEP application is organized into cohesive modules, each with a well-defined responsibility.

| Module | Package | Responsibility |
|---|---|---|
| **Connector Core** | `connector` | Plugin interface, session management, and REST API controllers |
| **Processing Strategies** | `connector/strategy` | Priority-based chain that evaluates each Job Item — index, re-index, de-index, ignore, or skip |
| **Batch Processor** | `connector/batch` | Thread-safe buffer that groups Job Items into configurable batches before queue delivery |
| **Message Queue** | `connector/queue` | JMS listener on Apache Artemis that consumes batches and delegates to indexing plugins |
| **Indexing Plugins** | `connector/indexing` | Output adapters for Turing ES (default), Apache Solr, and Elasticsearch |
| **Web Crawler** | `web-crawler` | Recursive website crawling with JSoup, URL filtering, authentication, and locale detection |
| **Database** | `db` | JDBC-based extraction with SQL queries, batch chunking, and multi-database support |
| **FileSystem** | `filesystem` | Directory traversal with Apache Tika text extraction, OCR, and metadata mapping |
| **AEM** | `aem` | Adobe Experience Manager connector with delta tracking, content fragments, and custom extensions |
| **WordPress** | `wordpress` | WordPress REST API integration for posts, pages, and custom content types |
| **Commons** | `commons` | Shared models, interfaces, and utility classes used across all modules |
| **Persistence** | `spring` | JPA entities, repositories, and Spring configuration for the indexing database |

---

## Data Flow — Indexing

Content ingestion follows a linear pipeline from source to search engine:

![Dumont DEP — Indexing Flow](/img/diagrams/dumont-indexing-flow.svg)

---

<div className="page-break" />

## Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| **Runtime** | Java 21 | Minimum supported version |
| **Framework** | Spring Boot 4.0.3 | Application container with JMS, caching, async, and scheduling support |
| **Message Broker** | Apache Artemis | Embedded JMS broker with persistent queues |
| **Database** | H2 (dev) / PostgreSQL (prod) | Tracks indexing state, checksums, and configuration |
| **HTML Parsing** | JSoup 1.22.1 | Web Crawler — HTML content extraction |
| **Text Extraction** | Apache Tika 3.2.3 | FileSystem — PDF, DOCX, XLSX, PPTX, images (OCR) |
| **Search Clients** | Turing Java SDK 2026.1.17, SolrJ 10.0.0, ES Client 9.3.2 | Output adapters for each search engine |
| **CLI Parsing** | JCommander 1.82 | Command-line argument parsing for standalone importers |
| **Object Mapping** | MapStruct 1.6.3 | Compile-time DTO mapping |
| **Build System** | Apache Maven | Multi-module project |
| **Containerization** | Docker / Docker Compose | Available in the repository |
| **License** | Apache License 2.0 | Fully open-source |

---

## Deployment Topologies

### Development

Minimal setup using the embedded H2 database and embedded Artemis broker. No external dependencies.

```
Dumont DEP (H2 embedded + Artemis embedded)
    → Turing ES (http://localhost:2700)
```

### Simple Production

Dumont DEP connects to an external PostgreSQL database for durable indexing state and delivers content to Turing ES.

```
Dumont DEP + PostgreSQL
    → Turing ES + Apache Solr
```

### Direct Indexing (without Turing ES)

For deployments that don't use Turing ES, Dumont DEP can deliver content directly to Apache Solr or Elasticsearch via the Solr or Elasticsearch indexing plugins.

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
| [Installation Guide](./installation-guide.md) | Set up Dumont DEP |
| [Indexing Plugins](./indexing-plugins.md) | Configure Turing ES, Solr, or Elasticsearch as output targets |
| [Configuration Reference](./configuration-reference.md) | All application.yaml properties |

---

