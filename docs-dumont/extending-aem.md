---
sidebar_position: 8
title: Extending the AEM Connector
description: Create custom AEM extensions — attribute extractors, content processors, delta date logic, and the configuration JSON reference.
---

# Extending the AEM Connector

The AEM connector provides a powerful extension system that lets you customize how content is extracted, transformed, and indexed from Adobe Experience Manager. Extensions are Java classes that implement interfaces from the `aem-commons` library — published on Maven Central.

---

## Maven Dependency

To create custom AEM extensions, add `aem-commons` to your project:

```xml
<!-- Source: https://mvnrepository.com/artifact/com.viglet.dumont/aem-commons -->
<dependency>
    <groupId>com.viglet.dumont</groupId>
    <artifactId>aem-commons</artifactId>
    <version>2026.1.19</version>
    <scope>compile</scope>
</dependency>
```

---

## Extension Interfaces

The AEM connector provides four extension interfaces:

| Interface | Purpose | Config field |
|---|---|---|
| `DumAemExtAttributeInterface` | Custom logic for extracting or transforming individual field values | `attributes[].className` or `sourceAttrs[].className` |
| `DumAemExtContentInterface` | Extract additional content from AEM pages (e.g., `.model.json`) | `models[].className` |
| `DumAemExtDeltaDateInterface` | Custom delta date resolution for incremental indexing | `sources[].deltaClass` |
| `DumAemExtUrlAttributeInterface` | Specialized URL handling with ID extraction (extends `DumAemExtAttributeInterface`) | `attributes[].className` |

---

### DumAemExtAttributeInterface

The most commonly used extension. Implement this to transform or extract individual attribute values with custom logic.

```java
import com.viglet.dumont.connector.aem.commons.ext.DumAemExtAttributeInterface;
import com.viglet.dumont.connector.aem.commons.DumAemObject;
import com.viglet.dumont.connector.aem.commons.context.DumAemConfiguration;
import com.viglet.dumont.connector.aem.commons.mappers.*;
import com.viglet.turing.client.sn.TurMultiValue;

public class MyCustomAttribute implements DumAemExtAttributeInterface {

    @Override
    public TurMultiValue consume(
            DumAemTargetAttr dumAemTargetAttr,
            DumAemSourceAttr dumAemSourceAttr,
            DumAemObject aemObject,
            DumAemConfiguration dumAemConfiguration
    ) {
        // Example: extract a custom property and transform it
        String rawValue = aemObject.getAttributes()
            .get("myProperty").toString();
        return TurMultiValue.singleItem(rawValue.toUpperCase());
    }
}
```

**Parameters:**

| Parameter | Description |
|---|---|
| `DumAemTargetAttr` | Target search field being populated (name, type) |
| `DumAemSourceAttr` | Source AEM property definition (name, className) |
| `DumAemObject` | AEM content node: `path`, `title`, `template`, `jcrNode`, `jcrContentNode`, `lastModified`, `attributes` |
| `DumAemConfiguration` | Connection config: `url`, `username`, `rootPath`, `authorSNSite`, `publishSNSite`, `providerName` |

**Built-in implementations:**

| Class | What it does |
|---|---|
| `DumAemExtContentId` | Returns the AEM page path as the document ID |
| `DumAemExtContentUrl` | Builds the full URL from the page path and URL prefix config |
| `DumAemExtContentTags` | Fetches tags from the `/jcr:content.tags.json` endpoint |
| `DumAemExtCreationDate` | Returns the `jcr:created` date |
| `DumAemExtModificationDate` | Returns the `cq:lastModified` or `jcr:lastModified` date |
| `DumAemExtPublicationDate` | Returns the last replication date |
| `DumAemExtHtml2Text` | Converts HTML content to plain text |
| `DumAemExtPageComponents` | Extracts text from responsive grid components |
| `DumAemExtTypeName` | Returns the content type name |
| `DumAemExtSourceApps` | Returns the provider name from configuration |
| `DumAemExtSiteName` | Returns the site name |

---

<div className="page-break" />

### DumAemExtContentInterface

Implement this to fetch additional content from AEM — for example, calling the `.model.json` Sling Model exporter to get structured data.

```java
import com.viglet.dumont.connector.aem.commons.ext.DumAemExtContentInterface;
import com.viglet.dumont.connector.aem.commons.bean.DumAemTargetAttrValueMap;

public class MyModelJsonExtractor implements DumAemExtContentInterface {

    @Override
    public DumAemTargetAttrValueMap consume(
            DumAemObject aemObject,
            DumAemConfiguration dumAemConfiguration
    ) {
        DumAemTargetAttrValueMap result = new DumAemTargetAttrValueMap();

        // Fetch the .model.json endpoint
        String url = dumAemConfiguration.getUrl()
            + aemObject.getPath() + ".model.json";
        // ... HTTP call to get JSON ...

        result.addWithSingleValue("fragmentPath",
            "/content/dam/fragment", false);
        return result;
    }
}
```

Referenced in the `models[].className` field of the configuration JSON.

---

### DumAemExtDeltaDateInterface

Customize how the connector determines the "last modified" date for incremental indexing.

```java
import com.viglet.dumont.connector.aem.commons.ext.DumAemExtDeltaDateInterface;

public class MyDeltaDate implements DumAemExtDeltaDateInterface {

    @Override
    public Date consume(
            DumAemObject aemObject,
            DumAemConfiguration dumAemConfiguration
    ) {
        return Optional.ofNullable(aemObject.getLastModified())
                .map(Calendar::getTime)
                .orElse(null);
    }
}
```

Referenced in the `sources[].deltaClass` field of the configuration JSON.

---

<div className="page-break" />

## AEM Configuration JSON

The AEM connector is configured via a JSON file that defines sources, attributes, locale mappings, and content models. This file is placed in an `export/` directory and imported at startup.

### Full Example (WKND Site)

```json
{
  "sources": [
    {
      "name": "WKND",
      "defaultLocale": "en_US",
      "localeClass": "com.viglet.dumont.connector.aem.commons.ext.DumAemExtLocale",
      "deltaClass": "com.example.MyDeltaDate",
      "endpoint": "http://localhost:4502",
      "username": "admin",
      "password": "admin",
      "oncePattern": "^/content/wknd/us/en/faqs",
      "rootPath": "/content/wknd",
      "contentType": "cq:Page",
      "author": true,
      "publish": true,
      "authorSNSite": "wknd-author",
      "publishSNSite": "wknd-publish",
      "authorURLPrefix": "http://localhost:4502",
      "publishURLPrefix": "https://wknd.site",
      "localePaths": [
        { "locale": "en_US", "path": "/content/wknd/us/en" },
        { "locale": "es", "path": "/content/wknd/es/es" }
      ],
      "attributes": [
        {
          "name": "id", "type": "STRING", "mandatory": true,
          "className": "com.viglet.dumont.connector.aem.commons.ext.DumAemExtContentId"
        },
        {
          "name": "title", "type": "TEXT", "mandatory": true,
          "facetName": { "default": "Titles", "pt_BR": "Títulos" }
        },
        {
          "name": "tags", "type": "STRING", "multiValued": true,
          "facet": true, "facetName": { "default": "Tags" },
          "className": "com.viglet.dumont.connector.aem.commons.ext.DumAemExtContentTags"
        },
        {
          "name": "url", "type": "STRING", "mandatory": true,
          "className": "com.viglet.dumont.connector.aem.commons.ext.DumAemExtContentUrl"
        }
      ],
      "models": [
        {
          "type": "cq:Page",
          "className": "com.example.MyModelJsonExtractor",
          "targetAttrs": [
            { "name": "title", "sourceAttrs": [{ "name": "jcr:title" }] },
            { "name": "tags",  "sourceAttrs": [{ "name": "cq:tags" }] },
            {
              "name": "text",
              "sourceAttrs": [{
                "className": "com.viglet.dumont.connector.aem.commons.ext.DumAemExtPageComponents"
              }]
            }
          ]
        }
      ]
    }
  ]
}
```

### Source Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Source identifier (displayed in the admin console) |
| `endpoint` | string | AEM instance URL (e.g., `http://localhost:4502`) |
| `username` / `password` | string | AEM authentication credentials |
| `rootPath` | string | Content tree root to crawl (e.g., `/content/wknd`) |
| `contentType` | string | JCR node type to index (e.g., `cq:Page`) |
| `defaultLocale` | string | Fallback locale code (e.g., `en_US`) |
| `localeClass` | string | Class for locale resolution |
| `deltaClass` | string | Class implementing `DumAemExtDeltaDateInterface` |
| `oncePattern` | string | Regex — matching paths are indexed only once (never re-indexed) |
| `author` / `publish` | boolean | Enable indexing from author/publish environments |
| `authorSNSite` / `publishSNSite` | string | Turing ES SN Site names for each environment |
| `authorURLPrefix` / `publishURLPrefix` | string | Public URL prefixes for documents |

### Locale Paths

```json
"localePaths": [
  { "locale": "en_US", "path": "/content/wknd/us/en" },
  { "locale": "es",    "path": "/content/wknd/es/es" }
]
```

Content found under each path is tagged with the corresponding locale.

### Attribute Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Field name in the search index |
| `type` | string | `STRING`, `TEXT`, or `DATE` |
| `mandatory` | boolean | Whether this field is required |
| `multiValued` | boolean | Whether this field holds multiple values |
| `description` | string | Human-readable description |
| `facet` | boolean | Expose as a facet filter in search results |
| `facetName` | object | Localized labels: `{ "default": "Tags", "pt_BR": "Etiquetas" }` |
| `className` | string | Class implementing `DumAemExtAttributeInterface` — extracts the value instead of reading from JCR |

### Model Fields

| Field | Type | Description |
|---|---|---|
| `type` | string | JCR node type this model applies to |
| `className` | string | Class implementing `DumAemExtContentInterface` |
| `targetAttrs[].name` | string | Target field (must match `attributes[]`) |
| `targetAttrs[].sourceAttrs[].name` | string | JCR property to read (e.g., `jcr:title`) |
| `targetAttrs[].sourceAttrs[].className` | string | Class implementing `DumAemExtAttributeInterface` for custom extraction |

---

<div className="page-break" />

## Creating a Custom AEM Extension

### Step 1 — Create a Maven project

```xml
<project>
    <groupId>com.example</groupId>
    <artifactId>my-aem-extensions</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>com.viglet.dumont</groupId>
            <artifactId>aem-commons</artifactId>
            <version>2026.1.19</version>
        </dependency>
    </dependencies>
</project>
```

### Step 2 — Implement your extension

```java
package com.example.ext;

import com.viglet.dumont.connector.aem.commons.ext.DumAemExtAttributeInterface;
import com.viglet.turing.client.sn.TurMultiValue;

public class MyBreadcrumb implements DumAemExtAttributeInterface {
    @Override
    public TurMultiValue consume(DumAemTargetAttr target,
            DumAemSourceAttr source, DumAemObject aemObject,
            DumAemConfiguration config) {
        String path = aemObject.getPath()
            .replace(config.getRootPath(), "");
        return TurMultiValue.singleItem(
            String.join(" > ", path.split("/")));
    }
}
```

### Step 3 — Build and deploy

```bash
mvn clean package
cp target/my-aem-extensions-1.0.0.jar /appl/viglet/dumont/aem/libs/
```

The `libs/` directory must contain both `aem-plugin.jar` and your extension JAR.

### Step 4 — Reference in the JSON

```json
{
  "name": "breadcrumb",
  "type": "STRING",
  "className": "com.example.ext.MyBreadcrumb"
}
```

### How classes are loaded

Extension classes are loaded via `DumCustomClassCache` using `Class.forName()`. Requirements:
- **Public no-argument constructor**
- **On the classpath** (via `libs/` and `-Dloader.path`)
- **Thread-safe** (one instance is shared across all calls)

---

## Related Pages

| Page | Description |
|---|---|
| [AEM Connector](./connectors/aem.md) | AEM connector features, configuration, and locale mapping |
| [Installation Guide](./installation-guide.md) | How to deploy plugins with `-Dloader.path` |
| [Developer Guide](./developer-guide.md) | Project structure, build, and contribution guide |

---

