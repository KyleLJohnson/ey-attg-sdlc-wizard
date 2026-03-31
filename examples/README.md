# Examples — Reference Library

This folder contains reusable prompts and instructions that are **not part of the core SpecDD workflow** but may be useful for specific situations.

## Why This Exists

The core SpecDD kit is intentionally focused: `specify → plan → tasks → implement`.
This folder holds everything else — things you might want occasionally, but not on every project.

## Structure

```
examples/
  prompts/
    catalog.md                         ← Full list with source links
    create-architectural-decision-record.prompt.md
    create-technical-spike.prompt.md
    create-github-issues-from-plan.prompt.md
    context-map.prompt.md
    refactor-plan.prompt.md
    what-context-needed.prompt.md
  instructions/
    catalog.md                         ← Full list with source links
    spec-driven-workflow-v1.instructions.md
    agent-safety.instructions.md
    no-heredoc.instructions.md
```

## When to Use

| Situation | Relevant Example |
|---|---|
| You need to document an architecture decision | `prompts/create-architectural-decision-record.prompt.md` |
| You need to research an unknown before speccing | `prompts/create-technical-spike.prompt.md` |
| You want to map bounded contexts before domain spec | `prompts/context-map.prompt.md` |
| You want to create GitHub Issues from your tasks | `prompts/create-github-issues-from-plan.prompt.md` |
| You need to plan a multi-file refactor safely | `prompts/refactor-plan.prompt.md` |
| You want Copilot to declare what files it needs first | `prompts/what-context-needed.prompt.md` |
| You want a simpler alternative to the full SpecDD kit | `instructions/spec-driven-workflow-v1.instructions.md` |
| You need AI safety guardrails for autonomous agents | `instructions/agent-safety.instructions.md` |
| You need to prevent heredoc file corruption in VS Code | `instructions/no-heredoc.instructions.md` |

## Source

Most examples are adapted from [github/awesome-copilot](https://github.com/github/awesome-copilot) — a community-maintained collection with 22k+ stars. See each file's frontmatter for the original source URL.

## Promoting to Active

To move an example into the active SpecDD workflow, copy it to `.github/prompts/` or `.github/instructions/` and register it in `.github/copilot-instructions.md`.
