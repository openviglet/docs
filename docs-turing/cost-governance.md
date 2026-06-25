---
sidebar_position: 19
title: Cost Governance
description: See and control your AI spend. Turing freezes a USD cost on every turn from an editable price table, rolls it up into a live dashboard by agent / model / stage, and lets each agent enforce a soft monthly budget that downgrades to a cheaper model instead of overspending.
---

# Cost Governance

> *AI spend is easy to lose track of — a chatty agent here, an expensive model there, a background summarizer running every night. **Cost Governance** turns that fog into a number: every turn carries its own USD cost, every agent can carry a budget, and one dashboard shows you where the money goes.*

Cost Governance is Viglet Turing ES's **provider-agnostic** spend layer. It works on OpenAI, Anthropic, Gemini, Ollama, and embedded models alike, because it's built on the token usage Turing already records — not on any one vendor's billing API. Local and embedded models simply record **$0**.

It has three parts: a **price table** you edit, a per-turn **cost capture** that freezes a USD amount on every LLM call, and a live **dashboard** plus a per-agent **budget gate**. Find it in the console under **AI Analytics → Cost Governance**.

---

## How cost is captured

Every time Turing calls an LLM, it records the call in the always-on relational `llm_token_usage` table — input tokens, output tokens, vendor, model, the agent, and a **cost stage**. At record time it also computes and **freezes** the USD cost:

```
cost_usd = inputTokens  / 1,000,000 × inputPricePerMillion
         + outputTokens / 1,000,000 × outputPricePerMillion
```

The price comes from the [price table](#the-price-table). Freezing the cost at record time means a later price edit doesn't rewrite history — each turn keeps the cost it actually incurred. If no price is configured for a model (or it's a local/embedded model), the cost is **$0**, so the feature never blocks an un-priced deployment.

### Cost stages

Each record is tagged with a coarse **stage** so you can tell live conversation cost apart from background work:

| Stage | What it covers |
|---|---|
| `chat.live` | Live conversation turns (the chat dispatcher) |
| `chat.background` | Background LLM work — session summaries, memory compression, weekly reports |
| `chat.skill` | Skill-runner sub-loops |
| `chat.other` | Anything not explicitly tagged (the fallback) |

This is what lets you answer "how much of my spend is *users talking to the agent* vs. *nightly jobs*?".

---

## The price table

The price table (`tur_llm_price`) holds, per `(vendor, model)`:

| Field | Meaning |
|---|---|
| **vendor** | the LLM vendor id (e.g. `openai`, `anthropic`, `gemini`) |
| **model** | the model name (e.g. `gpt-4o`, `claude-...`) |
| **input price / million** | USD per 1M input tokens |
| **output price / million** | USD per 1M output tokens |
| **currency** | `USD` (default) |

Sensible defaults for OpenAI, Anthropic, and Gemini are seeded on first boot. When a vendor changes its pricing, edit the row in the inline price editor on the Cost Governance page (or via the API) — the change is an upsert on the natural `(vendor, model)` key and applies to **future** turns only.

---

## The dashboard

The Cost Governance page rolls the frozen `cost_usd` up over a date range (default: the last **30 days**):

- **Summary cards** — total cost, total requests, and input / output / total tokens for the period.
- **Daily spend chart** — a line chart of cost per day, so a spike is visible at a glance.
- **Breakdown tables** — cost, tokens, and request counts grouped **by agent**, **by model**, **by stage**, and **by tenant**.

The page is always-on (relational), so it works even when the [chat analytics](./chat-analytics.md) engine is set to `none`.

---

## Per-agent soft budget gate

Beyond *seeing* spend, each agent can *enforce* a soft budget. These are opt-in fields on the agent settings form, and **neither ever aborts a turn** — a paying conversation is never dropped mid-flight.

| Agent field | Effect |
|---|---|
| `monthlyBudgetUsd` | When the agent's **month-to-date** spend reaches this cap, the next turn either downgrades or warns (see below). Blank/≤0 = gate off. |
| `budgetDowngradeLlmId` | The cheaper LLM instance to switch to once over budget. If set and resolvable, over-budget turns run on it. |
| `perTurnSoftCapUsd` | After a turn completes, if its cost exceeded this cap, Turing logs a warning — an operator signal that one turn was unusually expensive. |

The flow:

1. **Pre-call (monthly budget).** Before building the model for a turn, the gate sums the agent's spend since the 1st of the month. Under budget → use the configured model unchanged. Over budget → swap to `budgetDowngradeLlmId` if it's set and resolvable; otherwise log a warning and **proceed on the original model** (warn-only).
2. **Post-call (per-turn cap).** After the turn, if its cost exceeded `perTurnSoftCapUsd`, log a warning.

The gate is best-effort: any failure in the budget check degrades to "use the original model", never to a broken turn.

---

## Operator runbook

**"Spend spiked yesterday — why?"** Open the dashboard, narrow the date range to the spike, and read the breakdown tables. The **by-stage** table tells you live vs. background; the **by-agent** and **by-model** tables tell you which agent and which model drove it. A jump in `chat.background` usually means a nightly job; a jump in `chat.live` on one agent means traffic or a pricier model.

**"I want to cap an agent's spend."** Set `monthlyBudgetUsd` on the agent, and ideally a `budgetDowngradeLlmId` pointing at a cheaper instance — over-budget turns degrade gracefully instead of either overspending or failing.

**"Are my prices right?"** The dashboard number is your **early-warning estimate**. Where a vendor-Usage import also exists, treat the vendor's number as the source of truth and this live number as the canary.

---

## REST API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v2/llm/cost/summary?from=&to=` | Cost report: totals + breakdowns by agent / model / stage / tenant (dates are ISO `yyyy-MM-dd`; `to` is inclusive) |
| `GET` | `/api/v2/llm/cost/timeseries?from=&to=` | Daily cost points for the chart |
| `GET` | `/api/v2/llm/price` | List the price table |
| `POST` | `/api/v2/llm/price` | Upsert a price row (by vendor + model) |
| `DELETE` | `/api/v2/llm/price/{id}` | Delete a price row |

---

## Related pages

- [Token Usage](./token-usage.md) — the raw token **counts**; Cost Governance adds the USD layer on top
- [Chat Analytics](./chat-analytics.md) — conversation-level metrics (sessions, sentiment, tool latency)
- [AI Agents](./ai-agents.md) — where the per-agent budget fields live
- [LLM Instances](./llm-instances.md) — the models priced in the table and selected for downgrade
- [Observability](./observability.md) — token/cost metrics for Grafana
