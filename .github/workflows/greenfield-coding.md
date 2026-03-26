---
description: "Greenfield Coding: implement the MVP based on the plan produced by the Greenfield Planning workflow."
on:
  push:
    branches: [main]
    paths:
      - 'docs/plan.md'
  pull_request:
    types: [closed]
    branches: [main]
permissions:
  contents: read
  pull-requests: read
  issues: read
  actions: read
tools:
  github:
    toolsets: [repos, issues, pull_requests, actions]
safe-outputs:
  create-pull-request:
    max: 1
  add-comment:
    max: 3
  create-issue:
    max: 1
  noop:
    max: 1
---

# Greenfield Coding

You are the **coding agent**. Your job is to implement the MVP described in `docs/plan.md` (committed by the planning workflow).

This workflow is triggered in two ways:
- **Normal run**: `docs/plan.md` is pushed to `main` — i.e., after a human reviews and merges the Planning PR.
- **Re-run after feedback**: An implementation PR (whose branch starts with `copilot/implement-`) was closed without merging — i.e., a human rejected the implementation with comments.

## Goal
Implement production-quality code based on the plan, incorporating any feedback from a previously closed implementation PR.

## Tasks

Determine which trigger fired:

### Triggered by push (normal run)
1. Find `docs/plan.md` in this repository:
   - First check the default branch; if it is not there, use GitHub MCP tools (`list_pull_requests`, `get_file_contents`) to find the most recent open PR from the planning workflow and read `docs/plan.md` from that PR's branch.
2. Scaffold and implement the project described in the plan.
3. Ensure:
   - A clear README explaining how to run, test, and use the app.
   - A sensible project structure that matches the architecture in the plan.
   - All configuration and dependencies are documented.
4. Use `create-pull-request` to open a PR with the full implementation. **Always use a branch name starting with `copilot/implement-`** (e.g., `copilot/implement-{project-name}-{short-hash}`).

### Triggered by a closed implementation PR (not merged)
The `pull-request-number` is set in context. A human reviewed and closed the implementation PR with feedback rather than merging it.
1. Use the GitHub MCP `get_pull_request` tool to get details of PR #`{pull-request-number}`.
2. Use the GitHub MCP `list_pull_request_comments` tool to read all comments on the PR.
3. Read the code files from the closed PR's branch using `get_file_contents` to understand the prior implementation.
4. Read `docs/plan.md` from `main` for the current plan.
5. Identify what changes are needed based on the feedback.
6. Implement a revised version that addresses all feedback.
7. Use `create-pull-request` to open a **new** PR with the revised implementation. **Use a branch name starting with `copilot/implement-`**.

## Safe outputs
- Use `create-pull-request` to open a single PR with the full implementation when ready.
- Use `add-comment` to leave notes on an existing PR if needed.
- Use `create-issue` if requirements are missing or unclear.

**Important**: `docs/plan.md` is read-only — never include it in any PR you create. Modifying it would re-trigger this workflow when merged.

If nothing needs to be changed, call `noop` with the reason.
