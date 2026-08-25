---
sidebar_position: 7
title: Developer Guide
description: Build Dumont DEP from source, understand the project structure, extension points, and how to contribute.
---

# Developer Guide

Whether you're building custom extensions, contributing to the project, or integrating Dumont DEP into your CI/CD pipeline, this guide has everything you need.

Dumont DEP is fully open-source at [github.com/openviglet/dumont-ce](https://github.com/openviglet/dumont-ce). All contributions are welcome.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21 · Spring Boot 4.0.3 |
| **Message Queue** | Apache Artemis (embedded) |
| **Database** | H2 (dev) · PostgreSQL (prod) |
| **HTML Parsing** | JSoup 1.22.1 |
| **Text Extraction** | Apache Tika 3.2.3 |
| **Search Clients** | Turing Java SDK · SolrJ · ES Client |
| **Console** | React 19 · TypeScript · Vite · Tailwind CSS v4 |
| **Console components** | `@viglet/viglet-design-system` |
| **Build** | Apache Maven (backend) · pnpm (console) |
| **CI/CD** | GitHub Actions |

---

## Setting Up Your Dev Environment

### Prerequisites

- Java 21 (Temurin recommended)
- Maven 3.9+
- Git
- Turing ES running at `http://localhost:2700` (for end-to-end testing)
- Node.js 26 and pnpm 11, to work on the console (the Maven build invokes them for you)

### Clone, Build, and Run

```bash
git clone https://github.com/openviglet/dumont-ce.git
cd dumont
mvn clean install

cd connector/connector-app
mvn spring-boot:run
```

The application starts at `http://localhost:30130`.

---

## Project Structure

```
dumont/
├── commons/                    # Shared interfaces, models, utilities
├── aem-commons/                # AEM extension interfaces (published to Maven Central)
├── spring/                     # Spring Boot configuration and JPA persistence
├── connector/
│   └── connector-app/          # Main pipeline: strategies, batch, queue, indexing plugins, API
├── web-crawler/
│   └── wc-plugin/              # Web Crawler connector plugin
├── db/
│   ├── db-commons/             # DB extension interface (published to Maven Central)
│   ├── db-app/                 # Database connector (standalone CLI)
│   └── db-sample/              # Example custom DB extension
├── filesystem/
│   └── fs-connector/           # FileSystem connector (standalone CLI)
├── aem/
│   ├── aem-plugin/             # AEM connector plugin (loaded via -Dloader.path)
│   ├── aem-server/             # AEM server-side integration
│   └── aem-plugin-sample/      # Example custom AEM extensions (WKND site)
├── dumont-react/               # The console: React app, built into connector-app's static resources
└── wordpress/                  # WordPress PHP plugin
```

---

## Extension Points

Dumont DEP provides extension points at multiple levels:

### Connector-Level Extensions

| Extension | Guide | Maven Artifact |
|---|---|---|
| **AEM extensions**: attribute extractors, model.json processors (with fluent API), delta date logic | [Extending the AEM Connector](./extending-aem.md) | `com.viglet.dumont:aem-commons:2026.2.3` |
| **Database extensions**: custom row transformations during SQL import | [Extending the Database Connector](./extending-database.md) | `com.viglet.dumont:db-commons:2026.2.3` |

### Platform-Level Extensions

#### Creating a Custom Connector

Implement the `DumConnectorPlugin` interface:

```java
public interface DumConnectorPlugin {
    void crawl();
    String getProviderName();
    void indexAll(String source);
    void indexById(String source, List<String> contentId);
}
```

#### Creating a Custom Indexing Plugin

Implement the `DumIndexingPlugin` interface:

```java
public interface DumIndexingPlugin {
    void index(TurSNJobItems turSNJobItems);
    String getProviderName();
}
```

Register your plugin as a Spring `@Component` with `@ConditionalOnProperty(name = "dumont.indexing.provider", havingValue = "your-provider")`.

---

## Processing Strategy Architecture

Strategies are evaluated in priority order for each Job Item:

![Dumont DEP, Processing Strategy Flow](/img/diagrams/dumont-strategy-flow.svg)

To add a custom strategy, implement the strategy interface and assign a priority between the existing ones.

---

## Working on the Console

The console lives in `dumont-react/`. Maven builds it as part of `mvn clean install` and copies
the output into `connector-app`'s static resources, so a normal backend build already produces a
working UI. Work on it directly when you want hot reload:

```bash
cd dumont-react
pnpm install
pnpm run dev          # Vite dev server
pnpm test             # Vitest
pnpm run lint:ds      # see "Shared components" below
```

The console runs in two places. Standalone it is served by the connector itself; inside
Viglet Turing ES it is mounted as a Module Federation remote, and Turing supplies the surrounding
chrome. Pages are written once and work in both — a fixed `local` integration id stands in for the
one Turing would pass, and an axios interceptor strips it from API calls.

### Shared components

Buttons, dialogs, tables, form controls and page chrome come from
`@viglet/viglet-design-system`, the component library Dumont shares with Viglet Turing ES and
Viglet Shio. Import from it rather than writing a local copy: a copy drifts, and the three
products stop looking like one.

CI enforces this. `pnpm run lint:ds` fails the build when a component is declared here under a
name the design system already exports, and each finding names the import that replaces it. Where
a collision is deliberate — Dumont's `AppFooter` renders Dumont's own version and links, and
merely shares a name — annotate the declaration with the reason:

```ts
// viglet-ds-allow-duplicate AppFooter -- renders Dumont's own logo, connector version and links
```

### Two generations of chrome

Console surfaces are being moved to *bento* — the design system's newer visual language, the same
one Turing uses — one page at a time. Both generations serve at once:

| Tree | Path | Chrome |
|---|---|---|
| Console | `/admin/integration/instance/:id/…` | Collapsible sidebar |
| Bento | `/bento/integration/instance/:id/…` | Fixed nav rail, `⌘K` command palette |

A page appears under `/bento` only once it has actually moved; its `/admin` route keeps working
either way, so nothing breaks while the migration is in progress and a page can move back. Both
trees read one navigation declaration (`src/app/nav.const.ts`), which is also what the command
palette searches — so the sidebar, the rail and the palette can never disagree about which
surfaces exist.

**Every source surface has moved.** All six connector types — AEM, database, web crawler,
filesystem assets, catalog bridge and Edge Delivery Services — list and edit under `/bento`, so
configuring a source end to end never leaves the new shell. The remaining console surfaces
(indexing rules, monitoring, statistics, coverage, plugins, system information) are reached from
the rail's section hubs or `⌘K`, which link out to `/admin` until they move too.

### Migrating a page

Run `pnpm run census` to see which surfaces are on which era, then:

**A list page** is one `BentoSourceList` call — the shape is shared, so a new one supplies its
service, two field accessors and a translation prefix. Its path, icon and tone come from the
navigation declaration by surface id, so a page cannot disagree with the rail about what it is
called.

**A detail page** does not get rewritten. Its form is hundreds of lines of field logic whose only
era-specific parts are the header and the section cards, so those read the chrome instead:

```tsx
// The page: the console page under a chrome declaration.
<SectionCardChromeProvider chrome="bento">
  <IntegrationInstanceDbSourcePage />
</SectionCardChromeProvider>
```

Inside the form, `AdaptiveFormHeader` renders the console's sticky header or the bento hero and
its save-bar morph, and `AdaptiveSectionCard` renders a collapsible card or a frosted section.
Both default to console chrome, so a form that knows nothing about this behaves exactly as it
always did — and one form serves both eras rather than being forked into two that drift.

Finally set `migrated: true` on the surface in `nav.const.ts`. That is what gives it a
`bentoRoute`, which is how the palette and the hubs know to stay inside the shell instead of
linking out.

---

## REST API

| Endpoint | Description |
|---|---|
| `GET /api/v2/connector/status` | Health check |
| `POST /api/v2/connector/indexing/` | Submit indexing jobs |
| `GET /api/v2/connector/monitoring/index/{source}` | Monitor indexing progress |
| `GET /api/v2/connector/validate/{source}` | Validate a content source |

For the full API surface, start the application and visit the Swagger UI.

---

## Contributing

1. **Fork** the [openviglet/dumont-ce](https://github.com/openviglet/dumont-ce) repository
2. **Create a branch** for your feature or fix: `git checkout -b feature/my-improvement`
3. **Commit** with clear, descriptive messages
4. **Open a Pull Request**: describe what you changed and why

---

