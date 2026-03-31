# Code Review Checklist

> Use this to verify AI-generated code against the spec and quality standards.
> Run after each task and before raising a PR.

---

## How to Use

**Manual review:** Work through each section after the AI completes a task.  
**AI-assisted review:** Prompt the AI to self-review against this checklist:
```
Review your implementation of T[NNN] against the checklist in 
instructions/code-generation/review-checklist.md.
Flag any items that don't pass.
```

---

## Section 1: Spec Compliance

- [ ] The implementation satisfies the acceptance test defined in `tasks.md` for this task
- [ ] The implementation fulfills the acceptance criterion(a) in `spec.md` referenced by this task
- [ ] No features were added that are out of scope per `spec.md`
- [ ] The implementation follows the technical approach described in `plan.md`

---

## Section 2: Code Quality

### Readability
- [ ] Function and variable names are descriptive and follow conventions in `tech-stack.md`
- [ ] Functions are focused — each does one thing
- [ ] No function exceeds the line length limit defined in `tech-stack.md` (or a reasonable limit of ~30 lines)
- [ ] No magic numbers — use named constants
- [ ] No TODO/FIXME left without a tracked issue

### Maintainability
- [ ] No duplicated logic — if it's used twice, it's extracted
- [ ] No commented-out code
- [ ] Dependencies are injected or imported, not created inline
- [ ] No deep nesting — refactor if > 3 levels deep

### Type Safety
- [ ] No `any` types (TypeScript) without explicit justification
- [ ] Return types are declared for public functions
- [ ] Null/undefined handled explicitly — not assumed away

---

## Section 3: Testing

- [ ] New code has corresponding unit tests
- [ ] Tests cover the happy path
- [ ] Tests cover at least one error/failure path
- [ ] Tests cover edge cases relevant to this task's acceptance criterion
- [ ] Tests are deterministic — do not depend on time, randomness, or external state without mocking
- [ ] All tests pass: `[TEST_COMMAND]`
- [ ] No existing tests were broken (no regressions)

---

## Section 4: Error Handling

- [ ] All error states are handled explicitly (no silent catches)
- [ ] Error messages are user-friendly where surfaced to the UI
- [ ] Errors are logged with enough context for debugging
- [ ] External service failures are handled gracefully (timeout, retry, fallback)
- [ ] Validation errors return actionable feedback (not just "invalid input")

---

## Section 5: Security

- [ ] All external inputs are validated and sanitized
- [ ] No sensitive data in logs (passwords, tokens, PII, payment info)
- [ ] SQL queries use parameterized forms — no string concatenation
- [ ] No new secrets hardcoded (use environment variables)
- [ ] Authorization checks are in place for all protected routes/operations
- [ ] No information leakage in error messages (stack traces, DB errors exposed to client)

---

## Section 6: Performance

- [ ] No N+1 query patterns (load collections in batch, not per-item)
- [ ] Database queries use appropriate indexes
- [ ] No expensive operations in tight loops or hot paths
- [ ] Async operations are properly awaited (no fire-and-forget in critical paths)

---

## Section 7: Compliance with Tech Stack

- [ ] Only libraries from `context/tech-stack.md` are used (or new ones explicitly approved)
- [ ] Naming conventions from `context/tech-stack.md` are followed
- [ ] Patterns from `context/architecture.md` are followed (no architectural violations)
- [ ] No banned libraries or patterns from `context/tech-stack.md` are used

---

## Section 8: Constitution Compliance

- [ ] No security rules from `context/constitution.md` are violated
- [ ] No process rules are violated (e.g., no skipped tests)
- [ ] "Never Do" rules from `instructions/code-generation/agent-boundaries.md` are not violated

---

## Pass / Fail Determination

| Result | Action |
|---|---|
| All items checked | Mark task `[x]`, commit, proceed |
| 1–3 minor items | Fix before committing |
| 4+ items, or any Section 5 item | Do not commit — rework required |
| Constitution violation | Stop, escalate to tech lead |
