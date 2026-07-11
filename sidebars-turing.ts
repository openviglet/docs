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
            type: "doc",
            id: "enterprise-search",
          },
          items: [
            "search-engine",
            "semantic-navigation",
            "synonyms",
            "thesaurus",
            "manifest",
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
            "migration",
          ],
        },
        // ── Ask it ───────────────────────────────────────────────────────
        {
          type: "category",
          label: "RAG & Chat",
          link: {
            type: "doc",
            id: "rag-chat",
          },
          items: [
            "rag",
            "embedding-stores",
            "embedding-models",
            "reranking",
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
            type: "doc",
            id: "agents",
          },
          items: [
            "ai-agents",
            "tool-calling",
            "capabilities",
            "client-tools",
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
            type: "doc",
            id: "deploy-operate",
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
            "javascript-sdk",
            "cli",
            "flow-dsl",
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
