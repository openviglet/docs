import React, { type ReactNode } from "react";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useBlogListPageStructuredData } from "@docusaurus/plugin-content-blog/client";
import type { Props } from "@theme/BlogListPage/StructuredData";
import { withCanonicalUrls } from "@site/src/lib/structuredDataUrls";

/**
 * Ejected from theme-classic only to run the upstream JSON-LD through
 * `withCanonicalUrls`: see src/lib/structuredDataUrls.ts for why.
 */
export default function BlogListPageStructuredData(props: Props): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const structuredData = withCanonicalUrls(
    useBlogListPageStructuredData(props),
    siteConfig,
  );

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Head>
  );
}
