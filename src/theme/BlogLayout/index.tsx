import React, { type ReactNode } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import BlogSidebar from "@theme/BlogSidebar";
import type { Props } from "@theme/BlogLayout";
import { useTOCCollapsed } from "@site/src/contexts/TOCContext";

import styles from "./styles.module.css";

/**
 * Swizzled blog layout.
 *
 * Adds the same TOC-collapse-aware column sizing the docs use
 * (@theme/DocItem/Layout): when the reader collapses the "On this page"
 * panel, the TOC column shrinks to just the toggle button and the main
 * content column expands into the freed space. The collapse state comes
 * from the app-wide TOCProvider (see src/theme/Root.tsx).
 *
 * Everything else is identical to the upstream classic-theme BlogLayout.
 */
export default function BlogLayout(props: Props): ReactNode {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;
  const { collapsed } = useTOCCollapsed();
  const tocCollapsed = Boolean(toc) && collapsed;

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          <BlogSidebar sidebar={sidebar} />
          <main
            className={clsx("col", {
              "col--7": hasSidebar && !tocCollapsed,
              "col--9": hasSidebar && tocCollapsed,
              "col--9 col--offset-1": !hasSidebar && !tocCollapsed,
              "col--11 col--offset-1": !hasSidebar && tocCollapsed,
            })}
          >
            {children}
          </main>
          {toc && (
            <div
              className={clsx("col", tocCollapsed ? styles.tocColCollapsed : "col--2")}
            >
              {toc}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
