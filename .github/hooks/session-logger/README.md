# Session Logger Hook

Logs Copilot session lifecycle events and prompt activity to JSON Lines log files. Useful for auditing usage, tracking session duration, and measuring prompt frequency.

## What It Logs

### `logs/copilot/session.log`
Records session start and end events:
```json
{"timestamp":"2024-01-15T09:00:00Z","event":"sessionStart","cwd":"/workspace"}
{"timestamp":"2024-01-15T10:30:00Z","event":"sessionEnd","cwd":"/workspace"}
```

### `logs/copilot/prompts.log`
Records each submitted prompt (metadata only — NOT the content):
```json
{"timestamp":"2024-01-15T09:05:12Z","event":"userPromptSubmitted","message_length":142}
```

> **Privacy note:** This logger records only message length, not message content. For content-level governance monitoring, use the `governance-audit` hook instead.

## Setup

1. Copy this folder to `.github/hooks/session-logger/` in your project
2. Make scripts executable: `chmod +x .github/hooks/session-logger/*.sh`
3. Register in VS Code Copilot hooks config (when supported) or call scripts manually

## Configuration

```bash
export LOG_DIR=logs/copilot    # default; customize as needed
```

## Add to .gitignore

```
logs/copilot/
```

## Combining with Governance Audit

For comprehensive observability, run both hooks together:
- `session-logger` — captures session lifecycle and prompt frequency
- `governance-audit` — captures threat patterns from prompt content

The two hooks write to separate log files and do not conflict.
