# SpecDD Workflow Reference

> Visual and textual reference for the end-to-end SpecDD workflow.

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              GOVERNANCE SETUP (One-time, team-level)            │
│                                                                 │
│  /sdd-blueprint   → governance/blueprints/[bu]/blueprint.md     │
│  /sdd-domain-spec → governance/domain-specs/[d]/domain-spec.md  │
│                                                                 │
│  (Skip if no BU/domain governance applies to your project)      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Gate: Governance docs reviewed & approved
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PHASE 0: Context                        │
│                   (One-time project setup)                      │
│                                                                 │
│  constitution.md → architecture.md → tech-stack.md → project.md │
│  (constitution.md references governance/ files via Inherits From)│
└─────────────────────────┬───────────────────────────────────────┘
                          │ Gate: Context complete & approved
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: SPECIFY                              │
│              /sdd-specify → spec.md                             │
│                                                                 │
│  Input: What + Why (user journeys, outcomes, acceptance criteria)│
│  Output: spec.md (user stories, ACs, journeys)                  │
│                                                                 │
│  Optional: /sdd-clarify to resolve open questions               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Gate: Spec reviewed, no blocking questions
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PHASE 2: PLAN                                │
│              /sdd-plan → plan.md                                │
│                                                                 │
│  Input: Tech stack, architecture, constraints                    │
│  Output: plan.md, data-model.md, api.md                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Gate: Plan reviewed, technically sound
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3: TASKS                                │
│              /sdd-tasks → tasks.md                              │
│                                                                 │
│  Input: spec.md + plan.md                                       │
│  Output: tasks.md (ordered, traced to ACs)                      │
│                                                                 │
│  Optional: /sdd-analyze for traceability check                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Gate: All ACs covered, ordering correct
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 4: IMPLEMENT                              │
│              /sdd-implement (task by task)                      │
│                                                                 │
│  Input: tasks.md, spec.md, plan.md, constitution.md             │
│  Output: Working code, tests, documentation                     │
│                                                                 │
│  ┌──────────────────────────────────┐                          │
│  │  For each task:                  │                          │
│  │  1. AI implements                │                          │
│  │  2. Run tests                    │                          │
│  │  3. Human verifies vs spec       │ ◄─── Repeat              │
│  │  4. Mark [x] + commit            │                          │
│  └──────────────────────────────────┘                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Gate: All tasks done, checklist passed
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  REVIEW & SHIP                                   │
│                                                                 │
│  Complete checklist.md → Code review → Merge → Deploy           │
│  Update spec.md status to "Implemented"                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase Gate Summary

| Phase | Input | Output | Gate |
|---|---|---|---|
| Blueprint (optional) | BU context, enterprise constitution | `governance/blueprints/[bu]/blueprint.md` | BU Architecture Council approved |
| Domain Spec (optional) | Blueprint, domain knowledge | `governance/domain-specs/[d]/domain-spec.md` | Domain Architects approved |
| Context | Project knowledge + governance context | 4 context files | All files present & reviewed |
| Specify | User intent | `spec.md` | Human approves, no blocking questions |
| Clarify (optional) | `spec.md` | Clarification report | All blockers resolved |
| Plan | `spec.md` + tech constraints | `plan.md`, `data-model.md`, `contracts/`, `quickstart.md` | Human approves, constitution compliant |
| Analyze (optional) | spec + plan + tasks | Analysis report | All ACs traceable |
| Tasks | `spec.md` + `plan.md` | `tasks.md` | All ACs covered, ordering correct |
| Implement | `tasks.md` + context | Code + tests | All tasks `[x]`, checklist passes |

---

## File Map: What Gets Created When

```
After /sdd-constitution:
  context/constitution.md ✅
  context/project.md ✅
  context/architecture.md ✅
  context/tech-stack.md ✅

After /sdd-specify:
  specs/[NNN]-[feature]/spec.md ✅
  specs/[NNN]-[feature]/research.md ✅ (empty skeleton)

After /sdd-plan:
  specs/[NNN]-[feature]/plan.md ✅
  specs/[NNN]-[feature]/research.md ✅ (Phase 0 — resolved unknowns)
  specs/[NNN]-[feature]/data-model.md ✅ (Phase 1 — if applicable)
  specs/[NNN]-[feature]/quickstart.md ✅ (Phase 1 — key validation scenarios)
  specs/[NNN]-[feature]/contracts/ ✅ (Phase 1 — API/interface contracts)

After /sdd-tasks:
  specs/[NNN]-[feature]/tasks.md ✅

During /sdd-implement:
  src/[...] ✅ (implementation files)
  tests/[...] ✅ (test files)
  specs/[NNN]-[feature]/tasks.md (updated with [x] marks)
  specs/[NNN]-[feature]/checklist.md (completed)
```

---

## Commit Cadence

```bash
# Phase 0 — after Context
git commit -m "chore: initialize SpecDD Context"

# Phase 1 — after spec approved
git commit -m "spec([NNN]): [feature-name] functional specification"

# Phase 2 — after plan approved
git commit -m "plan([NNN]): [feature-name] technical implementation plan"

# Phase 3 — after tasks approved
git commit -m "tasks([NNN]): [feature-name] implementation task breakdown"

# Phase 4 — after each task
git commit -m "feat(T[NNN]): [task-title] — [brief summary]"

# Phase 4 — after feature complete
git commit -m "feat([NNN]): [feature-name] complete"
```

---

## When Things Go Wrong

```
AI output doesn't match spec
  → Re-read spec. Was the spec clear?
  → If yes: Give AI more specific prompt referencing exact AC
  → If no: Fix spec, re-generate

Tests fail unexpectedly
  → Stop. Check if regression from unrelated change
  → Fix regression before continuing current task

AI goes out of scope
  → Reject output. Add explicit "do not implement [X]" to prompt
  → Reference out-of-scope list in spec.md

Constitutional violation found in code review
  → Reject output. Cite specific principle.
  → Add explicit rule to agent-boundaries.md to prevent recurrence

Spec and plan contradict each other
  → Stop. Resolve in spec or plan (spec wins for requirements)
  → Never implement ambiguous specifications
```
