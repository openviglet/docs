---
sidebar_position: 2
title: Installation Guide
description: Install and configure Viglet Dumont DEP — connector JAR, connector plugins, classpath configuration, and service setup.
---

# Viglet Dumont DEP: Installation Guide

Viglet Dumont DEP is an open-source data extraction platform that connects content sources to search engines. The connector application (`dumont-connector.jar`) provides the pipeline infrastructure — message queue, batch processing, strategies, and indexing plugins — while **connector plugins** (AEM, Web Crawler) provide the actual content extraction capabilities.

:::warning The connector JAR alone does not crawl content
`dumont-connector.jar` is the pipeline engine. To actually extract content from sources, you must add a **connector plugin JAR** (AEM or Web Crawler) to the classpath via `-Dloader.path`. Without a plugin, the connector has no data source to crawl.
:::

---

## How It Works

```
dumont-connector.jar          ← Pipeline engine (queue, strategies, indexing)
  └── libs/                    ← Plugin directory (added via -Dloader.path)
       ├── aem-plugin.jar      ← AEM connector plugin
       ├── web-crawler-plugin.jar  ← Web Crawler connector plugin
       └── my-custom-plugin.jar    ← Your custom extensions (optional)
```

The connector JAR is built with Spring Boot's **ZIP layout** (PropertiesLauncher), which allows loading additional JARs from external directories at runtime. When you pass `-Dloader.path=libs`, Spring Boot scans the `libs/` directory and adds all JARs to the application classpath — making the connector plugins available to the pipeline.

---

## Installing Java

Dumont DEP requires Java.

:::note
Dumont DEP only supports **Java 21** or later.
:::

Set the `JAVA_HOME` environment variable and add `$JAVA_HOME/bin` to your `PATH`.

---

## Hardware Requirements

| Minimum | Recommended |
|---|---|
| Single 1.5 GHz processor, 1 GB available memory | Dual 2 GHz processors, 2 GB available memory |

In addition:
- 500 MB of disk space for software
- Additional disk space proportional to the content being crawled (Web Crawler caches visited URLs)

---

## Installing Dumont DEP

### Option 1 — Docker (fastest)

```bash
docker pull openviglet/dumont:2026.2
docker run -p 30130:30130 openviglet/dumont:2026.2
```

### Option 2 — Download JARs

Download `dumont-connector.jar` and the connector plugin JARs from the [releases page](https://github.com/openviglet/dumont/releases):

```bash
mkdir -p /appl/viglet/dumont/server/libs

# Main connector engine
cp dumont-connector.jar /appl/viglet/dumont/server/

# Connector plugins (choose one or both)
cp aem-plugin.jar /appl/viglet/dumont/server/libs/
cp web-crawler-plugin.jar /appl/viglet/dumont/server/libs/
```

### Option 3 — Build from source

```bash
git clone https://github.com/openviglet/dumont.git
cd dumont
mvn clean install

# Copy the connector engine
cp connector/connector-app/target/dumont-connector.jar /appl/viglet/dumont/server/

# Copy connector plugins
mkdir -p /appl/viglet/dumont/server/libs
cp aem/aem-plugin/target/aem-plugin.jar /appl/viglet/dumont/server/libs/
cp web-crawler/wc-plugin/target/web-crawler-plugin.jar /appl/viglet/dumont/server/libs/
```

---

<div className="page-break" />

## Starting with a Connector Plugin

The key to running Dumont DEP is the `-Dloader.path` JVM property. It tells Spring Boot's PropertiesLauncher where to find the connector plugin JARs.

### With AEM Plugin

```bash
java -Dloader.path=libs \
     -Dturing.url=http://localhost:2700 \
     -Dturing.apiKey=<YOUR_TURING_API_KEY> \
     -jar dumont-connector.jar
```

### With Web Crawler Plugin

```bash
java -Dloader.path=libs \
     -Dturing.url=http://localhost:2700 \
     -Dturing.apiKey=<YOUR_TURING_API_KEY> \
     -jar dumont-connector.jar
```

:::note One connector plugin per JVM
Currently, only **one connector plugin** can be active per JVM instance. To run both AEM and Web Crawler, start two separate instances of `dumont-connector.jar` — each with its own `libs/` directory containing the appropriate plugin, and each on a different port.
:::

### With Custom AEM Extensions

If you have a custom AEM extension (like the `aem-plugin-sample`), add its JAR to the same `libs/` directory:

```bash
ls libs/
aem-plugin.jar
aem-plugin-sample.jar    # Your custom extensions

java -Dloader.path=libs \
     -Dturing.url=http://localhost:2700 \
     -Dturing.apiKey=<YOUR_TURING_API_KEY> \
     -jar dumont-connector.jar
```

The configuration JSON references extension classes by fully-qualified name (e.g., `com.viglet.dumont.connector.aem.sample.ext.DumAemExtSampleModelJson`). These classes are found on the classpath because the extension JAR is in the `libs/` directory.

:::tip loader.path accepts directories or individual JARs
You can point to a directory or a specific JAR: `-Dloader.path=libs` or `-Dloader.path=/path/to/aem-plugin.jar`
:::

---

## Database Configuration

By default, Dumont DEP uses **H2** as its embedded database for tracking indexing state. For production, replace with PostgreSQL.

### H2 (default — development only)

No configuration needed. The database is created automatically at `./store/db/dumontDB`.

### PostgreSQL (recommended for production)

Create a database and user:

```sql
CREATE USER dumont PASSWORD '<password>' WITH CREATEUSER;
CREATE DATABASE dumont_db;
ALTER DATABASE dumont_db OWNER TO dumont;
```

Configure via JVM properties:

```bash
java -Dloader.path=libs \
     -Dspring.datasource.url=jdbc:postgresql://localhost:5432/dumont_db \
     -Dspring.datasource.username=dumont \
     -Dspring.datasource.password=<password> \
     -Dspring.datasource.driver-class-name=org.postgresql.Driver \
     -Dturing.url=http://localhost:2700 \
     -Dturing.apiKey=<YOUR_TURING_API_KEY> \
     -jar dumont-connector.jar
```

---

## Connecting to Turing ES

Dumont DEP sends content to Turing ES by default. Configure the connection:

```yaml
turing:
  url: http://localhost:2700
  apiKey: <YOUR_TURING_API_KEY>
```

Create an API Token in **Turing ES → Administration → API Tokens** and use it as the `apiKey` value.

:::warning API Token Required
Dumont DEP cannot send content to Turing ES without a valid API Token. Create one in the Turing ES admin console before starting Dumont DEP.
:::

---

<div className="page-break" />

## Creating a Linux Service

Each connector plugin runs as a separate service. Create a dedicated directory per connector with its own configuration.

### Directory Layout (AEM example)

```
/appl/viglet/dumont/aem/
├── dumont-connector.jar
├── dumont-connector.properties    # Spring Boot external config
└── libs/
    └── aem-plugin.jar             # Connector plugin
```

### External Properties File

Create `/appl/viglet/dumont/aem/dumont-connector.properties`:

```properties
turing.url=http://localhost:2700
turing.apiKey=<YOUR_TURING_API_KEY>
server.port=30130
```

### Systemd Service File

As root, create `/etc/systemd/system/dumont-aem.service`:

```ini
[Unit]
Description=Viglet Dumont DEP (AEM)
After=syslog.target

[Service]
User=turing
Group=turing
WorkingDirectory=/appl/viglet/dumont/aem
ExecStart=/appl/java/jdk21/bin/java -Xmx512m -Xms512m \
  -Dloader.path=/appl/viglet/dumont/aem/libs/ \
  -jar /appl/viglet/dumont/aem/dumont-connector.jar \
  --spring.config.additional-location=file:/appl/viglet/dumont/aem/dumont-connector.properties
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
systemctl daemon-reload
systemctl enable dumont-aem.service
systemctl start dumont-aem.service
```

### Running Multiple Connectors

Since only one connector plugin is supported per JVM, run separate services for each connector — each with its own directory, config, and port:

```
/appl/viglet/dumont/
├── aem/                           # AEM connector (port 30130)
│   ├── dumont-connector.jar
│   ├── dumont-connector.properties
│   └── libs/
│       └── aem-plugin.jar
└── webcrawler/                    # Web Crawler connector (port 30131)
    ├── dumont-connector.jar
    ├── dumont-connector.properties
    └── libs/
        └── web-crawler-plugin.jar
```

Create a separate systemd service for each (e.g., `dumont-aem.service`, `dumont-webcrawler.service`), each pointing to its own `WorkingDirectory` and properties file with a different `server.port`.

---

## Standalone Connectors (Database & FileSystem)

The **Database** and **FileSystem** connectors are **standalone CLI tools** — they do not run as plugins inside the connector application. Instead, they connect to a running Dumont DEP instance via its REST API.

### Database Connector

```bash
java -cp dumont-db-indexer.jar com.viglet.dumont.connector.db.DumDbImportTool \
  --server http://localhost:30130 \
  --api-key <API_KEY> \
  --driver org.mariadb.jdbc.Driver \
  --connect "jdbc:mariadb://localhost:3306/products" \
  --query "SELECT id, name, description FROM products" \
  --site ProductCatalog \
  --locale en_US
```

### FileSystem Connector

```bash
java -cp dumont-filesystem-indexer.jar com.viglet.dumont.filesystem.DumFSImportTool \
  --source-dir /mnt/shared/documents \
  --server http://localhost:30130 \
  --api-key <API_KEY> \
  --site InternalDocs \
  --locale en_US
```

These tools run independently and can be scheduled via cron jobs or CI/CD pipelines.

---

<div className="page-break" />

## Docker Compose

A full stack with Dumont DEP, Turing ES, Solr, and MariaDB:

```yaml
services:
  dumont:
    image: openviglet/dumont:2026.2
    ports:
      - "30130:30130"
    environment:
      TURING_URL: http://turing:2700
      TURING_APIKEY: <YOUR_API_KEY>

  turing:
    image: openviglet/turing:2026.2
    ports:
      - "2700:2700"

  solr:
    image: solr:9
    ports:
      - "8983:8983"

  mariadb:
    image: mariadb:11
    environment:
      MARIADB_ROOT_PASSWORD: root
      MARIADB_DATABASE: turing
      MARIADB_USER: turing
      MARIADB_PASSWORD: turing
```

---

## Verifying the Installation

After starting Dumont DEP, verify it is running:

```bash
curl http://localhost:30130/api/v2/connector/status
```

A successful response confirms the service is up and ready to accept connector configurations.

---

## Directory Structure Summary

A complete production deployment with two connectors:

```
/appl/viglet/dumont/
├── aem/                                # AEM connector instance
│   ├── dumont-connector.jar            # Pipeline engine
│   ├── dumont-connector.properties     # Turing URL, API key, port
│   ├── libs/
│   │   └── aem-plugin.jar             # AEM connector plugin
│   └── store/                          # Auto-created at runtime
│       ├── db/                         # H2 indexing database
│       ├── queue/                      # Artemis persistent queue
│       └── logs/                       # Application logs
└── webcrawler/                         # Web Crawler connector instance
    ├── dumont-connector.jar
    ├── dumont-connector.properties
    ├── libs/
    │   └── web-crawler-plugin.jar
    └── store/
```

---

## Related Pages

| Page | Description |
|---|---|
| [Configuration Reference](./configuration-reference.md) | All application.yaml properties |
| [Architecture](./architecture.md) | System components and data flow |
| [Connectors Overview](./connectors/overview.md) | Available connectors and how to configure them |

---

