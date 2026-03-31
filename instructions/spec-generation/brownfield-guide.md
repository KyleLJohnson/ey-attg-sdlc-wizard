# Brownfield SpecDD Guide

> Use this guide when adopting SpecDD on an **existing codebase**.

---

## What is Brownfield SpecDD?

Brownfield means you have existing code, existing architecture, and existing constraints to work within. SpecDD is arguably *more* valuable in brownfield contexts — because new features must integrate cleanly with existing systems, and the AI needs rich context to not inadvertently break things or create duplicates.

The key challenges are:
1. Capturing the existing system's intent and patterns in the Context
2. Writing specs that account for what already exists
3. Ensuring the AI doesn't regenerate what's already there

---

## Recommended Adoption Sequence

### Phase 1: Reverse-Engineer Context (1–2 days)

Before writing any spec, build your Context from the existing codebase:

```bash
# Open your AI agent and run these prompts against your existing code:

# Step 1: Generate architecture overview
"Analyze this codebase. Generate context/architecture.md documenting:
- Current system components and responsibilities
- Data flow between components  
- Integration points and external dependencies
- Key patterns in use (naming conventions, layering, etc.)
- Known technical debt
Reference all relevant existing files."

# Step 2: Document the tech stack
"Analyze package.json / requirements.txt / pom.xml and the codebase.
Generate context/tech-stack.md with the actual stack in use, 
naming conventions observed, and key commands."

# Step 3 (optional): Use Firecrawl / spec reverse-engineering
# See docs/references.md for tools that help reverse-engineer specs from code
```

### Phase 2: Generate Constitution (half day)

With the architecture understood, run `/sdd-constitution` — your constitution should now incorporate:
- Existing patterns that must be followed
- Legacy constraints to work around
- Technical debt acknowledgements
- Rules specific to the existing codebase

#### Constitution Crafting: The Four Pillars

Generating a constitution is fast. Writing an *effective* one requires senior engineering judgment and typically **2–3 days** of initial effort plus ongoing refinement. Plan for this upfront.

> **Hot tip:** The AI assistant prioritizes `.md` files in your repository — READMEs, docs, markdown content. Outdated docs will produce an outdated constitution. Clean them up **before** running `/sdd-constitution`.

After initial generation, refine your constitution around these four categories:

**1. Code Reuse Policy**
AI agents default to writing new code rather than finding existing implementations. Without an explicit rule, the agent will create duplicate services, clients, and utilities — sometimes in a brand-new directory with the same name as one that already exists. Add a rule like:

```markdown
## Code Reuse
- Code duplication is prohibited.
- You must search for existing functions before creating a new one.
- If no reusable function exists, a new one may be introduced.
- This rule is especially critical for:
  - *-data-client (database access layer)
  - *-api-client (external HTTP service access layer)
```

With this rule, the AI will generate task lists that include a "search for existing functionality" step before implementing. Results improve significantly, though human validation remains essential.

**2. Your Specific Architecture**
LLM training data includes countless projects using service layers, middleware patterns, and other common conventions. Without explicit instructions, the agent defaults to these common patterns even when your project doesn't use them. Document what your architecture actually is:

```markdown
## Architecture
- Router functions call data clients and API clients directly
- NO business logic / service layer
- Simple logic stays in the router; complex logic in data clients
```

**3. Forbidden Patterns**
Document not just what to do, but what not to do. Example:

```markdown
## Forbidden Patterns
- Route handlers must NOT contain try/catch blocks with log-and-rethrow logic
- Exception handling is centralized in middleware
```

> Even explicit rules get violated — the AI is inconsistent. Add forbidden patterns AND verify them in code review.

**4. Accurate Terminology**
Avoid referencing external standards you don't fully implement (e.g., "follow RFC 9457") — the AI will assume full compliance and generate code aligned to the entire standard rather than your subset. Similarly, avoid terms implying behaviors your system doesn't have (e.g., "transaction" when you don't use database transactions — the AI will model ACID properties). Use terms that precisely describe what your system actually does.

> **Key insight:** Constitution quality directly determines implementation quality. A weak constitution produces inconsistent results; a strong one yields predictable, maintainable code with less rework at each phase.

---

### Phase 3: First Feature Spec

Choose a small, well-scoped new feature as your first SpecDD experiment:
- Avoids risk on complex critical paths
- Gets the team familiar with the workflow
- Produces a real deliverable to validate the approach

---

## Brownfield Spec Writing Tips

### Research the Codebase First
Before running `/sdd-specify`, always research the existing code:

```
Before specifying this feature, analyze the existing codebase and populate
research.md with:
- Existing components this feature will touch or depend on
- Patterns in use that should be followed
- APIs or services already available
- Database tables/models already in place
- Anything that should NOT be duplicated
```

### Integrate Existing Patterns
Your spec should reference existing conventions. In your input to `/sdd-specify`, include:

> "This feature must integrate with the existing [AuthService / UserRepository / etc.]. 
> Follow the same patterns as [existing feature] for [concern]."

### Flag What Already Exists
Add an "Existing Components" section to `research.md` before planning. The AI will use this to avoid re-implementing things that are already there.

### Tell the AI What NOT to Create
A common brownfield failure is the AI regenerating classes, components, or APIs that already exist. Add explicit constraints:

> "DO NOT create new UserService — use the existing one at src/services/user.service.ts.
> DO NOT modify the existing auth middleware."

### Feature Sizing for Brownfield Specs

Spec Kit performs best on features that **a single developer can complete in 1–5 days**. This yields 3–4 user stories with approximately 40–50 functional requirements — enough granularity for the AI to generate accurately without losing coherence.

| Feature Size | Recommended Approach |
|---|---|
| 1–5 developer days | One spec, direct to `/sdd-specify` |
| 1–3 developer weeks | Break into 2–4 specs; each spec is its own Jira/ADO entry |
| Larger / epic | Human judgment required to define split points before speccing |

> **Quality warning:** Spec Kit can technically process larger features, but output quality degrades. Feeding large, complex epics into a single specification often leads to incomplete or fragmented results, weakening downstream implementation quality.

**BA ownership:** The split decision requires human judgment — a BA or developer acting as BA should size features, define backlog entries, trigger `/sdd-specify`, and validate the generated breakdown. AI enhances BA efficiency but cannot replace the sizing judgment.

**Spec structure to expect:** Each spec typically produces 3–4 user stories with ~10 functional requirements each (40–50 total). Plan 10–20 minutes on clarification and 30–60 minutes on review per spec. Skipping the review step is the most common cause of costly rework later.

---

## Reverse-Engineering Specs from Existing Code

If you want to retrospectively document existing features as specs (for spec-anchored SpecDD):

```
Generate a spec for the existing [feature name] functionality.
Analyze these files: [file list]
Structure it as specs/[NNN]-[feature]/spec.md using the template.
Focus on capturing the INTENT (what it does and why), not just describing the code.
```

This is useful for:
- Onboarding new team members
- Planning major changes to established features
- Creating a "spec inventory" of the codebase

---

## Incremental Adoption Strategy

You don't have to adopt SpecDD for everything at once. A graduated approach:

| Phase | What to Apply SpecDD To |
|---|---|
| Phase 1 (Pilot) | 1–2 new features chosen by the team |
| Phase 2 (Expansion) | All new features above a complexity threshold |
| Phase 3 (Standardization) | All new work, including bug fixes for complex areas |
| Phase 4 (Retrospective) | Retroactive spec documentation for core existing features |

---

## Brownfield Pitfalls

| Pitfall | What Happens | Prevention |
|---|---|---|
| No research phase | AI duplicates existing code | Always run research step before spec |
| Too big first spec | Integration complexity derails implementation | Start with small, isolated feature |
| Missing context in constitution | AI ignores existing patterns | Include "follow existing patterns in X" in constitution |
| Skipping architecture.md | AI makes incompatible architectural choices | Reverse-engineer architecture.md before specifying |
| No "do not modify" rules | AI modifies battle-tested stable code | Add explicit "do not modify" rules to agent-boundaries.md |

---

## Organic Spec Coverage: The TDD Analogy

Rather than attempting to retroactively specify entire existing systems (impractical, expensive to review), use the **area-of-change** approach:

> This approach mirrors TDD refactoring: cover as much existing logic **around the area of change** as possible, then isolate that area for the coding agent. Spec coverage grows organically with each modification.

**In practice:**
1. When touching a module, write a spec that covers the existing behavior of that module **plus** the new change
2. Every bug fix, feature addition, and refactor becomes an opportunity to document the surrounding code as a spec
3. Over time, coverage grows naturally in areas of active development — without the prohibitive cost of bulk spec-generation
4. The result: reasonably sized, human-reviewable specs focused on areas of actual change

This avoids two failure modes:
- **Under-speccing**: AI invents wrong patterns because context is missing
- **Over-speccing**: Generating vast specs for entire legacy systems that nobody can review or maintain

---

## Multi-Repository Brownfield Features

Enterprise brownfield codebases often span multiple repositories. SpecDD handles this via **architectural decomposition**:

### Recommended Pattern

```
1. Architect creates a discovery-level spec at the "parent" level:
   - Defines which repositories are affected
   - Documents integration points and data contracts between them
   - Establishes the ordering dependency (which repo must change first)

2. For each affected repository, a separate scoped spec is created:
   - specs/[feature]/spec.md  → scoped to that repo's responsibilities
   - plan.md / tasks.md       → implementation within that boundary

3. Business context stays in the backlog (Jira / Azure DevOps)
   - Sub-tasks per repo track progress
   - Parent story represents overall feature completion
```

### Architecture Harness

Create a persistent architecture harness at the project level — a documented set of:
- Repository boundaries and responsibilities
- Integration patterns (event-driven, REST, etc.)
- Constraints the AI must always follow (e.g., "authentication is handled by auth-service only")

AI agents guided by this harness can automatically decompose incoming features into repo-scoped sub-tasks, reducing manual architectural decomposition.

---

## Harness Governance: Treating Spec Quality as a Priority

In mature SpecDD, bugs are analyzed as **specification gaps** rather than just random code defects. This is the "harness governance" principle:

| Failure Mode | Root Cause | Resolution |
|---|---|---|
| **Spec-to-Implementation gap** | Spec was correct, code diverged | Strengthen task validation, add implementation constraints to the harness |
| **Intent-to-Spec gap** | Spec was incomplete or wrong | Improve spec elicitation — add question patterns, research steps, or domain checks |

**Practical steps:**
1. When a bug surfaces, ask: "Was this in the spec?" If no — add a rule to the spec template or constitution
2. Track spec quality as a metric alongside code quality
3. Each gap identified strengthens the harness, making future specs more complete

This shifts QA from "validate output" to **"validate the context that shaped the output"** — a more sustainable model as agent-generated code volume grows.

---

## Backlog Integration

If your team uses Jira, Azure DevOps, or Linear, you can bridge SpecDD workflows to your existing backlog:

- Pull stories into SpecDD workflows via MCP servers (ADO MCP, Jira MCP) — developers reference backlog items instead of re-entering requirements
- Update backlog items (In Progress / Done) when spec phases complete
- Business context lives in the backlog; technical artifacts live in the repo

This respects existing team investments in backlog curation and avoids the "where does the spec live?" confusion for cross-functional teams.
