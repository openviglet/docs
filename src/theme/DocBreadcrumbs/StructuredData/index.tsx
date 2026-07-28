import React, { type ReactNode } from "react";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useBreadcrumbsStructuredData } from "@docusaurus/plugin-content-docs/client";
import type { Props } from "@theme/DocBreadcrumbs/StructuredData";
import { withCanonicalUrls } from "@site/src/lib/structuredDataUrls";

/**
 * Ejected from theme-classic only to run the upstream BreadcrumbList through
 * `withCanonicalUrls`: see src/lib/structuredDataUrls.ts for why.
 */
export default function DocBreadcrumbsStructuredData(props: Props): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const structuredData = withCanonicalUrls(
    useBreadcrumbsStructuredData({ breadcrumbs: props.breadcrumbs }),
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
