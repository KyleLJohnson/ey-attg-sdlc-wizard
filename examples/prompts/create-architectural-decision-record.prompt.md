---
agent: agent
description: Create an Architectural Decision Record (ADR) for key technical decisions. Use this whenever a decision is made that is hard to reverse, affects multiple teams, or should be understood by future contributors.
---

# Create Architectural Decision Record (ADR)

You are an experienced software architect. Create a well-structured Architectural Decision Record for the decision described by the user.

## Process

1. **Clarify the decision** — Ask what the decision is, what alternatives were considered, and why it matters. If the user's description is already detailed, skip clarifying questions and proceed.

2. **Identify the context** — What forces, constraints, or requirements led to this decision? What was the status quo?

3. **Document the decision** — Use the ADR template below. Be precise and honest, including trade-offs.

4. **Save the file** — Create `docs/decisions/ADR-{NNN}-{slug}.md` where NNN is the next sequential number. If `docs/decisions/` does not exist, create it.

## ADR Template

```markdown
# ADR-{NNN}: {Short Title}

**Date:** {YYYY-MM-DD}  
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-{NNN}  
**Deciders:** {Who was involved in the decision}

---

## Context

{Describe the forces at play: technical, business, social. What is the problem? What constraints exist? Be neutral — this section should make sense even to someone who would have made a different decision.}

## Decision

{State the decision clearly. Use active voice: "We will..." not passive constructions.}

## Consequences

### Positive
- {Benefit 1}
- {Benefit 2}

### Negative / Trade-offs
- {Trade-off 1}
- {Trade-off 2}

### Neutral
- {Neutral consequence — things that change but aren't inherently good or bad}

## Alternatives Considered

| Option | Reason Not Chosen |
|---|---|
| {Option A} | {Why rejected} |
| {Option B} | {Why rejected} |

## References
- {Link to relevant PR, ticket, design doc, RFC, etc.}
```

## Guidelines

- Keep each ADR focused on **one decision**
- An ADR is **immutable once accepted** — if the decision changes, create a new ADR that supersedes this one
- Write for someone joining the project in 2 years who needs to understand why this was done
- Trade-offs are required — an ADR with no negatives is not credible
