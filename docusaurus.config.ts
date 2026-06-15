import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Viglet Docs",
  tagline: "Documentation for Turing ES, Shio CMS and Dumont DEP",
  favicon: "img/favicon.png",

  url: "https://docs.viglet.org",
  baseUrl: "/",

  organizationName: "vigletdocs",
  projectName: "vigletdocs.github.io",
  deploymentBranch: "gh-pages",
  trailingSlash: false,

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
      // schema.org structured data — helps search engines and LLMs identify
      // Viglet Turing ES as enterprise search software for AEM/WordPress.
      tagName: "script",
      attributes: { type: "application/ld+json" },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Viglet Turing ES",
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
        codeRepository: "https://github.com/openviglet/turing",
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
          blogTitle: "Viglet Blog — Enterprise Search & AI",
          blogDescription:
            "Guides and comparisons on enterprise search for Adobe AEM and WordPress, semantic search, RAG, and AI agents with Viglet Turing ES.",
          showReadingTime: true,
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
          postsPerPage: 10,
          feedOptions: {
            type: ["rss", "atom"],
            title: "Viglet Blog — Enterprise Search & AI",
            description:
              "Enterprise search for Adobe AEM and WordPress, semantic search, RAG, and AI agents with Viglet Turing ES.",
            copyright: `Copyright © ${new Date().getFullYear()} Viglet.`,
            language: "en",
          },
          onInlineAuthors: "ignore",
          onUntruncatedBlogPosts: "ignore",
        },
        theme: {
          customCss: "./src/css/custom.css",
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
      require.resolve("./src/plugins/llms-txt"),
      {
        title: "Viglet Docs",
        description:
          "Documentation for Turing ES, Shio CMS and Dumont DEP",
        products: [
          {
            pluginId: "turing",
            label: "Turing ES - Enterprise Search with Generative AI",
          },
          {
            pluginId: "shio",
            label: "Shio CMS - Content Management System",
          },
          {
            pluginId: "dumont",
            label: "Dumont DEP - Data Entry Platform",
          },
        ],
      },
    ],
  ],

  themeConfig: {
    image: "img/banner.jpg",
    metadata: [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@VigletTweet" },
      { name: "twitter:creator", content: "@VigletTweet" },
    ],
    navbar: {
      title: "viglet",
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
