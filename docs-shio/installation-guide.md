---
sidebar_position: 1
title: Installation Guide
description: Viglet Shio CMS Installation Guide — Docker, JAR, build from source, database setup, and Linux service.
---

# Viglet Shio CMS: Installation Guide

Viglet Shio CMS ([https://viglet.org/shio](https://viglet.org/shio)) is an open-source headless CMS ([https://github.com/openviglet/shio](https://github.com/openviglet/shio)) that lets you model content, query it via GraphQL, and build websites using JavaScript with native caching and search.

## Installing Java

Shio CMS requires Java.

:::note
Shio CMS only supports Java 21.
:::

During installation, Shio CMS reads the JAVA_HOME and PATH variables to install the necessary services. Therefore, you must modify the variables as specified here:

- **On Windows:**
  - Set the JAVA_HOME system variable to point to the JAVA location.
  - Attach the PATH system variable with `%JAVA_HOME%/bin`.

- **On Unix:**
  - Create an environment variable called JAVA_HOME.
  - Provide the JAVA bin path in the PATH variable.

## Shio CMS Requirements

The information below describes the resource modes available to run Shio CMS.

:::note
Use a screen resolution of at least 1024 x 768 for optimum clarity.
:::

### Hardware Requirements

| Minimum | Recommended |
|---------|-------------|
| Single 1.5 GHz processor, 1 GB available memory | Dual 2 GHz processors with Hyper-Threading enabled, 2 GB available memory |

In addition, the following is required:

- 1GB of disk space for software.
- A compatible version of a database.

## Installing and Configuring Databases

Shio CMS supports multiple database platforms, each with specific unique requirements to maximize effectiveness with Shio CMS.

### Shio CMS Database Table Requirements

Shio CMS uses multiple tables in multiple databases (also called database schemas by some vendors such as Oracle). You must create new databases / schemas that will contain the sets of tables described below.

### Oracle Database Requirements

This section describes configuration requirements for an existing database.

To set up an Oracle database:

1. Install and configure a single database instance for use by Shio CMS.
2. Create a database schema to contain the Shio CMS system tables.
3. Configure the Shio CMS admin user for the database. For Oracle, the database user with the grant of the CONNECT and RESOURCE roles. Make sure the user has UNLIMITED TABLESPACE and CREATE VIEW privileges.

### Microsoft SQL Server Database Requirements

When creating the Shio CMS database, use the following options:

- You must install the Database Engine feature and Management Tools are recommended.
- Set the Collation configuration variable to `SQL_Latin1_General_CP1_CS_AS` or `Latin1_General / Case-sensitive / Accent-Sensitive`.
- Set authentication mode to mixed mode.
- Shio CMS system user cannot be sa.

#### Configuring the SQL Server Database and Schemas

:::note
The database and usernames provided are examples only.
:::

To create the SQL Server database:

1. Select Databases > New Database.
2. Enter the database name (eg shio) and the size of the data and log files according to the environment.
3. Go to the Options page and set the following values:
   - Collation = `Latin1_General_CS_AS` or `SQL_Latin1_General_CP1_CS_AS`
   - Miscellaneous > Allow Snapshot Isolation = True
   - Miscellaneous > Is Read Committed Snapshot On = True

```sql
USE master
GO
ALTER DATABASE shio
SET SINGLE_USER
WITH ROLLBACK IMMEDIATE
GO
ALTER DATABASE shio
SET ALLOW_SNAPSHOT_ISOLATION ON
GO
ALTER DATABASE shio
SET READ_COMMITTED_SNAPSHOT ON
GO
ALTER DATABASE shio
SET MULTI_USER
GO
```

4. Under Security > Logins, select New Login:
   - Enter the Login name (for example, shio)
   - Deselect the Enforce Password Expiration option
   - Set the Default database

5. On the User Mapping page:
   - Default user = shio
   - Default schema = shio
   - Select the option for db_owner

### PostgreSQL Database Requirements

#### Installing and configuring the PostgreSQL Database

To install the PostgreSQL database:

1. Navigate to [https://www.postgresql.org/docs/manuals/](https://www.postgresql.org/docs/manuals/) and follow the instructions.

To configure the PostgreSQL instance, open `postgresql.conf` and set:

```ini
max_connections = 10
max_prepared_transactions = 10
shared_buffers = 512MB
autovacuum = off
```

:::important
The autovacuum daemon must be re-enabled after installing and configuring Shio CMS.
:::

#### Configuring the Shio user, database, and schemas

:::important
When you create a database table in PostgreSQL, the field name must be lowercase.
:::

1. Create a user:

```sql
CREATE USER shio PASSWORD <password> with createuser;
```

2. Create the database:

```sql
CREATE DATABASE shio_db;
ALTER DATABASE shio_db OWNER TO shio;
```

3. Log in and create the schema:

```bash
$psql -U shio -d shio_db
```

```sql
CREATE SCHEMA shio;
ALTER SCHEMA shio OWNER TO shio;
ALTER USER shio SET SEARCH_PATH = shio;
```

---

<div className="page-break" />

## Installing Shio CMS

### Option 1 — Docker (fastest)

```bash
docker pull openviglet/shio:2026.1
docker run -p 2710:2710 openviglet/shio:2026.1
```

### Option 2 — JAR download

Go to [https://viglet.org/shio/download/](https://viglet.org/shio/download/) and click on "Download Shio CMS" button to download the `viglet-shio.jar` executable.

Copy the `viglet-shio.jar` to `/appl/viglet/shio/server`:

```shell
mkdir -p /appl/viglet/shio/server
cp viglet-shio.jar /appl/viglet/shio/server
```

### Option 3 — Build from source

```bash
git clone https://github.com/openviglet/shio.git
cd shio
mvn clean package -pl shio-app
cp shio-app/target/viglet-shio.jar /appl/viglet/shio/server/
```

### Database

By default, Shio uses H2 as its embedded database, but if you prefer another database you can create an external properties file and reference it at startup using `--spring.config.additional-location`.

Create `/appl/viglet/shio/server/viglet-shio.properties`:

#### MySQL

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/shio
spring.datasource.username=shio
spring.datasource.password=shio
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
```

#### Oracle Database

```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521/shio
spring.datasource.username=shio
spring.datasource.password=shio
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.Oracle10gDialect
```

#### PostgreSQL

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shio
spring.datasource.username=shio
spring.datasource.password=shio
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQL94Dialect
```

Then start Shio CMS referencing the properties file:

```bash
java -Xmx1g -Xms1g -jar viglet-shio.jar \
  --spring.config.additional-location=file:/appl/viglet/shio/server/viglet-shio.properties
```

---

<div className="page-break" />

### Creating Shio CMS Service on Linux

As root, create a `/etc/systemd/system/shio.service` file with the following lines:

```ini
[Unit]
Description=Viglet Shio CMS
After=syslog.target

[Service]
User=viglet
Group=viglet
WorkingDirectory=/appl/viglet/shio/server
ExecStart=/appl/java/jdk21/bin/java -Xmx1g -Xms1g \
  -jar /appl/viglet/shio/server/viglet-shio.jar \
  --spring.config.additional-location=file:/appl/viglet/shio/server/viglet-shio.properties
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

:::note Spring Boot 4
Starting with Spring Boot 4, JAR files are no longer directly executable (`./viglet-shio.jar`). You must launch Shio CMS using `java -jar` explicitly. The `.conf` file pattern used in older versions is no longer supported — use `--spring.config.additional-location` to load external properties instead.
:::

Enable and start the service:

```shell
systemctl daemon-reload
systemctl enable shio.service
systemctl start shio.service
```

Other useful commands:

```shell
systemctl stop shio.service
systemctl restart shio.service
systemctl status shio.service
```

### Accessing the Shio Console

Shio provides remote access through its Web application interfaces at: [http://localhost:2710](http://localhost:2710).

By default the login/password are: **admin/admin**

---

## Appendix A: Installation Modes

### Simple

Minimal setup using an embedded H2 database. Suitable for local development and evaluation only — not for production.

**Prerequisites:**
1. Linux server
2. Java 21
3. 50 GB HDD
4. 2 GB RAM

**Target Audience:** Development and testing environments.

### Docker Compose

Shio CMS and its dependencies installed via Docker Compose, including:

- MariaDB — Shio CMS system tables
- Nginx — reverse proxy on port 80
- Shio CMS

**Prerequisites:**
1. Linux server with Docker and Docker Compose installed
2. 50 GB HDD
3. 4 GB RAM

**Target Audience:** Teams that want a complete environment without manual service installation. Suitable for QA and production.

### Kubernetes

Shio CMS and its dependencies deployed via Kubernetes manifests (available in the `k8s/` directory), including:

- MariaDB — Shio CMS system tables
- Nginx — reverse proxy
- Shio CMS

**Prerequisites:**
1. Linux server with Kubernetes, or a cloud Kubernetes service (GKE, EKS, AKS)
2. 100 GB storage
3. 4 GB RAM

**Target Audience:** Cloud deployments requiring horizontal scaling and infrastructure-as-code.

### Manual Installation

Each service installed individually following this guide:

- MariaDB — Shio CMS system tables
- Shio CMS

**Prerequisites:**
1. One to two Linux servers
2. 50–100 GB storage per server
3. Minimum 2 GB RAM per server

---

## Appendix B: Docker Compose

You can start Shio CMS using MariaDB and Nginx.

```shell
mvn clean package -pl shio-app
docker-compose up
```

:::note
If you have problems with permissions on directories, run `chmod -R 777 volumes`
:::

### Docker Commands

#### Shio

```shell
docker exec -it shio /bin/bash
```

#### MariaDB

```shell
docker exec -it shio-mariadb /bin/bash
```

#### Nginx

```shell
docker exec -it shio-nginx /bin/bash
```

---
