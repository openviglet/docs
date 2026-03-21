---
sidebar_position: 5
title: Embedding Models
description: Configure embedding models for vector generation — supported providers, local transformers, model selection and the REST API.
---

# Embedding Models

An **Embedding Model** converts text into a high-dimensional numerical vector that captures its semantic meaning. These vectors enable similarity search — finding documents conceptually related to a query even when they share no common keywords.

Turing ES uses embedding models in two phases:

- **Indexing** — document chunks are vectorized and stored in the [Embedding Store](./embedding-stores.md)
- **Querying** — the user's question is vectorized with the same model and compared against stored vectors

:::warning Same model for indexing and querying
The embedding model must remain consistent across both phases. Changing the model after documents have been indexed causes dimension mismatches and incorrect similarity results. A **full re-indexing** of all content is required whenever the embedding model changes.
:::

---

## Supported Providers

Embedding model support depends on the LLM vendor configured in the [LLM Instance](./llm-instances.md). Not all vendors provide an embedding API.

| Provider | Embedding Support | Example Models | Default Model |
|---|:---:|---|---|
| **OpenAI** | Yes | `text-embedding-3-small`, `text-embedding-3-large`, `text-embedding-ada-002` | `text-embedding-3-small` |
| **Azure OpenAI** | Yes | Deployment name of an embedding model in your Azure resource | `text-embedding-ada-002` |
| **Ollama** | Yes | `nomic-embed-text`, `mxbai-embed-large`, `all-minilm`, `stella-v5` | *(configurable)* |
| **Anthropic** | No | — | — |
| **Gemini** | No | — | — |
| **Gemini (OpenAI-compatible)** | No | — | — |

### OpenAI

Connects to the OpenAI API (default: `https://api.openai.com`) using your API key. OpenAI offers three embedding model families:

| Model | Dimensions | Notes |
|---|---|---|
| `text-embedding-3-small` | 1,536 | Best cost-performance balance for most deployments |
| `text-embedding-3-large` | 3,072 | Higher quality, larger storage footprint |
| `text-embedding-ada-002` | 1,536 | Legacy model — use `3-small` for new deployments |

### Azure OpenAI

Uses the same OpenAI embedding models, hosted on your Azure tenant. Configuration requires:

- **Endpoint** — your Azure OpenAI resource URL (e.g., `https://my-resource.openai.azure.com`)
- **Embedding Deployment Name** — the deployment name created in the Azure portal
- **API Key** — Azure API key (stored encrypted)

### Ollama (Local)

Runs embedding models locally via [Ollama](https://ollama.com). No API key required for local deployments — ideal for air-gapped environments or development.

| Model | Dimensions | Notes |
|---|---|---|
| `nomic-embed-text` | 768 | Good general-purpose model, lightweight |
| `mxbai-embed-large` | 1,024 | Higher quality, more resource-intensive |
| `all-minilm` | 384 | Very lightweight, fast inference |

Pull a model before using it:

```bash
ollama pull nomic-embed-text
```

### Local Transformers (ONNX)

Turing ES also supports running embedding models locally via ONNX Runtime, without an external LLM provider. This is useful for deploying custom or fine-tuned models.

| Setting | Description |
|---|---|
| **Model Path** | Absolute path to the `.onnx` model file |
| **Tokenizer Path** | Absolute path to `tokenizer.json` |
| **Enable GPU** | Toggle GPU acceleration via ONNX Runtime |
| **Batch Size** | Number of texts to embed per batch |

---

## Create / Edit Form

Navigate to **Generative AI → Embedding Models** to manage embedding model configurations.

### General Information

| Field | Required | Description |
|---|---|---|
| **Model Name** | Yes | Display name for this embedding model |
| **Description** | | Free-text notes about the model's purpose |

### Provider

| Field | Required | Description |
|---|---|---|
| **LLM Instance** | Yes* | Select the [LLM Instance](./llm-instances.md) that provides the embedding API. Not required for Local Transformers. |
| **Model Reference** | Yes | Technical model identifier (e.g., `text-embedding-3-large`, `nomic-embed-text`) |

### Local Transformers Options

These fields appear only when **Transformers (Local)** is selected as the provider type:

| Field | Description |
|---|---|
| **Model Path** | Path to the ONNX model file (`.onnx` extension) |
| **Tokenizer Path** | Path to the tokenizer file (`tokenizer.json`) |
| **Batch Size** | Number of texts processed per inference batch |
| **Enable GPU** | Toggle hardware acceleration |

### Status

| Field | Description |
|---|---|
| **Enabled** | Toggle to activate or deactivate this model. Disabled models are not available for selection. |

---

## Choosing a Model

The embedding model determines two things:

- **Dimensionality** — the number of dimensions in the vector (e.g., 384, 768, 1,536, 3,072). Higher dimensions capture more nuance but require more storage.
- **Semantic quality** — how well the model captures meaning. Larger models generally produce better similarity results at the cost of slower indexing.

### Recommendations

| Scenario | Recommended Model | Provider |
|---|---|---|
| **General production** | `text-embedding-3-small` | OpenAI |
| **Maximum quality** | `text-embedding-3-large` | OpenAI |
| **Local / air-gapped** | `nomic-embed-text` | Ollama |
| **Resource-constrained** | `all-minilm` | Ollama |
| **Azure enterprise** | `text-embedding-ada-002` deployment | Azure OpenAI |
| **Custom fine-tuned** | Your `.onnx` model | Local Transformers |

For most deployments, a mid-sized model such as `text-embedding-3-small` (OpenAI) or `nomic-embed-text` (Ollama) provides a good balance between quality and performance.

---

## Global Configuration

Set the default embedding model in **Administration → Settings**:

| Setting | Description |
|---|---|
| **Default Embedding Model** | The embedding model used to generate vectors at indexing and query time |

Individual Semantic Navigation Sites can override this setting in their **Generative AI** tab.

The Knowledge Base always uses the global default.

---

## REST API

Embedding models are managed via the REST API at `/api/embedding-model`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/embedding-model` | List all embedding models |
| `GET` | `/api/embedding-model/structure` | Get the structure template for a new model |
| `GET` | `/api/embedding-model/{id}` | Get a specific embedding model |
| `POST` | `/api/embedding-model` | Create a new embedding model |
| `PUT` | `/api/embedding-model/{id}` | Update an existing embedding model |
| `DELETE` | `/api/embedding-model/{id}` | Delete an embedding model |

---

## Per-Site Override

Each Semantic Navigation Site can override the global embedding model in its **Generative AI** tab. This allows different sites to use different models — for example, a multilingual site might use a model optimized for cross-language embeddings while a technical site uses a domain-specific model.

The site-level configuration includes:

| Setting | Description |
|---|---|
| **Embedding Model** | Overrides the global default for this site |
| **Embedding Store** | Overrides the global store backend for this site |
| **LLM Instance** | The chat/reasoning model for this site's GenAI features |

---

## Caching

Embedding model data is cached at the repository layer to avoid repeated database reads during high-throughput indexing:

- `turEmbeddingModelfindAll` — caches the full list of models
- `turEmbeddingModelfindById` — caches individual model lookups

Cache entries are invalidated automatically on create, update, or delete.

---

## Related Pages

| Page | Description |
|---|---|
| [Embedding Stores](./embedding-stores.md) | Vector database backends (ChromaDB, PgVector, Milvus) |
| [What is RAG?](./rag.md) | How embedding models fit into the RAG pipeline |
| [LLM Instances](./llm-instances.md) | Configure the LLM providers that supply embedding APIs |
| [Assets](./assets.md) | Knowledge Base files indexed using the embedding model |
| [Semantic Navigation](./semantic-navigation.md) | Per-site GenAI and embedding overrides |
| [GenAI & LLM Configuration](./genai-llm.md) | Global settings and architecture overview |

---
