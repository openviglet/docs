---
sidebar_position: 3
title: Architecture
description: Viglet Dumont DEP system architecture
---

# Viglet Dumont DEP: Architecture

Dumont DEP is built on a modular architecture designed for extensibility and scalability.

## Overview

Dumont DEP provides a platform for data exchange across different systems and formats. It consists of the following core modules:

- **Core Engine** — Orchestrates data flows and transformations
- **Connectors** — Pluggable adapters for external systems
- **Pipeline** — Configurable data processing pipelines
- **API Gateway** — RESTful API for managing exchanges

## System Diagram

```
┌─────────────────────────────────────────────┐
│                Dumont DEP                   │
│                                             │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Connectors│→ │ Pipeline │→ │  Output   │ │
│  │  (Input)  │  │ Engine   │  │ Connectors│ │
│  └───────────┘  └──────────┘  └───────────┘ │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │          REST API Gateway            │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Java 21, Spring Boot 4 |
| Build | Maven |
| Database | H2 (embedded), PostgreSQL (production) |
| API | REST, OpenAPI 3.0 |