import React from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import VigletLogo from "@site/src/components/VigletLogo";
import { Button } from "@site/src/components/ui/button";
import { Badge } from "@site/src/components/ui/badge";
import { Card, CardContent, CardFooter } from "@site/src/components/ui/card";

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
    id: "dumont",
    title: "Dumont DEP",
    description:
      "Data Exchange Platform for seamless data integration, transformation, and orchestration across systems.",
    link: "/dumont",
    release: "2026.1",
    github: "https://github.com/openviglet/dumont",
    color: "#006400",
  },
  {
    id: "shio",
    title: "Shio CMS",
    description:
      "Content Management System with GraphQL, Javascript sites, native cache and search.",
    link: "/shio",
    release: "0.3.7",
    github: "https://github.com/openviglet/shio",
    color: "#FF6347",
  },
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
    href: "https://www.linkedin.com/company/viglet.org",
    iconBg: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const FORMULAS = [
  "H\u2082O", "CO\u2082", "NaCl", "C\u2086H\u2081\u2082O\u2086", "O\u2082",
  "NH\u2083", "CH\u2084", "H\u2082SO\u2084", "Fe\u2082O\u2083", "CaCO\u2083",
  "C\u2082H\u2085OH", "HCl", "NaOH", "KMnO\u2084", "N\u2082",
  "SiO\u2082", "Al\u2082O\u2083", "MgO", "ZnSO\u2084", "Cu",
  "H\u2082O\u2082", "SO\u2083", "PbO\u2082", "BaSO\u2084", "AgNO\u2083",
  "K\u2082Cr\u2082O\u2087", "Na\u2082CO\u2083", "Mg(OH)\u2082", "FeCl\u2083", "CuSO\u2084",
  "Ca(OH)\u2082", "HNO\u2083", "P\u2084O\u2081\u2080", "Cl\u2082", "Br\u2082",
];

/* Distribute formulas evenly across a grid to avoid clustering */
const FORMULA_ITEMS = FORMULAS.map((f, i) => {
  const cols = 7;
  const rows = Math.ceil(FORMULAS.length / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const cellW = 100 / cols;
  const cellH = 90 / rows;
  return {
    text: f,
    top: `${3 + row * cellH + ((i * 7) % (cellH * 0.6))}%`,
    left: `${1 + col * cellW + ((i * 11) % (cellW * 0.6))}%`,
    size: 0.8 + (i % 5) * 0.25,
    duration: 14 + (i % 7) * 4,
    delay: (i % 8) * -2.5,
    drift: ["hero-drift-a", "hero-drift-b", "hero-drift-c"][i % 3],
    opacity: 0.25 + (i % 4) * 0.08,
  };
});

/* Molecular bond structures rendered as SVG */
interface Bond {
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  drift: string;
  opacity: number;
  path: string;
}

const BONDS: Bond[] = [
  { top: "8%",  left: "6%",   size: 80,  duration: 18, delay: -2,  drift: "hero-drift-b", opacity: 0.35,
    path: "M10,40 L40,20 L70,40 M40,20 L40,5 M40,20 L25,8 M40,20 L55,8" },
  { top: "22%", left: "75%",  size: 100, duration: 22, delay: -5,  drift: "hero-drift-a", opacity: 0.3,
    path: "M20,50 L50,30 L80,50 M50,30 L50,10 M20,50 L20,70 M80,50 L80,70 M50,30 L35,15 M50,30 L65,15" },
  { top: "60%", left: "85%",  size: 70,  duration: 16, delay: -1,  drift: "hero-drift-b", opacity: 0.32,
    path: "M15,35 L35,15 L55,35 L35,55 Z M35,15 L35,5 M55,35 L65,35" },
  { top: "70%", left: "12%",  size: 90,  duration: 20, delay: -4,  drift: "hero-drift-a", opacity: 0.3,
    path: "M10,45 L45,25 L80,45 M45,25 L45,5 M10,45 L10,65 M80,45 L80,65" },
  { top: "5%",  left: "42%",  size: 60,  duration: 15, delay: -3,  drift: "hero-drift-c", opacity: 0.28,
    path: "M10,30 L30,10 L50,30 M30,10 L30,0 M10,30 L0,40 M50,30 L60,40" },
  { top: "45%", left: "3%",   size: 75,  duration: 19, delay: -6,  drift: "hero-drift-a", opacity: 0.3,
    path: "M20,40 L40,20 L60,40 M40,20 L40,5 M20,40 L5,50 M60,40 L75,50 M40,5 L30,0 M40,5 L50,0" },
  { top: "78%", left: "52%",  size: 85,  duration: 21, delay: -2,  drift: "hero-drift-b", opacity: 0.28,
    path: "M15,45 L42,20 L70,45 M42,20 L42,5 M15,45 L30,60 M70,45 L55,60" },
  { top: "32%", left: "92%",  size: 65,  duration: 17, delay: -5,  drift: "hero-drift-a", opacity: 0.3,
    path: "M10,35 L32,15 L55,35 M32,15 L32,3 M10,35 L10,50" },
  /* ── New bonds to fill gaps ── */
  { top: "15%", left: "28%",  size: 70,  duration: 19, delay: -1,  drift: "hero-drift-c", opacity: 0.3,
    path: "M10,35 L35,10 L60,35 M35,10 L35,0 M10,35 L0,50 M60,35 L70,50" },
  { top: "50%", left: "35%",  size: 65,  duration: 16, delay: -7,  drift: "hero-drift-b", opacity: 0.25,
    path: "M10,30 L30,10 L50,30 L30,50 Z M30,10 L30,0" },
  { top: "40%", left: "60%",  size: 80,  duration: 20, delay: -3,  drift: "hero-drift-a", opacity: 0.28,
    path: "M15,40 L40,15 L65,40 M40,15 L40,3 M15,40 L5,55 M65,40 L75,55 M40,15 L28,5 M40,15 L52,5" },
  { top: "75%", left: "35%",  size: 75,  duration: 18, delay: -4,  drift: "hero-drift-c", opacity: 0.3,
    path: "M10,40 L38,18 L65,40 M38,18 L38,5 M10,40 L10,55 M65,40 L65,55" },
  { top: "85%", left: "78%",  size: 60,  duration: 15, delay: -6,  drift: "hero-drift-b", opacity: 0.28,
    path: "M10,30 L30,10 L50,30 M30,10 L30,0 M10,30 L0,40 M50,30 L60,40" },
  { top: "5%",  left: "60%",  size: 55,  duration: 17, delay: -2,  drift: "hero-drift-a", opacity: 0.25,
    path: "M8,28 L28,8 L48,28 M28,8 L28,0 M8,28 L0,35 M48,28 L55,35" },
  { top: "55%", left: "18%",  size: 70,  duration: 21, delay: -5,  drift: "hero-drift-c", opacity: 0.28,
    path: "M12,35 L35,12 L58,35 M35,12 L35,2 M12,35 L5,48 M58,35 L65,48" },
  { top: "30%", left: "48%",  size: 55,  duration: 14, delay: -8,  drift: "hero-drift-b", opacity: 0.22,
    path: "M10,25 L28,8 L45,25 L28,42 Z" },
];

function FloatingFormulas(): JSX.Element {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Lightning flashes — grouped to fire 2-4 simultaneously */}
      {/* Group A: fires at ~3s into cycle */}
      <div className="hero-lightning hero-lightning--a1" />
      <div className="hero-lightning hero-lightning--a2" />
      <div className="hero-lightning hero-lightning--a3" />
      {/* Group B: fires at ~2s into cycle */}
      <div className="hero-lightning hero-lightning--b1" />
      <div className="hero-lightning hero-lightning--b2" />
      {/* Group C: fires at ~4s into cycle */}
      <div className="hero-lightning hero-lightning--c1" />
      <div className="hero-lightning hero-lightning--c2" />
      <div className="hero-lightning hero-lightning--c3" />
      <div className="hero-lightning hero-lightning--c4" />
      {/* NUKE: rare full-screen explosion */}
      <div className="hero-lightning hero-lightning--nuke" />
      {/* Ambient glow */}
      <div className="hero-orb hero-orb--1" />
      <div className="hero-orb hero-orb--2" />
      {/* Dot grid */}
      <div className="hero-grid" />
      {/* Molecular bonds */}
      {BONDS.map((b, i) => (
        <svg
          key={`bond-${i}`}
          className={`hero-bond ${b.drift}`}
          width={b.size}
          height={b.size}
          viewBox={`0 0 ${b.size} ${b.size}`}
          style={{
            top: b.top,
            left: b.left,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            opacity: b.opacity,
          }}
        >
          <path d={b.path} fill="none" className="hero-bond-line" strokeWidth="1.5" strokeLinecap="round" />
          {/* Atom nodes at path endpoints */}
          {b.path.match(/[ML]\s*(\d+),(\d+)/g)?.map((m, j) => {
            const coords = m.match(/(\d+),(\d+)/);
            if (!coords) return null;
            return <circle key={j} cx={coords[1]} cy={coords[2]} r="3" className="hero-bond-node" />;
          })}
        </svg>
      ))}
      {/* Formulas */}
      {FORMULA_ITEMS.map((item, i) => (
        <span
          key={`f-${i}`}
          className={`hero-formula ${item.drift}`}
          style={{
            top: item.top,
            left: item.left,
            fontSize: `${item.size}rem`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            opacity: item.opacity,
          }}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}

function HeroSection(): JSX.Element {
  return (
    <section className="home-section relative overflow-hidden bg-white dark:bg-slate-950 py-28 px-6">
      <FloatingFormulas />

      <div className="home-section-inner relative z-10">
        <Badge variant="default" className="mb-6 hero-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          Open Source
        </Badge>

        <h1
          className="hero-fade-in font-extrabold text-foreground tracking-tight leading-tight mb-4"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", animationDelay: "0.1s" }}
        >
          Documentation for{" "}
          <span className="gradient-text">Viglet</span>{" "}
          Products
        </h1>

        <p
          className="hero-fade-in text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          Explore guides, API references, and tutorials for Turing ES,
          Shio CMS, and Dumont DEP.
        </p>

        <div className="hero-fade-in flex gap-3 justify-center flex-wrap" style={{ animationDelay: "0.3s" }}>
          <Button asChild>
            <Link to="/#products">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://github.com/openviglet" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TrustBar(): JSX.Element {
  return (
    <section className="home-section border-y border-border bg-white dark:bg-background px-6">
      <div className="home-section-inner flex justify-center flex-wrap">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-5 px-8"
            style={{ borderRight: i < stats.length - 1 ? "1px solid var(--color-border)" : "none" }}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-lg">
              {s.icon}
            </div>
            <div>
              <div className="font-bold text-foreground text-[0.9375rem]">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductsSection(): JSX.Element {
  return (
    <section id="products" className="home-section bg-secondary py-20 px-6 dark:bg-background">
      <div className="home-section-inner">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-brand">Products</Badge>
          <h2
            className="font-extrabold text-foreground tracking-tight mb-3"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            Explore Our Documentation
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Comprehensive guides and references for each Viglet product.
          </p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {products.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:shadow-hover hover:-translate-y-1 p-0 text-center"
              onClick={() => (window.location.href = p.link)}
            >
              <CardContent className="flex flex-col items-center pt-8">
                <VigletLogo product={p.id} size={56} />
                <h3 className="text-xl font-bold text-foreground leading-tight mt-4 mb-1.5">{p.title}</h3>
                <Badge variant="version">v{p.release}</Badge>
                <p className="text-muted-foreground text-[0.9375rem] leading-relaxed mt-4 mb-0">
                  {p.description}
                </p>
              </CardContent>
              <CardFooter className="justify-center gap-2.5 pb-8">
                <Button size="sm" asChild>
                  <Link to={p.link} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    Documentation
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    GitHub
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunitySection(): JSX.Element {
  return (
    <section className="home-section bg-white py-20 px-6 dark:bg-background">
      <div className="home-section-inner">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-brand">Community</Badge>
          <h2
            className="font-extrabold text-foreground tracking-tight mb-3"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            Join the Community
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Connect with other developers and stay up to date.
          </p>
        </div>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {community.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <Card className="flex flex-row items-center gap-4 p-6 hover:shadow-hover hover:-translate-y-0.5 cursor-pointer">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: c.iconBg }}
                >
                  {c.icon}
                </div>
                <div>
                  <div className="font-bold text-foreground text-base mb-0.5">{c.title}</div>
                  <div className="text-muted-foreground text-[0.8125rem]">{c.description}</div>
                </div>
              </Card>
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
