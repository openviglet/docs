import React, { useState, useEffect } from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import useGlobalData from "@docusaurus/useGlobalData";
import { useColorMode } from "@docusaurus/theme-common";
import ColorModeToggle from "@theme/ColorModeToggle";
// @ts-ignore
import SearchBar from "@theme/SearchBar";
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
  { id: "dumont", label: "Dumont DEP", path: "/dumont", dot: "#006400", pluginId: "dumont", github: "https://github.com/openviglet/dumont-ce" },
  { id: "shio", label: "Shio CMS", path: "/shio", dot: "#FF6347", pluginId: "shio", github: "https://github.com/openviglet/shio-ce", release: "2026.1" },
  { id: "turing", label: "Turing ES", path: "/turing", dot: "#4169E1", pluginId: "turing", github: "https://github.com/openviglet/turing-ce", release: "2026.1" },
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
  const { colorMode, setColorMode } = useColorMode();
  if (!isOpen) return null;

  return (
    <div className="nav-mobile-dropdown">
      <div className="nav-mobile-dropdown-inner">
        {activeProduct && (
          <div className="nav-mobile-search">
            <SearchBar />
          </div>
        )}
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
        <div className="nav-mobile-item nav-mobile-theme-toggle">
          <ColorModeToggle value={colorMode} onChange={setColorMode} />
          <span className="text-muted-foreground text-sm">Tema</span>
        </div>
        <hr className="nav-mobile-hr" />
        <a
          href="https://viglet.org"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-mobile-cta"
          onClick={onClose}
        >
          viglet.org
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="nav-external-icon">
            <path d="M3.5 1.5H10.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
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

          {/* Desktop right: search (docs pages only) + color toggle + CTA */}
          <div className="nav-right">
            {activeProduct && (
              <div className="nav-search">
                <SearchBar />
              </div>
            )}
            <ColorModeToggle value={colorMode} onChange={setColorMode} />
            <Button variant="default" size="sm" asChild>
              <a href="https://viglet.org" target="_blank" rel="noopener noreferrer">
                viglet.org
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="nav-external-icon">
                  <path d="M3.5 1.5H10.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
  );
}
