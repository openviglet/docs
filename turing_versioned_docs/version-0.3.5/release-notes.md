---
sidebar_position: 5
title: Release Notes
description: Viglet Turing ES Release Notes
---

# Viglet Turing ES: Release Notes

## 0.3.5

*December 3rd 2021*

### New

- Spotlight - Show featured content in search terms based on terms. Search positions can be defined.
- Multi language - Can have multiple languages for each site, using a language-specific solr core. During indexing you can define which language will be indexed.
- UI: Angular 13
- Access Logs - Generate turing access log.
- Did you mean? - It is now possible to parameterize to show "What did you mean?" showing and correcting the search term automatically.
- Merge provider - If two indexing sources are from the same indexed content, you can use the Merge Provider to merge these content.
- turing.solr.timeout property

### Improved

- Java 14
- Spring Boot 2.6.4
- Gradle 7.4
- Auto Complete using Stop words

## 0.3.4

*June 18th 2021*

### Improved

- Bugs were fixed.

## 0.3.3

*May 31st 2021*

### New

- Chatbot
- PostgreSQL JDBC

## 0.3.2

*February 8th 2019*

### New

- Unit Test
- SpaCy Plugin
- DockerFile
- SN Site: Import
- Export SN Site
- Default Fields into Search
- NLP and Thesaurus Activation
- Dynamic Fields: Text, Description and Date
- SN: MaxRows
- Deindexing by Type
- Check Box fields on SN were fixed
- Using lib instead of modules
- Release Resources: HTTPClient and SolrServer
- SNSite using UUID
- Remove newline and trim to concatenated Text
- Spring Boot 2.1.2
