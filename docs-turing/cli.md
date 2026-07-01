---
sidebar_position: 8
title: Turing CLI
description: "@viglet/turing-cli — the `turing` command. Scaffold an agent project, run a full local stack, deploy agents/flows/tools/skills to any environment, tail live chat events, and run YAML eval suites in CI. Zero runtime dependencies."
---

# Turing CLI

**`@viglet/turing-cli`** gives you the **`turing`** command — a developer CLI for building, deploying and testing Viglet Turing ES agents as **code in a Git repo** instead of clicking through the admin console. It's zero-dependency (compiled ESM, `tsc`-only) and needs a modern Node runtime (see the package's `engines`).

**When you'd reach for it.** Use the CLI when you want an **agent-as-code workflow**: keep your agent definition, chat flows, custom tools, skills and regression tests in version control; boot a local Turing stack to iterate; and `deploy` the whole thing to `local` / `staging` / `production` from a script or CI pipeline. It pairs naturally with **[`@viglet/turing-flow-dsl`](./flow-dsl.md)** (author flows as typed TypeScript that compile to the `flows/*.chat-flow.json` the CLI deploys).

> **The five commands at a glance:**
>
> | Command | What it does |
> |---|---|
> | `turing init <name>` | Scaffold a new agent project. |
> | `turing dev` | Boot a local Turing stack via Docker Compose (`--watch` = hot redeploy). |
> | `turing deploy` | Push agent + flows + tools + skills to an environment. |
> | `turing eval` | Run `*.eval.yaml` regression suites (exits non-zero on failure → CI-ready). |
> | `turing logs` | Tail live chat events (SSE) for a conversation. |

---

## Install

```bash
npm i -g @viglet/turing-cli     # global `turing` binary
# or run without installing:
npx @viglet/turing-cli init my-copilot
```

---

## Your first project (5 minutes)

```bash
turing init my-copilot        # 1. scaffold the project
cd my-copilot
turing dev                    # 2. boot a local Turing stack (Docker Compose)
turing deploy --env=local     # 3. push agent + flows + tools + skills
turing eval                   # 4. run the YAML regression suites in evals/
```

That's the full loop: scaffold → run → deploy → test. Everything below is detail on each step.

---

## Project layout

`turing init <name>` scaffolds a project you commit to Git:

| Path | Purpose |
|---|---|
| `agent.json` | The [AI Agent](./ai-agents.md) definition — title, system prompt, flags, native tools. |
| `flows/` | `*.chat-flow.json` [chat flows](./chat-flow.md). Author them with **[`@viglet/turing-flow-dsl`](./flow-dsl.md)**. |
| `tools/` | `*.groovy` [custom-tool](./custom-tools.md) scripts (+ an optional `<name>.tool.json` sidecar for metadata). |
| `skills/` | Anthropic-compatible [skill](./skills.md) folders — one per subdirectory, each with a `SKILL.md`. |
| `evals/` | `*.eval.yaml` regression suites (a sample `smoke.eval.yaml` is scaffolded). |
| `turing.config.json` | Instance URL(s) per environment + the deployed agent id. **Never secrets.** |
| `docker-compose.dev.yml` | The local stack `turing dev` brings up. |

---

## Configuration & authentication

Connection settings resolve in this order (**last wins**): `turing.config.json` → environment variables → command flags.

### `turing.config.json`

Holds only **non-secret** settings — the project name, the deployed `agentId` (auto-filled after the first `deploy`), and a URL per environment:

```json
{
  "name": "my-copilot",
  "agentId": "",
  "default": "local",
  "envs": {
    "local":   { "url": "http://localhost:2700" },
    "staging": { "url": "https://staging.turing.example.com" }
  }
}
```

### Credentials

Credentials are **never** written to the config file — supply them via the environment or flags. Two auth modes:

- **Dev token (preferred for CI):** set `TURING_TOKEN` (or `--token`). Sent as the `Key:` header. No prompt.
- **HTTP Basic (interactive):** set `TURING_USERNAME` (or `--username`); the password comes from `TURING_PASSWORD`, `--password`, or an interactive hidden prompt. Fails on a non-TTY (CI) if no password env var is set.

| Env var | Flag | Use |
|---|---|---|
| `TURING_URL` | `--url` | Override the target instance URL. |
| `TURING_ENV` | `--env` | Default environment name. |
| `TURING_TOKEN` | `--token` | Dev token for unattended / CI use. |
| `TURING_USERNAME` | `--username` | Username for basic auth. |
| `TURING_PASSWORD` | `--password` | Password for basic auth. |
| `TURING_AGENT_ID` | `--agent` | Agent id override (rarely needed). |

Under the hood the CLI primes a CSRF token (`GET /api/csrf`) and carries the session cookie across requests.

---

## Commands

### `turing init <name> [--dir <path>] [--force]`

Scaffold a new agent project directory.

- `<name>` — project name (required).
- `--dir <path>` — target directory (default `./<name>`).
- `--force`, `-f` — overwrite an existing folder.

```bash
turing init my-copilot
turing init my-copilot --dir ./projects/ai --force
```

### `turing dev [--file <compose>] [--detach] [--watch]`

Boot a local Turing stack via `docker compose up`. It resolves `docker-compose.yml` → `docker-compose.yaml` → `docker-compose.dev.yml` (first match wins).

- `--file <compose>` — use a specific compose file.
- `--detach`, `-d` — run in the background.
- `--watch` — detach the stack, then **redeploy the project on file changes** (watches `agent.json`, `flows/`, `tools/`, `skills/`; 400 ms debounce; `Ctrl-C` to stop).

```bash
turing dev            # foreground
turing dev --watch    # hot reload while you edit
turing dev --file docker-compose.prod.yml --detach
```

### `turing deploy [--env <name>] [connection flags]`

Push the whole project to an environment. The default env resolves `--env` → `TURING_ENV` → `turing.config.json`'s `default` → `"local"`.

What it deploys, and how it stays **idempotent**:

- **Agent** — `POST /api/ai-agent` on first deploy, then `PUT /api/ai-agent/{id}` after. The new id is **written back to `turing.config.json`**.
- **Flows** — every `flows/*.chat-flow.json` pushed atomically via `POST /api/ai-agent/{id}/chat-flow/import-bundle`.
- **Custom tools** — every `tools/*.groovy` (+ optional `<name>.tool.json` sidecar); matched by title → `PUT` if it exists, else `POST`. A file `my-tool.groovy` auto-titles to *"My Tool"*.
- **Skills** — each `skills/<name>/` folder (must contain `SKILL.md`) is zipped and uploaded to `POST /api/skill/import`.

```bash
turing deploy --env=local
turing deploy --env=staging --token "$TURING_TOKEN"
turing deploy --url http://localhost:2700 --username admin --password secret
```

### `turing eval [path] [--watch] [connection flags]`

Discover, run and report `*.eval.yaml` / `*.eval.yml` / `*.eval.json` suites (defaults to `./evals/`). Each fixture replays a scripted conversation against the **live** agent and checks assertions. **Exits non-zero if any fixture fails**, so it drops straight into CI. `--watch` re-runs on change.

```bash
turing eval                          # run everything in evals/
turing eval evals/smoke.eval.yaml    # a single suite
turing eval --watch --env=staging
```

An eval suite is a list of `fixtures`, each a sequence of `user` turns and `assert.*` checks:

```yaml
fixtures:
  - id: greeting
    steps:
      - user: "Hello, can you help me?"
      - assert.assistant.matches: ".+"
      - assert.persona.forbidden: ["I cannot help", "I'm just an AI"]
  - id: capture-email
    steps:
      - user: "I want the brochure — my email is ada@example.com"
      - assert.slot.email: "ada@example.com"
      - assert.tool_called: "save_lead"
```

**Available assertions** (both the flat dotted form above and a nested `assert:` block are accepted):

| Assertion | Checks |
|---|---|
| `assistant.matches` / `not_matches` | Regex over the streamed reply. |
| `assistant.contains` / `not_contains` | Substring over the reply. |
| `slot.<name>` | A captured [slot](./chat-flow.md#slots) value. |
| `tool_called` / `tool_not_called` | Whether a tool ran (via the slot-audit `TOOL` trail). |
| `persona.required` / `persona.forbidden` | Required / forbidden phrases (case-insensitive). |
| `node` | The flow cursor position (via `/state`). |

> Related: the console has its own pre-publish [Agent Eval](./agent-eval.md) gate (golden sets + LLM judge). The CLI's YAML evals are the **code-first, CI-runnable** counterpart — the same idea, checked into your repo.

#### `turing eval record <conversationId> [--out <file>]`

Capture a **real** conversation from a running instance into a starter eval suite. It pulls the full snapshot (`GET /api/chat/sessions/{id}/export`), turns visitor turns into `user:` steps and the captured slots into a final `assert.slot.*` block, ready for you to tighten by hand.

```bash
turing eval record abc-123-def-456 --out evals/from-prod.eval.yaml
```

### `turing logs --conversation <id> [--slots] [connection flags]`

Tail **live chat events** for a conversation over the spectator SSE stream — first a transcript snapshot, then each new turn as it happens. `--slots` also relays slot updates. `Ctrl-C` stops.

```bash
turing logs --conversation abc-123-def-456
turing logs --conversation abc-123-def-456 --slots
```

### `turing version` · `turing help`

`turing version` (or `--version`/`-v`) prints the version; `turing help` (or `--help`/`-h`, or no args) prints usage.

---

## Using it as a library

The CLI's internals are also exported from `@viglet/turing-cli` so you can embed them — e.g. `TuringClient`, `resolveConnection`, `scaffoldFiles`, `deployProject`, `runSuite`/`evaluate` (with a custom `EvalBackend`), `parseYaml`, `buildZip`. Handy for building your own tooling on the same primitives.

---

## Related pages

- **[Flow DSL](./flow-dsl.md)** — author the `flows/*.chat-flow.json` the CLI deploys, as typed TypeScript.
- **[AI Agents](./ai-agents.md)** — what `agent.json` configures.
- **[Custom Tools](./custom-tools.md)** — the `.groovy` scripts in `tools/`.
- **[Skills](./skills.md)** — the skill folders in `skills/`.
- **[Agent Eval](./agent-eval.md)** — the console-side eval gate the CLI evals complement.
- **[JavaScript SDK](./javascript-sdk.md)** · **[React SDK](./react-sdk.md)** — the runtime clients your app uses once deployed.
