---
sidebar_position: 3
title: Configuration Reference
description: Complete reference for the Turing ES application.yaml configuration file.
---

# Configuration Reference

This page documents every significant property in the Turing ES `application.yaml` file. The file uses standard Spring Boot configuration — any property can be overridden via environment variables, JVM system properties (`-Dkey=value`), or a separate `application-production.yaml` file in the working directory.

:::tip Override pattern
To override a property at runtime without editing the file, use the environment variable convention: replace `.` and `-` with `_` and uppercase everything. For example, `turing.minio.enabled` becomes `TURING_MINIO_ENABLED=true`.
:::

---

## Full Default Configuration

```yaml
spring:
  datasource.hikari:
    maximum-pool-size: 20
    minimum-idle: 5
    idle-timeout: 600000
    pool-name: TurConnectionPool
  jmx.enabled: true
  profiles:
    active: production
  h2:
    console:
      enabled: false
      path: /h2
      settings:
        web-allow-others: true
  datasource:
    url: jdbc:h2:file:./store/db/turingDB;DATABASE_TO_UPPER=false;CASE_INSENSITIVE_IDENTIFIERS=true
    username: sa
    password: ""
    driver-class-name: org.h2.Driver
  liquibase:
    change-log: classpath:db/changelog/db.changelog-master.yaml
    enabled: true
    default-schema: PUBLIC
  jpa:
    properties:
      hibernate:
        "[globally_quoted_identifiers]": true
        "[format_sql]": false
        "[enable_lazy_load_no_trans]": true
        "[generate_statistics]": false
      "[jakarta.persistence.sharedCache.mode]": ALL
    hibernate:
      ddl-auto: none
    show-sql: false
  jackson:
    mapper:
      "[DEFAULT_VIEW_INCLUSION]": true
  thymeleaf:
    mode: HTML
    check-template: true
    check-template-location: true
    prefix: classpath:public/
    suffix: .html
  artemis:
    mode: embedded
    broker-url: localhost:61616
    embedded:
      enabled: true
      persistent: true
      data-directory: store/queue
      queues: indexing.queue
    pool:
      max-connections: 10
  jms:
    template:
      default-destination: indexing.queue
  servlet:
    multipart:
      max-file-size: 1024MB
      max-request-size: 1024MB
  mvc:
    async:
      request-timeout: 3600000
  output:
    ansi:
      enabled: always
  graphql:
    graphiql:
      enabled: true
      path: /graphiql
    http.path: /graphql
    cors:
      allowed-origins: ${turing.allowedOrigins}
      allowed-methods: GET,POST
      allowed-headers: "*"

server:
  port: ${PORT:2700}
  compression:
    enabled: true
    mime-types: application/json,text/css,application/javascript
    min-response-size: 2048
  tomcat:
    accesslog:
      enabled: false
      suffix: .log
      prefix: access_log
      file-date-format: .yyyy-MM-dd
      directory: logs
    basedir: store
    threads:
      max: 600
    max-swallow-size: 200MB
    max-http-form-post-size: 200MB
    maxHttpResponseHeaderSize: 800KB

turing:
  ai.crypto.key: sample-key-for-crypto
  allowedOrigins: http://localhost:4200,http://localhost:5173
  multi-tenant: false
  keycloak: false
  url: http://localhost:2700
  open-browser: true
  jms.concurrency: 1-1
  code-interpreter:
    python-executable: ""
  solr:
    timeout: 30000
    cloud: false
    commit:
      within: 10000
      enabled: false
  elasticsearch:
    timeout: 30000
  search:
    metrics.enabled: true
    cache:
      ttl:
        seconds: 86400000
      enabled: false
  minio:
    enabled: false
    endpoint: http://localhost:9000
    access-key: admin
    secret-key: minha_senha_forte
    bucket: turing-assets
  mongodb:
    enabled: false
    uri: mongodb://localhost:27017
    logging:
      database: turingLog
      collection:
        server: server
        aem: aem
        indexing: indexing
      purge:
        days: 30

springdoc:
  pathsToMatch: /api/**
  swagger-ui:
    path: /swagger-ui.html

management:
  endpoints:
    web:
      exposure:
        include: "*"

logging:
  config: classpath:logback-spring.xml
  level:
    org:
      springframework: INFO
      apache: INFO
      "[apache.activemq]": ERROR
    com:
      viglet: INFO
    dev:
      langchain4j: INFO
      ai4j:
        openai4j: INFO
  file:
    name: store/logs/turing.log
  logback:
    rollingpolicy:
      max-file-size: 25MB
      max-history: 10
```

---

## Property Reference

### Server

| Property | Default | Description |
|---|---|---|
| `server.port` | `${PORT:2700}` | HTTP port. Override with the `PORT` environment variable. |
| `server.compression.enabled` | `true` | Enables gzip compression for JSON, CSS, and JavaScript responses |
| `server.compression.min-response-size` | `2048` | Minimum response size in bytes before compression is applied |
| `server.tomcat.threads.max` | `600` | Maximum number of Tomcat worker threads |
| `server.tomcat.basedir` | `store` | Base directory for Tomcat internal files |
| `server.tomcat.max-swallow-size` | `200MB` | Maximum size of request body Tomcat will absorb |
| `server.tomcat.max-http-form-post-size` | `200MB` | Maximum size of HTML form POST bodies |
| `server.tomcat.maxHttpResponseHeaderSize` | `800KB` | Maximum size of HTTP response headers |
| `server.tomcat.accesslog.enabled` | `false` | Enable Tomcat access log file |

---

### Database (Spring Datasource)

The default database is **H2** (embedded, file-based) — suitable for development and simple deployments. For production, replace with MariaDB, MySQL, or PostgreSQL.

| Property | Default | Description |
|---|---|---|
| `spring.datasource.url` | `jdbc:h2:file:./store/db/turingDB` | JDBC URL. Change to your production DB URL. |
| `spring.datasource.username` | `sa` | Database username |
| `spring.datasource.password` | `""` | Database password |
| `spring.datasource.driver-class-name` | `org.h2.Driver` | JDBC driver class |
| `spring.datasource.hikari.maximum-pool-size` | `20` | Maximum connections in the HikariCP pool |
| `spring.datasource.hikari.minimum-idle` | `5` | Minimum idle connections kept alive |
| `spring.datasource.hikari.idle-timeout` | `600000` | Time (ms) a connection can remain idle before being removed |
| `spring.h2.console.enabled` | `false` | Enable H2 web console — **do not enable in production** |

**Switching to MariaDB / MySQL:**

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/turingdb
    username: turing
    password: your_password
    driver-class-name: org.mariadb.jdbc.Driver
```

---

### Message Queue (Apache Artemis)

Apache Artemis runs **embedded inside Turing ES** by default — no separate installation is required. For high-availability or multi-node deployments, you can switch to an external Artemis broker.

| Property | Default | Description |
|---|---|---|
| `spring.artemis.mode` | `embedded` | `embedded` (default) or `native` (external broker) |
| `spring.artemis.broker-url` | `localhost:61616` | Used when `mode: native` to point to an external broker |
| `spring.artemis.embedded.enabled` | `true` | Enables the embedded broker |
| `spring.artemis.embedded.persistent` | `true` | Persist queue messages to disk (survives restarts) |
| `spring.artemis.embedded.data-directory` | `store/queue` | Directory for persisted queue data |
| `spring.artemis.embedded.queues` | `indexing.queue` | Queue names to create on startup |
| `spring.artemis.pool.max-connections` | `10` | Maximum JMS connection pool size |
| `spring.jms.template.default-destination` | `indexing.queue` | Default JMS destination for indexing jobs |
| `turing.jms.concurrency` | `1-1` | JMS listener concurrency range (min-max consumers). Increase for higher indexing throughput. |

:::tip External Artemis for scalability
To use an external Artemis broker (e.g., for multi-node deployments), set `spring.artemis.mode: native` and point `broker-url` to your broker. The embedded broker should be disabled in that case (`spring.artemis.embedded.enabled: false`).
:::

---

### File Uploads

| Property | Default | Description |
|---|---|---|
| `spring.servlet.multipart.max-file-size` | `1024MB` | Maximum size of a single uploaded file |
| `spring.servlet.multipart.max-request-size` | `1024MB` | Maximum total size of a multipart request |

---

### GraphQL

| Property | Default | Description |
|---|---|---|
| `spring.graphql.http.path` | `/graphql` | GraphQL endpoint path |
| `spring.graphql.graphiql.enabled` | `true` | Enable GraphiQL browser IDE |
| `spring.graphql.graphiql.path` | `/graphiql` | GraphiQL IDE path |
| `spring.graphql.cors.allowed-origins` | `${turing.allowedOrigins}` | CORS allowed origins for GraphQL |

---

### Async / Timeout

| Property | Default | Description |
|---|---|---|
| `spring.mvc.async.request-timeout` | `3600000` | Maximum time (ms) for async requests — 1 hour. Covers streaming LLM responses. |

---

### Turing ES Core

| Property | Default | Description |
|---|---|---|
| `turing.url` | `http://localhost:2700` | Public base URL of this Turing ES instance |
| `turing.allowedOrigins` | `http://localhost:4200, http://localhost:5173` | CORS allowed origins for the REST API and GraphQL. Add your frontend URL here. |
| `turing.keycloak` | `false` | Set `true` to enable Keycloak OAuth2/OIDC. See [Security & Keycloak](./security-keycloak.md). |
| `turing.multi-tenant` | `false` | Enable multi-tenant mode |
| `turing.open-browser` | `true` | Automatically open the admin console in the browser on startup |
| `turing.ai.crypto.key` | `sample-key-for-crypto` | Encryption key for stored AI provider credentials. **Change this in production.** |
| `turing.code-interpreter.python-executable` | *(auto-detected)* | Absolute path to the Python 3 binary used by the Code Interpreter GenAI tool. When blank, Turing searches standard OS locations automatically. |

:::warning Change the crypto key
The `turing.ai.crypto.key` is used to encrypt LLM provider API keys stored in the database. Always set a strong, unique value in production.
:::

---

### Solr

| Property | Default | Description |
|---|---|---|
| `turing.solr.timeout` | `30000` | Connection and read timeout (ms) for Solr requests |
| `turing.solr.cloud` | `false` | Set `true` for SolrCloud mode with Zookeeper |
| `turing.solr.commit.within` | `10000` | Soft commit time (ms) — Solr commits changes within this window |
| `turing.solr.commit.enabled` | `false` | Enable explicit commits after indexing. Leave `false` to use Solr's auto-commit. |

---

### Elasticsearch

| Property | Default | Description |
|---|---|---|
| `turing.elasticsearch.timeout` | `30000` | Connection and read timeout (ms) for Elasticsearch requests |

---

### Search Cache

| Property | Default | Description |
|---|---|---|
| `turing.search.metrics.enabled` | `true` | Record search metrics (query terms, result counts, timestamps) |
| `turing.search.cache.enabled` | `false` | Enable server-side search result caching |
| `turing.search.cache.ttl.seconds` | `86400000` | Cache TTL in seconds (default ~1000 days — effectively no expiry when enabled) |

---

### MinIO (Assets & Knowledge Base)

MinIO powers the [Assets](./assets.md) file manager and the RAG Knowledge Base. Disabled by default.

| Property | Default | Description |
|---|---|---|
| `turing.minio.enabled` | `false` | Set `true` to enable MinIO integration |
| `turing.minio.endpoint` | `http://localhost:9000` | MinIO server URL |
| `turing.minio.access-key` | `admin` | MinIO access key |
| `turing.minio.secret-key` | `minha_senha_forte` | MinIO secret key |
| `turing.minio.bucket` | `turing-assets` | Bucket name — created automatically on startup if it does not exist |

:::note
The Assets section only appears in the sidebar when `turing.minio.enabled: true`.
:::

---

### MongoDB (Application Logs)

MongoDB is used to persist application logs, making them accessible from the admin console. Disabled by default.

| Property | Default | Description |
|---|---|---|
| `turing.mongodb.enabled` | `false` | Set `true` to enable MongoDB log persistence |
| `turing.mongodb.uri` | `mongodb://localhost:27017` | MongoDB connection URI |
| `turing.mongodb.logging.database` | `turingLog` | Database name for logs |
| `turing.mongodb.logging.collection.server` | `server` | Collection for general server logs |
| `turing.mongodb.logging.collection.aem` | `aem` | Collection for AEM-specific logs |
| `turing.mongodb.logging.collection.indexing` | `indexing` | Collection for indexing pipeline logs |
| `turing.mongodb.logging.purge.days` | `30` | Automatically delete log entries older than this many days |

---

### API Documentation (SpringDoc)

| Property | Default | Description |
|---|---|---|
| `springdoc.pathsToMatch` | `/api/**` | API paths included in the OpenAPI spec |
| `springdoc.swagger-ui.path` | `/swagger-ui.html` | Swagger UI path |

---

### Logging

| Property | Default | Description |
|---|---|---|
| `logging.file.name` | `store/logs/turing.log` | Log file path |
| `logging.logback.rollingpolicy.max-file-size` | `25MB` | Maximum size of each log file before rotation |
| `logging.logback.rollingpolicy.max-history` | `10` | Number of rotated log files to keep |
| `logging.level.com.viglet` | `INFO` | Log level for Turing ES application code |
| `logging.level.org.springframework` | `INFO` | Log level for Spring framework |
| `logging.level.dev.langchain4j` | `INFO` | Log level for LangChain4j (LLM library) |

---

### Keycloak (OAuth2 / OIDC)

When `turing.keycloak: true`, uncomment and configure the following block:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: demo-app
            client-secret: your-client-secret
            scope: openid
            authorization-grant-type: authorization_code
            redirect-uri: http://localhost:2700/login/oauth2/code/demo-app
        provider:
          keycloak:
            issuer-uri: http://localhost:8080/realms/demo
            jwk-set-uri: http://localhost:8080/realms/demo/protocol/openid-connect/certs
            user-info-uri: http://localhost:8080/realms/demo/protocol/openid-connect/userinfo
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/demo
```

For full Keycloak setup instructions, see [Security & Keycloak](./security-keycloak.md).

---

### GenAI / LLM (Database Settings)

LLM providers, models, and GenAI behavior are managed through the **Administration Console** and stored in the database — not in `application.yaml`. The following settings are available via **Settings > Global Settings** in the admin UI:

| Setting | Default | Description |
|---|---|---|
| Default LLM | *(none)* | Global default LLM instance used when a Semantic Navigation site does not specify one |
| LLM Cache Enabled | `false` | Cache LLM responses to reduce API calls for repeated queries |
| LLM Cache TTL (ms) | `3600000` (1 hour) | How long cached LLM responses remain valid |
| LLM Cache Regenerate | `false` | When `true`, regenerate cached responses in the background |
| RAG Enabled | `false` | Enable Retrieval-Augmented Generation globally |
| Default Embedding Model | *(none)* | Global default embedding model for vector operations |
| Default Embedding Store | *(none)* | Global default embedding store instance |
| Python Executable | *(auto-detected)* | Path to Python 3 for the Code Interpreter tool (also overridable via `turing.code-interpreter.python-executable` in YAML) |

**Supported LLM providers:** OpenAI, Ollama, Anthropic (Claude), Google Gemini, Google Gemini (OpenAI-compatible), and Azure OpenAI.

LLM instances are created under **GenAI > LLM** in the admin console, where you configure the provider, API key, base URL, and model name.

---

### Embedding Store (Database Settings)

Embedding store instances are configured through the **Administration Console** under **GenAI > Embedding Store**. Each instance specifies a vendor, connection URL, credentials, and optional provider-specific options via a JSON field.

**Supported vendors:**

| Vendor | Plugin ID | Key Provider Options |
|---|---|---|
| **ChromaDB** | `chroma` | `baseUrl` (default `http://localhost:8000`), `collectionName`, `tenantName`, `databaseName`, `initializeSchema`, `keyToken`, `basicUsername`, `basicPassword` |
| **Milvus** | `milvus` | `baseUrl`, `collectionName`, `databaseName`, `token`, `embeddingDimension`, `metricType`, `indexType`, `indexParameters`, `initializeSchema` |
| **PGVector** | `pgvector` | JDBC URL (set as instance URL), `tableName` (default `vector_store`), `schemaName` (default `public`), `dimensions`, `distanceType`, `indexType`, `initializeSchema` |

Provider options are passed as a JSON object in the **Provider Options** field when creating or editing an embedding store instance.

---

## Common Production Overrides

A minimal production override file (`application-production.yaml`) covering the most important changes:

```yaml
spring:
  profiles:
    active: production
  datasource:
    url: jdbc:mariadb://db-host:3306/turingdb
    username: turing
    password: strong_db_password
    driver-class-name: org.mariadb.jdbc.Driver
  h2:
    console:
      enabled: false

turing:
  url: https://search.yourcompany.com
  allowedOrigins: https://search.yourcompany.com
  ai.crypto.key: your-strong-random-key-here
  minio:
    enabled: true
    endpoint: http://minio:9000
    access-key: your-minio-user
    secret-key: your-minio-password
  mongodb:
    enabled: true
    uri: mongodb://mongo-host:27017

server:
  tomcat:
    accesslog:
      enabled: true
```

---

*Previous: [Installation Guide](./installation-guide.md) | Next: [Administration Guide](./administration-guide.md)*
