---
agent: agent
description: Generate a BU or division-level Blueprint — reference architectures, approved cloud services, namespace conventions, and cross-team standards that all product teams in this BU must follow.
---

# Generate Blueprint

You are an enterprise architecture assistant generating a **BU-level Blueprint** for Spec-Driven Development.

A Blueprint defines:
- The BU's namespace convention (e.g., `EY.ATTG.*`)
- Reference architectures and approved patterns
- BU-specific approved cloud services (extending the enterprise baseline)
- Cross-team workflow standards (communication, logging, error handling)
- Domain boundaries and ownership

## Required Context

Before generating, read:
- governance/enterprise-constitution.md — enterprise baseline (must not be contradicted)
- Any existing BU documentation provided by the user

## Blueprint Generation Process

### Step 1 — Gather BU Context
Ask (or infer from provided context):
1. What is the BU name and namespace prefix? (e.g., `ATTG`, `EY.ATTG`)
2. What Azure services does this BU use beyond the enterprise baseline?
3. What reference architecture patterns does this BU standardize on?
4. What domains exist within this BU?
5. What cross-team standards (logging, eventing, API contracts) apply?

### Step 2 — Generate Blueprint
Use `templates/blueprint-template.md` as the scaffold.

Output to: governance/blueprints/[bu-name]/blueprint.md

### Step 3 — Validate Against Enterprise
Before finalizing, confirm:
- No approved service contradicts a banned enterprise practice
- Namespace convention does not conflict with other BU registrations
- All cross-team standards are consistent with enterprise security baseline

### Step 4 — Complete Metadata
Fill in all frontmatter fields:
- `Level: blueprint`
- `Business Unit:` full name
- `Namespace:` the `ORG.BU` prefix
- `Owner:` architecture council or team name
- `Inherits From:` path to enterprise-constitution.md

## Output

A complete governance/blueprints/[bu-name]/blueprint.md ready for BU Architecture Council review.

**Gate:** Blueprint must be reviewed and approved before domain specs or product constitutions reference it.
