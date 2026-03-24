---
sidebar_position: 4
title: AEM Connector
description: AEM integration overview in Turing ES — connector setup and links to detailed Dumont DEP documentation.
---

# AEM Connector

The **Adobe Experience Manager (AEM)** connector allows Turing ES to index content from AEM author and publish instances. The connector runs as a separate process ([Dumont DEP](/dumont/connectors/aem)) and communicates with Turing ES via REST. Turing ES acts as a proxy — the API path `/api/v2/integration/{integrationId}/**` forwards requests to the configured connector endpoint.

For general integration management — creating instances, monitoring, statistics, and system information — see [Integration](./integration.md).

---

## Overview

The AEM connector is a two-part system:

| Component | Where it runs | Documentation |
|---|---|---|
| **AEM Event Listener** | Inside AEM (OSGi bundle) — sends indexing events to the connector | [Dumont DEP — AEM Event Listener](/dumont/aem-event-listener) |
| **AEM Connector Plugin** | Dumont DEP process — fetches content from AEM and indexes it into Turing ES | [Dumont DEP — AEM Connector](/dumont/connectors/aem) |
| **Integration Instance** | Turing ES admin console — proxy configuration and monitoring | [Integration](./integration.md) |

---

## Configuration

All AEM-specific source configuration — connection details, root paths, content types, author/publish environments, locale mappings, delta tracking, indexing rules, and the Indexing Manager — is documented in the **[Dumont DEP — AEM Connector](/dumont/connectors/aem#source-configuration)** page.

The Turing ES admin console provides the UI for managing these settings under **Enterprise Search → Integration → [your AEM instance]**.

---

## Monitoring & Diagnostics

The following features are available in the Turing ES admin console for each AEM integration instance (see [Integration](./integration.md) for details):

| Feature | Description |
|---|---|
| **Monitoring** | Real-time dashboard for tracking indexing events with filters and auto-refresh |
| **Indexing Stats** | Table of completed bulk indexing operations with throughput metrics |
| **Double Check** | Validates consistency between the connector's content and the Turing ES search index |
| **System Information** | Live status, version, memory, and disk information from the connector |
| **AEM Logging** | AEM-specific logs in **Logging → AEM** (see [Logging](./logging.md)) |

---

## Related Pages

| Page | Description |
|---|---|
| [Integration](./integration.md) | General integration management — instances, monitoring, statistics, and system information |
| [Semantic Navigation](./semantic-navigation.md) | Configure the SN Sites that receive indexed content |
| [Architecture Overview](./architecture-overview.md) | End-to-end indexing flow from connector to Solr |
| [REST API Reference](./rest-api.md) | API endpoints for programmatic indexing |
| [Dumont DEP — AEM Connector](/dumont/connectors/aem) | How the AEM connector works — source configuration, indexing flow, event listeners, API triggering |
| [Dumont DEP — AEM Event Listener](/dumont/aem-event-listener) | Install the OSGi event listener bundle inside AEM for real-time indexing |
| [Dumont DEP — Extending AEM](/dumont/extending-aem) | Custom attribute extractors, content processors, and configuration JSON reference |

---
