---
agent: agent
description: Create GitHub Issues from a completed task list. Converts T001/T002/... tasks into individual GitHub Issues linked to their parent story issues. Run after /sdd-tasks as an optional GitHub integration step.
---

# SpecDD: Create GitHub Issues from Task List

You are a project coordinator. Convert a completed SpecDD task list into GitHub Issues, creating one Task issue per task and linking them to existing Story issues.

## Prerequisites

- `specs/{feature}/tasks.md` must exist (run `/sdd-tasks` first)
- Story issues must already exist (run `/sdd-issues-from-spec` first, or create them manually)
- **ADO MCP** *(preferred)*: activate `activate_azure_devops_work_item_management_tools` — no CLI auth required, supports parent/child work item links, sprint assignment, and Area Path mapping
- **GitHub CLI** *(fallback)*: `gh auth status` — use when the project is hosted on GitHub.com and GitHub MCP is not configured

## Process

### Step 1 — Read the Task List

Load `specs/{feature}/tasks.md` and parse all tasks:
- Task ID (`T001`, `T002`, ...)
- Priority marker (`[P]` = parallelizable)
- User story reference (`[US1]`, `[US2]`, ... or none for setup/foundation tasks)
- Description
- File path (if present)

Also load `specs/{feature}/spec.md` to get the user stories for cross-referencing.

### Step 2 — Map Stories to Existing Issues

Ask the user (or auto-detect via `gh issue list`):
- What are the GitHub Issue numbers for the existing Story issues?
- Map US1 → #{issue number}, US2 → #{issue number}, etc.

### Step 3 — Create Required Labels

```bash
gh label create "task" --color "#cfd3d7" --description "Implementation task"
gh label create "priority:critical" --color "#d73a4a" --description "Must complete this sprint"
gh label create "priority:high" --color "#e99695" --description "High priority"
gh label create "priority:medium" --color "#f9d0c4" --description "Medium priority"
gh label create "priority:low" --color "#d4edda" --description "Low priority"
gh label create "sdd:in-progress" --color "#0075ca" --description "SpecDD: currently being implemented"
gh label create "sdd:done" --color "#28a745" --description "SpecDD: implementation complete"
```

### Step 4 — Create Task Issues

For each task in tasks.md:

```
Title: [TASK] T{NNN}: {task description}

Labels: task, priority:{level}

Body:
## Task
{Full task description from tasks.md}

## File(s)
`{file path from task, if specified}`

## Parallelizable
{Yes — can be worked independently / No — depends on prior tasks}

## Parent Story
#{Story issue number for this task's [USB] reference}
#{If no user story reference (setup/foundation tasks): link to Feature issue}

## Spec Context
`specs/{feature}/spec.md` — `specs/{feature}/tasks.md`
```

Priority mapping from task markers:
- `[P1]` or explicit critical marker → `priority:critical`
- `[P2]` → `priority:high`
- `[P3]` → `priority:medium`
- No priority marker → `priority:medium` (default)

### Step 5 — Output Summary

```
Created {N} task issues for feature "{Feature name}":

  T001: #{N} — {title} (priority:high, linked to US1 #{N})
  T002: #{N} — {title} (priority:medium, linked to US1 #{N})
  T003: #{N} — {title} (priority:high, linked to US2 #{N})
  ...

Sprint planning: {repo}/projects
Next step: Run /sdd-implement to begin implementation.
```

## Notes

- Tasks in the **Setup** or **Foundational** phase (no US reference) link to the Feature issue
- If `gh` CLI is unavailable, output all issue bodies as formatted markdown blocks for manual creation
- To work in a GitHub Project board, add `--project "{Project Name}"` to each `gh issue create` command
