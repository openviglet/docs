---
title: The content console
sidebar_label: The content console
description: "The surface a curator is in every day in Viglet Shio: the content browser, the post form, copy and move, selecting more than one thing, and the trash."
---

# The content console

This is the screen you spend your day in. An agent builds the site through files and
API calls; you open the console to look at what it built, fix a sentence, move a page
into the right folder, and put things away.

The console is at `/console/content` on your Shio instance. Everything below is
reachable from that first screen.

---

## The content browser

A site is a tree of **folders** holding **posts**. The browser walks it the way a file
browser does: click a folder to go in, use the breadcrumb to come back out.

- **Breadcrumb** — the path from the site down to where you are. Every segment is
  clickable.
- **New \[Post Type]** — creates a post of the type you used last, remembered per
  browser. The grid icon beside it opens the full post-type picker if you want a
  different one.
- **New Folder** and **Import** sit next to it.
- **Sort**, **Select**, **Action in batch** are on the right.

Each row shows the item's name, when it changed, its type, and — on hover — the
actions for that one item: view, edit, clone, copy, move, delete.

### The listing is paged, and folders are not

Posts arrive **50 at a time**. Folders do not: a folder's children folders are all
returned at once, so the folder half of the screen is always complete.

The counter above the list is the folder's **real** post count, not the number of rows
loaded. If it says 480 and you can see 50, both numbers are correct — and this is the
distinction that decides what "select all" means, below.

---

## The post form

Opening a post gives you a form **generated from its post type**. You are not editing
JSON; you are filling in the fields somebody modelled, in the order they modelled them.

- Each field is a card, colour-coded by its widget (text, rich text, date, a reference
  to another post, a repeating group, and so on). See
  [Content Modeling](./content-modeling.md) for what each widget does.
- A field marked with `*` is required and the form will not save without it.
- Fields can be grouped into **tabs** by whoever modelled the type.
- The **save bar is sticky** at the top: it stays visible however long the form is, and
  carries the post's title, its type, its field count, and whether you have permission to
  publish it.
- **Save** keeps you on the form. **Save & Close** returns you to the folder.

Saving writes a **draft**. Publishing is a separate act with its own permission — see
[Letting an agent in](./agent-safety.md) for the full draft-and-publish model.

---

## Copy and move

Both start the same way: pick one or more items, choose **Copy** or **Move**, and a
dialog walks *down* from the site root so you can choose a destination folder.

**Cloning** is the shortcut for the common case: copy an item into the folder it is
already in.

### What a copy does to names

A copy **takes names that are free**. Cloning a page called `Home` at `/home` gives you
`Home (2)` at `/home-2`. The title moves with the URL, so you never end up with two rows
you cannot tell apart. Copying a folder renames the folder the same way.

The two counters are independent, because they live in different scopes: a **title** is
unique within its folder, a **URL** is unique within the site. Copy `Home` into a
different folder of the same site and it keeps the title `Home`, and only the URL gets
a number.

### What a move does to names

A move **relocates and changes nothing else**. The post keeps its URL — which is the
point, because that URL may be live and linked from elsewhere. A post that has no URL
yet gets one on the way.

If the destination site already has something at that URL, the move is **refused** with
an error telling you what is in the way. It is never silently renamed: a published page
quietly changing address is exactly the surprise this refuses to cause.

### What the dialog will not let you do

You cannot move or copy a folder into itself or into anything inside it. Those folders
appear in the picker **greyed out rather than hidden**, so you can see that the folder
you are looking for is the one you are dragging, and the confirm button says why it is
disabled.

### Permission is checked at both ends

- A **move** needs write permission on the destination *and* on every item you are
  moving. Moving something out of a folder is a removal from that folder's point of
  view, and it is authorized as one.
- A **copy** needs write on the destination and **read** on every source.

The check runs over the whole selection **before** anything moves. A batch you are only
partly allowed to move moves **nothing** — it does not relocate the items you happened
to list first and then stop.

The console and the agent surface enforce the identical rule. Where they ever
disagreed, the stricter one was the correct one.

---

## Selecting more than one thing

The **Select** menu is the part whose behaviour is genuinely not guessable from the
checkbox, so it is worth reading once.

| Choice | What it selects |
|---|---|
| **Folders** | Every folder here. Folders are never paged, so this really is all of them. |
| **Content** | Every post that matches — **not** just the 50 on screen. It pages the rest in first. |
| **Everything** | Both of the above. |
| **Invert** | The rows **currently loaded**, inverted. |
| **Nothing** | Clears the selection. |

Two consequences worth having in mind:

- **"Content" and "Everything" are about the whole folder.** Choosing one on a folder of
  480 posts selects 480 posts, and the delete dialog will say 480. That is deliberate: a
  dialog that said "50 item(s)" and left 430 behind is how a curator concludes a folder
  is empty when it is not.
- **"Invert" is about the screen.** Inverting a set that includes rows nobody has looked
  at is not a gesture anyone means, so it does not.

There is a ceiling of **1000 items**. Past it, the selection stops and tells you how many
of how many it took, rather than pulling an unbounded folder into your browser. The number
in the confirmation dialog is always the number that will actually be acted on.

**Action in batch** is enabled only while something is selected, and applies the action to
the selection.

---

## The trash

**Deleting is reversible.** Deleting a post or a folder marks it deleted; it does not
remove it.

- **Deleting a folder** trashes everything beneath it — every post, every sub-folder — as
  one act, stamped with one instant.
- **Trashed items disappear from the browser** everywhere, including from search and from
  the delivery API. To a reader the site behaves as though they are gone.
- **The trash page** lists what was deleted. A deleted folder appears as **one row for
  the deletion**, not one row per folder inside it, because the deletion is what you would
  undo.

Each row offers two things:

- **Restore** puts back exactly what *that* deletion removed. Something that was already
  in the trash before that delete stays in the trash — restoring a folder does not
  resurrect things you threw away last month that happen to live inside it.
- **Purge** is the permanent one. This is where the content is really removed, where its
  uploaded files are cleaned up, and where any webhook subscribers are told it is gone.
  A reversible delete deliberately has none of those side effects.

**Nothing expires the trash on a timer.** Items stay until somebody purges them, so
"delete" is safe and "purge" is the one to be careful with.

Deleting a **site** is different: it purges. There is no undo at site level.

Every delete, restore and purge is attributed to whoever did it and recorded in the
activity history.

---

## Related

- [Content Modeling](./content-modeling.md) — the post types the form is generated from
- [Letting an agent in](./agent-safety.md) — drafts, publishing, the review queue
- [Universal Editor](./universal-editor.md) — editing on the rendered page itself
- [Administration](./administration-guide.md) — the console's admin and configuration screens
