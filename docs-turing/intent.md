---
sidebar_position: 4
title: Intent
description: Configure intent categories and action prompts for the Turing ES chat interface.
---

# Intent

The **Intent** feature (`/admin/intent/instance`) manages categorized prompt suggestions that appear in the Chat interface. Intents provide users with pre-built conversation starters organized by topic, making it easier to discover and use the AI capabilities of Turing ES.

Each intent represents a **category** (e.g., "Boost my work productivity") containing one or more **actions** — each action is a labeled prompt that is sent directly to the chat when clicked.

---

## Intent Listing

The listing page shows all configured intents as a grid of cards. Each card displays:

- **Title** — the intent category name
- **Description** — a brief explanation of the category
- **Icon** — a Lucide icon representing the category

A **New Intent** button at the top opens the creation form. Clicking an existing card navigates to its detail page.

---

## Creating or Editing an Intent

The intent form is divided into three sections.

### General Information

| Field | Max Length | Description |
|---|---|---|
| Title | 150 chars | Category name displayed in the chat interface (required) |
| Description | 500 chars | Brief explanation of what prompts this intent provides |
| Icon | — | Lucide icon picker — select an icon to represent this category |

### Actions

Actions are the individual prompts within an intent category. Each action has:

| Field | Description |
|---|---|
| Label | Short action label shown to the user (e.g., "Create daily schedule") — required |
| Prompt | The full prompt text sent to the chat when the user clicks this action — required |

Actions support **drag-and-drop reordering** — drag the handle on each action card to change the display order. Use the **Add Action** button to create new actions, and the trash icon to remove existing ones.

### Status

| Field | Description |
|---|---|
| Enabled | Toggle to show or hide this intent in the chat interface. Disabled intents are not visible to users. |

---

<div className="page-break" />

## Pre-loaded Intents

Turing ES ships with four default intents:

| Intent | Icon | Actions |
|---|---|---|
| **Boost my work productivity** | Briefcase | Create daily schedule, Draft a difficult email, Prepare meeting agenda |
| **Learn something new** | Graduation Cap | Explain complex topics, 30-day study plan, Test my knowledge |
| **Create or improve content** | Pen Tool | Social Media Ideas, Proofread & Enhance, Video Scripting |
| **Health & Mindset** | Heart Pulse | Quick Meditation Guide, Rapid Meal Ideas, At-home Workout |

These can be edited, disabled, or deleted. New intents can be added at any time.

---

## REST API

All endpoints require authentication via the `Key` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/intent` | List all intents (sorted by title) |
| `GET` | `/api/intent/enabled` | List enabled intents only (sorted by display order) |
| `GET` | `/api/intent/{id}` | Get a specific intent with its actions |
| `POST` | `/api/intent` | Create a new intent |
| `PUT` | `/api/intent/{id}` | Update an intent |
| `DELETE` | `/api/intent/{id}` | Delete an intent and all its actions |

### Request / Response Body

```json
{
  "id": "intent-productivity",
  "title": "Boost my work productivity",
  "description": "Prompts to help you be more productive at work",
  "icon": "lucide:briefcase",
  "enabled": 1,
  "sortOrder": 0,
  "actions": [
    {
      "id": "action-1",
      "label": "Create daily schedule",
      "prompt": "Help me create an efficient daily schedule...",
      "sortOrder": 0
    },
    {
      "id": "action-2",
      "label": "Draft a difficult email",
      "prompt": "Help me draft a professional email...",
      "sortOrder": 1
    }
  ]
}
```

**Example — list enabled intents:**

```bash
curl "http://localhost:2700/api/intent/enabled" \
  -H "Key: <YOUR_API_TOKEN>"
```

**Example — create an intent:**

```bash
curl -X POST "http://localhost:2700/api/intent" \
  -H "Key: <YOUR_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data Analysis",
    "description": "Prompts for analyzing and visualizing data",
    "icon": "lucide:bar-chart-3",
    "enabled": 1,
    "sortOrder": 4,
    "actions": [
      {
        "label": "Summarize a dataset",
        "prompt": "Analyze the following dataset and provide key statistics, trends, and insights.",
        "sortOrder": 0
      }
    ]
  }'
```

---

## Permissions

Intent management uses role-based access control:

| Permission | Description |
|---|---|
| `INTENT_VIEW` | View intent categories |
| `INTENT_CREATE` | Create new intents |
| `INTENT_EDIT` | Edit existing intents |
| `INTENT_DELETE` | Delete intents |

All permissions also require the `ROLE_ADMIN` role.

---

## Related Pages

| Page | Description |
|---|---|
| [Chat](./chat.md) | The chat interface where intents are displayed to users |
| [AI Agents](./ai-agents.md) | Configure AI Agents that respond to chat prompts |
| [Administration Guide](./administration-guide.md) | User, group, and role management |

---
