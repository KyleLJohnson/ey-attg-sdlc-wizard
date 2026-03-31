---
applyTo: "specs/**,context/**,docs/**"
---
# SpecDD Workflow Rules

When working on files under `specs/`, `context/`, or `docs/`:

## Spec-First Mandate

- Never generate implementation code before a spec exists in `specs/{feature}/spec.md`
- Always confirm the spec is approved before running `/sdd-plan`
- Always confirm the plan is reviewed before running `/sdd-tasks`
- Commit spec artifacts (`spec.md`, `plan.md`, `tasks.md`) before writing any source code

## Phase Awareness

Determine the current phase from which files exist in `specs/{feature}/`:

| Files present | Current phase |
|---|---|
| None | `specifying` — run `/sdd-specify` |
| `spec.md` only | `planning` — run `/sdd-plan` |
| `spec.md` + `plan.md` | `tasking` — run `/sdd-tasks` |
| `spec.md` + `plan.md` + `tasks.md` | `implementing` — run `/sdd-implement` |

## Task Format

All tasks in `tasks.md` must use the canonical format:

```
- [ ] T001 [P] [US1] description with/path/to/file.ts
```

- `T{NNN}` — zero-padded sequential task ID
- `[P]` — optional: task is parallelizable (can run independently)
- `[US{N}]` — optional: maps to a user story from spec.md
- File path is strongly recommended for implementation tasks

## Spec Immutability

Once a spec is marked **Approved**, only append changes via an Amendment section at the bottom. Never silently edit approved requirements.

## ADR Protocol

Any architectural decision that:
- Affects `context/architecture.md`
- Changes an approved tech stack item
- Introduces a new external dependency

...must be recorded via `/sdd-adr` before implementation begins.

## EARS Notation for Requirements

When writing requirements in `specs/{feature}/spec.md`, prefer the EARS (Easy Approach to Requirements Syntax) format:

| Type | Pattern | Example |
|---|---|---|
| Ubiquitous | THE SYSTEM SHALL `[behavior]` | THE SYSTEM SHALL log all authentication events |
| Event-driven | WHEN `[trigger]` THE SYSTEM SHALL `[behavior]` | WHEN a user submits the form THE SYSTEM SHALL validate all fields |
| State-driven | WHILE `[state]` THE SYSTEM SHALL `[behavior]` | WHILE the session is active THE SYSTEM SHALL refresh the token |
| Unwanted | IF `[condition]` THEN THE SYSTEM SHALL `[behavior]` | IF the payment fails THEN THE SYSTEM SHALL notify the user |
| Optional | WHERE `[feature]` THE SYSTEM SHALL `[behavior]` | WHERE dark mode is enabled THE SYSTEM SHALL use dark color tokens |
| Complex | WHILE `[state]` WHEN `[trigger]` THE SYSTEM SHALL `[behavior]` | WHILE authenticated WHEN token expires THE SYSTEM SHALL redirect to login |

Use REQ-NNN coding: `REQ-001`, `SEC-001`, `CON-001` (constraint), `GUD-001` (guideline), `PAT-001` (pattern).

## Confidence Scores

Before generating implementation code, assess spec completeness and assign a confidence score:

| Score | Threshold | Action |
|---|---|---|
| **High** | > 85% | Proceed with full implementation |
| **Medium** | 66–85% | Build a PoC / spike first, confirm assumptions, then implement |
| **Low** | < 66% | Run `/sdd-spike` or `/sdd-clarify` before any implementation |

Surface the confidence score explicitly when starting `/sdd-implement`:
```
Confidence: HIGH (91%) — all ACs well-defined, dependencies confirmed
```

## Progressive Task Tracking

When implementing tasks, maintain a change record for the current feature under `.copilot-tracking/changes/`:

- Filename: `YYYYMMDD-[feature-slug]-changes.md`
- Create the file before the first task; append after every completed task
- Sections: `### Added`, `### Modified`, `### Removed` — one line per file change
- Add a `### Release Summary` only after ALL tasks are marked `[x]`

This file is the audit trail for the implementation phase and must not be deleted until the feature PR merges.
