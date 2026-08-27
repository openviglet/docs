---
sidebar_position: 3
title: Configuration Reference
description: "Complete reference for all Dumont DEP application.yaml properties: server, database, queue, connectors, and indexing plugins."
---

# Configuration Reference

This page documents every significant property in the Dumont DEP `application.yaml` file. Any property can be overridden via environment variables, JVM system properties (`-Dkey=value`), or a separate `application-production.yaml` file.

:::tip Override pattern
To override a property at runtime, use the environment variable convention: replace `.` and `-` with `_` and uppercase everything. For example, `dumont.indexing.provider` becomes `DUMONT_INDEXING_PROVIDER=solr`.
:::

---

## Full Default Configuration

```yaml
spring:
  datasource:
    url: jdbc:h2:file:./store/db/dumontDB;DATABASE_TO_UPPER=false;CASE_INSENSITIVE_IDENTIFIERS=true
    username: sa
    password: ""
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: false
      path: /h2
      settings:
        web-allow-others: true
  jpa:
    properties:
      hibernate:
        "[globally_quoted_identifiers]": true
        "[enable_lazy_load_no_trans]": true
    hibernate:
      ddl-auto: update
    show-sql: false
  artemis:
    mode: embedded
    broker-url: localhost:61616
    embedded:
      enabled: true
      persistent: true
      data-directory: store/queue
      queues: connector-indexing.queue
  jms:
    template:
      default-destination: connector-indexing.queue

server:
  port: ${PORT:30130}

dumont:
  indexing:
    provider: turing
    job:
      batch-size: 50
    solr:
      url: http://localhost:8983/solr
      collection: dumont
    elasticsearch:
      url: http://localhost:9200
      index: dumont
      username: ~
      password: ~

turing:
  url: http://localhost:2700
  apiKey: ""

  aem.querybuilder: false
  aem.querybuilder.parallelism: 10

logging:
  file:
    name: store/logs/dum-connector.log
  level:
    com:
      viglet: INFO
```

---

## Property Reference

### Server

| Property | Default | Description |
|---|---|---|
| `server.port` | `30130` | HTTP port for the Dumont DEP application |

### Database

| Property | Default | Description |
|---|---|---|
| `spring.datasource.url` | `jdbc:h2:file:./store/db/dumontDB` | JDBC URL for the indexing state database |
| `spring.datasource.username` | `sa` | Database username |
| `spring.datasource.password` | `""` | Database password |
| `spring.datasource.driver-class-name` | `org.h2.Driver` | JDBC driver class |
| `spring.h2.console.enabled` | `false` | Enable H2 web console: **do not enable in production** |

### Message Queue (Apache Artemis)

| Property | Default | Description |
|---|---|---|
| `spring.artemis.mode` | `embedded` | `embedded` (default) or `native` (external broker) |
| `spring.artemis.broker-url` | `localhost:61616` | Broker URL when using `native` mode |
| `spring.artemis.embedded.enabled` | `true` | Enable the embedded broker |
| `spring.artemis.embedded.persistent` | `true` | Persist queue messages to disk (survives restarts) |
| `spring.artemis.embedded.data-directory` | `store/queue` | Directory for persisted queue data |
| `spring.artemis.embedded.queues` | `connector-indexing.queue` | Queue name created on startup |

### Indexing Configuration

| Property | Default | Description |
|---|---|---|
| `dumont.indexing.provider` | `turing` | Output target: `turing`, `solr`, or `elasticsearch` |
| `dumont.indexing.job.batch-size` | `50` | Number of Job Items per batch before queue delivery |
| `dumont.indexing.provision` | `true` | Send each source's declared field schema to the backend before its first document, so fields are created as declared rather than inferred from whichever value arrives first. A rejected schema is logged and indexing continues with the site's current schema. Turing only — other backends have no declarative schema endpoint |

### Extraction Resilience

An incomplete indexing run must not de-index what it never reached. Skipping that sweep is
unconditional; these tune *when* a run is judged incomplete, and are read by the AEM connector,
whose extraction is one HTTP fetch per page. See
[Core Concepts → Data Quality](./getting-started/core-concepts.md#data-quality).

| Property | Default | Description |
|---|---|---|
| `dumont.reactive.indexing` | `false` | Extract on a bounded pool instead of sequentially |
| `dumont.reactive.parallelism` | `10` | Threads used for parallel extraction |
| `dumont.reactive.extractTimeoutMs` | `0` | Per-extract wall-clock bound in milliseconds; the overrun is cancelled and counted as one failed extraction. `0` disables it — no extraction is ever cancelled for time |
| `dumont.reactive.failureRatioThreshold` | `0.5` | Finish standalone (skip the de-index sweep) when this fraction of a run's extractions fail. `0` disables the guard |

### Content Audit

The audit runs on a cron, re-enumerates every source, and files a record for anything the
connector never queued. With `dumont.audit.index.enabled` it also compares against the search
index itself and reports three differences: **missing** (in the source, never landed),
**stale** (landed, but a later write failed), and **orphaned** (in the index, gone from the
source). Missing and stale ids are requeued through the normal pipeline. Orphans are never
deleted by the audit — a discovery pass that under-reports ids would otherwise take live content
out of the index. Instead each pass writes the ids it found into a dated **orphan report** you
review and apply yourself, through [the orphan endpoints](rest-api.md#orphan-reports).

| Property | Default | Description |
|---|---|---|
| `dumont.audit.cron` | `0 0 3 * * *` | Cron for the scheduled content audit. `-` disables it |
| `dumont.audit.cron.zone` | `UTC` | Timezone the cron is evaluated in |
| `dumont.audit.index.enabled` | `true` | Also compare against the search index. Requires a backend that can enumerate what it holds — Turing can; Solr and Elasticsearch report nothing and the comparison is skipped |
| `dumont.audit.index.orphanTtl` | `PT24H` | How long an orphan report stays applicable (ISO-8601 duration). Past it, applying is refused and a fresh audit must re-establish the report. `PT0S` or below switches expiry off |

### Turing ES Connection

| Property | Default | Description |
|---|---|---|
| `turing.url` | `http://localhost:2700` | Base URL of the Turing ES instance |
| `turing.apiKey` | `""` | API Token for authenticating with Turing ES |

### Solr Direct Connection

| Property | Default | Description |
|---|---|---|
| `dumont.indexing.solr.url` | `http://localhost:8983/solr` | Apache Solr base URL |
| `dumont.indexing.solr.collection` | `dumont` | Solr collection name |

### Elasticsearch Direct Connection

| Property | Default | Description |
|---|---|---|
| `dumont.indexing.elasticsearch.url` | `http://localhost:9200` | Elasticsearch base URL |
| `dumont.indexing.elasticsearch.index` | `dumont` | Elasticsearch index name |
| `dumont.indexing.elasticsearch.username` | *(none)* | Optional authentication username |
| `dumont.indexing.elasticsearch.password` | *(none)* | Optional authentication password |

### AEM QueryBuilder

| Property | Default | Description |
|---|---|---|
| `dumont.aem.querybuilder` | `false` | Enable QueryBuilder-based content discovery instead of tree traversal during full indexing |
| `dumont.aem.querybuilder.parallelism` | `10` | Number of parallel threads for processing discovered paths |

### AEM Adobe I/O Events

See [AEM Connector → Adobe I/O Events](./connectors/aem.md#adobe-io-events).

| Property | Default | Description |
|---|---|---|
| `dumont.aem.webhook.adobe-io.client-id` | – | API Key (Client ID) of the OAuth Server-to-Server credential. When set, an incoming webhook payload whose `recipient_client_id` does not match is rejected with `401`; unset leaves the endpoint open and logs a warning at startup |
| `dumont.aem.journal.enabled` | `false` | Pull the same events from the Adobe I/O journal, recovering any the webhook dropped. Does not affect the webhook |
| `dumont.aem.journal.poll-ms` | `60000` | Delay between the end of one journal poll and the start of the next |
| `dumont.aem.journal.batch-size` | `100` | Events requested per journal page |
| `dumont.aem.journal.max-pages-per-poll` | `20` | Journal pages followed in one poll, so a large backlog drains across polls rather than in one burst |
| `dumont.aem.journal.client-id` | – | OAuth Server-to-Server API Key (Client ID) used for the journal |
| `dumont.aem.journal.client-secret` | – | OAuth Server-to-Server Client Secret used for the journal |
| `dumont.aem.journal.ims-url` | `https://ims-na1.adobelogin.com/ims/token/v3` | Adobe IMS token endpoint |
| `dumont.aem.journal.scopes` | `openid,AdobeID,adobeio_api,event_receiver_api` | Scopes requested for the token |
| `dumont.aem.journal.sources.<source>` | – | Journal URL of the event registration, per Dumont source name |

### AEM Fetch Strategy

Configured per source in the console, not by property: see [AEM Connector → Fetch Strategy](./connectors/aem.md#fetch-strategy).

### Dependency Tracking

| Property | Default | Description |
|---|---|---|
| `dumont.dependencies.enabled` | `false` | Persist `/content/*` references extracted from each indexed page and cascade re-index any dependent document on standalone updates. Currently populated only by the AEM connector, see [AEM Connector → Dependency Tracking](./connectors/aem.md#dependency-tracking-and-cascade-re-indexing) |

### Logging

| Property | Default | Description |
|---|---|---|
| `logging.file.name` | `store/logs/dum-connector.log` | Log file path |
| `logging.level.com.viglet` | `INFO` | Log level for Dumont DEP application code |

### Indexing Log

Separate from the application log above. Every document Dumont processes leaves a row per status
it passes through — prepared, sent to the queue, delivered to the search engine — each naming the
document, the source that produced it and the run it belonged to. Queried through
[the Logging API](rest-api.md#logging-api).

It is **off by default**: with no engine configured, the endpoint answers with an empty page and
nothing is written. Pick MongoDB when you intend to query the log, and Redis when you mostly want
to tail it — the Redis engine filters and sorts in memory after reading the whole list, so it
degrades as the log grows.

| Property | Default | Description |
|---|---|---|
| `dumont.logging.engine` | `none` | `none`, `mongodb` or `redis` |
| `dumont.logging.database` | `dumontLog` | MongoDB database name |
| `dumont.logging.collection.indexing` | `indexing` | MongoDB collection holding the indexing rows |
| `dumont.mongodb.enabled` | `false` | Must also be `true` for the `mongodb` engine to activate |
| `dumont.mongodb.uri` | `mongodb://localhost:27017` | MongoDB connection string |
| `dumont.redis.enabled` | `false` | Must also be `true` for the `redis` engine to activate |
| `dumont.redis.uri` | `redis://localhost:6379/0` | Redis connection string |
| `dumont.redis.key.indexing` | `dumontLog:indexing` | Redis list key holding the indexing rows |

---

## Common Production Overrides

A minimal production override:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db-host:5432/dumont_db
    username: dumont
    password: strong_password
    driver-class-name: org.postgresql.Driver
  h2:
    console:
      enabled: false

dumont:
  indexing:
    provider: turing

turing:
  url: https://search.yourcompany.com
  apiKey: your-turing-api-token

server:
  port: 30130
```

---

