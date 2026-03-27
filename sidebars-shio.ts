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
          label: "Installation & Configuration",
          items: ["installation-guide", "configuration-reference"],
        },
        {
          type: "category",
          label: "Content Management",
          items: [
            "content-modeling",
            "website-development",
            "search-caching",
          ],
        },
        {
          type: "category",
          label: "Management",
          items: ["administration-guide"],
        },
        {
          type: "category",
          label: "Developers",
          items: ["developer-guide", "rest-api", "graphql"],
        },
        {
          type: "category",
          label: "Security",
          items: ["security"],
        },
        {
          type: "category",
          label: "Integration",
          items: ["import-export"],
        },
      ],
    },
  ],
};

export default sidebars;
