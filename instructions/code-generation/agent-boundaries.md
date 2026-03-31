# Agent Boundaries

> Define what your AI coding agent may do freely, must ask permission for, and must never do.
> This file is referenced by the constitution and all prompt files.
> **Fill this in for your specific project before implementation begins.**

---

## How to Use This File

1. Copy the template below into your `context/constitution.md` (Section 7)
2. Customize for your project context
3. Reference it in your `copilot-instructions.md` / `CLAUDE.md` / agent config
4. Review and update as the project evolves

---

## Three-Tier Boundary Model

Based on research from GitHub's analysis of 2,500+ agent configuration files, the most effective approach uses three tiers — not just a flat "don't do this" list.

---

### ✅ ALWAYS DO
> These actions are safe. The AI should do them without asking.

**Code Quality**
- Always run the project test suite after any code change (`[TEST_COMMAND]`)
- Always run the linter before completing a task (`[LINT_COMMAND]`)
- Always write unit tests alongside new implementation code
- Always follow naming conventions in `context/tech-stack.md`
- Always use the project logger — never use `console.log` directly in production code

**Security**
- Always validate external inputs at the system boundary
- Always use parameterized queries — never string-concatenated SQL
- Always hash passwords using the approved algorithm before storing

**SpecDD Workflow**
- Always reference `context/constitution.md` before generating code
- Always reference the active spec before implementing a task
- Always mark tasks `[x]` in `tasks.md` after completion
- Always commit spec files before implementation begins

---

### ⚠️ ASK FIRST
> These actions require human review and approval before proceeding.

**Database**
- Any schema change (adding/removing/modifying tables or columns)
- Any migration that modifies existing data
- Any change to database indexes on production tables

**Dependencies**
- Adding any new third-party library or framework
- Upgrading major versions of existing dependencies
- Removing any existing dependency

**APIs & Interfaces**
- Changing any approved API contract in `specs/*/api.md`
- Modifying any public interface that other teams depend on
- Adding new authentication or authorization mechanisms

**Infrastructure & Configuration**
- Modifying CI/CD pipeline configuration
- Changing environment variable names or structure
- Modifying deployment configuration

**Cross-Module Refactoring**
- Refactoring that touches more than 3 files simultaneously
  > *Why this threshold:* LLMs maintain high coherence up to ~3 files; beyond 10 files, consistency breaks down fundamentally. This is a structural LLM constraint — not a prompting issue. Keep implementation tasks scoped to 1–2 files for reliable, reviewable output.
- Moving or renaming modules, files, or directories
- Changing shared utility functions used across the codebase

---

### 🚫 NEVER DO
> Hard stops. No exceptions. Raise an error if asked to do these.

**Security Hard Stops**
- Never commit secrets, API keys, passwords, or credentials to version control
- Never log passwords, tokens, credit card numbers, or other sensitive data
- Never disable or bypass authentication/authorization checks
- Never use `eval()` or equivalent dynamic code execution with untrusted input

**Code Integrity Hard Stops**
- Never edit files in `node_modules/`, `vendor/`, `.venv/`, or other generated directories
- Never skip, remove, or comment out a failing test without explicit human approval
- Never modify generated code files marked "DO NOT EDIT"
- Never delete files without explicit confirmation

**Process Hard Stops**
- Never bypass the spec-first workflow for non-trivial features
- Never modify `context/constitution.md` without explicit instruction
- Never merge to main/master branch directly (PRs required)
- Never deploy to production without completing the quality checklist

---

## Project-Specific Rules

> Add your project's custom rules here after completing the above.

### Additional ALWAYS DO rules
- [ ] [FILL IN — e.g., Always include OpenTelemetry trace spans for new API endpoints]
- [ ] [FILL IN — e.g., Always update the Swagger/OpenAPI docs when changing an endpoint]

### Additional ASK FIRST rules
- [ ] [FILL IN — e.g., Any change to the landing page (product review required)]
- [ ] [FILL IN — e.g., Changes to the payment processing flow (security review required)]

### Additional NEVER DO rules
- [ ] [FILL IN — e.g., Never call third-party analytics APIs directly — use the Analytics wrapper]
- [ ] [FILL IN — e.g., Never store user location data without consent flag being set]

---

## Template for agent config files

Copy this into your `.github/copilot-instructions.md`, `CLAUDE.md`, or equivalent:

```markdown
## Agent Behavior Rules

### Always Do
- Run tests after every code change: `[TEST_COMMAND]`
- Follow naming conventions in context/tech-stack.md
- Write tests alongside new code
- Reference context/constitution.md before generating code

### Ask Before Doing
- Database schema changes
- Adding new dependencies
- Changing API contracts
- Cross-module refactoring

### Never Do
- Commit secrets or API keys
- Edit node_modules/ or vendor/ directories
- Skip failing tests without explicit approval
- Modify context/constitution.md without instruction
```
