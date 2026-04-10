---
sidebar_position: 8
title: DSL Compatibility Matrix
description: Detailed compatibility matrix of Turing ES DSL Query API across Elasticsearch, Apache Solr, and Apache Lucene engines.
---

# DSL Compatibility Matrix

This page documents the compatibility level of every Turing ES DSL Query feature across the three supported search engine backends.

**Legend:**

| Symbol | Meaning |
|--------|---------|
| **Native** | Direct 1:1 mapping to the engine's API |
| **Translated** | Converted to equivalent engine syntax (may have minor behavior differences) |
| **Partial** | Basic support with limitations |
| **Fallback** | Best-effort approximation (may not produce identical results) |
| **N/A** | Not supported by the engine |

---

## Queries (40 types)

### Full-text Queries

| Query | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `match` | **Native** | **Translated** `field:(terms)` | **Translated** `QueryParser` |
| `multi_match` | **Native** | **Translated** multi-field OR | **Translated** `MultiFieldQueryParser` |
| `match_phrase` | **Native** | **Translated** `field:"phrase"` | **Translated** `QueryParser` with quotes |
| `match_phrase_prefix` | **Native** | **Translated** `field:"phrase"` | **Translated** `QueryParser` + prefix fallback |
| `match_bool_prefix` | **Native** | **Translated** `+term +term prefix*` | **Translated** `TermQuery` MUST + `PrefixQuery` |
| `combined_fields` | **Native** | **Translated** multi-field OR/AND | **Translated** `MultiFieldQueryParser` |
| `query_string` | **Native** | **Translated** `field:(query)` | **Translated** `QueryParser` |
| `simple_query_string` | **Native** | **Translated** multi-field OR | **Translated** `MultiFieldQueryParser` |
| `match_all` | **Native** | **Translated** `*:*` | **Translated** `MatchAllDocsQuery` |

### Term-level Queries

| Query | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `term` | **Native** | **Translated** `field:"value"` | **Translated** `TermQuery` |
| `terms` | **Native** | **Translated** `field:("a" OR "b")` | **Translated** `BooleanQuery` SHOULD |
| `terms_set` | **Native** | **Fallback** terms OR | **Fallback** `BooleanQuery` SHOULD |
| `range` | **Native** | **Translated** `field:[gte TO lte]` | **Translated** `TermRangeQuery` |
| `exists` | **Native** | **Translated** `field:[* TO *]` | **Translated** `FieldExistsQuery` |
| `prefix` | **Native** | **Translated** `field:value*` | **Translated** `PrefixQuery` |
| `wildcard` | **Native** | **Translated** `field:pattern` | **Translated** `WildcardQuery` |
| `regexp` | **Native** | **Translated** `field:/pattern/` | **Translated** `RegexpQuery` |
| `fuzzy` | **Native** | **Translated** `field:value~N` | **Translated** `FuzzyQuery` |
| `ids` | **Native** | **Translated** `id:("a" OR "b")` | **Translated** `BooleanQuery` on `id` |

### Compound Queries

| Query | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `bool` | **Native** | **Translated** `+(must) (should) -(must_not)` + `fq` for filter | **Translated** `BooleanQuery` with MUST/SHOULD/MUST_NOT/FILTER |
| `constant_score` | **Native** | **Translated** passes through filter | **Translated** `ConstantScoreQuery` + `BoostQuery` |
| `dis_max` | **Native** | **Translated** clauses joined with OR | **Translated** `DisjunctionMaxQuery` |
| `boosting` | **Native** | **Translated** `+(positive) -(negative)` | **Translated** `BooleanQuery` MUST + MUST_NOT |
| `function_score` | **Native** (full: weight, field_value_factor, decay, script) | **Partial** `{!boost}` with field_value_factor | **Partial** `BoostQuery` with weight |
| `script_score` | **Native** | **Fallback** inner query only | **Fallback** inner query only |
| `pinned` | **Native** | **Translated** ID boost `^1000` + organic | **Translated** `BoostQuery` on IDs |

### Nested & Join Queries

| Query | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `nested` | **Native** | **Fallback** inner query (flattened) | **Fallback** inner query (flattened) |
| `has_child` | **Native** | **Fallback** inner query | **Fallback** inner query |
| `has_parent` | **Native** | **Fallback** inner query | **Fallback** inner query |

### Geo Queries

| Query | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `geo_distance` | **Native** | **Translated** `{!geofilt}` | **Fallback** MatchAll |
| `geo_bounding_box` | **Native** | **Translated** range `[lat,lon TO lat,lon]` | **Fallback** MatchAll |
| `geo_shape` | **Native** | **Fallback** exists | **Fallback** MatchAll |

### Vector Search

| Query | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `knn` | **Native** | **Translated** `{!knn}` query parser | **Native** `KnnFloatVectorQuery` |

### Span Queries

| Query | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `span_term` | **Native** | **Translated** `field:"value"` | **Translated** `TermQuery` |
| `span_near` | **Native** | **Translated** AND | **Translated** `BooleanQuery` MUST |
| `span_or` | **Native** | **Translated** OR | **Translated** `BooleanQuery` SHOULD |
| `span_not` | **Native** | **Translated** `+(incl) -(excl)` | **Translated** MUST + MUST_NOT |
| `span_first` | **Native** | **Fallback** inner query | **Fallback** inner query |

### Specialized Queries

| Query | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `more_like_this` | **Native** | **Translated** `{!mlt}` | **Translated** `MultiFieldQueryParser` |
| `intervals` | **Native** | **Translated** phrase query | **Translated** `QueryParser` phrase |
| `rank_feature` | **Native** | **Fallback** exists | **Translated** `FieldExistsQuery` |
| `distance_feature` | **Native** | **Fallback** exists | **Fallback** MatchAll |
| `wrapper` | **Native** | **Fallback** `*:*` | **Fallback** MatchAll |
| `percolate` | **Native** | **Fallback** `*:*` | **Fallback** MatchAll |

---

## Aggregations (35 types)

### Bucket Aggregations

| Aggregation | Elasticsearch | Solr | Lucene |
|-------------|:------------:|:----:|:------:|
| `terms` | **Native** | **Translated** facet field | **Translated** manual term counting |
| `range` | **Native** | **Translated** facet queries | N/A |
| `date_histogram` | **Native** | N/A (warn) | N/A |
| `histogram` | **Native** | N/A (warn) | N/A |
| `filter` | **Native** | **Translated** facet query | **Translated** per-filter search |
| `filters` | **Native** | **Translated** multiple facet queries | **Translated** per-filter search |
| `significant_terms` | **Native** | **Translated** facet field | **Translated** terms agg fallback |
| `rare_terms` | **Native** | **Partial** facet sort asc | **Translated** count <= max filter |
| `nested` | **Native** | N/A (warn) | N/A |
| `reverse_nested` | **Native** | N/A (warn) | N/A |
| `auto_date_histogram` | **Native** | N/A (warn) | N/A |
| `multi_terms` | **Native** | N/A (warn) | N/A |
| `composite` | **Native** | N/A (warn) | N/A |
| `sampler` | **Native** | N/A (warn) | N/A |
| `diversified_sampler` | **Native** | N/A (warn) | N/A |
| `adjacency_matrix` | **Native** | N/A (warn) | N/A |
| `geo_distance` | **Native** | N/A (warn) | N/A |
| `variable_width_histogram` | **Native** | N/A (warn) | N/A |

### Metric Aggregations

| Aggregation | Elasticsearch | Solr | Lucene |
|-------------|:------------:|:----:|:------:|
| `avg` | **Native** | **Translated** JSON facet `avg()` | **Translated** manual calculation |
| `sum` | **Native** | **Translated** JSON facet `sum()` | **Translated** manual calculation |
| `min` | **Native** | **Translated** JSON facet `min()` | **Translated** manual calculation |
| `max` | **Native** | **Translated** JSON facet `max()` | **Translated** manual calculation |
| `cardinality` | **Native** | **Translated** JSON facet `unique()` | **Translated** unique set count |
| `value_count` | **Native** | **Translated** field statistics | **Translated** values count |
| `stats` | **Native** | **Translated** field statistics | **Translated** manual calc (count/min/max/avg/sum) |
| `extended_stats` | **Native** | **Translated** field statistics | **Translated** manual calc |
| `percentiles` | **Native** | **Translated** field statistics | **Translated** sort + index lookup |
| `percentile_ranks` | **Native** | **Translated** field statistics | **Translated** manual rank calc |
| `top_hits` | **Native** | N/A (warn) | N/A |
| `top_metrics` | **Native** | N/A (warn) | N/A |
| `median_absolute_deviation` | **Native** | N/A (warn) | N/A |
| `boxplot` | **Native** | N/A (warn) | N/A |
| `string_stats` | **Native** | N/A (warn) | N/A |
| `matrix_stats` | **Native** | N/A (warn) | N/A |
| `t_test` | **Native** | N/A (warn) | N/A |
| `rate` | **Native** | N/A (warn) | N/A |
| `scripted_metric` | **Native** | N/A (warn) | N/A |
| `geo_bounds` | **Native** | N/A (warn) | N/A |
| `geo_centroid` | **Native** | N/A (warn) | N/A |

---

## Request Features (29 fields)

| Feature | Elasticsearch | Solr | Lucene |
|---------|:------------:|:----:|:------:|
| `from` / `size` | **Native** | **Translated** `start` / `rows` | **Translated** `hitsNeeded` offset |
| `sort` | **Native** | **Translated** `SortClause` | **Translated** `SortField` |
| `_source` | **Native** | **Translated** `fl` param | **Translated** field filter |
| `highlight` | **Native** | **Translated** `hl.*` params | **Translated** `UnifiedHighlighter` |
| `aggs` | **Native** | **Translated** facets / JSON facets | **Translated** manual aggregation |
| `post_filter` | **Native** | **Translated** `fq` | **Translated** `BooleanQuery` FILTER |
| `min_score` | **Native** | **Translated** `minScore` param | **Partial** (via query wrapping) |
| `search_after` | **Native** | N/A | N/A |
| `collapse` | **Native** | **Translated** `group=true` | N/A (warn) |
| `suggest` | **Native** (term/phrase/completion) | **Partial** `spellcheck` | N/A (warn) |
| `rescore` | **Native** | **Partial** `bq` (boost query) | N/A |
| `timeout` | **Native** | **Translated** `timeAllowed` | N/A (warn) |
| `explain` | **Native** | **Translated** `debugQuery` | N/A |
| `script_fields` | **Native** | N/A | N/A |
| `indices_boost` | **Native** | N/A | N/A |
| `track_total_hits` | **Native** | Always tracks | Always tracks |
| `stored_fields` | **Native** | **Translated** `fl` param | N/A |
| `scroll` | **Native** | N/A | N/A |
| `profile` | **Native** | N/A | N/A |
| `pit` | **Native** | N/A | N/A |
| `docvalue_fields` | **Native** | N/A | N/A |
| `version` | **Native** | N/A | N/A |
| `seq_no_primary_term` | **Native** | N/A | N/A |
| `preference` | **Native** | N/A | N/A |
| `routing` | **Native** | N/A | N/A |
| `terminate_after` | **Native** | N/A | N/A |
| `search_type` | Passed as param | N/A | N/A |

---

## Response Fields

| Field | Elasticsearch | Solr | Lucene |
|-------|:------------:|:----:|:------:|
| `took` | **Native** | **Translated** elapsed ms | **Translated** elapsed ms |
| `timed_out` | **Native** | Always `false` | Always `false` |
| `hits.total` | **Native** | **Translated** `numFound` | **Translated** `totalHits` |
| `hits.max_score` | **Native** | **Translated** `maxScore` | **Translated** max from results |
| `hits.hits._id` | **Native** | **Translated** `id` field | **Translated** `id` field |
| `hits.hits._score` | **Native** | **Translated** `score` field | **Translated** `ScoreDoc.score` |
| `hits.hits._source` | **Native** | **Translated** all fields | **Translated** stored fields |
| `hits.hits.highlight` | **Native** | **Translated** `highlighting` | **Translated** `UnifiedHighlighter` |
| `hits.hits._explanation` | **Native** | N/A | N/A |
| `hits.hits.fields` | **Native** | N/A | N/A |
| `hits.hits._version` | **Native** | N/A | N/A |
| `hits.hits._seq_no` | **Native** | N/A | N/A |
| `hits.hits.sort` | **Native** | N/A | N/A |
| `aggregations` | **Native** | **Translated** facets | **Translated** manual aggs |
| `suggest` | **Native** | N/A | N/A |
| `_scroll_id` | **Native** | N/A | N/A |
| `profile` | **Native** | N/A | N/A |
| `_shards` | **Native** | N/A | N/A |

---

## Coverage Summary

| Category | Total | Elasticsearch | Solr | Lucene |
|----------|:-----:|:------------:|:----:|:------:|
| **Queries** | 40 | 40 (100%) | 40 (100%) | 40 (100%) |
| **Aggregations** | 35 | 35 (100%) | 17 (49%) | 11 (31%) |
| **Request Features** | 29 | 29 (100%) | 12 (41%) | 6 (21%) |
| **Response Fields** | 18 | 18 (100%) | 8 (44%) | 8 (44%) |

:::tip Recommendation
For **full DSL compatibility**, use Elasticsearch as the search engine backend. Solr and Lucene provide excellent coverage for the most common queries and aggregations, with best-effort translations for advanced features.
:::

---

## Engine Selection Guide

| Use Case | Recommended Engine |
|----------|-------------------|
| Full Elasticsearch DSL compatibility | **Elasticsearch** |
| Production enterprise search with Solr infrastructure | **Solr** (covers 90%+ of common queries) |
| Embedded search without external dependencies | **Lucene** (covers 90%+ of common queries) |
| Vector / semantic search (knn) | **Elasticsearch** or **Lucene** (both native) |
| Advanced aggregations (composite, nested, geo) | **Elasticsearch** |
| Simple faceted search with metric aggs | **Solr** or **Lucene** |

---

## See Also

- [DSL Query API](./dsl-query.md)
- [Search Engine Configuration](./search-engine.md)
- [REST API Reference](./rest-api.md)
