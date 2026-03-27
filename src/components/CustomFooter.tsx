import React from "react";
import Link from "@docusaurus/Link";

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface FooterLink {
  label: string;
  href: string;
  dot?: string;
}

const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/openviglet",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "Reddit",
    href: "https://www.reddit.com/r/TuringES/",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.463.327.327 0 00-.462 0c-.545.533-1.684.73-2.512.73-.828 0-1.953-.197-2.498-.73a.327.327 0 00-.22-.094z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/viglet.com",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const products: FooterLink[] = [
  { label: "Turing ES", href: "/turing", dot: "#4169E1" },
  { label: "Shio CMS", href: "/shio", dot: "#FF6347" },
  { label: "Dumont DEP", href: "/dumont", dot: "#006400" },
];

const resources: FooterLink[] = [
  { label: "GitHub", href: "https://github.com/openviglet" },
  { label: "Reddit", href: "https://www.reddit.com/r/TuringES/" },
];

const company: FooterLink[] = [
  { label: "Website", href: "https://viglet.org" },
  
  { label: "LinkedIn", href: "https://www.linkedin.com/company/viglet.com" },
];

export default function CustomFooter(): React.ReactElement {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#94a3b8",
        padding: "3rem 1.5rem 0",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "2.5rem",
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <img src="/img/viglet_logo_sm.png" alt="Viglet" width={28} height={28} />
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "#f8fafc",
                letterSpacing: "-0.025em",
              }}
            >
              viglet
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.5rem", maxWidth: 280 }}>
            Open source solutions for Semantic Navigation, Content Management, and Authentication.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "0.5rem",
                  background: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#334155";
                  e.currentTarget.style.color = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1e293b";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Products column */}
        <div>
          <h4
            style={{
              color: "#f8fafc",
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1rem",
            }}
          >
            Products
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {products.map((p) => (
              <li key={p.label} style={{ marginBottom: "0.625rem" }}>
                <Link
                  to={p.href}
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: p.dot,
                      flexShrink: 0,
                    }}
                  />
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources column */}
        <div>
          <h4
            style={{
              color: "#f8fafc",
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1rem",
            }}
          >
            Resources
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {resources.map((r) => (
              <li key={r.label} style={{ marginBottom: "0.625rem" }}>
                <Link
                  to={r.href}
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company column */}
        <div>
          <h4
            style={{
              color: "#f8fafc",
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1rem",
            }}
          >
            Company
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {company.map((c) => (
              <li key={c.label} style={{ marginBottom: "0.625rem" }}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid #1e293b",
          marginTop: "2.5rem",
          padding: "1.5rem 0",
          maxWidth: 1280,
          margin: "2.5rem auto 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span style={{ fontSize: "0.8125rem" }}>
          &copy; {new Date().getFullYear()} Viglet Team. All rights reserved.
        </span>
        <span style={{ fontSize: "0.8125rem" }}>
          Licensed under Apache 2.0
        </span>
      </div>
    </footer>
  );
}
