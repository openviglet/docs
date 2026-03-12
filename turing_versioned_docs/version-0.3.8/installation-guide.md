---
sidebar_position: 1
title: Installation Guide
description: Viglet Turing ES Installation Guide
---

# Viglet Turing ES: Installation Guide

Viglet Turing ES ([https://viglet.com/turing](https://viglet.com/turing)) is an open source solution ([https://github.com/openviglet](https://github.com/openviglet)), which has Semantic Navigation and Chatbot as its main features. You can choose from several NLPs to enrich the data. All content is indexed in Solr as search engine.

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

## Solr Configuration

You need to configure Solr to be able to store Semantic Navigation and ChatBot data.

### OOTB

With Solr running, go to Turing Utils and create the new cores that will be used by Turing ES.

1. Install the cores into solr:

```shell
cd <SOLR_DIR>/bin
## For Semantic Navigation
./solr create_collection -c turing -n turing -d /appl/viglet/turing/utils/solr/<VERSION>/turing/<LANGUAGE>
## For ChatBot
./solr create_collection -c converse -n converse -d /appl/viglet/turing/utils/solr/<VERSION>/converse/<LANGUAGE>
```

2. Start Solr Service

### OpenText InfoFusion

1. Create the cores into Solr:

```shell
cd <SOLR_DIR>/bin
## For Semantic Navigation
mkdir <SOLR_DIR>/server/solr/turing
cp -Rf /appl/viglet/turing/utils/solr/<VERSION>/turing/<LANGUAGE>/. <SOLR_DIR>/server/solr/turing/
## For ChatBot
mkdir <SOLR_DIR>/server/solr/converse
cp -Rf /appl/viglet/turing/utils/solr/<VERSION>/turing/<LANGUAGE>/. <SOLR_DIR>/server/solr/converse/
```

2. If the core name of Semantic Navigation Site will be different, you need modify the `core.properties` file and change the `name` and `collection` attributes:

```shell
cd <SOLR_DIR>/bin
mkdir <SOLR_DIR>/server/solr/sample
cp /appl/viglet/turing/utils/solr/<VERSION>/turing/<LANGUAGE>/. <SOLR_DIR>/server/solr/sample/
chown otif:otif <SOLR_DIR>/server/solr/sample

## Modify the name and collection fields
sed -i 's/turing/sample/g' <SOLR_DIR>/server/solr/sample/core.properties
```

3. Edit the `<IF_API>/bin/otif.sh` and add the new cores to sync with Zookeeper:

```shell
# Push Solr configurations in ZooKeeper
pushSolrConfigs() {
    ...
    cd "$BASE_DIR"
    # For Semantic Navigation
    ./zk.sh -cmd upconfig -zkhost "$SOLR_ZK_ENSEMBLE" -confdir "<IF_SOLR>/server/solr/turing/conf" -confname turing
    ./zk.sh -cmd upconfig -zkhost "$SOLR_ZK_ENSEMBLE" -confdir "<IF_SOLR>/server/solr/<OTHER_CORE>/conf" -confname <OTHER_CORE>
    # For ChatBot
    ./zk.sh -cmd upconfig -zkhost "$SOLR_ZK_ENSEMBLE" -confdir "<IF_SOLR>/server/solr/converse/conf" -confname converse
    # Default InfoFusion cores (Do not modify)
    ./zk.sh -cmd upconfig -zkhost "$SOLR_ZK_ENSEMBLE" -confdir "$BASE_DIR/../etc/solr/otif/en/conf" -confname otif_en
    ...
    cd "$CURRENT_DIR"
}
```

4. With Zookeeper running, execute:

```shell
cd <IF_API>/bin
./otif.sh push-solr-configs
```

5. Restart the Solr.

## Installing Turing ES

### Turing ES Download

Go to [https://viglet.org/turing/download/](https://viglet.org/turing/download/) and click on "Download Turing ES" button to download the `viglet-turing.jar` executable.

Copy the `viglet-turing.jar` to `/appl/viglet/turing/server`:

```shell
mkdir -p /appl/viglet/turing/server
cp viglet-turing.jar /appl/viglet/turing/server
chmod 770 /appl/viglet/turing/server/viglet-turing.jar
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

### Encrypting the Database Password

For more security, it is possible to encrypt the Database password in `viglet-turing.conf`:

```shell
cd /appl/viglet/turing/utils/scripts
./turGenerateDBPassword.sh /appl/viglet/turing/server
Password:
Retype Password:

Thanks, the password was successfully generated in /appl/viglet/turing/server/db-encrypted.properties

cat /appl/viglet/turing/server/db-encrypted.properties
clqp6QxceJQIp6lnaiKelQc9DvdNKNxg
```

Copy the content and replace `-Dspring.datasource.password=<PLAIN_TEXT_PASSWORD>` with `-Dspring.datasource.password=ENC(<ENCRYPTED_PASSWORD>)`.

For example: `-Dspring.datasource.password=ENC(clqp6QxceJQIp6lnaiKelQc9DvdNKNxg)`

### Creating Turing ES Service on Linux

#### Red Hat and CentOS

As root, create a `/etc/systemd/system/turing.service` file with the following lines:

```ini
[Unit]
Description=Viglet Turing ES
After=syslog.target

[Service]
User=viglet
ExecStart=/appl/viglet/turing/server/viglet-turing.jar
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

This way, you can interact with the Turing ES service:

```shell
./systemctl start turing.service
./systemctl stop turing.service
./systemctl restart turing.service
./systemctl status turing.service
```

### Starting Turing ES

When Turing ES is started for the first time, it will do the initial setup and start downloading the OpenNLP models.

```
$ ./viglet-turing.jar
  _____            _                 _    ___
 |_   _|_  _  _ _ (_) _ _   __ _    /_\  |_ _|
   | | | || || '_|| || ' \ / _` |  / _ \  | |
   |_|  \_,_||_|  |_||_||_|\__, | /_/ \_\|___|  (v0.3.6-d9fc453)
                           |___/

:: Copyright (C) 2016-2022, Viglet Team <opensource@viglet.com>

:: Built with Spring Boot :: 2.7.6

Starting TuringAI v0.3.6-d9fc453 using Java 17.0.1 ...
First Time Configuration ...
[ OK ] en-ner-date.bin model
[ OK ] en-ner-person.bin model
[ OK ] en-ner-location.bin model
...
Configuration finished.
```

### Accessing the Turing Console

Turing provides remote access to administration, configuration, and management through its Web application interfaces. Once setup is complete, the Console become browser-accessible through the following URL: `http://<host>:<port>/console` where `<host>:<port>` is the listening host and port for the Turing ES. The default port is **2700**.

By default the login/password are: **admin/admin**

## Appendix A: Installation Modes

### Turing ES Server

#### Simple

Turing ES will be installed only using OpenNLP and H2 database embedded in Turing ES itself.

**Prerequisites:**
1. Linux server
2. Java 14
3. 50Gb HDD
4. 2 Gb of RAM

**Target Audience:** Development and testing environment. Because it requires fewer components and lower memory usage.

#### Docker Compose

Turing ES and its dependencies will be installed using Docker Compose script, including the following services:

- MariaDB - to store Turing ES system tables
- Solr - Used by Turing ES's Semantic Navigation and Chatbot
- Nginx - WebServer for Turing ES to use port 80
- Turing ES

**Prerequisites:**
1. Linux server
2. Docker and Docker Compose installed
3. 50Gb HDD
4. 4Gb of RAM

**Target Audience:** Customers who need more complex environments, but avoid the installation and configuration of each product. It can be used in QA or Production environment.

#### Kubernetes

Turing ES and its dependencies will be installed using Kubernetes scripts, including the following services:

- MariaDB - to store Turing ES system tables
- Solr - Used by Turing ES's Semantic Navigation and Chatbot
- Nginx - WebServer for Turing ES to use port 80
- Turing ES

**Prerequisites:**
1. Linux Server with Kubernetes installed or Cloud that supports Kubernetes
2. 100Gb of Storage
3. 4Gb RAM

**Target Audience:** Customers who want to use cloud solutions like Google, AWS, Oracle, etc. It can be used in the production environment in a scalable way.

#### Manual Installation of Services

The services will be installed individually on the servers following the Installation Guide procedure, which will include the following services:

- MariaDB - to store Turing ES system tables
- Solr - Used by Turing ES's Semantic Navigation and Chatbot
- Apache - WebServer for Turing ES to use port 80
- Turing ES

**Prerequisites:**
1. One Linux server or up to 4 Linux servers to install services
2. 50 - 100Gb of Storage for each server
3. Minimum 2Gb RAM for each Server

### Connectors

Turing ES has several connectors to allow you to index the contents in Semantic Navigation:

- Apache Nutch (Crawler)
- Wordpress
- OpenText WEM Listener
- FileSystem
- Database

**Prerequisites:**
1. New linux server or existing server with content or files that will be indexed.
2. 50Gb of Storage for each server.

### NLP

The customer can choose the NLP that will be used by Turing ES:

- Apache OpenNLP (Embedded)
- SpaCy NLP
- Stanford CoreNLP
- OpenText Content Analytics
- Polyglot

**Prerequisites:**
1. Linux server
2. 50Gb of Storage for each server
3. Minimum 2 Gb of RAM

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
