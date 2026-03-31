# Greenfield SpecDD Guide

> Use this guide when starting a **new project from scratch** with Spec-Driven Development.

---

## What is Greenfield SpecDD?

Greenfield means you have a blank slate — no existing codebase to work around. This is the simplest entry point for SpecDD because you can design the architecture and spec your first features without reverse-engineering existing behavior.

The risk in greenfield projects is building the wrong thing. SpecDD mitigates this by forcing clarity on *what* you're building before any code is written.

---

## Recommended Sequence

```
Day 1: Project Foundation
  └─ Fill in context/project.md
  └─ Run /sdd-constitution → review → commit context/constitution.md
  └─ Fill in context/tech-stack.md
  └─ Sketch context/architecture.md (high level is fine)

Day 2–3: First Feature Spec
  └─ Run /sdd-specify → review → commit specs/001-[feature]/spec.md
  └─ Run /sdd-clarify (if open questions exist)
  └─ Run /sdd-plan → review → commit specs/001-[feature]/plan.md
  └─ Run /sdd-tasks → review → commit specs/001-[feature]/tasks.md

Day 4+: Implementation
  └─ Run /sdd-implement (task by task)
  └─ Complete quality checklist after all tasks done
```

---

## Tips for Greenfield Specs

### Start with the Core User Journey
Don't try to spec everything at once. Start with the single most important user journey — the "happy path" that delivers the core value of your product. Spec that first, implement it, then expand.

### Keep First Specs Tight
Your first spec should cover one clearly scoped problem. Resist the urge to add every feature you can think of. A tight spec implemented well beats an over-scoped spec half-implemented.

### Tech Stack: Be Specific Early
The `context/tech-stack.md` should be filled in before generating any technical plans. If you leave the tech stack vague, the AI will make guesses that could be hard to change later.

### Architecture: Document as You Decide
Don't try to pre-design the entire architecture before writing code. Instead, document each significant decision in `context/architecture.md` as it's made. The ADR (Architecture Decision Record) format is recommended.

### Constitution First, Always
The constitution is not just documentation — it actively shapes every AI-generated spec, plan, and task. Investing 30–60 minutes getting it right before any feature work pays dividends throughout the project.

---

## Common Greenfield Pitfalls

| Pitfall | What Happens | Prevention |
|---|---|---|
| Skipping the constitution | AI makes arbitrary technical choices that diverge from your preferences | Always generate constitution before first spec |
| Over-speccing the first feature | Spec is so broad that implementation takes weeks with no feedback | Scope to 3–5 user stories max per spec |
| Vague tech stack | AI introduces libraries you didn't intend | Fill `tech-stack.md` completely before planning |
| Not reviewing generated specs | AI spec misses your actual intent | Human review at every phase gate — don't skip |
| Jumping straight to tasks | Missing plan → tasks lack technical context → implementation drifts | Never skip the plan phase |

---

## Spec Sizing Guide for Greenfield

| Spec Size | User Stories | Estimated Tasks | When to Use |
|---|---|---|---|
| Small | 1–3 | 3–8 | Single workflow, quick win |
| Medium | 4–7 | 8–15 | Core feature with multiple flows |
| Large | 8–12 | 15–25 | Major feature, consider splitting |
| Epic | 12+ | Break into multiple specs | Too large — split it |

---

## Checklist: Ready to Code?

Before running `/sdd-implement` for the first time:

- [ ] `context/constitution.md` exists and is approved
- [ ] `context/tech-stack.md` is filled in with real stack choices
- [ ] `context/project.md` captures what you're building and for whom
- [ ] `specs/001-[feature]/spec.md` is reviewed with no blocking open questions
- [ ] `specs/001-[feature]/plan.md` is reviewed and approved
- [ ] `specs/001-[feature]/tasks.md` has acceptance tests for every task
- [ ] Git repo initialized and initial spec files committed
