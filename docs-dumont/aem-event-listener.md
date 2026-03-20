---
sidebar_position: 11
title: AEM Event Listener Setup
description: Install the Dumont AEM event listener bundle inside AEM as a Cloud Service for real-time content synchronization.
---

# AEM Event Listener Setup

This guide explains how to install the Dumont AEM event listener bundle inside your AEM as a Cloud Service instance. Once installed, AEM automatically notifies the Dumont connector whenever content is published, modified, or deleted — enabling real-time search index synchronization.

---

## What Gets Installed

The Dumont AEM Server module (`aem-server`) deploys three artifacts into AEM:

| Artifact | Type | Purpose |
|---|---|---|
| `aem-dumont.structure` | Content package | Creates the `/apps/turing` repository structure |
| `aem-dumont.config` | Content package | Deploys the OSGi configuration (host, configName, enabled) |
| `aem-dumont.core` | OSGi bundle | Event handlers that listen for page/asset changes and send HTTP requests to Dumont |

---

## Prerequisites

- An AEM as a Cloud Service environment (dev, stage, or prod)
- A running Dumont connector instance with the AEM plugin (accessible from AEM)
- Access to your AEM project's Git repository (for Cloud Manager pipeline deployment)
- Java 11+ and Maven 3.6+ for local builds

:::note AEM as a Cloud Service deployment
AEM as a Cloud Service does not support direct bundle installation via the Felix Console. All code must be deployed through a **Cloud Manager pipeline** from a Git repository. See [Adobe's deployment documentation](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/implementing/using-cloud-manager/deploy-code.html) for details.
:::

---

## Option 1: Add to an Existing AEM Project

If you already have an AEM as a Cloud Service project (created from the [AEM Project Archetype](https://experienceleague.adobe.com/docs/experience-manager-core-components/using/developing/archetype/overview.html)), you can integrate the Dumont event listeners into it.

### Step 1 — Copy the Source Files

From the [Dumont repository](https://github.com/openviglet/dumont), copy these directories into your AEM project:

```
From: dumont/aem/aem-server/core/src/main/java/com/viglet/turing/aem/server/
  ├── config/
  │   └── DumAemIndexerConfig.java
  └── core/
      ├── events/
      │   ├── DumAemPageEventHandler.java
      │   ├── DumAemPageReplicationEventHandler.java
      │   ├── DumAemResourceEventHandler.java
      │   ├── beans/
      │   │   ├── DumAemEvent.java
      │   │   └── DumAemPayload.java
      │   └── utils/
      │       └── DumAemEventUtils.java
      └── services/
          ├── DumAemIndexerService.java
          └── DumAemIndexerServiceImpl.java

To: your-aem-project/core/src/main/java/com/viglet/turing/aem/server/
```

### Step 2 — Add Dependencies to Your Core Module

Add these dependencies to your project's `core/pom.xml`:

```xml
<!-- Lombok (if not already present) -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.34</version>
    <scope>provided</scope>
</dependency>

<!-- Apache Commons Collections -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-collections4</artifactId>
    <version>4.5.0-M3</version>
    <scope>provided</scope>
</dependency>
```

The following dependencies are already provided by AEM SDK and don't need to be added: Jackson, Apache HTTP Client, Sling API, OSGi annotations, AEM Replication API, AEM WCM API.

### Step 3 — Add the OSGi Configuration

Create the configuration file for your AEM environment:

```
your-aem-project/ui.config/src/main/content/jcr_root/apps/<your-project>/osgiconfig/config/
  └── com.viglet.turing.aem.server.core.services.TurAemIndexerServiceImpl.cfg.json
```

Contents:

```json
{
  "enabled": true,
  "host": "$[env:DUMONT_CONNECTOR_HOST;default=http://localhost:30130]",
  "configName": "$[env:DUMONT_CONFIG_NAME;default=WKND]"
}
```

| Property | Description |
|---|---|
| `enabled` | `true` to activate event-driven indexing, `false` to disable |
| `host` | URL of the Dumont connector instance (with AEM plugin) |
| `configName` | AEM source name configured in the Dumont connector |

:::tip Cloud Manager Environment Variables
Use `$[env:VAR_NAME;default=value]` syntax to configure different values per environment (dev, stage, prod) without changing code. Set the variables in **Cloud Manager → Environments → Environment Variables**.

See [Adobe's environment variables documentation](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/implementing/using-cloud-manager/environment-variables.html).
:::

### Step 4 — Configure the Service User

The replication event handler requires a service user mapping. Add this to your project's `ui.config`:

```
your-aem-project/ui.config/src/main/content/jcr_root/apps/<your-project>/osgiconfig/config/
  └── org.apache.sling.serviceusermapping.impl.ServiceUserMapperImpl.amended-dumont-indexer.cfg.json
```

```json
{
  "user.mapping": [
    "aem-dumont.core:dumont-indexer=[content-reader-service]"
  ]
}
```

### Step 5 — Deploy via Cloud Manager

1. Commit and push your changes to the Git repository
2. In **Cloud Manager**, run the deployment pipeline for your target environment
3. After deployment, verify the bundle is active in AEM → **Tools → Operations → Web Console → Bundles** (search for "dumont")

---

<div className="page-break" />

## Option 2: Create a New AEM Project from Archetype

If you don't have an existing AEM project, create one from the [AEM Project Archetype](https://experienceleague.adobe.com/docs/experience-manager-core-components/using/developing/archetype/using.html):

```bash
mvn -B org.apache.maven.plugins:maven-archetype-plugin:3.2.1:generate \
  -D archetypeGroupId=com.adobe.aem \
  -D archetypeArtifactId=aem-project-archetype \
  -D archetypeVersion=49 \
  -D appTitle="My Site" \
  -D appId="mysite" \
  -D groupId="com.mycompany" \
  -D aemVersion="cloud"
```

Then follow Steps 1–5 from Option 1 above.

For the full archetype reference, see [Adobe's archetype documentation](https://experienceleague.adobe.com/docs/experience-manager-core-components/using/developing/archetype/overview.html).

---

## Option 3: Use the Standalone Dumont AEM Server Module

You can also build and deploy the `aem-server` module directly from the Dumont repository:

```bash
git clone https://github.com/openviglet/dumont.git
cd dumont/aem/aem-server
mvn clean install -PautoInstallPackage -Daem.host=localhost -Daem.port=4502
```

:::warning Local SDK only
The `-PautoInstallPackage` profile installs directly to a local AEM SDK instance. For AEM as a Cloud Service, you must deploy through a Cloud Manager pipeline (Option 1 or 2).
:::

---

## OSGi Configuration Properties

After deployment, the configuration can be managed in **AEM → Tools → Operations → Web Console → Configuration** (search for "Dumont"):

| Property | Default | Description |
|---|---|---|
| **Enabled** | `false` | Toggle event-driven indexing on/off |
| **Host** | `http://localhost:30130` | Dumont connector URL |
| **Config Name** | `WKND` | Source name in the Dumont connector |

---

## Cloud Manager Environment Variables

For AEM as a Cloud Service, set these variables in Cloud Manager:

| Variable | Environment | Value |
|---|---|---|
| `DUMONT_CONNECTOR_HOST` | Dev | `http://dev-dumont:30130` |
| `DUMONT_CONNECTOR_HOST` | Stage | `http://stage-dumont:30130` |
| `DUMONT_CONNECTOR_HOST` | Prod | `http://prod-dumont:30130` |
| `DUMONT_CONFIG_NAME` | All | `WKND` (or your source name) |

---

## Verifying the Installation

1. **Check bundle status:** AEM → Tools → Operations → Web Console → Bundles → search "dumont" — should be **Active**
2. **Check configuration:** Web Console → Configuration → search "TurAemIndexer" — verify host and configName
3. **Test:** Publish a page in AEM and check the Dumont connector logs for incoming requests
4. **Monitor:** In Turing ES → Integration → Monitoring, filter by your AEM source to see indexing events

---

## Related Pages

| Page | Description |
|---|---|
| [AEM Connector](./connectors/aem.md) | How the connector processes AEM content (infinity.json, tags, model.json) |
| [Extending the AEM Connector](./extending-aem.md) | Custom extensions, configuration JSON, and Maven dependencies |
| [Installation Guide](./installation-guide.md) | Deploying Dumont connector with the AEM plugin |
| [Turing ES — AEM Integration](https://docs.viglet.com/turing/integration-aem) | Managing AEM indexing via the Turing ES admin console |
