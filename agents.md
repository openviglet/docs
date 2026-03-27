# Viglet Docs — Agent Instructions

This file contains conventions and architectural knowledge for AI agents working on this repository.

---

## Project Overview

- **Site:** docs.viglet.org — Docusaurus 3 documentation portal
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

## Diagram Conventions (Documentation Site)

The documentation site at `vigletdocs.github.io` uses **Mermaid source files** (`.mmd`) that are rendered to SVG via a build script. **Never create SVGs by hand** — always create a `.mmd` file and render it.

### Workflow: Mermaid → SVG

1. **Create/edit** a `.mmd` file in `vigletdocs.github.io/diagrams/`
2. **Render** all diagrams to SVG by running:
   ```bash
   node scripts/render-diagrams.mjs
   ```
   This uses `npx mmdc` (Mermaid CLI) with Puppeteer to render every `.mmd` file in `diagrams/` to `static/img/diagrams/` as SVG.
3. **Reference** the SVG in documentation markdown:
   ```markdown
   ![Alt text](/img/diagrams/my-diagram.svg)
   ```

### .mmd File Format

Every `.mmd` starts with a theme init directive. Use **`theme: 'base'`** to control all colors manually:

```
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '13px', 'primaryColor': '#fff', 'primaryBorderColor': '#c0c0c0', 'lineColor': '#888', 'textColor': '#333'}}}%%
```

### Color Palette (4 semantic colors)

All diagrams use the same 4 colors for visual consistency:

| Role | Node fill | Node stroke | Subgraph fill | classDef name |
|------|-----------|-------------|---------------|---------------|
| Input/output | `#dbeafe` | `#4A90D9` | `#4A90D920` | `blue` |
| Assembly/result | `#dcfce7` | `#50B86C` | `#50B86C20` | `green` |
| Inference/reasoning | `#ede9fe` | `#9B6EC5` | `#9B6EC520` | `purple` |
| Execution/action | `#fef3c7` | `#E8A838` | `#E8A83820` | `amber` |

Subgraph fills use the same hex + `20` suffix (12.5% opacity in 8-digit hex).

### Styling Pattern — Flowcharts (`graph TB`)

Use `classDef` for node colors and `style` for subgraph colors. Both are needed for full color:

```
%%{init: {'theme': 'base', 'themeVariables': {'fontSize': '13px', 'primaryColor': '#fff', 'primaryBorderColor': '#c0c0c0', 'lineColor': '#888', 'textColor': '#333'}}}%%
graph TB
    subgraph MyGroup [" My Group "]
        A["🧠 Item Title\nSubtitle in same node"]
        B["🔧 Another Item\nDescription text"]
    end

    classDef blue fill:#dbeafe,stroke:#4A90D9,stroke-width:2px,color:#1a1a1a
    classDef green fill:#dcfce7,stroke:#50B86C,stroke-width:2px,color:#1a1a1a
    classDef purple fill:#ede9fe,stroke:#9B6EC5,stroke-width:2px,color:#1a1a1a
    classDef amber fill:#fef3c7,stroke:#E8A838,stroke-width:2px,color:#1a1a1a

    class A,B blue
    style MyGroup fill:#4A90D920,stroke:#4A90D9,stroke-width:2px,color:#1a1a1a,font-weight:700
```

### Styling Pattern — Sequence Diagrams

Use `themeVariables` in the init directive to color actors, notes, activations, and loops:

```
%%{init: {'theme': 'base', 'themeVariables': {
  'fontSize': '13px',
  'actorBkg': '#dbeafe', 'actorBorder': '#4A90D9', 'actorTextColor': '#1a1a1a',
  'activationBkgColor': '#ede9fe', 'activationBorderColor': '#9B6EC5',
  'labelBoxBkgColor': '#fef3c7', 'labelBoxBorderColor': '#E8A838', 'labelTextColor': '#1a1a1a',
  'noteBkgColor': '#dcfce7', 'noteBorderColor': '#50B86C', 'noteTextColor': '#1a1a1a',
  'loopTextColor': '#b07a1a',
  'signalColor': '#333', 'signalTextColor': '#333'
}}}%%
```

Use `rect rgba(254, 243, 199, 0.3)` to wrap loops in a colored background block.

### Diagram Complexity — When to Split

Mermaid's auto-layout spreads nodes horizontally when there are many connections. A diagram with 10+ nodes and cross-layer links will render too wide and become unreadable. The solution is the **"zoom by layer"** pattern:

**Problem:** A monolithic diagram with 15+ nodes and connections between layers renders as a wide, tiny, unreadable mess — Mermaid cannot produce a clean vertical layout when connections cross subgraph boundaries in complex ways.

**Solution — split into overview + detail:**

1. **One simplified overview** (pre-rendered SVG via `.mmd`) — only the main blocks, no internal details. Max 8-10 nodes, connections flow strictly top-to-bottom.
2. **Inline detail diagrams** (Mermaid code blocks in the `.md` file) — one small diagram per layer/section, max 3-5 nodes each. These render well because they are small.
3. **Descriptive table** below each inline diagram — component names, packages, and responsibilities.

**Example structure in markdown:**
```markdown
## Architecture

![Overview](/img/diagrams/my-overview.svg)

### Layer 1 — Clients

\`\`\`mermaid
graph LR
    subgraph Clients [" 💻 Clients "]
        A["🌐 JS SDK"]
        B["☕ Java SDK"]
    end
\`\`\`

| Component | Description |
|---|---|
| **JS SDK** | npm package for search |

### Layer 2 — Core

\`\`\`mermaid
graph TB
    subgraph Core [" ⚙️ Core "]
        ...small diagram...
    end
\`\`\`
```

**When to use which approach:**

| Nodes | Connections | Approach |
|---|---|---|
| ≤ 8 | Simple, same-direction | Single `.mmd` diagram — renders fine |
| 8–15 | Some cross-links | Single `.mmd` but simplify — remove internal details, keep blocks |
| 15+ | Many cross-layer links | Split into overview SVG + inline detail diagrams per layer |

**Key insight:** inline Mermaid in markdown (```` ```mermaid ````) is fine for small diagrams (≤ 5 nodes) that render well at any width. The pre-rendered SVG pipeline is for larger diagrams where you need consistent sizing. Combining both in the same page gives the best result.

### General Rules

- **Always `graph TB`** (top-to-bottom) for flowcharts — `LR` renders too small on doc pages
- Use `subgraph` for groups; quote display labels: `subgraph id [" Display Label "]` (spaces inside quotes for padding)
- Use `\n` for line breaks inside node labels
- Add emoji prefixes for visual richness (e.g., `🧠 LLM Instances`, `🔧 Native Tools`)
- Apply `classDef` to nodes AND `style` to subgraphs (both are needed — `classDef` alone does not color subgraphs)
- Dashed arrows (`-->>`) for return/response messages, solid (`->>`) for requests
- `Note over` in sequence diagrams for inline annotations

### Existing Diagrams

| Source (.mmd) | Type | Description |
|---|---|---|
| `turing-chat-layout` | flowchart | Chat UI: Header, Message Area, Input Area, Context Bar |
| `turing-agent-flow` | sequence | Agent execution: prompt → tool loop → SSE response |
| `turing-agent-composition` | flowchart | Agent layers: Identity, Brain, Capabilities, Output |
| `turing-architecture` | flowchart | Full platform architecture |
| `turing-rag-flow` | flowchart | RAG indexing and query flow |
| `turing-indexing-flow` | flowchart | Content indexing pipeline |
| `turing-search-flow` | flowchart | Search request flow |
| `turing-targeting-rules-flow` | flowchart | Targeting rules evaluation |
| `dumont-architecture` | flowchart | Dumont platform architecture |
| `dumont-connectors` | flowchart | Connector plugin architecture |
| `dumont-indexing-flow` | flowchart | Content indexing pipeline |
| `dumont-pipeline` | flowchart | Processing pipeline overview |
| `dumont-pipeline-detail` | flowchart | Pipeline step detail |
| `dumont-strategy-flow` | flowchart | Strategy evaluation flow |

### Render Script Details

- **Script:** `scripts/render-diagrams.mjs`
- **Command:** `npx mmdc -p puppeteer-config.json -w 900 -H 600 -b transparent`
- **Input:** `diagrams/*.mmd`
- **Output:** `static/img/diagrams/*.svg`
- **Run:** `node scripts/render-diagrams.mjs` (also runs as `npm run diagrams` and via `prebuild`)

---