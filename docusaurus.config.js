// @ts-check
import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Viglet Docs",
  tagline: "Documentation for Turing ES, Shio CMS and Vecchio Auth",
  favicon: "img/favicon.png",

  url: "https://docs.viglet.org",
  baseUrl: "/",

  organizationName: "vigletdocs",
  projectName: "vigletdocs.github.io",
  deploymentBranch: "gh-pages",
  trailingSlash: false,

  onBrokenLinks: "warn",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

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
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          id: "turing",
          path: "docs-turing",
          routeBasePath: "turing",
          sidebarPath: "./sidebars-turing.js",
          editUrl:
            "https://github.com/vigletdocs/vigletdocs.github.io/tree/main/",
          lastVersion: "current",
          versions: {
            current: {
              label: "2026.1",
              badge: true,
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
      }),
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "shio",
        path: "docs-shio",
        routeBasePath: "shio",
        sidebarPath: "./sidebars-shio.js",
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
        id: "vecchio",
        path: "docs-vecchio",
        routeBasePath: "vecchio",
        sidebarPath: "./sidebars-vecchio.js",
        editUrl:
          "https://github.com/vigletdocs/vigletdocs.github.io/tree/main/",
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
        // Custom footer rendered via src/theme/Footer/index.js
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
    }),
};

export default config;
