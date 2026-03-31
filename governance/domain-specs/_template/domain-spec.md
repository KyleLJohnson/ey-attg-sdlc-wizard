# [DOMAIN_NAME] — Domain Specification

<!--
  GOVERNANCE METADATA
  Level:        domain
  Domain:       [DOMAIN_NAME]
  Namespace:    [ORG.BU.DOMAIN]       ← e.g., EY.ATTG.TAX
  Owner:        [DOMAIN_ARCHITECTS]
  Inherits From: governance/blueprints/[bu-name]/blueprint.md
  Version:      [VERSION]
  Last updated: [DATE]
  Approved by:  [APPROVER]
-->

---

## Status

`PLACEHOLDER` — Run `/sdd-domain-spec` to generate this document.

---

## 1. Domain Overview

**Namespace:** `[ORG.BU.DOMAIN.*]`  
**Bounded Context:** [What this domain owns — what it is and is not responsible for]  
**Domain Events Published:** [Key domain events other systems may consume]  
**External Standards:** [Regulatory or industry standards that govern this domain]  

---

## 2. Shared Models

Models available to all products within this domain. Products must use these — not define their own:

```typescript
// [SharedModelName]  ← e.g., TaxForm, FilerInfo, TaxYear
interface [SharedModelName] {
  // [field]: [type]  — [description]
}
```

---

## 3. Domain Constraints

Rules that apply to every product spec in this domain:

- [ ] [e.g., All monetary values stored in cents (integer), never floating point]
- [ ] [e.g., All forms must carry a `taxYear` field on every payload]
- [ ] [e.g., IRS schema validation required before any form is persisted]
- [ ] [e.g., TIN values must be masked in logs — never stored in plaintext]

---

## 4. External Standards & Regulations

| Standard | Scope | Reference |
|---|---|---|
| [e.g., IRS Publication 1220] | [Electronic filing specs] | [Link or citation] |
| [e.g., IRC § 6041] | [1099 reporting thresholds] | [Link or citation] |

---

## 5. Product Namespaces

Products registered within this domain:

| Product | Namespace | Owner Team | Product Spec |
|---|---|---|---|
| [Product Name] | `[ORG.BU.DOMAIN.PRODUCT]` | [Team] | `specs/[feature]/spec.md` |

---

## 6. Domain Events Catalog

| Event | Producer | Payload Schema | Consumers |
|---|---|---|---|
| [EventName] | [Service] | [Schema ref or inline] | [Service list] |
