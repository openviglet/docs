import React, { type ReactNode } from "react";
import clsx from "clsx";
import { useWindowSize } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import DocItemPaginator from "@theme/DocItem/Paginator";
import DocVersionBanner from "@theme/DocVersionBanner";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocItemFooter from "@theme/DocItem/Footer";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocItemTOCDesktop from "@theme/DocItem/TOC/Desktop";
import DocItemContent from "@theme/DocItem/Content";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import ContentVisibility from "@theme/ContentVisibility";
import type { Props } from "@theme/DocItem/Layout";
import { TOCProvider, useTOCCollapsed } from "@site/src/contexts/TOCContext";

import styles from "./styles.module.css";

function useDocTOC() {
  const { frontMatter, toc } = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;

  const desktop =
    canRender && (windowSize === "desktop" || windowSize === "ssr") ? (
      <DocItemTOCDesktop />
    ) : undefined;

  return { hidden, mobile, desktop };
}

function DocItemLayoutInner({ children }: Props): ReactNode {
  const docTOC = useDocTOC();
  const { metadata } = useDoc();
  const { collapsed } = useTOCCollapsed();

  return (
    <div className="row">
      <div
        className={clsx(
          "col",
          !docTOC.hidden && !collapsed && styles.docItemCol
        )}
      >
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      {docTOC.desktop && (
        <div
          className={clsx(
            "col",
            collapsed ? styles.tocColCollapsed : "col--3"
          )}
        >
          {docTOC.desktop}
        </div>
      )}
    </div>
  );
}

export default function DocItemLayout({ children }: Props): ReactNode {
  return (
    <TOCProvider>
      <DocItemLayoutInner>{children}</DocItemLayoutInner>
    </TOCProvider>
  );
}
