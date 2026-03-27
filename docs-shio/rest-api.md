---
sidebar_position: 6
title: REST API Reference
description: REST API endpoints for Posts, Folders, Sites, Search, Users, and more in Viglet Shio CMS.
---

# REST API Reference

Shio CMS exposes a comprehensive REST API for content management, search, and administration. All endpoints use **JSON** for request and response bodies.

---

## Authentication

Most API endpoints require authentication. Shio CMS uses **session-based authentication** with CSRF token protection.

### Login

```
POST /api/v2/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

### CSRF Token

For write operations (POST, PUT, DELETE), include the CSRF token in the `X-XSRF-TOKEN` header. The token is returned as a cookie (`XSRF-TOKEN`) after successful authentication.

---

## API Base Path

All endpoints are prefixed with `/api/v2`.

---

## Content Endpoints

### Posts

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/post/{id}` | Get a post by ID |
| `POST` | `/api/v2/post` | Create a new post |
| `PUT` | `/api/v2/post/{id}` | Update a post |
| `DELETE` | `/api/v2/post/{id}` | Delete a post |

#### Get Post

```
GET /api/v2/post/{id}
```

**Response:**

```json
{
  "id": "post-uuid",
  "title": "My Post",
  "summary": "Post summary",
  "postType": "Text",
  "folder": "folder-uuid",
  "attributes": {
    "title": "My Post",
    "description": "Post content..."
  },
  "publishStatus": "PUBLISHED",
  "date": "2026-03-27T10:00:00"
}
```

### Post Types

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/post-type` | List all Post Types |
| `GET` | `/api/v2/post-type/{id}` | Get a Post Type by ID |
| `POST` | `/api/v2/post-type` | Create a new Post Type |
| `PUT` | `/api/v2/post-type/{id}` | Update a Post Type |
| `DELETE` | `/api/v2/post-type/{id}` | Delete a Post Type |

### Post Type Attributes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/post-type/{id}/attr` | List attributes for a Post Type |
| `POST` | `/api/v2/post-type/{id}/attr` | Add an attribute to a Post Type |
| `PUT` | `/api/v2/post-type/{id}/attr/{attrId}` | Update an attribute |
| `DELETE` | `/api/v2/post-type/{id}/attr/{attrId}` | Delete an attribute |

---

## Folder Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/folder/{id}` | Get a folder by ID |
| `POST` | `/api/v2/folder` | Create a new folder |
| `PUT` | `/api/v2/folder/{id}` | Update a folder |
| `DELETE` | `/api/v2/folder/{id}` | Delete a folder |

---

## Site Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/site` | List all sites |
| `GET` | `/api/v2/site/{id}` | Get a site by ID |
| `POST` | `/api/v2/site` | Create a new site |
| `PUT` | `/api/v2/site/{id}` | Update a site |
| `DELETE` | `/api/v2/site/{id}` | Delete a site |

---

## Search Endpoint

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/search` | Full-text search across content |

**Query Parameters:**

| Parameter | Description |
|---|---|
| `q` | Search query string |
| `site` | Site ID to scope the search |

---

## User Management Endpoints

### Users

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/user` | List all users |
| `GET` | `/api/v2/user/{username}` | Get a user |
| `POST` | `/api/v2/user` | Create a new user |
| `PUT` | `/api/v2/user/{username}` | Update a user |
| `DELETE` | `/api/v2/user/{username}` | Delete a user |

### Groups

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/group` | List all groups |
| `GET` | `/api/v2/group/{id}` | Get a group |
| `POST` | `/api/v2/group` | Create a new group |
| `PUT` | `/api/v2/group/{id}` | Update a group |
| `DELETE` | `/api/v2/group/{id}` | Delete a group |

### Roles

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/role` | List all roles |
| `GET` | `/api/v2/role/{id}` | Get a role |
| `POST` | `/api/v2/role` | Create a new role |
| `PUT` | `/api/v2/role/{id}` | Update a role |
| `DELETE` | `/api/v2/role/{id}` | Delete a role |

---

## Widget Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/widget` | List all widgets |
| `GET` | `/api/v2/widget/{id}` | Get a widget |
| `POST` | `/api/v2/widget` | Create a widget |
| `PUT` | `/api/v2/widget/{id}` | Update a widget |
| `DELETE` | `/api/v2/widget/{id}` | Delete a widget |

---

## Workflow Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/workflow` | List workflow tasks |
| `GET` | `/api/v2/workflow/{id}` | Get a workflow task |
| `POST` | `/api/v2/workflow` | Create a workflow task |
| `PUT` | `/api/v2/workflow/{id}` | Update a workflow task |

---

## File Upload Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v2/static-file/{folderId}` | Upload a static file to a folder |

**Request:** `multipart/form-data` with file attachment.

:::note
Maximum file upload size is 1024 MB (configurable via `spring.servlet.multipart.max-file-size`).
:::

---

## History Endpoint

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/history/{objectId}` | Get change history for an object |

---

## Reference Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/reference/{id}` | Get references for an object |

---

## Object Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/object/{id}` | Get any object by ID (folder, post, or file) |

---

## Preview Endpoint

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/preview/{id}` | Preview content rendering |

---

## Import / Export Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v2/import` | Import a site or content package |

---

## Provider Endpoints

### Exchange Providers

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/provider/exchange` | List exchange providers |
| `GET` | `/api/v2/provider/exchange/{id}` | Get an exchange provider |

### Auth Providers

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/provider/auth` | List auth providers |
| `GET` | `/api/v2/provider/auth/{id}` | Get an auth provider |

---

## Stock Photo Endpoint

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/stock-photo` | Search stock photos |

---

## Website Endpoints

These endpoints are publicly accessible (no authentication required):

| Path | Description |
|---|---|
| `/sites/{siteName}/{path}` | Access the published website |
| `/__tur/sn/{siteName}` | Turing ES search proxy |

---

## Related Pages

| Page | Description |
|---|---|
| [GraphQL](./graphql.md) | Query content using GraphQL |
| [Developer Guide](./developer-guide.md) | Dev environment and API usage |
| [Security](./security.md) | Authentication and authorization |

---
