import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  turingSidebar: [
    {
      type: "category",
      label: "Turing ES",
      link: {
        type: "doc",
        id: "index",
      },
      items: [
        {
          type: "category",
          label: "Getting Started",
          items: [
            "getting-started/intro",
            "getting-started/core-concepts",
            "architecture-overview",
          ],
        },
        // ── Search it ────────────────────────────────────────────────────
        {
          type: "category",
          label: "Enterprise Search",
          link: {
            type: "generated-index",
            slug: "/category/enterprise-search",
            title: "Enterprise Search",
            description:
              "Faceted, multilingual, typo-tolerant search on Solr, Elasticsearch or embedded Lucene — one query API, schema as code, hybrid keyword + vector ranking.",
          },
          items: [
            "search-engine",
            "semantic-navigation",
            {
              type: "category",
              label: "DSL Query",
              items: ["dsl-query", "dsl-compatibility"],
            },
            "spa-pages",
            {
              type: "category",
              label: "Integration",
              items: ["integration", "integration-aem"],
            },
            "import-export",
          ],
        },
        // ── Ask it ───────────────────────────────────────────────────────
        {
          type: "category",
          label: "RAG & Chat",
          link: {
            type: "generated-index",
            slug: "/category/rag-chat",
            title: "RAG & Chat",
            description:
              "Retrieval-augmented generation with citations, a pluggable reranker, relevance gating and groundedness checks — grounded, streamed answers you can audit.",
          },
          items: [
            "rag",
            "embedding-stores",
            "embedding-models",
            "chat",
            "chat-memory",
            "intent",
            "personas",
          ],
        },
        // ── Automate it ──────────────────────────────────────────────────
        {
          type: "category",
          label: "Agents, Tools & Skills",
          link: {
            type: "generated-index",
            slug: "/category/agents",
            title: "Agents, Tools & Skills",
            description:
              "Configurable AI agents that call your tools, run Anthropic-standard skills in a sandbox, federate over MCP, and orchestrate multi-step chat flows.",
          },
          items: [
            "ai-agents",
            "tool-calling",
            "custom-tools",
            "mcp-servers",
            "skills",
            "agent-workspace",
            "chat-flow",
            "human-in-the-loop",
            "webhooks",
            "routines",
            "experiments",
            "agent-eval",
          ],
        },
        // ── Run it ───────────────────────────────────────────────────────
        {
          type: "category",
          label: "Deploy & Operate",
          link: {
            type: "generated-index",
            slug: "/category/deploy-operate",
            title: "Deploy & Operate",
            description:
              "Self-host on your own infrastructure: install, configure any LLM provider, run multi-tenant, and observe cost, tokens and conversations.",
          },
          items: [
            "installation-guide",
            "configuration-reference",
            "genai-llm",
            "llm-instances",
            "assets",
            "multi-tenancy",
            "administration-guide",
            "observability",
            "logging",
            "chat-analytics",
            "token-usage",
            "cost-governance",
          ],
        },
        {
          type: "category",
          label: "Developers",
          items: [
            "developer-guide",
            "react-sdk",
            "showcase",
            "conversion-analytics",
            "rest-api",
            "graphql",
          ],
        },
        {
          type: "category",
          label: "Security",
          items: [
            "security-authentication",
            "security-social-login",
            "security-keycloak",
          ],
        },
        {
          type: "link",
          label: "Storybook (React SDK)",
          href: "https://turing.viglet.org/react-sdk",
        },
      ],
    },
  ],
};

export default sidebars;
