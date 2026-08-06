---
sidebar_position: 1
title: Content Modeling
description: "Post types in Viglet Shio: one name-keyed surface, the widget catalogue, relationships, the model as code in TypeScript or JSON, and renaming without losing content."
---

# Content Modeling

A **post type** declares the fields a post may have. It is what a curator's form is
generated from, what an agent's write is validated against, and what a generated TypeScript
type is derived from: one declaration, three consumers.

---

## One name-keyed surface

Post types are referenced **by name** (`Article`, `Page`, `PageLayout`) everywhere: the
REST API, MCP calls, the CLI, and the files on disk. There is no id-keyed twin; the one that
used to exist was retired.

```http
GET    /api/v2/post-type            # every type
GET    /api/v2/post-type/Article    # one type and its fields
POST   /api/v2/post-type            # create
PUT    /api/v2/post-type/Article    # replace the definition
POST   /api/v2/post-type/Article/rename
DELETE /api/v2/post-type/Article
```

That choice is what makes a content model versionable: a type is a file called
`Article.json`, and a diff of two revisions is readable.

**Renaming is a move, not a create-plus-delete.** `POST /{name}/rename` keeps the type's
identity and its content. Deleting a type that content still points at answers a teaching
`409` naming what is in the way, rather than orphaning posts.

---

## Fields and widgets

Every field has a **name**, a label, and a **widget**. The widget decides three things at
once: how a curator edits the value, how the value is stored, and how it projects to a file
on disk.

| Widget | For |
|---|---|
| `Text` | A single line |
| `Text Area` | Plain multi-line text |
| `HTML Editor` | Rich text. The **first** one on a type becomes the document body when the post projects to a Markdown file |
| `Ace Editor - HTML` · `- CSS` · `- Javascript` | Code. These project to **sidecar files** beside the Markdown, so a template is editable with real tooling |
| `Check Box` | A boolean |
| `Combo Box` | One of a declared list of choices |
| `Multi Select` | Several values, tags, or a list of references (see below) |
| `Date` | A date or timestamp |
| `File` | An uploaded file, referenced by the `File` post it creates |
| `Content Select` | A reference to another post |
| `Relator` | A repeating group of sub-fields |
| `Tab` | Layout only: groups fields in the console form |
| `Hidden` | Stored, not shown |

Two fields can be marked as the type's **title** and **summary**, which is what listings,
search results and the `{{#query}}` helper's rows read.

### Widget settings

Some widgets need configuration, and it travels as `widgetSettings` on the field: a JSON
string. A `Combo Box` needs its choices; a `Multi Select` needs to say whether it holds tags
or references:

```json
{ "multiselect": { "references": "post" } }
```

That declaration is not cosmetic. It is what makes a composition **verifiable**, with it,
`shio verify` resolves each value as an address and reports the ones that do not exist. A
`Multi Select` without it stays a tag list, because reading every tag as a URL would report
a defect for every tag on every post.

---

## Relationships

| You want | Use |
|---|---|
| One post to point at another | `Content Select` |
| An ordered list of other posts (a page composed of sections, say) | `Multi Select` with `references: "post"` |
| Repeating structured rows inside one post | `Relator`, with its own sub-fields |
| A file | `File`, which creates a `File` post you can address like anything else |

Sections are the ordered-list case: a `Page` names its sections **by friendly URL, in
order**, and a region's template walks them with `{{#getRelation}}`. See
[Blueprints](./blueprints.md) for the shipped section vocabulary.

---

## System post types

Some types are created by Shio itself and are read-only in the console:

| Type | For |
|---|---|
| `Text` | General-purpose content |
| `File` | An uploaded asset, with its own dimension and checksum fields |
| `PageLayout` · `Region` · `Theme` | The render model |
| `Redirect` | One old path in, one address out |
| `SiteScripts` | A site's third-party script list, in load order |

The render types are created **on demand**: `POST /api/v2/render/post-types`, or the
`render.provision` op, rather than at install time, so provision them once before writing
a layout. They are otherwise ordinary content: exportable, projectable, lintable.

---

## The model as code

A content model is a deployable artefact, not console state.

```bash
shio pull                 # the live model → shio/post-types/*.json
shio push --dry-run       # what would change
shio push                 # apply
shio push --check         # exit non-zero if git and the server disagree (CI)
```

Serialization is **canonical and byte-identical**: pull twice and nothing changes, so a
diff means a real difference.

### Authoring in TypeScript

`shio/post-types/` also accepts `.ts` and `.mjs` modules written with
`@viglet/shio-model`, and the CLI compiles them to exactly the same canonical JSON:

```ts
import { postType, text, htmlEditor, comboBox, multiSelect } from "@viglet/shio-model";

export default postType("Article", {
  fields: [
    text("TITLE", { title: true, required: true }),
    htmlEditor("TEXT"),
    comboBox("CATEGORY", { choices: { tech: "Technology", biz: "Business" } }),
    multiSelect("SECTIONS", { references: "post" }),
  ],
});
```

The point is compile-time validation: `comboBox` *requires* its choices, so a missing one is
a TypeScript error in your editor rather than a `400` from a push. `shio build` compiles
without touching the server, if you want to inspect the output.

### Managed by code

Any push marks the types it wrote as **managed by code**. The console then shows them
read-only, badge, disabled form, and a `409` on a console `PUT` as the server-side
backstop. That is deliberate: it makes the boundary between "owned by git" and "edited by
hand" explicit instead of a last-writer-wins race.

### Generated TypeScript for a front end

```bash
shio types --out types/shio.d.ts
```

Produces one interface per post type from the live model, so `post.attrs.TITLE` has
autocomplete in your front end. See [JavaScript Client](./headless/javascript-client.md).

---

## Addressing content

A model is only useful if you can name what it produced:

| Form | Names |
|---|---|
| `post:mysite/blog/hello-world` | one post |
| `folder:mysite/blog` | one folder |
| `site:mysite` | a site |
| `id:9f8c…` | anything, by raw id |

Writes take only `post:` and `folder:` (plus `site:`), and a site's home page is
`post:mysite/`. A post's friendly URL is its own field (**not** its folder path) so
reorganising folders does not rewrite URLs.

---

## Publishing

A post has two states, `DRAFT` and `PUBLISHED`, and can be in both at once. Editing a
published post updates its draft and leaves the live version alone until something publishes
it. Publishing can be scheduled. Deleting moves the post to the trash. See
[Core Concepts](./getting-started/core-concepts.md#draft-and-published).

---

## Search fields

A field can be mapped to a Turing Semantic Navigation field, title, description, text,
date, URL, image, or to a custom field for facets. That mapping only matters if you have
enabled Turing indexing, which is **off by default**; see
[Search & Caching](./search-caching.md).

---

## Related Pages

| Page | Description |
|---|---|
| [Core Concepts](./getting-started/core-concepts.md) | Sites, folders, posts, states |
| [The `shio` CLI](./cli.md) | `pull`, `push`, `build`, `types` |
| [Content as Files](./content-as-files.md) | How posts and code fields project to disk |
| [The Agent Surface](./agent-surface.md) | `post.upsert` and the field validation it applies |
| [Pages, Layouts & Regions](./website-development.md) | The render types in use |
