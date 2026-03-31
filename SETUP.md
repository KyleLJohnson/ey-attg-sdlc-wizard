# Setup Guide

> **Start here.** Follow this guide in order — each phase builds on the previous one.
> The sequence is: **Inherit governance → Define context → Specify features → Build**

---

## The Setup Sequence

```
Step 1 — Prerequisites      Install tools, clone repo, configure agent
Step 2 — Governance         Load or create org-level rules (once per org/BU)
Step 3 — Context            Generate your product context files (once per project)
Step 4 — First Feature      Run your first spec → plan → tasks → implement cycle
```

If you are a solo developer with no org governance, skip Step 2 and go straight to Step 3.

---

## Step 1 — Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Git | 2.x+ | Version control for specs and code |
| VS Code | Latest | Recommended editor — Copilot slash commands work here |
| GitHub Copilot | Latest | Primary AI agent (or swap for Claude/Cursor/Gemini) |
| Your project runtime | LTS | Node.js / Python / .NET / etc. |

> **Optional (for GitHub Spec Kit CLI users)**
> - Python 3.11+
> - `uv` package manager: `pip install uv`
> - Spec Kit CLI: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`

---

## Installation

### 1a — Clone and initialize

**Option A — Manual (recommended for teams):**
```bash
cp -r SpecDDStarterKit/sdd-kit/ /path/to/your/project
cd /path/to/your/project
git init
git add .
git commit -m "chore: initialize SpecDD starter kit"
```

**Option B — GitHub Spec Kit CLI:**
```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init my-project --ai copilot --script ps   # Windows
specify init my-project --ai copilot               # Mac/Linux
# In an existing project:
specify init --here --ai copilot
```

### 1b — Configure your AI agent

**GitHub Copilot (VS Code)**
`.github/copilot-instructions.md` loads automatically as workspace context. Slash commands in `.github/prompts/*.prompt.md` are available in Copilot Chat immediately — no additional setup required.

**Claude Code**
```bash
cp templates/agents-md-template.md CLAUDE.md
# Edit CLAUDE.md to reflect your project name and constitution path
```

**Cursor**
```bash
mkdir -p .cursor/rules
cp .github/prompts/*.prompt.md .cursor/rules/
```

**Gemini CLI**
```bash
mkdir -p .gemini
cp .github/prompts/*.prompt.md .gemini/
```

---

## Step 2 — Governance *(skip if solo / no org governance)*

`governance/` holds org-level rules inherited by your product. These files are **read-only** for the product team — you load them as context, you do not edit them.

| Level | File | Who creates it |
|---|---|---|
| L1 — Enterprise | `governance/enterprise-constitution.md` | CTO / Enterprise Architect |
| L2 — BU | `governance/blueprints/{bu}/blueprint.md` | BU Architect |
| L3 — Domain | `governance/domain-specs/{domain}/domain-spec.md` | Domain Lead |

**If your org already has governance files:** copy them into the corresponding paths above.

**If you need to generate them from scratch**, use the prompts in order:
```
/sdd-blueprint      → generates governance/blueprints/{bu}/blueprint.md
/sdd-domain-spec    → generates governance/domain-specs/{domain}/domain-spec.md
```

> Solo projects and teams without BU governance: leave `governance/` as-is and proceed to Step 3.

---

## Step 3 — Context *(once per project)*

`context/` is your product team's persistent AI context — generated once and kept current throughout the project lifecycle. Your AI agent loads these files before every action.

Run these prompts **in order**:

### 3a — Constitution (required first)

The constitution defines governing principles that apply to every change. It must not contradict any governance files from Step 2.

```
/sdd-constitution
```
Output: `context/constitution.md`

Review carefully before committing. Every subsequent prompt references this file.

### 3b — Architecture

```
Based on context/constitution.md, generate context/architecture.md.
Capture: system boundaries, key components, integration points, data flow,
and architectural decisions made so far (or intended for a greenfield project).
```
Output: `context/architecture.md`

### 3c — Tech Stack

```
Generate context/tech-stack.md listing: approved frameworks, languages,
testing libraries, approved cloud services, banned libraries, and version constraints.
```
Output: `context/tech-stack.md`

### 3d — Project Overview

```
Generate context/project.md: a 1-page summary of what this project does,
who the users are, what success looks like, and key business constraints.
```
Output: `context/project.md`

### 3e — Context Map *(optional, recommended for multi-domain projects)*

If your product interacts with multiple bounded contexts or external systems:
```
/sdd-context-map
```
Output: `docs/context-map.md`

### 3f — Generate llms.txt *(optional)*

Makes the project AI-agent-discoverable (see [llmstxt.org](https://llmstxt.org)):
```
/sdd-create-llms
```
Output: `llms.txt` in repo root.

---

## Step 4 — First Feature

With governance inherited and context established, you are ready for feature work.

### 4a — Create a feature branch

```bash
git checkout -b feature/001-<feature-name>
cp -r specs/_template specs/001-<feature-name>
```

### 4b — Run the feature workflow in sequence

| Command | Output | Gate before next |
|---|---|---|
| `/sdd-specify` | `specs/001-.../spec.md` | Review: no open questions, ACs are testable |
| `/sdd-clarify` *(optional)* | Updated spec | All ambiguities resolved |
| `/sdd-checklist` *(optional)* | Checklist report | All gates green |
| `/sdd-plan` | `specs/001-.../plan.md` | Review: architecture fits, risks identified |
| `/sdd-analyze` *(optional)* | Consistency report | No contradictions |
| `/sdd-tasks` | `specs/001-.../tasks.md` | Review: tasks are small and ordered |
| `/sdd-implement` | Working code | Spec acceptance criteria met |

### 4c — Commit in phase order

```bash
git add specs/001-.../spec.md
git commit -m "spec(001): define <feature> requirements"

git add specs/001-.../plan.md
git commit -m "plan(001): technical plan for <feature>"

git add specs/001-.../tasks.md
git commit -m "tasks(001): implementation task breakdown"
```

**Gate rule:** Do not commit implementation code before `tasks.md` is committed.

---

## Optional Enhancements

| When | Command | Purpose |
|---|---|---|
| Before implementing a risky change | `/sdd-adr` | Record the architectural decision |
| Before writing a spec for an unknown | `/sdd-spike` | Time-box a technical investigation |
| After `/sdd-tasks` (ADO project) | `/sdd-issues-from-spec`, `/sdd-issues-from-plan` | Push work items to Azure DevOps |
| After `/sdd-tasks` (GitHub project) | `/sdd-issues-from-plan` | Create GitHub Issues from tasks |
| Mid-sprint quality check | `/sdd-issues-unmet` | Find spec ACs not yet implemented |
| After adding a new spec or ADR | `/sdd-update-llms` | Keep `llms.txt` current |

---

## MCP Server Setup

MCP servers give the agent live access to real systems. ADO, Figma, and Motif are registered at the VS Code level and need no configuration. For SonarQube and GitHub MCP, add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "sonarqube": {
      "command": "npx",
      "args": ["-y", "@sonarsource/mcp-server-sonarqube"],
      "env": {
        "SONAR_TOKEN": "${env:SONAR_TOKEN}",
        "SONAR_HOST_URL": "https://sonarcloud.io"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

See `.github/instructions/mcp-tools.instructions.md` for the full phase-by-phase MCP usage guide.

---

## Folder Naming Conventions

| Pattern | Example |
|---|---|
| Feature spec folder | `specs/001-user-authentication/` |
| Sequential numbering | `001-`, `002-`, `003-` |
| Kebab-case names | `photo-album-management` |
| Branch naming | `feature/001-user-authentication` |

---

## Team Adoption Timeline

For teams adopting SpecDD from scratch, an 8-week phased rollout prevents overload:

| Phase | Weeks | Focus | Success Signal |
|---|---|---|---|
| **Foundation** | 1–2 | Complete Steps 1–3; document 2–3 existing features as specs; establish baseline velocity and defect metrics | Context files committed; 3 retrospective specs written |
| **Prompt Templates** | 3–4 | Run first feature through full spec → plan → tasks → implement cycle; controlled comparison vs. traditional | 50% reduction in task breakdown time |
| **Quality Gates** | 5–6 | Add `/sdd-checklist` and `/sdd-analyze` to every feature; configure MCP servers; implement code quality monitoring | Review process catching 90%+ of AI issues before merge |
| **Full Integration** | 7–8 | CI/CD integration; full team on SpecDD; measure productivity vs. baseline | Pilot project on time; quality gates functioning |

> Each phase validates measurably before the next begins. Skipping phases compresses learning into rework.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Copilot not picking up prompts | Ensure files end in `.prompt.md` and are in `.github/prompts/` |
| Agent ignores constitution | Re-attach `#file:context/constitution.md` explicitly in your prompt |
| Spec is too vague | Run `/sdd-clarify` before proceeding to plan |
| AI generates duplicate code | Add "DO NOT re-implement existing classes" rule to `instructions/code-generation/agent-boundaries.md` |
| Context window exceeded | Split spec into sub-specs (see `instructions/spec-generation/greenfield-guide.md`) |
| Plan contradicts architecture | Run `/sdd-analyze` — it cross-checks spec, plan, and tasks for contradictions |
