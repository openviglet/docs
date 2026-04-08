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
        "installation-guide",
        "configuration-reference",
        {
          type: "category",
          label: "Enterprise Search",
          items: [
            "search-engine",
            "semantic-navigation",
            "spa-pages",
            "integration",
            "integration-aem",
            "import-export",
          ],
        },
        {
          type: "category",
          label: "Generative AI",
          items: [
            "genai-llm",
            "rag",
            "llm-instances",
            "embedding-stores",
            "embedding-models",
            "assets",
            "tool-calling",
            "mcp-servers",
            "ai-agents",
            "chat",
            "intent",
            "token-usage",
          ],
        },
        {
          type: "category",
          label: "Management",
          items: [
            "administration-guide",
            "logging",
          ],
        },
        {
          type: "category",
          label: "Developers",
          items: [
            "developer-guide",
            "react-sdk",
            "rest-api",
            "graphql",
          ],
        },
        {
          type: "category",
          label: "Security",
          items: [
            "security-authentication",
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
