---
sidebar_position: 5
title: Vectorless (Structured-Data) RAG
description: Answer questions over a structured catalog — products, prices, specs, a model registry — grounded and cited, using only an LLM and your search index. No embeddings, no vector store.
---

# Vectorless (Structured-Data) RAG

**Talk to a structured catalog — grounded, cited, with no vector database.** Viglet
Turing ES can answer questions over your product catalog, price list, spec sheet,
or model registry using only a language model and your existing search index — no
embeddings, no vector store, and no chunking pipeline to stand up.

---

## What it is

Most RAG (Retrieval-Augmented Generation) needs a vector database: your content is
chunked, each chunk is turned into an embedding vector, stored in an [Embedding
Store](./embedding-stores.md), and queries are matched by cosine similarity. That
is the right tool for **unstructured prose** — articles, manuals, support tickets.
See [What is RAG?](./rag.md) for that path.

But when your knowledge is **structured** — rows with named fields such as `price`,
`contextWindow`, `category`, `inStock`, `rating` — you do not need any of that.
Turing parses the user's question into a search over your **declared field
schema**, runs it against the search engine (Solr / Elasticsearch / Lucene) as
ordinary field / facet / range queries, and the language model answers **strictly
from the matched rows**, citing each claim as `[1]`, `[2]`, …

This is **Vectorless (Structured-Data) RAG**, and it needs only a **default LLM**.

```
question ──▶ NL→filter over your declared schema ──▶ structured search (no embeddings)
                                                        │
              cited answer  ◀── LLM (grounded, [n]) ◀──┘
```

## When to use which mode

Each Semantic Navigation site has a **Knowledge Base Mode**, set on **Semantic
Navigation → (site) → Generative AI → Knowledge Base Mode**:

| Mode | Best for | Requires |
| ---- | -------- | -------- |
| **Vector** (default) | Prose / unstructured content — articles, docs, manuals, support tickets | Embedding model **+** vector store on the bound AI Agent |
| **Vectorless (Structured)** | A structured catalog — products, prices, specs, a model registry | **Only a default LLM** |
| **Hybrid** | A site that has both prose *and* structured attributes | The full vector setup (a superset of Vector) |

The default is **Vector**, so every existing site is unchanged. Choosing
**Vectorless (Structured)** makes the AI-Mode readiness check report the site as
ready as soon as a default LLM is configured — instead of asking you to wire up an
embedding model and a vector store you do not need.

## Vectorless disables embedding indexing entirely

This is the key guarantee to be sure of when you pick the mode. When a site is set
to **Vectorless (Structured)**, Turing **never generates embeddings for it** — on
any path:

- **No embedding at import / reindex.** Documents are indexed into the search
  engine as structured fields only; nothing is embedded into a vector store. The
  **Reindex embeddings** button disappears from the GenAI form.
- **Even if the AI Agent has RAG on.** A site with no AI Agent of its own falls
  back to the global **Default AI Agent**. In Vectorless mode this fallback no
  longer causes embedding: the site stays vectorless **even when that Default AI
  Agent (or a directly-bound agent) has RAG enabled**. The mode is the deciding
  switch, not the agent.
- **No ANN (vector) search.** The **ANN Search** launcher and the vector-based
  hybrid ranking are turned off for the site; its public search runs on the pure
  lexical path.

The GenAI form shows an explicit **"Embedding indexing is OFF for this site"**
notice while Vectorless is selected, so the configuration is never a surprise.
Switch back to **Vector** or **Hybrid** to re-enable embedding indexing.

## How to turn it on

1. **Index your structured records.** Push them to `POST /api/sn/import` (each
   record's attributes become searchable fields), or configure the scheduled
   JSON-feed ingester (`turing.genai.structured-feed`) to *pull* a remote feed on
   a schedule. A deployment can even auto-provision the whole site from env config.
2. **Declare the field schema.** Enable the fields you want the assistant to reason
   over (`price`, `contextWindow`, `kind`, …) as Semantic Navigation site fields,
   with facet/type set correctly. The NL→filter step may only reference **declared**
   fields — anything it cannot ground is dropped, and it never invents a field.
3. **Set Knowledge Base Mode = Vectorless (Structured)** on the site's Generative
   AI form.
4. **Configure a default LLM** in Global Settings.

## Asking questions

`POST /api/sn/{siteName}/copilot`

```json
{
  "messages": [
    { "role": "user", "content": "cheapest embedding model with at least 1M context?" }
  ],
  "locale": "en"
}
```

The response is a grounded answer plus a `citations[]` array — each citation is a
matched row (id, title, optional link, score) the answer is allowed to reference.
Multi-turn is supported: pass the running conversation and the latest user turn
drives retrieval.

`GET /api/sn/{siteName}/copilot/available` reports whether a default LLM is
configured (i.e. whether the copilot can answer).

### Ranking & superlative questions

Superlative and comparative questions are understood out of the box — "the
**cheapest** embedding model", "which chat model scores **highest** on the
intelligence index", "the model with the **biggest** context window", "chat models
**sorted by** price". Turing recognises the ranking phrase and sorts the results by
the matching **numeric** field in your declared schema (ascending for a minimum —
cheapest / lowest / smallest / fastest — descending for a maximum — highest /
largest / most / best), while still keeping any facet filter in the same question
("**chat** models sorted by intelligence index" stays scoped to chat models).

This works generically for any catalog: the sort field is resolved from your
fields' **names and descriptions**, so a clear description
(`"Overall intelligence index"`, `"Input price per 1M tokens (USD)"`,
`"Maximum context window in tokens"`) is what lets Turing map "most intelligent",
"cheapest" or "biggest context" to the right field. Give each ranking field a
descriptive `description` in its manifest and superlative questions just work.

### From React (SDK)

The `@viglet/turing-react-sdk` ships a `useTuringCopilot` hook and an embeddable
`TuringCopilot` widget bound to the endpoint above — the copilot analogue of the
vector-RAG chat, fully skinnable via a `classNames` map. See the
[JavaScript SDK](./javascript-sdk.md).

## Guarantees

- **Grounded** — the answer asserts nothing that is not in the matched rows; the
  parser never invents a field.
- **Cited** — every claim carries the `[n]` of the row it came from, and the
  returned citations are limited to the rows the answer actually references.
- **Objective ranking** — results are ordered by relevance / objective signals
  only; no paid placement ever enters the pipeline.
- **Fail-open** — a parse failure degrades to a free-text query, a ranking failure
  degrades to lexical order, and an LLM failure still returns the matched citations
  so the client can render results without a synthesized answer.

## Over the OpenAI-compatible gateway (zero SDK)

Any OpenAI-style client can get grounded, cited structured answers with **no
Turing SDK** through the [Governed LLM Gateway](./llm-gateway.md) — either a
`turing-copilot:<site>` model name or an `x-turing-copilot-site: <site>` header
routes the request to the vectorless copilot. The cited rows come back as a
plain-text **Sources** footer so the answer stays traceable over the OpenAI wire
format.

```bash
curl -sX POST https://<host>/v1/chat/completions \
  -H "authorization: Bearer sk-turing-…" \
  -H "content-type: application/json" \
  -d '{"model":"turing-copilot:model-catalog",
       "messages":[{"role":"user","content":"cheapest embedding model with >= 1M context?"}]}'
```

## Stuff-all mode (small catalogs)

For a catalog small enough to fit in one prompt (a few hundred rows), the copilot
can skip retrieval entirely and ground the LLM on **every** row — the
extreme-vectorless path. It is **self-gating by size**: enabled by default, it only
activates when the whole index fits within a token budget and document cap, and
otherwise falls back to the normal filtered retrieval. Answers stay cited and
fail-open either way. Configure under `turing.genai.copilot`:

```yaml
turing:
  genai:
    copilot:
      stuff-all-enabled: true       # default
      stuff-all-token-budget: 40000 # ~a few hundred rows
      stuff-all-max-docs: 1000
```

## Indexing large catalogs (performance)

A structured catalog can be big — hundreds or thousands of rows. Turing indexes a
catalog-scale import in a **single bulk pass** rather than one document at a time,
so a large feed lands fast. This is automatic and needs no configuration: when a
batch of records arrives, they are grouped and written to the search engine in one
bulk request with a single commit, the field schema is converged once for the whole
batch (not re-checked per row), and the embedded **Lucene** engine writes the whole
batch in one writer session with one flush. If a bulk write fails, indexing falls
back to one-document-at-a-time automatically, so robustness is unchanged.

### Chunking the scheduled feed

When you use the scheduled JSON-feed ingester (`turing.genai.structured-feed`), a
large feed is split into **bounded chunks** — each chunk is imported and committed
on its own, with per-chunk progress in the logs, and one failing chunk never aborts
the rest. Tune the chunk size for very large feeds:

```yaml
turing:
  genai:
    structured-feed:
      batch-size: 200   # records per chunk (default 200; 0 = one unbounded chunk)
```

De-index of rows that vanished from the feed is still computed over the whole run,
so chunking never changes which stale rows are reconciled.

### Direct bulk-index fast path (advanced, opt-in)

For a **very large reindex of a Vectorless site**, the asynchronous indexing queue
buys nothing — its purpose is to offload embedding work, and a vectorless site does
none. An opt-in endpoint writes the documents straight to the search engine in
bounded chunks, skipping the queue:

```yaml
turing:
  sn:
    import:
      bulk-direct:
        enabled: false   # default off — the ordered queue stays the default path
        batch-size: 500  # documents per direct chunk
```

```
POST /api/sn/import/bulk      # same TurSNJobItems body as POST /api/sn/import
```

It is **vectorless-only**: if any target site has embeddings enabled, the request
transparently falls back to the normal queued import — never rejected, never
skipping a site's embedding. Leave it **off** unless you are reindexing a large
vectorless catalog and have measured that the queue is the bottleneck.

## Live example

The public [`openviglet/model-catalog`](https://openviglet.github.io/model-catalog/)
is dogfooded as the first vectorless knowledge base on `turing-demo.viglet.org` —
ask it *"cheapest embedding model with ≥ 1M context?"* and it answers with linked,
cited model rows.
