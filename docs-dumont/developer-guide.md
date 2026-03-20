---
sidebar_position: 7
title: Developer Guide
description: Build Dumont DEP from source, understand the module structure, and contribute to the project.
---

# Developer Guide

Whether you're building a custom connector, contributing to the project, or integrating Dumont DEP into your CI/CD pipeline, this guide has everything you need.

Dumont DEP is fully open-source at [github.com/openviglet/dumont](https://github.com/openviglet/dumont). All contributions are welcome.

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

### Clone the Repository

```bash
git clone https://github.com/openviglet/dumont.git
cd dumont
```

### Build

```bash
mvn clean install
```

### Run

```bash
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
├── spring/                     # Spring Boot configuration and JPA persistence
├── connector/
│   └── connector-app/          # Main application — strategies, batch, queue, plugins, API
├── web-crawler/
│   └── wc-plugin/              # Web Crawler connector plugin
├── db/
│   └── db-app/                 # Database connector (integrated + standalone CLI)
├── filesystem/
│   └── fs-connector/           # FileSystem connector (integrated + standalone CLI)
├── aem/
│   ├── aem-plugin/             # AEM connector core + extension interfaces
│   ├── aem-server/             # AEM server-side integration
│   ├── aem-plugin-sample/      # Example custom AEM extension
│   └── aem-commons/            # Shared AEM utilities
└── wordpress/                  # WordPress connector plugin
```

---

## Key Extension Points

### Creating a Custom Connector

Implement the `DumConnectorPlugin` interface:

```java
public interface DumConnectorPlugin {
    void crawl();
    String getProviderName();
    void indexAll(String source);
    void indexById(String source, List<String> contentId);
}
```

### Creating a Custom Indexing Plugin

Implement the `DumIndexingPlugin` interface:

```java
public interface DumIndexingPlugin {
    void index(TurSNJobItems turSNJobItems);
    String getProviderName();
}
```

Register your plugin as a Spring `@Component` and set `dumont.indexing.provider` to your plugin's provider name.

### AEM Custom Extensions

| Interface | Purpose |
|---|---|
| `DumAemExtContentInterface` | Custom field extraction from AEM content nodes |
| `DumAemExtDeltaDateInterface` | Custom delta date logic for incremental indexing |

See the `aem-plugin-sample` module for a working example.

---

## Processing Strategy Architecture

Strategies are evaluated in priority order for each Job Item:

![Dumont DEP — Processing Strategy Flow](/img/diagrams/dumont-strategy-flow.svg)

To add a custom strategy, implement the strategy interface and assign a priority between the existing ones.

---

## REST API

### Health Check

```
GET /api/v2/connector/status
```

### Submit Indexing Jobs

```
POST /api/v2/connector/indexing/
```

### Monitor Indexing

```
GET /api/v2/connector/monitoring/index/{source}
```

### Validate Source

```
GET /api/v2/connector/validate/{source}
```

For the full API surface, start the application and visit the Swagger UI or use the OpenAPI spec.

---

## Contributing

1. **Fork** the [openviglet/dumont](https://github.com/openviglet/dumont) repository
2. **Create a branch** for your feature or fix: `git checkout -b feature/my-improvement`
3. **Commit** with clear, descriptive messages
4. **Open a Pull Request** — describe what you changed and why

---

*Previous: [Indexing Plugins](./indexing-plugins.md)*
