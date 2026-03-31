# Spec-Driven Development Starter Kit — Comprehensive Guide

> **Language-agnostic. Greenfield and brownfield. AI-assisted development, done right.**

Spec-Driven Development (SpecDD) is an AI-assisted methodology where a structured specification becomes the primary artifact and source of truth for software projects. Rather than writing code first, teams collaboratively author human-readable specs that describe *what* to build and *why*, then use AI tools to generate the *how* (the implementation). The result is a paradigm shift: intent expressed in specifications drives the coding process, enabling more clarity, alignment, and automation.

This guide provides a comprehensive blueprint for adopting SpecDD in both greenfield projects (new builds) and brownfield projects (existing codebases). It covers the recommended project structure, spec authoring practices, AI prompt guidelines, role ownership, and integration with DevOps pipelines.

---

## SpecDD Workflow Overview: From Spec to Code

SpecDD breaks the development process into clear phases that interlock to produce high-quality code from high-level intent. Before coding starts, teams invest effort in specification and planning, which the AI then uses to generate robust code.

```
Phase 0 — Context      Define the project constitution, architecture, and tech stack
Phase 1 — Specify      Author the spec: user stories, outcomes, acceptance criteria
Phase 2 — Plan         Generate a technical plan: modules, APIs, data models
Phase 3 — Tasks        Decompose the plan into ordered, testable implementation tasks
Phase 4 — Implement    Execute tasks one-by-one with AI; review each increment
```

> **Tip: SpecDD is iterative, not linear.** Teams frequently loop back to earlier phases based on what's learned later. If the AI uncovers ambiguities during the Plan or Implement phase, revisit and clarify the Spec (using `/sdd-clarify`). Embrace these feedback loops — they prevent costly rework by catching misunderstandings early. Validate intent and design *before* writing large amounts of code.

---

## Project Structure

The SpecDD Starter Kit provides a clear, scalable structure for organizing both specifications and code. Specs are tracked alongside code, organized by lifecycle phase, and prepared for automation.

```
sdd-kit/                             ← Copy this folder into your project root
├── README.md                        ← Kit overview + SpecDD levels + slash command reference
├── SETUP.md                         ← Step-by-step setup guide (start here)
│
├── context/                         ← Phase 0: Project-level source of truth
│   ├── project.md                   ← Project identity, problem, personas, outcomes
│   ├── constitution.md              ← Coding standards, architectural rules, constraints
│   ├── architecture.md              ← Architectural decisions and patterns
│   └── tech-stack.md                ← Approved languages, frameworks, libraries
│
├── .github/
│   ├── copilot-instructions.md      ← Workspace-level AI agent instructions
│   ├── instructions/                ← Auto-loaded instruction files
│   │   ├── governance.instructions.md
│   │   ├── sdd-workflow.instructions.md
│   │   ├── agent-behavior.instructions.md
│   │   ├── swagger-api-docs.instructions.md  ← OpenAPI/Swagger rules
│   │   └── motif-design-system.instructions.md  ← EY Motif design rules
│   ├── agents/                      ← SpecDD agent definition files
│   │   ├── sdd-specify.agent.md
│   │   ├── sdd-implement.agent.md
│   │   └── sdd-orchestrator.agent.md
│   └── prompts/                     ← Slash commands
│       ├── sdd-specify.prompt.md
│       ├── sdd-plan.prompt.md
│       ├── sdd-tasks.prompt.md
│       ├── sdd-implement.prompt.md
│       └── ...
│
├── governance/                      ← Cross-team governance (L1–L3)
│   ├── enterprise-constitution.md   ← L1: Enterprise-wide rules
│   ├── blueprints/                  ← L2: BU reference architectures
│   └── domain-specs/                ← L3: Domain namespace and shared models
│
├── specs/                           ← Feature-level specs (one folder per feature)
│   ├── _template/                   ← Copy this for each new feature
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── api.md
│   │   └── data-model.md
│   └── 001-[feature-name]/
│       └── ...
│
├── docs/                            ← Kit documentation (this folder)
│   ├── starter-guide.md             ← This file
│   ├── sdd-methodology.md
│   ├── workflow.md
│   ├── greenfield-vs-brownfield.md
│   ├── faq.md
│   └── references.md
│
├── templates/                       ← Reusable document templates
├── examples/                        ← Example specs and plans
└── website/                         ← Wizard UI (generates a configured kit as a ZIP)
```

This structure ensures that specifications are tracked alongside code and organized by lifecycle stage. In a mature SpecDD project, each new feature has artifacts across all phases. Because everything is under version control, the history of changes to specs and code is visible and traceable.

> **Treating specs as first-class artifacts in your pipeline — not static docs on a wiki — is key to successful SpecDD integration.**

---

## Governance Levels

Many SpecDD frameworks align spec activities to governance levels, particularly in enterprise settings. This kit uses four levels:

| Level | Location | Scope | Generated by |
|---|---|---|---|
| **L1 — Enterprise** | `governance/enterprise-constitution.md` | Org-wide standards, compliance | Provided by your org |
| **L2 — Blueprint** | `governance/blueprints/[bu]/blueprint.md` | BU reference architectures | `/sdd-blueprint` |
| **L3 — Domain** | `governance/domain-specs/[d]/domain-spec.md` | Domain namespace, shared models | `/sdd-domain-spec` |
| **L4 — Product** | `context/constitution.md` | Product-level standards and rules | `/sdd-constitution` |

Governance ensures that a feature cannot proceed to implementation until earlier-level constraints are understood and reflected in the product constitution. This imposes quality control at each level, which is valuable for organizations adopting SpecDD at scale. Lower-level governance cannot override a higher level.

---

## Blueprint for Effective Spec Generation

Authoring a good spec is an art. It must be comprehensive yet clear, giving the AI just enough guidance to act correctly without overwhelming it.

### Start with Vision and Scope

Begin the spec with a concise overview of the feature or project. Define the problem being solved, the target users, and the desired outcomes or success metrics. This high-level context sets the stage for the AI — akin to an executive summary of a Product Requirements Document (PRD).

### Adopt a Structured Format

Organize the spec into clear sections. This mirrors how product requirement documents are written and helps the AI understand different aspects of the system:

- **User Stories & Use Cases** — Persona-driven narratives: *"As a [persona], I want to [action], so that [outcome]"*
- **Functional Requirements** — Specific capabilities and behaviors the system must have, including edge cases and error handling
- **Non-Functional Requirements** — Performance targets, security/compliance needs, UI/UX guidelines (e.g. WCAG 2.1 AA accessibility), OpenAPI documentation requirements
- **Boundaries & Out-of-Scope** — Explicit statement of what the system will *not* do; prevents the AI from solving the wrong problem

### Be Clear, Unambiguous, and Testable

Write requirements in a behavioral, verifiable way. Each statement should be something you can test or observe in the final product. Avoid vague language like "the system will be user-friendly" — instead, specify "the system will allow users to complete the checkout process in no more than 3 clicks."

If the specification is too lengthy or unclear, break it into smaller features or multiple specs. An overly large spec can overwhelm both readers and the AI's context window, reducing effectiveness.

### Embed Examples and Edge Cases

Provide illustrative examples, sample inputs/outputs, or mini use-case tables. These act as built-in test cases and reduce ambiguity. They also help the AI verify its outputs during generation — the AI can be prompted to self-check against the spec's examples.

### Leverage Self-Checks and Constraints

You can incorporate AI directives within the spec (in clearly marked sections) that the agent must adhere to. For example:

- *"Performance: All API responses must return in <200ms at P95"*
- *"Security: Never store passwords in plaintext; hash with bcrypt (cost 12+)"*
- *"API: All endpoints must have OpenAPI annotations — see `.github/instructions/swagger-api-docs.instructions.md`"*

Some teams add an "always/never" list in `context/constitution.md`, such as *"Always sanitize user input for XSS. Never log sensitive PII."* These act as guardrails for the AI during code generation.

### Iterate and Refine

Treat spec-writing as an iterative process. Use `/sdd-clarify` after the first spec draft — the AI asks questions about unclear parts of the spec, helping you spot ambiguities or gaps. Continually update the spec as new decisions are made or new insights arise, keeping it synchronized with reality. This avoids the "stale documentation" problem: specs that pile up but no one updates.

### One Feature per Spec

Keep each spec focused on a single feature or change set, especially in large projects. This makes the spec easier to review and allows the AI to generate code in manageable batches. For complex features, use hierarchical specs — a high-level spec with links to more detailed sub-specs for different components.

### Brownfield: Create Specs for Existing Functionality

In legacy systems, generate specs from existing code as a starting point:

- **Manual reverse-engineering** — Read code and user documentation to write a descriptive spec
- **AI-assisted documentation** — Prompt your AI agent to summarize existing code into spec-like descriptions
- **Incremental coverage** — Focus on one area that needs change; write a spec for that portion, then gradually expand

The key is to *progressively* introduce specs without attempting to document the entire legacy system at once. Prioritize sections you plan to modify or that frequently cause issues. See [docs/greenfield-vs-brownfield.md](greenfield-vs-brownfield.md) for a detailed comparison.

---

## Blueprint for AI-Assisted Code Generation

With well-crafted specs in hand, the next focus is turning specifications into working code through the Plan, Tasks, and Implementation phases.

### Phase 1 — Specify: `/sdd-specify`

Run `/sdd-specify` in Copilot Chat to author or refine `specs/[feature]/spec.md`. The prompt will ask for:

- **What** you're building (user stories, journeys, outcomes)
- **Why** it matters (business goals, personas, problem statement)
- **Acceptance criteria** (verifiable, testable conditions for "done")

Use `/sdd-clarify` after the spec draft to resolve open questions. The AI will surface ambiguities; address each one before proceeding.

### Phase 2 — Plan: `/sdd-plan`

Once a spec is reviewed, run `/sdd-plan` to generate a detailed technical plan in `specs/[feature]/plan.md`. The prompt accepts:

- The spec as context
- Architectural constraints from `context/architecture.md` and `context/tech-stack.md`
- Integration points: *"This feature touches the existing notification service — reuse it"*
- Output structure: architecture overview, data model changes, API/interface design, task list shape, testing strategy

After the AI generates the plan, review it critically. Ensure it aligns with the spec and makes sound technical choices. Pay attention to whether it invents new components that duplicate what's already present — if so, add a rule to `context/constitution.md` (e.g. *"Code duplication is prohibited — always search for existing utilities before writing new ones"*) and regenerate.

The plan phase is your chance to catch architectural problems on paper rather than in code.

### Phase 3 — Tasks: `/sdd-tasks`

With a solid plan, run `/sdd-tasks` to derive a set of actionable tasks in `specs/[feature]/tasks.md`. Each task should be:

- **Granular and sequential** — each results in a testable outcome
- **Scoped to 1–2 files** — this is the core SpecDD constraint that keeps AI output quality high
- **Traced to acceptance criteria** — so every AC is covered by at least one task

Example task list for an API feature:

```
- [ ] Update database schema: add Feedback table (columns: id, user_id, text, created_at)
- [ ] Implement POST /api/v1/feedback — validate input, persist, return 201
- [ ] Add OpenAPI annotation to POST /feedback (operationId: createFeedback, all responses documented)
- [ ] Add OpenTelemetry trace span to feedback submission flow
- [ ] Write unit tests for FeedbackService: validation, save, error cases (target 80% coverage)
- [ ] Write integration test for POST /api/v1/feedback endpoint
```

Use `/sdd-analyze` to verify traceability: all acceptance criteria from the spec must be covered by at least one task. If the task still seems too large, break it down further.

### Phase 4 — Implement: `/sdd-implement`

Run `/sdd-implement` to execute tasks one by one. For each task, the AI receives:

- The task description and its acceptance criteria
- Relevant context from the spec and plan
- Rules from `context/constitution.md` (coding standards, forbidden patterns, reuse requirements)
- Instruction files from `.github/instructions/` (e.g. OpenAPI rules, design system rules)

After each task, review the AI-generated code:

| Check | How |
|---|---|
| **Fulfils spec?** | Compare against acceptance criteria; run the examples from the spec |
| **Follows standards?** | Run linters, formatters, static analysis |
| **No regressions?** | Run the full test suite; investigate any failures |
| **No duplication?** | Verify the AI didn't re-implement existing utilities |
| **API documented?** | All new endpoints have OpenAPI annotations (see `.github/instructions/swagger-api-docs.instructions.md`) |

This spec-to-code cycle continues until all tasks are completed and the feature fully satisfies the spec.

After implementation, update the spec with any additional detail discovered: record architecture decisions (use `/sdd-adr`), note performance findings, and document integration constraints. This keeps the spec an up-to-date truth source for future reference.

### Human in the Loop

SpecDD does not mean "set and forget" — human oversight is essential at each step. Developers and architects play a verification role, ensuring AI outputs are correct and making adjustments to specs or prompts as needed. This review-and-refine process catches misunderstandings early and steers the AI before code hits production.

Plan for code reviews and testing just as you would in a normal development process. SpecDD shifts those activities earlier, when fixes are cheapest.

---

## DevOps & Tooling Integration

Adopting SpecDD is not just a writing exercise — it is a change to your development workflow. The following covers integrating SpecDD with DevOps, source control, and CI/CD.

### Version Control & Collaboration

All spec documents must be kept in Git alongside the code. A feature branch for "Add Feedback Feature" should contain commits for the spec *before or together with* commits for code changes.

Establish pull request reviews for specs just as you do for code. This ensures product managers, BAs, and architects can review and approve the plan before any code is written. Some teams designate spec reviewers — with domain or UX expertise — separate from code reviewers.

> **A healthy SpecDD process treats spec changes as a necessary precursor to code changes.** This mindset shift results in far fewer mid-implementation course corrections.

### CI/CD Pipeline Stages

Extend your CI/CD pipeline to incorporate spec-driven stages:

**Spec Validation Stage**
Lint and validate specs on each commit or pull request. For API specs, run an OpenAPI linter (e.g. [Spectral](https://github.com/stoplightio/spectral)) to catch errors or deviations from style guides. For custom markdown spec formats, write scripts to validate required sections or check formatting. Automated spec validation ensures consistency and catches omissions early.

**Testing & Alignment Stage**
After code is generated, run the test suites (unit, integration, e2e) to verify that the code satisfies the spec. If you have traceability (AI labels generated code with references to spec sections), create a spec-to-test traceability report in CI. Failing tests signal misalignment or bugs, prompting a spec update or code fix before merge.

**Quality Gates**
Integrate additional quality gates tied to spec content:

- **Security scan** — if the spec includes security requirements (e.g. "all inputs must be validated"), include SAST or OWASP scanning
- **Performance test** — if the spec defines a performance SLA, include a load test that validates it
- **Coverage gate** — if `context/constitution.md` specifies a minimum test coverage threshold, enforce it in CI
- **API completeness check** — validate that all new endpoints have OpenAPI annotations and that the spec file is valid

**Deployment & Release**
Use specifications to drive deployment automation. Infrastructure-as-code definitions can be derived from deployment specs. Some teams generate release notes from spec content at this stage, ensuring documentation is current by the time of release.

### OpenTelemetry & Observability Integration

Plan for observability in your specs and code generation tasks. In the Plan phase, include requirements such as:

> *"Use OpenTelemetry for distributed tracing and metrics. Each HTTP handler must create a trace span. Span names follow the convention `[service].[operation]`."*

Make this a standard task in every feature's task list:

> *"Add OpenTelemetry trace span to [operation] — include user_id and request_id as span attributes."*

Document your monitoring and alerting requirements in `context/architecture.md` or a dedicated `specs/ops/observability.md`. Configure your CI/CD pipeline to deploy or update observability components automatically — for example, registering new endpoints with your APM tool or generating dashboards from the spec's SLA definitions.

### Project Constitution: Rules & Standards

`context/constitution.md` is the most important file in the kit. It encodes your engineering standards, compliance rules, and best practices that all specs and code must adhere to. Examples:

- **Coding standards** — linting rules, naming conventions, import ordering
- **Security and compliance** — OWASP Top 10 requirements, GDPR/data privacy rules, secrets management
- **Observability** — "All services must emit telemetry using OpenTelemetry SDK. Every major user action must be logged with a trace ID."
- **API documentation** — "Every public endpoint MUST have an OpenAPI annotation. Swagger UI MUST NOT be exposed in production." (see `.github/instructions/swagger-api-docs.instructions.md`)
- **Reuse and architecture** — "Code duplication is prohibited — search for existing utilities before writing new ones. Follow the architecture defined in `context/architecture.md`."
- **Frontend design** — If using Motif Design System: "Always use Motif design tokens. Never hard-code colour or spacing values." (see `.github/instructions/motif-design-system.instructions.md`)

This "spec of specs" is loaded into the AI's context for all phases via `.github/copilot-instructions.md` and the `governance.instructions.md` instruction file, enforcing these rules globally. When your team discovers new pitfalls — for example, the AI creating redundant modules — update `context/constitution.md` so future generations avoid those issues.

### Continuous Alignment and Drift Management

Integration with source control and CI enables continuous alignment between the spec and the code. Consider implementing a drift check — a script or test suite that compares the spec (expected behaviour) with the application's actual behaviour — to detect if code has diverged from the spec over time.

Options include:
- **API contract testing** — run Dredd or Schemathesis against your OpenAPI spec and deployed service to verify they match
- **Scheduled test runs** — a nightly job that re-runs your full spec-traced test suite and flags any new failures
- **Spec review cadence** — a recurring team session (e.g. every sprint) to review specs against the current codebase

---

## Role-Based Spec Artifact Ownership

A crucial aspect of SpecDD is clarity on *who* is responsible for each part of the specification. The table below outlines key spec artifacts and their primary owners:

| Spec Artifact | Primary Owner | Collaborators |
|---|---|---|
| `context/project.md` — Project identity, personas, problem statement | Product Owner | BA, Architect |
| `context/constitution.md` — Coding standards, architectural rules | Lead Architect / Tech Lead | All engineers |
| `context/architecture.md` — Architectural decisions, patterns | Architect | Engineers |
| `context/tech-stack.md` — Approved languages, frameworks, packages | Tech Lead | Team |
| `governance/enterprise-constitution.md` (L1) | Enterprise Architecture | CTO org |
| `governance/blueprints/` (L2) | BU Architect | Enterprise Arch |
| `governance/domain-specs/` (L3) | Domain Lead | BU Architect |
| `specs/[feature]/spec.md` — User stories, acceptance criteria | Product Owner / BA | UX, QA |
| `specs/[feature]/plan.md` — Technical plan, modules, interfaces | Architect / Tech Lead | Engineers |
| `specs/[feature]/tasks.md` — Implementation task breakdown | Tech Lead | Developers |
| `specs/[feature]/api.md` — API contracts, OpenAPI spec | Backend Lead | Frontend, QA |
| `specs/[feature]/data-model.md` — Schema, ER diagrams | Backend Lead | Architect, DBA |
| `specs/[feature]/test-plan.md` — Test strategy, coverage targets | QA Lead | Developers |
| `specs/ops/observability.md` — Monitoring, alerting, OTel config | DevOps Lead | Architect |
| `specs/ops/deployment.md` — Environment config, release runbook | DevOps Lead | Tech Lead |

Each role should populate and maintain their respective sections, but all team members collaborate to review and ensure consistency across the full spec set. This division of responsibilities reinforces that **SpecDD is a team sport** — it improves collaboration between stakeholders by giving everyone a common medium (the spec) to contribute to.

---

## How to Get Started

### Option A — Use the Wizard (Recommended)

The SpecDD Starter Kit includes a setup wizard at `website/` that generates a complete, pre-configured kit as a downloadable ZIP. Run it locally:

```bash
cd sdd-kit/website
npm install
npm run dev
# Open http://localhost:4321
```

The wizard walks through your project details, tech stack, governance level, and optional integrations (Motif Design System, OpenAPI/Swagger docs, MCP tools, agent preferences). It outputs a ZIP containing all 80+ kit files plus project-specific context files ready to drop into your repository.

### Option B — Manual Setup

1. Copy `sdd-kit/` into your project root
2. Follow [SETUP.md](../SETUP.md) step by step
3. Generate context files:

```
/sdd-blueprint         → governance/blueprints/[bu]/blueprint.md   (L2 if needed)
/sdd-domain-spec       → governance/domain-specs/[d]/domain-spec.md (L3 if needed)
/sdd-constitution      → context/constitution.md                    (L4 — always)
/sdd-context-map       → context/architecture.md                    (L4 — recommended)
```

4. Fill in `context/project.md` and `context/tech-stack.md`
5. Run your first feature cycle: `/sdd-specify` → `/sdd-plan` → `/sdd-tasks` → `/sdd-implement`

---

## Initial Steps in a New SpecDD Project

### 1. Define the Constitution First

Before writing any code, articulate your project's overarching standards in `context/constitution.md`. Run `/sdd-constitution` and fill in:

- Coding standards and style
- Architectural principles (which patterns to use, which to avoid)
- Performance and observability requirements
- Security and compliance constraints
- API documentation requirements
- Reuse rules (e.g. "always check for existing utilities")

Have your senior engineers review this file. Refine it over time as your team discovers new pitfalls or standards.

### 2. Create High-Level Context (Phase 0 docs)

Using the provided templates, have the responsible roles draft the initial project context:

- **Greenfield** — Define `project.md` from scratch with goals, personas, and vision
- **Brownfield** — Start by documenting the current-state architecture in `architecture.md` and approved stack in `tech-stack.md`; the constitution should describe what *exists* before describing what is *aspirational*

### 3. Leverage the AI for Spec Detailing

Use your AI assistant to expand the specs. Feed it the user stories and ask for a formatted requirements list, or have it draft acceptance criteria for each story. Always review and edit the AI's output — ensure it matches real intent. Remove any extra features the AI added that weren't requested.

This is the "clarify and verify" loop: the AI helps you quickly draft content, and you refine it with domain knowledge.

### 4. Review Specs with the Team

Convene a short review session where each role reads the relevant parts of the spec:

- **Architects** — verify feasibility and enterprise architecture alignment
- **QA leads** — confirm testability of each acceptance criterion
- **Product stakeholders** — confirm business alignment

Resolve any ambiguities in the spec now. This is far cheaper than discovering misunderstandings after code is written. Think of it as a spec-centred backlog grooming session.

### 5. Proceed with Plan and Task Generation

Once the spec is solid and reviewed, move to Plan and Tasks:

```
/sdd-plan     → specs/[feature]/plan.md
/sdd-tasks    → specs/[feature]/tasks.md
/sdd-analyze  → verify all ACs are covered by tasks
```

For a brownfield project or complex integration, apply this cycle to one module or component at a time. Consider a small spike first to validate the approach before committing to a full project.

### 6. Iterate and Scale Up

After implementing a few features with SpecDD, gather metrics and feedback. Track improvements such as:

- Reduced development time per feature
- Fewer bugs and regressions (due to thorough up-front design)
- Faster onboarding (new developers read specs to understand the system)
- Reduction in cycle time from spec to deployment

Use these metrics to demonstrate the value of SpecDD to stakeholders. As confidence grows, expand the practice to more teams and integrate more of the advanced CI/CD automations: fully automated API contract testing, spec drift detection, and automated documentation generation.

---

## Slash Command Quick Reference

| Command | Phase | Output |
|---|---|---|
| `/sdd-blueprint` | Governance | `governance/blueprints/[bu]/blueprint.md` |
| `/sdd-domain-spec` | Governance | `governance/domain-specs/[d]/domain-spec.md` |
| `/sdd-constitution` | Context (Phase 0) | `context/constitution.md` |
| `/sdd-context-map` | Context (Phase 0) | `context/architecture.md` |
| `/sdd-specify` | Phase 1 | `specs/[feature]/spec.md` |
| `/sdd-clarify` | Phase 1 | Clarification questions + spec updates |
| `/sdd-plan` | Phase 2 | `specs/[feature]/plan.md` |
| `/sdd-tasks` | Phase 3 | `specs/[feature]/tasks.md` |
| `/sdd-analyze` | Phase 3 | Traceability report (ACs → tasks) |
| `/sdd-checklist` | Any | Quality checklist for current phase |
| `/sdd-implement` | Phase 4 | Code + tests (task by task) |
| `/sdd-code-review` | Phase 4 | Code review against spec and standards |
| `/sdd-adr` | Any | `specs/[feature]/adr-[n].md` |
| `/sdd-spike` | Any | Time-boxed technical investigation |

---

## Anti-Patterns to Avoid

| Anti-Pattern | Description | Prevention |
|---|---|---|
| **SpecFall** | Up-front spec written once, never updated; quickly becomes stale | Treat spec as a living document; update it in every PR that changes behaviour |
| **Markdown Monster** | Specs pile up but no one maintains them | Assign clear owners; include spec updates in the definition-of-done |
| **Scope Creep in Spec** | One spec tries to cover 3 features | One feature per spec; use hierarchical specs for complex domains |
| **Missing Constitution** | AI generates code without knowing your standards | Always define `context/constitution.md` before Phase 1 |
| **Code Duplication** | AI re-implements existing utilities | Add "check for existing utilities before writing new" to `constitution.md` |
| **Undocumented APIs** | Backend routes added without OpenAPI annotations | Add API documentation gate to CI; see `swagger-api-docs.instructions.md` |
| **Unverified AI Output** | AI-generated code merged without review | Mandatory PR review gate; spec-traced test suite in CI |
| **Big-Bang Generation** | Generating entire codebase in one AI call | Decompose to task level; max 1–2 files per task |

---

## Summary

By following this starter kit, you have a blueprint for Spec-Driven Development that covers everything from initial specs to continuous deployment. SpecDD represents a shift to treating specifications as executable knowledge — a shift that, when supported by AI tools and proper process, results in more robust code, faster delivery, and better collaboration.

Success with SpecDD is not just about tooling. It is about the disciplined practice of keeping specs at the heart of your development process. With a strong spec foundation, clear role ownership, and tight DevOps integration, your team can confidently leverage AI to accelerate software delivery while maintaining a single source of truth from idea to production.

---

## Related Documents

| Document | Description |
|---|---|
| [README.md](../README.md) | Kit overview, SpecDD levels, and slash command reference |
| [SETUP.md](../SETUP.md) | Step-by-step setup guide |
| [docs/sdd-methodology.md](sdd-methodology.md) | Deep dive into SpecDD concepts and AI constraints |
| [docs/workflow.md](workflow.md) | Visual workflow reference with phase diagrams |
| [docs/greenfield-vs-brownfield.md](greenfield-vs-brownfield.md) | Detailed comparison and recommended sequences |
| [docs/faq.md](faq.md) | Frequently asked questions |
| [docs/references.md](references.md) | Industry references and further reading |
| `.github/instructions/swagger-api-docs.instructions.md` | OpenAPI / Swagger documentation standards |
| `.github/instructions/motif-design-system.instructions.md` | EY Motif Design System rules |
