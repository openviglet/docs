---
sidebar_position: 7
title: Content Delivery API (CDA)
description: The read-only, headless Content Delivery API for serving published Shio content to any JavaScript front-end.
---

# Content Delivery API (CDA)

Shio CMS is **headless-first**: your content engine runs on Java/Spring Boot, but
the sites and apps that consume it are pure **JavaScript/TypeScript**. The
**Content Delivery API (CDA)** is the stable, read-only contract that JS clients
depend on.

```
Shio (Java/Spring)  ──/api/v2/cda/**──▶  @viglet/shio-client  ──▶  Next.js / React / Vue / Astro / Node
```

:::tip JS dev, zero Java
A front-end developer builds an entire site against the CDA without ever touching
the Java backend. Use the typed [`@viglet/shio-client`](./javascript-client.md),
the [React SDK](./react-sdk.md), or scaffold a ready-made Next.js app with
[`create-shio-app`](./nextjs-starter.md).
:::

---

## What makes the CDA different from the console REST API

| | Console API (`/api/v2/...`) | Content Delivery API (`/api/v2/cda/**`) |
|---|---|---|
| Purpose | Authoring (admin console) | Public delivery to sites/apps |
| Methods | Read **and** write | **Read-only** (GET) |
| Content | Drafts + published | **Published only** |
| Response | Rich internal models | Frozen, minimal DTOs |
| Auth | Session + CSRF | API **token** (`Key` header) |

The CDA never exposes drafts or authoring-only fields (`owner`, `publisher`,
`publishStatus`), and its response shape is **frozen** — safe to build a public
site on.

---

## Authentication

The CDA is authenticated with an **API token** sent in the `Key` header. CDA
tokens are **read-only** — any non-GET request is rejected with `403`.

```bash
curl https://cms.example.com/api/v2/cda/site \
  -H "Key: <your-cda-token>"
```

Create and manage tokens in the admin console (API Tokens). A token can sit safely
behind a CDN or in a server-side environment (Next.js server components, Node).

:::note
Keep tokens server-side where possible. The CDA token grants read access to
published content of the instance.
:::

---

## Endpoints

All endpoints are under `/api/v2/cda`, return `application/json`, and are `GET` only.

| Method | Path | Purpose |
|---|---|---|
| GET | `/cda/site` | List published sites |
| GET | `/cda/site/{siteId}` | One site (with root folder id) |
| GET | `/cda/object/{folderId}/list?page&size` | A folder's children (subfolders + posts) |
| GET | `/cda/object/{id}/path` | Breadcrumb path for a folder or post |
| GET | `/cda/post/{id}` | One published post (attributes expanded) |
| GET | `/cda/post/by-url?siteId&url` | Resolve a published post by friendly URL |
| GET | `/cda/query?siteId&folderId&postType&page&size` | Query published posts |

Unknown ids, unpublished content, or an unresolvable URL return **`404`**. A draft
is never returned.

### Resolve a page by URL

The `by-url` endpoint powers catch-all routing (e.g. Next.js `[...slug]`):

```bash
curl "https://cms.example.com/api/v2/cda/post/by-url?siteId=SITE_ID&url=/blog/hello-world" \
  -H "Key: <your-cda-token>"
```

---

## Response shapes

### Site

```json
{
  "id": "string",
  "name": "string",
  "description": "string | null",
  "url": "string | null",
  "rootFolderId": "string | null"
}
```

### Post

```json
{
  "id": "string",
  "title": "string | null",
  "summary": "string | null",
  "furl": "string | null",
  "postType": "string | null",
  "siteId": "string | null",
  "folderId": "string | null",
  "published": true,
  "date": "ISO-8601 | null",
  "modifiedDate": "ISO-8601 | null",
  "publicationDate": "ISO-8601 | null",
  "attrs": { "title": "Hello", "content": "<p>...</p>" }
}
```

`attrs` is the post's field map, keyed by your post-type attribute names. A
malformed payload yields `{}` rather than an error.

### Listing

```json
{
  "folderId": "string | null",
  "folders": [{ "id": "string", "name": "string", "root": false }],
  "posts": [
    {
      "id": "string",
      "title": "string | null",
      "summary": "string | null",
      "furl": "string | null",
      "postType": "string | null",
      "date": "ISO-8601 | null",
      "modifiedDate": "ISO-8601 | null"
    }
  ],
  "page": 0,
  "size": 50,
  "totalPosts": 0
}
```

### Path (breadcrumb)

```json
{
  "site": { "...": "ShioSite" },
  "breadcrumb": [{ "id": "string", "name": "string", "root": true }],
  "currentFolder": { "id": "string", "name": "string", "root": false }
}
```

The `breadcrumb` array is ordered **root → … → current**.

---

## Next steps

- [JavaScript Client](./javascript-client.md) — the framework-agnostic `@viglet/shio-client`.
- [React SDK](./react-sdk.md) — hooks and render components.
- [Next.js Starter](./nextjs-starter.md) — `npx create-shio-app`.
