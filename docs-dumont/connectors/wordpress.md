---
sidebar_position: 6
title: WordPress Connector
description: Index WordPress posts, pages, and custom content types into Turing ES.
---

# WordPress Connector

The WordPress Connector indexes posts, pages, and custom content types from WordPress installations into Turing ES. It reads content through the WordPress REST API and delivers it through the Dumont DEP pipeline.

---

## How It Works

1. Connect to the WordPress site via its REST API
2. Fetch posts, pages, and configured custom post types
3. Extract title, content, excerpt, author, categories, tags, and publication date
4. Map each item to a Job Item with the appropriate fields
5. Deliver through the pipeline to the configured search engine

---

## Configuration

| Field | Description |
|---|---|
| **Endpoint** | WordPress site URL (e.g., `https://blog.example.com`) |
| **Target SN Site** | Semantic Navigation Site in Turing ES |
| **Locale** | Default locale for the content |
| **Content Types** | Which WordPress content types to index (posts, pages, custom) |

---

## Extracted Fields

| Field | Source |
|---|---|
| **title** | Post/page title |
| **text** | Full post content (HTML stripped to plain text) |
| **url** | Permalink URL |
| **date** | Publication date |
| **author** | Author display name |
| **categories** | Category names (multi-valued) |
| **tags** | Tag names (multi-valued) |
| **type** | Content type (post, page, custom) |

---

## Installation

1. Install the Viglet Dumont WordPress Plugin on your WordPress site
2. Configure the plugin with the Dumont DEP endpoint URL
3. Set up the SN Site target and field mappings
4. Trigger indexing from the Dumont DEP admin interface or REST API

---

*Previous: [AEM Connector](./aem.md) | Next: [Indexing Plugins](../indexing-plugins.md)*
