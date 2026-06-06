---
sidebar_position: 10
title: Next.js Starter
description: "create-shio-app — scaffold a Next.js App Router site wired to the Shio Content Delivery API."
---

# Next.js Starter — `create-shio-app`

Scaffold a **Next.js (App Router)** site wired to the Shio
[Content Delivery API](./content-delivery-api.md) in seconds. This is the
flagship "JS dev, zero Java" path — a JavaScript/TypeScript developer gets a
working, typed site without touching the Java backend.

## Create a project

Interactive:

```bash
npm create shio-app@latest
# or
npx create-shio-app
```

Non-interactive (CI / scripted):

```bash
npx create-shio-app my-site \
  --url https://cms.example.com \
  --site <site-id> \
  --token <cda-token> \
  --yes
```

| Flag | Maps to |
|---|---|
| `--url` | `SHIO_URL` |
| `--site` | `SHIO_SITE_ID` |
| `--token` | `SHIO_CDA_TOKEN` |
| `--yes`, `-y` | skip prompts (use defaults / flags) |

## What you get

```
my-site/
  app/
    layout.tsx
    page.tsx              # lists published posts (shio.query)
    [...slug]/page.tsx    # CDA path → post (shio.getPostByUrl) + SSG/ISR
  lib/shio.ts             # shared @viglet/shio-client instance
  next.config.mjs
  tsconfig.json
  .env.local              # filled from your answers/flags
  .env.example
  .gitignore
  README.md
```

Then:

```bash
cd my-site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- `lib/shio.ts` creates a shared [`@viglet/shio-client`](./javascript-client.md) instance from the environment.
- `app/page.tsx` lists the site's published posts (`shio.query`).
- `app/[...slug]/page.tsx` resolves **any path** to a post via `shio.getPostByUrl(siteId, "/the/path")` — friendly-URL routing straight from the CDA, with `generateStaticParams` (SSG) and `revalidate` (ISR).

```tsx
// app/[...slug]/page.tsx (simplified)
import { notFound } from "next/navigation";
import { shio, SITE_ID, slugToUrl } from "@/lib/shio";

export const revalidate = 60;

export async function generateStaticParams() {
  const listing = await shio.query({ siteId: SITE_ID, size: 500 });
  return listing.posts
    .filter((p) => p.furl)
    .map((p) => ({ slug: p.furl!.replace(/^\//, "").split("/") }));
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = await shio.getPostByUrl(SITE_ID, slugToUrl(slug));
  if (!post) notFound();
  return <article dangerouslySetInnerHTML={{ __html: String(post.attrs.content ?? "") }} />;
}
```

## Environment

```bash
SHIO_URL=https://your-shio-instance
SHIO_SITE_ID=<your site id>
SHIO_CDA_TOKEN=<your CDA token>
```

## Customizing content rendering

A post's fields arrive as `post.attrs` — a JSON object keyed by your post-type
attribute names. The catch-all page renders a `content`/`body`/`text`/`html`
field if present, and otherwise dumps `attrs` so you can see the shape. Adapt the
rendering to your own post types, optionally using the
[React SDK](./react-sdk.md) render components.
