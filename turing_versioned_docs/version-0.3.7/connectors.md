---
sidebar_position: 3
title: Connectors
description: Viglet Turing ES Connectors for indexing content
---

# Viglet Turing ES: Connectors

There are several connectors to allow you to index content in Viglet Turing ES.

## Apache Nutch

Apache Nutch is a highly extensible and scalable open source web crawler software project.

### Installation

#### Nutch 1.18 and 1.20

1. Go to [https://viglet.org/turing/download/](https://viglet.org/turing/download/) and click on "Integration > Apache Nutch 1.18 Plugin" or "Integration > Apache Nutch 1.20 Plugin" link to download it.

2. Extract the plugin to `<APACHE_NUTCH>/plugins/indexer-viglet-turing`

### Configuration

#### nutch-site.xml

Add the following properties to `<APACHE_NUTCH>/conf/nutch-site.xml`:

| Parameter | Description |
|-----------|-------------|
| `turing.url` | URL of Turing ES Server (e.g., `http://localhost:2700`) |
| `turing.apiKey` | API Key for authentication |
| `turing.snSite` | Semantic Navigation Site name |
| `turing.locale` | Locale for indexing (e.g., `en_US`) |

#### turing-mapping.xml

Create or edit `<APACHE_NUTCH>/conf/turing-mapping.xml` to configure field mappings:

```xml
<mapping>
  <fields>
    <field source="title" dest="title"/>
    <field source="content" dest="text"/>
    <field source="url" dest="url"/>
    <field source="tstamp" dest="modification_date"/>
  </fields>
  <siteUrl>
    <value url="https://example.com" snSite="Sample" locale="en_US"/>
  </siteUrl>
  <uniqueKey field="url"/>
</mapping>
```

### Indexing a Website

```shell
cd <APACHE_NUTCH>
bin/crawl -i -D solr.server.url=http://localhost:8983/solr/turing -s urls crawl 5
```

## Database

JDBC Connector that uses the same concept as [sqoop](https://sqoop.apache.org/), to create complex queries and map attributes to index based on the result.

### Installation

Go to [https://viglet.org/turing/download/](https://viglet.org/turing/download/) and click on "Integration > Database Connector" link to download the `turing-jdbc.jar`.

### Usage

```shell
java -jar /appl/viglet/turing/jdbc/turing-jdbc.jar <PARAMETERS>
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| `--connect` | JDBC connection string |
| `--driver` | JDBC driver class name |
| `--query` | SQL query to execute |
| `--site` | Semantic Navigation Site name |
| `--locale` | Locale for indexing |
| `--chunk` | Number of rows per chunk |
| `--server` | Turing ES server URL |
| `--api-key` | API Key for authentication |
| `--file-path-field` | Field containing file paths |
| `--file-content-field` | Field for file content |
| `--file-extension-field` | Field containing file extensions |
| `--file-size-field` | Field containing file sizes |
| `--multi-valued-separator` | Separator for multi-valued fields |
| `--remove-html-tags-field` | Fields from which to remove HTML tags |

### Example

```shell
java -jar /appl/viglet/turing/jdbc/turing-jdbc.jar \
  --connect "jdbc:mysql://localhost:3306/mydb" \
  --driver "org.mariadb.jdbc.Driver" \
  --query "SELECT id, title, content, url FROM articles" \
  --site "Sample" \
  --locale "en_US" \
  --chunk 100 \
  --server "http://localhost:2700" \
  --api-key "your-api-key"
```

## File System

FileSystem connector for indexing files with text extraction from Word, Excel, PDF and OCR for images.

### Installation

Go to [https://viglet.org/turing/download/](https://viglet.org/turing/download/) and click on "Integration > FileSystem Connector" link to download the `turing-filesystem.jar`.

### Usage

```shell
java -jar /appl/viglet/turing/fs/turing-filesystem.jar <PARAMETERS>
```

### Example

```shell
java -jar /appl/viglet/turing/fs/turing-filesystem.jar \
  --server http://localhost:2700 \
  --nlp <NLP_UUID> \
  --source-dir /path/to/files \
  --output-dir /path/to/output
```

## Wordpress

Wordpress plugin that allows you to index posts.

### Installation

1. Upload the plugin folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Configure the hostname, port and URI of Turing ES.
4. Click the settings button to load posts.

## OpenText WEM Listener

OpenText WEM Listener to publish content to Viglet Turing.

### Installation

Go to [https://viglet.com/turing/download/](https://viglet.com/turing/download/) and click on "Integration > WEM Listener" link to download it.

```shell
mkdir -p /appl/viglet/turing/wem
unzip turing-wem.zip -d /appl/viglet/turing/wem
```
