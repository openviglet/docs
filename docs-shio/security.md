---
sidebar_position: 1
title: Security
description: Authentication, authorization, user and group management in Viglet Shio CMS.
---

# Security

Shio CMS provides a comprehensive security model built on **Spring Security**. This guide covers authentication, authorization, CSRF protection, and access control.

---

## Authentication

### Session-Based Authentication

Shio CMS uses **session-based authentication** for the admin console and API. Users log in with username and password, and the server creates a session cookie.

| Aspect | Details |
|---|---|
| **Method** | HTTP Basic Authentication |
| **Session** | Server-side session with cookie |
| **CSRF** | Cookie-based CSRF token (`XSRF-TOKEN`) |
| **Frame Options** | `SAME_ORIGIN` — allows embedding within the same domain |

### Auth Providers

Shio CMS supports multiple authentication providers:

| Provider | Description |
|---|---|
| **Shio Native** | Built-in username/password authentication with BCrypt password encoding |
| **OTDS** | OpenText Directory Service — enterprise directory integration |

Auth providers are configured in **Configuration Console > Auth Providers**.

---

## Authorization

### Protected Paths

| Path Pattern | Access |
|---|---|
| `/api/v2/*` | Requires authentication |
| `/content/*` | Requires authentication (admin console) |
| `/sites/**` | Public access |
| `/welcome/**` | Public access |

### User Roles

Users are assigned to **groups** which determine their permissions. The permission model supports:

- **Console access** — who can log in to the admin console
- **Page-level permissions** — who can view specific pages on the published site

### Protected Pages

Through **Page Permissions**, you can create pages on the published site that require authentication. Only users in the authorized groups can view protected pages.

---

## CSRF Protection

Shio CMS implements **CSRF protection** using a cookie-based token:

1. The server sets an `XSRF-TOKEN` cookie on login
2. Clients must include the token value in the `X-XSRF-TOKEN` header for write operations (POST, PUT, DELETE)

:::tip
When building API clients, read the `XSRF-TOKEN` cookie value and include it as the `X-XSRF-TOKEN` header in all mutating requests.
:::

---

## CORS Configuration

Cross-Origin Resource Sharing is configured via the `shio.allowedOrigins` property:

```properties
shio.allowedOrigins=localhost,yourdomain.com
```

---

## HTTP Firewall

Shio CMS uses a **strict HTTP firewall** configuration that blocks:
- Encoded path separators
- Non-normalized URLs
- Suspicious URL patterns

---

## Password Encoding

User passwords are stored using **BCrypt** encoding. The default admin password (`admin`) should be changed immediately after first login.

---

## Related Pages

| Page | Description |
|---|---|
| [Administration Guide](./administration-guide.md) | User, group, and permission management |
| [REST API Reference](./rest-api.md) | API authentication and endpoints |
| [Configuration Reference](./configuration-reference.md) | Security-related properties |

---
