---
agent: agent
description: Create a functional specification for a new feature. Focus on WHAT and WHY — user journeys, outcomes, acceptance criteria. Not the technical HOW.
---

# SpecDD: Create Functional Specification

You are creating a **functional specification** for a new feature or user story. The spec captures intent — what the user needs and what success looks like — before any technical decisions are made.

## Pre-Flight Checks

Before generating the spec:
1. Read `context/constitution.md` — all spec content must align with governing principles
2. Read `context/project.md` — understand the project context and users
3. Check if an existing spec folder exists under `specs/` that may be related

**MCP enrichment (use if available):**
- **Figma MCP** — if a Figma design URL is provided, call `mcp_com_figma_mcp_get_design_context` to extract component names, layout, and user flows as acceptance criteria context
- **ADO MCP** — call `activate_azure_devops_work_item_management_tools` to query related backlog items and avoid spec overlap with existing work
- **Motif MCP** — call `activate_motif_component_documentation_and_management` to list available Motif components that cover the stated UI requirements; include component names as implementation constraints in the spec

## Spec Generation Instructions

Based on the user's input, generate a **functional specification** at:  
`specs/[NNN]-[feature-name]/spec.md`

Where `NNN` is the next sequential number and `feature-name` is a kebab-case summary.

### Spec Structure

Generate the spec with the following sections:

```
# Spec: [Feature Name]

## Status
Draft | In Review | Approved | Implemented | Deprecated

## Overview
[2–4 sentence summary of the feature and its purpose]

## Problem Statement
[What problem does this solve? Why does it need to exist?]

## Target Users
[Who are the primary users? What are their goals and pain points?]

## User Stories
[List of user stories in "As a [role], I want [goal] so that [benefit]" format]

## User Journeys
[Step-by-step flows showing how users interact with the feature]

## Acceptance Criteria
[For each user story: GIVEN / WHEN / THEN acceptance criteria]

## Out of Scope
[Explicit list of what this feature does NOT include]

## Success Metrics
[How will we know this feature is successful?]

## Assumptions & Dependencies
[What are we assuming to be true? What does this depend on?]

## Open Questions
[Unresolved questions that need answers before planning — flag for /sdd-clarify]

## Revision History
[Date | Author | Change summary]
```

## Quality Rules

The generated spec MUST:
- [ ] Focus on WHAT and WHY — avoid specifying the technical HOW
- [ ] Include at least one user story per distinct user type
- [ ] Have acceptance criteria in GIVEN/WHEN/THEN format
- [ ] Explicitly list what is OUT OF SCOPE
- [ ] Flag any open questions or ambiguities
- [ ] Be consistent with the constitution in `context/constitution.md`

## Output

1. Create `specs/[NNN]-[feature-name]/spec.md`
2. Create `specs/[NNN]-[feature-name]/research.md` (empty skeleton for research notes)
3. Print a summary of: user stories generated, acceptance criteria count, open questions flagged
4. Recommend whether to run `/sdd-clarify` before proceeding to planning

---

## User Input

$input
