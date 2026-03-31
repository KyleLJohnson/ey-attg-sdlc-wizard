# Domain Specification Template

> Run `/sdd-domain-spec` to generate this from your domain context, or fill in manually.  
> Output file: `governance/domain-specs/[domain-name]/domain-spec.md`

---

# [DOMAIN_NAME] — Domain Specification

<!--
  GOVERNANCE METADATA
  Level:        domain
  Domain:       [DOMAIN_NAME]
  Namespace:    [ORG.BU.DOMAIN]
  Owner:        [DOMAIN_ARCHITECTS]
  Inherits From: governance/blueprints/[bu-name]/blueprint.md
  Version:      1.0
  Last updated: [DATE]
  Approved by:  [APPROVER]
-->

**Status:** Draft | Approved  
**Namespace:** `[ORG.BU.DOMAIN]`  
**Owner:** [Domain Architects or equivalent]

---

## 1. Domain Overview

**Bounded Context (owns):**  
[What this domain is responsible for — expressed as data and operations it controls]

**Bounded Context (does NOT own):**  
[Explicit exclusions — what adjacent domains handle]

**Domain Events Published:**  
[Key events this domain emits that other domains may consume]

---

## 2. Shared Models

These models are available to all products in this domain. Products must use them — not redefine them.

```typescript
// [SharedModelName — e.g., TaxForm]
interface [SharedModelName] {
  [field]: [type];     // [description]
  [field]: [type];     // [description]
}

// [SharedModelName — e.g., FilerInfo]
interface [SharedModelName] {
  [field]: [type];     // [description]
}
```

---

## 3. Domain Constraints

Every product spec in this domain must comply with these rules:

- [ ] [e.g., All monetary values stored in cents (integer), never floating point]
- [ ] [e.g., Every payload must include a `taxYear: number` field]
- [ ] [e.g., TIN values must be masked in all logs — never stored in plaintext]
- [ ] [e.g., All forms must pass IRS schema validation before being persisted]

---

## 4. External Standards & Regulations

| Standard / Regulation | Scope | Reference |
|---|---|---|
| [e.g., IRS Publication 1220] | [Electronic filing specifications] | [Link or citation] |
| [e.g., IRC § 6041] | [Mandatory 1099 reporting thresholds] | [Link or citation] |

---

## 5. Product Namespaces

Products registered within this domain:

| Product | Namespace | Owner Team | Spec Location |
|---|---|---|---|
| [Product Name] | `[ORG.BU.DOMAIN.PRODUCT]` | [Team] | `specs/[feature]/spec.md` |

---

## 6. Domain Events Catalog

| Event Name | Producer | Key Payload Fields | Consumers |
|---|---|---|---|
| [EventName] | [Service] | [field1, field2, ...] | [Service list] |
