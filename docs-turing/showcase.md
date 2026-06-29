---
sidebar_position: 7
title: Reference showcase (Atlas Store)
description: Atlas Store — the installable reference app that exercises the maximum surface of Viglet Turing ES (typed catalog, faceted + hybrid search, RAG chat, agents, skills, and creative bets).
---

# Reference showcase — Atlas Store

**Atlas Store** is the canonical reference application for Viglet Turing ES. It
is a commerce-catalog copilot whose single job is to **exercise the maximum
surface of the platform** — a living demo, an SDK-vs-real-backend integration
test, and the "this is what Turing can do" artifact.

It lives in the monorepo at [`frontend/apps/showcase`](https://github.com/openviglet/turing/tree/main/frontend/apps/showcase)
and **seeds its own data**: a deterministic ~200-product typed catalog (price as
`CURRENCY`, rating as `FLOAT`, reviews as `INT`, on-sale as `BOOL`, release date
as `DATE`, multi-valued color/material/tags) that stresses the manifest, hybrid
ranking and facets.

## Run it

```bash
# From the monorepo root
pnpm install
pnpm dev:showcase        # vite dev server (proxy VITE_API_URL → a running Turing)

# Package as an import bundle
pnpm build:showcase
cd frontend/apps/showcase && npm run zip   # → atlas-store.zip
```

Import `atlas-store.zip` from the Turing admin (Marketplace / Pages import) to
provision the SN site, index the catalog, and serve the SPA as a search
template.

## What it demonstrates

| Surface | Capabilities |
|---|---|
| **Search** | faceted + URL-synced search, autocomplete, spell-check, category tabs, sort, similar/"more like this", click tracking; hybrid RRF + reranker as a server toggle |
| **RAG chat** | streaming, cited sources, option chips, native forms, slots, multimodal image upload, workspace panel, rich markdown/`html`/`d2` |
| **Agent power** | cart **client tools**, code interpreter ("total my cart"), live tool-call activity, answer-as-app comparison widgets, a bundled returns/RMA **skill** |
| **Creative bets** | co-browse the search UI, glass-box "Why #1?" ranking, ambient proactive copilot, agent→agent handoff, an **embeddable action widget** on a mock partner page |
| **Voice / memory / ops** | voice dictation, search by image, cross-conversation memory (GDPR delete), an `/ops` tour (analytics, eval, cost), and MCP exposure for Claude Desktop |

A full feature-by-feature reconciliation against the design matrix lives in
[`COVERAGE.md`](https://github.com/openviglet/turing/blob/main/frontend/apps/showcase/COVERAGE.md).

## Architecture notes

- Built with **`@viglet/turing-react-sdk`** (search/chat hooks),
  **`@viglet/turing-react-ui`** (headless components, token-themed to the Atlas
  brand), and the zero-dep vanilla **`@viglet/turing-sdk`** (the embeddable
  action widget).
- Agent-side features (chat, client tools, answer-as-app, skills, hybrid
  ranking) are **gated server-side**; the offline Lucene seed is search-only and
  the UI shows honest "configure GenAI" notices, so the demo never looks broken.
- An end-to-end smoke test
  ([`TurShowcaseSmokeIT`](https://github.com/openviglet/turing/blob/main/turing-app/src/test/java/com/viglet/turing/showcase/TurShowcaseSmokeIT.java))
  boots the backend, imports the showcase ZIP into an embedded Lucene index, and
  asserts the REST contract the storefront depends on.
