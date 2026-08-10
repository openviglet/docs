# docs-shio Coverage Matrix

> **Purpose.** Every shipped block / feature cluster in the Shio
> [`CHANGELOG.md`](https://github.com/openviglet/shio/blob/main/docs/CHANGELOG.md)
> maps here to **either** a documentation page (with anchor) **or** an explicit
> "deliberately internal, no public page" row. A shipped user-facing subsystem
> with no page is an **orphan** (🔴) and a bug in the docs. This file is the
> gate authored by Block R SH479; keep it in sync when a new block ships.
>
> **Legend:** ✅ documented · 🧩 folded into a broader page · ⚠️ a page exists
> but describes a shape the product left (worse than missing: a reader is
> actively misled) · 🔒 deliberately internal (engineering / repo / marketing,
> no end-user page by design) · 🔴 orphan (missing, fix it).

_Not rendered in the sidebar; this is a maintenance artifact._

> **Why these sections and not Turing's.** Shio's primary operator is a coding
> agent, the human curates, and the CDA delivers, so the matrix is grouped by
> **who does the job**, which since SH482 is also the sidebar: four hubs, each
> with its own landing page, and every page below files into one of them.
> ⚠️ is a verdict `docs-turing/COVERAGE.md` does not need: every
> published Shio page predates the 2026.3 renderer, so "has a page" and "has a
> correct page" are different questions here.

---

## The agent builds it

| Block / feature | Page | Status |
|---|---|---|
| **Block H**: the agent gateway, `GET /api/v2/agent/manifest` (+ `?section=`, the `elsewhere` map), the context pack `/agent/context`, `/find`, `/read` (`fields=` projection, id-free reads), the nine-op mutation vocabulary, `POST /agent/batch`, desired-state `/agent/plan` + `/apply`, teaching errors (RFC 9457 + `fix`/`allowed`/`didYouMean`/`example`), SH79 addresses incl. the home form `post:<site>/` | [agent-surface](./agent-surface.md) | ✅ (SH484) |
| **Block H**: the discovery surface's second half — `startHere` routing an intent to one call, the context pack's `omitted` report and per-post `published`, and teaching refusals on the two surfaces P6 had not reached (a rejected credential, an unknown post-type name) | [agent-surface § One call instead of a session](./agent-surface.md#one-call-instead-of-a-session) · [§ Errors are instructions](./agent-surface.md#errors-are-instructions) | ✅ (SH601, SH608, SH553, SH621, SH622) |
| **Block H**: the model's own proposal — `PUT /post-type/{name}?dryRun=true` costing a model change, and `shio propose --from` deriving a type from content that already exists | [content-modeling § Asking what a model change would cost](./content-modeling.md#asking-what-a-model-change-would-cost) · [§ Modelling from content you already have](./content-modeling.md#modelling-from-content-you-already-have) | ✅ (SH523, SH525) |
| **Block H**: indexing content published before search was switched on (`site.upsert` `data.reindex`), and section fields the Universal Editor can reach on a headless front end | [search-caching § Indexing what was already published](./search-caching.md#indexing-what-was-already-published) · [universal-editor § On your own front end](./universal-editor.md#on-your-own-front-end) | ✅ (SH413, SH638) |
| **Block H**: MCP server host, `POST /mcp` (JSON-RPC 2.0, streamable HTTP), the `shio_*` tools, resources and prompts, the measured `tools/list` budget | [mcp](./mcp.md) | ✅ (SH481) |
| **Block J**: the Claude Code plugin (`claude-plugin/`) | [mcp § Connecting](./mcp.md#connecting) | 🧩 (SH481) |
| **Block I**: content as files: the `shio/content/**` · `shio/folders/**` · `shio/assets/**` projection, sidecars, asset bytes + fingerprints, the per-field three-way merge, `movedFrom`, the commit-ordered change feed `/agent/changes` | [content-as-files](./content-as-files.md) | ✅ (SH486) |
| **Block I / C / Q**: the `shio` CLI, `pull`, `push` (`--content`, `--check`, `--prune`, `--accept`), `apply`, `verify`, `report`, `remember`, `context`, `changes`, `dev --content`, `build`, `init --blueprint`, `snapshot`, `audit`, `digest`, `clone`, `propose`, `convert` | [cli](./cli.md) | ✅ (SH487) |
| **Block J**: blueprints: the package format, `GET /agent/blueprints`, `POST /agent/blueprints/{name}/apply`, the first-party `blog` / `docs` / `nextjs-starter` set, `@viglet/shio-sections` | [blueprints](./blueprints.md) | ✅ (SH488) |
| **Block K**: the perception loop, content lint `/agent/verify` (+ scoped runs, accepted findings), route/link proof, render digest `/agent/render`, `/agent/diagnostics`, the durable incident feed, visual snapshot + diff, the handoff report | [agent-surface § Closing the loop](./agent-surface.md#closing-the-loop-without-a-human) covers verify, render and diagnostics; the incident feed, snapshot diff and handoff report are the CLI half | 🧩 (SH487 for the CLI half) |
| **Block K, closing**: `state=` on `/agent/read` so a draft can be compared with what is live, and `shio diff --against published` as that pair in one command | [agent-surface § Reading](./agent-surface.md#reading) · [cli](./cli.md) | ✅ (SH619, SH640) |
| **Block L**: agent safety: the `AGENT` token scope + session identity, draft-by-default + the publish gate, destructive-op confirm tokens, the review queue, the folder trace/undo, attribution | [agent-safety](./agent-safety.md) | ✅ (SH485) |
| **Block M**: token economy, measured , response budgets, terse mode, the build-a-site benchmark, the instance memory / conventions store `/agent/memory`, the `AGENTS.md` generator, conditional agent reads (ETag) | [token-economy](./token-economy.md) | ✅ (SH497) |
| **Block N**: the realignment: one **name-keyed** post-type surface (the id-keyed `/api/v2/post/type` twin is gone), console reads on the CDA shapes, post-type rename as a move, a teaching 409 for a post-type content points at | [content-modeling § One name-keyed surface](./content-modeling.md#one-name-keyed-surface) · [rest-api § Post types](./rest-api.md#post-types) | ✅ (SH495, SH496) |

## The human curates it

| Block / feature | Page | Status |
|---|---|---|
| **Block O**: the content console , the browser and its paged listing, the post form built from the post-type, copy/move with both ends authorized and free names, "select everything", the trash | n/a | 🔴 (SH485 covers the rails, not the console) |
| **Block E**: the React console's own surfaces, dashboard, **Media Library**, static-file manager, webhooks UI, and the `config/` pages (auth providers, exchange providers, email/SMTP, search) | [administration-guide](./administration-guide.md) describes the legacy AngularJS screens these replaced | 🔴 (no Block R task names them) |
| Users, groups, roles, site properties, and **SH54** content-level ACL (folder/post grants, inherited, default-allow) | [administration-guide § Permissions](./administration-guide.md#permissions) | 🧩 |
| **Block C**: the curator's lifecycle tools, **SH13** short-lived preview tokens + console preview, **SH14** draft↔published diff + restore, **SH15** scheduled publish/unpublish, **SH51** audit history + Activity viewer, **SH55** trash / restore | [content-modeling § Publishing](./content-modeling.md#publishing) covers none of them | 🔴 (no Block R task names them) |
| **Block P / 0**: the Universal Editor: the annotated render, the `sh:*` bridge, the iframe states, the save-back (and the auth it always claimed, SH233) | [universal-editor](./universal-editor.md) | ✅ (SH489) |

## The visible site

| Block / feature | Page | Status |
|---|---|---|
| **Block P**: the renderer, `Page` → `PageLayout` → `Region`, `Theme`, Handlebars templates and helpers, the section vocabulary, `data-shio-*`, `/preview/**` and the `/sites/**` delivery grammar | [website-development](./website-development.md) | ✅ (SH483) |
| **Block P / Q**: the rest of the visible site, DTCG theme tokens, Site Scripts, the `{{#image}}` helper's intrinsic size + signed `srcset`, `Redirect` posts, `Menu`/`MenuItem`, `post.locale` + `{{#translations}}`, the paged/sorted `{{#query}}` | [design-tokens](./design-tokens.md) · [website-development § Themes and design tokens](./website-development.md#themes-and-design-tokens) · [§ Third-party scripts](./website-development.md#third-party-scripts) · [§ Redirects](./website-development.md#redirects) · [§ Menus and translations](./website-development.md#menus-and-translations) · [§ Paging a listing](./website-development.md#paging-a-listing) | ✅ (SH483, SH420) |
| **Block P**: form submissions — `{{#form}}` rendering a post type's fields, the per-site destination (`POST /api/v2/site-form`: folder, invited types, `enabled`), the `FORM` token scope, `POST /api/v2/cda/form/{site}` writing one DRAFT post, the honeypot, and the system-type refusal | [website-development § Forms](./website-development.md#forms) | ✅ (SH633) |
| **Block P**: `{{#query}}`'s pager — `@page`/`@pages`/`@total`/`@hasPrev`/`@hasNext`/`@index`/`@last`, drawing a pager once with `{{#if @last}}`, and a listing nested in a listing keeping its own position | [website-development § Paging a listing](./website-development.md#paging-a-listing) | ✅ (SH420) |
| **Block P**: `verify`'s `dangling-relation`, and the `PageLayout` opt-out from `site-scripts-dropped` | [website-development § Proving it renders](./website-development.md#proving-it-renders) · [§ Third-party scripts](./website-development.md#third-party-scripts) | ✅ (SH421, SH572) |
| **`shio audit`'s rules**: the eleven checks (`overflow`, `contrast`, `zero-size`, `collapsed`, `font-fallback`, `request-failed`, `console-error`, `no-landmark`, `no-heading`, the shape line, `region-script`) and what each means | [cli](./cli.md) lists the verb in the table and documents none of the rules, so a reader cannot act on a finding without reading `cli/src/audit.mjs` | 🔴 |
| **Block Q**: replication, `shio clone` (`--assets`, `--render`, `--scripts`), `shio propose`, `shio convert`, fidelity vs authorable mode, `snapshot --against`, the replication check group | [replication](./replication.md) | ✅ (SH492) |
| **Block F (SH25 epic)**: static files and image transforms: the `file_source` upload/serve subsystem, `?w=&h=&format=&crop=` on the delivery path, the resize/crop pipeline, webp/avif negotiation, the result cache + ETag, limits and signed URLs | [website-development § Static files and images](./website-development.md#static-files-and-images) documents both URL forms and the transform parameters; the result cache, the dimension/format limits and how to turn on signed URLs are still undocumented | 🧩 (no Block R task names the gap) |

## The CDA delivers it

| Block / feature | Page | Status |
|---|---|---|
| **Block 0 + A**: the CDA read contract `/api/v2/cda/**`, token scopes + per-site keys, per-environment (prod/preview) keys, rate limiting + cache headers, the real GraphQL delivery schema | [content-delivery-api](./headless/content-delivery-api.md) · [graphql](./graphql.md) | ✅ |
| **Block A/B**: `@viglet/shio-client` (framework-agnostic TS core) | [javascript-client](./headless/javascript-client.md) | ✅ |
| **Block B**: `@viglet/shio-react-sdk` (hooks + render components) | [react-sdk](./headless/react-sdk.md) | ✅ |
| **Block B**: `create-shio-app`: the Next.js starter, SSG/ISR/SSR recipes, Draft Mode preview, on-demand revalidation | [nextjs-starter](./headless/nextjs-starter.md) | ✅ |
| **Block B (SH11)**: TypeScript type generation from post-types , `GET /api/v2/cda/post-type`, `generateShioTypes`, the `shio-types` CLI | [content-modeling § Generated TypeScript for a front end](./content-modeling.md#generated-typescript-for-a-front-end) · [cli](./cli.md) | 🧩 (SH496) |
| **Block B (SH62 epic)**: post-types as code , `@viglet/shio-model` DSL, the CLI compile step, `push --check` drift guard, the console "managed by code" lock | [content-modeling § Authoring in TypeScript](./content-modeling.md#authoring-in-typescript) · [§ Managed by code](./content-modeling.md#managed-by-code) | ✅ (SH496) |
| **Block C (SH12)**: outbound webhooks on publish/unpublish/delete, per-site subscriptions, the signed payload | the consumer half appears in [nextjs-starter § Environment](./headless/nextjs-starter.md#environment); nothing documents the subscription, payload or signature | 🔴 (no Block R task names it) |
| **Block C (SH52 / SH240)**: content full-text search: the in-DB index, the CDA search endpoint, the console search box | [search-caching § Full-text search](./search-caching.md#full-text-search) | ✅ (SH494) |
| **Block C (SH53)**: content i18n , the locale axis, linked translations, CDA `?locale`, the checked locale segment | n/a | 🔴 (no Block R task names it) |
| **Block G**: content portability: the exchange package format (SH68), site export → zip, site import / clone, the default bootstrap-site template | [import-export](./import-export.md) (predates SH68's format and SH71's template) | 🧩 |

## Run it

| Block / feature | Page | Status |
|---|---|---|
| Installation, Docker, JAR, source, databases, Linux service | [installation-guide](./installation-guide.md) | ✅ |
| Configuration (`application.properties`) | [configuration-reference](./configuration-reference.md) | ✅ (SH495) |
| **Block F (SH22)**: multi-tenancy / SaaS, `@TenantId` isolation, provisioning, membership, quota, suspension | [multi-tenancy](./multi-tenancy.md) | ✅ (SH493) |
| Turing ES indexing, **opt-in**, reached only on publish | [search-caching § Viglet Turing ES indexing](./search-caching.md#viglet-turing-es-indexing) | ✅ (SH494) |
| Architecture, components, request flow, deployment topologies | [architecture-overview](./architecture-overview.md) | ✅ (SH491) |
| The introduction a newcomer meets first | [intro](./getting-started/intro.md) · [core-concepts](./getting-started/core-concepts.md) | ✅ (SH490) |
| The landing page | [index](./index.mdx) | ✅ (SH480) |
| Developer environment, tech stack, contributing | [developer-guide](./developer-guide.md) still lists Elasticsearch 9.3.3 and names no agent surface or CLI | ⚠️ (unnamed by any Block R task) |

## Developers (reference)

| Block / feature | Page | Status |
|---|---|---|
| Console REST API | [rest-api](./rest-api.md) | ✅ (SH495) |
| Content modelling + the delivery SDK story | [content-modeling](./content-modeling.md) · the `headless/` pages | ✅ (SH496) |

## Security

| Block / feature | Page | Status |
|---|---|---|
| Authentication, authorization, CSRF, CORS, HTTP firewall, password encoding | [security](./security.md) | ✅ (SH495) |

The `AGENT` token scope, session identity and the Universal Editor's save-back
auth (SH106, SH233) are the **Block L** row in *The agent builds it*, counted
there, not twice.

---

## Deliberately internal: no public page (not orphans)

These shipped blocks are engineering, repository, or marketing concerns with no end-user documentation surface. Listed so they're accounted for, not silently missing.

| Block | Why no page |
|---|---|
| **Infra**: the pnpm workspace (root `package.json`, `pnpm-workspace.yaml`, `frontend-maven-plugin` on pnpm) | Repository build wiring; nothing a consumer of Shio calls |
| **Block E**: SH20 (Thymeleaf rendering removed), SH21 (the AngularJS `resources/ui/` tree deleted), SH60 (legacy commerce/recaptcha widgets deprecated, not ported) | Removals of surfaces that were never documented; the replacement console is the row above |
| **The lints and invariant guards**: SH26 (cross-DB schema drift), SH122 (`@TenantId` JOINED-join), SH128 (`ShFolderSite`), SH136 (byte stability), SH158, SH197, SH403, SH408–SH412, SH435 (help/flags), SH458, plus `ShIdeCompiledClassLintTest`, `ShAgentP1ConformanceTest`, `ShStatelessReachabilityLintTest` | Build-time instruments. They change what a *contributor* may write, not what a user can do; `agents.md` and `docs/agents/**` are their home |
| **The benchmarks and suite health**: SH112 (task benchmark), SH113 (response budgets, as a *test*), SH164, SH198, SH239, SH246, SH440/SH445 (CLI exit paths), SH444 (root devDependencies) | Internal measurement and CI hygiene. The *user-facing* half of the token work is the Block M row above, which is an orphan |
| **`cli/conformance/`** (SH448) and the `shio-replication-test` judging skill | A maintainer harness for judging a replication run against a live instance; the user-facing verbs it drives are the CLI + replication rows above |
| **Block N's internal halves**: SH120 (console reads adopt CDA shapes), SH162 (SDK type mirror), SH165 (paged listing), SH167/SH234 (CSRF narrowing), SH177 (`schemaJson` retired) | Behaviour-preserving realignments; where one is observable it is folded into the ⚠️ rows above |
| **Block Q's capture internals**: `scanPage` block detection, token collision, CSS lifting, asset classification (SH424–SH432, SH449, SH452, SH455–SH456, SH461, SH465–SH476) | Fidelity mechanics of `clone`/`convert`. The user-facing surface is the three verbs and the two modes, documented as one row |
| **Block P's engine internals**: the template graph, the render cache, the section registry | Renderer architecture (`docs/agents/renderer.md`); the authorable vocabulary is the user-facing half |
| **Block R**: this documentation round: the coverage gate (SH479), the four sidebar hubs (SH482), the pages the rest of the block files into them, and the two instruments that execute their examples (SH499) | Meta: it produced the pages in this very matrix. The hubs are navigation, so they change no verdict below; they are where a 🔴 becomes a page. SH499 closed the block by making these pages *checkable*: `cli/conformance/docs-vocabulary.conformance.mjs` holds every `shio` verb, REST path, `shio_*` tool and `shio.*` key written here against what the product declares, and `docs-examples.conformance.mjs` issues the read-only requests against a running instance — so a renamed verb or a moved endpoint fails a Shio build instead of misleading a reader here |
| **Block S**: the public site at [shio.viglet.org](https://shio.viglet.org/) (SH530 and the Block S backlog), its `shio-site/` app, prerender and Pages deploy | Marketing, and it is the *entrance* to this documentation rather than part of it. Every claim it makes is a page here or in `docs/agents/**`, so a row of its own would duplicate a verdict already recorded above; what it owes those pages is a correct link, not coverage |

---

## Orphans

**Of 42 clusters, 7 are still not documented correctly: 6 🔴 orphans and 1 ⚠️ misleading page.** Thirty-five are covered (28 ✅, 7 🧩).

> The orphan count moved from 5 to 6 without a row changing: the tables have listed `shio audit`'s rules as 🔴 since this file shipped and this summary never counted it. The ✅ and 🧩 figures are the previous ones plus this block's one new row, not an independent recount — a count of every status-bearing row comes to 48, which does not reconcile with the 40 this summary was authored against, and reconciling the two is its own task rather than something to guess at inside a block sweep.

Block R took this from **33 wrong of 40** to **7**. What is left is what the block's own tasks never named, which is the finding the matrix existed to produce:

- **6 🔴**, none of them named by a Block R task: the content console itself (Block O) · the console's own curator surfaces (Block E: dashboard, Media Library, static-file manager, webhooks UI, the `config/` pages) · the curator's lifecycle tools (SH13–SH15, SH51, SH55: preview tokens, version diff and restore, scheduled publish, the activity view) · outbound webhooks (SH12) · content i18n (SH53) · **`shio audit`'s eleven rules**, which the table has listed as an orphan since this file shipped and this summary did not count.
- **1 ⚠️**: the developer guide still lists Elasticsearch 9.3.3 in its stack and names no agent surface or CLI.
- **Also unclosed**: the transform cache, the dimension and format limits and the signed-URL configuration are the operational half of the SH25 image epic, folded into the render page but not documented as operations.

Every item above is worth a task. Four of them are curator-facing, which is the half this block reached last: the agent's surface is now the best-documented part of the product and the console is the least.

This file lands **red on purpose**: it is the audit that scopes Block R, and the count above is the number the block is measured by. When a new block ships, add its row here, and if it is user-facing without a page, that 🔴 is a defect to fix before the block is considered done.

---

## Block R is complete, and what it left

Block R's last task shipped on 2026-08-09 and the block is withdrawn from Shio's roadmap. It ends at **6 wrong of 40**, from 33 — and the six are the finding, not the remainder of the work: every one is a cluster no Block R task ever named, which is why they survived a block that fixed twenty-seven others. They are now filed as Shio tasks of their own rather than left in this file's prose, because a gap recorded only in an audit is one nobody is assigned.

One thing changed about *how* these pages are maintained, and it is the reason the block could be called done. Until SH499 nothing here was ever executed, which is precisely how the pre-2026.3 pages came to describe a product that had moved: written once, never compared. Two instruments now compare them on every Shio conformance run — the **names** (verbs, routes, tool names, configuration keys, read from the product's own declarations) and the **requests** (the read-only invocations, issued against a live instance). A count comes with them: **57 executable blocks over 18 pages, 65 assertable subjects**.

So the rule for the next round is stronger than "add a row". A page that publishes a command, an endpoint or a configuration key is now making a claim a build can falsify. Write the example so it can be run.
