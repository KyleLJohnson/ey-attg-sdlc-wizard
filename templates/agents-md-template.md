# AGENTS.md / copilot-instructions.md Template

> Copy this file to the appropriate location for your AI agent:
> - GitHub Copilot → `.github/copilot-instructions.md`
> - Claude Code → `CLAUDE.md`
> - Cursor → `.cursor/rules/project.md`  
> - Generic agents → `AGENTS.md` in project root

---

# [PROJECT_NAME] — AI Agent Context

## Project Summary
**What:** [One sentence describing the project]  
**For whom:** [Primary users / personas]  
**Phase:** [context-setup | specifying | planning | implementing | reviewing]

---

## Context (Always Read First)

Before any task, read these files:
- `context/constitution.md` — **Governing principles — always apply**
- `context/tech-stack.md` — Approved stack, naming conventions, commands
- `context/architecture.md` — System architecture and patterns
- `context/project.md` — Project context and success criteria

---

## Active Feature (Update When Changing Features)

**Active spec:** `specs/[NNN]-[feature-name]/`  
**Relevant files:**
- `specs/[NNN]-[feature-name]/spec.md` — Requirements
- `specs/[NNN]-[feature-name]/plan.md` — Technical plan
- `specs/[NNN]-[feature-name]/tasks.md` — Task list

---

## Available Commands

| Command | Purpose |
|---|---|
| `/sdd-constitution` | Generate/update project constitution |
| `/sdd-specify` | Create functional spec |
| `/sdd-clarify` | Resolve spec ambiguities |
| `/sdd-plan` | Generate technical plan |
| `/sdd-analyze` | Cross-check spec/plan/tasks |
| `/sdd-tasks` | Generate task list |
| `/sdd-implement` | Execute implementation tasks |

---

## Agent Rules

### Always Do
- Read `context/constitution.md` before generating any code
- Run `[TEST_COMMAND]` after code changes
- Write tests alongside implementation code
- Follow naming conventions in `context/tech-stack.md`

### Ask Before Doing
- Database schema changes
- Adding new third-party dependencies
- Modifying API contracts
- Changes to CI/CD or deployment config

### Never Do
- Commit secrets, API keys, or credentials
- Edit `node_modules/`, `vendor/`, or generated directories
- Skip failing tests without explicit approval
- Modify `context/constitution.md` without instruction

---

## Project Structure

```
[FILL IN key directories once project structure is established]
src/       ← Application code
tests/     ← Tests
specs/     ← SpecDD feature specs
context/ ← AI context files
```

---

## Key Commands

```bash
[INSTALL_COMMAND]    # Install dependencies
[DEV_COMMAND]        # Start dev server
[TEST_COMMAND]       # Run all tests
[LINT_COMMAND]       # Lint
[BUILD_COMMAND]      # Build for production
```
