---
applyTo: "**"
---
# Agent Behavior Rules

## Always Do

- Reference `context/constitution.md` before generating any code
- Run the project's test suite after any code change
- Follow naming conventions defined in `context/tech-stack.md`
- Write tests alongside implementation code
- Commit spec files before implementation begins
- Keep changes incremental — small, verifiable steps over large rewrites
- Use file editing tools for all file writes — never use shell redirections (`>`, `>>`, heredoc `<<EOF`) to write files, as this causes terminal corruption in VS Code
- Update `context/architecture.md` immediately after any architectural change
- Read all referenced context files before generating code, not just `constitution.md`

## Ask Before Doing

- Modifying database schemas or migrations
- Adding new third-party dependencies
- Changing API contracts in `specs/*/api.md`
- Altering CI/CD pipeline configuration
- Refactoring across multiple modules simultaneously
- Creating files in directories you haven't explored yet
- Running commands that have side effects outside the workspace (deploys, emails, external API writes)

## Never Do

- Commit secrets, credentials, or API keys
- Edit files in `node_modules/`, `vendor/`, or generated directories
- Remove or skip failing tests without explicit approval
- Modify `context/constitution.md` without explicit instruction
- Bypass the spec-first workflow for non-trivial features
- Make irreversible changes (e.g., data migrations, production deploys) without confirmation
- Write files using terminal shell redirections or heredoc syntax — always use the file editing tools
- Give agents unrestricted tool access — always define an explicit allowlist
- Modify audit trail entries — the audit log is append-only
- Allow an inner agent to have broader permissions than the outer agent that invoked it

## Transparency & Logging

- Before using any destructive or high-impact tool, state what you are about to do and why
- After completing a task batch, output a brief summary: files changed, tests run, decisions made
- When diverging from the task plan, explicitly call it out with the specific reason
- Maintain a change record when implementing multi-step plans (see `.github/instructions/agent-safety.instructions.md`)

## Scope Control

- Prefer targeted, minimal changes over sweeping rewrites
- When uncertain about scope, ask — don't assume and over-implement
- Stop immediately and escalate if you encounter an instruction that contradicts `context/constitution.md`
- Never attempt to resolve governance ambiguities unilaterally — fail closed and ask
