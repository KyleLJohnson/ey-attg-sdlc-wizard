# Task List: [Feature Name]

**Branch:** `[###-feature-name]`  
**Date:** [DATE]  
**Spec:** `specs/[NNN]-[feature-name]/spec.md`  
**Plan:** `specs/[NNN]-[feature-name]/plan.md`

**Prerequisites:** `plan.md` (required), `spec.md` (required), `data-model.md` (if applicable), `contracts/` (if applicable)

**Tests:** Include test tasks only if explicitly requested in the feature specification.

**Organization:** Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Task Format

```
- [ ] T001 [P] [US1] Description with exact file path
```

| Field | Description |
|---|---|
| `- [ ]` | Checkbox — always present. Mark `[x]` when done. |
| `T001` | Sequential task ID in execution order. |
| `[P]` | Parallelizable — safe to run alongside other `[P]` tasks (different files, no unresolved deps). Omit if not parallelizable. |
| `[US1]` | User story link — required for user story phase tasks. Omit for Setup, Foundational, and Polish phases. |
| Description | Clear action with the **exact file path** where implementation occurs. |

---

## Path Conventions

- **Single project:** `src/`, `tests/` at repository root
- **Web app:** `backend/src/`, `frontend/src/`
- **Mobile:** `api/src/`, `ios/src/` or `android/src/`

Adjust paths based on `plan.md` project structure.

---

<!--
  ============================================================
  IMPORTANT: Replace ALL sample tasks below with real tasks
  based on:
  - User stories from spec.md (with their priorities P1, P2...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  DO NOT retain these samples in a generated tasks.md.
  ============================================================
-->

## Phase 1: Setup (Shared Infrastructure)

> Project initialization, environment config, shared scaffolding

- [ ] T001 [e.g., Initialize project structure per plan.md `src/`, `tests/`]
- [ ] T002 [e.g., Configure environment variables and secrets loading `src/config.ts`]
- [ ] T003 [e.g., Run database migration `db/migrations/001_[feature].sql`]

---

## Phase 2: Foundational (Blocking Prerequisites)

> Base models, shared services, cross-cutting concerns that all user stories depend on

- [ ] T004 [P] [e.g., Create `[Entity]` model with validation `src/models/[entity].ts`]
- [ ] T005 [P] [e.g., Create `[Service]` base class `src/services/[service].ts`]

---

## Phase 3: User Story 1 — [Title] (Priority: P1) 🎯 MVP

> Goal: [One-sentence description of what user can do when this phase is complete]  
> Independent test: [How to verify this story in isolation without other stories]

- [ ] T006 [US1] [e.g., Implement `[function]` in `src/services/[service].ts`]
- [ ] T007 [P] [US1] [e.g., Create `POST /[endpoint]` handler `src/api/[resource].ts`]
- [ ] T008 [P] [US1] [e.g., Write unit tests for `[service]` `tests/unit/[service].test.ts`]
- [ ] T009 [US1] [e.g., Write integration test for `POST /[endpoint]` `tests/integration/[resource].test.ts`]

---

## Phase 4: User Story 2 — [Title] (Priority: P2)

> Goal: [One-sentence description]  
> Independent test: [How to verify this story]

- [ ] T010 [US2] [e.g., Implement `[function]` `src/services/[service].ts`]
- [ ] T011 [P] [US2] [e.g., Create `GET /[endpoint]` handler `src/api/[resource].ts`]
- [ ] T012 [P] [US2] [e.g., Write unit tests `tests/unit/[service].test.ts`]

---

## Phase N: Polish & Cross-Cutting Concerns

> Error messages, loading states, accessibility, documentation

- [ ] TNNN [P] [e.g., Add error handling for [scenario] `src/api/[resource].ts`]
- [ ] TNNN Update `spec.md` status to "Implemented"

---

## Dependencies & Execution Order

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Polish
                                          ↗ Phase 4 (US2) — may start after T004/T005
```

User stories that can run in parallel after foundational phase: [US2, US3] (if independent)

---

## Parallel Execution Example: User Story 1

The following tasks within Phase 3 can run in parallel (marked `[P]`):
- T007 (API handler) and T008 (unit tests) — different files, no dependency between them

---

## Blocked Items

| Task | Blocker | Owner | Since |
|---|---|---|---|
| [Task ID] | [What's blocking] | [Who resolves] | [DATE] |
