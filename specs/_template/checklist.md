# Quality Checklist: [Feature Name]

<!--
  Feature: [NNN]-[feature-slug]
  Complete this BEFORE and AFTER implementation.
  Last updated: [DATE]
-->

---

## Pre-Implementation Gate
> Complete before running /sdd-implement

### Spec Quality
- [ ] All user stories have acceptance criteria in GIVEN/WHEN/THEN format
- [ ] Out-of-scope items are explicitly listed
- [ ] No blocking open questions remain
- [ ] Non-functional requirements defined (performance, security, accessibility)
- [ ] Spec reviewed and approved by product owner / tech lead

### Plan Quality
- [ ] All acceptance criteria are addressed in the plan
- [ ] Tech stack choices use only approved technologies (or exceptions documented)
- [ ] Data model is defined (data-model.md)
- [ ] API contracts are defined if applicable (api.md)
- [ ] Security considerations documented
- [ ] Testing strategy covers all acceptance criteria
- [ ] Definition of Done is specific and verifiable

### Task Quality
- [ ] Every acceptance criterion is covered by at least one task
- [ ] Every task has an acceptance test defined
- [ ] Task dependencies are correct (no circular dependencies)
- [ ] Tasks are ordered — dependencies are completed first
- [ ] At least one test task per acceptance criterion

---

## Post-Implementation Gate
> Complete before merging / deploying

### Code Quality
- [ ] All tasks marked `[x]` in tasks.md
- [ ] No `TODO` or `FIXME` left without an issue tracked
- [ ] No commented-out code
- [ ] No hardcoded secrets or credentials
- [ ] No `console.log` / debug statements left in production code

### Testing
- [ ] All unit tests pass: `[TEST_COMMAND]`
- [ ] All integration tests pass
- [ ] All E2E tests pass (if applicable)
- [ ] No test coverage regression (coverage ≥ threshold in tech-stack.md)
- [ ] Edge cases and error states are tested

### Spec Compliance
- [ ] Every acceptance criterion in spec.md is demonstrably satisfied
- [ ] No features were added that are not in the spec (scope creep)
- [ ] Any out-of-scope items discovered were tracked as new specs, not implemented silently

### Security
- [ ] All inputs validated server-side
- [ ] No sensitive data in logs
- [ ] Authorization checks in place for all protected endpoints
- [ ] SQL injection / XSS / CSRF protections verified
- [ ] Secrets managed via environment variables, not hardcoded

### Performance
- [ ] DB queries have appropriate indexes
- [ ] No N+1 query patterns
- [ ] Response times measured against targets in spec
- [ ] No unnecessary blocking operations in critical paths

### Documentation
- [ ] README / API docs updated if applicable
- [ ] Inline code documentation for public interfaces
- [ ] spec.md status updated to `Implemented`
- [ ] tasks.md implementation log filled in

### Review
- [ ] Code reviewed by at least one other developer
- [ ] Reviewer confirmed spec compliance
- [ ] PR description references spec and plan
