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
        "administration-guide",
        "developer-guide",
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
            "chat",
            "token-usage",
          ],
        },
        {
          type: "category",
          label: "Technical Reference",
          items: [
            "architecture-overview",
            "sn-concepts",
            "security-keycloak",
          ],
        },
        "release-notes",
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
