import React from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import VigletLogo from "@site/src/components/VigletLogo";

interface Product {
  id: string;
  title: string;
  description: string;
  link: string;
  release: string;
  github: string;
  color: string;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface CommunityLink {
  title: string;
  description: string;
  href: string;
  iconBg: string;
  icon: JSX.Element;
}

const products: Product[] = [
  {
    id: "turing",
    title: "Turing ES",
    description:
      "Semantic Navigation, Chatbot and NLP. Choose from several NLPs to enrich data, all indexed in Solr.",
    link: "/turing",
    release: "2026.1",
    github: "https://github.com/openviglet/turing",
    color: "#4169E1",
  },
  {
    id: "shio",
    title: "Shio CMS",
    description:
      "Content Management System with GraphQL, Javascript sites, native cache and search.",
    link: "/shio",
    release: "0.3.7",
    github: "https://github.com/ShioCMS",
    color: "#FF6347",
  },
  {
    id: "dumont",
    title: "Dumont DEP",
    description:
      "Data Exchange Platform for seamless data integration, transformation, and orchestration across systems.",
    link: "/dumont",
    release: "0.1.0",
    github: "https://github.com/openviglet",
    color: "#006400",
  },
];

const stats: Stat[] = [
  { value: "3", label: "Products", icon: "\u{1F4E6}" },
  { value: "100%", label: "Open Source", icon: "\u{1F513}" },
  { value: "Apache 2.0", label: "License", icon: "\u{1F4DC}" },
  { value: "Java + React", label: "Stack", icon: "\u26A1" },
];

const community: CommunityLink[] = [
  {
    title: "GitHub",
    description: "Source code, issues, and contributions",
    href: "https://github.com/openviglet",
    iconBg: "#0f172a",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    title: "Reddit",
    description: "Community discussions and updates",
    href: "https://www.reddit.com/r/TuringES/",
    iconBg: "#FF4500",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
        <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.463.327.327 0 00-.462 0c-.545.533-1.684.73-2.512.73-.828 0-1.953-.197-2.498-.73a.327.327 0 00-.22-.094z" />
      </svg>
    ),
  },
  {
    title: "LinkedIn",
    description: "Professional updates and news",
    href: "https://www.linkedin.com/company/viglet.com",
    iconBg: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

function HeroSection(): JSX.Element {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "6rem 1.5rem 5rem",
        background: "white",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "40%",
          height: "80%",
          background:
            "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "30%",
          height: "60%",
          background:
            "radial-gradient(circle, rgba(194,65,12,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.375rem 1rem",
            borderRadius: "9999px",
            border: "1px solid #FED7AA",
            background: "#FFF7ED",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#C2410C",
            marginBottom: "1.5rem",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#C2410C",
            }}
          />
          Open Source
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          Documentation for{" "}
          <span className="gradient-text">Viglet</span>{" "}
          Products
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "#64748b",
            maxWidth: 560,
            margin: "0 auto 2.5rem",
            lineHeight: 1.6,
          }}
        >
          Explore guides, API references, and tutorials for Turing ES,
          Shio CMS, and Dumont DEP.
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/turing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.625rem 1.75rem",
              borderRadius: "9999px",
              background: "linear-gradient(to bottom right, #C2410C, #EA580C)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.9375rem",
              boxShadow: "0 4px 14px 0 rgba(194,65,12,0.30)",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Get Started
          </Link>
          <a
            href="https://github.com/openviglet"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.75rem",
              borderRadius: "9999px",
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#475569",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

function TrustBar(): JSX.Element {
  return (
    <section
      style={{
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
        background: "white",
        padding: "0 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1.25rem 2rem",
              borderRight: i < stats.length - 1 ? "1px solid #e2e8f0" : "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "0.75rem",
                background: "#FFF7ED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.125rem",
              }}
            >
              {s.icon}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#0f172a",
                  fontSize: "0.9375rem",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductsSection(): JSX.Element {
  return (
    <section style={{ background: "#f8fafc", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.375rem 1rem",
              borderRadius: "9999px",
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#C2410C",
              marginBottom: "1rem",
            }}
          >
            Products
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.025em",
              marginBottom: "0.75rem",
            }}
          >
            Explore Our Documentation
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "1.0625rem",
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            Comprehensive guides and references for each Viglet product.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                background: "white",
                borderRadius: "1rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px -2px rgba(194,65,12,0.08)",
                padding: "2rem",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(194,65,12,0.15)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 20px -2px rgba(194,65,12,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={() => (window.location.href = p.link)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <VigletLogo product={p.id} size={56} />
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {p.title}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    v{p.release}
                  </span>
                </div>
              </div>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  marginBottom: "1.5rem",
                }}
              >
                {p.description}
              </p>

              <div style={{ display: "flex", gap: "0.625rem" }}>
                <Link
                  to={p.link}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "9999px",
                    background:
                      "linear-gradient(to bottom right, #C2410C, #EA580C)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px 0 rgba(194,65,12,0.30)",
                  }}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  Documentation
                </Link>
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "9999px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    textDecoration: "none",
                  }}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunitySection(): JSX.Element {
  return (
    <section style={{ background: "white", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.375rem 1rem",
              borderRadius: "9999px",
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#C2410C",
              marginBottom: "1rem",
            }}
          >
            Community
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.025em",
              marginBottom: "0.75rem",
            }}
          >
            Join the Community
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "1.0625rem",
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            Connect with other developers and stay up to date.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            maxWidth: 960,
            margin: "0 auto",
          }}
        >
          {community.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "white",
                borderRadius: "1rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px -2px rgba(194,65,12,0.08)",
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                textDecoration: "none",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 25px -5px rgba(194,65,12,0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 20px -2px rgba(194,65,12,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "0.75rem",
                  background: c.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#0f172a",
                    fontSize: "1rem",
                    marginBottom: "0.125rem",
                  }}
                >
                  {c.title}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.8125rem" }}>
                  {c.description}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <main>
        <HeroSection />
        <TrustBar />
        <ProductsSection />
        <CommunitySection />
      </main>
    </Layout>
  );
}
