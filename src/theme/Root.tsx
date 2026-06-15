import React, { type ReactNode } from "react";
import { TOCProvider } from "@site/src/contexts/TOCContext";

/**
 * App-wide wrapper (persists across navigation).
 *
 * Provides the {@link TOCProvider} at the root so the "On this page"
 * collapse toggle (`@theme/TOC`) works on **every** page type — not just
 * docs. The docs layout (`@theme/DocItem/Layout`) keeps its own nested
 * `TOCProvider` so per-doc collapse state stays isolated there; blog and
 * any other page fall back to this root provider. Without it, the blog's
 * TOC toggle called the context default `setCollapsed` no-op and did nothing.
 */
export default function Root({ children }: { children: ReactNode }): ReactNode {
  return <TOCProvider>{children}</TOCProvider>;
}
