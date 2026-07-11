---
sidebar_position: 6
title: Migrating from Algolia or Elasticsearch
description: Move a search index from Algolia or Elasticsearch to Viglet Turing ES — a concept-mapping table, a three-step import path (schema as code, bulk index, swap the SDK), and self-hosted search where your data stays in your own infrastructure.
---

# Migrating from Algolia or Elasticsearch

Already running search on **Algolia** or **Elasticsearch**? Viglet Turing ES keeps the search depth you rely on — facets, typo tolerance, synonyms, relevance tuning — and adds RAG, cited chat and AI agents, while running entirely on **your own infrastructure**. Your documents, embeddings and query logs never leave your network, and there is no per-record or per-search billing.

This page maps the concepts you already know to their Turing equivalents, then walks the concrete import path. It's a migration, not a rewrite — most of what you built carries over.

---

## Concept mapping

The building blocks line up almost one-to-one. Where a hosted feature is paid, beta, or vendor-locked, Turing ES ships the equivalent in the box, running on the search engine you already operate (Apache Solr, Elasticsearch, or the embedded Lucene index).

| Concept | Algolia | Elasticsearch | Viglet Turing ES |
|---|---|---|---|
| Where documents live | Index | Index | Semantic Navigation (SN) site |
| A single record | Record (JSON object) | Document (`_source`) | Document — indexed via REST or a connector |
| Schema & field config | Index settings (`searchableAttributes`…) | Mappings | [Field manifest as code](./manifest.md) — `POST /api/sn/manifest` |
| Faceting | `attributesForFaceting` | Aggregations | Native facet fields, no extra query DSL |
| Typo tolerance | `typoTolerance` | Fuzzy queries | Typo-tolerant + spell-check in the box |
| Synonyms | Synonyms API | Synonym token filter | Engine synonyms (Solr / Elasticsearch) |
| Semantic / vector search | NeuralSearch (paid add-on) | kNN over `dense_vector` | Embedded Lucene KNN or your engine's vectors, fused via [hybrid RRF](./manifest.md#hybrid-ranking-for-public-search) |
| Relevance tuning | Custom ranking + tie-breaking | BM25 + `function_score` | BM25 + opt-in hybrid RRF (keyword + vector) |
| AI answers over your content | Ask AI (hosted beta) | ELSER + your own LLM glue | [RAG, cited chat & agents](./rag-chat.mdx) built in |
| Front-end UI | InstantSearch.js / React | Build it (`elasticsearch-js`) | [React SDK](./react-sdk.md) + [zero-dep vanilla-JS SDK](./javascript-sdk.md) |
| Query API | Hosted search API | `_search` DSL | `POST /api/sn/{site}/search` — on your host |
| Hosting & data residency | Fully hosted SaaS | Elastic Cloud or self-managed | Self-hosted — content & embeddings stay in your infra |

> High-level mapping as of the current release — verify current vendor capabilities against their own docs, as hosted features change often.

---

## The fast path: `turing migrate`

The [`turing` CLI](./cli.md) automates schema translation **and** record import in a
single command. Point it at your source index — Turing reads the mapping/settings,
derives the [field manifest](./manifest.md), provisions the SN site, and imports
every record for you. This is the recommended "step 1 + step 2".

```bash
# Elasticsearch — URL + credentials + index only, no vendor SDK
turing migrate elasticsearch \
  --source-url https://es.example.com:9200 \
  --source-user elastic --source-password <password> \
  --index products --site Products \
  --se-instance <search-engine-instance-id>

# Algolia — schema inferred from a sample of records + your index settings
turing migrate algolia \
  --app-id <APP_ID> --api-key <read-capable-key> \
  --index catalog --site Catalog \
  --se-instance <search-engine-instance-id> --use-llm
```

Add `--dry-run` to preview the derived schema (field name, type, facet, multi-valued)
**without** provisioning or importing anything — review it, then run for real. For
Elasticsearch the mapping is translated deterministically (`text`→`TEXT`,
`keyword`→`STRING`, numeric/date/boolean → the matching type; `keyword`/boolean
fields become facets). Algolia has no strict schema, so the types are inferred from
a record sample and refined by your index settings (`attributesForFaceting` →
facets, `searchableAttributes` → text); `--use-llm` sharpens the draft with a
configured LLM. `--se-instance` is only required when the target site doesn't exist
yet. Any **synonyms** on an Algolia index are reported so you can apply them in your
target engine's schema (Solr / Elasticsearch).

Then do only **step 3** below — swap the front-end client.

Prefer to drive the import yourself, or scripting it without the CLI? The same
result is available over the REST API in three moves.

## Doing it by hand: the API path

### 1. Describe the schema as code

Turn your Algolia index settings or Elasticsearch mappings into a [field manifest](./manifest.md) and `POST` it once. Turing converges the live SN site to match — creating the site if it's missing and adding fields — and reports exactly what changed. Re-posting the same manifest is a no-op.

```bash
curl -X POST "http://localhost:2700/api/sn/manifest" \
  -H "Key: <YOUR_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "products",
    "seInstanceId": "<search-engine-instance-id>",
    "schemaVersion": "1",
    "locales": ["en_US"],
    "fields": [
      { "name": "title", "type": "TEXT",     "mandatory": true,  "facet": false },
      { "name": "brand", "type": "STRING",   "mandatory": false, "facet": true  },
      { "name": "price", "type": "CURRENCY", "mandatory": false, "facet": true  }
    ]
  }'
```

Map your field types to the `TurSEFieldType` enum: `INT`, `LONG`, `STRING`, `TEXT`, `ARRAY`, `DATE`, `BOOL`, `FLOAT`, `DOUBLE`, `CURRENCY`. Set `facet: true` for what was `attributesForFaceting` (Algolia) or a keyword aggregation field (Elasticsearch). Prefer to review the schema in a pull request first? `POST /api/sn/manifest/plan` returns the diff without mutating anything. See [Field Manifest & Schema-as-Code](./manifest.md) for the full reference, the planner, and breaking-change migrations.

### 2. Bring your records over

Export your records (Algolia's *Browse* / [export API](https://www.algolia.com/doc/)) or documents (an Elasticsearch `_search` scroll / `_source` dump), reshape each into an SN job item, and bulk-index them through the SN import API. Each attribute map must include an `id`.

```bash
curl -X POST "http://localhost:2700/api/sn/import" \
  -H "Key: <YOUR_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "snJobItems": [
      {
        "locale": "en_US",
        "turSNJobAction": "CREATE",
        "siteNames": ["products"],
        "attributes": {
          "id": "sku-001",
          "title": "Wireless Headphones",
          "brand": "Acme",
          "price": 199.00
        }
      },
      { "turSNJobAction": "COMMIT", "siteNames": ["products"] }
    ]
  }'
```

Finish a batch with a `COMMIT` job item so the search engine flushes pending changes. If your records reference binary files, use the ZIP variant (`POST /api/sn/import/zip`) — Turing extracts text with Apache Tika before indexing. See [Import & Export](./import-export.md#content-import-sn-job-items) for job actions and the full item structure.

:::tip Skip the export entirely
If your content still lives in a source system (a CMS, a database, a file share), point a [connector](./integration.md) at it instead of re-exporting from Algolia/Elasticsearch — the connector crawls the source of truth and keeps the index in sync automatically.
:::

### 3. Swap the front-end client

Replace InstantSearch or the `elasticsearch-js` client with a Turing SDK. Both are headless — hooks and components for search, facets, autocomplete, and cited chat — so your UI now runs against your own host.

```tsx
import { useTuringSearch } from "@viglet/turing-react-sdk";

function ProductSearch() {
  const { results, facets, setQuery } = useTuringSearch({ site: "products" });
  // facets, pagination, typo tolerance and locale come from the same API
  return <ResultList results={results} facets={facets} onQuery={setQuery} />;
}
```

Prefer no framework? The [zero-dependency vanilla-JS SDK](./javascript-sdk.md) exposes the same controllers for plain `<script>` tags, Adobe Edge Delivery blocks, or any bundler. The underlying query API is a single call:

```bash
curl -X POST "http://localhost:2700/api/sn/products/search" \
  -H "Content-Type: application/json" \
  -d '{ "q": "wireless headphones", "fq": ["brand:Acme"], "rows": 20 }'
```

---

## Your data stays in your infrastructure

The reason teams switch: a hosted SaaS keeps your index — and increasingly your users' queries — in someone else's cloud. Turing ES runs entirely on your own hardware.

- **Self-hosted under Apache 2.0** — no license fee, no vendor lock-in.
- **Content, embeddings and query logs stay on-premises** — nothing leaves your network.
- **Bring your own LLM and search engine** — OpenAI, Anthropic, Gemini, Azure or local Ollama; Solr, Elasticsearch or embedded Lucene.
- **No per-record or per-search billing** — cost scales with your infrastructure, not your traffic.

See [Deploy & Operate](./deploy-operate.mdx) for installation, and [Self-hosted, any LLM](https://turing.viglet.org/features/run) for the platform overview.

---

## Related Pages

| Page | Description |
|---|---|
| [Field Manifest & Schema-as-Code](./manifest.md) | Provision and evolve the SN field schema declaratively |
| [Import & Export](./import-export.md) | Site config and content import APIs in full |
| [Integration](./integration.md) | Connectors that crawl a source system into the index |
| [Semantic Navigation](./semantic-navigation.md) | How fields are searched, faceted and ranked |
| [RAG & Chat](./rag-chat.mdx) | Add cited AI answers over the content you just imported |
| [React SDK](./react-sdk.md) · [JavaScript SDK](./javascript-sdk.md) | Front-end clients that replace InstantSearch |

---
