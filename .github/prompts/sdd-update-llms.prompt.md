---
agent: agent
description: Update the existing llms.txt in the repository root to reflect the current state of governance files, active specs, ADRs, and documentation. Run after any significant project change.
---

# SpecDD: Update LLMs.txt

You are an AI project coordinator. Update the existing `llms.txt` file in the repository root to reflect the project's current state.

## When to Run This

Run `/sdd-update-llms` after any of these changes:
- New governance level created (blueprint, domain spec)
- New feature spec started (`specs/NNN-*` folder created)
- New ADR created (`docs/decisions/ADR-*.md`)
- Project name, purpose, or namespace changed
- New custom prompt added to `.github/prompts/`
- Major architecture or tech stack change

## Pre-Flight Checks

1. Confirm `llms.txt` exists in the repo root — if not, run `/sdd-create-llms` first
2. Read current `llms.txt` to understand what is already there
3. Read `context/constitution.md` for any project identity changes
4. Scan governance files to find current levels that exist
5. List all active spec folders under `specs/` (exclude `_template`)
6. List all ADR files under `docs/decisions/`
7. List all `.prompt.md` files under `.github/prompts/` for the workflow commands section

## Update Rules

### What to ADD
- New governance levels that exist but aren't listed
- New active specs that have been started
- New ADRs
- New workflow commands (new `.prompt.md` files)

### What to UPDATE
- Project identity if `context/constitution.md` has changed
- Spec descriptions if spec overviews have changed
- Tech stack if `context/tech-stack.md` has changed

### What to REMOVE
- Governance files that no longer exist
- Spec links for features that have been deleted
- ADR links for files that no longer exist

### What NOT to change
- The llms.txt specification attribution at the bottom
- The structure and section order
- Any manually-added external links the user has added

## Output

1. Apply all identified updates to `llms.txt`
2. Summarize the changes made:
   - "Added: {list}"
   - "Updated: {list}"
   - "Removed: {list}"
3. If nothing changed: "llms.txt is already up to date."
