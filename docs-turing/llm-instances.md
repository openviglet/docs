---
sidebar_position: 1
title: LLM Instances
description: Configure and manage Language Model instances in Viglet Turing ES.
---

# LLM Instances

The **Language Model** page (`/admin/llm/instance`) is the central place to configure the AI models that power the Turing ES Generative AI features. It is accessible from the **Generative AI** section of the sidebar.

Each **LLM Instance** is a named, configured connection to an LLM provider. Multiple instances can coexist — different AI Agents, SN Sites, and the Chat interface can each use a different instance. This allows you to, for example, use a fast local Ollama model for low-stakes tasks and Anthropic Claude Sonnet for complex reasoning agents.

---

## Instance Listing

The page displays all configured instances as a grid of cards (title and description). Use the **"New language model instance"** button to create a new one.

---

## Create / Edit Form

The form is organized into **5 colour-coded sections** for quick visual orientation.

---

### 1. General Information (blue)

| Field | Required | Description |
|---|---|---|
| **Title** | ✅ | Display name for this instance — appears in dropdowns and agent configuration |
| **Vendor** | ✅ | Select the LLM provider. Selecting a vendor applies sensible defaults to Endpoint URL and Model Name automatically. |
| **Description** | | Free-text notes about this instance's purpose |

---

### 2. Model Settings (purple)

| Field | Required | Description |
|---|---|---|
| **Endpoint URL** | ✅ | Base URL for the provider API (e.g., `https://api.openai.com`, `http://localhost:11434`) |
| **Model Name** | ✅ | Specific model identifier (e.g., `gpt-4o-mini`, `mistral`, `claude-sonnet-4-20250514`) |
| **API Key** | | Provider API key — stored encrypted in the database. Leave blank when editing to keep the existing key. |

:::info API Key security
The API Key field is **write-only**. It is stored encrypted via `TurSecretCryptoService` and never returned in API responses. When editing an existing instance, leaving the field blank preserves the previously saved key. The encryption key is configured in `turing.ai.crypto.key` in `application.yaml`. See [Configuration Reference](./configuration-reference.md#turing-es-core).
:::

---

### 3. Generation Parameters (emerald)

Fine-tune how the model generates responses. Defaults are appropriate for most use cases.

| Field | Description | Notes |
|---|---|---|
| **Temperature** | Randomness of the output (0.0 = deterministic, 1.0 = very creative) | Applies to all vendors |
| **Top P** | Nucleus sampling — restricts token selection to the top P probability mass | Applies to all vendors |
| **Seed** | Fixed seed for reproducible outputs | Only available for **OLLAMA**, **OPENAI**, and **AZURE_OPENAI** |

---

### 4. Advanced Options (amber)

| Field | Description |
|---|---|
| **Response Format** | Output format: `TEXT` (default) or `JSON` |
| **Supported Capabilities** | Comma-separated list of feature flags (e.g., `RESPONSE_FORMAT_JSON_SCHEMA`) |
| **Timeout** | Maximum time to wait for a response, in ISO 8601 duration format (e.g., `PT60S` = 60 seconds) |
| **Max Retries** | Number of retry attempts on transient failures. Default: `3` |
| **Provider Options (Visual)** | Vendor-specific fields rendered dynamically based on the selected vendor (see [Provider Options](#provider-options) below) |
| **Provider Options (JSON)** | Raw JSON override for any vendor-specific setting — useful for advanced configurations not exposed in the visual fields |

---

### 5. Status (slate)

| Field | Description |
|---|---|
| **Enabled** | Toggle to activate or deactivate this instance. Disabled instances are not available for selection in agents or sites. |
| **Tools Enabled** | Toggle to allow this instance to use function calling (tool callings such as web search, code interpreter, etc.) |

---

## Supported Vendors

Six vendor types are supported. When a vendor is selected in the form, the Endpoint URL and Model Name fields are pre-filled with the defaults shown below.

| Vendor | Default Endpoint | Default Model |
|---|---|---|
| **OLLAMA** | `http://localhost:11434` | `mistral` |
| **OPENAI** | `https://api.openai.com` | `gpt-4o-mini` |
| **ANTHROPIC** | `https://api.anthropic.com` | `claude-sonnet-4-20250514` |
| **GEMINI** | *(Google native API)* | `gemini-2.0-flash` |
| **GEMINI_OPENAI** | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.0-flash` |
| **AZURE_OPENAI** | *(configured via provider options)* | `gpt-4o` |

---

## Provider Options

Each vendor exposes additional fields in the **Provider Options (Visual)** section. These fields appear dynamically when that vendor is selected.

| Vendor | Available Fields |
|---|---|
| **OLLAMA** | `embeddingModel`, `topK`, `repeatPenalty`, `numPredict`, `stop` |
| **OPENAI** | `embeddingModel`, `maxTokens` |
| **ANTHROPIC** | `topK`, `maxTokens` |
| **GEMINI** | `topK`, `maxTokens` |
| **GEMINI_OPENAI** | `maxTokens` |
| **AZURE_OPENAI** | `deploymentName`, `embeddingDeploymentName`, `maxTokens` |

:::tip Azure OpenAI
For Azure OpenAI, the `deploymentName` provider option is required — it specifies the name of your deployed model in the Azure portal. The endpoint must also be set to your Azure OpenAI resource URL (e.g., `https://my-resource.openai.azure.com`).
:::

---

## Capabilities by Vendor

Not all vendors support all features. The table below shows which capabilities are available per vendor:

| Vendor | Chat | Embedding | Tool Calling | Seed |
|---|:---:|:---:|:---:|:---:|
| **OLLAMA** | ✅ | ✅ *(configurable)* | ✅ | ✅ |
| **OPENAI** | ✅ | ✅ *(`text-embedding-3-small`)* | ✅ | ✅ |
| **ANTHROPIC** | ✅ | ❌ | ✅ | ❌ |
| **GEMINI** | ✅ | ❌ | ✅ | ❌ |
| **GEMINI_OPENAI** | ✅ | ❌ | ✅ | ❌ |
| **AZURE_OPENAI** | ✅ | ✅ *(`text-embedding-ada-002`)* | ✅ | ✅ |

:::note Embedding vendors
If you need embedding support (for RAG and the Knowledge Base), use **OLLAMA**, **OPENAI**, or **AZURE_OPENAI**. The other vendors can be used for chat and tool calling but not for vector generation.
:::

---

## Security

API Keys are handled with care at every layer:

- **Stored encrypted** — the key is encrypted via `TurSecretCryptoService` before being persisted to the database in the `apiKeyEncrypted` column.
- **Never returned** — the `apiKey` field is annotated `@Transient` on the JPA entity. It is write-only: it flows in on save but never comes back in API responses or GET endpoints.
- **Edit safely** — leaving the API Key field blank when editing an instance preserves the existing encrypted value without modification.
- **Encryption key** — configured via `turing.ai.crypto.key` in `application.yaml`. **Always set a strong, unique value in production** — the default is a placeholder and must be changed before handling real API keys.

---

## Caching

LLM Instance data is cached at the repository layer to avoid repeated database reads during high-throughput inference:

- `turLLMInstancefindAll` — caches the full list of instances
- `turLLMInstancefindById` — caches individual instance lookups
- Vendor metadata is also cached

Cache entries are invalidated automatically on create, update, or delete.

---

## Related Pages

| Page | Description |
|---|---|
| [Generative AI & LLM Configuration](./genai-llm.md) | Conceptual overview of RAG, embeddings, tool calling, and agents |
| [Chat](./chat.md) | Using the chat interface with configured LLM instances |
| [Token Usage](./token-usage.md) | Monitor token consumption per instance |
| [Assets](./assets.md) | Knowledge Base files — requires an embedding-capable instance |
| [Configuration Reference](./configuration-reference.md#turing-es-core) | `turing.ai.crypto.key` and other application settings |

---

*Previous: [Generative AI & LLM Configuration](./genai-llm.md) | Next: [Embedding Stores & Models](./embedding-stores.md)*
