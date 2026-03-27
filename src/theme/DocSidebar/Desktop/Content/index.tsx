import React, {
  type ReactNode,
  useState,
  useCallback,
  useMemo,
} from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import {
  useAnnouncementBar,
  useScrollPosition,
} from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import DocSidebarItems from "@theme/DocSidebarItems";
import type { Props } from "@theme/DocSidebar/Desktop/Content";
import type { PropSidebarItem } from "@docusaurus/plugin-content-docs";
import { useSidebarCollapse } from "@site/src/contexts/SidebarCollapseContext";

import styles from "./styles.module.css";

function useShowAnnouncementBar() {
  const { isActive } = useAnnouncementBar();
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive);

  useScrollPosition(
    ({ scrollY }) => {
      if (isActive) {
        setShowAnnouncementBar(scrollY === 0);
      }
    },
    [isActive]
  );
  return isActive && showAnnouncementBar;
}

/** Recursively filter sidebar items by keyword */
function filterSidebarItems(
  items: readonly PropSidebarItem[],
  query: string
): PropSidebarItem[] {
  if (!query) return items as PropSidebarItem[];
  const lower = query.toLowerCase();

  return (items as PropSidebarItem[]).reduce<PropSidebarItem[]>((acc, item) => {
    if (item.type === "category") {
      const labelMatch = item.label.toLowerCase().includes(lower);
      const filteredChildren = filterSidebarItems(item.items, query);
      if (labelMatch || filteredChildren.length > 0) {
        acc.push({
          ...item,
          collapsed: false,
          items: labelMatch
            ? (item.items as PropSidebarItem[])
            : filteredChildren,
        });
      }
    } else if (item.type === "link") {
      if (item.label.toLowerCase().includes(lower)) {
        acc.push(item);
      }
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

/** Recursively force all categories to collapsed = false */
function expandAllItems(
  items: readonly PropSidebarItem[]
): PropSidebarItem[] {
  return (items as PropSidebarItem[]).map((item) => {
    if (item.type === "category") {
      return {
        ...item,
        collapsed: false,
        items: expandAllItems(item.items),
      };
    }
    return item;
  });
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon() {
  return (
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function DocSidebarDesktopContent({
  path,
  sidebar,
  className,
}: Props): ReactNode {
  const showAnnouncementBar = useShowAnnouncementBar();
  const { onCollapse } = useSidebarCollapse();
  const [filter, setFilter] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  // Counter to force remount of sidebar items when expand-all toggles
  const [expandKey, setExpandKey] = useState(0);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
    },
    []
  );

  const clearFilter = useCallback(() => {
    setFilter("");
  }, []);

  const toggleExpandAll = useCallback(() => {
    setExpandAll((v) => !v);
    // Bump key to force remount so useCollapsible re-reads initialState
    setExpandKey((k) => k + 1);
  }, []);

  const processedSidebar = useMemo(() => {
    let items = sidebar;
    if (filter) {
      items = filterSidebarItems(items, filter);
    } else if (expandAll) {
      items = expandAllItems(items);
    }
    return items;
  }, [sidebar, filter, expandAll]);

  return (
    <nav
      aria-label={translate({
        id: "theme.docs.sidebar.navAriaLabel",
        message: "Docs sidebar",
        description: "The ARIA label for the sidebar navigation",
      })}
      className={clsx(
        "menu thin-scrollbar",
        styles.menu,
        showAnnouncementBar && styles.menuWithAnnouncementBar,
        className
      )}
    >
      {/* ── Toolbar: filter + collapse + expand-all ── */}
      <div className={styles.sidebarToolbar}>
        <div className={styles.filterRow}>
          <div className={styles.filterWrapper}>
            <SearchIcon />
            <input
            type="text"
            className={styles.filterInput}
            placeholder={translate({
              id: "theme.docs.sidebar.filterPlaceholder",
              message: "Filter",
              description: "Sidebar filter input placeholder",
            })}
            value={filter}
            onChange={handleFilterChange}
            aria-label="Filter sidebar"
          />
          {filter && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={clearFilter}
              aria-label="Clear filter"
            >
              <ClearIcon />
            </button>
          )}
          </div>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={onCollapse}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <label className={styles.expandToggle}>
          <div
            className={clsx(
              styles.toggleTrack,
              expandAll && styles.toggleTrackActive
            )}
            role="switch"
            aria-checked={expandAll}
            tabIndex={0}
            onClick={toggleExpandAll}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleExpandAll();
              }
            }}
          >
            <div className={styles.toggleThumb} />
          </div>
          <span className={styles.expandLabel}>
            {translate({
              id: "theme.docs.sidebar.expandAll",
              message: "Expand all sections",
              description: "Sidebar expand all toggle label",
            })}
          </span>
        </label>
      </div>

      {/* ── Sidebar items — key forces remount on expand-all toggle ── */}
      <ul
        key={expandKey}
        className={clsx(ThemeClassNames.docs.docSidebarMenu, "menu__list")}
      >
        <DocSidebarItems
          items={processedSidebar}
          activePath={path}
          level={1}
        />
      </ul>

      {filter && processedSidebar.length === 0 && (
        <p className={styles.noResults}>No results found.</p>
      )}
    </nav>
  );
}
