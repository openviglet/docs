---
sidebar_position: 3
title: Search & Caching
description: "Full-text search in Shio, the opt-in Viglet Turing ES indexing that makes content searchable on publish, and the caching layers between a request and the database."
---

# Search & Caching

Two different things share this page because they are both about what happens *between* a
request and your content: how content is found, and how a repeated read is made cheap.

---

## Full-text search

Search over your content works with **no extra infrastructure**. It runs in the database
you already configured, and it is what the console's search box and the delivery API's
query endpoint both use.

| Surface | Call |
|---|---|
| The delivery API | `GET /api/v2/cda/query?q=…` (scoped by site, folder or post type) |
| An agent | `GET /api/v2/agent/find?q=…`, or the `shio_find` tool |
| The console | The search box in the content browser |

It searches titles, summaries and content, within the sites the caller is allowed to read.
This is a **database full-text search**: good for finding a page by a phrase, and not a
faceted search engine. For that, see the next section.

---

## Viglet Turing ES indexing

For faceted navigation, autocomplete, semantic search and RAG-powered answers, Shio
**indexes published content into [Viglet Turing ES](/turing/)**.

:::warning Indexing is opt-in and off by default
Earlier documentation said content is "automatically indexed… no additional configuration
required". That was never true of Turing indexing, and it is worth being precise about,
because the failure mode is a site that appears to have search and does not.

**Nothing is indexed until you enable it**, and indexing happens **when content is
published**: not when it is created or saved. A draft is never in the index.
:::

Sending content to another system on every publish is exactly the kind of surprise a CMS
should not spring on an operator, which is why the default is off.

### Turning it on

```properties
shio.turing.enabled=true                    # default false
shio.turing.url=http://localhost:2700
shio.turing.api-key=<key>
shio.turing.default-site=my-sn-site         # for any Shio site not named below
shio.turing.sites.Cafeteria=cafeteria-sn    # Shio site name → Turing SN site name
shio.turing.source-app=shio
shio.turing.de-index-on-unpublish=true
```

### Indexing what was already published

Because indexing happens on publish, switching it on for a site that **already has
content** leaves the index empty — nothing is republished just because you changed a
setting, and there is no error to tell you.

Back-fill it with `data.reindex` on a `site.upsert`:

```json
{ "ops": [ { "op": "site.upsert", "address": "site:mysite",
             "data": { "reindex": true, "limit": 200 } } ] }
```

It sends the site's already-published posts through the same mapping a publish uses, so a
back-filled document and a freshly-published one are identical. One call does one page:
`data.limit` (200, max 1000) bounds it and `data.from` resumes, because a site of ten
thousand posts turned into ten thousand queued jobs at once would be an outage of the
publish path rather than a slow back-fill. The reply says how many were sent, how many
were not accepted, and how many are left with the offset to continue from.

Run it with `dryRun` first to see the count without sending anything. On an instance
where indexing is off it is a no-op that says so, rather than a failure — so it is safe
in a build sequence that runs against instances of both kinds.

There are **three independent conditions**, each answering a different question, and all
three must hold before anything is sent:

1. `shio.turing.enabled=true`, does this instance index at all?
2. A configured `url`, does it know where to send?
3. A resolved Turing site for *this* Shio site, does this site route anywhere?

**None of the three failing is an error.** An instance that does not index is not a broken
instance, and a site with no mapping and no `default-site` is simply not indexed, guessing
a target would either create documents in the wrong index or fail once per publish, for
ever.

### Which events index

| In Shio | In Turing |
|---|---|
| Publish | index / re-index the document |
| Unpublish | de-index (unless `de-index-on-unpublish=false`) |
| Delete | de-index |
| Save a draft | nothing |

Indexing happens **after the transaction commits**, so a publish that rolls back never
reaches the index, and a slow Turing never becomes a slow publish. A failed push is
recorded as an incident you can read at `/api/v2/agent/diagnostics` rather than thrown at
the person who clicked publish.

### Routing is configuration, not content

Which Turing site a Shio site feeds is a **deployment** fact: staging and production hold
the same content and must feed different indexes. Keeping it in configuration is why
exporting a site and importing it elsewhere does not carry one environment's index routing
into another. Names are matched case-insensitively, because they are typed by people into
two different systems.

### Mapping fields

When you model a post type, each field can be mapped to a Turing Semantic Navigation
field (Title, Description, Text, Date, URL, Image) or to a custom field for facets and
filtering. That mapping is what decides how a document is shaped in the index.

### What Turing adds

| Feature | Description |
|---|---|
| **Faceted search** | Filter by category, date, author, or any mapped field |
| **Autocomplete** | Type-ahead suggestions |
| **Semantic navigation** | A configurable search experience with ranking control |
| **Generative AI** | RAG answers grounded in your content, with citations |
| **Spotlights** | Curated results pinned to specific terms |

A search context is exposed at `/__tur/sn/{siteName}`, which proxies to the configured
Turing instance so a page can use Turing's search without talking to it directly.

---

## Caching

There is no single cache; there are four layers, each with a different invalidation story.
Knowing which one you are looking at is usually the whole of a "why am I seeing stale
content?" question.

| Layer | Applies to | Lifetime | Invalidated by |
|---|---|---|---|
| **HTTP `ETag` + `304`** | Delivery API reads, most agent reads | until the content changes | the content changing: the tag is derived from it |
| **`Cache-Control`** | Delivery API (`shio.cda.cache.max-age-seconds`, default 60) and the public page route (`max-age=300`) | the configured window | time only: put a purge hook in front of a CDN if you publish often |
| **Per-transaction render caches** | One page render | one read-only transaction | nothing: it cannot outlive the request |
| **Hazelcast** | Distributed object caching within a cluster | configured | content writes |

Two rules that follow from the table:

- **The preview route is never cached.** `/preview/**` is `no-store`, because a freshness
  window is how a preview quietly becomes infrastructure.
- **A conditional read is free.** Sending `If-None-Match` on an agent or delivery read that
  has not changed costs a round trip and no body, which is what makes polling
  `/agent/changes` cheap enough to do often.

---

## Related Pages

| Page | Description |
|---|---|
| [Content Modeling](./content-modeling.md) | Mapping post-type fields to search fields |
| [Content Delivery API](./headless/content-delivery-api.md) | The query endpoint, ETags and cache headers |
| [Configuration Reference](./configuration-reference.md) | Every `shio.turing.*` and `shio.cda.*` property |
| [The Agent Surface](./agent-surface.md) | `find`, and the diagnostics an index failure lands in |
