---
sidebar_position: 3
title: Configuration Reference
description: Complete reference for all Dumont DEP application.yaml properties — server, database, queue, connectors, and indexing plugins.
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

<div className="page-break" />

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
| `spring.h2.console.enabled` | `false` | Enable H2 web console — **do not enable in production** |

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

### Logging

| Property | Default | Description |
|---|---|---|
| `logging.file.name` | `store/logs/dum-connector.log` | Log file path |
| `logging.level.com.viglet` | `INFO` | Log level for Dumont DEP application code |

---

<div className="page-break" />

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

