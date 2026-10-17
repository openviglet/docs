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
