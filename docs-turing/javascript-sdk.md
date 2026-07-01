---
sidebar_position: 7
title: JavaScript SDK (vanilla)
description: "@viglet/turing-sdk — a zero-dependency, framework-agnostic JavaScript client for Viglet Turing ES. Observable controllers for search, chat, autocomplete, slots and analytics; built for Adobe EDS, plain <script>, Astro, WordPress or any bundler."
---

# JavaScript SDK (vanilla)

**`@viglet/turing-sdk`** is a **zero-dependency**, framework-agnostic JavaScript client for the Viglet Turing ES API. No React, no axios — just native `fetch`, `TextDecoder`, `EventSource` and `crypto.randomUUID`. It ships as a self-contained ESM bundle (`dist/turing-sdk.js`) plus a UMD build and TypeScript types.

**When you'd reach for it.** Use this SDK when you're building a search box or chat widget **outside React** — an [Adobe Edge Delivery Services (EDS)](#adobe-eds) block, a plain `<script>` tag, an Astro island, a WordPress theme, or any bundler-based app. If you're in a React app, use **[`@viglet/turing-react-sdk`](./react-sdk.md)** instead — it's the same backend and the same `Tur*` types, exposed as hooks. This vanilla SDK was extracted from the React SDK's framework-agnostic `core/` layer (axios → `fetch`), so the two stay in lockstep.

> **The mental model.** The SDK has three layers, from lowest to highest:
>
> 1. **The client** (`createTuringClient`) — owns the base URL, credentials and CSRF priming. This is the explicit replacement for `axios.defaults`.
> 2. **API functions** (`fetchSearch`, `postChatConversation`, …) — pure `(client, …args)` functions, one per REST/SSE endpoint. Use these when you want full control.
> 3. **Controllers** (`createSearchController`, `createChatController`, …) — small observable state machines that wrap the API functions with a `subscribe()` / `getState()` pub-sub `Store`. **This is the layer you'll use 90% of the time** — it's the vanilla equivalent of the React hooks.

---

## Installation

```bash
npm install @viglet/turing-sdk
```

Or **vendor the bundle** directly (no build step) — copy `dist/turing-sdk.js` into your project and import it as a module. This is the recommended path for EDS (see [below](#adobe-eds)).

```js
import { createTuringClient } from "https://cdn.jsdelivr.net/npm/@viglet/turing-sdk/+esm";
```

---

## Your first search (2 minutes)

Every program starts the same way: **create a client, then drive a controller.**

```js
import { createTuringClient, createSearchController } from "@viglet/turing-sdk";

// 1. Configure the client once. baseURL points at the Turing REST root (note the /api).
const client = createTuringClient({ baseURL: "http://localhost:2700/api" });

// 2. A controller is an observable state machine for one search surface.
const search = createSearchController(client, { site: "my-site", locale: "en_US" });

// 3. Subscribe: your callback fires on every state change (loading → success → …).
search.subscribe((state) => {
  if (state.status === "success") {
    for (const doc of state.documents) {
      console.log(doc.title, doc.url);
    }
  } else if (state.status === "error") {
    console.error(state.error);
  }
});

// 4. Trigger work. The controller updates its state; your subscriber repaints.
await search.searchQuery("artificial intelligence");
```

That's the whole pattern. `subscribe()` returns an **unsubscribe** function — call it when your component/block tears down.

---

## The client

`createTuringClient(config)` is the single source of connection truth. Every API function and controller takes the client as its first argument.

```ts
interface TuringClientConfig {
  baseURL: string;                     // REQUIRED — e.g. "http://localhost:2700/api"
  credentials?: RequestCredentials;    // default "include" (sends cookies / CSRF cross-origin)
  headers?: Record<string, string>;    // merged into every request
  apiKey?: string;                     // a Turing Developer Token → sent as the "Key" header
  getCsrfToken?: () => string | undefined | Promise<string | undefined>; // override CSRF resolution
}
```

The returned client exposes low-level helpers (`get`, `post`, `del`, `request`, `fetchRaw`, `ensureCsrfToken`) if you ever need to call an endpoint the SDK doesn't wrap yet.

### CSRF & cross-origin

The Turing backend uses Spring Security's `CookieCsrfTokenRepository`, which writes the `XSRF-TOKEN` cookie **HttpOnly** and surfaces the token in the `X-XSRF-TOKEN` response header. JavaScript can't read an HttpOnly cookie, so before any mutating request (`POST`/`PUT`/`DELETE`) the client **primes** the token with a best-effort `GET {baseURL}/csrf` and attaches it as `X-XSRF-TOKEN`.

- **Anonymous / public deployments** with CSRF disabled work **tokenless** — the priming call fails softly and requests go through.
- **Different origins?** Enable CORS with credentials on the backend (`Access-Control-Allow-Credentials: true` + an explicit allowed origin). `credentials: "include"` (the default) sends the cookie.

---

## Controllers

Each controller wraps a tiny pub-sub `Store` with `getState()`, `setState()` and `subscribe(listener)`. `createChatController` and `createSlotsController` (and `createSimilarController`) additionally expose **`destroy()`** to abort in-flight requests, timers and SSE subscriptions — always call it on teardown.

| Controller | Factory | What it does |
|---|---|---|
| **Search** | `createSearchController(client, config, initialParams?, options?)` | Full search surface: query, facets, pagination, sort, locale, click tracking. |
| **Chat** | `createChatController(client, options?)` | Streaming RAG/agent chat: token-by-token replies, suggestion chips, native forms, sources, citations, client tools. |
| **Autocomplete** | `createAutoComplete(client, config, debounceMs?)` | Debounced type-ahead suggestions (default 300 ms). |
| **Slots** | `createSlotsController(client, scope, options?)` | Live view of conversation slots (captured data) via polling or SSE. |
| **Similar** | `createSimilarController(client, site, options?)` | "Related / you may also like" — similar documents for a seed id. |

### Search controller

```js
const search = createSearchController(
  client,
  { site: "my-site", locale: "en_US" },   // TuringConfig: { site, locale?, sort? }
  { rows: 20 },                            // optional initial params
  { analytics }                            // optional — see Analytics below
);

await search.searchQuery("laptops");       // run a query
await search.navigate(facetHref);          // click a facet / pagination / "did you mean" link
await search.goToPage(2);
await search.changeSort("relevance");
await search.changeLocale("pt_BR");
search.trackResultClick(doc.id, position); // CTR signal
```

State: `{ status, data, chat, documents, groups, error, params }`. `documents` and `groups` are pre-resolved from the raw response so you can render them directly.

### Chat controller

The chat controller streams the assistant's reply **token by token** — every token pushes a new state, so your subscriber repaints a growing bubble. It works in two modes:

- **Site mode** (default) — pass `site`. Talks to the Semantic Navigation chat (`/sn/{site}/chat/conversation`), including any [chat flow](./chat-flow.md) on that site.
- **Agent mode** — pass `agent: { id, llmInstanceId, allowOverride? }`. Talks to a specific [AI Agent](./ai-agents.md) (`/v2/ai-agent/{id}/chat`).

```js
const chat = createChatController(client, {
  site: "my-site",
  persist: true,          // save the transcript to sessionStorage
  locale: "en_US",
  goalSlots: ["email"],   // writing this slot counts as a lead conversion (analytics)
});

chat.subscribe((s) => {
  renderBubbles(s.messages);           // re-renders on every token
  if (s.isStreaming) showTypingDots();
  if (s.activeForm) renderForm(s.activeForm); // a native multi-field form is pending
});

await chat.send("How do I reset my password?");
// If a chat flow raised a form:
await chat.submitForm({ name: "Ada", email: "ada@example.com" });

chat.stop();     // abort the in-flight turn
chat.reset();    // clear messages + error (client-side)
await chat.resetFlow(); // drop the server-side flow cursor
chat.destroy();  // release everything on teardown
```

A `ChatMessage` carries far more than text — as the stream progresses it accumulates `options` (suggestion chips), `form`, `sources` (RAG provenance), `citations` (per-sentence grounds), `toolCalls` (live tool activity), `grounding` (answer-grounding verdict) and `secondOpinion` (cross-vendor critic). Render whichever your UI cares about.

#### Frontend "client tools" (generative UI)

An agent can call a tool that runs **in the browser** — open a dialog, call your own API, mutate the page — and the SDK feeds the result back so the turn resumes. Register handlers up front or imperatively:

```js
const chat = createChatController(client, {
  site: "my-site",
  clientTools: {
    // shorthand: just a handler
    log_to_crm: (args) => { crm.track(args); return { ok: true }; },
    // full form: handler + optional JSON Schema advertised to the agent
    send_email: {
      handler: async ({ to, subject, body }) => {
        const id = await mailer.send(to, subject, body);
        return { success: true, messageId: id };
      },
      schema: { type: "object", properties: { to: { type: "string" } } },
    },
  },
});

// or later:
const off = chat.registerClientTool("open_dialog", (args) => {
  openDialog(args); return { result: "opened" };
});
```

When the agent invokes a client tool, the SDK calls your handler with the parsed args, `POST`s the result to `/v2/chat/client-tool-result`, and resumes the SSE stream. See **[Client tools & agent↔UI transparency](./client-tools.md)**.

### Autocomplete & slots

```js
const ac = createAutoComplete(client, { site: "my-site" }, 250); // 250ms debounce
ac.subscribe((s) => renderSuggestions(s.suggestions));
input.addEventListener("input", (e) => ac.fetch(e.target.value));
```

```js
const slots = createSlotsController(
  client,
  { site: "my-site" },                 // or { agentId }
  { transport: "sse", sseDelta: true } // live updates; sseDelta = smaller delta stream (2026.3.1+)
);
slots.subscribe((s) => {
  if (s.slots.email) prefill("email", s.slots.email);
});
```

---

## Low-level API functions

When a controller doesn't fit, call the endpoint directly. Every function takes the `client` first. The streaming chat function is the most important one — it exposes a callback per SSE event type:

```js
import { createTuringClient, postChatConversation } from "@viglet/turing-sdk";

const client = createTuringClient({ baseURL: "http://localhost:2700/api" });

await postChatConversation(
  client,
  "my-site",
  [{ role: "user", content: "What is AI?" }],
  "en_US",
  {
    onToken:        (t)     => process.stdout.write(t),         // each text token
    onOptions:      (opts)  => showChips(opts),                 // suggestion chips
    onForm:         (form)  => renderForm(form),                // native form (T107)
    onSources:      (srcs)  => showSources(srcs),               // RAG provenance
    onCitations:    (cites) => underline(cites),                // per-sentence citations
    onToolCall:     (c, all) => showToolActivity(all),          // live tool lifecycle
    onGrounding:    (g)     => badge(g.grounded ? "ok" : "flagged"),
    onSecondOpinion:(o)     => badge(o.agree ? "agree" : "disagree"),
    onReasoning:    (r)     => showWhy(r),                       // reasoning summary
    conversationId: "session-123",
  }
);
```

Other functions include `fetchSearch`, `postClick`, `fetchAutoComplete`, `fetchSpellCheck`, `fetchSimilar`, `postSiteSlotUpload` (multimodal), `postSiteChatResume`, `dslSearch` / `dslQuery` ([DSL Query](./dsl-query.md)), `postSemanticChat`, `postAgentChat`, and discovery helpers (`fetchDiscovery`, `fetchFeatures`, `fetchSystemLocales`, `fetchLlmVendors`). `createTuringApi(client)` returns an object with all of them pre-bound to the client.

---

## Analytics & the Google Analytics bridge

Turing measures the funnel **server-side** ([Chat Analytics](./chat-analytics.md), [Experiments](./experiments.md)). This SDK adds the **browser-owned** half — conversion, abandonment and "which persona A/B variant won" — delivered into **your own GA4**, next to acquisition source and audiences. It's a zero-dependency canonical event bus with **pluggable sinks**; GA4 is the first adapter, not a dependency.

```js
import {
  createTuringClient, createTuringAnalytics, googleAnalyticsSink,
  createSearchController, createChatController,
} from "@viglet/turing-sdk";

const analytics = createTuringAnalytics({
  sinks: [googleAnalyticsSink()],       // auto-detects window.gtag / dataLayer
  context: { site: "my-site" },
});

const client = createTuringClient({ baseURL: "/api" });
createSearchController(client, { site: "my-site" }, undefined, { analytics });
createChatController(client, { site: "my-site", analytics, goalSlots: ["email"] });
```

The bus is **no-op when no `analytics` option is passed**, so existing embeds are byte-for-byte unchanged. Search → chat → lead is stitched into one funnel via the shared `TUR_SESSION` cookie. Full event taxonomy and the GA4 setup live in **[Conversion Analytics](./conversion-analytics.md)**. In React, use `useTuringAnalytics()`.

---

## Adobe EDS {#adobe-eds}

The SDK was designed for [Adobe Edge Delivery Services](./integration.md) blocks. Vendor `dist/turing-sdk.js` into your EDS project's `scripts/` folder and import it from a block:

```js
// blocks/turing-search/turing-search.js
import { createTuringClient, createSearchController } from "../../scripts/turing-sdk.js";

export default function decorate(block) {
  // Authors configure the block with a two-cell row: | API base URL | site |
  const [baseURL, site] = [...block.querySelectorAll("div > div")].map((c) => c.textContent.trim());
  const client = createTuringClient({ baseURL });
  const search = createSearchController(client, { site });
  search.subscribe((state) => repaint(block, state));
  // …wire an input to search.searchQuery(value)
}
```

The `examples/eds/` folder in the package ships ready-to-copy `turing-search`, `turing-chat` and `turing-analytics` blocks.

---

## Related pages

- **[React SDK](./react-sdk.md)** — the hook-based equivalent for React apps.
- **[Turing CLI](./cli.md)** — scaffold, deploy and eval agent projects from the terminal.
- **[Flow DSL](./flow-dsl.md)** — author chat flows as typed TypeScript.
- **[Client tools & agent↔UI](./client-tools.md)** — the frontend-tool protocol used by `registerClientTool`.
- **[Conversion Analytics](./conversion-analytics.md)** — the GA4 bridge and event taxonomy.
- **[REST API](./rest-api.md)** — the endpoints these functions wrap.
