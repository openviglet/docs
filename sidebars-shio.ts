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
      items: ["installation-guide", "developer-guide"],
    },
  ],
};

export default sidebars;
