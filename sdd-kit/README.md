# Spec-Driven Development (SpecDD) Starter Kit

> **Specifications are the source of truth. Code is the output.**

This starter kit provides everything you need to adopt Spec-Driven Development (SpecDD) on a new or existing project using AI coding agents (GitHub Copilot, Claude Code, Cursor, Gemini CLI, and others).

> **How to use this repo:** Copy this folder (`sdd-kit/`) into your project root. Everything inside is designed to be dropped in as-is — your AI agent, slash commands, governance, specs, and templates are all ready to go.

---

## What is Spec-Driven Development?

Instead of prompting AI to write code directly, SpecDD structures the process:

1. **Specify** – Define *what* you want to build (user journeys, outcomes, acceptance criteria)
2. **Plan** – Define *how* to build it (tech stack, architecture, constraints)
3. **Tasks** – Break it into small, testable, reviewable chunks
4. **Implement** – Let the AI execute task-by-task while you verify

The spec becomes a **living artifact** that evolves with the project — not documentation written after the fact.

---

## SpecDD Levels (Choose Your Depth)

| Level | Description | When to Use |
|---|---|---|
| **Spec-First** | Write spec before coding; discard after feature ships | Quick features, prototypes |
| **Spec-Anchored** | Keep and evolve the spec as the feature evolves | Ongoing features, team projects |
| **Spec-as-Source** | Spec is the primary artifact; code is generated from it | Mature SpecDD, enterprise contexts |

---

## Folder Structure

```
sdd-kit/                             ← Copy this into your project root
├── README.md                        ← This file
├── SETUP.md                         ← Step-by-step setup guide
│
├── governance/                  ← Cross-team governance (read-only for product teams)
    │   ├── README.md                ← Governance hierarchy explained
    │   ├── enterprise-constitution.md  ← Level 1: Enterprise-wide rules (copy from your org)
    │   ├── blueprints/
    │   │   └── _template/
    │   │       └── blueprint.md     ← Level 2: BU reference architectures (generate with /sdd-blueprint)
    │   └── domain-specs/
    │       └── _template/
    │           └── domain-spec.md   ← Level 3: Domain namespace, shared models (generate with /sdd-domain-spec)
    │
├── .github/
│   ├── copilot-instructions.md      ← Workspace-level AI agent instructions
│   ├── instructions/                ← Auto-loaded instruction files (applyTo: patterns)
│   │   ├── governance.instructions.md       ← Governance loading order + Context refs
│   │   ├── sdd-workflow.instructions.md     ← Spec-phase rules, EARS notation, Confidence Scores
│   │   ├── agent-behavior.instructions.md   ← Always / Ask / Never / Transparency / Scope rules
│   │   ├── mcp-tools.instructions.md        ← MCP server → SpecDD phase mapping + fallback rules
│   │   ├── context-engineering.instructions.md  ← [optional] Copilot context best practices
│   │   ├── devops-core-principles.instructions.md ← [optional] CALMS + DORA metrics
│   │   └── agent-safety.instructions.md    ← [optional] Fail-closed, least-privilege rules
│   ├── agents/                      ← SpecDD-specific agent definition files
│   │   ├── sdd-specify.agent.md     ← Full specification workflow agent
│   │   ├── sdd-implement.agent.md   ← Task-by-task implementation agent
│   │   └── sdd-orchestrator.agent.md ← End-to-end SpecDD workflow orchestrator
│   ├── hooks/                       ← Copilot session lifecycle hooks
│   │   ├── governance-audit/        ← Threat-detection and audit logging hook
│   │   │   ├── hooks.json
│   │   │   ├── audit-prompt.sh
│   │   │   ├── audit-session-start.sh
│   │   │   ├── audit-session-end.sh
│   │   │   └── README.md
│   │   └── session-logger/          ← Session + prompt activity logger
│   │       ├── hooks.json
│   │       ├── log-prompt.sh
│   │       ├── log-session-start.sh
│   │       ├── log-session-end.sh
│   │       └── README.md
│   └── prompts/                     ← Slash commands for GitHub Copilot
│       ├── sdd-blueprint.prompt.md
│       ├── sdd-domain-spec.prompt.md
│       ├── sdd-constitution.prompt.md
│       ├── sdd-context-map.prompt.md
│       ├── sdd-specify.prompt.md
│       ├── sdd-clarify.prompt.md
│       ├── sdd-checklist.prompt.md
│       ├── sdd-plan.prompt.md
│       ├── sdd-tasks.prompt.md
│       ├── sdd-analyze.prompt.md
│       ├── sdd-implement.prompt.md
│       ├── sdd-code-review.prompt.md
│       ├── sdd-adr.prompt.md
│       ├── sdd-spike.prompt.md
│       ├── sdd-issues-from-spec.prompt.md
│       ├── sdd-issues-from-plan.prompt.md
│       ├── sdd-issues-unmet.prompt.md
│       ├── sdd-create-llms.prompt.md
│       └── sdd-update-llms.prompt.md
│
├── context/                     ← Project-wide persistent context (always in scope)
│   ├── constitution.md              ← Governing principles, non-negotiables [GENERATE FIRST]
│   ├── architecture.md              ← Architecture decisions and patterns [GENERATE]
│   ├── tech-stack.md                ← Approved tech stack, libraries, constraints [GENERATE]
│   └── project.md                   ← High-level project overview [GENERATE]
│
├── specs/                           ← One folder per feature/story
│   └── _template/                   ← Copy this for every new feature
│       ├── spec.md                  ← Functional specification (what & why)
│       ├── plan.md                  ← Technical implementation plan (how)
│       ├── tasks.md                 ← Actionable task list (what to build next)
│       ├── data-model.md            ← Data model and entity definitions
│       ├── api.md                   ← API contracts and interface definitions
│       ├── research.md              ← Research notes, codebase analysis
│       ├── quickstart.md            ← Key validation scenarios
│       ├── checklist.md             ← Quality gate checklist
│       └── contracts/               ← API/interface contracts (one file per resource)
│
├── instructions/
│   ├── spec-generation/
│   │   ├── greenfield-guide.md      ← SpecDD guide for new (greenfield) projects
│   │   ├── brownfield-guide.md      ← SpecDD guide for existing (brownfield) projects
│   │   └── spec-quality-checklist.md ← Validate spec completeness before coding
│   └── code-generation/
│       ├── implementation-guide.md  ← How to steer AI through spec-driven implementation
│       ├── agent-boundaries.md      ← Always / Ask First / Never rules for your AI agent
│       └── review-checklist.md      ← Verify AI output against the spec
│
├── templates/
│   ├── spec-template.md             ← Reusable spec scaffold
│   ├── plan-template.md             ← Reusable technical plan scaffold
│   ├── tasks-template.md            ← Reusable task list scaffold
│   ├── constitution-template.md     ← Reusable constitution scaffold (Level 4)
│   ├── blueprint-template.md        ← Reusable BU blueprint scaffold (Level 2)
│   ├── domain-spec-template.md      ← Reusable domain spec scaffold (Level 3)
│   ├── agents-md-template.md        ← AGENTS.md / copilot-instructions scaffold
│   └── llms-txt-template.md         ← llms.txt scaffold for AI-agent discoverability
│
├── docs/
│   ├── sdd-methodology.md           ← SpecDD methodology deep-dive
│   ├── workflow.md                  ← End-to-end workflow reference
│   ├── greenfield-vs-brownfield.md  ← Adoption pattern comparison
│   ├── faq.md                       ← Common questions and pitfalls
│   └── references.md                ← External reading and tooling references
│
└── examples/                        ← Optional prompts & instructions (not part of core workflow)
    ├── README.md                    ← When and how to use examples
    ├── prompts/
    │   ├── catalog.md               ← Full curated catalog with source links
    │   ├── create-architectural-decision-record.prompt.md
    │   ├── create-technical-spike.prompt.md
    │   ├── create-github-issues-from-plan.prompt.md
    │   ├── context-map.prompt.md
    │   ├── refactor-plan.prompt.md  ← Multi-file refactor with sequencing + rollback
    │   └── what-context-needed.prompt.md ← Ask Copilot what files it needs first
    └── instructions/
        ├── catalog.md               ← Full curated catalog with source links
        ├── spec-driven-workflow-v1.instructions.md  ← Lighter-weight SpecDD alternative
        ├── agent-safety.instructions.md
        └── no-heredoc.instructions.md  ← Prevent heredoc file corruption in VS Code
- See [SETUP.md](SETUP.md) for full prerequisite list

### Step 1 — Initialize Your Project
```bash
# Copy this folder into your project root
cp -r sdd-kit/ my-project/
cd my-project
git init
```

### Step 2 — Generate Your Constitution
Open your AI agent and use the constitution prompt:
```
#file:.github/prompts/sdd-constitution.prompt.md
Create a constitution for [YOUR PROJECT NAME]. 
Focus on: [key principles, e.g., code quality, security, testing, UX consistency]
```
Review and commit `context/constitution.md` before proceeding.

### Step 3 — Create Your First Spec
```
#file:.github/prompts/sdd-specify.prompt.md
Build [describe what you want to build — focus on the WHAT and WHY, not the HOW].
Who are the users? What problem does this solve? What does success look like?
```
Review generated `specs/001-<feature-name>/spec.md`. Refine until it captures your intent.

### Step 4 — Generate the Technical Plan
```
#file:.github/prompts/sdd-plan.prompt.md
Tech stack: [your stack]. Architecture constraints: [your constraints].
Integration requirements: [any integrations]. Compliance: [security, data, etc.]
```
Review `specs/001-<feature-name>/plan.md`. Approve before moving to tasks.

### Step 5 — Generate Tasks and Implement
```
#file:.github/prompts/sdd-tasks.prompt.md
```
Then:
```
#file:.github/prompts/sdd-implement.prompt.md
```

---

## Core Workflow

```
[Enterprise Constitution]   ← governance/ (read-only, loaded as context)
       ↓
[Blueprint] → [Domain Spec] → [Constitution] → [Specify] → [Clarify?] → [Plan] → [Analyze?] → [Tasks] → [Implement]
                                    ↑                                                                           |
                                    └─────────────────────── Iterate & Refine ──────────────────────────────────┘
```

**Gate rule:** Do not move to the next phase until the current phase output is reviewed and approved.

---

## Available Commands

| Command | Purpose |
|---|---|
| `/sdd-blueprint` | Generate BU-level reference architecture and standards (Level 2) |
| `/sdd-domain-spec` | Generate domain namespace spec and shared models (Level 3) |
| `/sdd-constitution` | Generate product-level governing principles (Level 4) |
| `/sdd-context-map` | Map bounded contexts and their relationships (DDD context mapping) |

**Feature workflow:**

| Command | Purpose |
|---|---|
| `/sdd-specify` | Create a functional specification for a feature |
| `/sdd-clarify` | Resolve spec ambiguities before planning |
| `/sdd-checklist` | Validate spec/plan quality |
| `/sdd-plan` | Generate a technical implementation plan |
| `/sdd-tasks` | Break spec + plan into actionable tasks |
| `/sdd-analyze` | Cross-check spec, plan, and tasks |
| `/sdd-implement` | Execute implementation tasks one by one |
| `/sdd-code-review` | Comprehensive code review against spec, governance, and quality standards |

**Optional enhancements:**

| Command | Purpose |
|---|---|
| `/sdd-adr` | Record an Architectural Decision (`docs/decisions/`) |
| `/sdd-spike` | Run a time-boxed technical investigation |
| `/sdd-issues-from-spec` | Create Feature + Story GitHub Issues from a spec |
| `/sdd-issues-from-plan` | Create Task GitHub Issues from a task list |
| `/sdd-issues-unmet` | Audit codebase and create issues for unmet spec ACs |
| `/sdd-create-llms` | Generate `llms.txt` for AI-agent discoverability |
| `/sdd-update-llms` | Update `llms.txt` after spec, ADR, or stack changes |

---

## AI Agent Compatibility

| Agent | Config Location |
|---|---|
| GitHub Copilot | `.github/copilot-instructions.md` + `.github/prompts/` |
| Claude Code | `CLAUDE.md` (copy from `templates/agents-md-template.md`) |
| Cursor | `.cursor/rules/` (copy prompts) |
| Gemini CLI | `.gemini/` (copy prompts) |
| Generic agent | Use `templates/agents-md-template.md` as a starting point |

---

## Optional Extras — Reference Library

The `examples/` folder contains prompts and instructions that are **not part of the core SpecDD workflow** but may be useful for specific situations:

| Example | When to use |
|---|---|
| [`examples/instructions/agent-safety.instructions.md`](examples/instructions/agent-safety.instructions.md) | Adding scope/confirmation guardrails to autonomous agents |
| [`examples/instructions/spec-driven-workflow-v1.instructions.md`](examples/instructions/spec-driven-workflow-v1.instructions.md) | Lighter-weight SpecDD for solo/small projects |
| [`examples/instructions/no-heredoc.instructions.md`](examples/instructions/no-heredoc.instructions.md) | Prevent VS Code terminal heredoc file corruption |
| [`examples/prompts/refactor-plan.prompt.md`](examples/prompts/refactor-plan.prompt.md) | Plan a multi-file refactor with sequencing and rollback steps |
| [`examples/prompts/what-context-needed.prompt.md`](examples/prompts/what-context-needed.prompt.md) | Ask Copilot what files it needs to see before answering a question |

See [`examples/prompts/catalog.md`](examples/prompts/catalog.md) and [`examples/instructions/catalog.md`](examples/instructions/catalog.md) for the full curated catalog with source links.

To promote an example to active: copy it to `.github/prompts/` or `.github/instructions/`.

---

## References

See [docs/references.md](docs/references.md) for the full curated reading list.
