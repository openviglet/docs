---
sidebar_position: 1
title: Administration Guide
description: Users, groups, roles, permissions, site properties and system settings in Viglet Shio CMS.
---

# Administration Guide

This guide covers the administration features of Shio CMS — user management, permissions, site configuration, and system settings.

---

## Users

Administrators can **create, modify, and delete** users through the admin console. Users can access the admin console and/or protected pages on the published site.

### Default User

On first startup, Shio CMS creates a default administrator account:

| Field | Value |
|---|---|
| **Username** | `admin` |
| **Password** | `admin` |

:::warning
Change the default password immediately after first login.
:::

### User Properties

Each user has:
- Username and password
- Email address
- Full name
- Group memberships

---

## Groups

**Groups** organize users into logical sets for permission management. You can:

- Create, modify, and delete groups
- Add or remove users from groups
- Assign groups to console or page permissions

---

## Permissions

Shio CMS provides two levels of permissions:

### Console Permissions

Control who can access the admin console and its features. Assign **groups and users** to console permissions to restrict access to administration functions.

### Page Permissions

Control who can view specific pages on the published site. Assign **groups and users** to page permissions to create **protected pages** that require authentication.

:::info
Protected pages use the users defined in the Administration section for authentication. Visitors must log in with valid credentials to access protected content.
:::

---

## Site Properties

Each site has configurable properties accessible through the admin console:

| Property | Description |
|---|---|
| **Name** | Site display name |
| **Description** | Site description |
| **URL** | Base URL for the published site |
| **Post Type / Page Layout** | Association between Post Types and their rendering Page Layouts |
| **Searchable content** | Which content is indexed for search |
| **Form folder** | Folder where form submissions are saved |

---

## Site Management

### Creating a Site

1. Navigate to **Sites** in the admin console
2. Click **New Site**
3. Configure site properties
4. Choose a pre-defined theme or create a custom one

### Importing a Site

Import a previously exported site package:
1. Navigate to **Sites**
2. Click **Import Site**
3. Upload the site package file

### Downloading a Site

Export a site as a package for backup or migration:
1. Navigate to the site in the admin console
2. Click **Download Site**
3. The site package includes all content, folders, themes, and configuration

---

## Content Administration

### Folder Management

- **Create folders** — organize content hierarchically
- **Reorder posts** — drag-and-drop reordering with instant results on site pages
- **Change folder view** — switch between List and Thumbnail views
- **Navigate via breadcrumb** — browse folders through the breadcrumb navigation
- **Upload files** — upload multiple files into a folder at once

### Spreadsheet Export

Generate a **spreadsheet** of a folder's contents. Each Post Type in the folder becomes a separate sheet with columns for each field. Useful for bulk content review and reporting.

### Version Control

Shio CMS integrates with **Git** for content version control. You can see all commit changes of a site and track content modifications over time.

Configure Git integration in the [Configuration Reference](./configuration-reference.md):

```properties
shio.git.url=https://github.com/your-org/your-repo.git
shio.git.token=YOUR_TOKEN
```

### Workflows

Create **workflows** for content approval processes. Workflows define approval steps that content must pass through before publication.

---

## Configuration Console

The Configuration Console provides access to system-wide settings:

### Auth Providers

Configure authentication providers:

| Provider | Description |
|---|---|
| **Shio Native** | Built-in username/password authentication |
| **OTDS** | OpenText Directory Service integration |

### Exchange Providers

Configure content exchange providers for import/export:

| Provider | Description |
|---|---|
| **OTCS** | OpenText Content Services — import documents |
| **OTMM** | OpenText Media Management — import media files |

### Search Providers

Configure how site search works — connect to Viglet Turing ES for advanced search capabilities.

### Email

Configure the **email service** for notifications:

```properties
spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=shio@example.com
spring.mail.password=secret
```

---

## Related Pages

| Page | Description |
|---|---|
| [Security](./security.md) | Authentication and authorization details |
| [Configuration Reference](./configuration-reference.md) | All application.properties settings |
| [Import & Export](./import-export.md) | Exchange providers and content migration |
| [Installation Guide](./installation-guide.md) | Setup and first-time configuration |

---
