---
sidebar_position: 3
title: Chat
description: Use the Turing ES Chat interface to interact with LLMs, AI Agents, and indexed content.
---

# Chat

The **Chat** interface is the primary way users interact with the AI capabilities of Turing ES. It is organized into three sections: a direct **LLM chat**, a **Semantic Navigation** chat for searching indexed sites, and dynamic **AI Agent** views — one per configured and enabled agent.

:::info LLM required
The Chat interface is only available when at least one LLM Instance is configured and enabled. See [LLM Instances](./llm-instances.md) to set one up.
:::

---

## Layout

![Chat Interface — Layout Overview](/img/diagrams/turing-chat-layout.svg)

**Header controls:**

| Control | Description |
|---|---|
| **Tab navigation** | Switch between Chat, Semantic Navigation, and AI Agent views |
| **LLM model selector** | Choose which configured LLM instance to use for the session |
| **New Chat** | Start a fresh session (saves the current one to history automatically) |
| **Dark mode toggle** | Switch between light and dark themes — code highlighting adapts accordingly |
| **Session history** | Opens the sessions sidebar to browse, restore, or delete previous conversations |

**Context Bar** — displayed below the message area:

| Indicator | Behaviour |
|---|---|
| **Token counter** | Running estimate of tokens used in the current context (~4 chars per token) |
| **% bar** | Visual fill showing context window usage; turns **yellow above 60%** and **red above 80%** |
| **Compact button** | Summarises the conversation to free up context space |

---

## Chat (Direct LLM)

A general-purpose chat with the selected LLM. This tab provides the most direct access to the underlying model, with a set of optional tools the user can enable per conversation.

### File Attachments

Files can be added to the conversation via drag-and-drop or the file picker:

| File type | How it's handled |
|---|---|
| **Documents** (PDF, DOCX, XLSX, PPTX, HTML, TXT, …) | Text extracted via **Apache Tika** and included in the prompt as context |
| **Images** (PNG, JPEG, WebP, GIF, …) | Sent directly as media to models with vision capability |

Attached files are displayed as badges on the message they are sent with.

### Streaming

Responses are streamed in real time using **Server-Sent Events (SSE)**, so content appears progressively as the model generates it — no waiting for the full response.

### Available Tools

The following tools can be enabled for the Chat section. The LLM invokes them autonomously during a conversation when it determines they are needed:

| Tool | Description |
|---|---|
| **Code Interpreter** | Executes Python code in a sandboxed environment. Supports Matplotlib for charts. Timeout: 30 seconds. Generated files (e.g., charts, CSVs) are returned as download links. |
| **Web Crawler** | Fetches and extracts content from a web page. Max 12,000 characters per page, up to 30 links extracted. |
| **Image Search** | Searches for images via DuckDuckGo / Bing. Returns up to 8 results. |
| **Weather** | Returns weather forecasts for 1–7 days using [Open-Meteo](https://open-meteo.com). |
| **Finance** | Retrieves stock quotes and historical price data via Yahoo Finance. |
| **Date / Time** | Returns the current date and time for any given timezone. |
| **RAG Search** | Searches the Knowledge Base (vector store) by semantic similarity. Also provides: knowledge base statistics, file listing with optional keyword filter, and full file content retrieval. |

---

## Semantic Navigation

A chat interface backed by the indexed content of **Semantic Navigation Sites**. Instead of querying the LLM's parametric knowledge, this section sends the user's question through site-specific search tools.

The system prompt includes locale instructions and available facets for each configured site.

**Tools available:**

| Tool | Description |
|---|---|
| `list_sites` | Lists all available Semantic Navigation sites and their locales |
| `get_site_fields` | Returns available fields and facets for a specific site |
| `get_valid_filter_values` | Returns valid values for a filter or facet field |
| `search_site` | Performs a semantic search within a site and returns results |

Any **MCP Servers** configured in Administration are also available in this tab, extending the tool set with external capabilities.

:::tip
Use this tab when you want answers grounded exclusively in your indexed enterprise content, rather than the LLM's general knowledge.
:::

---

## AI Agents

Each **AI Agent** configured and enabled in **Administration → AI Agents** appears as its own view in the Chat interface. Agents are completely independent from each other — each has its own LLM, system prompt, tool set, and visual identity.

| Per-agent setting | Description |
|---|---|
| **Name** | The tab label and agent display name |
| **Avatar** | Image shown in the chat alongside agent messages |
| **System Prompt** | The agent's persona, purpose, and behavioural instructions |
| **LLM Instance** | The specific language model powering this agent (must be valid and enabled) |
| **Native Tools** | A selection from the 27 native tool callings (code interpreter, search, weather, finance, etc.) |
| **MCP Servers** | External tool servers connected specifically to this agent |

For full configuration details — composing agents, tool selection, and MCP Server registration — see [AI Agents](./ai-agents.md).

---

## Rich Content Rendering

Chat responses are rendered with full media-type awareness:

| Content type | Rendering |
|---|---|
| **Markdown** | Full GitHub Flavored Markdown — tables, strikethrough, task lists, inline code, blockquotes |
| **Code blocks** | Syntax highlighting via highlight.js with automatic light/dark theme switching |
| **D2 diagrams** | Rendered to SVG via WASM; falls back to a dev server in development mode |
| **HTML** | Sandboxed preview in an isolated iframe — toggle between rendered view and source, with fullscreen option |
| **Generated files** | Files created by the Code Interpreter (charts, processed data, etc.) are shown as download links inline in the response |

---

## Session History

Chat sessions are stored locally in the browser's **IndexedDB** — they are not sent to the server. This means:

- Sessions are **per browser and per device** — clearing browser data removes them
- No user authentication is required to access past sessions
- Session data never leaves the user's machine

**Session sidebar features:**

| Feature | Description |
|---|---|
| **Auto-title** | A short title is generated by the LLM from the first exchange; falls back to the first message text if generation fails |
| **Model badge** | Shows which LLM model was used for the session |
| **Message count** | Number of messages in the session |
| **Timestamp** | Date and time of the last message |
| **Restore** | Click to resume a previous session |
| **Delete** | Remove a session from history |

Sessions are saved automatically after each complete response.

---

## Context Window Management

A visual indicator shows how much of the model's context window is currently in use.

```
Context usage: ████████░░░░░░░░░░░░  42%
```

| Feature | Description |
|---|---|
| **Token estimation** | ~4 characters per token (fast client-side estimate) |
| **Context window size** | Obtained from the LLM provider's response metadata or the LLM Instance configuration |
| **Bar colour** | Green → Yellow at 60% → Red at 80% |
| **Compact button** | Summarises the current conversation using the LLM to free up context space while preserving the key information |

:::tip When to compact
When the context bar turns red (above 80%), click **Compact** before the limit is reached. Compacting summarises the full history into a concise context block and continues the conversation from there, freeing up significant space without losing the thread.
:::

---

## Files & Attachments Reference

| Capability | Detail |
|---|---|
| **Upload method** | Drag-and-drop onto the chat window, or click the attachment button |
| **Transfer format** | Multipart form (files sent together with the message) |
| **Document processing** | Apache Tika extracts text from PDF, DOCX, XLSX, PPTX, HTML, TXT, and more |
| **Image processing** | Passed directly as media bytes to vision-capable models |
| **Display** | Shown as file badges on the sent message bubble |

---

## API — Chat Endpoints

The chat features are also accessible programmatically for integration into custom applications.

### LLM Direct Chat

```
GET /api/sn/{siteName}/chat?q={question}
```

Sends a question to the RAG pipeline for a Semantic Navigation Site.

**Example:**

```bash
curl "http://localhost:2700/api/sn/Sample/chat?q=What+are+the+main+features?" \
  -H "Key: <YOUR_API_TOKEN>"
```

### AI Agent Chat

```
POST /api/v2/llm/agent/{agentId}/chat
```

Sends a message to a specific AI Agent.

```bash
curl -X POST "http://localhost:2700/api/v2/llm/agent/my-agent/chat" \
  -H "Key: <YOUR_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "message": "Summarise the latest quarterly report" }'
```

---

*Previous: [AI Agents](./ai-agents.md) | Next: [Token Usage](./token-usage.md)*
