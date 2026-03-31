# SpecDD Methodology

> A concise reference guide to Spec-Driven Development concepts, phases, and principles.
> For the full starter kit workflow, see README.md and SETUP.md.

---

## What is Spec-Driven Development?

Spec-Driven Development (SpecDD) is a structured approach to AI-assisted software development where:

> **Specifications are the source of truth. Code is the output.**

Instead of prompting an AI to write code from a vague description, SpecDD maintains a set of **living specification artifacts** that define intent, architecture, and tasks — and uses these to drive the AI through implementation in a controlled, verifiable way.

Key insight: AI coding agents excel at **pattern completion**, but struggle with **mind reading**. A vague prompt like "add photo sharing" forces the model to guess at thousands of unstated requirements. A specification makes intent explicit.

---

## Why AI-Assisted Development Needs Spec-Driven Development

AI coding agents are powerful but carry well-documented structural constraints. Understanding these explains why structured specs — not cleverer prompts — are the correct solution.

### 1. Task Scope & Duration Constraints

LLMs deliver high-quality output on small, clearly scoped tasks. Quality degrades non-linearly as scope expands:

| Change Scope | Expected Quality |
|---|---|
| 1–3 files | High quality, reliable output |
| 4–9 files | Inconsistencies begin to emerge |
| 10+ files | Coherence breaks down; extensive rework typical |

> **Scope matters more than duration.** A 20-minute task touching 15 files will produce worse output than a 90-minute task touching 3 files. This is a fundamental LLM coherence constraint — not a prompting issue.

SpecDD solves this via enforced decomposition: Feature → User Stories → Tasks, where each task is scoped to 1–2 files with bounded responsibility.

### 2. Feature Context Gaps

Even a codebase-aware assistant lacks context about the specific feature being built: requirements, edge cases, acceptance criteria, integration points, data flows. This dual gap — functional scope + system integration — produces features that either don't meet requirements or don't fit existing architecture.

SpecDD solves this via a **two-layer context system**:
- **Specification layer** (`spec.md`, refined by `/sdd-clarify`): the *what* — requirements, user stories, acceptance criteria, edge cases
- **System design layer** (`plan.md`, `data-model.md`, `api.md`): the *how* — affected services, data flows, integration points

Unlike prompts that disappear after execution, these artifacts create a persistent blueprint that prevents drift and enforces consistency across sessions.

### 3. Project Knowledge Gaps

AI assistants can scan a repository, but reading code is not the same as understanding its context. Every codebase has project-specific conventions, approved libraries, reusable components, and enterprise rules that LLMs cannot reliably infer — and they may reproduce outdated patterns from legacy files simply because those files exist.

SpecDD solves this via the **constitution**: a persistent, project-specific intent layer encoding stack standards, naming rules, architectural rationale (including the *reasons* behind past decisions), library governance, forbidden patterns, and compliance requirements. The AI reads this before implementing anything — operating from YOUR standards, not generic best practices from training data.

### 4. Uncontrolled Autonomy

AI agents in autonomous mode produce bulk code dumps with no traceability. Changes span 10–15 files, introduce unplanned integrations, and make architecture-level choices without validation. No intermediate state is visible; identifying what went wrong requires tedious review of the entire output.

SpecDD solves this via **mandatory review gates** at each phase — spec, plan, tasks, implementation checkpoints — structuring automation around human approval at the right depth without slowing execution elsewhere.

> **Counter-intuitive research finding:** In rigorous controlled studies, AI tools *increased* completion time by 19% for experienced developers working without structured workflows. The output volume was higher; the useful, correct output was lower. Structure is not overhead — it is what makes AI assistance net-positive.

---

## The SpecDD Architecture: Five Layers

SpecDD is not just a methodology — it is an **architectural pattern** that inverts the traditional source of truth. In classical software, code is authority; in SpecDD, the specification is.

| Layer | Role | Example Artifacts |
|---|---|---|
| **Specification** | Authoritative declaration of what the system must do | `spec.md`, `api.md`, `data-model.md`, constraints |
| **Generation** | Transforms declarative intent into executable form | AI agent generating code, tests, stubs from spec |
| **Artifact** | Concrete outputs of generation — disposable, regenerable | Source code, generated models, migration files |
| **Validation** | Continuous enforcement of alignment between spec and reality | Contract tests, schema validators, spec diff tools |
| **Runtime** | The operating system, constrained entirely by upstream layers | Deployed services, APIs |

> **Architectural inversion**: In SpecDD, code is not the source of truth — it is merely the current realization of truth. If the spec changes, code is regenerated. If code deviates from the spec, that is **drift** — a defect to be corrected, not a feature.

### SpecOps: Specification Operations

Just as DevOps elevated infrastructure to a first-class engineering discipline, **SpecOps** treats specification authoring as a first-class engineering surface:

- Specs are version-controlled and peer-reviewed like production code
- Spec quality directly determines implementation quality
- Bugs are traced back to specification gaps, not just code defects
- Two failure modes exist: **Intent-to-Spec gaps** (spec captures wrong/incomplete intent) and **Spec-to-Implementation gaps** (code diverges from spec)

---

## SpecDD Levels

| Level | Human Role | Spec Lifecycle | When to Use |
|---|---|---|---|
| **Spec-First** | Write spec before coding | Spec created for the change, may be archived after | Quick features, experiments |
| **Spec-Anchored** | Maintain spec as feature evolves | Spec is kept and updated alongside code | Team features, long-lived components |
| **Spec-as-Source** | Human edits spec; AI regenerates code | Spec is the primary artifact; code is derived | Mature SpecDD, enterprise contexts |

---

## The SpecDD Workflow

### Phase 0: Context
Establish project-wide context that's always available to the AI agent.

| Artifact | Purpose |
|---|---|
| `constitution.md` | Immutable governing principles |
| `architecture.md` | System architecture and patterns |
| `tech-stack.md` | Approved technologies and conventions |
| `project.md` | Project context, users, success criteria |

**Gate:** Context must be established before first spec is written.

---

### Phase 1: Specify
Define **what** to build and **why** — purely functional, no technical detail.

| Activity | Output |
|---|---|
| Describe feature to AI | `spec.md` with user stories, ACs, user journeys |
| Human reviews spec | Gaps and ambiguities identified |
| Optionally: run `/sdd-clarify` | Open questions resolved |

**Gate:** No technical decisions. No implementation details. Human approves spec.

---

### Phase 2: Plan
Translate the spec into **how** to build it — architecture, data models, APIs, components.

| Activity | Output |
|---|---|
| Provide tech stack + constraints | `plan.md` with architecture decisions |
| | `data-model.md` with schema changes |
| | `api.md` with endpoint contracts |
| Human reviews plan | Technical correctness verified |

**Gate:** Plan must conform to constitution and tech-stack. Human approves plan.

---

### Phase 3: Tasks
Break the plan into **atomic, independently testable implementation tasks**.

| Activity | Output |
|---|---|
| AI generates task breakdown | `tasks.md` with ordered, traceable tasks |
| Optionally: run `/sdd-analyze` | Traceability verified, gaps found |
| Human reviews task list | Ordering, completeness confirmed |

**Gate:** Every acceptance criterion must be traceable to at least one task. Human approves.

---

### Phase 4: Implement
Execute tasks one by one with the AI agent, verifying each before proceeding.

| Activity | Output |
|---|---|
| AI implements each task | Working code, tests, commits |
| Human verifies per task | Spec compliance checked |
| Run review checklist | Quality gate passed |

**Gate:** All tasks complete, all ACs satisfied, quality checklist done.

---

## Key Concepts

### Context vs. Spec
| Context | Spec |
|---|---|
| Always in context | Only relevant during work on that feature |
| Project-wide context | Feature-specific context |
| Evolves slowly | Created per feature/change |
| Constitution, architecture, tech stack | Spec, plan, tasks, data model, API |

### Three-Tier Boundary Model for AI Agents
Based on research from analysis of 2,500+ agent configuration files:

| Tier | Meaning |
|---|---|
| ✅ Always Do | Safe actions; AI proceeds without asking |
| ⚠️ Ask First | Actions requiring human approval |
| 🚫 Never Do | Hard stops; AI must refuse or escalate |

### Enterprise Collaboration Model

At team and enterprise scale, different roles own different phases of the SpecDD workflow:

| Phase | Owner | Artifact | AI Role |
|---|---|---|---|
| **Discover** (What) | Product / Business Analyst | `spec.md` requirements, user stories, ACs | Facilitates dialogue, fills in details |
| **Design** (How) | Architect / Tech Lead | `plan.md`, `data-model.md`, `contracts/` | Generates technical approach from constraints |
| **Tasks** | Developer / Engineer | `tasks.md` | Breaks design into atomic, verifiable work items |
| **Implement** | Developer + AI Agent | Working code | Executes tasks one by one |

This separation keeps business context visible on product boards while technical details live in the repository. For multi-repo features, the architect decomposes the feature into per-repo sub-tasks, each scoped to a single repository boundary.

### Drift Detection

Once specifications become authoritative, **drift detection** is a mandatory architectural capability:

- A spec is not merely documentation — it is an **active control surface**
- Drift = any divergence between declared intent and observed behavior (structural, behavioral, semantic, or security-related)
- Mechanisms: contract tests, schema validators, spec diff tools, CI-embedded checks
- Without drift detection, SpecDD collapses back into documentation-driven development

### Spec as Living Artifact
A spec is not written once and discarded. It:
- Evolves as requirements change
- Stays consistent with implementation via the plan
- Serves as the reference for future changes and maintenance
- Reduces onboarding time for new team members and AI agents

---

## SpecDD vs. Other Approaches

| Dimension | Ad-hoc Prompting | TDD | SpecDD |
|---|---|---|---|
| Starting point | Vague description | Failing test | Functional specification |
| Primary artifact | Code | Test suite | Specification |
| AI role | Code generator | Test executor | Structured collaborator |
| Traceability | None | Test → code | Requirement → task → code |
| Context window management | Manual | N/A | Spec-as-context pattern |
| Brownfield capability | Low | Medium | High (with research phase) |

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Resolution |
|---|---|---|
| Vague prompting | AI guesses requirements; diverges from intent | Use spec as context, not free-form prompts |
| Skipping the plan phase | Implementation diverges from architecture | Always generate and approve plan before tasks |
| One giant prompt | Context overload; AI loses focus | Break into tasks; one task per session |
| Reviewing code instead of specs | Spec becomes stale; no single source of truth | Review each spec artifact before proceeding |
| Spec sprawl | Too many files; review burden increases | Keep spec folder focused — one folder per feature |
| AI as sole author | Hallucinations go uncaught | Human verifies every phase gate |
| **SpecFall** | Installing SpecDD ceremonies without changing how teams actually collaborate — produces "markdown monsters" of stale docs | Treat specs as the **conversation medium** between stakeholders, not just technical output; ensure product, arch, eng, and QA all contribute to their phase |
| Spec too code-like | Spec becomes near-identical to code; review burden kills adoption | Keep specs "human reviewable" — define intent and behavior, not implementation mechanics |
| Solo speccing | One developer goes through the entire SpecDD process alone, missing cross-functional insight | Use SpecDD as a collaborative dialogue tool; cross-functional specs are superior to individual prompt optimization |

---

## The Cumulative Quality Problem

Reviewing each SpecDD phase before proceeding is not optional ceremony — it is a mathematical structural requirement.

Each phase, independently, delivers roughly **80% accuracy** under real-world conditions. Without intermediate validation, quality compounds:

$$0.8 \times 0.8 \times 0.8 \times 0.8 \times 0.8 \approx 0.33$$

> Across five phases without review gates, roughly one-third of the intended quality survives to implementation.

This is why SpecDD review gates exist. Every missed inaccuracy — a slightly wrong user story, an incomplete data model, an ambiguous task scope — multiplies through downstream phases. A phase-gate review captures the error while it's cheap to fix.

**Operational implication:** Build your SpecDD process assuming ~80% per-phase accuracy and design review checkpoints accordingly. Shortcutting one gate rarely saves meaningful time; it typically shifts effort into more expensive rework downstream.

---

## Review Fatigue: An Operational Reality

SpecDD shifts cognitive effort from *writing code* to *validating AI-generated artifacts*. This is a favorable shift — but it comes with a real and often underestimated cost: **review fatigue**.

AI-generated markdown appears grammatically correct and architecturally plausible. Unlike code, where structural errors are often visually obvious, spec and plan artifacts require **sustained conceptual attention** to validate correctly. Errors hide in plausible phrasing.

**Practical mitigations:**
- Treat each spec file like a code review — line by line for critical sections
- Rotate who conducts reviews; sustained focus depletes quickly
- Take breaks between reviewing different artifact types (spec vs. plan vs. tasks)
- Use structured review checklists to keep focus anchored to specific questions

> "The mental effort doesn't disappear — it shifts from typing to validation. Be prepared: it will be tedious. This is the tax you pay for AI assistance." — EPAM AI/Run team, production deployment retrospective

---

## Developer Role Evolution

SpecDD changes not just the workflow, but the nature of developer work itself:

| Traditional Development | SpecDD-Augmented Development |
|---|---|
| Write code | Design systems; validate AI output |
| Review syntax and style | Review architecture and spec alignment |
| Implementation-first | Specification-first |
| Discover complexity mid-build | Resolve complexity upstream in specs and plans |
| Value measured by code written | Value measured by quality of decisions made |

As the **safe delegation window** grows — from AI handling isolated 10–20 minute tasks to handling multi-hour, multi-component feature delivery with consistent quality — developer leverage multiplies. More time on upstream design produces compounding returns: a better plan produces better tasks, which produces better code, with less rework at every stage.

> "Development shifts left. Teams spend more time upstream on system design, scoping, architecture, and planning, and less on typing code. The important work happens before implementation, not during it." — EPAM AI/Run team

