import React from "react";
import Link from "@docusaurus/Link";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import VigletLogo from "@site/src/components/VigletLogo";
import { Button } from "@site/src/components/ui/button";
import { Badge } from "@site/src/components/ui/badge";
import { Card, CardContent, CardFooter } from "@site/src/components/ui/card";
import { FloatingFormulasBg } from "@viglet/viglet-design-system/floating-formulas-bg";
import "@viglet/viglet-design-system/floating-formulas-bg.css";

interface Product {
  id: string;
  title: string;
  description: string;
  link: string;
  release: string;
  github: string;
  color: string;
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
    title: "Viglet Turing",
    description:
      "Enterprise search, cited RAG and AI agents over your content. Self-hosted, with your choice of search engine and LLM.",
    link: "/turing",
    release: "2026.3",
    github: "https://github.com/openviglet/turing-ce",
    color: "#4169E1",
  },
  {
    id: "dumont",
    title: "Viglet Dumont",
    description:
      "Data extraction platform that feeds Viglet Turing with content from Adobe AEM, WordPress, databases, files and the web.",
    link: "/dumont",
    release: "2026.3",
    github: "https://github.com/openviglet/dumont-ce",
    color: "#0F766E",
  },
  {
    id: "shio",
    title: "Viglet Shio",
    description:
      "Agent-ready CMS: run it from the console or a coding agent, render pages, or deliver content over REST and GraphQL.",
    link: "/shio",
    release: "2026.3",
    github: "https://github.com/openviglet/shio-ce",
    color: "#7C3AED",
  },
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

/* Animated hero background, sourced from the Viglet Design System.
 * Wrapped in <BrowserOnly> because FloatingFormulasBg uses Date.now() as a
 * seed, which would mismatch between Docusaurus SSR and client hydration. */
function FloatingFormulas(): JSX.Element {
  return (
    <BrowserOnly>
      {() => (
        <FloatingFormulasBg
          color="#C2410C"
          colorDark="#F97316"
          withLightning
          withExplosion
          extraTokens={["Turing", "Shio", "Dumont"]}
        />
      )}
    </BrowserOnly>
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
          Run search and AI on{" "}
          <span className="gradient-text">your own content</span>
        </h1>

        <p
          className="hero-fade-in text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          Install, configure and extend Viglet Turing, the open-source search and
          AI platform, with Viglet Dumont to bring your content in and Viglet
          Shio as the agent-ready CMS of the same family.
        </p>

        <div className="hero-fade-in flex gap-3 justify-center flex-wrap" style={{ animationDelay: "0.3s" }}>
          <Button asChild>
            <Link to="/turing/">Start with Turing</Link>
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
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
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
    <Layout title="Viglet Turing, Dumont and Shio Documentation" description={siteConfig.tagline}>
      <main>
        <HeroSection />
        <ProductsSection />
        <CommunitySection />
      </main>
    </Layout>
  );
}
