---
sidebar_position: 3
title: Installation Guide
description: Install and configure Viglet Dumont DEP — Docker, JAR download, build from source, database setup, and service configuration.
---

# Viglet Dumont DEP: Installation Guide

Viglet Dumont DEP is an open-source data extraction platform that connects content sources to search engines. All content is extracted by connectors and delivered through an asynchronous pipeline.

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
docker pull openviglet/dumont:2026.1
docker run -p 30130:30130 openviglet/dumont:2026.1
```

### Option 2 — JAR download

Download the latest `viglet-dumont.jar` from the [releases page](https://github.com/openviglet/dumont/releases) and copy it to your installation directory:

```bash
mkdir -p /appl/viglet/dumont/server
cp viglet-dumont.jar /appl/viglet/dumont/server
```

### Option 3 — Build from source

```bash
git clone https://github.com/openviglet/dumont.git
cd dumont
mvn clean package -pl connector/connector-app
cp connector/connector-app/target/viglet-dumont.jar /appl/viglet/dumont/server/
```

---

<div className="page-break" />

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

Configure in `viglet-dumont.conf`:

```bash
JAVA_OPTS="-Xmx1g -Xms1g \
  -Dspring.datasource.url=jdbc:postgresql://localhost:5432/dumont_db \
  -Dspring.datasource.username=dumont \
  -Dspring.datasource.password=<password> \
  -Dspring.datasource.driver-class-name=org.postgresql.Driver"
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

:::warning API Key Required
Dumont DEP cannot send content to Turing ES without a valid API Key. Create one in the Turing ES admin console before starting Dumont DEP.
:::

---

## Starting Dumont DEP

```bash
$ java -jar viglet-dumont.jar
```

The application starts at `http://localhost:30130` by default.

---

## Creating a Linux Service

As root, create `/etc/systemd/system/dumont.service`:

```ini
[Unit]
Description=Viglet Dumont DEP
After=syslog.target network.target

[Service]
User=viglet
EnvironmentFile=/appl/viglet/dumont/server/viglet-dumont.conf
ExecStart=/usr/bin/java $JAVA_OPTS -jar /appl/viglet/dumont/server/viglet-dumont.jar
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
systemctl daemon-reload
systemctl enable dumont.service
systemctl start dumont.service
```

---

<div className="page-break" />

## Docker Compose

A full stack with Dumont DEP, Turing ES, Solr, and MariaDB:

```yaml
services:
  dumont:
    image: openviglet/dumont:2026.1
    ports:
      - "30130:30130"
    environment:
      TURING_URL: http://turing:2700
      TURING_APIKEY: <YOUR_API_KEY>

  turing:
    image: openviglet/turing:2026.1
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

## Related Pages

| Page | Description |
|---|---|
| [Configuration Reference](./configuration-reference.md) | All application.yaml properties |
| [Architecture](./architecture.md) | System components and data flow |
| [Connectors Overview](./connectors/overview.md) | Available connectors and how to configure them |

---

*Previous: [Architecture](./architecture.md) | Next: [Configuration Reference](./configuration-reference.md)*
