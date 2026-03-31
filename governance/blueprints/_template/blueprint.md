# [BU_NAME] — Blueprint

<!--
  GOVERNANCE METADATA
  Level:        blueprint
  Business Unit: [BU_NAME]
  Namespace:    [ORG.BU]              ← e.g., EY.ATTG
  Owner:        [BU_ARCHITECTURE_COUNCIL]
  Inherits From: governance/enterprise-constitution.md
  Version:      [VERSION]
  Last updated: [DATE]
  Approved by:  [APPROVER]
-->

---

## Status

`PLACEHOLDER` — Run `/sdd-blueprint` to generate this document, or copy from your BU governance repository.

---

## 1. BU Namespace

All systems in this BU use: `[ORG].[BU].*`  
Example: `EY.ATTG.*`

---

## 2. Reference Architectures

### [Pattern 1 — e.g., Event-Driven Processing]
[Description of the standard pattern, when to use it, required components]

### [Pattern 2 — e.g., API-First Service]
[Description]

---

## 3. BU-Approved Azure Services

Services approved in addition to the enterprise baseline:

| Category | Service | Use Case |
|---|---|---|
| [Category] | [Service] | [When to use] |

---

## 4. Cross-Team Workflow Standards

- **Service-to-service communication:** [e.g., REST over HTTPS via Azure APIM — async via Service Bus]
- **Event schema standard:** [e.g., CloudEvents v1.0 with BU-defined extension attributes]
- **Logging:** [e.g., Structured JSON — required fields: correlationId, userId, timestamp, traceId]
- **Error handling:** [e.g., RFC 7807 Problem Details for all HTTP error responses]

---

## 5. Domain Boundaries

Domains owned by this BU:

| Domain | Namespace | Owner Team | Domain Spec |
|---|---|---|---|
| [Domain Name] | `[ORG.BU.DOMAIN]` | [Team] | `domain-specs/[domain-name]/domain-spec.md` |

---

## 6. Dependency & Versioning Policy

- **Dependency approval:** [e.g., Security scan + architecture council approval for new packages]
- **API versioning:** [e.g., URI versioning — /v1/, /v2/ — breaking changes require new version]
- **Deprecation window:** [e.g., 6-month deprecation notice before removing any public API]
