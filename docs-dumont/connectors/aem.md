---
sidebar_position: 3
title: AEM
description: AEM (Adobe Experience Manager) Connector
---

# AEM (Adobe Experience Manager)

Connector that indexes content from Adobe Experience Manager (AEM) into Viglet Dumont DEP, with support for custom extensions for content processing and incremental (delta) indexing.

## Prerequisites

- Java 21+
- Maven 3.6+
- Apache Ant
- Adobe Experience Manager 6.5+
- Viglet Dumont server running

## Installation

Go to [https://viglet.org/dumont/download/](https://viglet.org/dumont/download/) and click on "Integration > AEM Connector" link to download the connector.

To create a custom AEM plugin project, use the Maven archetype:

```shell
mvn -B org.apache.maven.plugins:maven-archetype-plugin:3.2.1:generate \
  -D archetypeGroupId=com.adobe.aem \
  -D archetypeArtifactId=aem-project-archetype \
  -D archetypeVersion=44 \
  -D appTitle="Dumont AEM Service" \
  -D appId=aem-dumont-events \
  -D groupId=com.viglet.dumont \
  -D aemVersion=6.5.0
```

## Quick Start

**Automated build:**

```shell
compile-and-run.cmd
```

This will clean, compile, package the plugin, and launch the connector.

**Manual build:**

```shell
./mvnw clean install package
ant wknd
cd dist/wknd
run.cmd
```

## Configuration

Set environment variables for the Dumont server connection (e.g., in `scripts/wknd/env.cmd`):

```shell
TURING_URL=http://localhost:2700
TURING_API_KEY=your_api_key_here
```

The AEM source configuration is defined in a JSON file (e.g., `wknd.json`) with the following settings:

| Setting | Description |
|---------|-------------|
| AEM Endpoint | AEM server URL (e.g., `http://localhost:4502`) |
| Root Path | Content root path (e.g., `/content/wknd`) |
| Content Type | AEM content type (e.g., `cq:Page`) |
| Credentials | AEM author/publish authentication |
| Site Mappings | Author and publish site mappings |
| Locale | Locale settings for indexing |

## Custom Extensions

You can create custom extensions by implementing the following interfaces:

- **`DumAemExtContentInterface`** — Custom content processing logic.
- **`DumAemExtDeltaDateInterface`** — Delta date processing for incremental indexing.

Register your custom classes in the configuration JSON file.

### Sample Extensions

The [AEM Plugin Sample](https://github.com/openviglet/dumont/tree/master/aem/aem-plugin-sample) provides working examples:

- **`DumAemExtSampleDeltaDate`** — Handles delta date processing for incremental indexing.
- **`DumAemExtSampleModelJson`** — Processes AEM content fragments and model JSON data.

## Module Structure

The AEM connector is composed of three modules:

| Module | Description |
|--------|-------------|
| `aem-plugin` | Core AEM plugin with extension interfaces |
| `aem-server` | Server component for running the connector |
| `aem-plugin-sample` | Sample plugin with WKND site integration |
