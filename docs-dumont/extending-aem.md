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
    <version>2026.2.3</version>
    <scope>compile</scope>
</dependency>
```

---

## Extension Interfaces

The AEM connector provides these extension interfaces and base classes:

| Class / Interface | Purpose | Config field |
|---|---|---|
| `DumAemExtAttributeInterface` | Custom logic for extracting or transforming individual field values | `attributes[].className` or `sourceAttrs[].className` |
| `DumAemExtContentInterface` | Extract additional content from AEM pages (e.g., `.model.json`) | `models[].className` |
| `DumAemExtModelJsonBase<T>` | Recommended abstract base class for `.model.json` extractors — handles fetch, parse, and error handling automatically. Prefer this over implementing `DumAemExtContentInterface` directly. | `models[].className` |
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

:::tip Prefer the abstract base class
For model.json extractors, use `DumAemExtModelJsonBase` instead of implementing this interface directly. See [Model JSON Base Class](#model-json-base-class--fluent-api) below.
:::

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

---

## Model JSON Base Class & Fluent API

When your extension extracts data from `.model.json`, you can use `DumAemExtModelJsonBase` and the fluent `DumAemComponentMapper` API to eliminate boilerplate and write concise, declarative extractors.

### DumAemExtModelJsonBase

An abstract class that handles the entire fetch → parse → error-handling lifecycle. Subclasses implement only **two methods**:

| Method | Purpose |
|---|---|
| `getModelClass()` | Returns the root bean class for Jackson deserialization |
| `extractAttributes(model, query, aemObject, attrValues)` | Extracts data from the parsed model and populates the attribute map |

**Minimal example:**

```java
import com.viglet.dumont.connector.aem.commons.ext.DumAemExtModelJsonBase;
import com.viglet.dumont.connector.aem.commons.ext.DumAemModelJsonQuery;

public class MyModelJsonExtractor extends DumAemExtModelJsonBase<MyModel> {

    @Override
    protected Class<MyModel> getModelClass() {
        return MyModel.class;
    }

    @Override
    protected void extractAttributes(MyModel model, DumAemModelJsonQuery query,
            DumAemObject aemObject, DumAemTargetAttrValueMap attrValues) {
        attrValues.addWithSingleValue("title", model.getTitle(), true);
        attrValues.addWithSingleValue("description", model.getDescription(), true);
    }
}
```

This replaces all the boilerplate of building the URL, calling `DumAemCommonsUtils.getResponseBody()`, creating the `ObjectMapper`, handling `IOException`, and wrapping results in `Optional`.

### DumAemModelJsonQuery

A utility class that simplifies finding AEM components inside the model.json by their `:type` using JsonPath. It replaces the repetitive pattern of `JsonPath.parse()` + `Filter.filter()` + `MAPPER.convertValue()`.

```java
// Before (repeated for every component type):
DocumentContext jsonContext = JsonPath.parse(json);
Object jsonDetails = jsonContext.read("$..[?]", Filter.filter(
    Criteria.where(":type").eq("my-app/components/news")));
List<MyNews> news = MAPPER.convertValue(jsonDetails, new TypeReference<>() {});
news.stream().filter(Objects::nonNull).findFirst().ifPresent(item -> { ... });

// After (one line):
query.findFirstByComponentType("my-app/components/news", MyNews.class)
    .ifPresent(item -> { ... });
```

**Available methods:**

| Method | Description |
|---|---|
| `findByComponentType(type, class)` | Returns all components matching the `:type` as a typed list |
| `findFirstByComponentType(type, class)` | Returns the first matching component as `Optional<T>` |
| `component(type, class)` | Returns a `DumAemComponentMapper<T>` for fluent attribute mapping |

### DumAemComponentMapper — Fluent API

The most concise way to extract component data. Chain `.attr()` calls to declaratively map fields, use `.also()` for custom logic, and `.via()` to navigate into nested objects.

#### Basic — find first component, map fields

```java
query.component("my-app/components/news", MyNews.class)
    .first()
    .attr("date", MyNews::getDate)
    .attr("author", MyNews::getAuthor)
    .into(attrValues);
```

#### Navigate into nested objects with `.via()`

```java
query.component("my-app/components/teacher", Teacher.class)
    .first()
    .via(Teacher::getProfile)
    .attr("name", Profile::getFullName)
    .attr("bio", Profile::getBiography)
    .into(attrValues);
```

#### Mix declarative and custom logic with `.also()`

Use `.also()` when you need conditional logic, computed values, or fallbacks alongside declarative mappings:

```java
query.component("my-app/components/banner", Banner.class)
    .first()
    .also((banner, attrs) -> {
        // Fallback logic: use background image, or color if not available
        String image = banner.getBackgroundImage() != null
            ? banner.getBackgroundImage()
            : banner.getBackgroundColor();
        attrs.addWithSingleValue("image", image, true);
    })
    .attr("title", Banner::getTitle)
    .attr("richText", Banner::getRichText)
    .into(attrValues);
```

#### Process all components of a type

```java
query.component("my-app/components/carousel", Instructor.class)
    .all()
    .also((instructor, attrs) -> {
        attrs.addWithSingleValue("text", instructor.getName(), false);
        attrs.addWithSingleValue("text", instructor.getBio(), false);
    })
    .into(attrValues);
```

#### Fluent API — complete reference

| Method | Description |
|---|---|
| `.first()` | Only process the first matching component |
| `.all()` | Process all matching components (default) |
| `.attr(name, getter)` | Map a field to a target attribute (override = true) |
| `.attr(name, getter, override)` | Map a field with explicit override flag |
| `.also(biConsumer)` | Execute custom logic for each processed component |
| `.via(navigator)` | Navigate into a nested object, returns a new mapper of the nested type |
| `.into(attrValues)` | Execute all accumulated mappings and actions |
| `.findFirst()` | Returns `Optional<T>` for custom processing outside the chain |
| `.stream()` | Returns a `Stream<T>` for custom processing outside the chain |

### Base Class Helpers

`DumAemExtModelJsonBase` provides utility methods that address common patterns:

#### `lastModifiedDate(aemObject)`

Extracts the last modified date, falling back to the creation date:

```java
attrValues.addWithSingleValue("date", lastModifiedDate(aemObject), false);
```

#### `resolveTemplateName(templateName)` + `templateNameAliases()`

Normalizes AEM template names using a declarative alias map. Override `templateNameAliases()` to define your mappings:

```java
@Override
protected Map<String, String> templateNameAliases() {
    return Map.of(
        "contact-page",      "institutional",
        "sub-home",          "institutional",
        "news-article",      "news",
        "knowledge-article", "news",
        "webinar",           "event"
    );
}
```

Then use `resolveTemplateName()` in your extractor:

```java
attrValues.addWithSingleValue("templateName",
    resolveTemplateName(model.getTemplateName()), true);
// "contact-page" → "institutional", "news-article" → "news", etc.
```

### Complete Example

Here is a complete extractor using all the abstractions:

```java
public class MyPortalModelJson extends DumAemExtModelJsonBase<MyPortalModel> {

    @Override
    protected Class<MyPortalModel> getModelClass() {
        return MyPortalModel.class;
    }

    @Override
    protected Map<String, String> templateNameAliases() {
        return Map.of(
            "contact-page", "institutional",
            "news-article", "news"
        );
    }

    @Override
    protected void extractAttributes(MyPortalModel model, DumAemModelJsonQuery query,
            DumAemObject aemObject, DumAemTargetAttrValueMap attrValues) {
        // Root metadata
        attrValues.addWithSingleValue("date", lastModifiedDate(aemObject), false);
        attrValues.addWithSingleValue("fragmentPath", model.getFragmentPath(), true);
        attrValues.addWithSingleValue("templateName",
            resolveTemplateName(model.getTemplateName()), true);

        // News component
        query.component("my-portal/components/news", MyNews.class)
            .first()
            .attr("date", MyNews::getDate)
            .into(attrValues);

        // Banner with image fallback
        query.component("my-portal/components/banner", MyBanner.class)
            .first()
            .also((banner, attrs) -> {
                String image = banner.getImage() != null
                    ? banner.getImage() : banner.getFallbackImage();
                attrs.addWithSingleValue("image", image, true);
            })
            .attr("richText", MyBanner::getRichText)
            .attr("modificationDate", MyBanner::getAuthorDate)
            .into(attrValues);

        // Event with nested address logic
        query.component("my-portal/components/event", MyEvent.class)
            .first()
            .attr("date", MyEvent::getDate)
            .attr("endDate", MyEvent::getEndDate)
            .also((event, attrs) ->
                attrs.addWithSingleValue("text",
                    "%s %s".formatted(event.getCity(), event.getAddress()), false))
            .into(attrValues);

        // Teacher — navigate into elements
        query.component("my-portal/components/teacher", MyTeacher.class)
            .first()
            .via(MyTeacher::getElements)
            .attr("title", Elements::getName)
            .attr("abstract", Elements::getQualification)
            .attr("image", Elements::getPhoto)
            .into(attrValues);
    }
}
```

### DumAemTargetAttrValueMap — API Reference

`DumAemTargetAttrValueMap` is the core data structure for collecting extracted attributes. It extends `HashMap<String, TurMultiValue>` and provides typed methods for adding values safely (null values are silently ignored).

#### The `override` parameter

Every method accepts a `boolean override` parameter that controls what happens when the attribute already exists in the map:

| `override` | Attribute exists? | Behavior |
|---|---|---|
| `true` | Yes | **Replaces** the existing value |
| `true` | No | Adds the value |
| `false` | Yes | **Appends** to the existing multi-value (merge) |
| `false` | No | Adds the value |

#### Instance Methods — Adding Single Values

Use `addWithSingleValue` to add a single typed value to the map:

```java
// String
attrValues.addWithSingleValue("title", "My Page Title", true);

// Date
attrValues.addWithSingleValue("publishDate", new Date(), true);

// Boolean
attrValues.addWithSingleValue("isPublished", true, false);

// Integer
attrValues.addWithSingleValue("pageViews", 42, false);

// Long
attrValues.addWithSingleValue("fileSize", 1024L, true);

// Double
attrValues.addWithSingleValue("price", 29.99, false);

// Float
attrValues.addWithSingleValue("rating", 4.5f, true);

// TurMultiValue (pre-built multi-value)
attrValues.addWithSingleValue("tags", turMultiValue, false);
```

All overloads share the same signature pattern:

```java
void addWithSingleValue(String attributeName, <Type> value, boolean override)
```

| Type | Description |
|---|---|
| `String` | Text value |
| `Date` | Date/time value |
| `Boolean` | Boolean flag |
| `Integer` | Integer number |
| `Long` | Long number |
| `Double` | Double-precision decimal |
| `Float` | Single-precision decimal |
| `TurMultiValue` | Pre-built multi-value object |

#### Instance Methods — Adding Collections

Use these to add multiple values at once for a single attribute:

```java
// List of strings
attrValues.addWithStringCollectionValue("tags",
    List.of("news", "tech", "java"), true);

// List of dates
attrValues.addWithDateCollectionValue("eventDates",
    List.of(startDate, endDate), false);
```

| Method | Value Type | Description |
|---|---|---|
| `addWithStringCollectionValue(name, list, override)` | `List<String>` | Adds multiple string values |
| `addWithDateCollectionValue(name, list, override)` | `List<Date>` | Adds multiple date values |

#### Instance Methods — Polymorphic Dispatch

`addWithValue` accepts any `Object` and automatically dispatches to the correct typed method based on runtime type. This is used internally by the fluent API and can also be used directly:

```java
// Automatically calls the right addWithSingleValue overload
attrValues.addWithValue("myField", someObject, true);
```

Supports: `String`, `Date`, `Boolean`, `Integer`, `Long`, `Double`, `Float`, and `TurMultiValue`. Any other type is converted to `String` via `toString()`.

#### Instance Methods — Merging Maps

```java
// Merge another map into this one (respects override flags)
attrValues.merge(otherAttrValues);
```

The `merge` method combines two attribute maps. For each key in the source map:
- If `override` is `true` on the source value → replaces the existing value
- If `override` is `false` → appends to the existing multi-value

#### Static Factory Methods

Create a pre-populated map with a single attribute in one call:

```java
// From a typed value
DumAemTargetAttrValueMap map = DumAemTargetAttrValueMap.singleItem("title", "Hello", true);
DumAemTargetAttrValueMap map = DumAemTargetAttrValueMap.singleItem("date", new Date(), true);
DumAemTargetAttrValueMap map = DumAemTargetAttrValueMap.singleItem("active", true, false);
DumAemTargetAttrValueMap map = DumAemTargetAttrValueMap.singleItem("count", 42, false);
DumAemTargetAttrValueMap map = DumAemTargetAttrValueMap.singleItem("price", 19.99, true);

// From a string collection
DumAemTargetAttrValueMap map = DumAemTargetAttrValueMap.singleItem("tags",
    List.of("a", "b"), true);

// From a TurMultiValue
DumAemTargetAttrValueMap map = DumAemTargetAttrValueMap.singleItem("field", turMultiValue);

// From a DumAemTargetAttr (uses the attr's name and textValue)
DumAemTargetAttrValueMap map = DumAemTargetAttrValueMap.singleItem(targetAttr, true);
```

#### Quick Reference Table

| Method | Signature | Use Case |
|---|---|---|
| `addWithSingleValue` | `(String, String/Date/Boolean/Integer/Long/Double/Float/TurMultiValue, boolean)` | Add one typed value |
| `addWithStringCollectionValue` | `(String, List<String>, boolean)` | Add multiple strings |
| `addWithDateCollectionValue` | `(String, List<Date>, boolean)` | Add multiple dates |
| `addWithValue` | `(String, Object, boolean)` | Add any value (auto-dispatches by type) |
| `merge` | `(DumAemTargetAttrValueMap)` | Combine two attribute maps |
| `singleItem` *(static)* | Various overloads | Create a map with one attribute |

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
            <version>2026.2.3</version>
        </dependency>
    </dependencies>
</project>
```

### Step 2 — Implement your extension

**Attribute extension** (for individual fields):

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

**Model JSON extension** (for structured `.model.json` data):

```java
package com.example.ext;

import com.viglet.dumont.connector.aem.commons.ext.DumAemExtModelJsonBase;
import com.viglet.dumont.connector.aem.commons.ext.DumAemModelJsonQuery;

public class MyModelJson extends DumAemExtModelJsonBase<MyModel> {

    @Override
    protected Class<MyModel> getModelClass() {
        return MyModel.class;
    }

    @Override
    protected void extractAttributes(MyModel model, DumAemModelJsonQuery query,
            DumAemObject aemObject, DumAemTargetAttrValueMap attrValues) {
        attrValues.addWithSingleValue("title", model.getTitle(), true);

        query.component("my-app/components/news", MyNews.class)
            .first()
            .attr("date", MyNews::getDate)
            .into(attrValues);
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

