---
sidebar_position: 1
title: Installation Guide
description: Viglet Shio CMS Installation Guide
---

# Viglet Shio CMS: Installation Guide

Viglet Shio CMS ([https://viglet.com/shio](https://viglet.com/shio)) is an open source solution ([https://github.com/ShioCMS](https://github.com/ShioCMS)), which allows model content, use GraphQL and create site using Javascript with native cache and search.

## Installing Java

Shio CMS requires Java.

:::note
Shio CMS only supports Java 17.
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

## Installing Shio CMS

### Shio CMS Download

Go to [https://viglet.org/shio/download/](https://viglet.org/shio/download/) and click on "Download Shio CMS" button to download the `viglet-shio.jar` executable.

Copy the `viglet-shio.jar` to `/appl/viglet/shio/server`:

```shell
mkdir -p /appl/viglet/shio/server
cp viglet-shio.jar /appl/viglet/shio/server
chmod 770 /appl/viglet/shio/server/viglet-shio.jar
```

### Database

By default, Shio uses H2 as its embedded database. For another database, create `/appl/viglet/shio/server/viglet-shio.conf`:

#### MySQL

```shell
JAVA_OPTS="-Xmx1g -Xms1g -Dspring.datasource.url=jdbc:mariadb://localhost:3306/shio -Dspring.datasource.username=shio -Dspring.datasource.password=shio -Dspring.datasource.driver-class-name=org.mariadb.jdbc.Driver -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect"
```

#### Oracle Database

```shell
JAVA_OPTS="-Xmx1g -Xms1g -Dspring.datasource.url=jdbc:oracle:thin:@localhost:1521/shio -Dspring.datasource.username=shio -Dspring.datasource.password=shio -Dspring.datasource.driver-class-name=oracle.jdbc.OracleDriver -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.Oracle10gDialect"
```

#### PostgreSQL

```shell
JAVA_OPTS="-Xmx1g -Xms1g -Dspring.datasource.url=jdbc:postgresql://localhost:5432/shio -Dspring.datasource.username=shio -Dspring.datasource.password=shio -Dspring.datasource.driver-class-name=org.postgresql.Driver -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQL94Dialect"
```

### Encrypting the Database Password

```shell
cd /appl/viglet/shio/utils/scripts
./turGenerateDBPassword.sh /appl/viglet/shio/server
Password:
Retype Password:

Thanks, the password was successfully generated in /appl/viglet/shio/server/db-encrypted.properties
```

Replace `-Dspring.datasource.password=<PLAIN_TEXT_PASSWORD>` with `-Dspring.datasource.password=ENC(<ENCRYPTED_PASSWORD>)`.

### Creating Shio CMS Service on Linux

#### Red Hat and CentOS

Create `/etc/systemd/system/shio.service`:

```ini
[Unit]
Description=Viglet Shio CMS
After=syslog.target

[Service]
User=viglet
ExecStart=/appl/viglet/shio/server/viglet-shio.jar
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

Interact with the service:

```shell
./systemctl start shio.service
./systemctl stop shio.service
./systemctl restart shio.service
./systemctl status shio.service
```

### Accessing the Shio Console

Shio provides remote access through its Web application interfaces at: [http://localhost:2710/content](http://localhost:2710/content).

By default the login/password are: **admin/admin**
