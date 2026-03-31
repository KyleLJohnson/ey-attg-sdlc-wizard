```instructions
---
applyTo: "**"
---
# Agent Safety & Governance

Guidelines for safe, governed AI agent behavior. Apply these when writing agent code, designing multi-agent systems, or configuring agent tools/permissions within the SpecDD workflow.

## Core Safety Principles

- **Fail closed**: When a governance check is ambiguous, deny the action rather than allowing it
- **Least privilege**: Agents get the minimum tool access needed for their specific task
- **Policy as configuration**: Define governance rules in YAML/JSON — never hardcode in application logic
- **Append-only audit**: Never modify or delete audit trail entries — immutability enables compliance
- **No self-modification**: Agents must not modify their own governance policies

## Tool Access Controls

- Always define an explicit **allowlist** of tools an agent can use — never give unrestricted access
- Separate tool registration from tool authorization — the framework knows what tools exist; policy controls which are allowed
- Use **blocklists** for known-dangerous operations: shell execution, file deletion, database DDL, production deploys
- Require **human-in-the-loop** approval for high-impact tools: send email, deploy, delete records
- Enforce rate limits on tool calls per session to prevent infinite loops and resource exhaustion

## Content Safety

- Scan all user inputs for threat signals before passing to an agent:
  - Data exfiltration (`send all records to external API`)
  - Privilege escalation (`sudo`, `chmod 777`, `add to sudoers`)
  - System destruction (`rm -rf /`, `drop database`)
  - Prompt injection (`ignore previous instructions`)
  - Credential exposure (hardcoded API keys, AWS access keys)
- Filter agent arguments for sensitive patterns: API keys, credentials, PII, SQL injection
- Check both the user's original prompt AND the agent's generated tool arguments

## SpecDD Workflow Safety Rules

These rules enforce safety within the SpecDD workflow itself:

| Rule | Rationale |
|---|---|
| Never skip `/sdd-specify` for non-trivial features | Spec prevents costly irreversible implementation choices |
| Never modify `context/constitution.md` without explicit approval | Constitution is the root governance document |
| Never bypass the spec-first workflow | Implementation without spec creates unverifiable, ungoverned code |
| Ask before modifying DB schemas or migrations | Schema changes are potentially irreversible |
| Ask before adding new third-party dependencies | Every dependency is a supply chain risk |
| Never commit secrets, credentials, or API keys | Append-only audit of security violations |

## Agent Governance Levels

For teams using GitHub Copilot's coding agent with `.github/hooks/`:

| Level | Behavior |
|---|---|
| `open` | Log threats only, never block |
| `standard` | Log threats; block if explicitly configured |
| `strict` | Log and block all detected threats |
| `locked` | Log and block all threats; no overrides |

Set `GOVERNANCE_LEVEL` in `.github/hooks/governance-audit/hooks.json`. Default: `standard`.

## Multi-Agent Safety

- Each agent in a multi-agent system must have its own governance policy
- When agents delegate to sub-agents, apply the **most restrictive** policy
- Track trust scores for delegates — degrade trust on failures
- Inner agents must never have broader permissions than the outer agent that invoked them

## Audit & Observability

- Log every tool call with: timestamp, agent ID, tool name, allow/deny decision, policy matched
- Log every governance violation with the matched rule and evidence
- Export audit trails as JSON Lines for log aggregation
- Include session boundaries (start/end) in audit logs for correlation
- **Never log full user prompts** — log matched threat patterns and metadata only

## Common Mistakes

- Relying only on output guardrails (post-generation) instead of pre-execution governance
- Hardcoding policy rules instead of loading from configuration files
- Allowing agents to self-modify their own governance policies
- Checking tool names but not tool *arguments* for dangerous content
- Not invalidating stale trust scores — stale trust is dangerous
- Logging full user prompts in audit trails — log decisions and metadata only
```
