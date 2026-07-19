import type { Plugin, LoadContext } from "@docusaurus/types";
import * as fs from "fs";
import * as path from "path";

/**
 * guides-json plugin — emits a machine-readable `/guides.json` endpoint of the
 * PUBLISHED blog guides, consumed by the viglet.org marketing site (Block E /
 * W14 + W15) to cross-link into these posts dynamically.
 *
 * Why an endpoint: viglet.org must never hardcode this list (it would drift and
 * risk linking drafts that 404). Docusaurus excludes `draft: true` posts from the
 * production build, so `blogPosts` here already contains only live posts — this
 * endpoint is the single source of truth. GitHub Pages serves it CORS-open
 * (`Access-Control-Allow-Origin: *`), so viglet.org can fetch it at runtime.
 *
 * Product mapping (`solutions`): explicit `viglet_products` frontmatter wins;
 * otherwise a conservative heuristic — every guide maps to Turing ES (the search
 * platform), plus Dumont DEP when the post concerns a source connector (AEM /
 * WordPress). Override per-post with frontmatter when needed.
 */

type Guide = {
  slug: string;
  title: string;
  description: string;
  url: string;
  date: string;
  tags: string[];
  solutions: string[];
};

type PluginOptions = {
  /** Products present in the ecosystem — used to validate frontmatter overrides. */
  knownProducts?: string[];
};

const SOURCE_TAGS_TO_DUMONT = new Set(["aem", "wordpress", "adobe-aem", "eds"]);

function deriveSolutions(
  tags: string[],
  frontMatter: Record<string, unknown>,
  known: string[],
): string[] {
  const explicit = frontMatter?.viglet_products;
  if (Array.isArray(explicit) && explicit.length > 0) {
    const filtered = explicit
      .map((p) => String(p))
      .filter((p) => known.length === 0 || known.includes(p));
    if (filtered.length > 0) return Array.from(new Set(filtered));
  }
  // Heuristic fallback: all guides are Turing-centric; add Dumont for connectors.
  const solutions = new Set<string>(["turing"]);
  for (const t of tags) {
    if (SOURCE_TAGS_TO_DUMONT.has(t.toLowerCase())) solutions.add("dumont");
  }
  return Array.from(solutions);
}

function toIsoDate(value: unknown): string {
  try {
    const d = value instanceof Date ? value : new Date(String(value));
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {
    /* ignore */
  }
  return "";
}

export default function guidesJsonPlugin(
  _context: LoadContext,
  options: PluginOptions = {},
): Plugin {
  const known = options.knownProducts ?? ["turing", "shio", "dumont"];
  const guides: Guide[] = [];

  return {
    name: "guides-json-plugin",

    async allContentLoaded({ allContent }) {
      const blogContent = allContent["docusaurus-plugin-content-blog"] as
        | Record<string, any>
        | undefined;
      if (!blogContent) return;

      for (const instance of Object.values(blogContent)) {
        const posts = (instance as any)?.blogPosts ?? [];
        for (const post of posts) {
          const meta = post?.metadata;
          if (!meta?.permalink || !meta?.title) continue;

          const frontMatter = (meta.frontMatter ?? {}) as Record<string, unknown>;
          const slug =
            (typeof frontMatter.slug === "string" && frontMatter.slug) ||
            meta.permalink.split("/").filter(Boolean).pop() ||
            meta.permalink;
          const tags: string[] = Array.isArray(meta.tags)
            ? meta.tags.map((t: any) => t?.label ?? t).filter(Boolean)
            : [];

          guides.push({
            slug,
            title: meta.title,
            description: meta.description ?? "",
            url: meta.permalink, // made absolute in postBuild
            date: toIsoDate(meta.date),
            tags,
            solutions: deriveSolutions(tags, frontMatter, known),
          });
        }
      }

      // Newest first — stable, deterministic output.
      guides.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    },

    async postBuild({ outDir, siteConfig }) {
      const payload = {
        source: siteConfig.url,
        generatedFrom: "docusaurus-blog",
        guides: guides.map((g) => ({
          ...g,
          url: g.url.startsWith("http") ? g.url : `${siteConfig.url}${g.url}`,
        })),
      };
      fs.writeFileSync(
        path.join(outDir, "guides.json"),
        JSON.stringify(payload, null, 2),
      );
    },
  };
}
