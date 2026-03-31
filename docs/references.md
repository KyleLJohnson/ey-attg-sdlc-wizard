# References & Resources

Curated reading list for Spec-Driven Development.

---

## Foundational Reading

| Title | Link | Why Read It |
|---|---|---|
| Spec-Driven Development — InfoQ (Intro) | https://www.infoq.com/articles/spec-driven-development/ | Architectural framing: the 5-layer SpecDD model (Specification → Generation → Artifact → Validation → Runtime), SpecOps concept, drift detection as mandatory capability, architectural inversion |
| Enterprise Spec-Driven Development — InfoQ | https://www.infoq.com/articles/enterprise-spec-driven-development/ | Enterprise adoption: Vibe Coding → Plan Mode → SpecDD evolution arc, "SpecFall" anti-pattern, multi-repo orchestration, harness governance, brownfield incremental pattern, cross-functional ownership model |
| EPAM — What GitHub Spec Kit Makes Possible | https://www.epam.com/insights/ai/blogs/spec-driven-development-ai-assisted-engineering | ✅ Conceptual foundation article (Oct 2025). Four structural AI limits (scope/duration, feature context, project knowledge, uncontrolled autonomy); 1–3 files = high quality, 10+ files = coherence breaks (scope > duration rule); six-stage workflow; constitution as project DNA (stack, naming, architectural rationale, library governance, compliance); layered context system; five team types that benefit most; scope fit limitation (scattered refactors = poor fit); developer role evolution; safe delegation window concept |
| Martin Fowler — SpecDD Tools (Kiro, spec-kit, Tessl) | https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html | Critical analysis of SpecDD levels and tools |
| O'Reilly — How to Write a Good Spec for AI Agents | https://www.oreilly.com/radar/how-to-write-a-good-spec-for-ai-agents/ | Practical spec writing framework (5 principles) |
| The New Stack — Is SpecDD Key for Infrastructure Automation | https://thenewstack.io/is-spec-driven-development-key-for-infrastructure-automation/ | Infrastructure perspective: why IaC needs blueprint-driven (not spec-driven) approach; infra teams work backward from drift |

---

## Official Tooling

| Resource | Link | Notes |
|---|---|---|
| GitHub Spec Kit | https://github.com/github/spec-kit | Official open-source toolkit (CLI + templates) |
| GitHub Blog — SpecDD with AI | https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/ | Getting started guide from GitHub |
| Spec Kit Documentation | https://github.github.io/spec-kit/ | Full docs for `specify` CLI |
| Kiro (Amazon) | https://kiro.dev/ | VS Code-based SpecDD tool (Requirements → Design → Tasks) |
| Tessl Framework | https://docs.tessl.io/introduction-to-tessl/quick-start-guide-tessl-framework | Spec-as-source SpecDD (private beta) |

---

## Brownfield / Reverse Engineering

| Resource | Link | Purpose |
|---|---|---|
| Firecrawl | https://www.firecrawl.dev/ | Generate specs from existing systems / documentation |
| Microsoft Learn — Implement SpecDD with Spec Kit | https://learn.microsoft.com/training/modules/implement-spec-driven-development-using-github-spec-kit/ | Step-by-step hands-on training module |
| EPAM — Using Spec Kit for Brownfield | https://www.epam.com/insights/ai/blogs/using-spec-kit-for-brownfield-codebase | ✅ Full production retrospective from EPAM's AI/Run team on a 280k-line, 10-developer codebase. Key insights: constitution crafting takes 2–3 days (senior engineers); the four-pillar constitution model (reuse policy, project architecture, forbidden patterns, accurate terminology); feature sizing (1–5 day scope, ~40–50 requirements per spec); cumulative quality degradation math (0.8^5 ≈ 0.33 without review gates); phase-checkpoint execution loop; AI deviation patterns; 60–80% code retention is excellent; model quality as productivity decision (Sonnet 4.5 vs 4.0 halved rework); "third refinement rule"; prompt-based vs manual refinements; review fatigue as an operational reality |

---

## Practitioner Guides

| Resource | Link | Notes |
|---|---|---|
| AugmentCode — Mastering SpecDD | https://www.augmentcode.com/guides/mastering-spec-driven-development-with-prompted-ai-workflows-a-step-by-step-implementation-guide | ✅ Structured specification framework; complete 5-part prompt template (Context + Specification + Requirements + Expected Output + Constraints); confidence-based quality gates (High >90% / Medium 70-90% / Low <70%); 8-week phased team adoption timeline; 19% research finding (AI can increase completion time without structure); MetaGPT-style task decomposition; treat SpecDD as evolution of software engineering practice, not replacement |
| Intuition Labs — Spec Kit Guide | https://intuitionlabs.ai/articles/spec-driven-development-spec-kit | Detailed walkthrough of 4 phases; "Every hour on planning saves 10 hours of rework"; role shift from code writer to architect/validator |
| How to Write a Great agents.md | https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/ | Lessons from 2,500+ agent config files |

---

> **Access note:** Both EPAM articles were incorporated via user-provided content (epam.com returns 403 Forbidden to automated fetching). Microsoft Learn SpecDD module (`learn.microsoft.com/training/...`) appears to have been removed. YouTube walkthrough videos require authentication to access directly.

---

## Videos

| Title | Link | Duration |
|---|---|---|
| Spec-Driven Development Overview | https://youtu.be/MGzymaYBiss | Overview |
| Spec Creation — Greenfield | https://www.youtube.com/watch?v=a9eR1xsfvHg&t=1182s | Greenfield walkthrough |
| Spec Creation — Brownfield | https://www.youtube.com/watch?v=SGHIQTsPzuY&t=547s | Brownfield walkthrough |

---

## Context Engineering (Advanced)

| Resource | Link | Notes |
|---|---|---|
| Anthropic — Effective Context Engineering | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Deep dive into context management |
| Addy Osmani — Context Engineering | https://addyo.substack.com/p/context-engineering-bringing-engineering | Hierarchical summarization patterns |
| Simon Willison — Vibe Engineering | https://simonwillison.net/2025/Oct/7/vibe-engineering/ | Practical AI coding craft |

---

## Related Methodologies

| Methodology | Relationship to SpecDD |
|---|---|
| TDD (Test-Driven Development) | SpecDD borrows the "define success criteria first" principle |
| BDD (Behavior-Driven Development) | GIVEN/WHEN/THEN ACs in SpecDD are inspired by BDD |
| PRD (Product Requirements Document) | SpecDD spec is essentially a structured, executable PRD |
| MDD (Model-Driven Development) | Historical precedent for spec-as-source — with lessons learned |
| ADR (Architecture Decision Records) | Recommended for `context/architecture.md` |
