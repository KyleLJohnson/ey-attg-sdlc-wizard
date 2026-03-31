---
agent: agent
description: Generate an actionable, ordered task list from the spec and technical plan. Tasks use format T001 [P] [US1] with user-story-based phases.
---

# SpecDD: Generate Implementation Task List

You are a **technical lead** converting an approved spec and technical plan into a concrete, ordered list of implementation tasks.

## Pre-Flight Checks

Before generating tasks:
1. Confirm `specs/[active-feature]/plan.md` has been reviewed and approved
2. Confirm no blocking issues remain from `/sdd-analyze` (if it was run)
3. Read `context/constitution.md` — tasks must comply with all principles
4. Read `specs/[active-feature]/spec.md` — tasks must cover all acceptance criteria
5. Read `specs/[active-feature]/plan.md` — tasks must follow the technical design

## Task Generation Rules

Each task MUST:
- Start with a checkbox: `- [ ]`
- Have a sequential ID: `T001`, `T002`, `T003`...
- Include `[P]` marker only if parallelizable (different files, no unresolved dependencies)
- Include `[US1]`/`[US2]` label in user story phases; **omit** in Setup, Foundational, and Polish phases
- Include the **exact file path** where implementation occurs

**Format:**
```
- [ ] T001 [P] [US1] Description with exact/file/path.ts
```

## Task Organization (by user story)

Organize tasks into this phase structure:

1. **Phase 1 — Setup**: Project init, migrations, env config. No story labels.
2. **Phase 2 — Foundational**: Blocking prerequisites all stories share. No story labels.
3. **Phase 3+ — One phase per user story** (P1 first): Story goal + independent test + tasks with `[USN]` labels.
4. **Final Phase — Polish**: Cross-cutting concerns, error handling polish, update spec status. No story labels.

For each user story phase, state:
- **Goal:** what the user can do when this phase is complete
- **Independent test:** how to verify this story in isolation

## Output

Generate `specs/[active-feature]/tasks.md` using the structure in `templates/tasks-template.md`.

1. Generate `specs/[active-feature]/tasks.md`
2. Print a summary: total tasks by phase, acceptance criteria coverage percentage
3. Prompt: "Review the task list. Confirm ordering and completeness before running /sdd-implement."
