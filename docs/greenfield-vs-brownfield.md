# Greenfield vs. Brownfield SpecDD

> Practical comparison of SpecDD adoption for new projects versus existing codebases.

---

## At a Glance

| Dimension | Greenfield (New Project) | Brownfield (Existing Codebase) |
|---|---|---|
| **Entry point** | Phase 0 — Context | Research phase → Partial Context |
| **First task** | Define constitution from scratch | Reverse-engineer existing patterns |
| **Context source** | You define it | Codebase defines it |
| **Risk** | Scope creep, over-engineering | Regressions, invisible constraints |
| **First spec** | Core feature or foundation | Narrow, isolated capability |
| **Context effort** | High (creating from scratch) | Medium (extracting from existing code) |
| **Constitution** | Written aspirationally | Written descriptively (then aspirationally) |
| **Agent risk** | AI invents inappropriate patterns | AI ignores established patterns |

---

## Greenfield: When & How

### When to Use Greenfield Approach
- Starting a net-new project
- Creating a new service / microservice
- Building a new module with no shared state

### Recommended Sequence

```
1. Phase 0: Context (full setup)
   /sdd-constitution → context/constitution.md
   Fill in project.md, architecture.md, tech-stack.md

2. Phase 1: Core Domain Spec
   /sdd-specify → specs/001-[domain-core]/spec.md

3. Phase 2: Plan
   /sdd-plan → specs/001-[domain-core]/plan.md

4. Phase 3–4: Tasks + Implementation
   /sdd-tasks + /sdd-implement
   Establish patterns and structural decisions

5. Subsequent features
   Add specs sequentially, referencing established patterns
```

### Greenfield Tips
- Set the constitution **before** writing any code — it constrains all future decisions
- Spec the foundation first (data model, authentication, deployment) — it anchors everything else
- Resist over-speccing: define what you're building now, not future aspirations
- Use the constitution to explicitly ban patterns you want to avoid

---

## Brownfield: When & How

### When to Use Brownfield Approach
- Adding features to an existing application
- Onboarding AI development to an established codebase
- Teams new to SpecDD who already have a working product

### Recommended Sequence

```
1. Research Phase (before any SpecDD prompts)
   Read key files: README, main config, core models, existing tests
   Fill in specs/_template/research.md with discovered patterns
   Document: patterns in use, patterns to avoid, forbidden files

2. Extract to Context
   /sdd-constitution → draft from existing codebase
   Describe what exists (not what you'd like)
   Add explicit "do not modify" constraints

3. Start with a Narrow Spec
   Choose a feature that:
   - Touches as few existing files as possible
   - Has clear entry and exit points
   - Is non-critical (lower risk for first SpecDD feature)

4. Research-Informed Planning
   Attach research.md to /sdd-plan prompt
   Call out integration constraints explicitly

5. Expand Incrementally
   Each new spec builds on the established Context
   Update architecture.md as you learn more about the system
```

### Brownfield Tips
- **Research first, always.** Never let the AI guess at existing patterns — it will invent its own
- Explicitly list files the AI must not modify in `agent-boundaries.md`
- Your first spec's primary value is establishing trust in the process, not the feature itself
- Add your current patterns to `tech-stack.md` even if they're not ideal — the AI will follow them
- Use `research.md` to capture reverse-engineered context for each new area of the codebase

### Reverse-Engineering Existing Code into a Spec
For existing functionality you want to document retroactively:

```
1. Collect: Read the relevant source files, tests, migration files
2. Prompt: "Based on [attached files], write a spec in our spec format for [existing feature]"
3. Review: Verify the generated spec against actual behavior
4. Commit: Add spec.md and plan.md with status "Implemented"
5. Benefit: Future changes to this feature now have a spec anchor
```

---

## Adoption Strategies

| Strategy | Description | Best For |
|---|---|---|
| **Feature-first** | Add SpecDD for the next new feature | Teams wanting minimal disruption |
| **Parallel track** | Run SpecDD alongside existing process; compare output quality | Teams evaluating SpecDD before committing |
| **Foundation layer** | Start with Context and constitution; add specs feature-by-feature | Teams serious about long-term adoption |
| **Retro-spec a module** | Document existing high-churn areas with specs | Teams trying to stabilize unstable areas |

---

## Common Pitfalls by Approach

### Greenfield Pitfalls
| Pitfall | Symptom | Fix |
|---|---|---|
| No constitution | AI makes inconsistent pattern choices | Write constitution before first feature spec |
| Over-speccing | Specs block progress; describe future, not present | Keep spec focused on current iteration |
| Skipping research.md | Third-party integration assumptions | Always create research.md for external dependencies |

### Brownfield Pitfalls
| Pitfall | Symptom | Fix |
|---|---|---|
| Skipping research | AI rewrites existing patterns differently | Research phase is mandatory, not optional |
| Too-broad first spec | First feature touches half the codebase | Start with smallest possible isolated feature |
| Constitution over-prescription | Constitution describes ideal, not reality | First draft: describe what IS, then what SHOULD BE |
| Invisible constraints | AI modifies files it shouldn't | Explicit "do not modify" lists in agent-boundaries.md |

---

## The "SpecFall" Risk

> **SpecFall** = installing spec-driven ceremonies without changing how teams actually collaborate. The SpecDD equivalent of Scrumerfall.

Signs you're heading toward SpecFall:
- Specs are written by one developer in isolation, without product or architecture input
- `spec.md` describes implementation steps rather than user intent
- Specs are created at project start and never updated
- Review gates exist on paper but are rubber-stamped
- Product managers and architects never interact with spec artifacts

### How to Avoid It

| Practice | Greenfield | Brownfield |
|---|---|---|
| **Who owns spec.md** | Product / BA with engineer collaboration | Same — frame as "feature intent doc" not "dev doc" |
| **Who owns plan.md** | Architect / Tech Lead | Same — critical for avoiding legacy pitfalls |
| **When to update spec** | On any requirement change | On any behavior change, even bug fixes |
| **Spec review gate** | Cross-functional (product + arch + dev) | Same |
| **Success metric** | Spec reduces rework, not just documents it | Same + spec reduces legacy breakage |

---

## Enterprise Separation of Concerns

At enterprise scale, specs must be organized by **audience and evolution pace**:

| Artifact Type | Audience | Evolution Pace | Location |
|---|---|---|---|
| Business intent / user stories | Product, BA, stakeholders | Slow (feature-scoped) | `spec.md` |
| Acceptance criteria | Product, QA | Slow | `spec.md` |
| Architecture decisions | Architects, Tech Leads | Medium (feature + cross-cutting) | `plan.md`, `context/architecture.md` |
| Data model / API contracts | Engineers, Architects | Medium–Fast | `data-model.md`, `contracts/` |
| Tasks / implementation steps | Engineers | Fast (highly tactical) | `tasks.md` |
| Project-wide rules | All AI agents | Very slow | `context/constitution.md` |

> Mixing all artifact types in a single file (as some SpecDD tools do) creates friction for cross-functional collaboration. The starter kit's separation reflects this concern.

---

## Infrastructure Considerations

SpecDD works well for application code (greenfield or brownfield) but requires adaptation for infrastructure code (Terraform, Helm, etc.):

- **Infrastructure teams often work backward from drift** (actual state → desired spec), not forward from spec → code
- Use **blueprints** rather than one-off specs: standardized, versioned infrastructure patterns that can be deployed across environments
- Spec the **intent** (e.g., "regional infrastructure with standard security controls") and generate from a blueprint catalog, not raw Terraform
- Drift detection tooling (e.g., cloud graph reconciliation) is especially critical for IaC SpecDD

This is distinct from application SpecDD and typically requires separate tooling (e.g., environment orchestrators).
