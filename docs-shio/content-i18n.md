---
title: Content in several languages
sidebar_label: Content i18n
description: "The locale axis in Viglet Shio: every post carries a locale, a translation is a linked sibling post with its own URL, the CDA's ?locale, the locale segment in delivery URLs, and the template helpers that render a language switcher."
---

# Content in several languages

Shio has one locale axis, and it is worth reading before you write the content rather
than after — the single decision that is expensive to change later is **the URL**, and it
is decided the moment the first translation is created.

---

## Every post has a locale

`locale` is a property of **every** post, not only of a translated one. It is a language
tag such as `en` or `pt-br`.

When nothing sets it, it is **`en`**. The column is nullable in the database, but no read
ever returns a blank one — an empty `lang` attribute does not mean *unspecified* to a
browser or a screen reader, it asserts that the language is unknown, which is worse than
a default that is merely not what you meant.

There is **no per-site default locale setting**. A site does not declare "this site is
Portuguese"; its posts each carry their own tag.

---

## A translation is a sibling post, not a field

This is the part that is not guessable, and the part that decides your URL structure.

Translating a post creates a **second post**. The two are linked by a shared
**translation group**, and each is otherwise an ordinary post: its own id, its own
fields, its own publish state, its own friendly URL.

What follows from that:

- **Each translation is published, previewed and deleted on its own.** Publishing the
  English page does not publish the Portuguese one.
- **Each translation has its own fields.** There is no partial-translation merge and no
  fallback at the field level; a translation whose body you left empty renders empty.
- **The translation group is internal.** It is a UUID, and no address a person writes
  ever contains one. You address a translation the way you address any post:
  `post:<site>/<its-own-url>`.

### Translations must have different URLs

**Two posts in one site cannot share a friendly URL, and being in different locales does
not exempt them.**

An address is `post:<site>/<friendly-url>` and it carries **no locale**, so two posts at
one URL are two posts the CMS cannot tell apart by name. `shio verify` reports them as a
`duplicate-url` finding — and says explicitly when the two claimants differ only by
locale, so you can see that the collision was a deliberate choice rather than an
accident. A move onto an occupied URL is refused for the same reason.

So give each translation its own path:

```
/about              (en)
/pt-br/sobre        (pt-br)
```

or

```
/about              (en)
/sobre              (pt-br)
```

Either works. What does not work is `/about` twice.

### Creating one

In the console, open the post and use **Translations → Add translation**, picking the
target locale. Through the API:

```http
POST /api/v2/post-unified/{id}/translate
{ "locale": "pt-br", "data": { … } }
```

`GET /api/v2/post-unified/{id}/translations` lists the siblings of a post's group.

---

## Reading a locale through the CDA

```http
GET /api/v2/cda/post/by-url?siteId=…&url=/about&locale=pt-br
```

- **With `locale`**, only that translation matches.
- **Without `locale`**, whatever is published at that URL resolves, whichever locale it
  is in.

**There is no fallback.** Asking for a locale that has no translation at that URL returns
nothing — a `404`, not the English page. That is deliberate: a silent fallback would make
a half-translated site look finished, and a front end that wants a fallback can implement
the one it actually wants.

Every post the CDA returns carries **`availableLocales`**: the locales its translation
group is published in, sorted. That is what a front end builds a language switcher from,
and it is how a link that points at a page translated in one locale and not another can
be detected before it is rendered.

---

## The locale segment in delivery URLs

Pages Shio renders itself are served at:

```http
GET /sites/{site}/{format}/{locale}/{path}
```

So the locale is in every published URL — which is usually the first place a reader meets
it, before deciding whether they want translations at all.

- `{locale}` is **checked against the site's own content**: it is accepted when the site
  has published content in that locale, or when it is the default (`en`). Anything else
  is a **404**, not a silent fall-through to the home page.
- `/sites/mysite/` is the home page; the segments are filled in for you by the site's own
  navigation.

The check is not cosmetic. Without it, `/sites/mysite/default/xx-yy/` answered the home
page with a `200`, so a mistyped locale looked like a working page.

See [Pages, Layouts & Regions § Public delivery](./website-development.md#public-delivery).

---

## Rendering a language switcher

In a Handlebars template:

```handlebars
<html lang="{{post.locale}}">
…
{{#translations}}
  <a href="{{link}}" hreflang="{{locale}}">{{title}}</a>
{{/translations}}
```

- **`post.locale`** is on every page and is never blank — safe to put straight into
  `<html lang>`.
- **`{{#translations}}`** takes no arguments: a translation set is a property of *this*
  page, not something the template selects.
- It **excludes the current page**, so a switcher does not need an `{{#unless}}` around
  every item. To mark the current language, compare against `post.locale`.
- Items are ordered **by locale tag**, not newest-first, so a picker's items do not move
  when somebody edits one translation.
- Each item's label is the **sibling's own title**, which is already in the target
  language by construction.

The same pair renders `hreflang` links for search engines, which is the other reason to
have the sibling set on the page rather than fetched.

---

## Related

- [Content Modeling](./content-modeling.md) — post types, fields and the publish states
- [Pages, Layouts & Regions](./website-development.md) — templates, helpers and the delivery grammar
- [Content Delivery API](./headless/content-delivery-api.md) — `?locale` and `availableLocales`
- [The content console](./content-console.md) — where the Translations menu lives
