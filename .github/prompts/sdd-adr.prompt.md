---
agent: agent
description: Create an Architectural Decision Record (ADR) for a key technical decision. Run this whenever a decision is hard to reverse, affects multiple components, or should be understood by future contributors.
---

# SpecDD: Create Architectural Decision Record

You are an experienced software architect. Create a well-structured ADR for the decision described by the user.

## When an ADR is Required

Create an ADR for decisions that are:
- **Hard to reverse** — database choice, auth pattern, API versioning strategy
- **Cross-cutting** — affects multiple features or teams
- **Contested** — where reasonable people disagree
- **Governance-constrained** — where you need to document WHY a governance rule was applied or waived

Do NOT create an ADR for implementation details that can easily change (variable names, minor refactors, library version bumps).

## Pre-Flight Checks

1. Read `context/constitution.md` — ensure the decision aligns with product principles
2. Read `context/architecture.md` — check for pre-existing related decisions
3. Check `docs/decisions/` — find the next sequential ADR number
4. If a governance file is relevant, read it to establish constraints

## Process

### Step 1 — Clarify the Decision
If the user hasn't fully stated what was decided, ask:
- What is the decision? (one sentence)
- What alternatives were considered?
- Why was this option chosen over the alternatives?
- Who was involved in making this decision?

### Step 2 — Validate Against Governance
Check if the decision:
- Complies with the enterprise constitution (if it exists)
- Fits within BU blueprint constraints (if relevant)
- Aligns with domain-level constraints (if relevant)
- Aligns with product constitution principles

If it conflicts with governance, note the conflict explicitly in the ADR under **Governance Notes**.

### Step 3 — Write the ADR

Use this template exactly:

```markdown
# ADR-{NNN}: {Short Title — verb + noun, e.g. "Use PostgreSQL for primary storage"}

**Date:** {YYYY-MM-DD}
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-{NNN}-{slug}.md
**Deciders:** {Names or teams involved}
**Related Spec:** {specs/{feature}/spec.md if applicable}

---

## Context

{Describe the forces at play: technical, business, team constraints. What is the problem? What alternatives existed? Write this so someone who would have made a different decision can still understand the reasoning.}

## Decision

{State the decision clearly in one or two sentences. Use active voice: "We will use X because..."}

## Consequences

### Positive
- {Concrete benefit 1}
- {Concrete benefit 2}

### Negative / Trade-offs
- {Concrete trade-off 1}
- {Concrete trade-off 2}

### Neutral
- {Things that change but are neither good nor bad}

## Alternatives Considered

| Option | Reason Not Chosen |
|---|---|
| {Option A} | {Specific reason} |
| {Option B} | {Specific reason} |

## Governance Notes

{If this decision was constrained or guided by a governance level, state which level and how. If no governance constraint applies, write "N/A".}

## References
- {Link to PR, ticket, design doc, RFC, spec, or external standard}
```

### Step 4 — Save and Register

1. Save the file to `docs/decisions/ADR-{NNN}-{slug}.md`
   - `{NNN}` = zero-padded 3-digit sequence number (check existing files)
   - `{slug}` = lowercase-hyphenated short title
2. Confirm the save: "ADR-{NNN} created at docs/decisions/ADR-{NNN}-{slug}.md"
3. Recommend running `/sdd-update-llms` to register it in `llms.txt`

## ADR Lifecycle

- **Proposed** → decision is drafted but not yet ratified
- **Accepted** → ratified and in effect
- **Deprecated** → no longer active (context that made it relevant has changed)
- **Superseded** → replaced by a newer ADR — always link to the superseding ADR

An ADR is **never edited once Accepted** — create a new one to supersede it. This preserves the historical record of why past decisions were made.
