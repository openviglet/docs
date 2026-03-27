---
sidebar_position: 2
title: Website Development
description: Page Layouts, Regions, JavaScript engine, component API and shObject in Viglet Shio CMS.
---

# Website Development

Shio CMS renders websites using server-side JavaScript. This guide covers how to create Page Layouts and Regions, use the component API, and work with the `shObject` JavaScript API.

---

## Page Layouts

A **Page Layout** is the top-level template for rendering a page. Each page is associated with exactly one Page Layout, which defines:

- **Regions** — sections of the page (header, navigation, content, footer)
- **JavaScript Code** — server-side processing that returns a rendered view
- **HTML Code** — the rendering template used by the JavaScript code
- **JavaScript Libraries** — custom JavaScript files to include

The same Page Layout can be applied to various folders and posts, greatly simplifying development and site management.

### Creating a Page Layout

1. Navigate to the **Themes** area in the admin console
2. Create a new Page Layout post
3. Define the regions, JavaScript code, and HTML template
4. Associate the Page Layout with Post Types in the site properties

### Page Layout / Post Type Association

In the **Site Properties**, you map each Post Type to a Page Layout. This tells Shio CMS which template to use when rendering content of that type.

---

## Regions

A **Region** is a section within a Page Layout. Regions are the building blocks of the page — each region renders a specific area (header, navigation, content, footer).

Each region can call one or more **Component APIs** to fetch and render content from the repository.

```
┌──────────────────────────────────────┐
│           Header Region              │
│        (Navigation Component)        │
├──────────────┬───────────────────────┤
│  Navigation  │   Content Region     │
│   Region     │  (Query Component)   │
│  (Nav Comp)  │                      │
│              │                      │
├──────────────┴───────────────────────┤
│           Footer Region              │
│        (Navigation Component)        │
└──────────────────────────────────────┘
```

### Region Caching

Region output is **cached by Hazelcast** by default. Subsequent requests serve the cached HTML until:
- The cache TTL expires (default: 24 hours)
- Content referenced by the region is modified
- The TTL is set to zero (disabling cache for that region)

---

## Component APIs

**Component APIs** are reusable content sources that regions use to render content. They abstract common retrieval patterns:

### Navigation Component

Renders folder hierarchies as menus. Useful for site navigation, breadcrumbs, and sidebar menus.

### Query Component

Filters and lists posts from a folder. Useful for content listings, blog rolls, and category pages. You can define sorting, filtering, and pagination.

---

## JavaScript Engine

Shio CMS supports two JavaScript engines for server-side rendering:

| Engine | Configuration | Notes |
|---|---|---|
| **Nashorn** | `shio.website.javascript.engine=nashorn` | Default engine, built into the JVM |
| **Node.js** | `shio.website.javascript.engine=nodejs` | External Node.js runtime |

### Nashorn Options

The Nashorn engine can be tuned via the `shio.website.nashorn` property:

```properties
shio.website.nashorn=--persistent-code-cache,--optimistic-types=true,-pcc,--class-cache-size=50000
```

---

## The `shObject` API

The `shObject` API is available in Page Layouts and Regions for accessing content and generating URLs. It provides methods to interact with the Shio CMS repository from server-side JavaScript.

### URL Generation Methods

| Method | Description |
|---|---|
| `shObject.generateFolderLink(id)` | Generates a URL for a Folder |
| `shObject.generatePostLink(id)` | Generates a URL for a Post or File |
| `shObject.generateObjectLink(id)` | Generates a URL for any object (Folder, Post, or File) |

### Usage in JavaScript Code

Page Layout JavaScript code uses `shObject` to access the current content item, query related content, and generate the rendered HTML:

```javascript
// Access current post attributes
var title = shObject.post.title;
var content = shObject.post.summary;

// Generate links
var folderUrl = shObject.generateFolderLink(folderId);
var postUrl = shObject.generatePostLink(postId);

// Return rendered HTML
var html = '<h1>' + title + '</h1>';
html += '<div>' + content + '</div>';
html += '<a href="' + folderUrl + '">Back to folder</a>';
```

:::info
For the complete JavaScript API documentation, see the [JavaScript API reference](https://shiocms.github.io/shio/javascript/).
:::

---

## Development Workflow

### Creating a Site Theme

1. **Create Page Layouts** — define templates for different content types
2. **Create Regions** — define reusable sections (header, footer, navigation, content)
3. **Associate Components** — add Navigation and Query components to regions
4. **Write JavaScript** — implement rendering logic using the `shObject` API
5. **Configure Site** — associate Post Types with Page Layouts in site properties

### Preview

Use the **View Site** button in the admin console to preview the published site. The management view shows all content (including drafts), while the published view shows only published content.

### Folder Views

The admin console supports two folder views:
- **List View** — table layout with columns
- **Thumbnail View** — grid layout with thumbnails (useful for media folders)

---

## Static Files

Shio CMS provides a **Static File API** for uploading and managing static assets (images, CSS, JavaScript files). Files can be uploaded individually or in bulk via the admin console.

Static files are served directly by the embedded web server and can be referenced from Page Layouts and Regions.

---

## Related Pages

| Page | Description |
|---|---|
| [Core Concepts](./getting-started/core-concepts.md) | Sites, Folders, Posts, and Page Layouts overview |
| [Content Modeling](./content-modeling.md) | Post Types, fields, and publishing workflow |
| [Search & Caching](./search-caching.md) | Hazelcast cache configuration and search integration |
| [REST API](./rest-api.md) | API endpoints for content operations |

---
