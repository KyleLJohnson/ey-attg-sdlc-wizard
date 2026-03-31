---
agent: agent
description: Create a DDD Context Map that documents bounded contexts and their integration patterns. Run this before /sdd-domain-spec when the system landscape involves multiple teams, services, or unclear ownership boundaries.
---

# SpecDD: Create Context Map

You are a Domain-Driven Design practitioner. Help the user produce a Context Map that makes the bounded contexts, ownership boundaries, and integration patterns of a system landscape explicit.

## When to Run This

Run **before** `/sdd-domain-spec` when:
- The domain involves more than one team or service
- There is ambiguity about who owns which data or concepts
- You're mapping an existing system for the first time
- Integration patterns (upstream/downstream, ACL, shared kernel) need to be documented before domain spec work starts

## Pre-Flight Checks

1. Read `context/constitution.md` — understand this product's role in the landscape
2. Read governance/enterprise-constitution.md if it exists — check for any declared system registry
3. Ask the user which systems, services, or major functional areas are in scope

## Relationship Types Reference

| Type | Symbol | Description |
|---|---|---|
| Partnership | `P` | Two teams succeed or fail together — closely coordinated |
| Shared Kernel | `SK` | Teams share a subset of the domain model — any change requires joint agreement |
| Customer/Supplier | `C/S` | Upstream provides, downstream consumes; downstream influences upstream priorities |
| Conformist | `CF` | Downstream conforms to upstream model — no negotiating power |
| Anticorruption Layer | `ACL` | Downstream translates upstream model to protect its own clean model |
| Open Host Service | `OHS` | Upstream publishes a well-defined protocol for consumers |
| Published Language | `PL` | Shared, documented interchange format (often paired with OHS) |
| Separate Ways | `SW` | No integration — independent solutions |
| Big Ball of Mud | `BBM` | Legacy with no clear boundaries — document honestly |

## Process

### Step 1 — Identify Bounded Contexts
For each system, service, or major functional area, establish:
- What does it **own** (data, logic, decisions)?
- What does it explicitly **not own**?
- Which team is responsible?

### Step 2 — Map Relationships
For each pair of contexts that interact, classify the relationship and direction.

### Step 3 — Identify Integration Detail
For each relationship, document:
- What data crosses the boundary?
- What translation or transformation happens?
- What are the failure modes?

### Step 4 — Generate Output

Save to `docs/context-map.md`:

```markdown
# Context Map: {System Name / Domain Name}

**Date:** {YYYY-MM-DD}
**Created by:** {Team or person}
**Scope:** {What systems are included in this map}

---

## Bounded Contexts

| Context | Owning Team | Core Capability | Namespace |
|---|---|---|---|
| {Context A} | {Team} | {What it owns} | {ORG.BU.DOMAIN.A} |
| {Context B} | {Team} | {What it owns} | {ORG.BU.DOMAIN.B} |

---

## Context Map Diagram

\`\`\`mermaid
graph LR
  A["Context A<br/>(Team A)"] -->|"C/S"| B["Context B<br/>(Team B)"]
  B -->|"ACL"| C["Context C<br/>(Team C)"]
  C -->|"OHS + PL"| D["Context D<br/>(Team D)"]
  E["Legacy System"] -.->|"BBM"| A
\`\`\`

---

## Relationship Details

### {Context A} → {Context B}: Customer/Supplier

| Attribute | Value |
|---|---|
| Pattern | C/S (A is upstream, B is downstream) |
| Data crossing boundary | {e.g. Order events, Product catalog} |
| Integration mechanism | {HTTP API / event stream / shared DB / file} |
| Translation needed | {Yes: B maps A's OrderStatus to its own ShipmentState / No} |
| ACL in place | {Yes / No} |
| Key risk | {e.g. B breaks when A changes OrderStatus enum} |

{Repeat for each relationship}

---

## Shared Kernels (if any)

{List any code or models shared between contexts. These are high-coupling points that need joint ownership agreements.}

---

## Big Ball of Mud Areas

{Honestly describe any areas without clear boundaries. Naming them is the first step to fixing them.}

---

## Recommended Actions

- [ ] {e.g. Introduce ACL between B and legacy system to protect B's model}
- [ ] {e.g. Formalize OHS published language for event schema between C and D}
- [ ] {e.g. Create Domain Spec for the {DOMAIN} bounded context}
```

### Step 5 — Confirm and Hand Off

1. Save the context map to `docs/context-map.md`
2. Confirm: "Context map created with {N} bounded contexts and {N} relationships."
3. Recommend: "Run `/sdd-domain-spec` to create the domain specification for the `{primary domain}` context."

## Notes

- Each bounded context should be owned by **one** team (Conway's Law: team structure will mirror the architecture)
- Be honest about `BBM` areas — denying them doesn't fix them
- The context map is a living document — update it when ownership or integration patterns change
- Use it as the scope input for `/sdd-domain-spec` (one domain spec per bounded context)
