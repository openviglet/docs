---
sidebar_position: 1
title: Installation Guide
description: Viglet Turing ES Installation Guide
---

# Viglet Turing ES: Installation Guide

Viglet Turing ES ([https://viglet.com/turing](https://viglet.com/turing)) is an open source enterprise search platform ([https://github.com/openviglet](https://github.com/openviglet)) with Semantic Navigation and Generative AI as its main features. All content is indexed in Apache Solr as the primary search engine.

## Installing Java

Turing ES requires Java.

:::note
Turing ES only supports Java 21.
:::

During installation, Turing ES reads the JAVA_HOME and PATH variables to install the necessary services. Therefore, you must modify the variables as specified here:

- **On Windows:**
  - Set the JAVA_HOME system variable to point to the JAVA location.
  - Attach the PATH system variable with `%JAVA_HOME%/bin`.

- **On Unix:**
  - Create an environment variable called JAVA_HOME.
  - Provide the JAVA bin path in the PATH variable.

## Turing ES Requirements

The information below describes the resource modes available to run Turing ES.

:::note
Use a screen resolution of at least 1024 x 768 for optimum clarity.
:::

This section describes the minimum and suggested features for systems on which you can configure Turing ES.

### Hardware Requirements

| Minimum | Recommended |
|---------|-------------|
| Single 1.5 GHz processor, 1 GB available memory | Dual 2 GHz processors with Hyper-Threading enabled, 2 GB available memory |

In addition, the following is required:

- 1GB of disk space for software.
- A compatible version of a database.

## Installing and Configuring Databases

Turing ES supports multiple database platforms, each with specific unique requirements to maximize effectiveness with Turing ES. The following sections describe these requirements.

### Turing ES Database Table Requirements

Turing ES uses multiple tables in multiple databases (also called database schemas by some vendors such as Oracle). You must create new databases / schemas that will contain the sets of tables described below.

### Oracle Database Requirements

This section describes configuration requirements for an existing database.

To set up an Oracle database:

1. Install and configure a single database instance for use by Turing ES.
2. Create a database schema to contain the Turing ES system tables.
3. Configure the Turing ES admin user for the database. For Oracle, the database user with the grant of the CONNECT and RESOURCE roles. Make sure the user has UNLIMITED TABLESPACE and CREATE VIEW privileges.

### Microsoft SQL Server Database Requirements

This section discusses the steps required to configure Microsoft SQL Server for your Turing ES databases.

When creating the Turing ES database, use the following options:

- You must install the Database Engine feature and Management Tools are recommended. All other features are optional.
- Set the Collation configuration variable to `SQL_Latin1_General_CP1_CS_AS` or `Latin1_General / Case-sensitive / Accent-Sensitive`.
- Set authentication mode to mixed mode.
- Turing ES system user cannot be sa.

#### Configuring the SQL Server Database and Schemas

:::note
The database and usernames provided are examples only.
:::

To create the SQL Server database:

1. Select Databases > New Database.
2. Enter the database name (eg turing) and the size of the data and log files according to the environment.
3. Go to the Options page and set the following values:
   - Collation = `Latin1_General_CS_AS` or `SQL_Latin1_General_CP1_CS_AS`
   - Miscellaneous > Allow Snapshot Isolation = True
   - Miscellaneous > Is Read Committed Snapshot On = True

```sql
USE master
GO
ALTER DATABASE turing
SET SINGLE_USER
WITH ROLLBACK IMMEDIATE
GO
ALTER DATABASE turing
SET ALLOW_SNAPSHOT_ISOLATION ON
GO
ALTER DATABASE turing
SET READ_COMMITTED_SNAPSHOT ON
GO
ALTER DATABASE turing
SET MULTI_USER
GO
```

4. Under Security > Logins, select New Login and set the following attributes:
   - Enter the Login name (for example, turing)
   - Deselect the Enforce Password Expiration option.
   - Set the Default database.

5. On the User Mapping page, set the following attributes for the turing database:
   - Default user = turing
   - Default schema = turing
   - With the turing database is selected, select the option for db_owner

6. Click OK.

### PostgreSQL Database Requirements

This section discusses the steps required to configure PostgreSQL for your Turing ES databases:

- Installing and configuring the PostgreSQL Database
- Configuring the Turing ES user, database, and schema

#### Installing and configuring the PostgreSQL Database

This section describes the steps required to install and configure a PostgreSQL database for your Turing ES environment. You will also need to configure the Turing user, database and schemas.

To install the PostgreSQL database:

1. Navigate to the following URL and follow the instructions provided for your supported version of PostgreSQL: [https://www.postgresql.org/docs/manuals/](https://www.postgresql.org/docs/manuals/)

To configure the PostgreSQL instance:

Open the `postgresql.conf` file (located in `<PostgreSQL_installDir>/<version>/data/`) and set the following parameters:

```ini
max_connections = 10
max_prepared_transactions = 10
shared_buffers = 512MB
autovacuum = off
```

:::important
The autovacuum daemon is used to reclaim memory/storage space the database is no longer using. You must re-enable this utility after you have finished installing and configuring Turing ES.
:::

:::note
Configuration values will vary for higher transaction environments and numbers of users. `max_prepared_transactions` should be at least as large as `max_connections` so that every session can have a prepared transaction pending.
:::

#### Configuring the Turing user, database, and schemas

:::note
You must be a PostgreSQL super-user or have createuser privileges to create Turing users. To create and configure the Turing ES database, you must be a super-user or have create privileges.
:::

:::important
When you create a database table in PostgreSQL, the field name must be lowercase.
:::

To configure the Turing ES user:

1. Create a user as the owner of the Turing ES database:

```sql
CREATE USER turing PASSWORD <password> with createuser;
```

2. Create a Turing ES database:

```sql
CREATE DATABASE turing_db;
ALTER DATABASE turing_db OWNER TO turing;
```

To create and access the Turing ES user and schema:

- Log in to the turing (database) using the turing account:

```bash
$psql -U turing -d turing_db
```

- Create the Turing schema and grant ownership to the Turing user:

```sql
CREATE SCHEMA turing;
ALTER SCHEMA turing OWNER TO turing;
```

- Set the PostgreSQL search_path variable:

```sql
ALTER USER turing SET SEARCH_PATH = turing;
```

## Turing Utils

First you need install Turing Utils, that contains sample configurations and script to facilitate the use of Turing ES, so go to [https://viglet.org/turing/download/](https://viglet.org/turing/download/) and click on "Integration > Utils" link to download it.

Extract the turing-utils.zip to `/appl/viglet/turing/utils`:

```shell
mkdir -p /appl/viglet/turing/utils
unzip turing-utils.zip -d /appl/viglet/turing/utils
```

## Keycloak

For production deployments that require SSO, Keycloak integrates with Turing ES via OAuth2 / OpenID Connect. Full setup instructions — including database creation, keystore generation, Keycloak configuration, realm and client setup, JVM properties, and Apache reverse proxy configuration — are covered in the [Security & Keycloak](./security-keycloak.md) guide.

## Solr Configuration

You need to configure Solr to be able to store Semantic Navigation data.

With Solr running, go to Turing Utils and create the Solr collection that will be used by Turing ES:

```shell
cd <SOLR_DIR>/bin
./solr create_collection -c turing -n turing -d /appl/viglet/turing/utils/solr/<VERSION>/turing/<LANGUAGE>
```

Start the Solr service after the collection is created.

<div className="page-break" />

## Installing Turing ES

### Turing ES Download

#### Option 1 — Docker (fastest)

```bash
docker pull openviglet/turing:2026.1
docker run -p 2700:2700 openviglet/turing:2026.1
```

#### Option 2 — JAR download

Go to [https://viglet.org/turing/download/](https://viglet.org/turing/download/) and click on "Download Turing ES" button to download `viglet-turing.jar`.

Copy the `viglet-turing.jar` to `/appl/viglet/turing/server`:

```shell
mkdir -p /appl/viglet/turing/server
cp viglet-turing.jar /appl/viglet/turing/server
```

#### Option 3 — Build from source

```bash
git clone https://github.com/openviglet/turing.git
cd turing
mvn clean package -pl turing-app
cp turing-app/target/viglet-turing.jar /appl/viglet/turing/server/
```

### Database

By default, Turing uses H2 as its embedded database, but if you prefer another database you can follow the procedure below, creating `/appl/viglet/turing/server/viglet-turing.conf` file with following lines:

#### MySQL

```shell
JAVA_OPTS="-Xmx1g -Xms1g -Dspring.datasource.url=jdbc:mariadb://localhost:3306/turing -Dspring.datasource.username=turing -Dspring.datasource.password=turing -Dspring.datasource.driver-class-name=org.mariadb.jdbc.Driver -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect"
```

#### Oracle Database

```shell
JAVA_OPTS="-Xmx1g -Xms1g -Dspring.datasource.url=jdbc:oracle:thin:@localhost:1521/turing -Dspring.datasource.username=turing -Dspring.datasource.password=turing -Dspring.datasource.driver-class-name=oracle.jdbc.OracleDriver -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.Oracle10gDialect"
```

#### PostgreSQL

```shell
JAVA_OPTS="-Xmx1g -Xms1g -Dspring.datasource.url=jdbc:postgresql://localhost:5432/turing -Dspring.datasource.username=turing -Dspring.datasource.password=turing -Dspring.datasource.driver-class-name=org.postgresql.Driver -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQL94Dialect"
```

<div className="page-break" />

### Creating Turing ES Service on Linux

As root, create a `/etc/systemd/system/turing.service` file with the following lines:

```ini
[Unit]
Description=Viglet Turing ES
After=syslog.target network.target

[Service]
User=viglet
EnvironmentFile=/appl/viglet/turing/server/viglet-turing.conf
ExecStart=/usr/bin/java $JAVA_OPTS -jar /appl/viglet/turing/server/viglet-turing.jar
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

:::note Spring Boot 4
Starting with Spring Boot 4, JAR files are no longer directly executable (`./viglet-turing.jar`). You must launch Turing ES using `java -jar` explicitly.
:::

Enable and start the service:

```shell
systemctl daemon-reload
systemctl enable turing.service
systemctl start turing.service
```

Other useful commands:

```shell
systemctl stop turing.service
systemctl restart turing.service
systemctl status turing.service
```

### Starting Turing ES

When Turing ES is started for the first time, it will perform initial setup.

```
$ java -jar viglet-turing.jar
  _____            _               ___  ___
 |_   _|_  _  _ _ (_) _ _   __ _  | __|/ __|
   | | | || || '_|| || ' \ / _` | | _| \__ \
   |_|  \_,_||_|  |_||_||_|\__, | |___||___/ 2026.1.17
                           |___/

:: Copyright (C) 2016-2026 Viglet Turing Enterprise Search

:: Built with Spring Boot :: 3.5.0

First Time Configuration ...
Configuration finished.
```

### Accessing the Turing Console

Turing provides remote access to administration, configuration, and management through its Web application interfaces. Once setup is complete, the Console become browser-accessible through the following URL: `http://<host>:<port>/console` where `<host>:<port>` is the listening host and port for the Turing ES. The default port is **2700**.

The default username is **admin**. The password is set via the `TURING_ADMIN_PASSWORD` environment variable before first startup — see the [Administration Guide](./administration-guide.md#login) for details.

<div className="page-break" />

## Appendix A: Installation Modes

### Turing ES Server

#### Simple

Minimal setup using an embedded H2 database. Suitable for local development and evaluation only — not for production.

**Prerequisites:**
1. Linux server
2. Java 21
3. 50 GB HDD
4. 2 GB RAM

**Target Audience:** Development and testing environments.

#### Docker Compose

Turing ES and its dependencies installed via Docker Compose, including:

- MariaDB — Turing ES system tables
- Solr — Semantic Navigation search backend
- Nginx — reverse proxy on port 80
- Turing ES

**Prerequisites:**
1. Linux server with Docker and Docker Compose installed
2. 50 GB HDD
3. 4 GB RAM

**Target Audience:** Teams that want a complete environment without manual service installation. Suitable for QA and production.

#### Kubernetes

Turing ES and its dependencies deployed via Kubernetes manifests (available in the `k8s/` directory), including:

- MariaDB — Turing ES system tables
- Solr — Semantic Navigation search backend
- Nginx — reverse proxy
- Turing ES

**Prerequisites:**
1. Linux server with Kubernetes, or a cloud Kubernetes service (GKE, EKS, AKS)
2. 100 GB storage
3. 4 GB RAM

**Target Audience:** Cloud deployments requiring horizontal scaling and infrastructure-as-code.

#### Manual Installation

Each service installed individually following this guide:

- MariaDB — Turing ES system tables
- Solr + Zookeeper — Semantic Navigation search backend
- Apache HTTP Server — reverse proxy (required for Keycloak integration)
- Turing ES

**Prerequisites:**
1. One to four Linux servers
2. 50–100 GB storage per server
3. Minimum 2 GB RAM per server

### Connectors

Content ingestion is handled by **Viglet Dumont DEP**, a separate application. Available connectors include WebCrawler (Apache Nutch), Database, FileSystem, AEM/WEM, and WordPress. Refer to the [Dumont DEP documentation](/dumont) for connector setup.

**Prerequisites:**
1. A server with access to the content sources to be indexed
2. 50 GB storage

## Appendix B: Docker Compose

You can start the Turing ES using MariaDB, Solr and Nginx.

```shell
./gradlew turing-app:build -x test -i --stacktrace
docker-compose up
```

:::note
If you have problems with permissions on directories, run `chmod -R 777 volumes`
:::

### Docker Commands

#### Turing

```shell
docker exec -it turing /bin/bash
```

#### Solr

```shell
docker exec -it turing-solr /bin/bash
```

Check logs:

```shell
docker-compose exec turing-solr cat /opt/solr/server/logs/solr.log
# or
docker-compose exec turing-solr tail -f /opt/solr/server/logs/solr.log
```

#### MariaDB

```shell
docker exec -it turing-mariadb /bin/bash
```

#### Nginx

```shell
docker exec -it turing-nginx /bin/bash
```

---

*Previous: [Architecture Overview](./architecture-overview.md) | Next: [Configuration Reference](./configuration-reference.md)*
