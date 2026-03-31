```instructions
---
applyTo: "**"
---
# Context Engineering

Guidelines for structuring code and projects to maximize GitHub Copilot's effectiveness through better context management. Apply these principles throughout the SpecDD workflow — from spec writing to implementation.

## Project Structure

- **Use descriptive file paths**: `src/auth/middleware.ts` > `src/utils/m.ts`. Copilot uses paths to infer intent
- **Colocate related code**: Keep components, tests, types, and hooks together. One search pattern should find everything related
- **Export public APIs from index files**: What's exported is the contract; what's not is internal. This helps Copilot understand boundaries
- **Name spec files clearly**: `specs/user-onboarding/spec.md` > `specs/feature-1/doc.md`. AI parses path context

## Code Patterns

- **Prefer explicit types over inference**: Type annotations are context. `function getUser(id: string): Promise<User>` tells Copilot more than `function getUser(id)`
- **Use semantic names**: `activeAdultUsers` > `x`. Self-documenting code is AI-readable code
- **Define constants**: `MAX_RETRY_ATTEMPTS = 3` > magic number `3`. Named values carry meaning
- **Comment intent, not mechanics**: Write "why", not "what". The "what" is readable from code; the "why" is context only you know

## SpecDD Context Files

The `context/` directory is the AI's primary context source. Keep these current:

- `context/constitution.md` — governing principles (load first, always)
- `context/architecture.md` — system design and ADR index
- `context/tech-stack.md` — approved tools, patterns, naming conventions
- `context/project.md` — scope, personas, success criteria

**Rule:** After any architectural change, update `context/architecture.md` immediately. Stale context misleads the AI and causes regressions.

## Working with Copilot

- **Keep relevant files open in tabs**: Copilot uses open tabs as context signals. Working on auth? Open auth-related files
- **Position cursor intentionally**: Copilot prioritizes code near your cursor. Put the cursor where context matters
- **Use Copilot Chat for complex tasks**: Inline completions have minimal context. Chat mode sees more files
- **Reference patterns explicitly**: "Follow the same pattern as `src/api/users.ts`" gives Copilot a concrete example

## Context Hints in Specs

When writing specs in `specs/{feature}/spec.md`, include:
- **Constraints section** naming specific files, patterns, or APIs to follow
- **Examples** of analogous features already in the codebase
- **Anti-patterns** — explicitly state what NOT to do

This allows `/sdd-plan` and `/sdd-implement` to generate contextually correct code rather than generic solutions.

## Multi-File Changes

- **Describe scope first**: Tell Copilot all files involved before asking for changes. "I need to update the User model, API endpoint, and tests"
- **Work incrementally**: One file at a time, verifying each change. Don't ask for everything at once
- **Check understanding**: Ask "What files would you need to see?" before complex refactors

## When Copilot Struggles

| Symptom | Fix |
|---|---|
| Missing context | Open the relevant files in tabs, or explicitly paste code snippets |
| Stale suggestions | Recent changes may not be visible. Re-open files or restart the session |
| Generic answers | Be more specific. Add constraints, mention frameworks, reference existing code |
| Wrong patterns | Mention the specific file in `context/tech-stack.md` or `context/architecture.md` to follow |
| Spec gaps | Run `/sdd-clarify` to resolve ambiguities before proceeding |

## COPILOT.md Pattern (Optional)

For larger projects, add a `COPILOT.md` to the root (or to a module directory) with:
- Architecture decisions relevant to that module
- Key patterns and conventions Copilot should follow
- Anti-patterns or "gotchas" specific to this module
- Links to the relevant spec and ADR files

This complements `context/` by providing module-level context without requiring Copilot to read the entire project.
```
