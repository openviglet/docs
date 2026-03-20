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
          ],
        },
        "installation-guide",
        "configuration-reference",
        "administration-guide",
        "developer-guide",
        "rest-api",
        {
          type: "category",
          label: "Enterprise Search",
          items: [
            "search-engine",
            "semantic-navigation",
            "integration",
          ],
        },
        {
          type: "category",
          label: "Management",
          items: [
            "assets",
          ],
        },
        {
          type: "category",
          label: "Generative AI",
          items: [
            "genai-llm",
            "llm-instances",
            "embedding-stores",
            "tool-calling",
            "mcp-servers",
            "ai-agents",
            "chat",
            "token-usage",
          ],
        },
        {
          type: "category",
          label: "Technical Reference",
          items: [
            "architecture-overview",
            "security-authentication",
            "security-keycloak",
            "sn-concepts",
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
