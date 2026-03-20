import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Viglet Docs",
  tagline: "Documentation for Turing ES, Shio CMS and Dumont DEP",
  favicon: "img/favicon.png",

  url: "https://docs.viglet.com",
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
        indexBlog: false,
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
              label: "2026.1",
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
        blog: false,
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
            label: "0.3.7",
            badge: true,
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
            label: "2026.1",
            badge: false,
          },
        },
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
      items: [],
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
  } satisfies Preset.ThemeConfig,
};

export default config;
