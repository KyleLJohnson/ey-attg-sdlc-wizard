# API Contracts: [Feature Name]

<!--
  Feature: [NNN]-[feature-slug]
  Plan reference: plan.md
  Last updated: [DATE]
-->

---

## Status
`Draft` · `In Review` · `Approved`

> ⚠️ API contracts must be approved before implementation begins.  
> Changes to approved contracts require a new spec revision.

---

## Base URL
`/api/v[N]/[resource-prefix]`

---

## Authentication
[e.g., Bearer token in Authorization header | Session cookie | API key]

---

## Endpoints

### [GET] /api/v1/[resource]
**Purpose:** [What this endpoint does]  
**Auth required:** Yes / No  
**Permissions required:** [Role or scope]

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `[param]` | string / number / boolean | No | [Description, default value] |

**Response — 200 OK:**
```json
{
  "[field]": "[type — description]",
  "[items]": [
    {
      "[id]": "uuid",
      "[field]": "string"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|---|---|---|
| `401` | Not authenticated | `{ "error": "Unauthorized" }` |
| `403` | Insufficient permissions | `{ "error": "Forbidden" }` |
| `404` | Resource not found | `{ "error": "Not found" }` |
| `500` | Server error | `{ "error": "Internal server error" }` |

---

### [POST] /api/v1/[resource]
**Purpose:** [What this endpoint does]  
**Auth required:** Yes  
**Permissions required:** [Role or scope]

**Request Body:**
```json
{
  "[field]": "string (required) — description",
  "[optional_field]": "string (optional) — description"
}
```

**Validation Rules:**
- `[field]`: required, max 255 characters
- `[optional_field]`: optional, must be one of: [value1, value2]

**Response — 201 Created:**
```json
{
  "id": "uuid",
  "[field]": "string",
  "createdAt": "ISO 8601 timestamp"
}
```

**Error Responses:**
| Status | Condition | Body |
|---|---|---|
| `400` | Invalid request body | `{ "error": "Bad request", "details": [...] }` |
| `409` | Conflict (duplicate resource) | `{ "error": "Already exists" }` |

---

### [PUT/PATCH] /api/v1/[resource]/:id
...

### [DELETE] /api/v1/[resource]/:id
...

---

## Events / Webhooks

### [Event Name]
**Trigger:** [When this event fires]  
**Payload:**
```json
{
  "event": "[event.name]",
  "timestamp": "ISO 8601",
  "data": {
    "[field]": "value"
  }
}
```

---

## Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| Read endpoints | [e.g., 1000 req] | [e.g., per hour] |
| Write endpoints | [e.g., 100 req] | [e.g., per hour] |

---

## Changelog

| Version | Date | Change |
|---|---|---|
| v1.0 | [DATE] | Initial contract |
