import React, { type ReactNode, useState, useCallback } from "react";
import clsx from "clsx";
import {
  prefersReducedMotion,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import { useLocation } from "@docusaurus/router";
import DocSidebar from "@theme/DocSidebar";
import type { Props } from "@theme/DocRoot/Layout/Sidebar";
import { SidebarCollapseProvider } from "@site/src/contexts/SidebarCollapseContext";

import styles from "./styles.module.css";

function ResetOnSidebarChange({ children }: { children: ReactNode }) {
  const sidebar = useDocsSidebar();
  return (
    <React.Fragment key={sidebar?.name ?? "noSidebar"}>
      {children}
    </React.Fragment>
  );
}

function ToggleChevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function DocRootLayoutSidebar({
  sidebar,
  hiddenSidebarContainer,
  setHiddenSidebarContainer,
}: Props): ReactNode {
  const { pathname } = useLocation();

  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }
    if (!hiddenSidebar && prefersReducedMotion()) {
      setHiddenSidebar(true);
    }
    setHiddenSidebarContainer((value: boolean) => !value);
  }, [setHiddenSidebarContainer, hiddenSidebar]);

  return (
    <aside
      className={clsx(
        ThemeClassNames.docs.docSidebarContainer,
        styles.docSidebarContainer,
        hiddenSidebarContainer && styles.docSidebarContainerHidden
      )}
      onTransitionEnd={(e) => {
        if (
          !e.currentTarget.classList.contains(styles.docSidebarContainer!)
        ) {
          return;
        }
        if (hiddenSidebarContainer) {
          setHiddenSidebar(true);
        }
      }}
    >
      <ResetOnSidebarChange>
        <div
          className={clsx(
            styles.sidebarViewport,
            hiddenSidebar && styles.sidebarViewportHidden
          )}
        >
          {/* ── Expanded: sidebar with collapse passed via context ── */}
          {!hiddenSidebar && (
            <SidebarCollapseProvider onCollapse={toggleSidebar}>
              <DocSidebar
                sidebar={sidebar}
                path={pathname}
                onCollapse={toggleSidebar}
                isHidden={hiddenSidebar}
              />
            </SidebarCollapseProvider>
          )}

          {/* ── Collapsed: just the expand button ── */}
          {hiddenSidebar && (
            <div className={styles.collapsedBar}>
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={toggleSidebar}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ToggleChevron />
              </button>
            </div>
          )}
        </div>
      </ResetOnSidebarChange>
    </aside>
  );
}
