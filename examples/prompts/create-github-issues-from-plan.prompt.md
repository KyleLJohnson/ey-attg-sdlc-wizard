---
agent: agent
description: Create GitHub Issues from an implementation plan. Use this after /sdd-tasks to push the task breakdown into a GitHub project for sprint planning, assignment, and tracking.
tools:
  - web/githubRepo
---

# Create GitHub Issues from Implementation Plan

You are a project coordinator. Convert a completed SpecDD implementation plan and task list into GitHub Issues, organized using the Epic > Feature > Story hierarchy.

## Prerequisites

Before running this prompt:
- `/sdd-tasks` must be complete — `specs/{feature}/tasks.md` must exist
- The user must be authenticated with GitHub (`gh auth status`)
- The repository must have GitHub Issues enabled

## Process

1. **Read the task file** — Load `specs/{feature}/tasks.md` and parse all tasks (T001, T002, etc.) and their priorities (P = pink/critical, B = blue/medium, G = green/low).

2. **Read the spec** — Load `specs/{feature}/spec.md` to extract user stories (US1, US2, etc.) and acceptance criteria.

3. **Create a Feature Issue** — One parent issue that describes the feature as a whole. Label it `feature`.

4. **Create Story Issues** — One issue per user story from the spec. Label them `story`. Reference the Feature issue.

5. **Create Task Issues** — One issue per task from tasks.md. Label them `task` and apply priority labels. Reference the parent Story issue.

6. **Report** — Output a summary table of all created issues with their numbers and URLs.

## Issue Templates

### Feature Issue
```
Title: [FEATURE] {Feature name from spec}

## Description
{One paragraph from spec.md overview section}

## Acceptance Criteria
{From spec.md acceptance criteria section}

## User Stories
{List of US1, US2, etc. with brief descriptions}

## Implementation Plan
Spec: specs/{feature}/spec.md
Plan: specs/{feature}/plan.md
Tasks: specs/{feature}/tasks.md
```

### Story Issue  
```
Title: [STORY] US{N}: {User story title}

## User Story
{As a [persona], I want [action], so that [benefit]}

## Acceptance Criteria
{AC items from spec for this story}

Parent: #{Feature issue number}
```

### Task Issue
```
Title: [TASK] T{NNN}: {Task description}

## Task
{Task description from tasks.md}

Priority: {P1-Critical|P2-High|P3-Medium} 
Story: #{Story issue number}
File: {file path from task}
```

## Labels to Create (if missing)

Run `gh label create` for any of these that don't exist:
- `feature` (color: #0075ca)
- `story` (color: #e4e669)  
- `task` (color: #cfd3d7)
- `priority:critical` (color: #d73a4a)
- `priority:high` (color: #e99695)
- `priority:medium` (color: #f9d0c4)

## After Creating Issues

Output a summary:
```
Created {N} issues:
  Feature: #{N} - {title} 
  Stories: #{N}, #{N}, ...
  Tasks:   #{N} through #{N}

Sprint planning URL: {repo}/projects
```
