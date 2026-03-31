---
applyTo: "**"
description: Specification-Driven Workflow v1 — a lighter-weight alternative to the full SpecDD kit. Provides a structured approach to software development without the full governance hierarchy. Good for smaller projects or solo developers.
---

# Specification-Driven Workflow v1

A structured approach to software development that ensures requirements are clearly defined, designs are meticulously planned, and implementations are thoroughly documented and validated.

> **Note:** This is a simplified alternative to the full SpecDD kit. If your project uses `.github/prompts/sdd-*.prompt.md` files, use those instead — they provide more structure, governance hierarchy, and handoff chains.

---

## Core Principle

**Never write code without a spec. Never write a spec without understanding the problem.**

The workflow has four phases:

```
UNDERSTAND → SPECIFY → PLAN → IMPLEMENT
```

Each phase produces a document that becomes the input to the next.

---

## Phase 1: Understand

Before writing anything, answer these questions:

- What problem is the user/business trying to solve?
- Who are the users and what do they actually need?
- What are the constraints (technical, time, compliance)?
- What does success look like — measurably?

Ask clarifying questions until these are answered. Do not skip this phase even under time pressure.

---

## Phase 2: Specify

Create `specs/{feature}/spec.md` with:

- **Overview** — What is being built and why
- **User Stories** — `As a [user], I want [action], so that [benefit]`
- **Acceptance Criteria** — Testable, unambiguous conditions
- **Out of Scope** — Explicit list of what is NOT included
- **Open Questions** — Unresolved decisions that need answers before implementation

**Gate:** The spec is complete when every acceptance criterion is testable and out-of-scope is explicitly listed.

---

## Phase 3: Plan

Create `specs/{feature}/plan.md` with:

- **Architecture** — How will this be built? What components are involved?
- **Data Model** — What data structures are created or modified?
- **API Changes** — What interfaces change?
- **Dependencies** — What does this rely on that doesn't exist yet?
- **Risks** — What could go wrong, and how will you mitigate it?
- **Testing Strategy** — How will acceptance criteria be verified?

**Gate:** The plan is reviewed against the spec. Every AC must have a corresponding test approach.

---

## Phase 4: Implement

Execute the plan in small, verifiable increments:

- Implement one acceptance criterion at a time
- Write tests before or alongside the code
- Commit with meaningful messages referencing the spec
- Update the spec if requirements change during implementation (never silently)

**Gate:** All acceptance criteria pass. Code is reviewed.

---

## Agent Behavior Rules

When operating in agent mode on a project using this workflow:

1. **Read the spec first.** Before suggesting any implementation, read `specs/{feature}/spec.md`.
2. **Raise conflicts.** If the code contradicts the spec, stop and flag it.
3. **Don't expand scope.** If you identify something useful that is out-of-scope, document it as a future spec, don't implement it now.
4. **Update docs when code changes.** If implementation differs from the plan, update `plan.md` to reflect the actual approach.
5. **Ask before deleting.** Never remove existing functionality without explicit instruction.
