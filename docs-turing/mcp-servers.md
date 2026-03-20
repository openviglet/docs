---
sidebar_position: 6
title: MCP Servers
description: Connect AI Agents to external tools via the Model Context Protocol (MCP) in Turing ES.
---

# MCP Servers

An **MCP Server** extends the capabilities of an AI Agent by connecting it to any external server that implements the **Model Context Protocol (MCP)**. This allows Turing ES agents to use tools defined completely outside the platform — a company-internal knowledge system, a proprietary data API, a database query interface, or any of the growing ecosystem of public MCP servers.

MCP Servers are configured in **Administration → MCP Servers** and then selected per [AI Agent](./ai-agents.md).

---

## Configuration Form

| Field | Description |
|---|---|
| **Name** | Display name for the MCP server — shown when selecting it in an AI Agent |
| **Transport type** | `HTTP` or `stdio` — how Turing ES communicates with the server |
| **Command** | For `stdio`: the executable to launch the MCP server process (e.g., `npx`) |
| **Arguments** | For `stdio`: command-line arguments passed to the process (e.g., `@modelcontextprotocol/server-filesystem /data`) |
| **URL** | For `HTTP`: the MCP server endpoint URL |
| **Execution mode** | `Synchronous` or `Asynchronous` |

---

## Transport Types

### stdio

Launches the MCP server as a **local subprocess**. The MCP client communicates with it via standard input/output streams. This is the standard mode for locally installed MCP servers.

```bash
# Example: filesystem MCP server
npx @modelcontextprotocol/server-filesystem /path/to/allowed/directory
```

Use stdio when the MCP server is installed locally (via npm, pip, or a system binary) and does not expose an HTTP endpoint.

### HTTP

Connects to a **remote MCP server** over HTTP. This mode supports both public MCP services and internally hosted servers accessible over the network.

```
https://mcp.example.com/api/tools
```

Use HTTP when the MCP server is a hosted service or when it runs on a different machine or container.

---

## Execution Modes

### Synchronous

Waits for the MCP tool result before continuing the agent's reasoning chain. The LLM receives the tool result and can incorporate it into its next reasoning step before deciding whether to call another tool or generate a final response.

Use synchronous mode when the tool result is needed as context for subsequent steps.

### Asynchronous

Dispatches the tool call without blocking. Useful for long-running operations or when the result does not need to be incorporated into the immediate reasoning chain.

---

## MCP Server Examples

**Internal ticketing system (stdio):**
```
Name:      JIRA Internal
Transport: stdio
Command:   node
Arguments: /opt/mcp-jira/index.js --token <TOKEN>
Mode:      Synchronous
```

**Company knowledge API (HTTP):**
```
Name:      Internal Knowledge Base API
Transport: HTTP
URL:       https://internal-api.example.com/mcp
Mode:      Synchronous
```

**Public MCP service (HTTP):**
```
Name:      Brave Search
Transport: HTTP
URL:       https://api.search.brave.com/mcp
Mode:      Asynchronous
```

---

## Assigning MCP Servers to Agents

Once configured, MCP servers appear in the **MCP Servers** multi-select field of the [AI Agent](./ai-agents.md) configuration form. Each agent independently selects which MCP servers it can use. The tools exposed by each selected MCP server become available to the LLM during that agent's conversations.

---

## Related Pages

| Page | Description |
|---|---|
| [AI Agents](./ai-agents.md) | Compose agents with native tools + MCP servers |
| [Tool Calling](./tool-calling.md) | The 27 native tools built into Turing ES |
| [Chat](./chat.md) | Front-end chat interface where agents are used |

---

*Previous: [Tool Calling](./tool-calling.md) | Next: [AI Agents](./ai-agents.md)*
