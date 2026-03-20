---
sidebar_position: 2
title: Administration Guide
description: Viglet Turing ES Administration Guide
---

# Viglet Turing ES: Administration Guide

Viglet Turing ES ([https://viglet.com/turing](https://viglet.com/turing)) is an open source enterprise search platform ([https://github.com/openviglet](https://github.com/openviglet)) with Semantic Navigation and Generative AI as its main features. All content is indexed in Apache Solr as the primary search engine.

For an overview of the system architecture and component interactions, see [Architecture Overview](./architecture-overview.md).

## Documents and OCR

It can read PDFs and Documents and convert to plain text and also it uses OCR to detect text in images and images into documents.

## Semantic Navigation

### Connectors

Content is delivered to Turing ES by **Viglet Dumont DEP**, a separate application that manages connectors independently. Dumont DEP sends documents to Turing ES via the REST API. Available connectors include WebCrawler (Apache Nutch), Database, FileSystem, AEM/WEM, and WordPress. Refer to the [Dumont DEP documentation](/dumont) for connector configuration.

### Facets

Define attributes that will be used as filters for your navigation, consolidating the total content in your display.

### Targeting Rules

Through attributes defined in the contents, it is possible to use them to restrict their display based on the user's profile.

### SDK Java

Java API ([https://github.com/openviglet/turing-java-sdk](https://github.com/openviglet/turing-java-sdk)) facilitates the use and access to Viglet Turing ES, without the need for consumer search content with complex queries.

## Turing ES Console

Turing ES has many components: Search Engine, Semantic Navigation, and Generative AI.

### Login

When access the Turing ES, appear a login page. For default the login/password is `admin`/`admin`.

![Login Page](/img/screenshots/turing-login.png)

### Search Engine

#### Configuration

Search Engine is used by Turing to store and retrieve data of Converse (Chatbot) and Semantic Navigation Sites.

![Search Engine Page](/img/screenshots/turing-se.png)

It is possible create or edit a Search Engine with following attributes:

| Attribute | Description |
|-----------|-------------|
| Name | Name of Search Engine |
| Description | Description of Search Engine |
| Vendor | Select the Vendor of Search Engine. For now it only supports Solr |
| Host | Host name where the Search Engine service is installed |
| Port | Port of Search Engine Service |
| Enabled | If the Search Engine is enabled |

### Semantic Navigation

#### Configuration

![Semantic Navigation Page](/img/screenshots/turing-sn.png)

##### Settings Tab

The Settings of Semantic Navigation Site contains the following attributes:

| Attribute | Description |
|-----------|-------------|
| Name | Name of Semantic Navigation Site |
| Description | Description of Semantic Navigation Site |
| Search Engine | Select the Search Engine that was created in Search Engine Section |
| Thesaurus | If will use Thesaurus |

##### Multi Languages Tab

| Attribute | Description |
|-----------|-------------|
| Language | Language for Semantic Navigation Site |
| Core | Solr Core Name to store and to search indexed content |

##### Behavior Tab

| Section | Attribute | Description |
|---------|-----------|-------------|
| Behavior | Number of items per page | Number of items that will appear in search |
| Facet | Facet enabled | If it will show Facet (Filters) on search |
| Facet | Number of items per facet | Number of items that will appear in each Facet |
| Highlighting | Highlighting enabled | Define whether to show highlighted lines |
| Highlighting | Pre Tag | HTML Tag for begin of term. For example: `<mark>` |
| Highlighting | Post Tag | HTML Tag for end of term. For example: `</mark>` |
| Did you mean? | "Did you mean?" enabled | Use "did you mean?" feature |
| Did you mean? | Always show corrected term | If misspelled, shows search with corrected term |
| MLT | More Like This enabled? | Define whether to show MLT |
| Default Fields | Title | Field used as title in Solr schema |
| Default Fields | Text | Field used as text in Solr schema |
| Default Fields | Description | Field used as description in Solr schema |
| Default Fields | Date | Field used as date in Solr schema |
| Default Fields | Image | Field used as Image URL in Solr schema |
| Default Fields | URL | Field used as URL in Solr schema |

##### Merge Providers Details Tab

| Section | Attribute | Description |
|---------|-----------|-------------|
| Providers | Source | Name of Source Provider |
| Providers | Destination | Name of Destination Provider |
| Relations | Source | Relation Identifier of Source Provider |
| Relations | Destination | Relation Identifier of Destination Provider |
| Description | Description | More about merge providers |
| Overwritten Fields | Name | Name of Source Field that overwrites destination field |

##### Fields Tab

Fields Tab contains a table with the following columns:

| Column Name | Description |
|-------------|-------------|
| Field | Name of Field |
| Enabled | If the field is enabled |
| MLT | If this field will be used in MLT |
| Facets | To use this field like a facet (filter) |
| Highlighting | If this field will show highlighted lines |

When clicking a Field, a details page appears with:

| Attribute | Description |
|-----------|-------------|
| Name | Name of Field |
| Description | Description of Field |
| Type | `INT`, `LONG`, `STRING`, `DATE` or `BOOL` |
| Multi Valued | If is an array |
| Facet Name | Label of Facet on Search Page |
| Facet | To use this field like a facet |
| Highlighting | If this field will show highlighted lines |
| MLT | If this field will be used in MLT |
| Enabled | If the field is enabled |
| Required | If the field is required |
| Default Value | Default value if content is indexed without this field |

##### Spotlight Details Tab

| Attribute | Description |
|-----------|-------------|
| Name | Spotlight Name |
| Description | Spotlight Description |
| Terms | If any of these terms are searched, documents display as spotlights |
| Indexed Documents | Documents that display as spotlights for search terms |

##### Top Search Terms Tab

During search, Turing ES saves information about search terms and generates Top Search Terms reports.

There are the following reports: Today, This Week, This Month and All Time. These reports show the first 50 terms and statistics about the period.

#### Search Page

##### HTML

In `Turing ES Console` > `Semantic Navigation` > `<SITE_NAME>` > `Multi languages` > click in `Open Search` button of some language.

It will open a Search Page that uses the pattern:

```
GET http://localhost:2700/sn/<SITE_NAME>
```
