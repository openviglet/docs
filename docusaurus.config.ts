import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// The plugin's default exclusions, plus COVERAGE.md: an internal engineering
// matrix kept beside the docs it gates, never a published page.
const docsExclude = [
  "**/_*.{js,jsx,ts,tsx,md,mdx}",
  "**/_*/**",
  "**/*.test.{js,jsx,ts,tsx}",
  "**/__tests__/**",
  "**/COVERAGE.md",
];

const config: Config = {
  title: "Viglet Docs",
  tagline:
    "Install and run Viglet Turing for enterprise search, RAG and AI agents over your own content, with Viglet Dumont connectors and the Viglet Shio headless CMS.",
  favicon: "img/favicon.png",

  url: "https://docs.viglet.org",
  baseUrl: "/",

  organizationName: "vigletdocs",
  projectName: "vigletdocs.github.io",
  deploymentBranch: "gh-pages",
  trailingSlash: true,

  onBrokenLinks: "warn",
  onBrokenAnchors: "warn",

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  themes: [
    "@docusaurus/theme-mermaid",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      {
        hashed: true,
        language: ["en", "pt"],
        docsRouteBasePath: ["turing", "shio", "dumont"],
        indexDocs: true,
        indexBlog: true,
        indexPages: false,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
        explicitSearchResultPath: true,
        searchBarShortcutHint: false,
      },
    ],
  ],

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  headTags: [
    {
      // schema.org structured data: helps search engines and LLMs identify
      // Viglet Turing as enterprise search software for AEM/WordPress.
      tagName: "script",
      attributes: { type: "application/ld+json" },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Viglet Turing",
        alternateName: "Turing Enterprise Search",
        applicationCategory: "Enterprise Search Software",
        applicationSubCategory:
          "Enterprise search for Adobe AEM, WordPress, databases, and files",
        operatingSystem: "Cross-platform (Java 21, Docker)",
        description:
          "Open-source enterprise search platform with semantic navigation, faceted search, generative AI (RAG), and AI agents. Indexes Adobe Experience Manager (AEM), WordPress, databases, and file systems. A self-hosted alternative to Algolia, Coveo, and Lucidworks.",
        url: "https://www.viglet.org/turing/",
        downloadUrl: "https://www.viglet.org/turing/download/",
        softwareHelp: "https://docs.viglet.org/turing/",
        codeRepository: "https://github.com/openviglet/turing-ce",
        license: "https://www.apache.org/licenses/LICENSE-2.0",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Organization",
          name: "Viglet",
          url: "https://www.viglet.org",
        },
      }),
    },
    {
      tagName: "script",
      attributes: {
        async: "true",
        src: "https://www.googletagmanager.com/gtag/js?id=G-GH4HMEGEZD",
      },
    },
    {
      tagName: "script",
      attributes: {},
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-GH4HMEGEZD');
      `,
    },
    {
      tagName: "script",
      attributes: {
        async: "true",
        src: "https://www.googletagmanager.com/gtag/js?id=G-SMSL7R3897",
      },
    },
    {
      tagName: "script",
      attributes: {},
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-SMSL7R3897');
      `,
    },
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          id: "turing",
          path: "docs-turing",
          routeBasePath: "turing",
          sidebarPath: "./sidebars-turing.ts",
          exclude: docsExclude,
          editUrl:
            "https://github.com/vigletdocs/vigletdocs.github.io/tree/main/",
          lastVersion: "current",
          versions: {
            current: {
              label: "2026.3",
              badge: false,
            },
          },
          onlyIncludeVersions: [
            "current",
            "0.3.9",
            "0.3.8",
            "0.3.7",
            "0.3.6",
            "0.3.5",
          ],
        },
        blog: {
          path: "blog",
          routeBasePath: "blog",
          blogTitle: "Viglet Blog: Enterprise Search & AI",
          blogDescription:
            "Guides and comparisons on enterprise search for Adobe AEM and WordPress, semantic search, RAG, and AI agents with Viglet Turing.",
          showReadingTime: true,
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
          postsPerPage: 10,
          feedOptions: {
            type: ["rss", "atom"],
            title: "Viglet Blog: Enterprise Search & AI",
            description:
              "Enterprise search for Adobe AEM and WordPress, semantic search, RAG, and AI agents with Viglet Turing.",
            copyright: `Copyright © ${new Date().getFullYear()} Viglet.`,
            language: "en",
          },
          onInlineAuthors: "ignore",
          onUntruncatedBlogPosts: "ignore",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        sitemap: {
          lastmod: "date",
          changefreq: "weekly",
          priority: 0.5,
          // Old Turing versions (0.3.x) are near-duplicate, legacy content:
          // keep them reachable but out of the sitemap to preserve crawl
          // budget. They are also marked noindex via a <head> tag in each
          // versioned doc.
          ignorePatterns: [
            "/turing/0.3.5/**",
            "/turing/0.3.6/**",
            "/turing/0.3.7/**",
            "/turing/0.3.8/**",
            "/turing/0.3.9/**",
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "shio",
        path: "docs-shio",
        routeBasePath: "shio",
        sidebarPath: "./sidebars-shio.ts",
        exclude: docsExclude,
        editUrl:
          "https://github.com/vigletdocs/vigletdocs.github.io/tree/main/",
        lastVersion: "current",
        versions: {
          current: {
            label: "2026.3",
            badge: false,
          },
        },
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "dumont",
        path: "docs-dumont",
        routeBasePath: "dumont",
        sidebarPath: "./sidebars-dumont.ts",
        exclude: docsExclude,
        editUrl:
          "https://github.com/vigletdocs/vigletdocs.github.io/tree/main/",
        lastVersion: "current",
        versions: {
          current: {
            label: "2026.3",
            badge: false,
          },
        },
      },
    ],
    [
      // Emits /guides.json: the endpoint viglet.org fetches to cross-link the
      // published blog guides dynamically (drafts excluded upstream).
      require.resolve("./src/plugins/guides-json"),
      {
        knownProducts: ["turing", "shio", "dumont"],
      },
    ],
    [
      require.resolve("./src/plugins/llms-txt"),
      {
        title: "Viglet Docs",
        description:
          "Documentation for Viglet Turing, Viglet Shio and Viglet Dumont",
        products: [
          {
            pluginId: "turing",
            label: "Viglet Turing - Enterprise Search with Generative AI",
          },
          {
            pluginId: "shio",
            label: "Viglet Shio - Content Management System",
          },
          {
            pluginId: "dumont",
            label: "Viglet Dumont - Data Entry Platform",
          },
        ],
      },
    ],
    [
      // SH715: a URL is the one part of a page other people's documents point at, so renaming a
      // slug without this converts their link into a 404 rather than into different wording. The
      // plugin is the FIRST deliverable and the rename the second; in the other order the rename
      // ships a defect that only shows up in somebody else's bookmark.
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          // SH705 rewrote the curator hub's every sentence and deliberately left its address
          // alone. SH715 moves the address to match the copy, and this is what keeps the old one
          // answering.
          {
            from: "/shio/category/human-curates-it",
            to: "/shio/category/curator-approves-it",
          },
        ],
      },
    ],
  ],

  themeConfig: {
    image: "img/banner.jpg",
    metadata: [{ name: "twitter:card", content: "summary_large_image" }],
    navbar: {
      title: "Viglet",
      logo: {
        alt: "Viglet Logo",
        src: "img/viglet_logo_sm.png",
        width: 28,
        height: 28,
      },
      items: [
        { to: "/blog", label: "Blog", position: "left" },
      ],
    },
    footer: {
      style: "dark",
      links: [],
      copyright: " ",
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["java", "bash", "sql", "ini", "json", "markup"],
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
