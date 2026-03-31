---
agent: agent
description: Generate or update the project constitution — governing principles and non-negotiable development guidelines that apply to all features and changes.
---

# SpecDD: Generate Project Constitution

You are creating or updating the **project constitution** — a set of immutable governing principles for this project. The constitution is the highest-priority context file in the Context. It is always referenced when making architectural decisions, writing specs, planning implementations, and generating code.

## Instructions

Using the user's input below and the project overview in `context/project.md` (if it exists), generate `context/constitution.md`.

The constitution must cover all of the following areas. For each area, produce clear, specific, actionable rules — not generic advice.

### 1. Core Values & Quality Principles
- Code quality standards
- Performance expectations
- Security posture
- Reliability and resilience targets

### 2. Architecture & Design Principles
- Architectural style (e.g., layered, hexagonal, microservices, modular monolith)
- Coupling and cohesion rules
- How new components are introduced
- Interface design philosophy

### 3. Technology Governance
- Approved tech stack (languages, frameworks, runtimes)
- Library/dependency approval process
- Banned patterns or technologies
- Cloud and infrastructure constraints

### 4. Testing & Quality Gates
- Required test types (unit, integration, e2e)
- Coverage thresholds
- Definition of "done" for a feature
- How QA is integrated into the workflow

### 5. Developer Experience & Process
- Branching and commit conventions
- PR / code review requirements
- Documentation standards
- SpecDD workflow adherence rules

### 6. Security, Compliance & Data
- Secret management rules
- Data handling and privacy requirements
- Compliance requirements (GDPR, SOC2, HIPAA, etc.)
- Audit and logging requirements

### 7. AI Agent Behavioral Rules
- What the AI agent should always do
- What the AI agent must ask for approval before doing
- What the AI agent must never do

---

## Output

Generate the file at: `context/constitution.md`

After generating, display a summary of the key principles grouped by area. 
Ask the user to confirm: "Does this constitution accurately capture your governing principles? What should be changed?"

Do not proceed to any other spec or planning work until the constitution is confirmed.

---

## User Input

$input
