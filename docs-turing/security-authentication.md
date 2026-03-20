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

All REST API requests authenticate via an **API Key** passed in the `Key` request header:

```
Key: <YOUR_API_TOKEN>
```

API Tokens are not tied to user sessions. They are created and managed in **Administration → API Tokens** and remain valid until explicitly deleted.

**Creating an API Token:**

1. Sign in to the Administration Console.
2. Navigate to **Administration → API Tokens**.
3. Click **New**, fill in a name and description.
4. Copy the generated token immediately — it will not be shown again.

**Example — authenticated API call:**

```bash
curl "http://localhost:2700/api/sn/Sample/search?q=cloud&_setlocale=en_US" \
  -H "Key: <YOUR_API_TOKEN>" \
  -H "Accept: application/json"
```

:::tip Tokens are encrypted at rest
API Token values are encrypted in the database using `TurSecretCryptoService`. The encryption key is set via `turing.ai.crypto.key` in `application.yaml`. Change this key in production — see [Configuration Reference](./configuration-reference.md).
:::

---

## Public Endpoints (no authentication required)

Certain endpoints are always publicly accessible regardless of authentication mode, allowing client applications to perform searches and chat interactions without managing sessions:

| Endpoint | Purpose |
|---|---|
| `GET /api/sn/*/search` | Semantic Navigation search |
| `GET /api/sn/*/chat` | GenAI chat on an SN Site |
| `GET /api/sn/*/ac` | Autocomplete |
| `POST /api/genai/chat` | Direct GenAI chat |
| `POST /api/ocr/**` | OCR text extraction |
| `POST /api/v2/integration/**` | External integration endpoints |
| `GET /api/v2/guest/**` | Guest access endpoints |
| `POST /graphql` | GraphQL queries |
| `GET /api/login` | Login endpoint |

All other endpoints require authentication. This includes the full administration API, user management, site configuration, and AI Agent management.

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

*Previous: [Architecture Overview](./architecture-overview.md) | Next: [Security & Keycloak](./security-keycloak.md)*
