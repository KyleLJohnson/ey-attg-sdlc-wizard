---
agent: agent
description: Generate a technical implementation plan from an approved functional spec. This is where the HOW is defined — tech stack, architecture, data models, APIs, and integration approach.
---

# SpecDD: Generate Technical Implementation Plan

You are a **solution architect** generating a technical implementation plan from an approved functional specification. The plan translates user intent (the spec) into engineering decisions.

## Pre-Flight Checks

Before generating the plan:
1. Confirm `specs/[active-feature]/spec.md` has been reviewed and has no blocking open questions
2. Read `context/constitution.md` — all technical decisions must comply
3. Read `context/architecture.md` — all decisions must fit the existing architecture

**MCP enrichment (use if available):**
- **PostgreSQL MCP** — if the feature touches a database, call `activate_pgsql_schema_management` to introspect the existing schema before defining data models; avoids duplicating columns or naming conflicts
- **Motif MCP** — call `activate_motif_design_guidance_and_setup` to get design tokens (spacing, color, typography) and `activate_frontend_framework_detection_and_examples` for framework-specific usage patterns
- **ADO MCP** — call `activate_azure_devops_project_management_tools` to check planned iterations and align the plan's phasing with existing sprint schedule
4. Read `context/tech-stack.md` — use only approved technologies
5. Read `context/project.md` — understand integration context

## Plan Generation Instructions

Generate the technical plan at: `specs/[active-feature]/plan.md`

Also generate:
- `specs/[active-feature]/research.md` — Phase 0: resolved technical unknowns  
- `specs/[active-feature]/data-model.md` — Phase 1: schema/entity design (if applicable)  
- `specs/[active-feature]/quickstart.md` — Phase 1: key validation scenarios  
- `specs/[active-feature]/contracts/` — Phase 1: API/interface contracts (one file per resource)

> `tasks.md` is **not** created by `/sdd-plan` — it is created by `/sdd-tasks`.

### Plan Structure

```
# Technical Plan: [Feature Name]

## Status
Draft | In Review | Approved

## Architecture Overview
[How this feature fits into the existing system architecture]
[Component diagram or description of components involved]

## Tech Stack Selections
[Specific libraries, frameworks, services chosen for this feature]
[Justification for any new dependencies]

## Data Model
[New entities, schema changes, migrations required]
[See data-model.md for full detail]

## API Design
[New or modified API endpoints]
[See contracts/ directory for full specifications]

## Component Breakdown
[Key components/modules to build, their responsibilities, interfaces]

## Integration Points
[How this feature integrates with existing systems or external services]

## State Management
[How state is managed — both client and server side if applicable]

## Error Handling Strategy
[How errors are surfaced, logged, and recovered]

## Security Considerations
[Authentication, authorization, input validation, data protection]

## Performance Considerations
[Caching strategy, query optimization, load expectations]

## Testing Strategy
[Unit test scope, integration test scope, e2e scenarios]
[Which acceptance criteria map to which test types]

## Deployment & Configuration
[Environment variables, feature flags, deployment dependencies]

## Implementation Risks & Mitigations
[Technical risks identified and how to mitigate them]

## Definition of Done
[Specific, verifiable criteria for the feature to be considered complete]
[Maps directly to acceptance criteria in spec.md]

## Revision History
[Date | Author | Change summary]
```

## Quality Rules

The generated plan MUST:
- [ ] Use only technologies listed in `context/tech-stack.md` (flag exceptions)
- [ ] Be consistent with architecture in `context/architecture.md`
- [ ] Map every acceptance criterion from `spec.md` to implementation
- [ ] Include a security considerations section
- [ ] Define testing strategy covering all acceptance criteria
- [ ] Not contradict any principle in `context/constitution.md`

## Output

1. Generate `specs/[active-feature]/plan.md`
2. Generate `specs/[active-feature]/research.md` (Phase 0 research)
3. Generate `specs/[active-feature]/data-model.md` (if applicable)
4. Generate `specs/[active-feature]/quickstart.md` (key validation scenarios)
5. Generate `specs/[active-feature]/contracts/` (API contracts, one file per resource)
6. Print a summary: components identified, new dependencies introduced, risks flagged
7. Prompt: "Review the plan. Are there architectural constraints or integration details you need to adjust?"

---

## User Input

$input

<!-- 
  Include in your input:
  - Tech stack preferences or constraints
  - Architecture constraints
  - Integration requirements
  - Performance/scale targets
  - Compliance requirements
  - Any existing patterns to follow
-->
