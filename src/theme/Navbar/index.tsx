import React, { useState, useEffect } from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import useGlobalData from "@docusaurus/useGlobalData";
import { useColorMode } from "@docusaurus/theme-common";
import ColorModeToggle from "@theme/ColorModeToggle";
import { Button } from "@site/src/components/ui/button";
import { Badge } from "@site/src/components/ui/badge";
import VigletLogo from "@site/src/components/VigletLogo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@site/src/components/ui/dropdown-menu";

interface Product {
  id: string;
  label: string;
  path: string;
  dot: string;
  pluginId: string;
  github: string;
  release?: string;
}

interface Version {
  name: string;
  label: string;
  path: string;
  isLast: boolean;
}

interface VersionsResult {
  versions: Version[];
}

export const PRODUCTS: Product[] = [
  { id: "turing", label: "Turing ES", path: "/turing", dot: "#4169E1", pluginId: "turing", github: "https://github.com/openviglet/turing", release: "2026.1" },
  { id: "shio", label: "Shio CMS", path: "/shio", dot: "#FF6347", pluginId: "shio", github: "https://github.com/openviglet/shio", release: "0.3.7" },
  { id: "dumont", label: "Dumont DEP", path: "/dumont", dot: "#006400", pluginId: "dumont", github: "https://github.com/openviglet/dumont" },
];

function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState<boolean>(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

export function useVersions(pluginId: string | undefined): VersionsResult {
  const globalData = useGlobalData();
  try {
    const pluginData = (globalData as Record<string, Record<string, { versions?: Version[] }>>)?.["docusaurus-plugin-content-docs"]?.[pluginId as string];
    if (!pluginData) return { versions: [] };
    return { versions: pluginData.versions || [] };
  } catch {
    return { versions: [] };
  }
}

export function useActiveProduct(): Product | null {
  const { pathname } = useLocation();
  for (const p of PRODUCTS) {
    if (pathname.startsWith(p.path)) return p;
  }
  return null;
}

function useActiveVersionFromPath(product: Product | null): Version | null {
  const { pathname } = useLocation();
  const { versions } = useVersions(product?.pluginId);
  if (!product || versions.length === 0) return null;
  for (const v of versions) {
    if (v.isLast && pathname.startsWith(product.path)) {
      const nonCurrent = versions.filter((ver) => !ver.isLast);
      for (const nc of nonCurrent) {
        if (pathname.startsWith(nc.path)) return nc;
      }
      return v;
    }
    if (pathname.startsWith(v.path)) return v;
  }
  return versions[0] || null;
}

/* ── Version Dropdown (Radix) ── */
function VersionDropdown({ product }: { product: Product }): JSX.Element | null {
  const { versions } = useVersions(product.pluginId);
  const activeVersion = useActiveVersionFromPath(product);

  if (versions.length <= 1) {
    return activeVersion ? (
      <Badge variant="version">{activeVersion.label}</Badge>
    ) : null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="nav-version-badge nav-version-badge--dropdown">
          {activeVersion?.label || "version"}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="ml-1">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {versions.map((v) => (
          <DropdownMenuItem key={v.name} asChild>
            <Link
              to={v.path}
              className={`nav-version-item ${activeVersion?.name === v.name ? "nav-version-item--active" : ""}`}
            >
              <span>{v.label}</span>
              {v.isLast && <Badge variant="latest">latest</Badge>}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Desktop Product Nav Item with ping dot ── */
function ProductNavItem({ product, isActive }: { product: Product; isActive: boolean }): JSX.Element {
  return (
    <div className="nav-product-group">
      <Link to={product.path} className={`nav-product-link ${isActive ? "nav-product-link--active" : ""}`}>
        <span className="nav-dot-container">
          <span className="nav-product-dot" style={{ backgroundColor: product.dot }} />
          <span className="nav-product-dot-ping" style={{ backgroundColor: product.dot }} />
        </span>
        <span className="nav-product-label">{product.label}</span>
      </Link>
      {isActive && <VersionDropdown product={product} />}
    </div>
  );
}

/* ── Mobile Dropdown Menu (below header, not overlay) ── */
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): JSX.Element | null {
  const activeProduct = useActiveProduct();
  if (!isOpen) return null;

  return (
    <div className="nav-mobile-dropdown">
      <div className="nav-mobile-dropdown-inner">
        {PRODUCTS.map((p) => {
          const isActive = activeProduct?.id === p.id;
          return (
            <Link
              key={p.id}
              to={p.path}
              className={`nav-mobile-item ${isActive ? "nav-mobile-item--active" : ""}`}
              onClick={onClose}
            >
              <VigletLogo product={p.id} size={28} />
              <span>{p.label}</span>
            </Link>
          );
        })}
        <hr className="nav-mobile-hr" />
        <a
          href="https://docs.viglet.com"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-mobile-cta"
          onClick={onClose}
        >
          Get Started
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ── Solution Menu (product sub-navbar) ── */
function SolutionMenu(): JSX.Element | null {
  const activeProduct = useActiveProduct();
  const { pathname } = useLocation();

  if (!activeProduct) return null;

  const tabs = [
    { label: "Overview", path: activeProduct.path },
  ];
  if (activeProduct.release) {
    tabs.push(
      { label: "Download", path: `${activeProduct.path}/download` },
      { label: "Release Notes", path: `${activeProduct.path}/release-notes` },
    );
  }

  const isTabActive = (tabPath: string) => {
    if (tabPath === activeProduct.path) {
      // "Overview" is active when on the root product path or any doc page
      // that doesn't match other tabs
      return !tabs.slice(1).some((t) => pathname.startsWith(t.path));
    }
    return pathname.startsWith(tabPath);
  };

  return (
    <div className="solution-menu">
      <div className="solution-menu-container">
        <Link to={activeProduct.path} className={`solution-brand product-nav-link-${activeProduct.id}`}>
          <VigletLogo product={activeProduct.id} size={28} />
          <span className="solution-brand-name">{activeProduct.label}</span>
        </Link>

        <div className="solution-tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.path}
              className={`solution-tab ${isTabActive(tab.path) ? `solution-tab--active product-tab-active-${activeProduct.id}` : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {activeProduct.github && (
          <>
            <div className="solution-separator" />
            <a
              href={activeProduct.github}
              target="_blank"
              rel="noopener noreferrer"
              className="solution-github"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="solution-github-text">GitHub</span>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Navbar ── */
export default function Navbar(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrolled();
  const activeProduct = useActiveProduct();
  const { colorMode, setColorMode } = useColorMode();
  const { pathname } = useLocation();

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <nav className={`navbar navbar--fixed-top nav-root ${scrolled ? "nav-root--scrolled" : ""}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <img src="/img/viglet_logo_sm.png" alt="Viglet" width={28} height={28} className="nav-logo-img" />
            <span className="nav-logo-text">viglet</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-products">
            {PRODUCTS.map((p) => (
              <ProductNavItem key={p.id} product={p} isActive={activeProduct?.id === p.id} />
            ))}
          </div>

          {/* Desktop right: CTA + color toggle */}
          <div className="nav-right">
            <ColorModeToggle value={colorMode} onChange={setColorMode} />
            <Button variant="default" size="sm" asChild>
              <a href="https://docs.viglet.com" target="_blank" rel="noopener noreferrer">
                Get Started
              </a>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="nav-hamburger"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown (pushes content, not overlay) */}
        <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </nav>

      {/* Solution sub-menu for product pages */}
      <SolutionMenu />
    </>
  );
}
