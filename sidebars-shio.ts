import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  shioSidebar: [
    {
      type: "category",
      label: "Shio CMS",
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
        {
          type: "category",
          label: "The agent builds it",
          link: {
            type: "doc",
            id: "agent-builds-it",
          },
          items: [
            "mcp",
            "agent-surface",
            "content-as-files",
            "cli",
            "blueprints",
            "website-development",
            "design-tokens",
            "replication",
            "token-economy",
          ],
        },
        {
          type: "category",
          label: "The human curates it",
          link: {
            type: "doc",
            id: "human-curates-it",
          },
          items: [
            "content-console",
            "content-lifecycle",
            "agent-safety",
            "universal-editor",
            "content-modeling",
            "administration-guide",
            "import-export",
          ],
        },
        {
          type: "category",
          label: "The CDA delivers it",
          link: {
            type: "doc",
            id: "cda-delivers-it",
          },
          items: [
            "headless/content-delivery-api",
            "headless/javascript-client",
            "headless/react-sdk",
            "headless/nextjs-starter",
            "graphql",
            "webhooks",
          ],
        },
        {
          type: "category",
          label: "Run it",
          link: {
            type: "doc",
            id: "run-it",
          },
          items: [
            "installation-guide",
            "configuration-reference",
            "multi-tenancy",
            "search-caching",
            "security",
          ],
        },
        {
          type: "category",
          label: "Developers",
          items: ["developer-guide", "rest-api"],
        },
      ],
    },
  ],
};

export default sidebars;
