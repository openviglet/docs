import type { Plugin, LoadContext } from "@docusaurus/types";
import * as fs from "fs";
import * as path from "path";

type DocInfo = {
  title: string;
  permalink: string;
};

type ProductConfig = {
  pluginId: string;
  label: string;
};

type PluginOptions = {
  title: string;
  description: string;
  products: ProductConfig[];
};

function extractDocsFromSidebar(
  items: any[],
  docsById: Map<string, DocInfo>,
): DocInfo[] {
  const result: DocInfo[] = [];
  for (const item of items) {
    if (item.type === "doc" || item.type === "ref") {
      const doc = docsById.get(item.id);
      if (doc) result.push(doc);
    } else if (item.type === "category") {
      if (item.link?.type === "doc") {
        const doc = docsById.get(item.link.id);
        if (doc) result.push(doc);
      }
      if (item.items) {
        result.push(...extractDocsFromSidebar(item.items, docsById));
      }
    }
  }
  return result;
}

export default function llmsTxtPlugin(
  _context: LoadContext,
  options: PluginOptions,
): Plugin {
  const productDocs = new Map<string, DocInfo[]>();

  return {
    name: "llms-txt-plugin",

    async allContentLoaded({ allContent }) {
      const docsContent =
        allContent["docusaurus-plugin-content-docs"] as Record<string, any>;
      if (!docsContent) return;

      for (const product of options.products) {
        const content = docsContent[product.pluginId];
        if (!content?.loadedVersions) continue;

        const currentVersion = content.loadedVersions.find(
          (v: any) => v.versionName === "current",
        );
        if (!currentVersion) continue;

        const docsById = new Map<string, DocInfo>();
        for (const doc of currentVersion.docs) {
          docsById.set(doc.id, {
            title: doc.title,
            permalink: doc.permalink,
          });
        }

        const allSidebarItems = Object.values(
          currentVersion.sidebars || {},
        ).flat() as any[];

        if (allSidebarItems.length > 0) {
          productDocs.set(
            product.pluginId,
            extractDocsFromSidebar(allSidebarItems, docsById),
          );
        } else {
          productDocs.set(product.pluginId, Array.from(docsById.values()));
        }
      }
    },

    async postBuild({ outDir, siteConfig }) {
      const lines: string[] = [];
      lines.push(`# ${options.title}`);
      lines.push("");
      lines.push(`> ${options.description}`);

      for (const product of options.products) {
        const docs = productDocs.get(product.pluginId);
        if (!docs || docs.length === 0) continue;

        lines.push("");
        lines.push(`## ${product.label}`);
        lines.push("");
        for (const doc of docs) {
          lines.push(`- [${doc.title}](${siteConfig.url}${doc.permalink})`);
        }
      }

      lines.push("");
      fs.writeFileSync(path.join(outDir, "llms.txt"), lines.join("\n"));
    },
  };
}
