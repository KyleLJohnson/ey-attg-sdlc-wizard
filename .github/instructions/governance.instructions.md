---
applyTo: "**"
---
# Governance Context

Load governance files in **priority order** (highest first). A lower level cannot override a higher one. Only load the files that actually exist for your project — skip missing levels.

```
governance/enterprise-constitution.md          ← Level 1: Enterprise-wide rules
governance/blueprints/[bu-name]/blueprint.md   ← Level 2: BU reference architectures
governance/domain-specs/[domain]/domain-spec.md ← Level 3: Domain namespace + shared models
context/constitution.md                    ← Level 4: Product governing principles
```

Solo projects with no BU governance only need Level 4.

## Context References

Always load these files for project-wide context before generating code or making architectural decisions:

- `context/constitution.md` — Product governing principles (Level 4)
- `context/architecture.md` — System architecture and decisions
- `context/tech-stack.md` — Approved tech stack and constraints
- `context/project.md` — Project overview and success criteria

When working on a specific feature, also load the relevant `specs/{feature}/` folder.

## Delivery Principles

All work governed by this kit aligns with **CALMS** (Culture, Automation, Lean, Measurement, Sharing) and targets improvement of the **DORA Four Key Metrics**:

| DORA Metric | SpecDD Practice |
|---|---|
| Deployment Frequency | Small tasks → frequent, deployable increments |
| Lead Time for Changes | One task = one commit; no long-lived branches |
| Change Failure Rate | Spec + checklist gates block low-quality releases |
| Mean Time to Recovery | ADRs document rollback strategies; runbooks in `docs/` |

Full guidance: `.github/instructions/devops-core-principles.instructions.md`

## Agent Safety Defaults

All AI agents operating in this workspace follow:
- **Least privilege** — minimum tool access for each task
- **Fail closed** — deny when governance checks are ambiguous
- **Append-only audit trail** — all agent actions loggable via `.github/hooks/`

Full guidance: `.github/instructions/agent-safety.instructions.md`
