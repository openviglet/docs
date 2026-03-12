---
sidebar_position: 1
title: Database
description: Database Connector
---

# Database

JDBC Connector that uses the same concept as [sqoop](https://sqoop.apache.org/), to create complex queries and map attributes to index based on the result.

## Installation

Go to [https://viglet.org/dumont/download/](https://viglet.org/dumont/download/) and click on "Integration > Database Connector" link to download the `dumont-jdbc.jar`.

## Usage

```shell
java -jar /appl/viglet/dumont/jdbc/dumont-jdbc.jar <PARAMETERS>
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `--connect` | JDBC connection string |
| `--driver` | JDBC driver class name |
| `--query` | SQL query to execute |
| `--site` | Semantic Navigation Site name |
| `--locale` | Locale for indexing |
| `--chunk` | Number of rows per chunk |
| `--server` | Dumont DEP server URL |
| `--api-key` | API Key for authentication |
| `--file-path-field` | Field containing file paths |
| `--file-content-field` | Field for file content |
| `--file-extension-field` | Field containing file extensions |
| `--file-size-field` | Field containing file sizes |
| `--multi-valued-separator` | Separator for multi-valued fields |
| `--remove-html-tags-field` | Fields from which to remove HTML tags |

## Example

```shell
java -jar /appl/viglet/dumont/jdbc/dumont-jdbc.jar \
  --connect "jdbc:mysql://localhost:3306/mydb" \
  --driver "org.mariadb.jdbc.Driver" \
  --query "SELECT id, title, content, url FROM articles" \
  --site "Sample" \
  --locale "en_US" \
  --chunk 100 \
  --server "http://localhost:2700" \
  --api-key "your-api-key"
```
