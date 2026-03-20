---
sidebar_position: 2
title: Administration Guide
description: Viglet Turing ES Administration Guide
---

# Viglet Turing ES: Administration Guide

Viglet Turing ES ([https://viglet.com/turing](https://viglet.com/turing)) is an open source enterprise search platform ([https://github.com/openviglet](https://github.com/openviglet)) with Semantic Navigation and Generative AI as its main features. All content is indexed in Apache Solr as the primary search engine.

For an overview of the system architecture and component interactions, see [Architecture Overview](./architecture-overview.md).

## Documents and OCR

It can read PDFs and Documents and convert to plain text and also it uses OCR to detect text in images and images into documents.

## Semantic Navigation

Semantic Navigation Sites are the central configuration objects in Turing ES. Each site defines what content is indexed, how it is searched, how results are presented, and whether GenAI is enabled. For a conceptual overview, see [Core Concepts](./getting-started/core-concepts.md). For advanced configuration — Targeting Rules, Spotlights, Merge Providers, Facets, and the search response structure — see [Semantic Navigation](./semantic-navigation.md).

## Generative AI Administration

The GenAI system is configured across several administration sections. For full configuration details — LLM providers, embedding stores, RAG architecture, Tool Callings, MCP Servers, and AI Agents — see [Generative AI & LLM Configuration](./genai-llm.md).

A brief overview of each administration section:

| Section | Path | Purpose |
|---|---|---|
| **Settings** | Administration → Settings | Global defaults: LLM instance, embedding store, embedding model, Python path, email |
| **LLM Instances** | Generative AI → Language Model | Configure connections to Anthropic Claude, OpenAI, Azure OpenAI, Gemini, and Ollama. See [LLM Instances](./llm-instances.md) |
| **MCP Servers** | Administration → MCP Servers | Register external MCP servers (HTTP or stdio) to extend agent tool calling |
| **AI Agents** | Administration → AI Agents | Compose agents from an LLM Instance + selected tools + MCP Servers |
| **Knowledge Base** | Management → Assets | Upload and organize files in MinIO; files are indexed as vector embeddings and queried by AI Agents. See [Assets](./assets.md) |

---

## Integration

Turing ES exposes its capabilities through four integration options:

| Method | Description |
|---|---|
| **REST API** | Primary method. All search, indexing, and administration operations are available as HTTP endpoints. |
| **GraphQL** | `POST /graphql` — for clients that prefer a graph-based query model |
| **Java SDK** | Available on [Maven Central](https://central.sonatype.com/artifact/com.viglet.turing/turing-java-sdk) (`com.viglet.turing:turing-java-sdk`) |
| **JavaScript / TypeScript SDK** | Available on npm: `npm install @viglet/turing-sdk` |

---

## Turing ES Console

Turing ES has many components: Search Engine, Semantic Navigation, and Generative AI.

### Login

When accessing Turing ES, a login page is displayed. The default username is `admin`. The password is defined at first startup via the `TURING_ADMIN_PASSWORD` environment variable — if not set, Turing ES will not create the admin account with a default password.

Set the environment variable before starting Turing ES for the first time:

**Windows**
```bat
set TURING_ADMIN_PASSWORD=your_password
```

**Linux / macOS**
```bash
export TURING_ADMIN_PASSWORD=your_password
```


---

### Administration

The **Administration** section is accessed via the main sidebar and lives at `/admin-settings`. It manages users, access control, API credentials, global configuration, and system diagnostics.

:::info Keycloak mode
When Keycloak is enabled (`turing.keycloak=true`), the **Users**, **Groups**, and **Roles** subsections are hidden — identity and access management is fully delegated to Keycloak. See [Security & Keycloak](./security-keycloak.md).
:::

---

#### Users

Lists all local user accounts in the system.

**Form fields:**

| Field | Description |
|---|---|
| Avatar | Profile picture |
| Username | Unique login identifier |
| First Name / Last Name | Display name |
| Email | User's email address |
| Password | Account password |

**Sections:**

| Section | Description |
|---|---|
| **Groups** | Add or remove the user from groups |
| **Roles** | Displays roles inherited from the user's groups (read-only) |

---

#### Groups

Organises users into groups for role-based access control.

**Form fields:**

| Field | Description |
|---|---|
| Name | Group name |
| Description | Purpose or scope of the group |

**Sections:**

| Section | Description |
|---|---|
| **Users** | Add or remove members of this group |
| **Roles** | Assign or remove roles granted to this group |

---

#### Roles

Defines permissions that can be assigned to groups.

| Field | Description |
|---|---|
| Name | Role identifier |
| Description | What this role permits |

---

#### API Tokens

Manages API tokens used to authenticate REST API requests. Every token is passed in the `Key` request header.

**Form fields:**

| Field | Description |
|---|---|
| Title | A human-readable name for the token |
| Description | Purpose or owner of this token |

:::info
The token value is generated automatically on creation and displayed once with a copy button. It cannot be retrieved again — store it securely.
:::

**Using the token in API requests:**

```bash
curl -X GET "http://localhost:2700/api/sn/Sample/search?q=cloud&_setlocale=en_US" \
  -H "Key: <YOUR_API_TOKEN>"
```

---

#### Global Settings

The central configuration panel for defaults and external service integrations. Divided into four sections:

##### General

| Field | Description |
|---|---|
| Decimal Separator | Choose between period (`.`) and comma (`,`) for numeric display |
| Python Path | Absolute path to the Python executable (required for Python-based processing) |

##### LLM Settings

| Field | Description |
|---|---|
| Default LLM Instance | The LLM used when no site-level instance is configured |
| Response Cache | Enable caching of LLM responses to reduce latency and cost |
| Cache Duration | How long cached responses are retained |
| Regenerate Cache | Button to manually invalidate and rebuild the response cache |

:::warning
Caching LLM responses improves performance but may return stale answers if the underlying content changes frequently. Tune the duration to match your content update cadence.
:::

##### RAG Settings

| Field | Description |
|---|---|
| Enable RAG Globally | Master switch for Retrieval-Augmented Generation across all sites |
| Default Embedding Model | The model used to vectorize documents at indexing time and queries at search time |
| Default Embedding Store | The vector store for persisting embeddings (ChromaDB, PgVector, or Milvus) |

:::warning
Changing the Default Embedding Model invalidates all existing embeddings. All indexed content must be re-indexed after changing this setting.
:::

:::note
The RAG Settings section is only visible if an embedding store is configured and available. If MinIO is not configured, the Knowledge Base and related RAG options will not appear.
:::

##### Email Settings

Used by Turing ES to send notifications and test email connectivity.

| Field | Description |
|---|---|
| Provider | Email service provider (e.g., Brevo) |
| API Key | API key for the email provider |
| Sender Email | The `From` email address |
| Sender Name | The display name shown to recipients |
| Recipient Email | Default destination for test emails |
| Send Test Email | Button to send a test message and verify configuration |

---

#### System Information

A diagnostic panel to monitor the health of the Turing ES instance. Divided into two sections:

##### Overview

| Item | Description |
|---|---|
| Application Version | Current Turing ES build version |
| Java Version | JVM version in use |
| Operating System | OS name and version |
| Database Status | Connection status of the primary database |
| RAM Usage | Current and total system memory |
| JVM Heap | Used and available JVM heap space |
| Disk Usage | Available storage on the host volume |
| MongoDB Status | Connected / disconnected (shown only if MongoDB is enabled) |
| MinIO Status | Connected / disconnected (shown only if MinIO is enabled) |

##### System Variables

A searchable table of all JVM properties and environment variables active at runtime. Useful for verifying configuration at deployment.

---

### Search Engine

The Search Engine section manages connections to the search backend (Apache Solr, Elasticsearch, or Lucene) and the cores (collections) that each Semantic Navigation Site locale maps to.

For full documentation — instance creation, core management, system monitoring, the plugin architecture, and protections — see **[Search Engine](./search-engine.md)**.

### Semantic Navigation

The **Semantic Navigation** section manages SN Sites — the central configuration objects that drive every search experience in Turing ES. Each site defines its search engine binding, indexed fields, facets, AI settings, and targeting rules.

For full documentation of all SN Site configuration tabs (Settings, Multi Languages, Behavior, Fields, Merge Providers, Targeting Rules, Spotlights, Top Search Terms, Result Ranking, AI Insights, and Generative AI) and the search REST API, see **[Semantic Navigation](./semantic-navigation.md)**.

For deep technical content — Targeting Rules Solr query mechanics, Spotlight injection, Merge Provider field overwrite rules, facet operators, and the self-describing search response structure — see **[Semantic Navigation](./semantic-navigation.md)**.
