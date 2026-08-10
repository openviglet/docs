---
title: The Universal Editor
sidebar_label: The Universal Editor
description: "Edit the rendered page: annotate a template with sh-field, open the page in the console, click the text and save it back to the draft."
---

# The Universal Editor

The console can edit a post through the form its post type declares. That is the right
surface for a content model, and the wrong one for "this headline is too long".

The **Universal Editor** puts the editing surface on the page itself. You open the
rendered page inside the console, click the text you want to change, type, and save. What
you save goes to the **draft**, not to the live page.

It works two ways, on Shio's own rendered pages, and on **your own front end**, wherever
it is deployed, which is the case that matters once delivery is a Next.js app over the
Content Delivery API.

---

## Annotating a template

The editor cannot guess which piece of HTML is which field. A template says so, with three
attributes:

```handlebars
<article sh-post="{{id}}">
  <h1 sh-field="TITLE">{{TITLE}}</h1>
  <div sh-field="TEXT">{{{TEXT}}}</div>
</article>
```

| You write | The browser receives | Means |
|---|---|---|
| `sh-region="Header"` | `data-shio-region`, `data-shio-region-post` | this node is that Region |
| `sh-field="TITLE"` | `data-shio-prop` | this node is that field |
| `sh-post="{{id}}"` | `data-shio-post` | the field belongs to *that* post |

Two rules make this predictable:

- **The page's own post is already stamped on `<body>`**, so the common case needs no
  `sh-post` at all. You only name it when a node belongs to a *different* post: a row
  inside a `{{#query}}` listing, say.
- **Ownership is the template's job, and the engine never infers it.** Resolution is
  nearest-ancestor: the closest `sh-post` above a field wins. The rendered HTML records
  which post a value came from because the template said so, not because something guessed.

`sh-*` is the contract your content declares; `data-shio-*` is what the browser consumes.
Both survive the render, and **stripping them breaks the editor**: the rendered DOM is
the only place the mapping from node to post exists.

---

## Opening a page

In the console, go to **Universal Editor**. You get a list of sites, an entry field for an
external URL, and a token selector: the editor saves through a delivery token with write
scope, not through your console session, because the page being edited may be served from
another origin entirely.

Pick a site to edit Shio's own preview render, or paste the URL of your deployed front
end.

Behind the scenes, a preview URL with `?editor=true` gets a small bridge script injected at
`/preview/_shio/editor.js`. An **ordinary preview ships no editor code at all**.

---

## On your own front end

If your site is a Next.js app (or anything else) over the delivery API, add the published
bridge:

```bash
npm install @viglet/shio-editor-cors
```

Then write the annotations on the elements you want editable, and tell the page which
origin is allowed to frame it:

```html
<meta name="urn:shio:system:editor-origin" content="https://shio.example.com">
```

If you compose pages from `@viglet/shio-sections`, the components already emit the
annotations — pass the section post's id and they become editable:

```jsx
<Hero data={section.data} postId={section.id} />
```

`postId` is optional and that is deliberate: only the host knows the id, because it
fetched the section over the delivery API and React drew it. Omit it on a public page and
the markup is byte-identical, so nothing carries editing metadata where it is not wanted.
Two things are not editable in place today and are documented rather than left to be
discovered: **the rows of a collection field** (each row is its own post and the payload
carries no id for it, so the editor would have nowhere to save), and `SectionHero.align`,
which is rendered as a CSS class rather than as a value an attribute carries.

That meta tag is not optional: **the package is inert without it.** A framed page cannot
work out who framed it, `document.referrer` is empty on some navigations and reading the
parent's location throws cross-origin, so the allowed origin has to be stated by the page.

The same reasoning applies on Shio's side: the console pins the iframe's origin and ignores
messages from anywhere else, and the injected script is handed its parent's origin
explicitly. **Neither side ever posts to `"*"`**, and that is asserted by a test rather
than promised in a comment.

The script is also **inert when the page is not framed**, so shipping it to production
costs a visitor nothing.

---

## What saving does

An edit merges into the post's **`DRAFT`** row. If the post existed only as a published
page, the draft is seeded from it first, so the live page is untouched until an explicit
publish. A preview client reading with a preview-scoped token renders that draft, which is
what makes "see it before anyone else does" work with no second deployment.

Three endpoints do the work, and they are ordinary delivery-API calls:

```http
GET   /api/v2/cda/post/{id}/editable    # the post plus its field schema
PATCH /api/v2/cda/post/{id}            # merge an edit into the draft
POST  /api/v2/cda/post/{id}/publish    # publish it
```

`editable` returns the **whole field schema**, not just the fields the page happens to
annotate, so the editor's panel can offer every field the post type declares, including
the ones no template exposed.

Writes need a token of **write** scope, and the console uses a credential-less request for
them: the token authenticates, not your session cookie.

---

## Related Pages

| Page | Description |
|---|---|
| [Pages, Layouts & Regions](./website-development.md) | The templates you annotate, and the preview route |
| [Letting an agent in](./agent-safety.md) | Drafts, publishing and the review queue |
| [Content Delivery API](./headless/content-delivery-api.md) | Token scopes, and the preview environment |
