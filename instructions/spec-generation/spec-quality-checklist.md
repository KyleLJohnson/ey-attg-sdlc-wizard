# Spec Quality Checklist

> Use this checklist to validate a spec before proceeding to technical planning.
> A spec that doesn't pass this checklist will produce a poor plan and unreliable implementation.

---

## How to Use

Run this checklist manually after generating a spec with `/sdd-specify`:

1. Open `specs/[NNN]-[feature]/spec.md`
2. Work through each checklist item
3. Return to the spec and fix gaps
4. Re-run until all items pass
5. Only then proceed to `/sdd-plan`

Alternatively, you can ask the AI to run this check:
```
Review specs/[NNN]-[feature]/spec.md against the spec quality checklist 
in instructions/spec-generation/spec-quality-checklist.md.
List all items that fail and suggest corrections.
```

---

## Section 1: Core Content

### 1.1 Problem & Purpose
- [ ] The problem statement explains WHY this feature needs to exist
- [ ] It's clear WHO the target users are (named personas)
- [ ] It's clear what PAIN or GAP is being addressed

### 1.2 User Stories
- [ ] At least one user story per distinct user persona
- [ ] All stories follow: "As a [role], I want [goal] so that [benefit]"
- [ ] Stories focus on user outcomes, not technical implementation
- [ ] No story describes the HOW (technology choices belong in plan.md)

### 1.3 Acceptance Criteria
- [ ] Every user story has at least one acceptance criterion
- [ ] All ACs follow GIVEN / WHEN / THEN format
- [ ] Each AC is independently testable (can be verified without other ACs)
- [ ] ACs cover: happy path, error states, edge cases
- [ ] ACs are specific enough that two developers would implement them the same way

### 1.4 User Journeys
- [ ] At least one end-to-end happy path journey is documented
- [ ] Error and fallback journeys are documented for critical paths
- [ ] Journeys show observable system behavior, not code steps

---

## Section 2: Completeness

### 2.1 Scope
- [ ] Out-of-scope items are explicitly listed
- [ ] No feature was left "implied" — if it's needed, it's stated; if not, it's out of scope
- [ ] The spec covers the complete user journey (not just the "interesting" middle part)

### 2.2 Non-Functional Requirements
- [ ] Performance expectations defined (response time, throughput, etc.)
- [ ] Accessibility requirements stated (or explicitly noted as N/A)
- [ ] Security requirements stated (authentication, authorization, data handling)
- [ ] Browser/platform compatibility stated (or explicitly noted as N/A)

### 2.3 Success Metrics
- [ ] At least one measurable success metric is defined
- [ ] Metrics are specific and observable (not "it works correctly")

### 2.4 Dependencies & Assumptions
- [ ] External dependencies are listed (other systems, APIs, services)
- [ ] Assumptions are made explicit (not left implicit)
- [ ] No dependency is assumed to exist without verification or a spec reference

---

## Section 3: Clarity & Quality

### 3.1 Ambiguity
- [ ] No undefined terms or unexplained acronyms
- [ ] User roles are clearly defined (no vague "user" without persona context)
- [ ] Quantities are specified where relevant (e.g., "up to 20 items" not "many items")
- [ ] Time-related requirements are specific (e.g., "within 24 hours" not "soon")

### 3.2 Consistency
- [ ] No contradictions between user stories
- [ ] No contradictions between acceptance criteria
- [ ] The spec is consistent with `context/constitution.md`
- [ ] The spec is consistent with `context/project.md`

### 3.3 Open Questions
- [ ] All open questions are in the Open Questions table
- [ ] Each question has an owner assigned
- [ ] No open question is blocking — or if it is, it's flagged and `/sdd-clarify` has been run

---

## Section 4: AI-Readiness

### 4.1 Context for the AI Agent
- [ ] The spec is self-contained — an AI agent could understand the intent without asking questions
- [ ] Technical jargon is consistent with `context/tech-stack.md` terminology
- [ ] References to other specs/systems are explicit (not implied)

### 4.2 Three-Tier Boundary Clarity
- [ ] The spec makes clear what is always required (core functionality)
- [ ] The spec makes clear what requires human judgment (edge cases to flag)
- [ ] The spec makes clear what is out of bounds (explicit out-of-scope list)

---

## Scoring Guide

| Score | Meaning |
|---|---|
| All items checked | Proceed to `/sdd-plan` ✅ |
| 1–3 items unchecked | Minor revision before planning ⚠️ |
| 4+ items unchecked | Major revision needed — re-run `/sdd-clarify` 🔴 |
| Any Section 1 items unchecked | Block — spec is incomplete, do not plan 🚫 |
