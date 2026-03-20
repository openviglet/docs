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

Semantic Navigation Sites are the central configuration objects in Turing ES. Each site defines what content is indexed, how it is searched, how results are presented, and whether GenAI is enabled. For a conceptual overview, see [Core Concepts](./getting-started/core-concepts.md). For advanced configuration — Targeting Rules, Spotlights, Merge Providers, Facets, and the search response structure — see [Semantic Navigation Concepts](./sn-concepts.md).

## Generative AI Administration

The GenAI system is configured across several administration sections. For full configuration details — LLM providers, embedding stores, RAG architecture, Tool Callings, MCP Servers, and AI Agents — see [Generative AI & LLM Configuration](./genai-llm.md).

A brief overview of each administration section:

| Section | Path | Purpose |
|---|---|---|
| **Settings** | Administration → Settings | Global defaults: LLM instance, embedding store, embedding model, Python path, email |
| **LLM Instances** | Administration → LLM Instances | Configure connections to Anthropic Claude, OpenAI, Azure OpenAI, Gemini, and Ollama |
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

**Tabs:**

| Tab | Description |
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

**Tabs:**

| Tab | Description |
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

A diagnostic panel to monitor the health of the Turing ES instance. Divided into two tabs:

##### Overview Tab

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

##### System Variables Tab

A searchable table of all JVM properties and environment variables active at runtime. Useful for verifying configuration at deployment.

---

### Search Engine

#### Configuration

Search Engine is used by Turing to store and retrieve data of Semantic Navigation Sites.


It is possible create or edit a Search Engine with following attributes:

| Attribute | Description |
|-----------|-------------|
| Name | Name of Search Engine |
| Description | Description of Search Engine |
| Vendor | Select the Vendor of Search Engine. For now it only supports Solr |
| Host | Host name where the Search Engine service is installed |
| Port | Port of Search Engine Service |
| Enabled | If the Search Engine is enabled |

### Semantic Navigation

#### Configuration


##### Settings Tab

The Settings of Semantic Navigation Site contains the following attributes:

| Attribute | Description |
|-----------|-------------|
| Name | Name of Semantic Navigation Site |
| Description | Description of Semantic Navigation Site |
| Search Engine | Select the Search Engine that was created in Search Engine Section |
| Thesaurus | If will use Thesaurus |

##### Multi Languages Tab

| Attribute | Description |
|-----------|-------------|
| Language | Language for Semantic Navigation Site |
| Core | Solr Core Name to store and to search indexed content |

##### Behavior Tab

| Section | Attribute | Description |
|---------|-----------|-------------|
| Behavior | Number of items per page | Number of items that will appear in search |
| Facet | Facet enabled | If it will show Facet (Filters) on search |
| Facet | Number of items per facet | Number of items that will appear in each Facet |
| Highlighting | Highlighting enabled | Define whether to show highlighted lines |
| Highlighting | Pre Tag | HTML Tag for begin of term. For example: `<mark>` |
| Highlighting | Post Tag | HTML Tag for end of term. For example: `</mark>` |
| Did you mean? | "Did you mean?" enabled | Use "did you mean?" feature |
| Did you mean? | Always show corrected term | If misspelled, shows search with corrected term |
| MLT | More Like This enabled? | Define whether to show MLT |
| Default Fields | Title | Field used as title in Solr schema |
| Default Fields | Text | Field used as text in Solr schema |
| Default Fields | Description | Field used as description in Solr schema |
| Default Fields | Date | Field used as date in Solr schema |
| Default Fields | Image | Field used as Image URL in Solr schema |
| Default Fields | URL | Field used as URL in Solr schema |

##### Merge Providers Details Tab

| Section | Attribute | Description |
|---------|-----------|-------------|
| Providers | Source | Name of Source Provider |
| Providers | Destination | Name of Destination Provider |
| Relations | Source | Relation Identifier of Source Provider |
| Relations | Destination | Relation Identifier of Destination Provider |
| Description | Description | More about merge providers |
| Overwritten Fields | Name | Name of Source Field that overwrites destination field |

##### Fields Tab

Fields Tab contains a table with the following columns:

| Column Name | Description |
|-------------|-------------|
| Field | Name of Field |
| Enabled | If the field is enabled |
| MLT | If this field will be used in MLT |
| Facets | To use this field like a facet (filter) |
| Secondary Facet | To promote this facet to the secondary facet section of the response |
| Highlighting | If this field will show highlighted lines |

When clicking a Field, a details page appears with:

| Attribute | Description |
|-----------|-------------|
| Name | Name of Field |
| Description | Description of Field |
| Type | `INT`, `LONG`, `FLOAT`, `DOUBLE`, `CURRENCY`, `STRING`, `DATE` or `BOOL` |
| Multi Valued | If is an array |
| Facet Name | Label of Facet on Search Page |
| Facet | To use this field like a facet |
| Secondary Facet | Promotes this field to the `secondaryFacet` section of the search response |
| Highlighting | If this field will show highlighted lines |
| MLT | If this field will be used in MLT |
| Enabled | If the field is enabled |
| Required | If the field is required |
| Default Value | Default value if content is indexed without this field |

##### Spotlight Details Tab

| Attribute | Description |
|-----------|-------------|
| Name | Spotlight Name |
| Description | Spotlight Description |
| Terms | If any of these terms are searched, documents display as spotlights |
| Indexed Documents | Documents that display as spotlights for search terms |

##### Top Search Terms Tab

During search, Turing ES saves information about search terms and generates Top Search Terms reports.

There are the following reports: Today, This Week, This Month and All Time. These reports show the first 50 terms and statistics about the period.

##### Result Ranking Tab

The Result Ranking tab allows you to create ranking expressions that influence search relevance by boosting documents that meet specific conditions. Expressions are converted into Solr boost queries in the format `(condition)^weight` and applied at query time by `TurSolrQueryBuilder.prepareBoostQuery()`.

The listing displays all configured ranking expressions for the site. Each expression is created or edited through a form divided into three sections:

**General Information**

| Attribute | Description |
|-----------|-------------|
| Name | Name of the ranking expression |
| Description | Description of the rule |

**Ranking Conditions**

A dynamic list of one or more conditions. At least one condition is required.

| Attribute | Description |
|-----------|-------------|
| Attribute | Indexed field of the document, selected from the site's configured fields |
| Condition | Operator: `Is` (equals) or `Is not` (not equals) |
| Value | Value to compare against |

**Ranking Weight**

A slider from 0 to 10 that sets the boost intensity. The higher the weight, the more documents matching the conditions rise in the ranking.

For example: a condition `type Is news` with weight `8` causes documents of type "news" to rank higher in search results.

##### AI Insights Tab

The AI Insights tab displays an AI-generated summary of the Semantic Navigation Site — aggregating information about its configuration, fields, behavior settings, and indexed content. This summary is generated on demand and provides a natural language overview of the site for administrators.

##### Generative AI Tab

The Generative AI tab configures the RAG (Retrieval-Augmented Generation) system for the site, enabling conversational AI responses grounded in the indexed documents. The configuration is divided into four sections:

**Site Prompt**

A field for generating an automatic description of the site using AI, with streaming support. The generated description can overwrite an existing one after a confirmation dialog.

**RAG Activation**

| Attribute | Description |
|-----------|-------------|
| Enabled | Enables or disables the generative AI chat for this site (`/api/sn/{siteName}/chat`) |

**AI Model & Embedding Configuration**

If not configured, the site inherits the global defaults defined in **Administration → Settings**.

| Attribute | Description |
|-----------|-------------|
| LLM Instance | The language model instance to use for generating responses (e.g., OpenAI, Anthropic Claude) |
| Embedding Store | The vector store where document embeddings are persisted (ChromaDB, PgVector, or Milvus) |
| Embedding Model | The embedding model used to vectorize documents at indexing time and queries at search time |

**System Prompt**

An editor for the prompt template sent to the LLM on each chat request. The template must contain two required variables:

| Variable | Description |
|----------|-------------|
| `{{question}}` | The user's question |
| `{{information}}` | The context retrieved from indexed documents via similarity search |

Saving is blocked if either variable is missing from the template.

**How it works:** When documents are indexed, `TurSNGenAi.addDocuments()` extracts title, summary, and body text and stores their embeddings in the configured vector store. When a user sends a chat request via `GET /api/sn/{siteName}/chat?q=...`, the system performs a similarity search in the vector store, builds the prompt with the retrieved context, sends it to the LLM, and returns the generated response. Document metadata (source ID, locale, site, modification and publication dates, URL) is preserved alongside the embeddings.

#### Search Page

##### HTML

In `Turing ES Console` > `Semantic Navigation` > `<SITE_NAME>` > `Multi languages` > click in `Open Search` button of some language.

It will open a Search Page that uses the pattern:

```
GET http://localhost:2700/sn/<SITE_NAME>
```
