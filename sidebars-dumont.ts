import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  dumontSidebar: [
    {
      type: "category",
      label: "Dumont DEP",
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
        "architecture",
        "indexing-plugins",
        {
          type: "category",
          label: "Connectors",
          link: {
            type: "doc",
            id: "connectors/overview",
          },
          items: [
            "connectors/web-crawler",
            "connectors/database",
            "connectors/filesystem",
            "connectors/aem",
            "connectors/wordpress",
          ],
        },
        "developer-guide",
        "rest-api",
        {
          type: "category",
          label: "Extending Connectors",
          items: [
            "extending-aem",
            "extending-database",
          ],
        },
      ],
    },
  ],
};

export default sidebars;
