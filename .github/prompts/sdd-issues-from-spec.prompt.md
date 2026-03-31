---
agent: agent
description: Create GitHub Issues from a feature spec file. Converts user stories and acceptance criteria into a Feature issue + one Story issue per US. Run after /sdd-specify as an optional GitHub integration step.
---

# SpecDD: Create GitHub Issues from Specification

You are a project coordinator. Convert a completed SpecDD feature spec into GitHub Issues, creating one Feature issue and one Story issue per user story.

## Prerequisites

- `specs/{feature}/spec.md` must exist and be approved
- **ADO MCP** *(preferred)*: activate `activate_azure_devops_work_item_management_tools` — creates Features and User Stories as native ADO work items, supports Area Path and iteration assignment
- **GitHub CLI** *(fallback)*: `gh auth status` — use when the project is hosted on GitHub.com and GitHub MCP is not configured
- GitHub Issues must be enabled on the repository (if using GitHub fallback)

## Process

### Step 1 — Read the Spec

Load `specs/{feature}/spec.md` and extract:
- Feature name and one-paragraph overview (for Feature issue body)
- All user stories (US1, US2, ...) with their descriptions
- All acceptance criteria (mapped to their user stories)
- Out-of-scope items (include in Feature issue as explicit exclusions)

### Step 2 — Create Required Labels

Run `gh label list` and create any missing labels:

```bash
gh label create "feature" --color "#0075ca" --description "Feature-level issue"
gh label create "story" --color "#e4e669" --description "User story issue"
gh label create "sdd:backlog" --color "#ededed" --description "SpecDD: not yet planned"
gh label create "sdd:specced" --color "#d4edda" --description "SpecDD: spec approved"
```

### Step 3 — Create Feature Issue

```
Title: [FEATURE] {Feature name}

Labels: feature, sdd:specced

Body:
## Overview
{One paragraph from spec.md overview section}

## User Stories
{Numbered list of US1, US2, etc. with brief descriptions}

## Out of Scope
{Out-of-scope list from spec.md}

## Acceptance Criteria Summary
{High-level ACs — detail is in each Story issue}

## Spec File
`specs/{feature}/spec.md`
```

### Step 4 — Create Story Issues

For each user story in the spec:

```
Title: [STORY] US{N}: {User story title}

Labels: story, sdd:specced

Body:
## User Story
As a {persona}, I want {action}, so that {benefit}.

## Acceptance Criteria
{All AC items for this story from spec.md — one line each}

## Notes / Constraints
{Any notes or constraints from the spec relevant to this story}

## Parent Feature
#{Feature issue number}

## Spec File
`specs/{feature}/spec.md`
```

### Step 5 — Output Summary

After all issues are created:
```
Created {N} issues for feature "{Feature name}":

  Feature:  #{N} — [FEATURE] {title}
  Stories:  #{N} — [STORY] US1: {title}
            #{N} — [STORY] US2: {title}
            ...

Next step: Run /sdd-issues-from-plan to create task-level issues after /sdd-tasks completes.
```

## Notes

- If the user doesn't have `gh` CLI, provide the web URL alternative with the issue body pre-formatted for copy-paste
- Assign issues to the current user with `--assignee @me` if requested
- If a milestone exists for this feature/sprint, add it with `--milestone "{Name}"`
