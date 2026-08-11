---
title: Preview, history and scheduling
sidebar_label: Preview, history and scheduling
description: "The Viglet Shio curator's lifecycle tools: share a draft with a preview link, compare a draft against what is live, restore the published version, schedule a publish, and read the audit trail."
---

# Preview, history and scheduling

These are the tools that answer one question: **what happened to this page, and can I
undo it?**

They exist so a mistake is recoverable — but a person who does not know **Restore** exists
experiences a mistake as unrecoverable anyway. This page is the half of the safety model
that only helps if you have read it.

All of them live on the post's own edit screen, in the sticky bar at the top:
**Preview Draft · Translations · History · Schedule · Save**.

---

## Draft and published

Every post has two states, and it can be in **both at once**:

- **Draft** — the working copy. Saving writes here.
- **Published** — what visitors see.

Editing a published post changes only its draft; the live page keeps serving the
published version until something publishes the new one. That is why nothing you type in
the console reaches the site by accident, and it is the premise all five tools below rest
on.

Today publishing happens through the **Universal Editor**'s Publish button, or by
**approving an agent run** in Agent Review. See
[Letting an agent in](./agent-safety.md) for how a run is approved.

---

## Preview a draft before anyone else sees it

**Preview Draft** on the post's edit screen opens the page as it will look, drafts
included, in a new tab.

What happens depends on where the site's front end is:

- **Shio renders the site itself** — the preview opens straight away. The console session
  you are already signed in with is the authorization, and no credential is minted.
- **The site has an external front end** (a Next.js app, say) — Shio mints a **short-lived
  preview token**, confined to that one site, and opens the front end's preview route
  carrying it.

### Preview links expire, on purpose

A minted preview link is good for **15 minutes** by default, and **never more than an
hour**. That is the whole point of it: a link you paste into a chat should stop working
before it can be forwarded somewhere you did not intend.

**An expired link is not a broken product.** If a reviewer says the link no longer works,
click Preview Draft again and send a fresh one.

The token is **preview-scoped and site-scoped**: it can read that one site's drafts and
nothing else. It cannot write, and it cannot reach another site.

An operator can change the lifetime, or turn preview links off entirely, in
[configuration](./configuration-reference.md):

```properties
shio.cda.preview.enabled=true
shio.cda.preview.ttl-seconds=900
shio.cda.preview.max-ttl-seconds=3600
```

If preview is switched off, the button is quietly unavailable rather than failing.

---

## History: what changed since the last publish

**History** on the post's edit screen compares the **draft (working copy)** against the
**published (live)** version, field by field.

The dialog opens with the answer in its header:

- *"N field(s) changed since last publish"*
- *"No changes since last publish"*
- *"Not yet published — nothing to compare"*

Below it, each field is listed with its draft value, its published value, and a status:
**changed**, **added** or **removed**. **Only changes** hides the fields that are the same
in both, which is what you want on a post type with forty fields and two edits.

It also tells you **who** — the draft's last modifier, and who published the live version.

### Restore the published version

**Restore published version** throws away the draft's changes and makes the draft match
what is live again. It is the undo for "I edited this and it was worse."

It asks twice: the first click arms it (*"Discard draft changes — click again to
confirm"*), the second does it.

It does **not** touch the live page. Restore is about the working copy; the published
version was never in danger.

---

## Schedule a publish or an unpublish

**Schedule** on the post's edit screen sets two optional instants:

| Field | Effect |
|---|---|
| **Publish at** | The draft goes live at this time. |
| **Unpublish at** | The live version comes down at this time. |

Either can be set without the other, and leaving a field empty means no schedule.
**Clear** removes one that is already set.

A scheduled post shows *"Scheduled for …"* so the state is visible without opening the
dialog.

**The transition fires within a minute of the chosen time.** A background sweep runs
every 60 seconds and applies whatever has come due, so nobody has to be at a keyboard at
midnight — but do not schedule against a deadline finer than a minute.

---

## The audit trail

**Administration → Activity** answers "who did that": every create, update, publish,
unpublish, delete and restore, with the name of whoever made it and when.

It covers **every** surface — the console, the CLI, the delivery API and an agent — so a
change made by something that never opened a browser is attributed the same way as one
you typed yourself.

For an agent's work specifically, **Agent Review** is the better screen: it groups a run's
changes together so you can approve or revert the run rather than reading it one row at a
time.

See [Administration § Activity](./administration-guide.md#activity).

---

## The trash

Deleting is reversible. A deleted post or folder is marked deleted rather than removed,
disappears from the console and the site, and can be restored from **Content → Trash**.
Nothing expires it on a timer; **purge** is the only permanent act.

The details — what one restore puts back, and why a folder delete is a single row in the
trash — are on
[The content console § The trash](./content-console.md#the-trash).

---

## Related

- [The content console](./content-console.md) — the browser, the post form, the trash
- [Letting an agent in](./agent-safety.md) — draft-default, the review queue, reverting a run
- [Universal Editor](./universal-editor.md) — editing and publishing on the rendered page
- [Administration](./administration-guide.md) — activity, agent review, API tokens
- [Content Modeling](./content-modeling.md) — the post types the form is generated from
