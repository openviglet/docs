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
      items: ["getting-started", "architecture", "developer-guide"],
    },
  ],
};

export default sidebars;
