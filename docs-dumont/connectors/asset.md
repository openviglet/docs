---
sidebar_position: 3
title: Asset
description: Asset Connector
---

# Asset

Asset connector for indexing files with text extraction from Word, Excel, PDF and OCR for images.

## Installation

Go to [https://viglet.org/dumont/download/](https://viglet.org/dumont/download/) and click on "Integration > FileSystem Connector" link to download the `dumont-filesystem.jar`.

## Usage

```shell
java -jar /appl/viglet/dumont/fs/dumont-filesystem.jar <PARAMETERS>
```

## Example

```shell
java -jar /appl/viglet/dumont/fs/dumont-filesystem.jar \
  --server http://localhost:2700 \
  --nlp <NLP_UUID> \
  --source-dir /path/to/files \
  --output-dir /path/to/output
```

