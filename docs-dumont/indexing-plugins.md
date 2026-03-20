---
sidebar_position: 6
title: Indexing Plugins
description: Configure where Dumont DEP delivers content — Turing ES (default), Apache Solr, or Elasticsearch.
---

# Indexing Plugins

An **Indexing Plugin** is the output adapter that delivers processed documents from the Dumont DEP pipeline to a search engine. Dumont DEP supports three targets — you choose one per deployment.

---

## Available Plugins

| Plugin | Target | Client Library | Use Case |
|---|---|---|---|
| **Turing** (default) | Viglet Turing ES | Turing Java SDK 2026.1.17 | Full enterprise search with GenAI, facets, spotlights |
| **Solr** | Apache Solr | SolrJ 10.0.0 | Direct Solr indexing without Turing ES |
| **Elasticsearch** | Elasticsearch | ES Java Client 9.3.2 | Direct Elasticsearch indexing without Turing ES |

---

## Turing ES Plugin (default)

The default plugin delivers documents to Turing ES via its REST API, using the official Turing Java SDK.

### Configuration

```yaml
dumont:
  indexing:
    provider: turing

turing:
  url: http://localhost:2700
  apiKey: your-turing-api-token
```

| Property | Description |
|---|---|
| `turing.url` | Base URL of the Turing ES instance |
| `turing.apiKey` | API Token created in Turing ES → Administration → API Tokens |

### How It Works

1. Receives a batch of Job Items from the message queue
2. Creates a `TurSNServer` instance using the Turing Java SDK
3. Calls `TurSNJobUtils.importItems()` to submit the batch
4. Turing ES validates each document against the target SN Site configuration
5. Documents are queued internally in Turing ES for Solr indexing

:::warning API Key required
The Turing plugin cannot deliver content without a valid API Key. Create one in **Turing ES → Administration → API Tokens** before starting Dumont DEP.
:::

---

## Apache Solr Plugin

The Solr plugin delivers documents directly to an Apache Solr collection, bypassing Turing ES entirely. Use this when you want Dumont DEP as a pure data extraction tool without Turing ES features.

### Configuration

```yaml
dumont:
  indexing:
    provider: solr
    solr:
      url: http://localhost:8983/solr
      collection: my-collection
```

| Property | Description |
|---|---|
| `dumont.indexing.solr.url` | Apache Solr base URL |
| `dumont.indexing.solr.collection` | Target Solr collection name |

### How It Works

1. Receives a batch of Job Items from the message queue
2. Converts each Job Item into a `SolrInputDocument`
3. Adds all documents to the Solr collection via SolrJ
4. Commits the changes

The Solr client is cleaned up automatically when the application shuts down (`@PreDestroy`).

---

## Elasticsearch Plugin

The Elasticsearch plugin delivers documents directly to an Elasticsearch index using bulk requests.

### Configuration

```yaml
dumont:
  indexing:
    provider: elasticsearch
    elasticsearch:
      url: http://localhost:9200
      index: my-index
      username: ~
      password: ~
```

| Property | Description |
|---|---|
| `dumont.indexing.elasticsearch.url` | Elasticsearch base URL |
| `dumont.indexing.elasticsearch.index` | Target index name |
| `dumont.indexing.elasticsearch.username` | Optional authentication username |
| `dumont.indexing.elasticsearch.password` | Optional authentication password |

### How It Works

1. Receives a batch of Job Items from the message queue
2. Builds a bulk request containing all documents
3. Submits the bulk request to Elasticsearch
4. Logs any per-document errors from the bulk response

Authentication is optional — leave `username` and `password` empty for unauthenticated clusters.

---

## Switching Plugins

Change the active plugin by setting `dumont.indexing.provider`:

```bash
# Via JVM property
java -Ddumont.indexing.provider=solr -jar viglet-dumont.jar

# Via environment variable
DUMONT_INDEXING_PROVIDER=elasticsearch java -jar viglet-dumont.jar
```

Only one plugin is active per deployment. All connectors share the same output target.

---

## Related Pages

| Page | Description |
|---|---|
| [Configuration Reference](./configuration-reference.md) | All application.yaml properties |
| [Architecture](./architecture.md) | Where indexing plugins fit in the pipeline |
| [Turing ES — REST API](https://docs.viglet.com/turing/rest-api) | Turing ES indexing API reference |

---

*Previous: [WordPress Connector](./connectors/wordpress.md) | Next: [Developer Guide](./developer-guide.md)*
