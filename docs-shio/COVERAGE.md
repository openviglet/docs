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
> agent, the curator approves, and the CDA delivers, so the matrix is grouped by
> **who does the job**, which since SH482 is also the sidebar: four hubs, each
> with its own landing page, and every page below files into one of them.
> ⚠️ is a verdict `docs-turing/COVERAGE.md` does not need: every
> published Shio page predates the 2026.3 renderer, so "has a page" and "has a
> correct page" are different questions here.

---

## The agent builds it

| Block / feature | Page | Status |
|---|---|---|
| **Block H**: the agent gateway, `GET /api/v2/agent/manifest` (+ `?section=`, the `elsewhere` map), the context pack `/agent/context`, `/find`, `/read` (`fields=` projection, id-free reads), the mutation vocabulary, `POST /agent/batch`, desired-state `/agent/plan` + `/apply`, teaching errors (RFC 9457 + `fix`/`allowed`/`didYouMean`/`example`), SH79 addresses incl. the home form `post:<site>/` | [agent-surface](./agent-surface.md) | ✅ (SH484) |
| **Block H**: the discovery surface's second half — `startHere` routing an intent to one call, the context pack's `omitted` report and per-post `published`, and teaching refusals on the two surfaces P6 had not reached (a rejected credential, an unknown post-type name) | [agent-surface § One call instead of a session](./agent-surface.md#one-call-instead-of-a-session) · [§ Errors are instructions](./agent-surface.md#errors-are-instructions) | ✅ (SH601, SH608, SH553, SH621, SH622) |
| **Block H**: the model's own proposal — `PUT /post-type/{name}?dryRun=true` costing a model change, and `shio propose --from` deriving a type from content that already exists | [content-modeling § Asking what a model change would cost](./content-modeling.md#asking-what-a-model-change-would-cost) · [§ Modelling from content you already have](./content-modeling.md#modelling-from-content-you-already-have) | ✅ (SH523, SH525) |
| **Block H**: indexing content published before search was switched on (`site.upsert` `data.reindex`), and section fields the Universal Editor can reach on a headless front end | [search-caching § Indexing what was already published](./search-caching.md#indexing-what-was-already-published) · [universal-editor § On your own front end](./universal-editor.md#on-your-own-front-end) | ✅ (SH413, SH638) |
| **Block H**: MCP server host, `POST /mcp` (JSON-RPC 2.0, streamable HTTP), the `shio_*` tools, resources and prompts, the measured `tools/list` budget | [mcp](./mcp.md) | ✅ (SH481) |
| **Block J**: the Claude Code plugin (`claude-plugin/`) | [mcp § Connecting](./mcp.md#connecting) | 🧩 (SH481) |
| **Block I**: content as files: the `shio/content/**` · `shio/folders/**` · `shio/assets/**` projection, sidecars, asset bytes + fingerprints, the per-field three-way merge, `movedFrom`, the commit-ordered change feed `/agent/changes` | [content-as-files](./content-as-files.md) | ✅ (SH486) |
| **Block I / C / Q**: the `shio` CLI, `pull`, `push` (`--content`, `--check`, `--prune`, `--accept`), `apply`, `verify`, `report`, `remember`, `context`, `changes`, `dev --content`, `build`, `init --blueprint`, `snapshot`, `audit`, `digest`, `clone`, `propose`, `convert` | [cli](./cli.md) | ✅ (SH487) |
| **Block J**: blueprints: the package format, `GET /agent/blueprints`, `POST /agent/blueprints/{name}/apply`, the first-party `blog` / `docs` / `nextjs-starter` set, `@viglet/shio-sections` | [blueprints](./blueprints.md) | ✅ (SH488) |
| **Block J**: the package marketplace: the catalogue and its `builtin-only` / `remote` / `unreachable` source, `shio.marketplace.*`, install and uninstall over REST, `shio marketplace`, the `shio_marketplace` tool, the console page, and the administrator gate on the writes | [blueprints § Where more packages come from](./blueprints.md#where-more-packages-come-from) · [cli](./cli.md) · [mcp](./mcp.md) | ✅ (SH646, SH675, SH677, SH678, SH682) |
| **Block K**: the perception loop, content lint `/agent/verify` (+ scoped runs, accepted findings), route/link proof, render digest `/agent/render`, `/agent/diagnostics`, the durable incident feed, visual snapshot + diff, the handoff report | [agent-surface § Closing the loop](./agent-surface.md#closing-the-loop-without-asking-anyone) covers verify, render and diagnostics; the incident feed, snapshot diff and handoff report are the CLI half | 🧩 (SH487 for the CLI half) |
| **Block K, closing**: `state=` on `/agent/read` so a draft can be compared with what is live, and `shio diff --against published` as that pair in one command | [agent-surface § Reading](./agent-surface.md#reading) · [cli](./cli.md) | ✅ (SH619, SH640) |
| **Block L**: agent safety: the `AGENT` token scope + session identity, draft-by-default + the publish gate, destructive-op confirm tokens, the review queue, the folder trace/undo, attribution | [agent-safety](./agent-safety.md) | ✅ (SH485) |
| **Block M**: token economy, measured , response budgets, terse mode, the build-a-site benchmark, the instance memory / conventions store `/agent/memory` (SH114, SH160, SH161, SH231), the `AGENTS.md` generator (SH115), conditional agent reads (ETag — SH116, SH159, SH232), the manifest asked for in pieces (SH174) and `format=terse` cutting each endpoint's purpose to its lead sentence (SH230), leaner delivery JSON (SH127), the proof a write returns (SH157, SH227, SH228), teaching refusals that stay readable (SH513), a derived `furl` on create (SH651) and a token ceiling on the change feed (SH723) | [token-economy](./token-economy.md) | ✅ (SH497) |
| **Block N**: the realignment: one **name-keyed** post-type surface (the id-keyed `/api/v2/post/type` twin is gone, SH117), console reads on the CDA shapes, post-type rename as a move (SH163) and `shio push` performing it as a rename rather than a create-and-delete (SH235), a teaching 409 for a post-type content points at (SH236) | [content-modeling § One name-keyed surface](./content-modeling.md#one-name-keyed-surface) · [rest-api § Post types](./rest-api.md#post-types) · [cli](./cli.md) | ✅ (SH495, SH496) |
| **Block N**: the Next.js starter is a blueprint rather than a second mechanism — `shio init --blueprint nextjs-starter` and `create-shio-app` emit from one source (SH119), and a package's carried files declare that they are templates (SH166) | [blueprints](./blueprints.md) · [nextjs-starter](./headless/nextjs-starter.md) · [cli](./cli.md) | 🧩 (SH487, SH488) |

## The curator approves it

| Block / feature | Page | Status |
|---|---|---|
| **Block O**: the content console , the browser and its paged listing, the post form built from the post-type, copy/move with both ends authorized and free names, "select everything" across every page and not just the one on screen (SH237), the trash | [content-console](./content-console.md) | ✅ (SH625) |
| **Block O, closing**: duplicating a section stops being console-only — `folder.copy` names its own copy and may cross sites, and a copy carries its files' bytes rather than pointing at the original's, driven against a running instance rather than asserted from a reading (SH748) | [agent-surface § Writing](./agent-surface.md#writing) · [content-console § Copying a folder copies its files](./content-console.md#copying-a-folder-copies-its-files) | ✅ (SH244, SH749) |
| **Block E**: the React console's own surfaces, dashboard, **Media Library**, static-file manager, webhooks UI, and the `config/` pages (auth providers, exchange providers, email/SMTP, search) | [administration-guide](./administration-guide.md), rewritten against the React console · the Media Library is one screen with the static-file manager and is documented where a curator meets it, [content-console § The Media Library](./content-console.md#the-media-library) | ✅ (SH623) |
| Users, groups, roles, site properties, and **SH54** content-level ACL (folder/post grants, inherited, default-allow) | [administration-guide § Permissions](./administration-guide.md#permissions) | 🧩 |
| **Block C**: the curator's lifecycle tools, **SH13** short-lived preview tokens + console preview, **SH14** draft↔published diff + restore, **SH15** scheduled publish/unpublish, **SH51** audit history + Activity viewer, **SH55** trash / restore (and the two refusals a restore can meet: a URL a live post took, SH243, and a title it took, SH691) | [content-lifecycle](./content-lifecycle.md) · the audit trail at [administration-guide § Activity](./administration-guide.md#activity) and the trash at [content-console § The trash](./content-console.md#the-trash), both linked from it | ✅ (SH624) |
| **Block P / 0**: the Universal Editor: the annotated render, the `sh:*` bridge, the iframe states, the save-back (and the auth it always claimed, SH233) | [universal-editor](./universal-editor.md) | ✅ (SH489) |

## The visible site

| Block / feature | Page | Status |
|---|---|---|
| **Block P**: the renderer, `Page` → `PageLayout` → `Region`, `Theme`, Handlebars templates and helpers, the section vocabulary, `data-shio-*`, `/preview/**` and the `/sites/**` delivery grammar | [website-development](./website-development.md) | ✅ (SH483) |
| **Block P / Q**: the rest of the visible site, DTCG theme tokens, Site Scripts, the `{{#image}}` helper's intrinsic size + signed `srcset`, `Redirect` posts, `Menu`/`MenuItem`, `post.locale` + `{{#translations}}`, the paged/sorted `{{#query}}` | [design-tokens](./design-tokens.md) · [website-development § Themes and design tokens](./website-development.md#themes-and-design-tokens) · [§ Third-party scripts](./website-development.md#third-party-scripts) · [§ Redirects](./website-development.md#redirects) · [§ Menus and translations](./website-development.md#menus-and-translations) · [§ Paging a listing](./website-development.md#paging-a-listing) | ✅ (SH483, SH420) |
| **Block P**: form submissions — `{{#form}}` rendering a post type's fields, the per-site destination (`POST /api/v2/site-form`: folder, invited types, `enabled`), the `FORM` token scope, `POST /api/v2/cda/form/{site}` writing one DRAFT post, the honeypot, and the system-type refusal | [website-development § Forms](./website-development.md#forms) | ✅ (SH633) |
| **Block P**: `{{#query}}`'s pager — `@page`/`@pages`/`@total`/`@hasPrev`/`@hasNext`/`@index`/`@last`, drawing a pager once with `{{#if @last}}`, and a listing nested in a listing keeping its own position | [website-development § Paging a listing](./website-development.md#paging-a-listing) | ✅ (SH420) |
| **Block P**: `verify`'s `dangling-relation`, and the `PageLayout` opt-out from `site-scripts-dropped` | [website-development § Proving it renders](./website-development.md#proving-it-renders) · [§ Third-party scripts](./website-development.md#third-party-scripts) | ✅ (SH421, SH572) |
| **`shio audit`'s rules**: the eleven checks (`overflow`, `contrast`, `zero-size`, `collapsed`, `font-fallback`, `request-failed`, `console-error`, `no-landmark`, `no-heading`, the shape line, `region-script`) and what each means | [cli § What `shio audit` reports](./cli.md#what-shio-audit-reports) — a row per rule with what fires it and what to do, plus the two always-printed lines. `docs-vocabulary` reads `AUDIT_RULES` and fails when a rule this page does not name is added | ✅ (SH652) |
| **Block Q**: replication, `shio clone` (`--assets`, `--render`, `--scripts`, `--refresh`), `shio propose`, `shio convert`, fidelity vs authorable mode, `snapshot --against`, the replication check group | [replication](./replication.md), incl. [§ Re-capturing without paying for it again](./replication.md#re-capturing-without-paying-for-it-again) | ✅ (SH492, SH611) |
| **Block F (SH25 epic)**: static files and image transforms: the `file_source` upload/serve subsystem, `?w=&h=&format=&crop=` on the delivery path, the resize/crop pipeline, webp/avif negotiation, the result cache + ETag, limits and signed URLs | the author's half at [website-development § Static files and images](./website-development.md#static-files-and-images); the operator's half — the result cache and why its key is its own invalidation, the dimension/format/decode-bomb ceilings, and signed transform URLs — at [search-caching § Image transforms](./search-caching.md#image-transforms-the-operators-half) | ✅ (SH629) |

## The CDA delivers it

| Block / feature | Page | Status |
|---|---|---|
| **Block 0 + A**: the CDA read contract `/api/v2/cda/**`, token scopes + per-site keys, per-environment (prod/preview) keys, rate limiting + cache headers, the real GraphQL delivery schema | [content-delivery-api](./headless/content-delivery-api.md) · [graphql](./graphql.md) | ✅ |
| **Block A/B**: `@viglet/shio-client` (framework-agnostic TS core) | [javascript-client](./headless/javascript-client.md) | ✅ |
| **Block B**: `@viglet/shio-react-sdk` (hooks + render components) | [react-sdk](./headless/react-sdk.md) | ✅ |
| **Block B**: `create-shio-app`: the Next.js starter, SSG/ISR/SSR recipes, Draft Mode preview, on-demand revalidation | [nextjs-starter](./headless/nextjs-starter.md) | ✅ |
| **Block B (SH11)**: TypeScript type generation from post-types , `GET /api/v2/cda/post-type`, `generateShioTypes`, the `shio-types` CLI | [content-modeling § Generated TypeScript for a front end](./content-modeling.md#generated-typescript-for-a-front-end) · [cli](./cli.md) | 🧩 (SH496) |
| **Block B (SH62 epic)**: post-types as code , `@viglet/shio-model` DSL, the CLI compile step, `push --check` drift guard, the console "managed by code" lock | [content-modeling § Authoring in TypeScript](./content-modeling.md#authoring-in-typescript) · [§ Managed by code](./content-modeling.md#managed-by-code) | ✅ (SH496) |
| **Block C (SH12)**: outbound webhooks on publish/unpublish/delete, per-site subscriptions, the signed payload | [webhooks](./webhooks.md) — subscription, payload, HMAC verification, and the delivery guarantees (no ordering, no exactly-once, no DLQ) written down as answers rather than omissions | ✅ (SH626) |
| **Block C (SH52 / SH240)**: content full-text search: the in-DB index, the CDA search endpoint, the console search box | [search-caching § Full-text search](./search-caching.md#full-text-search) | ✅ (SH494) |
| **Block C (SH53)**: content i18n , the locale axis, linked translations, CDA `?locale`, the checked locale segment | [content-i18n](./content-i18n.md), with the URL half pointed at from [website-development § Public delivery](./website-development.md#public-delivery) and the modelling half from [content-modeling](./content-modeling.md) | ✅ (SH627) |
| **Block G**: content portability: the exchange package format (SH68), site export → zip, site import / clone, the default bootstrap-site template | [import-export](./import-export.md) (predates SH68's format and SH71's template) | 🧩 |

## Run it

| Block / feature | Page | Status |
|---|---|---|
| Installation, Docker, JAR, source, databases, Linux service | [installation-guide](./installation-guide.md) | ✅ |
| **Block N**: first start without a person at the console — `SHIO_ADMIN_PASSWORD` / `shio.admin.password` setting the `admin` password at startup (SH706), the seeded admin actually carrying `ROLE_ADMIN` so the console stops answering 403 to its own administrator (SH681), and `--server.port=8099` being honoured on the command line instead of silently coming up on 2710 (SH680) | [installation-guide § Setting the admin password without the console](./installation-guide.md#setting-the-admin-password-without-the-console) · [§ Accessing the Shio Console](./installation-guide.md#accessing-the-shio-console) · [configuration-reference § The instance](./configuration-reference.md#the-instance) | ✅ (SH706, SH680) |
| Configuration (`application.properties`) | [configuration-reference](./configuration-reference.md) | ✅ (SH495) |
| **Block F (SH22)**: multi-tenancy / SaaS, `@TenantId` isolation, provisioning, membership, quota, suspension, per-tenant `file_source` storage so two tenants never share bytes for one file id (SH47), a single-tenant install not advertising the tenant admin (SH46), and the per-tenant storage meter behind the plan's byte limit (SH746), moved by the storage layer itself so an upload actually changes it (SH751), plus the API-call meter beside it — a flow rather than a level, so one row per tenant per UTC day per surface, with a ShBillingExporter hook for a closed day (SH45) and the same figures readable by the agent the meter counts, as `shio://usage` and `?include=usage` (SH754) | [multi-tenancy](./multi-tenancy.md) | ✅ (SH493) |
| Turing ES indexing, **opt-in**, reached only on publish | [search-caching § Viglet Turing ES indexing](./search-caching.md#viglet-turing-es-indexing) | ✅ (SH494) |
| Architecture, components, request flow, deployment topologies | [architecture-overview](./architecture-overview.md) | ✅ (SH491) |
| The introduction a newcomer meets first | [intro](./getting-started/intro.md) · [core-concepts](./getting-started/core-concepts.md) | ✅ (SH490) |
| The landing page | [index](./index.mdx) | ✅ (SH480) |
| Developer environment, tech stack, contributing | [developer-guide](./developer-guide.md), rewritten: the six surfaces, the real stack, the build and test commands, and the ten design laws a contribution is judged by | ✅ (SH628 — and the stack table is now checked against this repo's build files by `cli/conformance/docs-stack.conformance.mjs`, so a version that drifts fails a build instead of misleading a reader) |

## Developers (reference)

| Block / feature | Page | Status |
|---|---|---|
| Console REST API, including the refusal a site create meets when it declares a `furl` a live site already answers at — kept as given rather than numbered, so the link the caller is about to send still resolves (SH744) | [rest-api](./rest-api.md) | ✅ (SH495) |
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
| **The lints and invariant guards**: SH245 (one writer per content verb), SH26 (cross-DB schema drift), SH122 (`@TenantId` JOINED-join), SH128 (`ShFolderSite`), SH136 (byte stability), SH158, SH197, SH403, SH408–SH412, SH435 (help/flags), SH458, plus `ShIdeCompiledClassLintTest`, `ShAgentP1ConformanceTest`, `ShStatelessReachabilityLintTest` | Build-time instruments. They change what a *contributor* may write, not what a user can do; `agents.md` and `docs/agents/**` are their home |
| **The benchmarks and suite health**: SH112 (task benchmark), SH113 (response budgets, as a *test*), SH164, SH198, SH239, SH246, SH440/SH445 (CLI exit paths), SH444 (root devDependencies), and Block M's measurement half — SH229 (a lint over every conditional endpoint's params), SH394 (the CLI help's three ceilings), SH396 (the build-a-site benchmark ends at a rendered page), SH597/SH683 (discovery cost scored per intent, then re-measured), SH647 (the vocabulary's cost split into keys and prose), SH673 (one constant, followed rather than copied), SH736/SH743 (a gate at its ceiling refuses instead of measuring, so both now assert headroom) | Internal measurement and CI hygiene. The *user-facing* half of the token work is the Block M row above, which is an orphan |
| **Block V**, the vocabulary proved against a running instance: SH707 (the count first — which of the agent's verbs any live suite had ever called, and it was two of twelve), SH708 and SH709 (the read and write tools driven over the wire), SH711 (ten CLI verbs spawned as processes, which is the only shape that exercises argv parsing and the exit code CI reads), SH712 (the vocabulary out of order, plus a seeded permutation), SH713/SH719/SH720 (two agents and a curator writing at once, and the unique index that makes one address mean one post), SH714/SH722/SH723 (what every tool costs live, and whether it answers twice the same), SH724/SH725/SH726/SH717/SH718 (the fixtures and refusals those runs corrected), SH748 (`folder.copy` driven live rather than asserted from a reading), SH755 (the declared red compared against what the gates actually reported), SH756, SH757, SH759, SH760 (the coverage matrix could not ask about MCP resources at all, so it reported full coverage of three populations while a fourth sat at zero) and SH761 (the API-call meter counted nothing on every default install, which only a live run could say) and SH762 (a race test that looped for a duplicate SH719 had made unreachable, so it discarded the contention it found on the first attempt and asserted against the last) | A test tier. Every row above documents what a reader can do; this block documents whether the product really does it when a real instance is asked, which changes nothing a reader types. It earns a row rather than a silence because an absent row is indistinguishable from a forgotten one — the defect this matrix exists to make visible — and it is the largest block ever closed here with no public surface at all |
| **`cli/conformance/`** (SH448) and the `shio-replication-test` judging skill | A maintainer harness for judging a replication run against a live instance; the user-facing verbs it drives are the CLI + replication rows above |
| **Block N's internal halves**: SH120 (console reads adopt CDA shapes), SH162 (SDK type mirror), SH165 (paged listing), SH167/SH234 (CSRF narrowing), SH177 (`schemaJson` retired) | Behaviour-preserving realignments; where one is observable it is folded into the rows above |
| **Block N's second half**, the instruments and repo hygiene it closed on: SH541 (one licence across 195 files), SH645 (`pnpm test` keeps its log), SH649 (`reserved_ids`), SH655 (docs instruments in CI), SH656/SH657/SH660/SH666 (a lint landing before its fixes, four times), SH662/SH668 (ledger and rationale readers), SH664/SH667 (the editor drive, and `--strict` so a skip is a failure), SH665 (the console lint loads again) | Build-time instruments and repository hygiene, the same verdict as the lints row above: they change what a *contributor* may write. Two had a user-visible edge and it is recorded rather than assumed — SH541's licence is the `Apache 2.0` pill on [index](./index.mdx) and is now derived from `package.json` + `LICENSE` by `docs-stack` (SH669), and SH660's widget fix restores what [content-console](./content-console.md) already describes |
| **Block N's third wave**, where the thing that was wrong was an *instrument* rather than a feature: SH238 (the Universal Editor's one load-bearing fact checked in a real browser), SH659 (the docs drive publishes), SH663 (the property extractor reads Markdown tables), SH672 (a floor is classified by what it counts, so an absolute one over a corpus meant to empty is refused), SH735 (a red `pnpm test` log survives the green re-run), SH729 (a constraint declared only in Liquibase is invisible to a suite that runs with Liquibase off), SH731 (citing a task id in an assertion message no longer pays that task's debt — a reference is spelled `see SHnnn`), SH737 (a vacuity floor pinned near the count it watches, asserted as the yes/no it is), SH738 (the floor classifier could not see the Java half of the repository, which is where the floor it exists to refuse actually lived), SH739 (the block-completion checklist called the README's counts underived when a suite has derived them since SH499, and sent a sweep off to rebuild it), SH740 (SH613's code-vs-prose rule stopped at the language boundary — the JS scans now declare what they read, against one shared stripper), SH741 (the tolerated-floor list was the sixth ledger of knowingly-accepted wrongness and had never joined the registry that asserts their count, so it carried none of the staleness checks the other five get), SH742 (that declaration lint found its own population by naming convention and so could not see the three readers that scan these very pages), SH745 (the ledger and the suite can disagree in two directions and only one was read — the unread one had hidden a shipped, tested task on the backlog for blocks), SH753 (a resolver that threw on a duplicate row is deleted rather than documented, so the compiler enforces the one that tolerates — and the duplication it used to crash on is reported at boot instead of resolved in silence), SH755 (the red-suite ledger is a CLAIM and nothing compared it to what the gates answered: each gate now leaves a stamp, and both directions of disagreement fail — a red with no entry, and an entry whose gate went green), SH756 (an I/O failure carries its exception class and the platform's reason, because a FileSystemException's message is its two paths and the class was the last remaining fact), SH757 (two conformance tests were still pinning defects that had shipped, so the gate was red for the repairs rather than for the damage) | Build-time instruments and their own correctness, the same verdict as the lints row above. Worth naming rather than folding in: every one of these was a case where a *check* was quietly wrong instead of loudly broken, which is the failure shape that leaves a green build meaning nothing. None changes what a user can do. SH739 is the one with a reader-facing edge and it points inward too — the document it corrects is `.claude/skills/`, read by an agent maintaining Shio rather than by anyone using it |
| **Block Q's capture internals**: `scanPage` block detection, token collision, CSS lifting, asset classification (SH424–SH432, SH449, SH452, SH455–SH456, SH461, SH465–SH477) | Fidelity mechanics of `clone`/`convert`. The user-facing surface is the three verbs and the two modes, documented as one row |
| **Block P's engine internals**: the template graph, the render cache, the section registry | Renderer architecture (`docs/agents/renderer.md`); the authorable vocabulary is the user-facing half |
| **Block R**: this documentation round: the coverage gate (SH479), the four sidebar hubs (SH482), the pages the rest of the block files into them, and the two instruments that execute their examples (SH499) | Meta: it produced the pages in this very matrix. The hubs are navigation, so they change no verdict below; they are where a 🔴 becomes a page. SH499 closed the block by making these pages *checkable*: `cli/conformance/docs-vocabulary.conformance.mjs` holds every `shio` verb, REST path, `shio_*` tool and `shio.*` key written here against what the product declares, and `docs-examples.conformance.mjs` issues the read-only requests against a running instance — so a renamed verb or a moved endpoint fails a Shio build instead of misleading a reader here |
| **Blocks T and U**, the documentation's own instruments and upkeep: SH674 (the extractor's fence regex had stopped matching, so the pages published unchecked), SH697 (the tool table read on SH663's narrow rule, with the stated count derived), SH698 (a conformance teardown that names the server, the deadline and the open sockets instead of hanging), SH700 (the gate reads the docs repo at origin, not a local working copy), SH715 (the redirect plugin, so a moved hub does not break a published link), SH747 (a ratchet: the count of shipped ids this matrix does not name may fall and may not rise), SH752 (a block heading standing over no open task fails the run, so a block that empties is closed rather than left as a heading nobody removes), SH758 (this matrix lives in another repository from the ships it tracks, so a mirror of the ids it names is generated into the Shio tree and the gate there reports, minutes after a ship, what has not been named yet — the ratchet stays the enforcement and only the moment of discovery moves), SH759 (a window closing is a fact about time, so the session guard takes a Clock and its test moves an hour rather than setting the window to a nanosecond and hoping the machine's clock ticked between two adjacent reads) | Instruments over this very matrix and the pages around it. They change what a *contributor* may publish, not what a reader can do — the pages themselves are the rows above |
| **Block S**: the public site at [shio.viglet.org](https://shio.viglet.org/) (SH530 and the Block S backlog), its `shio-site/` app, prerender and Pages deploy | Marketing, and it is the *entrance* to this documentation rather than part of it. Every claim it makes is a page here or in `docs/agents/**`, so a row of its own would duplicate a verdict already recorded above; what it owes those pages is a correct link, not coverage |

---

## Orphans

**Of 52 clusters, none is undocumented: no 🔴 orphan and no ⚠️ page.** 52 are covered (46 ✅, 6 🧩).

> **This sentence is derived, and a check fails when it drifts (SH653).** Every figure in it used
> to be typed, and it drifted in the direction that hides work: the `shio audit` row was 🔴 in the
> tables from the day this file shipped and absent from this count for just as long, so the one
> number anybody scans said the product was better documented than it was. **A cluster is one table
> row** — the unit that already carries its own verdict. The alternative, one row per block label,
> comes to 33 and would need an aggregation rule nobody has written, since `Block H` spans five rows
> and `Block K` two with different verdicts. Neither reproduced the 42 this summary used to claim.
> `cli/conformance/docs-coverage.conformance.mjs` recomputes it from the tables above and prints the
> sentence to write when the two disagree.

> **Block T is the block that closes these.** It exists because the list below is what Block R's own audit found and no Block R task named — the curator's half. Each task in it flips exactly one row, and this count moves with it.

Block R took this from **33 wrong of 40** to **7**. What is left is what the block's own tasks never named, which is the finding the matrix existed to produce:

- **0 🔴**, none now live: ~~the content console itself (Block O)~~ — closed by **SH625**, [content-console](./content-console.md) · ~~the console's own curator surfaces (Block E: dashboard, Media Library, static-file manager, webhooks UI, the `config/` pages)~~ — closed by **SH623**, which rewrote [administration-guide](./administration-guide.md) against the React console · ~~the curator's lifecycle tools (SH13–SH15, SH51, SH55: preview tokens, version diff and restore, scheduled publish, the activity view)~~ — closed by **SH624**, [content-lifecycle](./content-lifecycle.md) · ~~outbound webhooks (SH12)~~ — closed by **SH626**, [webhooks](./webhooks.md) · ~~content i18n (SH53)~~ — closed by **SH627**, [content-i18n](./content-i18n.md) · ~~`shio audit`'s eleven rules, which the table listed as an orphan since this file shipped and this summary did not count~~ — closed by **SH652**, [cli § What `shio audit` reports](./cli.md#what-shio-audit-reports), which landed the instrument with the prose: `docs-vocabulary` reads `AUDIT_RULES` and fails on a rule this page does not name, which is the direction none of the other checks ask.
- **0 ⚠️**: ~~the developer guide still lists Elasticsearch 9.3.3 in its stack and names no agent surface or CLI~~ — closed by **SH628**, which rewrote it and landed the instrument first: `cli/conformance/docs-stack.conformance.mjs` derives every stated Java / Spring Boot / Node / pnpm version from this repo's build files and refuses a retired dependency presented as part of the stack.
- ~~**Also unclosed**: the transform cache, the dimension and format limits and the signed-URL configuration are the operational half of the SH25 image epic, folded into the render page but not documented as operations.~~ — closed by **SH629**. This entry is why the block exists in the shape it does: the row scored 🧩 rather than 🔴, and a partially-covered row does not read as an orphan in a scan.

Every item above is worth a task. Four of them are curator-facing, which is the half this block reached last: the agent's surface is now the best-documented part of the product and the console is the least.

This file lands **red on purpose**: it is the audit that scopes Block R, and the count above is the number the block is measured by. When a new block ships, add its row here, and if it is user-facing without a page, that 🔴 is a defect to fix before the block is considered done.

---

## Block R is complete, and what it left

Block R's last task shipped on 2026-08-09 and the block is withdrawn from Shio's roadmap. It ends at **6 wrong of 40**, from 33 — and the six are the finding, not the remainder of the work: every one is a cluster no Block R task ever named, which is why they survived a block that fixed twenty-seven others. They are now filed as Shio tasks of their own rather than left in this file's prose, because a gap recorded only in an audit is one nobody is assigned.

One thing changed about *how* these pages are maintained, and it is the reason the block could be called done. Until SH499 nothing here was ever executed, which is precisely how the pre-2026.3 pages came to describe a product that had moved: written once, never compared. Two instruments now compare them on every Shio conformance run — the **names** (verbs, routes, tool names, configuration keys, read from the product's own declarations) and the **requests** (the read-only invocations, issued against a live instance). A count comes with them: **57 executable blocks over 18 pages, 65 assertable subjects**.

So the rule for the next round is stronger than "add a row". A page that publishes a command, an endpoint or a configuration key is now making a claim a build can falsify. Write the example so it can be run.
