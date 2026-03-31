# Governance Audit Hook

Monitors Copilot sessions for governance policy violations. Logs all user prompts and flags messages matching predefined threat patterns.

## What It Does

On every user prompt:
1. Extracts the message from the hook payload
2. Checks against 5 threat categories using regex patterns
3. Logs findings as JSON Lines to `logs/copilot/governance/audit.log`
4. Optionally blocks the prompt if `BLOCK_ON_THREAT=true`

On session start/end: logs the event and governance level.

## Threat Categories

| Category | Score | Example Pattern |
|---|---|---|
| `data_exfiltration` | 0.80 | "dump database", "send secrets to" |
| `privilege_escalation` | 0.85 | "bypass auth", "disable security" |
| `system_destruction` | 0.92 | "drop table", "rm -rf", "wipe data" |
| `prompt_injection` | 0.75 | "ignore previous instructions" |
| `credential_exposure` | 0.90 | "api key", "private key", ".env file" |

## Configuration

Set environment variables before starting VS Code or in your shell profile:

```bash
export GOVERNANCE_LEVEL=standard   # open | standard | strict | locked
export BLOCK_ON_THREAT=false       # true to hard-block flagged prompts
export SKIP_GOVERNANCE_AUDIT=      # set to "true" to disable entirely
export LOG_DIR=logs/copilot/governance  # custom log directory
```

### Governance Levels

| Level | Behavior |
|---|---|
| `open` | Log only; no blocking |
| `standard` | Log all threats; alert on high-score threats |
| `strict` | Log + block prompt_injection and system_destruction |
| `locked` | Block any prompt matching any threat category |

## Log Format

Each entry is a JSON Line in `logs/copilot/governance/audit.log`:

```json
{"timestamp":"2024-01-15T10:23:45Z","event":"userPromptSubmitted","governance_level":"standard","threat_found":false,"threat_category":"","threat_score":0.0,"message_length":42,"action":"logged"}
```

## Setup

1. Copy this folder to `.github/hooks/governance-audit/` in your project
2. Make scripts executable: `chmod +x .github/hooks/governance-audit/*.sh`
3. Register in VS Code Copilot hooks config (when supported) or call scripts manually from CI

## Adding `logs/` to .gitignore

Add to your `.gitignore`:
```
logs/copilot/
```

Audit logs are an append-only observability artifact. Never delete or modify existing entries.
