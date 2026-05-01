---
sidebar_position: 7
title: Developer Guide
description: Build Dumont DEP from source, understand the project structure, extension points, and how to contribute.
---

# Developer Guide

Whether you're building custom extensions, contributing to the project, or integrating Dumont DEP into your CI/CD pipeline, this guide has everything you need.

Dumont DEP is fully open-source at [github.com/openviglet/dumont](https://github.com/openviglet/dumont-ce). All contributions are welcome.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21 · Spring Boot 4.0.3 |
| **Message Queue** | Apache Artemis (embedded) |
| **Database** | H2 (dev) · PostgreSQL (prod) |
| **HTML Parsing** | JSoup 1.22.1 |
| **Text Extraction** | Apache Tika 3.2.3 |
| **Search Clients** | Turing Java SDK · SolrJ · ES Client |
| **Build** | Apache Maven |
| **CI/CD** | GitHub Actions |

---

## Setting Up Your Dev Environment

### Prerequisites

- Java 21 (Temurin recommended)
- Maven 3.9+
- Git
- Turing ES running at `http://localhost:2700` (for end-to-end testing)

### Clone, Build, and Run

```bash
git clone https://github.com/openviglet/dumont-ce.git
cd dumont
mvn clean install

cd connector/connector-app
mvn spring-boot:run
```

The application starts at `http://localhost:30130`.

---

<div className="page-break" />

## Project Structure

```
dumont/
├── commons/                    # Shared interfaces, models, utilities
├── aem-commons/                # AEM extension interfaces (published to Maven Central)
├── spring/                     # Spring Boot configuration and JPA persistence
├── connector/
│   └── connector-app/          # Main pipeline — strategies, batch, queue, indexing plugins, API
├── web-crawler/
│   └── wc-plugin/              # Web Crawler connector plugin
├── db/
│   ├── db-commons/             # DB extension interface (published to Maven Central)
│   ├── db-app/                 # Database connector (standalone CLI)
│   └── db-sample/              # Example custom DB extension
├── filesystem/
│   └── fs-connector/           # FileSystem connector (standalone CLI)
├── aem/
│   ├── aem-plugin/             # AEM connector plugin (loaded via -Dloader.path)
│   ├── aem-server/             # AEM server-side integration
│   └── aem-plugin-sample/      # Example custom AEM extensions (WKND site)
└── wordpress/                  # WordPress PHP plugin
```

---

## Extension Points

Dumont DEP provides extension points at multiple levels:

### Connector-Level Extensions

| Extension | Guide | Maven Artifact |
|---|---|---|
| **AEM extensions** — attribute extractors, model.json processors (with fluent API), delta date logic | [Extending the AEM Connector](./extending-aem.md) | `com.viglet.dumont:aem-commons:2026.2.3` |
| **Database extensions** — custom row transformations during SQL import | [Extending the Database Connector](./extending-database.md) | `com.viglet.dumont:db-commons:2026.2.3` |

### Platform-Level Extensions

#### Creating a Custom Connector

Implement the `DumConnectorPlugin` interface:

```java
public interface DumConnectorPlugin {
    void crawl();
    String getProviderName();
    void indexAll(String source);
    void indexById(String source, List<String> contentId);
}
```

#### Creating a Custom Indexing Plugin

Implement the `DumIndexingPlugin` interface:

```java
public interface DumIndexingPlugin {
    void index(TurSNJobItems turSNJobItems);
    String getProviderName();
}
```

Register your plugin as a Spring `@Component` with `@ConditionalOnProperty(name = "dumont.indexing.provider", havingValue = "your-provider")`.

---

## Processing Strategy Architecture

Strategies are evaluated in priority order for each Job Item:

![Dumont DEP — Processing Strategy Flow](/img/diagrams/dumont-strategy-flow.svg)

To add a custom strategy, implement the strategy interface and assign a priority between the existing ones.

---

## REST API

| Endpoint | Description |
|---|---|
| `GET /api/v2/connector/status` | Health check |
| `POST /api/v2/connector/indexing/` | Submit indexing jobs |
| `GET /api/v2/connector/monitoring/index/{source}` | Monitor indexing progress |
| `GET /api/v2/connector/validate/{source}` | Validate a content source |

For the full API surface, start the application and visit the Swagger UI.

---

## Contributing

1. **Fork** the [openviglet/dumont](https://github.com/openviglet/dumont-ce) repository
2. **Create a branch** for your feature or fix: `git checkout -b feature/my-improvement`
3. **Commit** with clear, descriptive messages
4. **Open a Pull Request** — describe what you changed and why

---

