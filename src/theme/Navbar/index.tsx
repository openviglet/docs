import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import useGlobalData from "@docusaurus/useGlobalData";
import { useColorMode } from "@docusaurus/theme-common";
import ColorModeToggle from "@theme/ColorModeToggle";

interface Product {
  id: string;
  label: string;
  path: string;
  dot: string;
  pluginId: string;
}

interface Version {
  name: string;
  label: string;
  path: string;
  isLast: boolean;
}

interface VersionsResult {
  versions: Version[];
  activeVersion: Version | null;
}

interface VersionDropdownProps {
  product: Product;
}

interface ProductNavItemProps {
  product: Product;
  isActive: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MobileVersionListProps {
  product: Product;
  onClose: () => void;
}

const PRODUCTS: Product[] = [
  { id: "turing", label: "Turing ES", path: "/turing", dot: "#4169E1", pluginId: "turing" },
  { id: "shio", label: "Shio CMS", path: "/shio", dot: "#FF6347", pluginId: "shio" },
  { id: "dumont", label: "Dumont DEP", path: "/dumont", dot: "#006400", pluginId: "dumont" },
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

function useVersions(pluginId: string | undefined): VersionsResult {
  const globalData = useGlobalData();
  try {
    const pluginData = (globalData as Record<string, Record<string, { versions?: Version[] }>>)?.["docusaurus-plugin-content-docs"]?.[pluginId as string];
    if (!pluginData) return { versions: [], activeVersion: null };
    const versions: Version[] = pluginData.versions || [];
    return { versions, activeVersion: null };
  } catch {
    return { versions: [], activeVersion: null };
  }
}

function useActiveProduct(): Product | null {
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

function VersionDropdown({ product }: VersionDropdownProps): JSX.Element | null {
  const { versions } = useVersions(product.pluginId);
  const activeVersion = useActiveVersionFromPath(product);
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close]);

  if (versions.length <= 1) {
    return activeVersion ? (
      <span className="nav-version-badge">{activeVersion.label}</span>
    ) : null;
  }

  return (
    <div ref={ref} className="nav-version-wrapper">
      <button
        className="nav-version-badge nav-version-badge--dropdown"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {activeVersion?.label || "version"}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ marginLeft: 4, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="nav-version-menu">
          {versions.map((v) => (
            <Link key={v.name} to={v.path}
              className={`nav-version-item ${activeVersion?.name === v.name ? "nav-version-item--active" : ""}`}
              onClick={close}>
              <span>{v.label}</span>
              {v.isLast && <span className="nav-version-latest">latest</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductNavItem({ product, isActive }: ProductNavItemProps): JSX.Element {
  return (
    <div className="nav-product-group">
      <Link to={product.path} className={`nav-product-link ${isActive ? "nav-product-link--active" : ""}`}>
        <span className="nav-product-dot" style={{ backgroundColor: product.dot }} />
        <span className="nav-product-label">{product.label}</span>
      </Link>
      {isActive && <VersionDropdown product={product} />}
    </div>
  );
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps): JSX.Element | null {
  const activeProduct = useActiveProduct();
  if (!isOpen) return null;
  return (
    <div className="nav-mobile-overlay" onClick={onClose}>
      <div className="nav-mobile-panel" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="nav-mobile-header">
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>Menu</span>
          <button className="nav-mobile-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="nav-mobile-section">
          <div className="nav-mobile-section-title">Products</div>
          {PRODUCTS.map((p) => {
            const isActive = activeProduct?.id === p.id;
            return (
              <div key={p.id}>
                <Link to={p.path}
                  className={`nav-mobile-link ${isActive ? "nav-mobile-link--active" : ""}`}
                  onClick={onClose}>
                  <span className="nav-product-dot" style={{ backgroundColor: p.dot }} />
                  {p.label}
                </Link>
                {isActive && <MobileVersionList product={p} onClose={onClose} />}
              </div>
            );
          })}
        </div>
        <div className="nav-mobile-section">
          <div className="nav-mobile-section-title">Links</div>
          <a href="https://github.com/openviglet" className="nav-mobile-link" target="_blank" rel="noopener noreferrer" onClick={onClose}>GitHub</a>
          <a href="https://viglet.com" className="nav-mobile-link" target="_blank" rel="noopener noreferrer" onClick={onClose}>viglet.com</a>
        </div>
      </div>
    </div>
  );
}

function MobileVersionList({ product, onClose }: MobileVersionListProps): JSX.Element | null {
  const { versions } = useVersions(product.pluginId);
  const activeVersion = useActiveVersionFromPath(product);
  if (versions.length <= 1) return null;
  return (
    <div className="nav-mobile-versions">
      {versions.map((v) => (
        <Link key={v.name} to={v.path}
          className={`nav-mobile-version-link ${activeVersion?.name === v.name ? "nav-mobile-version-link--active" : ""}`}
          onClick={onClose}>
          v{v.label}
          {v.isLast && <span className="nav-version-latest">latest</span>}
        </Link>
      ))}
    </div>
  );
}

export default function Navbar(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const scrolled = useScrolled();
  const activeProduct = useActiveProduct();
  const { colorMode, setColorMode } = useColorMode();
  const { pathname } = useLocation();
  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav className={`navbar navbar--fixed-top nav-root ${scrolled ? "nav-root--scrolled" : ""}`}>
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="nav-logo">
              <img src="/img/viglet_logo_sm.png" alt="Viglet" width={28} height={28} className="nav-logo-img" />
              <span className="nav-logo-text">viglet</span>
            </Link>
            <div className="nav-separator" />
            <div className="nav-products">
              {PRODUCTS.map((p) => (
                <ProductNavItem key={p.id} product={p} isActive={activeProduct?.id === p.id} />
              ))}
            </div>
          </div>
          <div className="nav-right">
            <a href="https://github.com/openviglet" className="nav-ext-link" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a href="https://viglet.com" className="nav-cta" target="_blank" rel="noopener noreferrer">viglet.com</a>
            <ColorModeToggle value={colorMode} onChange={setColorMode} />
          </div>
          <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {mobileOpen ? (
                <path d="M5 5L17 17M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 6H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 11H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 16H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
