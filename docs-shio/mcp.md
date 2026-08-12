---
title: MCP Server
sidebar_label: MCP Server
description: "Drive Viglet Shio from Claude Code, Cursor or any MCP client: POST /mcp, twelve tools, six resources, four prompts, and the Claude Code plugin."
---

# MCP Server

Shio speaks the **Model Context Protocol**. One endpoint:

```http
POST /mcp
```

JSON-RPC 2.0 over streamable HTTP. It answers `initialize`, `tools/list`, `tools/call`,
`resources/list`, `resources/read`, `prompts/list` and `prompts/get`. Two headers matter:
`Mcp-Session-Id` (returned by `initialize`, sent back on every later call) and
`MCP-Protocol-Version`.

This is the surface the product is designed around: the agent that builds your site
talks to Shio here. It is a **shape over the same capabilities** as
[the REST agent surface](./agent-surface.md), not a separate contract: a tool call ends
up in the same service the REST endpoint calls, under the same guards.

:::warning A bare instance has no MCP server registered for your client
Starting Shio does not make it appear in Claude Code. Until you register it, `POST /mcp`
is just an HTTP endpoint. Two ways to close that gap, both below: **install the plugin**,
or point your client at the CLI's stdio bridge with
`claude mcp add shio -- shio mcp`. Skipping this is worth an afternoon of confusion.
:::

---

## Connecting

### With the Claude Code plugin (recommended)

```bash
claude plugin marketplace add openviglet/shio
claude plugin install shio
```

The plugin registers the MCP server for you and adds the workflows around it, so there
is nothing else to install. What it brings:

| Kind | Contents |
|---|---|
| **MCP server** | `shio`, wired to your instance |
| **Commands** | `/shio-start` (bring up an instance and connect), `/shio-check` (verify what is there), `/shio-blueprint` (apply a starting point) |
| **Skills** | `shio-site` (build and change a site), `shio-content-model` (post types), `shio-verify` (close the loop on a change) |

### With the CLI bridge

If you already have the `shio` CLI on your `PATH`:

```bash
claude mcp add shio -- shio mcp
```

`shio mcp` is deliberately dumb: it frames stdio JSON-RPC into HTTP `POST`s against
`/mcp`. Nothing about the protocol lives in the CLI, so a client that speaks stdio and
one that speaks HTTP reach exactly the same server. It reads `SHIO_URL`, `SHIO_USER` and
`SHIO_PASSWORD` from the environment.

### Directly over HTTP

```bash
curl -s http://localhost:2710/mcp \
  -H 'Content-Type: application/json' \
  -H 'Key: 7f3c9a12b4e05d68af1c2903b' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

A tool call runs under the credential on the request, normally an **API key of `AGENT`
scope**. That scope may write here and on `/api/v2/agent/**` and nowhere else, it reads
drafts by definition, and publishing needs `mayPublish` on the token. See
[the agent surface](./agent-surface.md#authenticating).

---

## The tools

Twelve, and the number is the point: **the tool list is a measured budget, not an open
catalogue.** `tools/list` is paid for on every turn of every conversation, so its total
estimated token size is asserted in CI against a declared ceiling, and the count itself is
capped by a test. Adding a thirteenth tool means either fitting the budget or raising it
deliberately and saying why. That is
also why some capabilities are a *parameter* on an existing tool rather than a tool of
their own.

| Tool | What it does |
|---|---|
| `shio_context` | The one call that replaces a session: content model, sitemap by path, conventions |
| `shio_find` | Find posts by site / type / folder / text, addresses and titles, never bodies |
| `shio_read` | Read posts by address, optionally projected to named fields |
| `shio_write` | A batch of addressed ops, applied atomically; `dryRun` reports without writing |
| `shio_apply` | Make a desired-state document true |
| `shio_publish` | Publish or unpublish, or schedule it |
| `shio_verify` | Lint content and routes; a fix per finding |
| `shio_digest` | A page's structural digest: the cheap proof a render still looks right |
| `shio_changes` | What changed since a cursor: what the human did while you were away |
| `shio_remember` | Write the conventions the next session should inherit — and drop one, with `forget` |
| `shio_assets` | The files a site holds |
| `shio_marketplace` | The packages this instance could install. Lists and describes; it does not install — see [Blueprints § Who may install](./blueprints.md#who-may-install) |

Two capabilities you might expect as tools are **parameters** instead, and that is the
budget above being spent deliberately rather than an omission. Applying a starting point
is `shio_apply`'s `blueprint` parameter, not a `shio_blueprint` tool; forgetting a
convention is `shio_remember`'s `forget`, not a tool of its own. Both are rare operations
whose schema would otherwise be paid for on every turn of every session.

### A call, and what comes back

```json
{
  "jsonrpc": "2.0", "id": 7,
  "method": "tools/call",
  "params": {
    "name": "shio_write",
    "arguments": {
      "dryRun": true,
      "ops": [
        { "op": "post.upsert", "address": "post:mysite/blog/hello-world",
          "type": "Article", "folder": "folder:mysite/blog",
          "data": { "TITLE": "Hello world" } }
      ]
    }
  }
}
```

`ops` is the only required argument. `op` and `address` are required on each row; `type`
and `folder` only when the op creates a post. `dryRun: true` reports what would change
and writes nothing, and is how you obtain the `confirm` token a delete needs.

### When the arguments are wrong

An error is not a refusal, it is instructions. The same problem document the REST surface
returns comes back as the tool result, carrying `fix`, `allowed`, `didYouMean` and
`example`:

```json
{
  "title": "Field 'HEADLINE' is not declared by post-type 'Article'",
  "fix": "Use one of the declared fields, or add HEADLINE to the post-type first.",
  "allowed": ["TITLE", "TEXT", "ABSTRACT", "HERO"],
  "didYouMean": "TITLE",
  "example": { "op": "post.upsert", "address": "post:mysite/blog/hello-world",
               "data": { "TITLE": "…" } }
}
```

That is the difference between an agent that recovers on its next call and one that asks
you what the API wanted.

### Argument names that differ between surfaces

The same concept is spelled differently by `shio_write`, `shio_apply` and the REST
endpoints, because each inherits the shape of what it wraps. This table is the one worth
keeping open:

| Concept | `shio_write` op | `shio_apply` document | REST elsewhere |
|---|---|---|---|
| Post type | `type` | `type` | `postType` on `/api/v2/post-unified` |
| Subject | `address` (a full `post:` address) | `url` (bare, no prefix) | an id |
| Folder | `folder:<site>/<chain>` | `/chain` (bare path) | a folder id |
| Several subjects | `address` , singular name, array value | , |, |
| Memory scope | `site` on `shio_remember` |, | `scope` on `PUT /agent/memory`, `--site` in the CLI |

---

## Resources

Six read-only resources, for a client that prefers attaching context to calling a tool:

| URI | Contents |
|---|---|
| `shio://manifest` | What this instance can do |
| `shio://context` | The context pack |
| `shio://ops` | The op vocabulary, with each op's required arguments |
| `shio://schema/{postType}` | One post type's fields |
| `shio://blueprints` | The blueprint catalogue |
| `shio://blueprint/{name}` | One blueprint's full schema |

---

## Prompts

Four, each a workflow rather than a sentence: they expand into the ordered tool calls
that get the job done, with the safety defaults already in place (everything is left in
`DRAFT` for a human to publish):

| Prompt | Arguments | Does |
|---|---|---|
| `new-site` | `site`, `brief` | Build a site from nothing: provision the render model, create the folders and pages, verify |
| `add-section` | `site`, `path`, `brief` | Add a section to a site that exists, matching what is already there |
| `translate-site` | `site`, `locale` | Produce the sibling pages for another language |
| `audit-content` | `site` | Run the checks and report what a curator should look at |

---

## Related Pages

| Page | Description |
|---|---|
| [The Agent Surface](./agent-surface.md) | The REST half: every endpoint, the address grammar, the op vocabulary |
| [Pages, Layouts & Regions](./website-development.md) | What `render.provision` creates and how a page is composed |
| [Content Modeling](./content-modeling.md) | The post types `shio_write` is checked against |
