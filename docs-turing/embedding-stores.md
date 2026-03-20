---
sidebar_position: 4
title: Embedding Stores & Models
description: Vector database backends and embedding model configuration for RAG and semantic search in Turing ES.
---

# Embedding Stores & Models

Turing ES uses **embedding vectors** to power semantic similarity search — the foundation of RAG-based chat and Knowledge Base querying. Two components must be configured: the **Embedding Store** (where vectors are persisted) and the **Embedding Model** (what generates the vectors).

Both are set globally in **Administration → Settings** and can be overridden per Semantic Navigation Site in its **Generative AI** tab.

---

## Embedding Stores

An **Embedding Store** is the vector database that persists and queries document embeddings. Turing ES supports three backends via Spring AI. Only one backend is active per deployment, defined in `application.yaml`.

### ChromaDB

A lightweight, open-source vector database ideal for development and small to medium deployments.

- Self-hosted, connects via its HTTP API
- Zero infrastructure overhead for teams already running Python tooling
- No special schema setup required — Turing ES manages the collections automatically

Docker Compose quickstart:

```yaml
services:
  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
```

### PgVector

PostgreSQL with the `pgvector` extension — the best choice for deployments that already use PostgreSQL as their primary database.

- Avoids an additional infrastructure dependency
- Embeddings live in the same database as your application data
- Supports standard PostgreSQL backup, replication, and access control

Enable the extension in your PostgreSQL instance:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Milvus

A purpose-built, cloud-native vector database designed for high-scale similarity search.

- Recommended for large corpora or high-throughput deployments
- Supports distributed operation, horizontal scaling, and index management
- Managed cloud offering available (Zilliz Cloud)

---

## Embedding Models

An **Embedding Model** converts text into a numerical vector representation. These vectors capture the semantic meaning of the text, enabling similarity search — finding documents that are conceptually related to a query, even when they share no common keywords.

### Where embeddings are generated

Turing ES uses the embedding model in two places:

**At indexing time** — when a document is indexed on a GenAI-enabled SN Site, or when a file is uploaded to the Knowledge Base, the text is passed through the embedding model and the resulting vector is stored in the Embedding Store.

**At query time** — when a user sends a RAG chat request or an AI Agent calls a search tool, the query text is also vectorized using the same model, then compared against stored vectors to find the most relevant documents.

:::warning The same model must be used at both times
The embedding model must remain consistent across indexing and query time. If you change the model after documents have already been indexed, the stored vectors and query vectors will have different dimensions or different semantic spaces, causing incorrect or empty similarity results. A full re-indexing is required whenever the embedding model changes.
:::

### Available models

The available embedding models depend on the configured LLM provider:

| Provider | Example Embedding Models |
|---|---|
| **OpenAI** | `text-embedding-3-small`, `text-embedding-3-large`, `text-embedding-ada-002` |
| **Azure OpenAI** | Deployment name of an embedding model in your Azure resource |
| **Google Gemini** | `text-embedding-004`, `embedding-001` |
| **Ollama (local)** | `nomic-embed-text`, `mxbai-embed-large`, `all-minilm` |

Not all LLM providers support embedding models — for example, Anthropic and standalone Gemini do not include an embedding API. See [LLM Instances — Capabilities by Vendor](./llm-instances.md#capabilities-by-vendor) for the full capability matrix.

### Choosing a model

The embedding model determines two things: the **dimensionality** of stored vectors (e.g., 384, 768, or 1536 dimensions) and the **quality of semantic similarity**. A larger model generally produces higher-quality embeddings at the cost of more storage and slower indexing.

For most deployments, a mid-sized model such as `text-embedding-3-small` (OpenAI) or `nomic-embed-text` (Ollama) provides a good balance between quality and performance.

---

## Global Configuration

Set the embedding defaults in **Administration → Settings**:

| Setting | Description |
|---|---|
| **Default Embedding Store** | Which vector database backend to use (ChromaDB, PgVector, or Milvus) |
| **Default Embedding Model** | The embedding model used to generate vectors at indexing and query time |

Individual Semantic Navigation Sites can override both settings in their **Generative AI** tab. The Knowledge Base always uses the global defaults.

---

## Related Pages

| Page | Description |
|---|---|
| [GenAI & LLM Configuration](./genai-llm.md) | RAG architecture, RAG sources, and system overview |
| [LLM Instances](./llm-instances.md) | Configure the LLM providers that supply embedding models |
| [Assets](./assets.md) | Knowledge Base files that are indexed into the Embedding Store |
| [Semantic Navigation](./semantic-navigation.md) | Generative AI tab: per-site embedding overrides |

---

*Previous: [LLM Instances](./llm-instances.md) | Next: [Tool Calling](./tool-calling.md)*
