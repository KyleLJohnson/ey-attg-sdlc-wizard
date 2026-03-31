---
agent: agent
description: Cross-check spec, plan, and tasks for consistency and coverage before implementation begins. Read-only — produces analysis report only, modifies no files.
---

# SpecDD: Analyze Spec-Plan-Tasks Consistency

You are a **quality analyst** performing a cross-artifact consistency and coverage analysis. This is a pre-implementation gate to ensure nothing has been lost in translation between the spec, plan, and tasks.

## Instructions

Analyze the following files for the active feature:
- `specs/[active-feature]/spec.md` — functional requirements and acceptance criteria
- `specs/[active-feature]/plan.md` — technical implementation plan
- `specs/[active-feature]/tasks.md` — task breakdown (if already generated)
- `context/constitution.md` — governing principles

## Analysis Dimensions

### 1. Acceptance Criteria Traceability
For each acceptance criterion in `spec.md`:
- [ ] Is it addressed in `plan.md`?
- [ ] Is there at least one task in `tasks.md` that implements it?
- [ ] Is there a test (unit/integration/e2e) planned for it?

### 2. Scope Drift Check
- [ ] Does the plan introduce anything not in the spec?
- [ ] Does the plan omit anything required by the spec?
- [ ] Do tasks introduce scope beyond what the plan describes?

### 3. Constitution Compliance
For each principle in `context/constitution.md`:
- [ ] Does the plan comply?
- [ ] Do the tasks comply?
- [ ] Are there any principle violations to flag?

### 4. Technical Risk Coverage
- [ ] Are all risks identified in `plan.md` addressed by at least one task?
- [ ] Are all integration points tested?
- [ ] Is error handling covered in tasks?

### 5. Definition of Done Alignment
- [ ] Is the Definition of Done in `plan.md` specific and testable?
- [ ] Do the tasks collectively satisfy the Definition of Done?

## Output Format

```
# Analysis Report: [Feature Name]

## Overall Status
[Green: Ready to Implement | Yellow: Minor gaps | Red: Blocking issues found]

## Traceability Matrix
[Table mapping: Acceptance Criterion → Plan Section → Task ID(s) → Test Coverage]

## Gaps Found
[List of acceptance criteria, risks, or requirements with no corresponding task]

## Scope Drift
[Items in plan/tasks that are not in the spec — flag as scope creep or legitimate additions]

## Constitution Violations
[Any plan or task decisions that contradict governing principles]

## Recommended Fixes
[Specific, actionable changes to spec/plan/tasks before implementing]

## Sign-Off
[Cleared for implementation: YES / NO — with conditions if NO]
```

After generating, prompt: "Review the analysis report. Address any gaps before running /sdd-implement."
