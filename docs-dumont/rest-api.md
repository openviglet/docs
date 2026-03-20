---
sidebar_position: 10
title: REST API Reference
description: Complete REST API reference for Dumont DEP — connector, monitoring, indexing rules, AEM plugin, and system information endpoints.
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

**Response:** `DumConnectorValidateDifference` — lists missing and extra documents.

---

<div className="page-break" />

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

<div className="page-break" />

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

<div className="page-break" />

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

Triggers indexing for specific AEM content paths. Includes built-in deduplication — repeated requests for the same paths within 30 seconds are ignored.

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

**Request body:** Full `DumAemSource` JSON (see [Extending the AEM Connector — Configuration JSON](./extending-aem.md#aem-configuration-json)).

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
| [Turing ES — Integration](/turing/integration) | Turing ES admin console for managing connectors |
