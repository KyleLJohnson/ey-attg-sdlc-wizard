# Blueprint Template

> Run `/sdd-blueprint` to generate this from your BU context, or fill in manually.  
> Output file: `governance/blueprints/[bu-name]/blueprint.md`

---

# [BU_NAME] — Blueprint

<!--
  GOVERNANCE METADATA
  Level:        blueprint
  Business Unit: [BU_NAME]
  Namespace:    [ORG.BU]
  Owner:        [BU_ARCHITECTURE_COUNCIL]
  Inherits From: governance/enterprise-constitution.md
  Version:      1.0
  Last updated: [DATE]
  Approved by:  [APPROVER]
-->

**Status:** Draft | Approved  
**Namespace:** `[ORG.BU]`  
**Owner:** [BU Architecture Council or equivalent]

---

## 1. BU Namespace Convention

All systems in this BU use namespace prefix: `[ORG].[BU].*`

Example: `EY.ATTG.*`

| Segment | Value | Description |
|---|---|---|
| Org | `[ORG]` | Organization identifier |
| BU | `[BU]` | Business unit identifier |
| Domain | `[DOMAIN]` | Domain within the BU (defined in domain-spec) |
| Product | `[PRODUCT]` | Product within the domain |

---

## 2. Reference Architectures

### [Pattern Name — e.g., Event-Driven Processing Pipeline]

**When to use:** [Trigger conditions]  
**Required components:** [List Azure services]  
**Diagram / description:** [Architecture description or ASCII diagram]

### [Pattern Name — e.g., API-First CRUD Service]

**When to use:** [Trigger conditions]  
**Required components:** [List]

---

## 3. BU-Approved Azure Services

Services approved **in addition to** the enterprise baseline (see `governance/enterprise-constitution.md`):

| Category | Service | Use Case | Notes |
|---|---|---|---|
| [Category] | [Service Name] | [When to use] | [Any constraints] |

---

## 4. Cross-Team Workflow Standards

- **Service-to-service (sync):** [e.g., REST over HTTPS via Azure APIM — mutual TLS required]
- **Service-to-service (async):** [e.g., Azure Service Bus — CloudEvents v1.0 payload schema]
- **Structured logging:** [e.g., JSON — required fields: `correlationId`, `userId`, `timestamp`, `traceId`]
- **Error responses:** [e.g., RFC 7807 Problem Details for all HTTP 4xx/5xx]
- **API versioning:** [e.g., URI versioning — `/v1/`, `/v2/` — no breaking changes within a version]

---

## 5. Domain Boundaries

| Domain | Namespace | Owner Team | Domain Spec |
|---|---|---|---|
| [Domain Name] | `[ORG.BU.DOMAIN]` | [Team] | `governance/domain-specs/[domain]/domain-spec.md` |

---

## 6. Dependency & Versioning Policy

- **New dependency approval:** [Process — e.g., security scan + architecture council sign-off]
- **Deprecation window:** [e.g., 6 months minimum before removing a public API]
- **Breaking change policy:** [e.g., New major version required; both versions supported during transition]
