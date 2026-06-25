# Turing ES — Documentation Update Plan (docs-turing)

> **Working/planning artifact — not a published page.** The leading `_` keeps
> Docusaurus from including this file in the build or sidebar. It is the
> companion to **Block U** in the Turing
> [`docs/ROADMAP.md`](https://github.com/openviglet/turing) (tasks **T411–T423**).
> Delete or archive it once Block U is fully shipped.
>
> **Date:** 2026-06-25 · **Scope:** bring `docs-turing` up to parity with what
> shipped through **T410**. · **Source of truth for what shipped:**
> `turing/docs/CHANGELOG.md`.

---

## 1. Why this plan exists

`docs-turing` has **44 pages**, but the most recent feature coverage stops around
the **2026-03 → 2026-06** window while the product shipped heavily after that.
Whole subsystems that operators and developers now rely on have **no page at
all**, and two of the busiest pages (`chat-flow.md`, `chat-analytics.md`)
document an early slice of features and have drifted stale.

The goal of this round is **coverage, not polish**: every shipped, user-facing
capability should have a home a reader can find from the sidebar. We keep the
existing house style — friendly, fluid, example-led prose with a short concept
intro, a "how to use it" walkthrough, a config/REST reference, and a
troubleshooting/"how to read it" closer (the shape `chat-analytics.md` and
`skills.md` already use well).

### House style checklist (apply to every page below)

- Open with **what it is + when you'd reach for it** (2–4 sentences, no jargon dump).
- One **end-to-end walkthrough** with a realistic scenario (a lead-capture flow, a
  CRM webhook, a cost spike investigation) before the reference tables.
- **Admin/operator first, developer second.** Put the console walkthrough above the
  REST/API reference.
- Tables for **fields, endpoints, config keys**; prose for concepts.
- A **"Related pages"** footer cross-linking siblings.
- Mermaid diagrams where a flow/architecture is easier shown than told (match the
  existing diagrams in `architecture-overview.md` / `chat-flow.md`).
- Keep product naming **Viglet Turing ES**.

---

## 2. Current state → target (gap summary)

| Feature cluster | Shipped (tasks) | Today in docs-turing | Action | Roadmap task |
|---|---|---|---|---|
| **Webhooks** (chat webhooks + HMAC signing) | T62, T378 | none (1 stray sentence in `chat-flow.md`) | **New page** `webhooks.md` | **T411** |
| **Routines / scheduled agents** | T48 (+ `TurRoutine`) | none | **New page** `routines.md` | **T412** |
| **Cost governance** (price table, cost dashboard, budget gate) | T289–T291 | none | **New page** `cost-governance.md` | **T413** |
| **Chat analytics** (funnel, replay, sentiment trajectory, tool-latency p95, router decisions, SSE debug) | T84–T91 | `chat-analytics.md` covers ~4 of 9 metrics, none of T85–T91 | **Major rewrite/expand** | **T414** |
| **Chat flow** (full node catalog, error edges, slots, trigger conflicts) | T42–T64, T91–T92, T108-x, T119, T121 | `chat-flow.md` covers 5 of ~15 node types | **Major rewrite/expand** | **T415** |
| **A/B experiments** (significance, bandit, champion-challenger, cohorts) | T67–T75 | none | **New page** `experiments.md` (split from chat-flow) | **T416** |
| **Human-in-the-loop** (approval node, spectator, co-pilot) | T119, T120 | none | **New page** `human-in-the-loop.md` | **T417** |
| **Turing as an MCP Server** | Block I (T245–T256) | `mcp-servers.md` covers only the *client* side | **Expand** (add "Turing as an MCP Server" section) | **T418** |
| **Agent eval / CI** (golden sets, judge, pre-publish gate) | T285–T288 (Block K) | none | **New page** `agent-eval.md` | **T419** |
| **Code Interpreter hardening** (NATIVE vs DOCKER, limits, warm pool, structured output) + multimodal slots | T80–T83, T64 | `tool-calling.md` covers the base only | **Expand** | **T420** |
| **AI Agent settings extras** (submission retention, capability matrix, OpenAI Responses native tools, budget fields) | T66, T130–T138, T132, T291 | `ai-agents.md` partial | **Expand + cross-link** | **T421** |
| **Configuration reference** (new Global Settings + config keys) | Block L, T328–T341, T85/T237 | `configuration-reference.md` stale | **Expand** | **T422** |
| **Token usage ↔ cost + observability metrics** | T84, T289, T290 | `token-usage.md` / `observability.md` partial | **Reconcile + expand** | **T423** |

> **Confidence note.** Class/endpoint/route names below were verified against the
> live source tree (`turing-app` + `frontend/apps/turing-app`). Task IDs are from
> the authoritative `docs/ROADMAP.md` + `docs/CHANGELOG.md`.

---

## 3. Per-page plans

### 3.1 `webhooks.md` — **NEW** (T411)

**Audience:** integrators wiring Turing chat to CRMs / automation tools.
**Sidebar:** Generative AI category, after `chat-flow`.

**Sources:**
- Entity `TurChatWebhook` (`tur_chat_webhook`, Liquibase `v2026.3.1.13`; HMAC cols `v2026.3.1.36`).
- API `TurChatWebhookAPI` → `GET/POST/PUT/DELETE /api/genai/webhook`.
- Runtime `TurChatWebhookService` (dispatch + retry + template), `TurChatWebhookDispatcher` (slot-write edge detection), `TurChatWebhookNodeExecutor` (flow node).
- Shared signing: `viglet-core-webhook` (`VigletWebhookSigner` HMAC-SHA256, `VigletWebhookDispatcher` retry/back-off — T378).
- Admin pages under `frontend/.../app/console/webhook/`.

**Outline:**
1. What webhooks are in Turing & the two trigger modes — **slot-write subscription** (auto-fire on a matched slot, wildcard `*`) vs **handoff channel** (`POST /chat/handoff`, `channel=WEBHOOK`) vs the deterministic **`webhook` flow node**.
2. Walkthrough: create a webhook in the console (target URL, method, slot trigger, `includeSlots` whitelist, custom headers, payload template with `{{slot}}` placeholders).
3. Payload envelope reference: `event` (`handoff`/`slot_write`/`flow_node`), `conversationId`, `slots`, optional `transcript`.
4. Security: encrypted `authHeader`, **HMAC signing** (`signingSecret` + `signatureHeader`, default `X-Turing-Signature`, `sha256=<hex>`), how to verify a signature on the receiver.
5. Reliability: 3 attempts, ~2s linear back-off (handoff surfaces failure; slot-write swallows + logs).
6. REST reference + multi-tenancy note (`tenantId`-scoped).
7. Worked examples: Salesforce/HubSpot lead creation; Make/Zapier inbound.

### 3.2 `routines.md` — **NEW** (T412)

**Audience:** flow authors building async/long-running steps.
**Sidebar:** Generative AI category, after `webhooks`.

**Sources:**
- Entity `TurRoutine` (`tur_routine`, Liquibase `v2026.3.1.6`), `TurRoutineKind` (`NATIVE` | `GROOVY`-reserved).
- API `TurRoutineAPI` → `GET/POST/PUT/DELETE /api/genai/routine`.
- Runtime `genai/flow/routine/TurRoutineQueue` (JMS `tur.routine.queue`, `turing.jms.routine.concurrency`), `TurScheduleAgentMessage`.
- Flow node `scheduleAgent` (`ChatFlowNode`), `continueOnFailure`/failure edge (T49/T50).
- Frontend pages under `frontend/.../app/console/routine/`; SSE pending-state hook on the SDK.

**Outline:**
1. What a routine is (a named, reusable async task wrapping a native tool) and how it differs from a synchronous `functionCall`.
2. Create a routine in the console (kind = NATIVE, pick the native tool, default timeout).
3. The `scheduleAgent` flow node: input JSON, `outputVariable` (slot) capture, per-node timeout override, failure routing (`continueOnFailure`).
4. The async lifecycle: enqueue → JMS worker → write result to slot → slot-bus resume; the `__scheduleAgent_pending_` SSE flag and how the SDK renders "working…".
5. Scaling/ops: queue concurrency, tenant propagation on the consumer thread.
6. REST reference. (Mention the reserved GROOVY kind as forthcoming.)

### 3.3 `cost-governance.md` — **NEW** (T413)

**Audience:** operators/owners controlling AI spend.
**Sidebar:** Generative AI category, after `token-usage` (they pair).

**Sources:**
- `TurLLMPrice` (`tur_llm_price`, seeded OpenAI/Anthropic/Gemini, `v2026.3.1.40`), `TurLLMPriceService.computeCost`.
- `TurLLMTokenUsageService.recordUsage` (frozen `cost_usd` + `agent_id` + `stage`).
- API `TurLLMCostAPI` → `/api/v2/llm/cost/summary`, `/timeseries`; `TurLLMPriceAPI` → `/api/v2/llm/price`.
- `TurChatCostBudgetGate` (`monthlyBudgetUsd`, `perTurnSoftCapUsd`, `budgetDowngradeLlmId`, `v2026.3.1.41`).
- Console page `/console/cost-governance`.

**Outline:**
1. How cost is captured (input/output tokens × price table, frozen per turn; `$0` for local/embedded). Cost **stages**: `chat.live`, `chat.background`, `chat.skill`.
2. The price table: editing rates from a vendor invoice.
3. The Cost Governance dashboard: date range, summary cards, daily-spend chart, by-agent/model/stage breakdowns.
4. **Soft budget gate** per agent: monthly cap → downgrade to a cheaper LLM (or warn), per-turn soft cap warnings. "Soft by construction — never aborts a turn."
5. Operator runbook: "cost spiked — investigate by agent/model/stage."
6. REST reference; relationship to `token-usage.md` (counts) and the F.13 vendor-Usage import.

### 3.4 `chat-analytics.md` — **MAJOR EXPAND** (T414)

Keep the existing architecture/recording/enricher sections. Add:
- **Fix the metric list** to all **9** timeseries metrics (today lists ~5; missing `tool_calls_per_session`, `tool_errors_per_session`, `avg_tool_latency_ms`, `tool_error_rate_pct`).
- **Funnel (T85)** — node drop-off; path-aware variant + node-visit-log flag.
- **Conversation replay (T86)** — timeline interleaving chat-memory + slot-audit (T60); playback scrubber.
- **Sentiment trajectory (T87)** — per-turn line chart; "where the conversation soured."
- **Tool latency p95 (T88)** — `/tool-latency`, percentiles, top offenders.
- **Router decision logs (T89)** — `/router-decisions`, candidates/score/winner/method; per-node caveat (in-memory ring).
- **SSE channel debug (T90)** — `/slot-sse-channels`, refcounts, leak detection.
- **Cohort filters (T74)** on the scorecard (device/locale/timezone/experiment/variant).
- Cross-link `experiments.md` for the A/B significance/promote endpoints.

### 3.5 `chat-flow.md` — **MAJOR EXPAND** (T415)

Keep the 5 core node types; add a **full node-type catalog** and modern features:
- New node types: `writeSlot` (T42), `formCapture` + CPF/CNPJ/email/phone/CEP validation (T43/T44), `functionCall` (T46), `subFlowSwitch` (T47), `scheduleAgent` (T48 → link `routines.md`), `webhook` (T62 → link `webhooks.md`), `humanApproval` (T119 → link `human-in-the-loop.md`), `suspend` (T121), and the planning primitives `planningStep`/`iteratePlan` (E.1) **if present in the shipped DSL — verify before documenting**.
- Error handling: `continueOnFailure` (T49) + `onError`/failure edges (T50).
- Advanced question behavior: capture-first inversion (T51), `onJudgeReject` policy `advance_with_literal`/`reprompt`/`block` (T45).
- **Slots primer** (or its own section): SSE updates (T54) + delta SSE (T63), audit log (T60), `pii_*` prefix (T61), multimodal `IMAGE`/`AUDIO`/`FILE` slots (T64), slot-extract (T58), `GET /chat/state` (T57), OG card (T56).
- Editor DX: trigger-conflict resolver (T91, `GET /chat-flow/trigger-conflicts`), flow chooser (T92, deep-link `?flow=`), live preview.
- Update the node-type Mermaid diagram to the modern set.
- Move the A/B material **out** to `experiments.md` (leave a one-paragraph pointer).

### 3.6 `experiments.md` — **NEW** (T416)

Split A/B testing into its own page (it's a full subsystem, T67–T75, and reads as analytics-adjacent rather than authoring):
- Concepts: `experimentKey`, `variantLabel`, `trafficWeight`, experiment window; deterministic sticky assignment (T67).
- Significance: two-proportion z-test + Wald CI, `/experiment/{key}/significance` (T68).
- Multi-armed bandit (Thompson sampling), `banditEnabled` (T70).
- Champion-challenger auto-promotion, `/experiment/{key}/promote` (T71).
- Per-node A/B (T72); forced variant `?_ab_variant=` (T73); cohort filters (T74); variant trace logging (T75).
- Scorecard dimensions (agent/persona/experiment/variant) — cross-link `chat-analytics.md`.

### 3.7 `human-in-the-loop.md` — **NEW** (T417)

- Use cases: compliance approvals, escalation gates, live intervention.
- `humanApproval` node (T119): channels (email/Slack/webhook), timeout behavior (auto-reject/auto-approve), decision/resume token, parked state.
- Spectator + co-pilot mode (T120): the 3 SSE buses (message/slots/workspace), "take the wheel" manual turn.
- Parked-conversations dashboard; the timeout sweep job.
- Cross-link `chat-flow.md` (the node) and `webhooks.md` (notification channel).

### 3.8 `mcp-servers.md` — **EXPAND** (T418)

Add a top-level **"Turing as an MCP Server"** section (Block I, T245–T256) alongside the existing client coverage — or split into a sibling `mcp-server.md` if it grows large:
- `/mcp` Streamable-HTTP endpoint + loopback-first trust boundary; OAuth 2.1 + scope-based tool filtering.
- Published tools (search/list/RAG/agent-invocation/analytics), resources, prompts; read vs gated-write tools.
- One-click client config (Claude Desktop / Claude Code / OpenAI Responses).
- **Verify exact task→feature mapping in CHANGELOG/IMPROVEMENTS §XIII before writing** (Block I shipped T245–T255; T254/T256 are still backlog).

### 3.9 `agent-eval.md` — **NEW** (T419)

Block K (T285–T288):
- Concept: regression testing agents (seed turns → expected slots/outcome/node + rubric).
- `TurAgentEvalSet`/`TurAgentEvalCase` CRUD under `/api/ai-agent/{id}/eval-set`; exported with the agent.
- Eval runner + bilingual LLM judge → `TurAgentEvalReport` (baseline / regressed).
- Pre-publish gate in the flow editor Lint panel (GREEN/RED/REGRESSED/NEVER_RUN/NOT_CONFIGURED); a blocking set hard-blocks the chat-flow `PUT` (422).
- CI: `POST /api/ai-agent/{id}/eval/run` + `-Pagent-eval` (env-gated by `OPENAI_API_KEY`).

### 3.10 `tool-calling.md` — **EXPAND** (T420)

- Code Interpreter execution modes: **NATIVE** (default) vs **DOCKER** (T80), per-execution resource limits (T81), pre-warmed pool (T82), **structured output** `executePythonStructured` → `TurCodeInterpreterResult` + the `sandbox:` URL scheme (T83).
- Per-agent Python deps install (T77); HMAC-signed result URLs (T79).
- Note multimodal slots (T64) where tool outputs feed slots — cross-link `chat-flow.md`.

### 3.11 `ai-agents.md` — **EXPAND + cross-link** (T421)

- Per-agent **submission retention** (T66, LGPD/GDPR): FOREVER / DAYS / DELETE_AFTER_EXPORT.
- **OpenAI Responses native tools** (T130–T138): web_search/file_search/code_interpreter/image_generation/remote-mcp — distinguish from Turing's own native tools; **per-LLM capability matrix** (T132, empty = Spring AI path).
- Cost **budget fields** on the agent form (link `cost-governance.md`).
- Cross-link the new pages (workspace/skills already covered well; add routines/webhooks/eval/HITL pointers).

### 3.12 `configuration-reference.md` — **EXPAND** (T422)

Add the newer Global Settings / config keys: cost (price table seed, agent budget fields), RAG/rerank (`RAG_SN_*`, `GLOBAL_RAG_SN_RERANK_*` — T328/T337–T341), analytics node-visit-log flag (T237), routine queue concurrency (`turing.jms.routine.concurrency`), code-interpreter mode/limits (T80/T81). Verify each key name against source before publishing.

### 3.13 `token-usage.md` + `observability.md` — **RECONCILE** (T423)

- `token-usage.md`: clarify it's token **counts**; point to `cost-governance.md` for USD.
- `observability.md`: list all 9 chat-analytics metrics (not 5); add cost metrics/Grafana hints; warn that router-decision + SSE-channel surfaces are **per-node**.

---

## 4. Sidebar changes (`sidebars-turing.ts`)

Within the **Generative AI** category, insert the new pages near their siblings:

```text
chat-flow
  → experiments        (NEW, after chat-flow)
  → human-in-the-loop  (NEW, after experiments)
webhooks               (NEW)
routines               (NEW)
agent-eval             (NEW, near ai-agents)
chat-analytics
token-usage
  → cost-governance    (NEW, after token-usage)
```

Consider grouping A/B + HITL under a small **"Conversational flows"** sub-category
if the GenAI list gets too long. `mcp-server` content can stay inside
`mcp-servers` (no new sidebar entry) unless it's split out.

---

## 5. Suggested execution order

1. **Phase 1 — zero-home, highest value:** `webhooks.md` (T411), `routines.md` (T412), `cost-governance.md` (T413).
2. **Phase 2 — stale rewrites:** `chat-analytics.md` (T414), `chat-flow.md` (T415).
3. **Phase 3 — split-outs:** `experiments.md` (T416), `human-in-the-loop.md` (T417).
4. **Phase 4 — remaining gaps:** `agent-eval.md` (T419), `mcp-servers.md` expand (T418), `tool-calling.md` (T420), `ai-agents.md` (T421).
5. **Phase 5 — reference reconciliation:** `configuration-reference.md` (T422), `token-usage.md`/`observability.md` (T423), sidebar wiring.

Each page: draft → verify every class/endpoint/config-key name against source →
wire into `sidebars-turing.ts` → cross-link siblings.
