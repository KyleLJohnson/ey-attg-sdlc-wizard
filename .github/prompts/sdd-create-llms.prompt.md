---
agent: agent
description: Create an llms.txt file in the repository root. This machine-readable index helps AI systems discover this project's key resources, governance context, and workflow. Run once after setting up context and governance.
---

# SpecDD: Create LLMs.txt

You are an AI project coordinator. Generate a complete `llms.txt` file for this repository following the [llms.txt specification](https://llmstxt.org/).

This file makes the project AI-agent-discoverable: any agent loading this repo will immediately understand its governance hierarchy, active specs, workflow commands, and key documentation.

## Pre-Flight Checks

Before generating:
1. Read `context/constitution.md` — extract project name, purpose, namespace
2. Read `context/tech-stack.md` — extract language, framework, key dependencies
3. Read `context/project.md` — extract goals and success criteria
4. Check which governance levels exist:
   - governance/enterprise-constitution.md (Level 1)
   - governance/blueprints/*/blueprint.md (Level 2 — find actual BU folders)
   - `governance/domain-specs/*/domain-spec.md` (Level 3 — find actual domain folders)
5. List all active spec folders under `specs/` (exclude `_template`)
6. List all existing ADR files under `docs/decisions/` (if any)

## Generation Rules

### Project Section
- Use the exact project name and purpose from `context/constitution.md`
- Use the namespace from constitution.md frontmatter
- Use the repository URL from git remote if available

### Governance Section
- Only link governance files that **actually exist** in this repo
- Omit placeholder levels (e.g. don't link enterprise-constitution.md if it only contains the template placeholder)
- List them in priority order (Level 1 → Level 4)

### Active Specifications
- List all spec folders that exist under `specs/` (exclude `_template`)
- For each, link the `spec.md` with a one-line description from the spec's overview section
- If no active specs yet, say so clearly

### Architectural Decisions
- Scan `docs/decisions/` for any `ADR-*.md` files
- If none exist, say "No ADRs yet — create one with `/sdd-adr`"

### Workflow Commands
- Include the full command list — do not abbreviate
- Add any project-specific custom commands if they exist in `.github/prompts/`

## Output

1. Generate the complete `llms.txt` content using `templates/llms-txt-template.md` as the scaffold
2. Replace all `[PLACEHOLDER]` values with actual project data
3. Write the file to the **repository root** as `llms.txt`
4. Confirm: "llms.txt created at repo root. {N} governance levels linked, {N} active specs listed."

## Notes

- `llms.txt` belongs in the repository root (same level as `README.md`)
- It is a Markdown file despite the `.txt` extension — that's the spec's convention
- Update it whenever governance levels change or new features are specced: use `/sdd-update-llms`
