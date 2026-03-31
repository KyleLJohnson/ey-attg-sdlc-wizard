```instructions
---
applyTo: "**"
---
# DevOps Core Principles

Foundational principles covering DevOps culture (CALMS) and key metrics (DORA). Apply these when reviewing code, designing pipelines, generating infrastructure, and making architectural decisions throughout the SpecDD workflow.

## The CALMS Framework

### C — Culture
- Foster a collaborative, **blameless** culture with shared ownership from commit to production
- Conduct blameless post-mortems: focus on systemic causes, not individual blame
- Break down silos between dev, ops, and security — cross-functional understanding is expected
- Create fast feedback loops between all stages of the delivery lifecycle
- **SpecDD alignment**: `/sdd-retrospective` implements this principle; ADRs support shared decision-making

### A — Automation
- Automate everything repeatable: builds, tests, deployments, security scans, infrastructure
- Treat **infrastructure as code** (IaC) — never provision manually what can be declared
- Integrate security checks (SAST, DAST, SCA) directly into the CI/CD pipeline
- **SpecDD alignment**: `specs/*/plan.md` should include CI/CD pipeline tasks; `/sdd-adr` records automation decisions

### L — Lean
- Eliminate waste: unnecessary approvals, manual handoffs, large batch deployments
- Prefer small, frequent PRs over large infrequent releases
- Build quality in — shift testing left; defects found early cost exponentially less
- **SpecDD alignment**: Task format (`T001`, `T002`...) enforces small, verifiable increments

### M — Measurement
- Track the DORA Four Key Metrics (see below) — you cannot improve what you don't measure
- Instrument applications with structured logging, metrics, and distributed tracing
- Use dashboards for pipeline health, test coverage, and deployment frequency
- **SpecDD alignment**: `/sdd-checklist` validates measurable quality gates before marking features done

### S — Sharing
- Document architectural decisions via ADRs in `docs/decisions/`
- Maintain runbooks for operational procedures — written clearly enough for anyone on the team
- Share context actively via `context/` files and spec artifacts
- **SpecDD alignment**: `context/` directory IS the sharing layer; `llms.txt` enables AI-agent discoverability

## DORA Four Key Metrics

These are empirically validated predictors of organizational software delivery performance:

| Metric | Definition | Elite Target | SpecDD Phase |
|---|---|---|---|
| **Deployment Frequency (DF)** | How often you deploy to production | Multiple times/day | `/sdd-tasks` — keep tasks small and deployable |
| **Lead Time for Changes (LTFC)** | Commit → production time | < 1 hour | `/sdd-implement` — one task = one commit |
| **Change Failure Rate (CFR)** | % of deployments causing incidents | 0–15% | `/sdd-checklist` — quality gates block bad releases |
| **Mean Time to Recovery (MTTR)** | Time to restore after failure | < 1 hour | `/sdd-adr` — document rollback strategies |

## When Generating Code or Pipelines

- **CI/CD pipelines**: Design for frequent, small, automated deployments with rollback support
- **IaC**: Prefer declarative (Terraform, Bicep, ARM) over imperative provisioning scripts
- **Monitoring**: When writing services, include structured logging and health endpoints from the start
- **Testing**: Automate unit → integration → E2E tests in order; never skip levels to go faster
- **Feature flags**: Decouple deployment from release — code can ship before the feature is visible
- **Rollback**: Every deployment change should have a documented rollback procedure in the ADR

## Anti-Patterns to Avoid

- Long-lived feature branches (>1 week) — merge small and often
- Manual production deployments — automate or don't ship
- Skipping test automation to "save time" — technical debt accumulates with interest
- Treating ops concerns as "someone else's problem" — shared ownership is non-negotiable
- Big-bang releases — prefer incremental delivery with feature flags
```
