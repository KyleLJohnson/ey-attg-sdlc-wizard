# Implementation Guide

> How to use an approved spec, plan, and task list to steer AI-driven code generation effectively.

---

## Core Principle

A spec-driven implementation is **not** "let the AI build everything in one shot."  
It's a **structured dialogue**: you provide specifications as context, the AI executes one task at a time, and you verify each result against the spec before continuing.

> The AI knows **what** to build (spec), **how** to build it (plan), and **what to do next** (tasks).
> Your role is to **steer and verify**, not to re-explain requirements on every prompt.

---

## Before You Start

### Required Context Files (always attach)
Every implementation session should have these in context:
1. `context/constitution.md` — governing rules
2. `specs/[NNN]-[feature]/spec.md` — what you're building
3. `specs/[NNN]-[feature]/plan.md` — how to build it
4. `specs/[NNN]-[feature]/tasks.md` — the task list

### Session Startup Prompt
```
I'm working on feature [NNN]-[feature-name]. 
Reference these files:
- #file:context/constitution.md
- #file:specs/[NNN]-[feature]/spec.md
- #file:specs/[NNN]-[feature]/plan.md
- #file:specs/[NNN]-[feature]/tasks.md

What is the first incomplete task?
```

---

## Task Execution Protocol

### For Each Task

**Step 1: Confirm understanding**
```
Before implementing T[NNN], summarize:
1. What will be built
2. Which acceptance criterion it satisfies
3. Which existing files will be modified vs. created new
```
Review the summary. If anything seems off, correct it before code is generated.

**Step 2: Implement**
```
Implement T[NNN]: [task title]
Follow the patterns in #file:context/tech-stack.md
Do not modify: [list of files that should not change]
```

**Step 3: Verify**
After the AI produces code, verify manually:
- Does it satisfy the acceptance test defined in tasks.md?
- Does it match the pattern in the plan?
- Does it follow constitution rules (naming, testing, etc.)?

**Step 4: Test**
```
Run the tests for T[NNN]. 
Command: [from tech-stack.md]
Fix any failures before marking the task complete.
```

**Step 5: Mark done and commit**
```
Mark T[NNN] as [x] in tasks.md.
Commit with message: "feat(T[NNN]): [task title]"
```

---

## Prompt Engineering Tips

### Structured Prompt Template

For any non-trivial implementation task, use this five-part structure:

```
Context: [What system/module you are working in, e.g. "Node.js Express API, authentication module"]

Specification:
- [Key requirement 1]
- [Key requirement 2, e.g. "JWT tokens expire in 24 hours"]
- [Integration constraint, e.g. "Uses existing UserRepository at src/repositories/user.repo.ts"]

Requirements:
- Generate [what to create]
- Include [specific output requirement, e.g. "proper error handling with status codes"]
- Follow [style/convention constraint from tech-stack.md]

Expected Output:
- [Artifact 1, e.g. "Single middleware function"]
- [Artifact 2, e.g. "Input validation for all fields"]
- [Artifact 3, e.g. "Comprehensive error responses"]

Constraints:
- [Hard limit 1, e.g. "No external dependencies beyond express and jsonwebtoken"]
- [Hard limit 2, e.g. "Must integrate with existing UserModel — do not create a new one"]
```

This structure prevents the most common AI task failures: wrong assumptions about context, missed edge cases, and inappropriate dependency choices.

### Always Provide Bounded Context
❌ Too broad:
```
Build the user authentication feature.
```
✅ Right scope:
```
Implement T002 — Create POST /api/auth/login endpoint.
It should validate email/password against the users table,
return a JWT on success, and 401 on failure.
Reference: #file:specs/001-auth/plan.md section "API Design"
```

### Reference the Spec, Don't Repeat It
❌ Repeating requirements:
```
The login must check the user's email, validate the password is correct, 
return a JWT token, expire in 24 hours, handle errors...
```
✅ Reference the source of truth:
```
Implement the login endpoint per the API contract in 
#file:specs/001-auth/api.md and the security rules in 
#file:context/constitution.md section 6.
```

### Constrain What Not to Change
```
Implement T003: create the UserProfileCard component.
Do NOT modify: UserLayout.tsx, AuthContext.tsx, or any existing test files.
Create new files only.
```

### Ask for a Plan Before Code
For complex tasks:
```
Before implementing T005, describe your implementation approach:
- Which files will you create/modify?
- How will you structure the data flow?
- What error states will you handle?
```
Review the plan. Adjust if needed. Then say "proceed with implementation."

---

## Managing Multi-Session Work

If you need to pause implementation and resume in a new session:

**End of session — save state:**
```
Session pause. Summarize:
- What was completed (tasks marked [x])
- What is in progress (tasks marked [~])
- Any notes or decisions made
- Next task to start when we resume
```

**Start of new session — restore state:**
```
Resuming implementation of [feature-name].
#file:specs/[NNN]-[feature]/tasks.md shows progress.
#file:specs/[NNN]-[feature]/plan.md has the technical design.
#file:context/constitution.md has governing rules.
The next incomplete task is T[NNN]. Ready to continue.
```

---

## When to Stop and Get Help

Stop the AI and request human clarification when:

| Signal | What to Do |
|---|---|
| AI modifies something in "Ask Before Doing" list | Stop. Get approval. Then resume. |
| AI output doesn't match spec expectation | Re-read spec. Clarify with more specific prompt. |
| AI introduces a library not in tech-stack.md | Reject. Ask for solution using approved stack. |
| Task scope seems larger than estimated | Split the task. Create new sub-tasks in tasks.md. |
| Tests fail in ways unrelated to current task | Stop. Investigate regression before continuing. |
| AI seems confused or circular | Start fresh session. Re-attach context. |

---

## Quality Assurance Per Task

After each task, quickly verify:

```
Quick quality check for T[NNN]:
1. Does the code follow naming conventions in tech-stack.md? (yes/no)
2. Are there unit tests for the new code? (yes/no)
3. Are error states handled explicitly? (yes/no)
4. Is any sensitive data logged? (yes/no — must be no)
5. Is the acceptance criterion from spec.md satisfied? (yes/no)
```

### Confidence-Based Review Scaling

Not all tasks require the same review depth. Scale review effort based on AI confidence level and code complexity:

| Confidence Level | Typical Scope | Review Requirement |
|---|---|---|
| **High (>90%)** | Single-function implementations <50 lines; established patterns already in the codebase | Automated tests pass + single developer approval |
| **Medium (70–90%)** | Cross-service integrations; new API implementations; unfamiliar modules | Full PR review + senior developer approval + integration testing |
| **Low (<70%)** | Security-critical code; complex business logic; novel architectural choices | Pair programming + security review + comprehensive testing |

Signals of low AI confidence (even without explicit scoring):
- Output references files or functions that don't exist in the codebase
- Generated code includes inline comments expressing uncertainty ("// not sure if this is the right approach")
- Constitution rules are violated despite being explicitly stated
- Task scope grew beyond the original 1–2 file boundary

---

## Phase-by-Phase Execution Strategy

Rather than running `/sdd-implement` on the entire task list at once, execute **phase by phase** using this checkpoint loop:

```
Implement Phase 1 → Review → Validate → Correct if needed → Proceed to Phase 2 → ...
```

This transforms overwhelming scope into manageable, verifiable increments. Early validation prevents issues from compounding across later phases.

**Why it matters:** Each SpecDD phase independently delivers roughly 80% accuracy. Chained without review gates, the cumulative effect compounds:

$$0.8 \times 0.8 \times 0.8 \times 0.8 \times 0.8 \approx 0.33$$

Without intermediate checks, roughly one-third of the output quality survives to the end. Review gates are not bureaucratic overhead — they are a data-backed structural safeguard.

---

## AI Deviation Patterns to Watch For

Even with explicit constitution rules, tasks, and plan constraints, the AI will deviate. These deviations are **normal** — your review process exists to catch them.

| Deviation Type | Example | What to Do |
|---|---|---|
| **Constitution violation** | Adds try/catch blocks to route handlers despite "no try/catch" rule | Remove and re-run with corrected prompt referencing the specific rule |
| **Task/plan divergence** | Adds a service layer not in the plan; skips a planned integration step | Reject the output; re-prompt with explicit reference to plan.md section |
| **Scope creep** | Adds features not in the current task | Reject extra code; re-implement scoped to the exact task |
| **Duplication** | Creates a new EmailService next to an existing one with the same name | Remove duplicate; reinforce search-before-create in constitution |
| **Out-of-spec file modifications** | Modifies files not listed in the task | Revert affected files; add to `agent-boundaries.md` |

> **Model intelligence matters here.** Newer, more capable models (e.g., Claude Sonnet 4.5 vs 4.0) hold context across longer implementations, detect code reuse more accurately, and follow constitution rules more consistently. The higher per-token cost is typically recovered in reduced rework time alone.

### The Third Refinement Rule

If you find yourself making a **third or fourth "small" fix** to the same artifact, stop iterating. Multiple micro-refinements usually mask a structural issue in an upstream phase. Identify the root-cause phase, fix it there, and regenerate downstream artifacts.

```
Refinement #1 → ok to iterate
Refinement #2 → ok to iterate
Refinement #3 → STOP. Fix upstream. Regenerate.
```

Prefer **prompt-based refinements** over manual edits to tasks.md or plan.md. Manual edits break the regeneration chain — when you re-run `/sdd-tasks` or `/sdd-implement`, your manual changes are lost. Prompt-based fixes preserve intent and traceability across iterations.

---

## Code Quality Expectations

Set realistic expectations before implementation begins:

| Metric | Typical Result |
|---|---|
| **Code retention** | 60–80% of generated code kept after review = **excellent** |
| **Required refinement** | 20–40% of code needs adjustment (edge cases, integration fixes, constitution violations) |
| **Quality consistency** | Varies unpredictably — some generated code is production-ready; some has subtle issues |
| **Review role** | Treat AI output like a capable junior developer's PR — review carefully, correct where needed |

> This is not a failure mode. It is the expected operating model. AI handles the mechanical, structured work. Human judgment handles edge cases, tradeoffs, and architectural alignment.

### After Initial Implementation

Once the AI generates a working baseline, shift to **AI-assisted engineering** rather than AI-autonomous generation:
- Review the implementation for deviations and quality issues
- Use AI tools (Copilot, Claude Code, Cursor) to apply targeted corrections efficiently
- You drive the decisions; AI assists with execution
- The result: better quality than full-autonomy, faster than fully manual correction