import React, { type ReactNode, useState, useCallback } from "react";
import clsx from "clsx";
import TOCItems from "@theme/TOCItems";
import type { Props } from "@theme/TOC";
import { useTOCCollapsed } from "@site/src/contexts/TOCContext";

import styles from "./styles.module.css";

const LINK_CLASS_NAME = "table-of-contents__link toc-highlight";
const LINK_ACTIVE_CLASS_NAME = "table-of-contents__link--active";

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <button
      type="button"
      className={styles.copyLinkButton}
      onClick={handleCopy}
      title="Copy link"
    >
      {copied ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

function ToggleArrow({ collapsed }: Readonly<{ collapsed: boolean }>) {
  return (
    <svg
      className={styles.toggleArrow}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {collapsed ? (
        /* arrow pointing left = click to expand (show panel) */
        <polyline points="15 18 9 12 15 6" />
      ) : (
        /* arrow pointing right = click to collapse (hide panel) */
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

export default function TOC({ className, ...props }: Props): ReactNode {
  const { collapsed, setCollapsed } = useTOCCollapsed();

  return (
    <div className={clsx(styles.tocWrapper, collapsed && styles.tocWrapperCollapsed)}>
      {/* Toggle button — always visible on the left edge */}
      <button
        type="button"
        className={styles.tocCollapseBtn}
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Show table of contents" : "Hide table of contents"}
        title={collapsed ? "Show table of contents" : "Hide table of contents"}
      >
        <ToggleArrow collapsed={collapsed} />
      </button>

      {/* Panel content — slides out to the right when collapsed */}
      <div className={clsx(styles.tocPanel, collapsed && styles.tocPanelCollapsed)}>
        <div
          className={clsx(styles.tableOfContents, "thin-scrollbar", className)}
        >
          <div className={styles.tocHeader}>
            <span className={styles.tocLabel}>ON THIS PAGE</span>
            <CopyLinkButton />
          </div>

          <TOCItems
            {...props}
            linkClassName={LINK_CLASS_NAME}
            linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
          />
        </div>
      </div>
    </div>
  );
}
