# Instructions Catalog

Curated `.instructions.md` files for automatic context loading in GitHub Copilot.
These apply based on file patterns (`applyTo:`) or globally (`applyTo: "**"`).

**How they work:** Place an instructions file in `.github/instructions/` and add `applyTo:` frontmatter. Copilot loads it automatically when you're working on matching files — no manual `/` command needed.

---

## SpecDD Workflow Instructions

| File | applyTo | Description | Source |
|---|---|---|---|
| [spec-driven-workflow-v1.instructions.md](./spec-driven-workflow-v1.instructions.md) | `**` | Simpler alternative to the full SpecDD kit — single instructions file for spec-driven development | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/spec-driven-workflow-v1.instructions.md) |
| `task-implementation.instructions.md` | `specs/**/tasks.md` | Progressive task tracking with change records | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/task-implementation.instructions.md) |

## AI Safety & Governance

| File | applyTo | Description | Source |
|---|---|---|---|
| [agent-safety.instructions.md](./agent-safety.instructions.md) | `**` | Guardrails for autonomous AI agents — scope limits, confirmation requirements, rollback | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/agent-safety.instructions.md) |
| [no-heredoc.instructions.md](./no-heredoc.instructions.md) | `**` | Prevents terminal heredoc file corruption — enforces use of file editing tools over shell redirections | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/no-heredoc.instructions.md) |
| `ai-prompt-engineering-safety-best-practices.instructions.md` | `**` | Bias mitigation, responsible AI, safety frameworks | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/ai-prompt-engineering-safety-best-practices.instructions.md) |
| `taming-copilot.instructions.md` | `**` | Prevent Copilot from making changes outside the stated scope | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/taming-copilot.instructions.md) |

## Code Quality & Process

| File | applyTo | Description | Source |
|---|---|---|---|
| `code-review-generic.instructions.md` | `**/*.{ts,js,py,cs,java}` | Generic code review standards | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/code-review-generic.instructions.md) |
| `object-calisthenics.instructions.md` | `src/**` | Object Calisthenics for clean domain code | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/object-calisthenics.instructions.md) |
| `performance-optimization.instructions.md` | `**` | Performance best practices across frontend, backend, database | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/performance-optimization.instructions.md) |

## Documentation

| File | applyTo | Description | Source |
|---|---|---|---|
| `markdown.instructions.md` | `**/*.md` | Markdown documentation standards | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/markdown.instructions.md) |
| `update-docs-on-code-change.instructions.md` | `**/*.{md,js,ts,py,cs,go}` | Automatically keep README, API docs, and changelogs in sync when code changes | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/update-docs-on-code-change.instructions.md) |
| `context.instructions.md` | `context/**` | Instructions for maintaining the context pattern | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/context.instructions.md) |

## Accessibility

| File | applyTo | Description | Source |
|---|---|---|---|
| `a11y.instructions.md` | `**` | WCAG 2.2 AA accessibility guidance — keyboard navigation, contrast, ARIA, reflow, forced colors | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/a11y.instructions.md) |

## MCP & External Tools

| File | applyTo | Description | Source |
|---|---|---|---|
| `context7.instructions.md` | `**` | Instructs Copilot to use Context7 MCP server for live, version-accurate library documentation | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/context7.instructions.md) |

## DevOps & Infrastructure

| File | applyTo | Description | Source |
|---|---|---|---|
| `azure-devops-pipelines.instructions.md` | `**/*.yml` | Azure DevOps Pipeline YAML best practices | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/azure-devops-pipelines.instructions.md) |
| `kubernetes-manifests.instructions.md` | `**/*.yaml` | Kubernetes manifest standards and security | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/kubernetes-manifests.instructions.md) |
| `terraform.instructions.md` | `**/*.tf` | Terraform conventions and guidelines | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/terraform.instructions.md) |
| `terraform-azure.instructions.md` | `**/*.tf` | Terraform on Azure best practices | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/terraform-azure.instructions.md) |

## Language / Framework Specific

*These are team-level choices. Install the ones relevant to your stack.*

| Instruction | Stack | Source |
|---|---|---|
| `reactjs.instructions.md` | React | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/reactjs.instructions.md) |
| `nextjs.instructions.md` | Next.js (App Router) | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/nextjs.instructions.md) |
| `angular.instructions.md` | Angular | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/angular.instructions.md) |
| `vuejs3.instructions.md` | Vue 3 | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/vuejs3.instructions.md) |
| `python.instructions.md` | Python | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/python.instructions.md) |
| `nestjs.instructions.md` | NestJS | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/nestjs.instructions.md) |
| `aspnet-rest-apis.instructions.md` | ASP.NET REST | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/aspnet-rest-apis.instructions.md) |
| `rust.instructions.md` | Rust | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/rust.instructions.md) |

---

## How to Activate an Instruction

Copy a file from `examples/instructions/` to `.github/instructions/`, or download it from the source link. The `applyTo:` frontmatter controls when it loads:

```yaml
---
applyTo: "specs/**/*.md"   # only when editing spec files
---
```

```yaml
---
applyTo: "**"              # always active
---
```
