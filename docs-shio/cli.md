---
title: The shio CLI
sidebar_label: The shio CLI
description: "@viglet/shio, the shio command: scaffold a site, sync content and post types both ways, verify, replicate an existing site, and gate a pipeline on drift."
---

# The `shio` CLI

```bash
npx @viglet/shio --help
```

The `shio` command is the scripted path into an instance: it is what a CI job runs, what
`claude mcp add` bridges to, and what you use when a shell is a better fit than an API
call. Zero runtime dependencies, and every command prints its own flags:

```bash
shio verify --help          # or: shio help verify
```

## Connecting

| Flag | Environment | Used by |
|---|---|---|
| `--url <baseUrl>` | `SHIO_URL` (default `http://localhost:2710`) | everything |
| `--user` / `--password` | `SHIO_USER` / `SHIO_PASSWORD` | `pull`, `push`, `deploy` (console Basic auth) |
| `--token <token>` | `SHIO_CDA_TOKEN` | `types`, `dev` (a delivery token) |

---

## The commands

### Start something

| Command | Does |
|---|---|
| `shio init [name]` | Scaffold a Next.js site wired to the delivery API. `--blueprint <name>` takes the starter from the instance instead; add `--site <site>` to apply its content in the same command |
| `shio blueprints` | List the appliable starting points; `shio blueprints <name>` prints one package's parameters |
| `shio import <file.zip>` | Clone an exchange package into this instance: how you accept a site somebody hands you |

### Discover

| Command | Does |
|---|---|
| `shio context` | The agent context pack (model, sitemap and conventions) in one call. `--out <file>` writes it |
| `shio resolve <address>` | Resolve `post:` / `folder:` / `site:` / `id:` to the object it names |
| `shio impact <address>` | What a change to this template would affect: layouts, types, page counts |
| `shio changes` | What changed, with a cursor to resume from (`--since`, `--cursor`) |
| `shio remember` | The instance memory: bare lists it, `<key> "<note>"` writes one, `--forget` drops one, `--site` scopes it |
| `shio mcp` | Bridge stdio to this instance's MCP endpoint, `claude mcp add shio -- shio mcp` |

### The content model

| Command | Does |
|---|---|
| `shio pull` | Post types into `shio/post-types/*.json` |
| `shio push` | Local post types back to the instance (`--dry-run`, `--check`, `--prune`) |
| `shio build` | Compile local DSL/JSON post types to canonical JSON without touching the server (`--out`) |
| `shio types` | Generate a TypeScript `.d.ts` from the live post types |
| `shio deploy` | `push` then `types` |

`push` and `build` compile TypeScript DSL sources to canonical JSON before diffing, so a
model authored as typed TS and one hand-written as JSON push identically. `--prune` never
removes a system type.

### Content

| Command | Does |
|---|---|
| `shio pull --content` | Project the site to `shio/content/**` (three-way merge) |
| `shio push --content` | Compile the tree into a desired-state document and apply it |
| `shio apply [file]` | Plan/apply a desired-state document, `--dry-run`, `--check`, `-` for stdin. `--blueprint <name> --site <site>` applies a package instead; `--create-site` makes the site in either mode |
| `shio dev --content` | Watch `shio/content/**` and sync both ways, logging events |

See [Content as Files](./content-as-files.md) for the tree, the sidecars and the merge.

### Prove it works

| Command | Does |
|---|---|
| `shio verify` | The content and route lint. **Exits non-zero on an error**: this is the CI gate. `--strict` fails on warnings too; `--folder` / `--address` / `--since` scope it; `--baseline` / `--accept` subtract findings you have accepted; `--delivery` adds the stronger proof that a published page is really served |
| `shio digest <page>` | One page's structure: outline, landmarks, links, images |
| `shio audit <page>` | What is wrong with a rendered page, as text with a selector each |
| `shio snapshot <page>` | A PNG for a human, plus whether the page looks different |
| `shio report` | The human handoff: what changed, a preview link each, and the warnings as open questions, Markdown, for a PR body |

Two things about `verify` that matter in a pipeline: the report's `notes` are printed,
because a run that quietly covered less than you think reads exactly like a clean pass;
and `--delivery` **appends** its group rather than replacing `--checks`, since a caller
who wants the stronger proof still wants the lint.

`snapshot` needs `playwright`, which is an **optional** dependency with a teaching error
naming the install, `@viglet/shio` never drags a browser into your project. With
`pixelmatch` and `pngjs` present the diff is per-pixel; without them it is byte-level, and
the output says which. **A changed page exits 0**: a page looking different is usually the
change you just made, and a gate there is one people wrap in `|| true`. A site with no
front end is photographed through the instance's own preview, and the output says the
picture is a draft, because the image cannot.

### Replicate an existing site

| Command | Does |
|---|---|
| `shio clone <url>` | Capture a site that already exists: an inventory, and no content |
| `shio propose` | Which captured blocks could become sections, and what each would lose |
| `shio convert` | Apply the accepted plan: sections, theme and scripts, as **drafts** |

See [Replication](./replication.md).

---

## In a pipeline

Three commands are gates, and the order they run in is the order the failures make sense
in:

```bash
shio push --check          # 1. does the model on the server match git?
shio push --content --check # 2. does the content match git?
shio verify                # 3. is what is there internally consistent and reachable?
```

`--check` prints the plan, writes nothing, and **exits non-zero when the plan is not
empty**, so a pull-request job fails on drift instead of silently reconciling it.
`verify` exits non-zero on an error, which is what makes it the last gate rather than a
report.

Every non-zero exit closes cleanly, so a piped run does not lose its last lines.

---

## Related Pages

| Page | Description |
|---|---|
| [Content as Files](./content-as-files.md) | The tree `pull --content` writes and the merge that protects it |
| [Blueprints](./blueprints.md) | The packages `init --blueprint` and `apply --blueprint` install |
| [Replication](./replication.md) | `clone`, `propose` and `convert` end to end |
| [The Agent Surface](./agent-surface.md) | The endpoints every command calls |
| [MCP Server](./mcp.md) | `shio mcp`, and connecting a client |
