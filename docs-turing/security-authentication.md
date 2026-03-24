---
sidebar_position: 3
title: Authentication
description: Native authentication for Turing ES — session-based admin console login and API Key authentication for the REST API.
---

# Authentication

Turing ES supports two authentication modes. **Native authentication** is the default and requires no external dependencies. **Keycloak OAuth2 / OpenID Connect** is the recommended mode for production SSO environments.

This page covers **native authentication** — the session-based admin console login and the API Key mechanism for REST API access. For the full Keycloak production setup, see [Security & Keycloak](./security-keycloak.md).

---

## Native Authentication (default)

When Keycloak is not enabled, Turing ES uses its own user store:

### Admin Console

Users log in via a form at `http://localhost:2700/login` and receive a **Java HTTP session**. Sessions are maintained server-side and expire after inactivity. No special configuration is required — this mode works out of the box.

Users, groups, and roles are managed in **Administration → Users**, **Groups**, and **Roles**.

### REST API — API Key

All REST API requests authenticate via an **API Key** passed in the `Key` request header. API Tokens are not tied to user sessions — they are created in **Administration → API Tokens** and remain valid until explicitly deleted.

**Creating an API Token:**

1. Sign in to the Administration Console.
2. Navigate to **Administration → API Tokens**.
3. Click **New**, fill in a name and description.
4. Copy the generated token immediately — it will not be shown again.

For the full endpoint reference, authentication examples, and the list of public endpoints that require no authentication, see [REST API Reference → Authentication](./rest-api.md#authentication).

:::tip Tokens are encrypted at rest
API Token values are encrypted at rest in the database. The encryption key is set via `turing.ai.crypto.key` in `application.yaml`. Change this key in production — see [Configuration Reference](./configuration-reference.md).
:::

---

## Switching to Keycloak SSO

For production environments with SSO requirements, Turing ES can delegate authentication to Keycloak via OAuth2 / OpenID Connect. Enable it with:

```bash
-Dturing.keycloak=true
```

See [Security & Keycloak](./security-keycloak.md) for the full 6-step production setup — database, Keycloak installation, realm configuration, SSL certificates, JVM properties, and Apache reverse proxy.

---

## Related Pages

| Page | Description |
|---|---|
| [Security & Keycloak](./security-keycloak.md) | Full production setup with Keycloak OAuth2/OIDC |
| [Administration Guide](./administration-guide.md) | Managing users, groups, roles, and API tokens |
| [REST API](./rest-api.md) | Full REST API reference including authentication examples |
| [Configuration Reference](./configuration-reference.md) | `turing.ai.crypto.key` and other security-related settings |

---

