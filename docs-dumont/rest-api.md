---
sidebar_position: 10
title: REST API Reference
description: "Complete REST API reference for Dumont DEP: connector, monitoring, indexing rules, AEM plugin, and system information endpoints."
---

# REST API Reference

Dumont DEP exposes a REST API for triggering indexing operations, monitoring progress, managing sources, and configuring indexing rules. All endpoints use JSON and support CORS.

---

## Connector API

Base path: `/api/v2/connector`

### Health Check

```
GET /api/v2/connector/status
```

Returns `{"status": "ok"}` if the service is running.

---

### Index All Content

```
GET /api/v2/connector/index/{name}/all
```

Triggers a full indexing operation for all content in the specified source.

| Parameter | Location | Description |
|---|---|---|
| `name` | Path | Source name |

**Response:** `{"status": "sent"}`

---

### Index Specific Content

```
POST /api/v2/connector/index/{name}
```

Indexes specific documents by their IDs.

| Parameter | Location | Description |
|---|---|---|
| `name` | Path | Source name |
| *(body)* | JSON | Array of content IDs: `["id-1", "id-2"]` |

**Response:** `{"status": "sent"}`

---

### Reindex All Content

```
GET /api/v2/connector/reindex/{name}/all
```

Deletes the existing index and reindexes all content from the source.

| Parameter | Location | Description |
|---|---|---|
| `name` | Path | Source name |

**Response:** `{"status": "sent"}`

---

### Reindex Specific Content

```
GET /api/v2/connector/reindex/{name}
```

Deletes and reindexes specific documents.

| Parameter | Location | Description |
|---|---|---|
| `name` | Path | Source name |
| *(body)* | JSON | Array of content IDs |

**Response:** `{"status": "sent"}`

---

### Validate Source

```
GET /api/v2/connector/validate/{source}
```

Validates content differences between the source and the search index. Used by the Turing ES Double Check feature.

| Parameter | Location | Description |
|---|---|---|
| `source` | Path | Source name |

**Response:** `DumConnectorValidateDifference`: lists missing and extra documents.

---

## Orphan Reports

Base path: `/api/v2/connector/orphans`

An **orphan** is a document the search index still holds after it left the source. The content
audit never deletes one, because an orphan is only an orphan if the discovery pass that failed to
mention it was complete — a gateway that timed out, or a listing that paginated short, makes every
unlisted id look like a ghost. Deleting on that evidence would take live content out of the index.

So each audit pass writes the ids it found into a dated report and stops there. You read the
report, decide whether it describes content that genuinely went away, and then apply or discard
it. Applying goes through the connector's own de-index path, so the indexing ledger and the search
index stay in step.

The console has an **Orphan Reports** screen over these endpoints, which is the easier way to do
the review — it shows each report's id count against how many documents the site indexes, so a
report naming most of the index reads as a failed discovery pass rather than a cleanup. The
endpoints below are for scripting it.

A report is per source and per site, and only the newest one stands: a later pass supersedes the
report it replaces, and a pass that finds no orphan retracts it. A report also expires — see
[`dumont.audit.index.orphanTtl`](configuration-reference.md#content-audit) — because applying
evidence that a reindex has since overtaken would delete live documents.

To produce a report on demand rather than waiting for the cron, run the audit:

```
GET /api/v2/connector/audit/{source}
```

### List Reports

```
GET /api/v2/connector/orphans
GET /api/v2/connector/orphans?source={source}
GET /api/v2/connector/orphans/{id}
```

Newest evidence first. Each report carries its `source`, `provider`, `site`, the `objectIds` it
found, `discoveredAt`, `expiresAt`, whether it has already `expired`, and a `status` of `pending`,
`applied` or `discarded`.

### Apply a Report

```
POST /api/v2/connector/orphans/{id}/apply
```

De-indexes every id in the report from its site and drops the matching ledger rows, then closes
the report. **Response:** `{ "status": "applied", "deindexed": 12 }`.

| Status | Meaning |
|---|---|
| `200` | Applied — `deindexed` says how many delete jobs were queued |
| `404` | No report carries that id, or a later pass superseded it |
| `409` | Already applied or discarded — a decision is made once |
| `410` | The evidence aged past `dumont.audit.index.orphanTtl`; re-run the audit |

### Discard a Report

```
POST /api/v2/connector/orphans/{id}/discard
```

Closes the report without deleting anything — the right answer when the source was unreachable
during the pass that produced it. **Response:** `{ "status": "discarded" }`.

---

## Logging API

Base path: `/api/v2/connector/logging`

The **indexing log** records every status a document passes through — prepared, sent to the queue,
delivered to the search engine. Each row names the document, the source that produced it and the
transaction id of the run it belonged to, so you can ask what one source did or replay a single
run end to end.

It needs a store: see [Indexing Log configuration](configuration-reference.md#indexing-log). With
no engine configured the endpoints below answer with an empty page.

### Is It On?

```
GET /api/v2/connector/logging/status
```

**Response:** `{ "engine": "mongodb", "enabled": true }`.

### Read the Log

```
GET /api/v2/connector/logging/indexing
```

| Parameter | Description |
|---|---|
| `source` | Everything one source did |
| `transactionId` | Everything that happened in one run |
| `contentId` | One document's whole history |
| `status` | `PREPARE_INDEX`, `SENT_TO_QUEUE`, `RECEIVED_AND_SENT_TO_TURING`, `DEINDEXED`, … |
| `resultStatus` | `SUCCESS` or `ERROR` |
| `url` | Case-insensitive substring match on the document URL |
| `dateFrom`, `dateTo` | `YYYY-MM-DD`, inclusive |
| `page`, `pageSize` | Default `0` and `100` |
| `sort` | `desc` (default) or `asc`, by date |

Filters combine, and any you omit is simply not applied. **Response:**
`{ content, page, pageSize, totalElements, totalPages }`.

Rows written by a connector older than 2026.3.6 carry no source or transaction id. They still
appear in an unfiltered listing — an unattributed row is a fact about an old message, not
something to hide — but they cannot answer a query that names a source.

:::note
On the Redis engine only `contentId`, `source` and `transactionId` are applied; the date, status,
result-status and url filters are MongoDB-only.
:::

---

## Source Inference API

Base path: `/api/v2/connector/source/infer`

Proposes a structured source from a URL, previews what indexing it would produce, and indexes the
draft a human has confirmed. Nothing here publishes on its own: `infer` and `preview` write
nothing, and `infer/index` runs only on a draft you send back.

### Propose a Source

```
POST /api/v2/connector/source/infer
```

Fetches a sample of the URL, classifies its shape (`SITEMAP`, `HTML_LISTING`,
`TABULAR_LISTING`, or `UNKNOWN`) and proposes an editable draft: the strategy configuration plus a
field manifest with a type per field.

**Body:** `{ "url": "https://example.com/courses" }`

**Response:** `DumSourceDraft`: the shape, the strategy configuration, and the inferred fields.

It proposes *structure* — selectors and field types — never content, and returns `UNKNOWN` rather
than guessing when the sample gives it nothing to go on.

### Dry-Run Preview

```
POST /api/v2/connector/source/infer/preview?sampleSize=20
```

Extracts a bounded sample through the same discover → extract → enrich path a real run uses, and
reports what would happen: per-field coverage, records that would be skipped for a missing
mandatory field, and a diff against the last full index — added, changed, removed, and fields that
would go newly empty — plus a schema diff. **Writes nothing.**

| Parameter | Location | Default | Description |
|---|---|---|---|
| `sampleSize` | Query | `20` | Records to extract for the preview |

**Body:** the confirmed draft, as sent to `infer/index` below.

**Response:** `{ success, preview, message }`.

On a source's first onboarding there is no baseline, so everything reads as added.

### Index a Confirmed Draft

```
POST /api/v2/connector/source/infer/index
```

Materialises the draft into a live structured source and indexes it. This is the only endpoint of
the three that writes, and it acts on the draft in the request body — a proposal is never indexed
without being sent back.

**Body:** `{ "url", "sourceName", "siteNames": [...], "locale", "draft" }`

**Response:** `{ success, source, message }`.

---

## Monitoring API

Base path: `/api/v2/connector/monitoring`

### Get Indexing Status

```
GET /api/v2/connector/monitoring/index/{source}
```

Returns indexing status records for a specific source. Returns `404` if no records found.

---

### Get All Monitoring Data

```
GET /api/v2/connector/monitoring/indexing
```

Returns all indexing monitoring data across all sources.

---

### Get Monitoring by Source

```
GET /api/v2/connector/monitoring/indexing/{source}
```

Returns monitoring data filtered by source name.

---

### Search Monitoring Records

```
POST /api/v2/connector/monitoring/indexing/_search
```

Searches indexing monitoring records with pagination and filters.

**Request body:**

```json
{
  "source": "WKND",
  "status": "INDEXED",
  "page": 0,
  "size": 20
}
```

---

### Get Monitoring by Content IDs

```
POST /api/v2/connector/monitoring/indexing
```

**Request body:** Array of content IDs.

---

### Indexing Statistics

```
GET /api/v2/connector/monitoring/indexing/stats
GET /api/v2/connector/monitoring/indexing/stats/{source}
```

Returns indexing operation statistics (start time, document count, duration, throughput). Returns `404` if no stats found.

---

## System Information API

```
GET /api/v2/connector/system-info
```

Returns runtime system information consumed by the Turing ES Integration → System Information page:

- Application name and version
- Java version, vendor, and JVM details
- Operating system name and version
- Physical memory (total, used, free)
- JVM heap memory (total, used, free)
- Disk space (total, used, free)

---

## Indexing Rules API

Base path: `/api/v2/connector/indexing-rule`

CRUD operations for managing regex-based indexing rules that filter content during extraction.

### List All Rules

```
GET /api/v2/connector/indexing-rule
```

### List Rules by Source

```
GET /api/v2/connector/indexing-rule/source/{source}
```

### Get Rule by ID

```
GET /api/v2/connector/indexing-rule/{id}
```

### Create Rule

```
POST /api/v2/connector/indexing-rule
```

**Request body:**

```json
{
  "name": "Exclude error pages",
  "source": "WKND",
  "attribute": "template",
  "ruleType": "IGNORE",
  "values": ["error-page", "redirect"]
}
```

### Update Rule

```
PUT /api/v2/connector/indexing-rule/{id}
```

**Request body:** Same as create.

### Delete Rule

```
DELETE /api/v2/connector/indexing-rule/{id}
```

**Response:** `true` if deleted, `false` if not found.

### Get Empty Structure

```
GET /api/v2/connector/indexing-rule/structure
```

Returns an empty model for reference.

---

## AEM Plugin API

Base path: `/api/v2/aem`

These endpoints are available when the AEM plugin JAR is loaded via `-Dloader.path`.

### Health Check

```
GET /api/v2/aem/status
```

Returns `{"status": "ok"}`.

---

### Index AEM Paths

```
POST /api/v2/aem/index/{source}
```

Triggers indexing for specific AEM content paths. Includes built-in deduplication, repeated requests for the same paths within 30 seconds are ignored.

| Parameter | Location | Description |
|---|---|---|
| `source` | Path | AEM source name (e.g., `WKND`) |
| *(body)* | JSON | `DumAemPathList` object |

**Request body:**

```json
{
  "paths": ["/content/wknd/us/en/about"],
  "event": "INDEXING",
  "recursive": false,
  "attribute": "ID"
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `paths` | string[] | *(required)* | AEM content paths |
| `event` | string | `INDEXING` | `INDEXING`, `DEINDEXING`, `PUBLISHING`, or `UNPUBLISHING` |
| `recursive` | boolean | `false` | Traverse child nodes |
| `attribute` | string | `ID` | `ID` (path-based) or `URL` (URL-based) |

**Response:** `{"status": "sent"}`

---

### AEM Source Management

CRUD operations for AEM source configurations.

#### List All Sources

```
GET /api/v2/aem/source
```

#### Get Source by ID

```
GET /api/v2/aem/source/{id}
```

#### Create Source

```
POST /api/v2/aem/source
```

**Request body:** Full `DumAemSource` JSON (see [Extending the AEM Connector, Configuration JSON](./extending-aem.md#aem-configuration-json)).

#### Update Source

```
PUT /api/v2/aem/source/{id}
```

Returns `400` if ID mismatch, `404` if not found.

#### Delete Source

```
DELETE /api/v2/aem/source/{id}
```

#### Index All Content for Source

```
GET /api/v2/aem/source/{id}/indexAll
```

Triggers an asynchronous full indexing operation for the specified AEM source.

#### Get Empty Structure

```
GET /api/v2/aem/source/structure
```

Returns an empty AEM source model for reference.

---

## Related Pages

| Page | Description |
|---|---|
| [AEM Connector](./connectors/aem.md) | AEM indexing flow, event listeners, and manual triggering |
| [Connectors Overview](./connectors/overview.md) | All connectors and how they're managed |
| [Turing ES: Integration](/turing/integration) | Turing ES admin console for managing connectors |
