---
sidebar_position: 5
title: Import & Export
description: Export and import Semantic Navigation site configurations and content via ZIP archives.
---

# Import & Export

Turing ES supports exporting and importing **Semantic Navigation site configurations** as ZIP archives. This allows you to migrate sites between environments, create backups, or share configurations across teams.

---

## Export

Export creates a ZIP archive containing a complete snapshot of one or all SN Sites, including field definitions, facet settings, spotlights, ranking expressions, merge providers, locale configuration, and GenAI settings.

### Export a Single Site

```
GET /api/sn/{id}/export
```

### Export All Sites

```
GET /api/sn/export
```

Both endpoints require authentication via the `Key` header. The response is a downloadable ZIP file containing an `export.json` with the full site configuration.

**Example:**

```bash
curl "http://localhost:2700/api/sn/export" \
  -H "Key: <YOUR_API_TOKEN>" \
  -o turing-sites-export.zip
```

### Export Contents

The `export.json` inside the ZIP archive contains:

| Section | Description |
|---|---|
| `snSites` | Complete SN Site configurations — fields, facets, spotlights, ranking expressions, merge providers, locales, and GenAI settings |
| `llm` | LLM instance references used by sites with GenAI enabled |
| `store` | Embedding store instance references |
| `se` | Search engine instance references |

---

<div className="page-break" />

## Import

The import page (`/admin/exchange/import`) accepts a ZIP file previously exported from Turing ES and recreates the site configurations in the target environment.

### Using the Admin Console

1. Navigate to **Import** in the sidebar
2. **Drag and drop** a ZIP file onto the upload area, or click to browse
3. The upload progress is displayed in real time (percentage bar)
4. On success, you are automatically redirected to the SN Sites listing after 2 seconds

**Supported formats:** `.zip` files exported from Turing ES.

**UI states:**

| State | Description |
|---|---|
| Idle | Dashed border with upload icon — ready for file drop or click |
| Uploading | Blue background with spinning loader and progress percentage |
| Success | Green border with checkmark — "Import Completed" message and auto-redirect |
| Error | Red border with error message and "Try Again" button |

### Using the REST API

```
POST /api/import
```

Accepts a `multipart/form-data` request with a `file` parameter containing the ZIP archive. Authentication required.

**Example:**

```bash
curl -X POST "http://localhost:2700/api/import" \
  -H "Key: <YOUR_API_TOKEN>" \
  -F "file=@turing-sites-export.zip"
```

---

## Content Import (SN Job Items)

In addition to site configuration import, Turing ES accepts **document-level indexing jobs** via the SN Import API. This is used by connectors and custom integrations to push content into the search index.

### JSON Import

```
POST /api/sn/import
```

Accepts a JSON body with a list of job items — documents to index, deindex, or commit.

**Example:**

```bash
curl -X POST "http://localhost:2700/api/sn/import" \
  -H "Key: <YOUR_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "snJobItems": [
      {
        "locale": "en_US",
        "turSNJobAction": "CREATE",
        "siteNames": ["Sample"],
        "attributes": {
          "id": "doc-001",
          "title": "Getting Started Guide",
          "text": "This guide explains how to get started...",
          "url": "https://example.com/getting-started"
        }
      }
    ]
  }'
```

### ZIP Import (with file attachments)

```
POST /api/sn/import/zip
```

Accepts a `multipart/form-data` ZIP file containing an `export.json` with job items. Document attributes can reference embedded files using the `file://` protocol — Turing ES extracts text from these files using Apache Tika before indexing.

### Job Actions

| Action | Description |
|---|---|
| `CREATE` | Index or update a document in the search engine |
| `DELETE` | Remove a document from the index |
| `COMMIT` | Commit pending changes to the search engine |

### Job Item Structure

| Field | Type | Description |
|---|---|---|
| `locale` | `string` | Document locale (e.g., `en_US`) |
| `turSNJobAction` | `string` | `CREATE`, `DELETE`, or `COMMIT` |
| `siteNames` | `string[]` | Target SN Site names |
| `attributes` | `map` | Document fields — must include `id` |
| `checksum` | `string` | Optional content checksum for change detection |
| `environment` | `string` | Optional — `AUTHOR` or `PUBLISHING` |

---

## Related Pages

| Page | Description |
|---|---|
| [Semantic Navigation](./semantic-navigation.md) | SN Site configuration |
| [Integration](./integration.md) | Content connectors that automate document import |
| [REST API Reference](./rest-api.md) | Full API endpoint reference |
| [Developer Guide](./developer-guide.md) | Java SDK and JavaScript SDK for programmatic import |

---
