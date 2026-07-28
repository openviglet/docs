import { applyTrailingSlash } from "@docusaurus/utils-common";
import type { DocusaurusConfig } from "@docusaurus/types";

/**
 * Docusaurus builds its JSON-LD (blog Blog/BlogPosting, docs BreadcrumbList) as
 * `${siteConfig.url}${permalink}`, and a raw permalink never carries the
 * trailing slash that `trailingSlash: true` adds to the real route. Each page
 * then ships two conflicting canonical signals: `<link rel="canonical"
 * href=".../blog/">` against a `mainEntityOfPage` of `.../blog`. Google resolves
 * the conflict by picking its own canonical, which surfaces in Search Console as
 * "Duplicate, Google chose a different canonical than the user".
 *
 * `withCanonicalUrls` rewrites the URL-bearing keys of a structured-data tree so
 * they match the canonical tag and the sitemap exactly.
 */

type UrlConfig = Pick<DocusaurusConfig, "url" | "trailingSlash" | "baseUrl">;

/**
 * Keys whose string value is a page URL. `item` covers BreadcrumbList entries;
 * `image` also uses `@id`, hence the FILE_LIKE guard below.
 */
const URL_KEYS = new Set(["@id", "mainEntityOfPage", "url", "item"]);

/** A last segment with an extension is an asset (banner.jpg), not a route. */
const FILE_LIKE = /\/[^/]+\.[a-z0-9]+$/i;

function normalizeUrl(value: string, config: UrlConfig): string {
  if (!value.startsWith(config.url)) return value;

  const route = value.slice(config.url.length) || "/";
  if (FILE_LIKE.test(route) || route.includes("#") || route.includes("?")) {
    return value;
  }

  return (
    config.url +
    applyTrailingSlash(route, {
      trailingSlash: config.trailingSlash,
      baseUrl: config.baseUrl,
    })
  );
}

export function withCanonicalUrls<T>(data: T, config: UrlConfig): T {
  if (Array.isArray(data)) {
    return data.map((item) => withCanonicalUrls(item, config)) as T;
  }
  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) =>
        typeof value === "string" && URL_KEYS.has(key)
          ? [key, normalizeUrl(value, config)]
          : [key, withCanonicalUrls(value, config)],
      ),
    ) as T;
  }
  return data;
}
