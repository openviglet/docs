---
title: The Agent Surface
sidebar_label: The Agent Surface (REST)
description: "/api/v2/agent/**: one call to discover the instance, addressed reads, an atomic op vocabulary, desired-state apply, and a verification loop that needs no human."
---

# The Agent Surface

`/api/v2/agent/**` is Shio's REST surface for a program that builds and maintains a
site. If you are driving Shio from Claude Code or another MCP client, you want the MCP
server instead: it is the same capabilities in a different shape. This page is for
building your own agent, or for understanding what the MCP tools actually call.

It is **a shape over the same content the CDA and the console read**, not a third
contract. Nothing here can do something the console cannot; what it adds is
discoverability, determinism, and a response an agent can act on without a second call.

---

![The agent loop: discover, plan, write, verify, then hand over](/img/diagrams/shio-agent-loop.svg)

## Authenticating

An agent authenticates with an **API key of `AGENT` scope**, in a `Key` header:

```http
GET /api/v2/agent/manifest HTTP/1.1
Key: 7f3c9a12b4e05d68af1c2903b
```

Three things follow from the scope, and they are the reason it exists:

- **An `AGENT` token may only write on `/api/v2/agent/**` and `/mcp`.** On the CDA it
  stays read-only. An agent's credential must not also be a key to the endpoints that
  patch published content outside this surface's guards.
- **It reads drafts by definition.** Every agent read is draft-preferred, because the
  thing an agent most often needs to look at is what it just wrote.
- **Publishing is a separate permission** (`mayPublish` on the token). A token without
  it can write all day and change nothing a visitor sees.

A logged-in console session also reaches this surface, so you can explore it in a
browser, but the surface is designed to be **stateless**: no cookie, no CSRF token, no
login round trip.

---

## Addresses

Content is reached by **path**, not by id. This is the one piece of vocabulary
everything else on the page assumes:

| Form | Names | Example |
|---|---|---|
| `post:<site>/<friendly-url>` | one post | `post:mysite/blog/hello-world` |
| `folder:<site>/<name-chain>` | one folder and, where a verb says so, its descendants | `folder:mysite/blog` |
| `site:<name>` | a site | `site:mysite` |
| `id:<uuid>` | anything, by its raw id | `id:9f8c…` |

Three rules that are not guessable:

1. **Writes take only `post:` and `folder:`** (plus `site:` on the two site ops). An
   `id:` is a read convenience, addressing a write by id would defeat the point, which
   is that no UUID has to survive between two calls.
2. **A site's home page is `post:<site>/`**: the trailing slash with nothing after it.
   It is the one address the grammar does not spell out, and the most common thing to
   get wrong.
3. `GET /api/v2/agent/resolve?address=…` turns an address into the object it names, for
   the older id-keyed endpoints that still need one.

---

## One call instead of a session

### The manifest

```http
GET /api/v2/agent/manifest
```

The instance describing itself: version, capabilities, limits, and the endpoint index.
Read it once at the start of a session and you know what this deployment can do, 
including what it *cannot*, which is the half a caller otherwise discovers by getting a
404.

| Parameter | Effect |
|---|---|
| `include=` | Comma-separated sections, when you only need one (confirming a single boolean should not cost the whole endpoint index) |
| `format=terse` | Plain text, roughly a third to a half fewer tokens |
| `If-None-Match:` | An unchanged manifest answers `304` and costs nothing |

An unknown `format` is a teaching `400`, not a silent fallback.

`startHere` in the manifest does not list everything — it **routes**. Two facts that are
true whatever you came to do, then a line per intent, so you match your own situation
instead of mapping it onto a catalogue:

```
picking up where a previous session left off → GET /api/v2/agent/changes?site=<site>&format=terse
before deriving a convention, check this instance already worked it out → GET /api/v2/agent/context?format=terse
building a section — check something already applies it → GET /api/v2/agent/blueprints?format=terse
creating or changing content without holding a UUID → POST /api/v2/agent/batch with dryRun:true
proving what you just wrote is correct without asking a human → GET /api/v2/agent/verify?site=<site>&format=terse
a call answered 5xx and you need to know what failed → GET /api/v2/agent/diagnostics?format=terse
```

### The context pack

```http
GET /api/v2/agent/context
```

The call that replaces a session of exploration: the content model, the sitemap **by
path**, and the conventions this instance has been told to remember. Every parameter is
optional: the single-site case is a bare `GET`.

| Parameter | Effect |
|---|---|
| `site=` | One site, by id or name; omit for every readable site |
| `depth=` | How deep to walk the folder tree |
| `budget=` | An estimated-token ceiling; `0` is unbounded |
| `include=` | `instance`, `sites`, `model`, `sitemap`, `conventions`, plus `manifest` and `ops`, which must be named explicitly |
| `from=` | Resume cursor: the `budget.truncatedAfter` of a previous call |
| `format=` | `json` (default), `terse`, or **`agents-md`**: the same pack rendered as project agent instructions, for a harness that loads a file instead of making a call |
| `ids=true` | Put the raw UUID back on every row. Off by default: rows are addressable without one, and an id is the most expensive field a row can carry |

A narrowed pack tells you what it left out. `include=instance` returns four scalars and
an `omitted` list naming the sections it dropped — because narrowing a *discovery*
response is done by a caller who does not yet know what is there, and a silent `200` is
worse than an error they would have read. It is separate from `budget.truncated`: one is
your own doing and the remedy is to ask for the section, the other is the instance
hitting its ceiling and the remedy is a bigger budget or the `from=` cursor.

Each post in the sitemap carries `published: true` when it is also live. The pack prefers
the draft row, so without it every page of a fully published site read as `DRAFT` — and a
session that opens with the pack would have been misinformed about all of them. Absent
rather than `false` when a page is not live, so a site with no published page pays
nothing for the field.

---

## Reading

| Call | Returns |
|---|---|
| `GET /agent/find` | Posts as **addresses and titles, never bodies**: filter by `site`, `type`, `folder` (matches beneath it too), `q` full-text, `limit`; walk past the cap with `after=<cursor>` |
| `GET /agent/read` | Whole documents by address. `address` is **repeatable**, so several posts cost one call; `fields=a,b` projects to named fields; `include=impact` attaches a template's blast radius; `state=published` reads what is **live** instead of the draft |
| `GET /agent/changes` | What changed, resumably. Without `since` you get a window and a starting cursor; with it, everything after that position, oldest first. The response's `cursor` is always the next `since`, which makes "what did the human change while I was away" one call rather than a guess at a window |
| `GET /agent/memory` | What earlier sessions worked out. `PUT` remembers one note idempotently by `(scope, key)`; `DELETE` forgets one |
| `GET /agent/diagnostics` | Recent **asynchronous** failures (webhook deliveries, image transforms, scheduled publishes, 5xx) instead of grepping the logs. The window is bounded and the response says when it started collecting, because "nothing since then" is a different claim from "nothing ever" |

Reads are **draft-preferred**, so you always see your own unpublished edits. `state=`
overrides that: `state=published` returns the live row and `state=draft` the editable one.
Two reads of the same address — one with `state=published`, one without — are the answer to
"what will change when I publish this", and `shio diff --against published` is that pair as
one command.

A `state=` naming a row the post has not got is a **404 that says which**, never a quiet
fall back to the draft: a caller comparing a draft against what is live would otherwise be
handed the draft twice and read it as "nothing changed".

`PUT /agent/memory` takes the author from the credential, never from the body, and
re-using a key **rewrites** that note rather than adding a second one: the next
session pays for every near-duplicate it has to reconcile.

---

## Writing

### A batch of ops

```http
POST /api/v2/agent/batch
Content-Type: application/json

{
  "dryRun": true,
  "ops": [
    { "op": "folder.upsert", "address": "folder:mysite/blog" },
    { "op": "post.upsert",  "address": "post:mysite/blog/hello-world",
      "type": "Article", "folder": "folder:mysite/blog",
      "data": { "TITLE": "Hello world", "TEXT": "<p>First post.</p>" } }
  ]
}
```

N addressed ops, applied **atomically**: either all of them or none. `dryRun: true`
reports exactly what would change and writes nothing; it is also how you obtain the
`confirm` token a destructive op requires.

The vocabulary is closed. Eleven ops:

| Op | What it does |
|---|---|
| `site.upsert` | Create a blank site, or fill an empty `url`/`description`/`furl` on one that exists. `data.postTypeLayout` binds a post type to a Page Layout title, per key. **Never replaces a value somebody set.** |
| `site.delete` | Remove a site and everything in it. Needs `confirm`, and unlike `folder.delete` it is **purged, not trashed**: there is no undo |
| `folder.upsert` | Create a folder at that whole name chain, or confirm it is there |
| `folder.move` | Rename or relocate a section. `to` is the whole new name chain, so its last segment is the new name. **No post's URL changes** |
| `folder.delete` | Trash a folder and everything beneath it. Needs `confirm`; use `folder.move` to rename |
| `post.upsert` | Declare a post's whole state at that address. Keys the post type does not declare are **refused**; use `post.move` to change the address |
| `post.move` | Change a post's URL, its folder, or both, keeping its id and history. A published post's live URL changes immediately |
| `post.publish` | Publish the draft, or schedule it with an ISO-8601 `when`. Needs a credential with `mayPublish` |
| `post.unpublish` | Withdraw the published row; the draft stays |
| `post.delete` | Trash a post. Needs `confirm` |
| `render.provision` | Create the `PageLayout`/`Region`/`Theme` post types this instance renders with, idempotently. **Takes no address**: it acts on the instance's model. `data.reconcile: true` also adds fields an older instance is missing |

Do `render.provision` **once before writing a layout**: `post.upsert` cannot create a
system post type, and until those types exist the preview route has nothing to compose.

### Destructive ops need a confirm token

A delete answers `428 Precondition Required` with a `confirm-required` problem carrying
the token its own dry run produced. Pass it back as `confirm` on the batch. The token
describes *that* deletion, so it cannot be reused to approve a different one: an agent
cannot rubber-stamp itself.

### Desired state

```http
POST /api/v2/agent/plan     # what would change; never writes
POST /api/v2/agent/apply    # make it true, atomically
```

Where a batch says *do these things*, a desired-state document says *this is what the
site should look like*:

```json
{
  "site": "mysite",
  "createSite": true,
  "postTypeLayout": { "Article": "Article Layout" },
  "folders": [ { "path": "blog" } ],
  "posts": [
    { "url": "blog/hello-world", "type": "Article",
      "data": { "TITLE": "Hello world" }, "publish": true }
  ],
  "moves": [ { "from": "blog/old-url", "to": "blog/new-url" } ],
  "prune": false
}
```

`plan` is the drift guard: an empty `changed` count means git and the server agree.
`prune: true` also removes what the document does not mention, which is why a plan that
would delete needs `confirm` exactly as a batch does. `moves` exist so a rename is
recorded as a move rather than inferred as a delete plus a create.

---

## Closing the loop without a human

An agent that writes and then asks a person "does it look right?" has not automated
anything. Two mechanisms answer that question in text.

Both write calls take the proof with them, so the closing turn costs no extra round
trip:

| Parameter | On `batch` / `apply` |
|---|---|
| `?verify=true` | Attach the lint report for what this write touched |
| `?digest=true` or `?digest=40` | Attach the two structural hashes for **every page this write affected**, which for an edit to a shared layout is not the address you wrote but every page rendering through it. Capped, because each row is a real render |

And both are endpoints in their own right:

```http
GET /api/v2/agent/verify?site=mysite&checks=content,routes
GET /api/v2/agent/render?address=post:mysite/blog/hello-world
```

`verify` returns a machine-readable report with a **fix per finding**. Four check
groups: `content` (fields, references, assets, friendly URLs are internally consistent),
`routes` (every published URL resolves and links land), `diagnostics` (the asynchronous
failures above), and `delivery`, which *fetches* the published pages to prove they are
really served, and is therefore opt-in by an operator setting, not by a caller. Scope a
run with `site`, `folder`, `address`, `checks`, `limit` or `since=<cursor>` so a loop
re-checks only what changed. `render` returns a page's structural digest, 
heading outline, landmarks, link and image inventory with alt text, word count, plus an
appearance hash, kept as two separate values so a restyle and a structural break are
never mistaken for each other. It digests the markup Shio holds and needs no front end
running; digesting a live delivery URL instead (`url=`) is off unless an operator turns
it on, because an endpoint that fetches on the server's behalf needs the operator's
consent, not the caller's.

---

## Errors are instructions

Every 4xx is an RFC 9457 problem document, and it carries what to do next:

```json
{
  "type": "https://shio.viglet.com/errors/unknown-field",
  "title": "Field 'HEADLINE' is not declared by post-type 'Article'",
  "status": 400,
  "fix": "Use one of the declared fields, or add HEADLINE to the post-type first.",
  "allowed": ["TITLE", "TEXT", "ABSTRACT", "HERO"],
  "didYouMean": "TITLE",
  "example": { "op": "post.upsert", "address": "post:mysite/blog/hello-world", "data": { "TITLE": "…" } }
}
```

`fix`, `allowed`, `didYouMean` and `example` are not decoration: they are what lets an
agent recover on the next call instead of asking a human what the API wanted.

**This is not only the agent surface.** Two kinds of refusal used to answer with nothing
useful, and both are ones a caller meets *before* any other:

- **A rejected credential.** `401` and `403` are written by the security chain, which
  runs before any controller, so they used to carry Spring's own
  `{timestamp, status, error, path}`. They are now problem documents whose `fix` names
  the credential *that path* wants — a `FORM` token for `/cda/form`, an `AGENT` token
  for the agent surface and MCP, a CDA token for the CDA and GraphQL, a console session
  elsewhere — and the call that mints one. `401` and `403` mean different things: no
  usable credential, versus one that authenticated and does not reach here.
- **An unknown post-type name.** `GET /api/v2/post-type/Nope` answered `404` with an
  empty body, so a renamed type and one that never existed were the same answer. It now
  carries `allowed`, `didYouMean` and a `fix` naming both next moves — post-types are
  the one name-keyed surface, so a typo is the likeliest way to arrive.

---

## What a call costs

Responses on this surface carry **measured size budgets**, enforced in CI: a response
that grows fails the build the way a broken test does. Three levers are yours:
`format=terse` (plain text, roughly a third to a half fewer tokens), `If-None-Match` on
every read that supports it (an unchanged answer is a `304` and costs nothing), and
`fields=` / `include=` to ask for less. An `X-Shio-Est-Tokens` header reports the
estimated cost of what you were sent.

---

## Endpoints that do not exist

You cannot grep for an absence, and inventing one of these is the most common wrong
turn:

| Not there | Use instead |
|---|---|
| `POST /api/v2/post` | `post.upsert` on `/agent/batch`, or `/api/v2/post-unified` |
| `DELETE /api/v2/object/{id}` | Delete by type: `/api/v2/post-unified/{id}` or `/api/v2/folder/{id}`, or `post.delete` / `folder.delete` here |
| A console post-type controller (`/api/v2/post/type`) | `/api/v2/post-type/**`: post types are **one name-keyed surface** |
| `GET /agent/impact` | `include=impact` on `/agent/read` |

There is also no endpoint on this surface that uploads **bytes**: `post.upsert` takes
JSON, so a file goes through the static-file API and is then referenced by address.

---

## Related Pages

| Page | Description |
|---|---|
| [Pages, Layouts & Regions](./website-development.md) | What `render.provision` creates, and how a page is composed |
| [Content Modeling](./content-modeling.md) | Post types and the fields `post.upsert` is checked against |
| [Content Delivery API](./headless/content-delivery-api.md) | The read contract this surface is a shape over |
| [Security](./security.md) | Token scopes, authentication and CSRF |
