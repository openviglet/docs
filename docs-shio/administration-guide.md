---
sidebar_position: 1
title: Administration
description: "The operator's half of the Viglet Shio console: the dashboard, users, groups, roles, permissions, API tokens, tenants, providers, email, webhooks, activity and the agent review queue."
---

# Administration

Everything an operator configures lives in the Shio console under **Administration**.
This page walks the screens in the order the console's own sidebar lists them.

The curator's half — the content browser, the post form, copy and move, the trash — is on
[The content console](./content-console.md).

---

## Finding your way around

The console sidebar has three groups:

| Group | Screens |
|---|---|
| *(top)* | **Dashboard** |
| **Content** | Sites · Search · Post Types · Media Library · Trash · Universal Editor |
| **Administration** | Administration (users, groups, roles) · API Tokens · Tenants · Authentication Providers · Exchange Providers · Email · Webhooks · Activity · Agent Review · GraphQL |

## The dashboard

The console's landing screen. It shows how many sites and post types this instance has,
a list of recent content changes, and shortcuts to the things you do most: create a site,
browse content, search, model a post type, manage webhooks, open the activity log.

Every number on it is a link into the screen it counts.

---

## Users

Create, modify and delete users under **Administration → Administration**. A user can
sign in to the console, be the subject of a permission grant, and own content.

### Default user

On first startup Shio creates a default administrator account:

| Field | Value |
|---|---|
| **Username** | `admin` |
| **Password** | `admin` |

:::warning
Change the default password immediately after first login.
:::

### User properties

- Username and password
- Email address
- First and last name
- Group memberships

---

## Groups and roles

**Groups** collect users. **Roles** name a capability. Both exist so a permission grant
can be written once against many people rather than once per person, and both are
managed on the same Administration screen.

A permission grant accepts a **user**, a **group** or a **role** as its subject, so which
of the three you use is a question of how you want to maintain it, not of what it can
express.

---

## Permissions

Shio has two independent permission layers. They answer different questions and are
configured in different places.

### Console access

Whether somebody can sign in to the console at all, and what they may do once inside, is
decided by their user, groups and roles. This is the layer that keeps the Administration
screens away from a content editor.

### Content permissions (the ACL)

Any **folder** or **post** can carry its own grants. Open the item's **Permissions**
action in the content browser.

- A grant is a **subject** (user, group or role) plus a **permission**: **Read** or
  **Write**.
- Grants are **inherited** down the tree: a grant on a folder covers what is inside it.
- An item with **no grants is open** — anyone signed in can reach it. The console says
  so on the panel: *"No restrictions — anyone signed in can access this. Add a grant to
  restrict it."* Adding the first grant is what starts restricting it.

The same ACL is enforced on every surface. An agent's token reaches exactly what a
curator's session reaches, and no more — a copy needs read on its sources, a move needs
write on both ends. See [Letting an agent in](./agent-safety.md).

---

## API tokens

**Administration → API Tokens** mints the keys an external front end or an agent uses.
A token carries a **scope**, and the scope is the whole of what it may do:

| Scope | What it may do |
|---|---|
| **Read** | Read published content only. |
| **Preview** | Read published content *and* unpublished drafts. |
| **Write** | Read, plus write content back through the Content Delivery API. |
| **Agent** | Write through the agent surface (`/api/v2/agent`, `/mcp`) and read drafts. It is **not** a CDA write key: it cannot patch published content directly. |

An Agent token also has a **May publish** switch, **off by default**. An agent token
without it writes drafts that a human then approves in Agent Review.

A token is additionally tagged as a **Production** or **Preview** environment key —
production reads published content, preview reads draft-preferred — so the same front end
can be pointed at either by swapping only the token.

By default a token reaches every site. Turn **All sites** off to restrict it to the sites
you pick. A token can also be **disabled**, which revokes it without deleting it.

The token value is shown once, when it is created. Send it in the `Key` header:

```bash
curl -H 'Key: YOUR_TOKEN' http://localhost:2710/api/v2/site
```

See [Content Delivery API](./headless/content-delivery-api.md) for what the token then
reaches.

---

## Tenants

**Administration → Tenants** lists the isolated workspaces on this instance. Each tenant
has its own content, and the reserved `shio` tenant is the single-tenant default — it
cannot be renamed, disabled or deleted.

A tenant name is lowercase, has no spaces, and is **immutable once created** because it is
carried on every row of the tenant's content. A new tenant can be **provisioned** with a
copy of the default tenant's post-type model; provisioning is idempotent, so running it
again is safe. A tenant can be **suspended** and later reactivated.

Full detail, including how a request is resolved to a tenant, is on
[Multi-tenancy](./multi-tenancy.md).

---

## Authentication providers

**Administration → Authentication Providers** configures where console users are
authenticated. Shio ships one provider: **Shio Native**, the built-in username and
password store described above. The screen exists so an external identity source can be
added as a second provider instance.

For the authentication and authorization mechanics — sessions, CSRF, CORS, token auth —
see [Security](./security.md).

---

## Exchange providers

**Administration → Exchange Providers** configures the sources content can be imported
from and exported to. Shio ships one: **Shio Package**, the local exchange archive that
site import and download use.

See [Import & Export](./import-export.md) for the package format and the import flow.

---

## Email

**Administration → Email** configures the outgoing SMTP server Shio sends mail through:
host, port, credentials and whether the connection is secured. The same settings can be
supplied as properties at startup — see the
[Configuration Reference](./configuration-reference.md).

---

## Webhooks

**Administration → Webhooks** manages the outbound notifications Shio fires when content
is **published**, **unpublished** or **deleted**. A subscription belongs to a site, so a
static-site rebuild can be triggered by the one site that changed rather than by all of
them.

The subscription form, the payload each event carries, how to verify its signature and
what delivery does and does not guarantee are on [Webhooks](./webhooks.md).

---

## Activity

**Administration → Activity** is the audit trail of content changes: who created, edited,
published, unpublished, deleted or restored what, and when. Every write through any
surface — console, CLI, CDA, agent — is recorded here under the name of whoever made it.

---

## Agent review

**Administration → Agent Review** groups an agent's writes into **runs** and shows what
each one changed. **Approve** publishes the drafts that run wrote; **revert** puts things
back. The sidebar carries a badge when runs are waiting, and the badge is absent — not
zero — when there is nothing to decide.

This is the moderation step for content that arrives from anywhere you did not type it
yourself, including visitor form submissions, which land as drafts of a post type you
already modelled. See [Letting an agent in](./agent-safety.md).

---

## Sites

Sites are managed from **Content → Sites**.

### Creating a site

1. Open **Content → Sites**.
2. Click **New Site**.
3. Give it a name, a description and the URL its front end is served from.

### Importing a site

1. Open **Content → Sites**.
2. Click **Import Site**.
3. Upload the site package.

### Downloading a site

Use the **Download** action on a site row. The package carries the site's content,
folders and configuration, and is what **Import Site** reads back.

### Site properties

| Property | Description |
|---|---|
| **Name** | The site's display name, and the name it is addressed by (`site:<name>`). |
| **Description** | Free text. |
| **URL** | The base URL of the site's front end. The Universal Editor frames this, and "View Site" opens it. |

---

## Search

Search is configured with properties rather than on a console screen. Site search is
served by Shio itself; connecting an external index is an operator setting. See
[Search & Caching](./search-caching.md).

---

## Related pages

| Page | Description |
|---|---|
| [The content console](./content-console.md) | The browser, the post form, copy and move, the trash |
| [Letting an agent in](./agent-safety.md) | Drafts, publishing, the review queue, the trash |
| [Security](./security.md) | Authentication and authorization mechanics |
| [Multi-tenancy](./multi-tenancy.md) | How tenants isolate content |
| [Configuration Reference](./configuration-reference.md) | Every `application.properties` setting |
| [Import & Export](./import-export.md) | Packages and content migration |
| [Installation Guide](./installation-guide.md) | Setup and first-time configuration |

---
