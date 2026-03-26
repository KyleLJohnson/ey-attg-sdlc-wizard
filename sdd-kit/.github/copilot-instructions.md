# GitHub Copilot Workspace Instructions

<!-- 
  This file is automatically loaded as context for GitHub Copilot in this workspace.
  Keep it focused, structured, and actionable.
  Update sections as your project evolves.
-->

## Project Identity

<!-- 
  FILL IN:
  - Project name and one-sentence description
  - Primary users / personas
  - Core problem being solved
-->

**Project:** [PROJECT_NAME]  
**Purpose:** [ONE_SENTENCE_DESCRIPTION]  
**Primary Users:** [USER_PERSONAS]

---

<!-- Governance loading, Context references, and agent behavior rules are defined in
     .github/instructions/ and auto-loaded by Copilot per applyTo: patterns. -->

## SpecDD Workflow Commands

**Governance setup** (run once per governance level, highest first):

| Command | Purpose |
|---|---|
| `/sdd-blueprint` | Generate BU-level reference architectures and standards (Level 2) |
| `/sdd-domain-spec` | Generate domain namespace spec and shared models (Level 3) |
| `/sdd-constitution` | Generate product governing principles (Level 4) |
| `/sdd-context-map` | Map bounded contexts and their relationships (DDD context mapping) |

**Feature workflow** (run for each feature):

| Command | Purpose |
|---|---|
| `/sdd-specify` | Create a functional specification for a feature |
| `/sdd-plan` | Generate a technical implementation plan |
| `/sdd-tasks` | Break down spec + plan into actionable tasks |
| `/sdd-implement` | Execute implementation tasks one by one |

**Optional enhancement commands:**

| Command | Purpose |
|---|---|
| `/sdd-clarify` | Resolve ambiguities in a spec before planning |
| `/sdd-checklist` | Validate spec/plan quality (unit tests for English) |
| `/sdd-analyze` | Cross-check spec, plan, and tasks before implementing |
| `/sdd-code-review` | Comprehensive code review against spec, governance, security, and quality |
| `/sdd-adr` | Record an Architectural Decision (saves to `docs/decisions/`) |
| `/sdd-spike` | Run a time-boxed technical investigation |

**GitHub Issues integration** (optional, after `/sdd-tasks`):

| Command | Purpose |
|---|---|
| `/sdd-issues-from-spec` | Create Feature + Story issues from a spec file |
| `/sdd-issues-from-plan` | Create Task issues from a completed task list |
| `/sdd-issues-unmet` | Audit codebase and create issues for unmet spec ACs |

**Project discovery** (optional):

| Command | Purpose |
|---|---|
| `/sdd-create-llms` | Generate `llms.txt` for AI-agent discoverability |
| `/sdd-update-llms` | Update `llms.txt` after spec, ADR, or stack changes |

---

## Agent Behavior

Behavior rules (Always Do / Ask Before Doing / Never Do / Transparency / Scope Control) are defined in `.github/instructions/agent-behavior.instructions.md` and load automatically.

Governance loading order and Context references are in `.github/instructions/governance.instructions.md`.

Spec-phase awareness, task format, EARS notation, Confidence Scores, and Progressive Tracking rules are in `.github/instructions/sdd-workflow.instructions.md`.

MCP server integration and phase-by-phase tool guidance is in `.github/instructions/mcp-tools.instructions.md`.

**Optional instruction files** (load manually when needed):
- `.github/instructions/context-engineering.instructions.md` — Copilot context best practices
- `.github/instructions/devops-core-principles.instructions.md` — CALMS framework and DORA Four Key Metrics
- `.github/instructions/agent-safety.instructions.md` — Fail-closed, least-privilege agent safety rules

## SpecDD Agents

Pre-built agent definition files for common SpecDD workflows:

| Agent | Purpose |
|---|---|
| `.github/agents/sdd-specify.agent.md` | Full specification workflow: context load, EARS notation, Confidence Scores, self-review |
| `.github/agents/sdd-implement.agent.md` | Task-by-task implementation with progressive change tracking |
| `.github/agents/sdd-orchestrator.agent.md` | End-to-end SpecDD orchestration with governance gates at each phase transition |

## Copilot Hooks

Session lifecycle hooks for observability and governance:

| Hook | Purpose | Logs |
|---|---|---|
| `.github/hooks/governance-audit/` | Per-prompt threat detection (5 categories) | `logs/copilot/governance/audit.log` |
| `.github/hooks/session-logger/` | Session start/end + prompt activity | `logs/copilot/session.log`, `prompts.log` |

See each hook's `README.md` for setup instructions and environment variable configuration.

---

## MCP Tools

<!--
  List MCP servers configured for this project. Remove rows that are not applicable.
  Full phase-by-phase guidance is in .github/instructions/mcp-tools.instructions.md
-->

| MCP Server | Purpose | Status |
|---|---|---|
| ADO MCP | Work items, PRs, pipelines, repos, wikis | Registered |
| Figma MCP | Design context, FigJam diagrams, code connect | Registered |
| Motif MCP | EY design system components, tokens, quality | Registered |
| PostgreSQL MCP | Schema introspection, queries, migrations | Registered |
| SonarQube MCP | Code quality gates, security hotspots | Configure in `.vscode/mcp.json` |
| GitHub MCP | Issues, PRs (GitHub.com projects only) | Configure in `.vscode/mcp.json` |

---

## Code Style Summary

<!--
  FILL IN your project's key style rules. Add a real code example.
  Example:
-->

- Language: [YOUR_LANGUAGE]
- Framework: [YOUR_FRAMEWORK]
- Test framework: [YOUR_TEST_FRAMEWORK]
- Linting: [YOUR_LINTER]
- Formatting: [YOUR_FORMATTER]

> For full style guide, see `context/tech-stack.md`.

---

## Project Structure

<!--
  FILL IN the key directories of your actual project.
-->

```
src/          ← Application source code
tests/        ← Unit and integration tests
docs/         ← Project documentation
specs/        ← Feature specifications (SpecDD artifacts)
context/  ← Persistent AI context files
```

---

## Current Phase

<!--
  Update this as you progress. Helps Copilot understand current context.
  Options: context-setup | specifying | planning | tasking | implementing | reviewing
-->

**Current SpecDD Phase:** `context-setup`  
**Active Feature Spec:** `specs/_template/` (no active spec yet)
