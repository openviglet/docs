---
sidebar_position: 2
title: Semantic Navigation
description: Configure and manage Semantic Navigation Sites in Viglet Turing ES.
---

# Semantic Navigation

The **Semantic Navigation** page (`/admin/sn`) manages the search experiences that power every user-facing search in Turing ES. It is accessible from the **Enterprise Search** section of the sidebar.

Each **Semantic Navigation Site** (SN Site) is a complete, independently configured search experience: it defines which content is indexed, which search engine backend is used, how results are presented, which AI features are enabled, and how the front-end should render the response. A single Turing ES instance can host multiple SN Sites.

For a conceptual overview of what SN Sites are and how they relate to the rest of the system, see [Core Concepts](./getting-started/core-concepts.md). For deep technical documentation on Targeting Rules, Spotlights, Merge Providers, facet operators, and the search response structure, see [Semantic Navigation Concepts](./sn-concepts.md).

---

## Site Listing

The page displays all configured SN Sites as a grid of cards (title and description). Use the **"New"** button to create a new site. When no sites exist, a blank state guides you to create the first one.

---

## Site Configuration

Clicking a site opens its configuration, organized into tabs. Each tab covers a distinct aspect of the site's behaviour.

---

### Settings Tab

General identity and search engine binding for the site.

| Attribute | Description |
|---|---|
| **Name** | Identifier for the site — used in API URLs (e.g., `/api/sn/{Name}/search`) |
| **Description** | Human-readable description shown in the console |
| **Search Engine** | The Search Engine instance that stores and searches content for this site. See [Search Engine](./search-engine.md) |
| **Thesaurus** | Enables thesaurus-based query expansion — matching synonyms and related terms |

---

### Multi Languages Tab

Defines which locales are active for this site and maps each locale to a search engine core (collection).

| Attribute | Description |
|---|---|
| **Language** | Locale code for this language variant (e.g., `en_US`, `pt_BR`) |
| **Core** | The Solr core (or Elasticsearch index) where content for this locale is stored and searched |

Each locale is indexed and searched independently. The `Accept-Language` request header or the `_setlocale` query parameter selects the active locale at search time.

**Open Search button:** Next to each locale row, the **Open Search** button opens the HTML search page for that locale at:

```
GET http://localhost:2700/sn/<SITE_NAME>
```

---

### Behavior Tab

Controls how the search engine processes queries and assembles results for this site.

| Section | Attribute | Description |
|---|---|---|
| **Behavior** | Number of items per page | Number of results returned per search request |
| **Facet** | Facet enabled | Enables or disables faceted navigation for this site |
| **Facet** | Number of items per facet | Maximum number of values displayed per facet in the results panel |
| **Highlighting** | Highlighting enabled | Whether to return highlighted snippets in search results |
| **Highlighting** | Pre Tag | HTML tag inserted before a matched term (e.g., `<mark>`) |
| **Highlighting** | Post Tag | HTML tag inserted after a matched term (e.g., `</mark>`) |
| **Did you mean?** | "Did you mean?" enabled | Activates spell-check suggestions for misspelled queries |
| **Did you mean?** | Always show corrected term | When a correction is found, automatically re-runs the search with the corrected term |
| **MLT** | More Like This enabled? | Returns similar documents alongside the primary search results |
| **Default Fields** | Title | Solr field used as the document title in search results |
| **Default Fields** | Text | Solr field used as the primary full-text search field |
| **Default Fields** | Description | Solr field used as the result snippet |
| **Default Fields** | Date | Solr field used for date-based sorting and display |
| **Default Fields** | Image | Solr field containing the document thumbnail URL |
| **Default Fields** | URL | Solr field containing the canonical document URL |

For the full behavior model — wildcard options, facet operators (AND/OR), secondary facets, and field-level overrides — see [Semantic Navigation Concepts → Behavior Configuration](./sn-concepts.md#sn-site--behavior-configuration).

---

### Fields Tab

Lists all fields configured for this site. Each field defines how a document attribute is indexed, searched, and presented.

#### Field Listing

| Column | Description |
|---|---|
| **Field** | Field name as it appears in the Solr schema |
| **Enabled** | Whether this field is active |
| **MLT** | Whether this field is included in More Like This queries |
| **Facets** | Whether this field is exposed as a facet filter |
| **Secondary Facet** | Whether this facet is promoted to the `secondaryFacet` section of the search response |
| **Highlighting** | Whether highlighted snippets are returned for this field |

#### Field Detail

Clicking a field opens its detail form:

| Attribute | Description |
|---|---|
| **Name** | Field identifier — must match the Solr schema field name |
| **Description** | Purpose or contents of this field |
| **Type** | Data type: `INT`, `LONG`, `FLOAT`, `DOUBLE`, `CURRENCY`, `STRING`, `DATE`, or `BOOL` |
| **Multi Valued** | Whether the field holds an array of values |
| **Facet Name** | Display label shown in the search UI facet panel |
| **Facet** | Whether to expose this field as a filter facet |
| **Secondary Facet** | Promotes this facet to the `secondaryFacet` section of the search response (e.g., for rendering as navigation tabs) |
| **Highlighting** | Whether to return highlighted snippets for this field |
| **MLT** | Whether this field participates in More Like This queries |
| **Enabled** | Whether this field is active |
| **Required** | Whether the field must be present when indexing a document |
| **Default Value** | Value used when a document is indexed without this field |

:::tip Secondary Facets
A secondary facet is a regular facet that is additionally returned in a separate `secondaryFacet` section of the search response. This lets the front-end render it differently — for example, as horizontal tabs ("All · Articles · Videos") — while other facets appear as sidebar filters. The field must have **Facet** enabled first; **Secondary Facet** is a promotion, not a replacement.
:::

---

### Merge Providers Tab

Merge Providers enable Turing ES to detect when two connectors have indexed the same real-world document and merge their fields into a single enriched Solr document.

| Section | Attribute | Description |
|---|---|---|
| **Providers** | Source | The connector whose incoming document contributes field values |
| **Providers** | Destination | The connector whose existing document in the index is updated |
| **Relations** | Source | The field in the source document used as the join key |
| **Relations** | Destination | The field in the destination document used as the join key |
| **Description** | Description | Notes about this merge configuration |
| **Overwritten Fields** | Name | The field whose value is taken from the source document and written into the destination document |

For a full explanation of how merge providers work, the indexing order requirement, and field type compatibility rules, see [Semantic Navigation Concepts → Merge Providers](./sn-concepts.md#merge-providers).

---

### Targeting Rules

Targeting Rules have **no admin UI configuration screen**. They are applied entirely at search time — the client sends the user's profile attributes in the body of the `POST /api/sn/{siteName}/search` request, and the Turing ES search pipeline converts them into Solr filter queries on the fly.

The targeting attributes (e.g., `department`, `country`, `role`, `access_group`) must be indexed on documents at indexing time via the Dumont DEP connector, and the corresponding fields must be present in the SN Site's **Fields** configuration so they are part of the Solr schema.

For the complete reference — the three rule types (`targetingRules`, `targetingRulesWithConditionAND`, `targetingRulesWithConditionOR`), the Solr query generation mechanics, the fallback clause, practical examples, and metrics — see **[Semantic Navigation Concepts → Targeting Rules](./sn-concepts.md#targeting-rules)**.

---

### Spotlights Tab

Spotlights are curated results pinned to specific search terms. When a user's query matches a spotlight term, configured documents are injected into the result list at defined positions, before the organic results.

#### Spotlight Form

| Attribute | Description |
|---|---|
| **Name** | Descriptive label for this spotlight (admin-only) |
| **Description** | Optional notes about the spotlight's purpose |
| **Terms** | One or more search terms that trigger this spotlight. Matching is case-insensitive substring matching |
| **Indexed Documents** | The documents injected into results when this spotlight is triggered |

#### Document Entry

Each document in a spotlight defines:

| Attribute | Description |
|---|---|
| **Position** | The 1-based slot in the result list where this document is injected |
| **Document ID** | The `id` field of the target document in the Solr index (for managed mode) |
| **Title** | Fallback title if the document is not found in the index |
| **Description** | Fallback description |
| **URL** | Fallback URL |
| **Type** | Content type label displayed in the UI |

**Managed vs. unmanaged:** If a Document ID is provided and the document exists in the index, live metadata is fetched at query time. If the document is not found, the fallback title/description/URL/type is used instead. This lets you pin both indexed content and external URLs in the same spotlight configuration.

For the detailed matching algorithm, injection mechanics, and the term cache, see [Semantic Navigation Concepts → Spotlights](./sn-concepts.md#spotlights).

---

### Top Search Terms Tab

Displays reports of the most frequently searched terms for this site. Turing ES records every search query and aggregates statistics across four time windows:

| Report | Description |
|---|---|
| **Today** | Top 50 terms searched today |
| **This Week** | Top 50 terms for the current week |
| **This Month** | Top 50 terms for the current month |
| **All Time** | Top 50 most searched terms of all time |

Each report shows the term and its search count for the selected period. Use this data to identify popular queries for Spotlight configuration, content gaps, and relevance tuning.

---

### Result Ranking Tab

Configures boost expressions that influence search relevance. Each ranking expression boosts documents matching a set of conditions by a configured weight. Expressions are converted into Solr boost queries in the format `(condition)^weight` and applied at query time.

#### Ranking Expression Form

**General Information**

| Attribute | Description |
|---|---|
| **Name** | Name for this ranking rule |
| **Description** | What this rule does and why |

**Ranking Conditions**

A dynamic list of one or more field-value conditions. At least one condition is required.

| Attribute | Description |
|---|---|
| **Attribute** | An indexed field in the document, selected from the site's configured fields |
| **Condition** | `Is` (equals) or `Is not` (not equals) |
| **Value** | The value to compare against |

Multiple conditions are combined with AND logic — all conditions must match for the boost to apply.

**Ranking Weight**

A slider from **0** to **10** that sets the boost intensity. Higher weight causes matching documents to rank higher in results.

**Example:** A condition `type Is news` with weight `8` causes documents of type "news" to rank significantly higher than other results.

---

### AI Insights Tab

The AI Insights tab displays an AI-generated natural language summary of this SN Site — aggregating information about its configuration, fields, behavior settings, and indexed content. The summary is generated on demand and gives administrators a quick overview of what the site is configured to do, without having to navigate through all the tabs.

Click **Generate** to trigger the summary. The response streams in progressively as it is generated.

---

### Generative AI Tab

Configures the RAG (Retrieval-Augmented Generation) system for this site, enabling conversational AI responses grounded in the indexed documents. The tab is divided into four sections.

**Site Prompt**

A field for generating an automatic description of the site using AI, with streaming support. The generated description can overwrite an existing one after a confirmation dialog.

**RAG Activation**

| Attribute | Description |
|---|---|
| **Enabled** | Enables the generative AI chat endpoint for this site (`GET /api/sn/{siteName}/chat`) |

**AI Model & Embedding Configuration**

If not configured here, the site inherits the global defaults from **Administration → Settings**.

| Attribute | Description |
|---|---|
| **LLM Instance** | The language model used to generate responses (e.g., Anthropic Claude, OpenAI GPT-4o). See [LLM Instances](./llm-instances.md) |
| **Embedding Store** | The vector store where document embeddings are persisted: ChromaDB, PgVector, or Milvus |
| **Embedding Model** | The model used to vectorize documents at indexing time and queries at search time |

:::warning Changing the Embedding Model
Changing the Embedding Model invalidates all existing embeddings for this site. All indexed content must be re-indexed after this change. The Knowledge Base training status in [Assets](./assets.md) will reflect the stale state.
:::

**System Prompt**

An editor for the prompt template sent to the LLM on each chat request. The template must include two required variables:

| Variable | Description |
|---|---|
| `{{question}}` | The user's question |
| `{{information}}` | The context retrieved from indexed documents via similarity search |

Saving is blocked if either variable is missing from the template.

**How it works:** When documents are indexed, `TurSNGenAi.addDocuments()` extracts title, summary, and body text and stores their embeddings in the configured vector store. When a user sends a chat request (`GET /api/sn/{siteName}/chat?q=...`), the system performs a similarity search, builds the prompt with the retrieved context, sends it to the LLM, and returns the generated response via Server-Sent Events (SSE). See [Chat](./chat.md) for the front-end experience.

---

## Related Pages

| Page | Description |
|---|---|
| [REST API Reference](./rest-api.md) | Search, autocomplete, spell check, and all other API endpoints |
| [Semantic Navigation Concepts](./sn-concepts.md) | Targeting Rules, Spotlights, Merge Providers, facet operators, and the search response structure |
| [Search Engine](./search-engine.md) | Manage the Solr/Elasticsearch/Lucene backends that SN Sites connect to |
| [Assets](./assets.md) | Knowledge Base files for RAG — requires an embedding-capable LLM Instance |
| [LLM Instances](./llm-instances.md) | Configure the language models used by the Generative AI tab |
| [Chat](./chat.md) | Front-end chat interface for the Semantic Navigation tab |
| [Architecture Overview](./architecture-overview.md) | How SN Sites fit into the overall system architecture |

---

*Previous: [Search Engine](./search-engine.md) | Next: [Semantic Navigation Concepts](./sn-concepts.md)*
