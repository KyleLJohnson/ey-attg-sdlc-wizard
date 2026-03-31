# Prompts Catalog

Curated prompts from [github/awesome-copilot](https://github.com/github/awesome-copilot) and other sources.
Organized by phase and use case.

---

## Pre-Spec: Research & Discovery

| Prompt | Description | Source |
|---|---|---|
| [create-technical-spike.prompt.md](./create-technical-spike.prompt.md) | Time-boxed spike document for researching unknowns before spec | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-technical-spike.prompt.md) |
| [context-map.prompt.md](./context-map.prompt.md) | Map bounded contexts and relationships (DDD) | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/context-map.prompt.md) |
| [what-context-needed.prompt.md](./what-context-needed.prompt.md) | Ask Copilot what files it needs before answering a question | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/what-context-needed.prompt.md) |
| `first-ask.prompt.md` | Ask clarifying questions before acting | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/first-ask.prompt.md) |

## Specification & Planning

| Prompt | Description | Source |
|---|---|---|
| `breakdown-epic-pm.prompt.md` | Create Product Requirements Documents (PRD) for an Epic | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/breakdown-epic-pm.prompt.md) |
| `breakdown-epic-arch.prompt.md` | High-level technical architecture for an Epic | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/breakdown-epic-arch.prompt.md) |
| `breakdown-feature-prd.prompt.md` | PRD for a specific feature based on an Epic | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/breakdown-feature-prd.prompt.md) |
| `breakdown-feature-implementation.prompt.md` | Detailed feature implementation plan | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/breakdown-feature-implementation.prompt.md) |
| `breakdown-test.prompt.md` | Test strategy and quality assurance plan | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/breakdown-test.prompt.md) |

## Architecture & Design

| Prompt | Description | Source |
|---|---|---|
| [create-architectural-decision-record.prompt.md](./create-architectural-decision-record.prompt.md) | Create an ADR for key architectural decisions | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-architectural-decision-record.prompt.md) |
| `architecture-blueprint-generator.prompt.md` | Analyze codebase and generate architecture documentation | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/architecture-blueprint-generator.prompt.md) |
| `technology-stack-blueprint-generator.prompt.md` | Document the full technology stack | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/technology-stack-blueprint-generator.prompt.md) |
| `folder-structure-blueprint-generator.prompt.md` | Analyze and document project folder structure | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/folder-structure-blueprint-generator.prompt.md) |

## GitHub Integration

| Prompt | Description | Source |
|---|---|---|
| [create-github-issues-from-plan.prompt.md](./create-github-issues-from-plan.prompt.md) | Create GitHub Issues from an implementation plan | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-github-issues-feature-from-implementation-plan.prompt.md) |
| `create-github-issue-feature-from-specification.prompt.md` | Create a GitHub Issue from a spec file | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-github-issue-feature-from-specification.prompt.md) |
| `create-github-issues-for-unmet-specification-requirements.prompt.md` | Issues for unimplemented spec requirements | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-github-issues-for-unmet-specification-requirements.prompt.md) |
| `create-github-pull-request-from-specification.prompt.md` | Create a PR from a spec file | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-github-pull-request-from-specification.prompt.md) |
| `breakdown-plan.prompt.md` | Full project plan with Epic > Feature > Story hierarchy + GitHub Issues | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/breakdown-plan.prompt.md) |

## Documentation

| Prompt | Description | Source |
|---|---|---|
| `documentation-writer.prompt.md` | Diátaxis-structured technical documentation | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/documentation-writer.prompt.md) |
| `create-readme.prompt.md` | Generate a comprehensive README.md | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-readme.prompt.md) |
| `readme-blueprint-generator.prompt.md` | README from copilot-instructions.md patterns | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/readme-blueprint-generator.prompt.md) |
| `add-educational-comments.prompt.md` | Add explanatory comments to a file | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/add-educational-comments.prompt.md) |

## AI & Copilot Meta

| Prompt | Description | Source |
|---|---|---|
| `copilot-instructions-blueprint-generator.prompt.md` | Generate copilot-instructions.md from existing codebase | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/copilot-instructions-blueprint-generator.prompt.md) |
| `create-agentsmd.prompt.md` | Generate an AGENTS.md file | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-agentsmd.prompt.md) |
| `create-llms.prompt.md` | Create an llms.txt from repository structure | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/create-llms.prompt.md) |
| `update-llms.prompt.md` | Update an existing llms.txt | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/update-llms.prompt.md) |
| `prompt-builder.prompt.md` | Build high-quality Copilot prompts | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/prompt-builder.prompt.md) |
| `finalize-agent-prompt.prompt.md` | Polish a prompt file from an AI agent perspective | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/finalize-agent-prompt.prompt.md) |
| `model-recommendation.prompt.md` | Recommend optimal AI models for task types | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/model-recommendation.prompt.md) |

## Refactoring & Code Quality

| Prompt | Description | Source |
|---|---|---|
| [refactor-plan.prompt.md](./refactor-plan.prompt.md) | Multi-file refactor with sequencing and rollback | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/refactor-plan.prompt.md) |
| `refactor-method-complexity-reduce.prompt.md` | Reduce method complexity | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/refactor-method-complexity-reduce.prompt.md) |
| `review-and-refactor.prompt.md` | Code review + refactor in one pass | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/review-and-refactor.prompt.md) |

## DevOps & Operations

| Prompt | Description | Source |
|---|---|---|
| `devops-rollout-plan.prompt.md` | Generate comprehensive deployment rollout plans with preflight checks, verification signals, and rollback procedures | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/devops-rollout-plan.prompt.md) |

## Git Workflow

| Prompt | Description | Source |
|---|---|---|
| `conventional-commit.prompt.md` | Generate conventional commit messages using a structured XML format with validation | [source](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/conventional-commit.prompt.md) |

---

## How to Install from VS Code

Any prompt from awesome-copilot can be installed directly into VS Code:

1. Open the source link above
2. Use the VS Code install badge on the awesome-copilot page, or
3. Copy the raw file to `.github/prompts/` in your project
