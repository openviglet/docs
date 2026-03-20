# Viglet Docs — Agent Instructions

This file contains conventions and architectural knowledge for AI agents working on this repository.

---

## Project Overview

- **Site:** docs.viglet.com — Docusaurus 3 documentation portal
- **Products:** Turing ES, Dumont DEP, Shio CMS
- **Hosting:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- **Node:** 20+, npm
- **Organization:** [github.com/openviglet](https://github.com/openviglet)

### Repository Structure

```
vigletdocs.github.io/
├── docs-turing/          # Turing ES documentation (Docusaurus plugin: turing)
├── docs-dumont/          # Dumont DEP documentation (Docusaurus plugin: dumont)
├── docs-shio/            # Shio CMS documentation (Docusaurus plugin: shio)
├── diagrams/             # Mermaid .mmd source files (pre-rendered to SVG)
├── static/img/diagrams/  # Pre-rendered SVG output from diagrams/
├── scripts/
│   ├── gen-pdf.mjs             # Turing ES PDF generator (6-stage pipeline)
│   ├── gen-pdf-dumont.mjs      # Dumont DEP PDF generator
│   ├── pdf-cover.html          # Turing PDF cover (orange theme)
│   ├── pdf-cover-dumont.html   # Dumont PDF cover (orange theme)
│   └── pdf-style.css           # Shared PDF content stylesheet
├── src/
│   ├── pages/index.tsx   # Homepage with product cards
│   ├── css/custom.css    # Tailwind v4 + CSS variables + dark mode
│   └── components/       # CustomFooter, VigletLogo, ProductBadge
├── sidebars-turing.ts
├── sidebars-dumont.ts
├── sidebars-shio.ts
├── docusaurus.config.ts
└── package.json
```

---

## Documentation Conventions

### SVG Diagrams

Large/complex diagrams (architecture, sequence, flow) must be **pre-rendered as SVG** via mermaid-cli (`mmdc`), NOT inline mermaid code blocks.

- Source `.mmd` files go in `diagrams/` directory
- SVGs output to `static/img/diagrams/`
- Referenced in markdown as `![Alt text](/img/diagrams/name.svg)`
- The `diagrams` npm script in `package.json` renders all `.mmd` to `.svg` (runs automatically via `prebuild`)
- Small/simple diagrams (< 5 nodes) can stay as inline mermaid

**Why:** Inline mermaid renders poorly in PDF generation (Puppeteer) and has inconsistent sizing. Pre-rendered SVGs look identical in web and PDF.

### Page Breaks

Use `<div className="page-break" />` in markdown at major section boundaries for PDF generation.

- Place before H2 headings that start a new conceptual section
- Align with PDF page boundaries (compare with the generated PDF)
- Not needed for files under ~120 lines
- The PDF stylesheet (`scripts/pdf-style.css`) has `.page-break { page-break-before: always; }` rule

### Color Theme

All products (Turing, Dumont, Shio) use the **same orange brand** (`--color-brand: #C2410C`). No per-product color differentiation on pages or in PDFs.

- `index.mdx` pages use `var(--color-brand)`, `var(--color-brand-bg)`, `var(--color-brand-border)` CSS variables — these adapt to dark mode automatically
- PDF covers use the same orange palette: `#F97316` (lighter), `#C2410C` (primary), `#9A3412` (darker)
- Never hardcode light-mode colors in JSX components — always use CSS variables

### Landing Pages (index.mdx)

Product landing pages use JSX components defined inline in the `.mdx` file:

- `Pill` — version/license badges
- `FeatureCard` — capability highlights in a grid
- `NavCard` — navigation cards with icon, title, description, and hover effect
- `SectionLabel` — centered divider with label text
- PDF download banner with `var(--color-brand)` button

Copy the pattern from `docs-turing/index.mdx` when creating new product landing pages.

---

## Spring Boot 4 Conventions

All Viglet products (Turing ES, Dumont DEP) run on Spring Boot 4:

- JAR files are **NOT directly executable** (no `./app.jar` pattern)
- Must use `java -jar app.jar` explicitly
- `.conf` files (EnvironmentFile pattern from Spring Boot 2/3) **no longer work**
- Use `--spring.config.additional-location=file:/path/to/app.properties` for external configuration
- Systemd services use full `ExecStart` command with `java -jar`

---

## Dumont DEP Connector Architecture

- `dumont-connector.jar` is the **pipeline engine only** — it does NOT crawl content by itself
- Connector plugins (AEM, Web Crawler) are **separate JARs** loaded via `-Dloader.path=libs/`
- The connector JAR uses Spring Boot **ZIP layout** (PropertiesLauncher) to support external classpath loading
- Only **one connector plugin per JVM** instance — to run AEM and Web Crawler, start two separate instances on different ports
- Database and FileSystem connectors are **standalone CLI tools** (`dumont-db-indexer.jar`, `dumont-filesystem-indexer.jar`) — not plugins
- WordPress connector is a **PHP plugin** installed inside WordPress (`wp-content/plugins/`) — not a Java artifact
- Connector plugins are managed via the **Turing ES Admin Console** under Enterprise Search → Integration

### Dumont Launch Pattern

```bash
java -Xmx512m -Xms512m \
  -Dloader.path=/appl/viglet/dumont/aem/libs/ \
  -jar dumont-connector.jar \
  --spring.config.additional-location=file:/appl/viglet/dumont/aem/dumont-connector.properties
```

---

## PDF Generation

Two PDF generators exist, one per product:

| Product | Script | Cover | Output |
|---|---|---|---|
| Turing ES | `scripts/gen-pdf.mjs` | `scripts/pdf-cover.html` | `turing-es-2026.1-documentation.pdf` |
| Dumont DEP | `scripts/gen-pdf-dumont.mjs` | `scripts/pdf-cover-dumont.html` | `dumont-dep-2026.1-documentation.pdf` |

Both share `scripts/pdf-style.css` for content styling.

### PDF Pipeline (6 stages)

1. **Cover** — Render branded HTML cover to PDF
2. **Crawl** — Follow pagination links, print each doc page to PDF
3. **TOC** — Generate Table of Contents with page numbers
4. **Merge** — Combine cover + TOC + doc pages into single PDF
5. **Link rewrite** — Convert internal URI links to in-PDF GoTo navigation
6. **Page numbers** — Stamp `X / Y` on every content page

### CI/CD

The GitHub Actions workflow (`deploy.yml`) runs both PDF generators after building the site:

```yaml
- name: Generate Turing ES documentation PDF
  run: npm run gen-pdf
- name: Generate Dumont DEP documentation PDF
  run: npm run gen-pdf-dumont
- name: Copy PDFs into build folder
  run: |
    cp turing-es-2026.1-documentation.pdf build/
    cp dumont-dep-2026.1-documentation.pdf build/
```

---

## Versioning

| Product | Config Location | Current Version | Has older versions? |
|---|---|---|---|
| Turing ES | `docusaurus.config.ts` preset `docs` | `2026.1` | Yes (0.3.5–0.3.9) |
| Dumont DEP | `docusaurus.config.ts` plugin `dumont` | `2026.1` | No |
| Shio CMS | `docusaurus.config.ts` plugin `shio` | `0.3.7` | No |

Version labels are set via `lastVersion: "current"` + `versions: { current: { label: "2026.1" } }` to avoid showing "Next" in the navbar.

---

## Key File Locations

| What | Path |
|---|---|
| Docusaurus config | `docusaurus.config.ts` |
| CSS variables (brand colors, dark mode) | `src/css/custom.css` |
| Turing sidebar | `sidebars-turing.ts` |
| Dumont sidebar | `sidebars-dumont.ts` |
| Mermaid diagram sources | `diagrams/*.mmd` |
| Pre-rendered SVGs | `static/img/diagrams/*.svg` |
| PDF generation scripts | `scripts/gen-pdf*.mjs` |
| PDF cover pages | `scripts/pdf-cover*.html` |
| PDF content stylesheet | `scripts/pdf-style.css` |
| GitHub Actions workflow | `.github/workflows/deploy.yml` |
| npm scripts (diagrams, gen-pdf) | `package.json` |
