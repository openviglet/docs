---
title: Replication
sidebar_label: Replication
description: "Point Shio at a site that already exists: capture it, propose what could become editable content, convert it, and serve it, in fidelity or authorable mode."
---

# Replication

Point Shio at a website that already exists and get back a site a curator can edit.

That is three commands (`clone`, `propose`, `convert`) and one decision you should make
*before* you run them, because choosing wrong wastes the run.

---

![Clone, propose, convert, publish, serve, judge](/img/diagrams/shio-replication-flow.svg)

## Two modes, and the choice is the whole thing

| | **Fidelity** | **Authorable** |
|---|---|---|
| What `convert` writes | The source's markup, verbatim, behind a Theme + Page Layout + Page | The captured blocks as **sections**: real fields, in a generated layout that annotates each one |
| How close it looks | Pixel-identical is achievable and has been achieved | The pixels have moved: captured CSS classes are dropped, so the theme styles nothing yet |
| Can a human edit it? | **No.** Verbatim markup carries no field annotations, so the Universal Editor opens a page with nothing to edit | **Yes.** Every field is annotated and editable |
| Use it for | Proving the capture is faithful; archiving a site as-is | Actually adopting the site into a CMS |

You choose by what you accept in the `propose` step: **accept nothing and you get
fidelity; accept the blocks and you get authorable content.**

Authorable is the mode that makes the replica a *CMS site* rather than a copy. Fidelity is
the pleasant one to test (it reaches 0.00% difference and looks finished) which is
exactly why a run that only tested fidelity has proved nothing about the path you probably
care about.

---

## The pipeline

### 1. Capture

```bash
shio clone https://example.com --depth 3 --assets --markup --site mysite
```

`clone` walks the origin and writes an **inventory and a report**: no content yet. Flags
worth knowing:

| Flag | Effect |
|---|---|
| `--assets` | Download the referenced images, stylesheets, fonts, icons, including the ones a written stylesheet's `url()` calls name |
| `--markup` | Keep each page's markup, which is what fidelity mode serves |
| `--render` | Ask a browser to render the page first, for a source whose content is built by JavaScript |
| `--scripts` | Inventory the third-party scripts, so `propose` can offer them as a Site Scripts list instead of silently dropping them |
| `--depth N` | How far to walk |

The capture separates what a replica **needs to render** from what merely exists, and a
downloaded byte no post references is reported as its own finding: a replica whose images
are all present but unreferenced is not a replica.

### 2. Propose

```bash
shio propose                     # read what it would do
shio propose --accept all        # …and accept it
```

`propose` reports, per captured block, which section type it would become, which fields it
would carry, the markup it would keep, and **what each conversion would lose**. That last
column is why this is a separate step and not a flag, you are approving a lossy
transformation, so you get to see the loss.

It also proposes the captured stylesheet as **design tokens plus CSS**, and the captured
third-party scripts as a Site Scripts list: every entry for the head, with a consent
category where the host declared one and a blank where it did not. A guess presented as a
fact would be worse than a blank on a consent gate, and the report counts how many need a
human.

### 3. Convert

```bash
shio convert --site mysite --create-site
```

`convert` applies the accepted plan through the ordinary desired-state path: one `Page` per
captured page at the source's own URL, the sections it composes, a `Theme`, a
`PageLayout` bound to both modes, and the captured bytes uploaded as `File` posts reachable
at **the paths their source used**.

Everything lands as **drafts**.

### 4. Publish, then look at the public route

```bash
shio push --content            # or publish through the console / an agent
```

Then judge on the **public** route:

```
/sites/mysite/default/en-us/
```

Not the preview. Two reasons, both of which have burned a run: the preview's banner shifts
every pixel, so a comparison there can never reach zero; and the preview renders **drafts**,
so an asset you forgot to publish looks fine there and 404s in public.

---

## Judging the result

A replica that "looks right" in a browser tab is not evidence. Four checks, in the order
that actually finds things:

1. **Every reference resolves.** Fetch each same-origin `src`, `<link href>` and CSS
   `url()` and expect a 200. This is the check a screenshot cannot make, and it is the one
   that finds missing webfonts, an asset written to the wrong path, and anything left
   unpublished.
2. **No link carries the source's base.** Every same-origin link must start with the base
   the replica is served from. A verbatim `href` is a hardcoded base, and it always points
   off-site.
3. **Both spellings of a directory path answer**: `/docs` and `/docs/`, one canonical and
   one redirecting, the way the source did.
4. **`shio verify --site mysite` is clean.** The bar is: a replica whose every reference
   answers 200 verifies with no findings.

Then compare the pictures:

```bash
shio snapshot /sites/mysite/default/en-us/ --against https://example.com --width 1280
```

**A number is not a result, open the PNG.** A 100% difference has meant a screenshot of an
authorization error, which is a perfect score for the wrong reason.

For the authorable mode, one extra check, and it has to be a **count** rather than a
glance:

```
/preview/mysite/?editor=true
```

should carry a `data-shio-prop` for every field each section declares, **including the
fields of every row of a collection**. Four of the seven section types are
collection-shaped (features, questions, logos, quotes), so a page that looks fully
annotated can be five props over a grid whose cards carry none. Rendering is not
annotation.

---

## Boundaries, stated up front

- **The instance does not run a browser.** Shio itself never renders JavaScript; `--render`
  drives a browser on *your* machine at capture time, and it is an optional dependency. A
  source that builds its content client-side is capturable only through that flag, and only
  as the DOM looked at capture time.
- **Fidelity mode is not editable**, by construction. If you need both, capture once and
  convert twice into different sites.
- **Authorable mode arrives unstyled.** The captured classes are dropped, so the theme's CSS
  matches nothing until you style the sections. This is the trade you accepted at `propose`.
- **A captured page carries residues.** Real-world markup is strange, and each strange case
  is found by running the chain rather than by reasoning about it. That is why the repository
  ships a conformance suite (`pnpm -C cli run conformance`) that drives capture → propose →
  convert → verify over a served fixture: it is the gate a change to any of this has to pass.

---

## Related Pages

| Page | Description |
|---|---|
| [The `shio` CLI](./cli.md) | Every flag of `clone`, `propose`, `convert` and `snapshot` |
| [Pages, Layouts & Regions](./website-development.md) | What `convert` writes, and the `/sites/**` route |
| [The Universal Editor](./universal-editor.md) | Editing an authorable replica |
| [Content as Files](./content-as-files.md) | The tree a converted site projects to |
