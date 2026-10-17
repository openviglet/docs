# Improvements

## Block A · Relevance pass (2026-10)

### §DOC1 Titles and descriptions for the person searching

Search Console, 20/07 to 17/10/2026: docs.viglet.org had 2,121 impressions and 3 clicks,
average position 12.3 (the 513 impressions of "site:docs.viglet.org" are the owner's own
checks). The pages are seen and not chosen. The comparison post "Turing ES vs. Coveo vs.
Lucidworks Fusion" got 164 impressions, nearly all from people comparing the two
competitors ("coveo vs lucidworks" 52, "lucidworks vs coveo" 41, "elasticsearch vs
coveo" 7) around position 10, and no click: its title opens with a product the searcher
has never heard of. Technical pages that rank 4 to 8 (skills, transcription,
llm-instances, the Dumont and Shio landings) get no clicks either.

Rewrite the title and description of each page with impressions and no clicks for the
person searching: the comparison post leads with "Coveo vs Lucidworks Fusion" and
answers the comparison in its first two lines, with Viglet Turing as the open-source
option after; a technical page's title says the task ("Configure LLM instances in Viglet
Turing"), not only the feature name. Keep slugs. Done when every page in the Search
Console's top 25 by impressions has been reviewed, and measured a month later by clicks
and CTR on those pages.

### §DOC2 One AEM front door

The AEM queries ("aem search", "aem search component", "aem search engine", "search in
aem") land on turing.viglet.org/aem-search/, at positions 36 to 50; docs.viglet.org
shows up only through a tag page (/blog/tags/aem/ for "aem search engine", position 27)
and the AEM post. Two Viglet pages answering the same query split what little standing
each has.

Make turing.viglet.org/aem-search/ the one AEM front door: the three AEM posts on this
blog (enterprise-search-for-adobe-aem, semantic-vector-search-aem, turing-aem-search)
link to it near the top, and it links back to them as the how-to. The viglet.org task
W40 is narrowed to the same thing (link to that page, build no competing one). Measure
the three AEM queries for that URL in the Search Console against this baseline.

### §DOC3 Out of the index: COVERAGE, old versions, tag pages

Three kinds of page sit in Google that should not. The COVERAGE pages
(/turing/COVERAGE/, /shio/COVERAGE/) are internal engineering matrices, with legends
such as "orphan (missing, fix it)", and are in the sitemap. The old Turing versions
0.3.5 to 0.3.9 are built and crawlable, each self-canonical and without noindex: five
copies of earlier docs that can compete with the current one. The blog tag pages rank in
place of the posts they list (/blog/tags/aem/ for "aem search engine").

Move COVERAGE out of the published docs (or keep them unlisted, noindex and out of the
sitemap), mark the versioned pages noindex or point their canonical at the current
version, and mark tag pages noindex. Done when the built sitemap lists none of them and
their HTML carries noindex or the new canonical.

### §DOC4 Docs home: Turing first, plain words

The docs home has 223 impressions at position 5 and no click. It lists Dumont, Shio,
Turing in that order, though Turing is the centre of the story (Dumont brings the
content Turing indexes, Shio is the CMS of the same family). Its descriptions are
puffery: "Enterprise Search Intelligence: semantic navigation and faceted discovery
fused with Generative AI" and "Data Exchange Platform for seamless data integration,
transformation, and orchestration". A stats band (3 products, 100% open source, Apache
2.0, Java + React) repeats the headline.

Put Turing first, describe each product in one plain line (the same line viglet.org
uses, from its W38), drop the stats band, and say in the headline what the docs help
someone do. Dumont is "Data Exchange Platform" here and "Data Extraction Platform" on
viglet.org: use the one the owner settles. Copy follows the ai-writing pass and
agents.md (no em dashes, no invented claims).

### §DOC5 A post a month, chosen by the Search Console

The blog published 8 posts between 14/06 and 27/07/2026 and none since, yet the posts
are what bring the generic queries: the Coveo/Lucidworks comparison, the AEM posts.
Turing becomes the long-term relevance bet in 2027 (alegauss/visibility, CLAUDE.md), and
the owner has one or two hours a week.

From January 2027, one post a month, each chosen from a query the Search Console already
shows with impressions and no good answer (competitor comparisons, AEM, Solr or
Elasticsearch questions), never from a guess at what might rank. Each post links to the
product page that converts (turing.viglet.org) and is measured by the query it was
written for.

### §DOC6 One analytics rule for both sites

docusaurus.config.ts loads Google Analytics on every page without asking (two tags,
G-GH4HMEGEZD and G-SMSL7R3897). viglet.org loads it only after the visitor accepts (its
W12), and since 19/07/2026 that host is no longer measured. The two Viglet sites treat
the same visitor under two privacy rules.

Decide one rule for both, together with viglet.org's W42: consent first on both (docs
traffic then reads like viglet.org's, mostly through the Search Console), or GA consent
mode on both, whose LGPD fit is the owner's judgment. Record the decision in
alegauss/visibility's CLAUDE.md, where the measurement decisions live.

### §DOC7 Docs search served by Viglet Turing

The docs search is a local index (search-index.json) unrelated to the product the docs
describe. The viglet.org strategy (its docs/STRATEGY.md, the dogfooding section) bets on
dogfooding: a visitor using Turing to decide to adopt Turing.

From 2027, when Turing is the active bet, serve the docs search through a Viglet Turing
instance indexing docs.viglet.org, with the local index as the fallback when that
endpoint is down (never an error or an endless spinner), the same graceful-degradation
rule viglet.org's Block B sets.

### §DOC8 Em dashes need a gate, not a memory

AGENTS.md says the repository holds zero em dashes, but on 17/10/2026 the check it
prescribes finds 14, in docs-turing/import-export.md and five Shio files
(administration-guide, agent-surface, content-lifecycle, replication and COVERAGE). They
arrived with recent product pages, so the rule is enforced by memory, not by a gate.

Rewrite each one by the table in AGENTS.md (colon, parentheses, comma or two sentences;
never a hyphen or an en dash). Then make the rule a gate: a step in
.github/workflows/deploy.yml, before the build, that runs the AGENTS.md grep under a
UTF-8 locale and fails the job when it matches. The grep in AGENTS.md uses `-P` with
`\x{2014}`, which Git Bash's grep rejects ("character value too large") and so reports
nothing; the gate should search for the literal character with `LC_ALL=C.UTF-8`, and
AGENTS.md should show that spelling. Done when the grep returns nothing and a pull
request that adds an em dash fails CI.
