---
sidebar_position: 6
title: Catalog & JSON API Connector
description: "Index an already-normalized catalog feed, or any paged JSON API declared as a manifest: paging, call budgets, field mapping and incremental expiry, with no Java code."
---

# Catalog & JSON API Connector

The Catalog connector republishes records that already exist as JSON. A source runs in one of two modes:

- **Catalog URL**: one GET of a URL that returns a JSON array of records, or a `{ "courses": [...] }` envelope, with the fields of the built-in course schema.
- **JSON API manifest**: any paged JSON API (a job board, a product catalog, a partner feed). You describe the request, the paging, the call budget and the field mapping in a JSON manifest, and Viglet Dumont DEP runs it. You don't write any Java.

When a source has a manifest, the manifest replaces the catalog URL and the manifest's fields become the schema.

The connector ships as `catalog-plugin.jar` and is bundled in the Docker image.

---

## Creating a source

In the console, open **Catalog Sources** and create a source:

1. **General**: a unique name, the Semantic Navigation site to publish to, and the locale (for example `pt_BR`).
2. **Connection**: either the **Catalog URL**, or the **JSON API** section:
   - **Manifest**: the JSON manifest described below.
   - **Secrets**: a JSON object with the values of the manifest's `{secret:NAME}` placeholders, for example `{"appKey": "..."}`.

Saving checks the manifest. If it does not parse, or it uses a secret that is not set, the save is refused with the reason. Use **Index All** to run the source, or let the scheduler run it.

---

## Manifest reference

```json
{
  "name": "jobs",
  "version": 1,
  "request": {
    "method": "GET",
    "url": "https://api.example.com/v1/jobs/search/{page}?app_id={secret:appId}&app_key={secret:appKey}&results_per_page={size}",
    "headers": { "Accept-Language": "pt-BR" }
  },
  "paging": { "mode": "page", "start": 1, "size": 50, "maxPages": 20, "totalPath": "count" },
  "budget": { "maxCallsPerRun": 20, "callsPerMinute": 25, "callsPerDay": 250, "callsPerMonth": 2500 },
  "incremental": { "expiry": "P7D" },
  "records": "results",
  "id": "id",
  "fields": [
    { "name": "title", "path": "title", "type": "TEXT", "role": "TITLE", "mandatory": true },
    { "name": "description", "path": "description", "type": "TEXT", "role": "BODY" },
    { "name": "company", "path": "company.display_name", "facet": true },
    { "name": "city", "path": "location.area[3]", "facet": true },
    { "name": "salary", "path": "salary_min", "type": "DOUBLE" },
    { "name": "url", "path": "redirect_url", "mandatory": true }
  ]
}
```

### `request`

| Key | Description |
|---|---|
| `method` | `GET` (default) or `POST`. |
| `url` | The URL template. Placeholder values are URL-encoded. |
| `headers` | Header templates, for example `"Authorization": "Bearer {secret:token}"`. |
| `body` | The JSON body of a `POST`. Write it as an object. A numeric placeholder that is a whole string value (`"page": "{page}"`) is sent as a number. |

Placeholders work in the URL, the headers and the body:

| Placeholder | Value |
|---|---|
| `{page}` | The page number, counting up from `paging.start`. |
| `{offset}` | The record offset, counting up from `paging.start` in steps of `paging.size`. |
| `{size}` | `paging.size`. |
| `{cursor}` | The cursor the previous response returned (empty on the first call). |
| `{secret:NAME}` | The value of `NAME` in the source's **Secrets**. |

Keep keys in secrets, not in the manifest. A manifest can then be shared and versioned, and the export (`/api/v2/catalog/source/export`) includes the manifest but never the secrets.

### `paging`

| Key | Description |
|---|---|
| `mode` | `none` (one call, the default), `page`, `offset` or `cursor`. |
| `start` | The first page (default `1`) or offset (default `0`). |
| `size` | Records per call. A response with fewer records than `size` is treated as the last page. Required for `offset`. |
| `maxPages` | The most calls one walk makes. |
| `cursorPath` | For `cursor` mode: where the next cursor sits in a response. |
| `totalPath` | Where the total record count sits in a response. The walk stops once it has that many. |

The walk also stops on an empty page, a blank or repeated cursor, and a page that only holds ids it has already seen.

### `budget`

| Key | Description |
|---|---|
| `maxCallsPerRun` | The most calls one run makes. |
| `callsPerMinute` | The pace. Calls are spaced so no minute holds more than this. |
| `callsPerDay` | The most calls in one UTC day, counted across runs. |
| `callsPerWeek` | The most calls in one week (Monday to Sunday, UTC). |
| `callsPerMonth` | The most calls in one calendar month. |

Daily, weekly and monthly counts are stored in the connector database, so they survive a restart. A failed call still counts, because the provider counted it too.

### `records`, `id` and `fields`

- `records` is the path to the record array in each response (`results`, `data.listVagas`). Use `$` (the default) when the response is the array itself.
- `id` is the path to each record's id, relative to the record. A record without an id is skipped.
- Each field has a `name` (the field in the index) and a `path` (where the value is in the record, defaulting to the name), plus optional `type` (`STRING`, `TEXT`, `INT`, `LONG`, `FLOAT`, `DOUBLE`, `BOOL`, `DATE`, `CURRENCY`), `multiValued`, `facet`, `mandatory` and `role` (`TITLE`, `SUMMARY`, `BODY` for the RAG embedding).

Paths are dotted keys with optional array indexes: `company.display_name`, `locations[0].city`. A key applied to an array reads it from every element, so `skills.name` gives the list of skill names.

The connector never invents values. A record missing a `mandatory` field is not published, and a value that does not fit its type (text in a `DOUBLE` field) is dropped rather than converted.

---

## How a run ends

| The walk… | What happens to records the run did not fetch |
|---|---|
| reached the end of the API | Removed from the index (the normal sweep). |
| stopped at `maxPages`, a call budget, or a failed call | Kept. The run publishes what it fetched and removes nothing. |

### Incremental sources

An API with a tight budget may never return everything in one run, so the sweep would never run and stale records would stay in the index. Declare the source incremental:

```json
"incremental": { "expiry": "P7D" }
```

With `incremental` set, a run never sweeps. The connector stores when it last saw each record, and at the end of each run it removes only the records unseen for longer than `expiry` (an ISO-8601 duration: `P7D` is seven days, `PT12H` is twelve hours). A run that failed before it fetched anything removes nothing.

---

## REST API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/catalog/source` | List sources |
| `POST` | `/api/v2/catalog/source` | Create a source (`400` with the reason if the manifest cannot run) |
| `PUT` | `/api/v2/catalog/source/{id}` | Update a source |
| `DELETE` | `/api/v2/catalog/source/{id}` | Delete a source |
| `GET` | `/api/v2/catalog/source/{id}/indexAll` | Index the source now |
| `GET` | `/api/v2/catalog/source/export` | Export every source as JSON (without secrets) |
| `POST` | `/api/v2/catalog/source/import` | Import sources from a JSON export (multipart `file`) |

An import file can carry `jsonApiManifest` (an object) and `jsonApiSecrets` (an object) for each source, so a first-boot provisioning file can bring its keys.
