# docs-turing Coverage Matrix

> **Purpose.** Every shipped block / feature cluster in the Turing
> [`CHANGELOG.md`](https://github.com/openviglet/turing/blob/main/docs/CHANGELOG.md)
> maps here to **either** a documentation page (with anchor) **or** an explicit
> "deliberately internal — no public page" row. A shipped user-facing subsystem
> with no page is an **orphan** (🔴) and a bug in the docs. This file is the
> gate authored by Block AE T538; keep it in sync when a new block ships.
>
> **Legend:** ✅ documented · 🧩 folded into a broader page · 🔒 deliberately
> internal (engineering / repo / marketing — no end-user page by design) ·
> 🔴 orphan (missing — fix it).

_Not rendered in the sidebar; this is a maintenance artifact._

---

## Search it

| Block / feature | Page | Status |
|---|---|---|
| Search engine (Solr / ES / Lucene), cores | [search-engine](./search-engine.md) | ✅ |
| Semantic Navigation sites, facets, spotlights, targeting | [semantic-navigation](./semantic-navigation.md) | ✅ |
| **Block R** — field manifest, schema-as-code, derivation, hybrid ranking, field coverage | [manifest](./manifest.md) | ✅ |
| DSL Query API + compatibility matrix | [dsl-query](./dsl-query.md) · [dsl-compatibility](./dsl-compatibility.md) | ✅ |
| SPA / search-template pages | [spa-pages](./spa-pages.md) | ✅ |
| Connectors (AEM, web crawler) | [integration](./integration.md) · [integration-aem](./integration-aem.md) | ✅ |
| Import / export | [import-export](./import-export.md) | ✅ |

## Ask it

| Block / feature | Page | Status |
|---|---|---|
| RAG pipeline | [rag](./rag.md) | ✅ |
| **Block M** — verifiable answers, native citations, citation-drift | [rag § Provenance & citations](./rag.md#provenance--citations) | 🧩 |
| **Block AD** RAG bridges — managed backends, lanes, fallback, guardrail, second-opinion | [rag § Advanced RAG](./rag.md#advanced-rag-capabilities) | 🧩 |
| **Block N** + T521 — pluggable & managed rerankers | [reranking](./reranking.md) | ✅ |
| **Block AD** embeddings — Voyage/Cohere/Mistral, multimodal, contextual, Matryoshka, OCR | [embedding-models](./embedding-models.md) · [embedding-stores](./embedding-stores.md) | ✅ |
| Chat interface | [chat](./chat.md) | ✅ |
| **E.6 / F.8** — chat memory, compaction, context editing | [chat-memory](./chat-memory.md) | ✅ |
| Intents / conversation starters | [intent](./intent.md) | ✅ |
| **Block AA** — speaker + audience personas, content-fit, persona-from-audio, persona-suggest | [personas § Audience Personas & Content-Fit](./personas.md#audience-personas--content-fit), [§ Suggest the best-fit persona](./personas.md#suggest-the-best-fit-persona-for-content) | ✅ |
| **Block AI / AG** — persona as an actionable surface (persona chat, bento dashboard + launchpad, content-fit launch action, persona dialogue, suggest persona; T619 re-added from-audio + suggest to bento) | [personas § Act on a Persona](./personas.md#act-on-a-persona-chat-validate-dialogue) | ✅ |

## Automate it

| Block / feature | Page | Status |
|---|---|---|
| AI Agents | [ai-agents](./ai-agents.md) | ✅ |
| **Block AK** — Live Preview prompt diagnostics (flow-aware persona, token/cost metrics, inert-this-turn, cross-segment lint, node picker, replay a real conversation, verbatim capture of any past turn) | [ai-agents § Live Preview & prompt diagnostics](./ai-agents.md#live-preview--prompt-diagnostics) | 🧩 |
| Tool calling (native + provider-native) | [tool-calling](./tool-calling.md) | ✅ |
| **Block F.15** — capability registry + two-level gate | [capabilities](./capabilities.md) | ✅ |
| **Block W** (AG-UI) — live tool activity, client tools, generative UI | [client-tools](./client-tools.md) | ✅ |
| **Block X** — answer-as-app, co-browse, glass-box, proactive, handoff, skill UIs, action widget | [showcase](./showcase.md#creative-compositions) (opt-in features, demoed) | 🧩 |
| Custom (Groovy) tools | [custom-tools](./custom-tools.md) | ✅ |
| **Block I** — MCP client + server | [mcp-servers](./mcp-servers.md) | ✅ |
| **E.3** — skills (Anthropic folders, sandbox) | [skills](./skills.md) | ✅ |
| **E.2** — agent workspace | [agent-workspace](./agent-workspace.md) | ✅ |
| **D.3** — slots, chat-flow | [chat-flow](./chat-flow.md) | ✅ |
| **E.4** — human-in-the-loop | [human-in-the-loop](./human-in-the-loop.md) | ✅ |
| Webhooks | [webhooks](./webhooks.md) | ✅ |
| Routines (scheduled agents) | [routines](./routines.md) | ✅ |
| **D.4** — A/B experiments | [experiments](./experiments.md) | ✅ |
| **Block K** — agent eval / golden sets | [agent-eval](./agent-eval.md) | ✅ |
| **Block AJ** — eval platform: pluggable graders (code/model/human) + datasets + grader stacks + versioning + Eval Studio + calibration/inter-annotator agreement + public eval API/CLI/SDK CI gate (`POST /api/eval/run`, `turing eval --dataset`, `runEval`) | [agent-eval](./agent-eval.md), [cli](./cli.md#turing-eval---dataset-idname---stack-idname---min-score-n) | 🧩 |

## Run it

| Block / feature | Page | Status |
|---|---|---|
| Installation | [installation-guide](./installation-guide.md) | ✅ |
| Configuration (`application.yaml`) | [configuration-reference](./configuration-reference.md) | ✅ |
| **Block F / F.16** — GenAI overview + Gemini native primitives | [genai-llm](./genai-llm.md) | ✅ |
| **Block AD** — 11 vendor types, per-vendor auth | [llm-instances](./llm-instances.md) | ✅ |
| Knowledge Base / Assets, pluggable storage | [assets](./assets.md) | ✅ |
| **Block J** — multi-tenancy | [multi-tenancy](./multi-tenancy.md) | ✅ |
| Administration (users, roles, tokens, settings) | [administration-guide](./administration-guide.md) | ✅ |
| Observability, logging | [observability](./observability.md) · [logging](./logging.md) | ✅ |
| **D.6** — chat analytics (sentiment, tool latency, SSE) | [chat-analytics](./chat-analytics.md) | ✅ |
| **Block L** — token usage + cost governance | [token-usage](./token-usage.md) · [cost-governance](./cost-governance.md) | ✅ |

## Developers

| Block / feature | Page | Status |
|---|---|---|
| Dev environment, contributing | [developer-guide](./developer-guide.md) | ✅ |
| **Block S** — React SDK (hooks + headless UI) | [react-sdk](./react-sdk.md) | ✅ |
| **Block S** — vanilla `@viglet/turing-sdk` (zero-dep, EDS) | [javascript-sdk](./javascript-sdk.md) | ✅ (T539) |
| **E.7** — `@viglet/turing-cli` (`turing` command) | [cli](./cli.md) | ✅ (T539, was 🧩 folded into developer-guide) |
| **`@viglet/turing-flow-dsl`** — flows-as-typed-TS | [flow-dsl](./flow-dsl.md) | ✅ (T539) |
| **Block Y** — Atlas Store reference showcase | [showcase](./showcase.md) | ✅ |
| **Block Z** — client-side conversion analytics / GA4 bridge | [conversion-analytics](./conversion-analytics.md) | ✅ |
| REST API + GraphQL | [rest-api](./rest-api.md) · [graphql](./graphql.md) | ✅ |

## Security

| Block / feature | Page | Status |
|---|---|---|
| API key + session auth | [security-authentication](./security-authentication.md) | ✅ |
| Social login | [security-social-login](./security-social-login.md) | ✅ |
| Keycloak OAuth2 / OIDC SSO | [security-keycloak](./security-keycloak.md) | ✅ |

---

## Deliberately internal — no public page (not orphans)

These shipped blocks are engineering, repository, or marketing concerns with no end-user documentation surface. Listed so they're accounted for, not silently missing.

| Block | Why no page |
|---|---|
| **A, B, C** — test scaffolding, harness inversion, post-refactor capabilities | Internal engineering (chat-flow engine internals) |
| **D.1/D.2/D.5/D.7/D.8/D.11**, **E.1/E.5/E.8/E.9**, **H.1/H.2** | Internal engine/DX/SDK-migration work; user-facing slices surface on the pages above |
| **Block P** — open-core source split (`turing` → `turing-ce`) | Repository/licensing change; not a product feature |
| **Block Q** — `viglet-core` shared backend platform | Cross-product internal library (separate repo); no Turing-user surface |
| **Multi-tenancy parity (`viglet-core-tenancy`)** | Internal shared-library lift; the Turing-facing feature is [multi-tenancy](./multi-tenancy.md) |
| **Block AC** — JPA caching strategy | Internal architecture (documented in `agents.md`) |
| **Block O** — GEO / LLM discoverability | Marketing-site + `llms.txt` concern (`turing.viglet.org`), not the product docs |
| **Block AB** — public site & top-of-funnel | Marketing site (`turing.viglet.org`), separate app |
| **Block AE** — this documentation round | Meta — produced the pages in this very matrix |
| **Block AG** — Bento admin UI redesign + console retirement | UI/design change (frosted-glass admin reskin); no new capability, config, or API — the admin surfaces work the same, only re-skinned. Admin URLs moved `/admin/*` → `/bento/*` with transparent redirects, so bookmarks/deep-links still resolve. Doc screenshots refreshed opportunistically, not gated here |
| **Block AL** — prompt-assembly pipeline (`TurPromptContributor` SPI, single-pass assembler, STABLE-first cache ordering) | Internal architecture — the assembled prompt is byte-identical to before; the observable change is a more faithful admin Live Preview (a fix) plus opt-in `turing.prompt.assembly.*` cache knobs not yet wired to provider caching |

---

## Orphans

**None.** Every shipped user-facing subsystem resolves to a page above. If a new block ships without a row here, add it — and if it's user-facing without a page, that's a 🔴 to fix before the block is considered done.
