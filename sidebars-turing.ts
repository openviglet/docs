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
        "administration-guide",
        {
          type: "category",
          label: "Enterprise Search",
          items: [
            "search-engine",
            "semantic-navigation",
            "integration",
            "integration-aem",
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
            "assets",
            "tool-calling",
            "mcp-servers",
            "ai-agents",
            "chat",
            "token-usage",
          ],
        },
        "developer-guide",
        "rest-api",
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
          label: "Javadoc",
          href: "https://turing.viglet.com/latest/javadoc/",
        },
      ],
    },
  ],
};

export default sidebars;
