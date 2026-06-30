---
sidebar_position: 10
title: Field Manifest & Schema-as-Code
description: Provision and evolve a Semantic Navigation site's field schema declaratively in Viglet Turing ES — idempotent manifests, planner/migrations, LLM-assisted derivation, hybrid ranking, and field-coverage observability.
---

# Field Manifest & Schema-as-Code

A **field manifest** is a single declarative document that describes a Semantic Navigation site and its field schema — the site name, its locales, and the ordered list of fields (each with a type, and whether it's a facet, mandatory, or multi-valued). You `POST` it once and Turing ES **converges** the live site to match it: it creates the site if missing, adds any new fields, and reports what changed. Re-posting the same manifest is a no-op.

You'd reach for this when you want your search schema to live in version control next to your code instead of being clicked together by hand in the admin — "Liquibase for the SN field schema." It's the backbone of repeatable onboarding: a new environment, a new tenant, or a CI pipeline can stand up an identical, reviewed schema from one file. Around that core, Turing adds four things: a **planner** that diffs a manifest against the live site (so breaking changes can't slip through silently), **LLM-assisted derivation** that drafts a manifest from sample documents, **hybrid RRF ranking** for the public search, and **field-coverage** observability so you can see which fields are actually populated.

> This page is about the *structured-source indexing* line (Block R). For how documents get into the index in the first place, see [Search Engine](./search-engine.md); for how fields are searched and faceted, see [Semantic Navigation](./semantic-navigation.md).

---

## From zero: provision a site from a manifest

`POST /api/sn/manifest` with a manifest body. This creates-or-converges the `products` site and its fields:

```json
POST /api/sn/manifest
{
  "name": "products",
  "description": "Product catalog",
  "seInstanceId": "<search-engine-instance-id>",
  "schemaVersion": "1",
  "locales": ["en_US", "pt_BR"],
  "fields": [
    { "name": "title",  "type": "TEXT",     "mandatory": true,  "multiValued": false, "facet": false },
    { "name": "brand",  "type": "STRING",   "mandatory": false, "multiValued": false, "facet": true  },
    { "name": "price",  "type": "CURRENCY", "mandatory": false, "multiValued": false, "facet": true  },
    { "name": "tags",   "type": "STRING",   "mandatory": false, "multiValued": true,  "facet": true  }
  ]
}
```

The response tells you exactly what converged:

```json
{
  "siteId": "...",
  "siteName": "products",
  "siteCreated": true,
  "fieldsCreated": ["title", "brand", "price", "tags"],
  "fieldsSkipped": [],
  "fieldsMigrated": [],
  "localesCreated": ["en_US", "pt_BR"],
  "schemaVersion": "1"
}
```

Run it a second time and everything moves to `fieldsSkipped` — the operation is **idempotent**. Add a field or a locale and re-post: that's purely additive, applied with no reindex.

:::note Field types
`type` is a `TurSEFieldType` enum name: `INT`, `LONG`, `STRING`, `TEXT`, `ARRAY`, `DATE`, `BOOL`, `FLOAT`, `DOUBLE`, `CURRENCY`. The same field spec is what the indexer carries at index time — the manifest path and the index-time auto-create path share one provisioner, so a manifested field and an auto-created field are identical.
:::

---

## Schema-as-code: planner & migrations

Additive changes (new field, new locale) are safe and silent. But changing an **existing** field's `type` or its `multiValued` flag is **breaking** — the search-engine field must be dropped and rebuilt, which means the source has to reindex. Turing refuses to do that implicitly.

### Dry-run the diff

`POST /api/sn/manifest/plan` returns the diff without mutating anything — ideal for review in a pull request:

| Diff bucket | Meaning |
|---|---|
| `fieldsToAdd` | New fields — additive, applied silently on provision |
| `localesToAdd` | New locales — additive |
| `fieldsUnchanged` | Already match the manifest |
| `breakingChanges` | A `type` or `multiValued` change on an existing field — requires a declared migration |

Facet / mandatory / description tweaks are **not** breaking — they don't require a reindex, so the planner applies them without ceremony.

### Declaring a migration

If `plan` reports a breaking change and you provision anyway, `POST /api/sn/manifest` returns **HTTP 409** and mutates nothing. To apply the change, declare it explicitly in the manifest's `migrations` list as a `RECREATE` action for that field. On provision, Turing then drops the field across every locale core, deletes its rows, and recreates it from the new spec.

:::warning RECREATE is destructive
A `RECREATE` migration drops the field's indexed data. The source **must reindex** to repopulate it. This is the deliberate safety trade: breaking schema changes are explicit, reviewable, and never accidental.
:::

The `schemaVersion` field is an informational tag you bump as your schema evolves — it travels through to the provision result so you can audit which version a site is on.

---

## LLM-assisted derivation

Hand-declaring fields for an unfamiliar source is tedious. **Derivation** flips it around: feed Turing a sample of the source's documents and it returns a **draft** manifest for you to review.

`POST /api/sn/manifest/derive` with the site identity plus a `documents` array (parsed JSON objects):

```json
POST /api/sn/manifest/derive
{
  "name": "products",
  "seInstanceId": "<search-engine-instance-id>",
  "locales": ["en_US"],
  "documents": [ { "title": "...", "brand": "...", "price": 19.9 }, ... ]
}
```

How the draft is built (it works **with or without** an LLM):

1. **Analyze** — a pure analyzer computes per-field observations: coverage (% of docs that populate it), observed types, cardinality, multi-valued-ness, max length, and samples. A `null` value counts as **absent** (lowering coverage), never as present.
2. **Heuristics** — a deterministic baseline: numeric/date/boolean and low-cardinality string fields become facets; `TEXT` never facets; near-100%-coverage fields become mandatory; mixed numerics widen to `DOUBLE`.
3. **LLM refine (optional)** — when a default LLM is configured, it *refines* the baseline, grounded on the observations. It is conservative: it only refines **observed** fields — invented field names are dropped and omitted fields keep their heuristic spec; any LLM error falls back to the heuristic draft.

The draft is **never auto-provisioned** — you review it and `POST` it back to `/api/sn/manifest`. Check whether an LLM is available with `GET /api/sn/manifest/derive/available` → `{ "llmAvailable": true|false }`.

### The admin wizard

In the console, the SN site **Fields** page has a **"Generate from sample"** action that runs this end-to-end: paste or upload sample JSON/NDJSON → review the drafted field table → apply. Apply converges through `POST /api/sn/manifest` (not raw field creation), so existing fields are pre-excluded and re-applying is a no-op.

---

## Hybrid ranking for public search

Field manifests define *what* is searchable; **hybrid ranking** improves *how well* the public faceted search ranks results. It's an opt-in per-site mode that fuses keyword (BM25) and vector relevance using Reciprocal Rank Fusion.

| Mode | Behaviour |
|---|---|
| `LEGACY` *(default)* | Pure lexical (BM25) ranking — unchanged |
| `HYBRID_RRF` | Reorders the BM25 result page by fusing it with a vector pass (RRF, `k=60`) |

Because public SN documents aren't embedded by the lexical engine, Turing maintains a parallel per-site vector collection (`sn_<siteId>`) using the default embedding model + store, side-writing embeddings as documents are indexed/de-indexed. At query time it reorders **only** the current BM25 page, and **only** when sorting by relevance on a non-wildcard, ungrouped query — so **facet counts and pagination stay BM25-derived** (the ranking changes, the result set doesn't). It is fully **fail-open**: no default embedding model/store, an embedding error, or a store outage silently degrades to legacy lexical order. Configure it on the SN site's **Generative AI** page ("Hybrid Ranking (Public Search)").

> This is distinct from the RAG hybrid retrieval that powers the chat `search_knowledge_base` tool — different corpus, different surface. See [Reranking](./reranking.md) for that path.

---

## Field-coverage observability

Once a schema exists, the question becomes *"is it actually being populated?"* `GET /api/sn/{snSiteId}/field-coverage` answers it: for every **enabled** field, the percentage of indexed documents that populate it, summed across all locales, **worst-coverage first**.

```json
{
  "siteId": "...",
  "totalDocuments": 1200,
  "supported": true,
  "fields": [
    { "name": "warranty", "coverage": 0.12, "supported": true },
    { "name": "brand",    "coverage": 0.94, "supported": true }
  ]
}
```

The admin surfaces this as its own nav item with red / amber / green bars (`< 50%` / `< 80%` / else). A field whose search engine can't report a count comes back as **unsupported** (`-1` → shown as "unknown", never a misleading 0%) — Solr, Lucene, and Elasticsearch all implement the count; engines that don't degrade gracefully.

A near-empty field is a signal: either the source isn't sending it (a connector mapping gap) or the field was declared optimistically. It's the data-quality counterpart to the manifest's *absent ≠ empty* contract.

---

## Endpoint reference

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/sn/manifest` | Provision/converge a site + fields from a manifest (idempotent) |
| `POST` | `/api/sn/manifest/plan` | Dry-run — return the diff without mutating |
| `POST` | `/api/sn/manifest/derive` | Draft a manifest from sample documents (never auto-applied) |
| `GET` | `/api/sn/manifest/derive/available` | `{ llmAvailable }` — is an LLM configured for refinement? |
| `GET` | `/api/sn/{snSiteId}/field-coverage` | Per-field population % (worst first) |

---

## Related Pages

| Page | Description |
|---|---|
| [Search Engine](./search-engine.md) | How content is indexed; field types and cores |
| [Semantic Navigation](./semantic-navigation.md) | Sites, fields, facets, and the public search |
| [Reranking](./reranking.md) | RAG hybrid retrieval for the chat tool (distinct corpus) |
| [Embedding Models](./embedding-models.md) | The model behind the `sn_<siteId>` hybrid vectors |
| [Import / Export](./import-export.md) | Other ways to move site config between environments |
