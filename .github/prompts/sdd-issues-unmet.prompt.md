---
agent: agent
description: Audit the codebase against the spec and create GitHub Issues for any acceptance criteria that have not been implemented. Run at any point after implementation has started to find gaps.
---

# SpecDD: Create Issues for Unmet Spec Requirements

You are a quality engineer performing a spec compliance audit. Compare the current codebase against the feature specification and create GitHub Issues for any acceptance criteria that are not yet implemented.

## Prerequisites

- `specs/{feature}/spec.md` must exist with acceptance criteria
- Some or all implementation must be done (otherwise all ACs will be unmet — run this after at least one iteration)
- User must be authenticated: `gh auth status`

## Process

### Step 1 — Load the Spec

Read `specs/{feature}/spec.md` and extract **every acceptance criterion**, grouped by user story. Number them for tracking:

```
US1:
  AC1.1: {criterion text}
  AC1.2: {criterion text}
US2:
  AC2.1: {criterion text}
```

### Step 2 — Audit the Codebase

For each acceptance criterion, determine if it is:

- **✅ Implemented** — Criterion is clearly met by existing code. List the key files/functions.
- **⚠️ Partial** — Some aspect is implemented but not the full criterion. Describe what's missing.
- **❌ Not implemented** — No evidence of implementation.
- **❓ Unclear** — Cannot determine from code alone (may require runtime test).

Search strategy:
- Read `specs/{feature}/tasks.md` to see which tasks are checked off
- Search source files for keywords related to each AC
- Look for test files that validate the AC

### Step 3 — Generate Gap Report

Produce a summary before creating issues:

```
Spec Compliance Report — {Feature Name}
Date: {YYYY-MM-DD}

Total ACs: {N}
✅ Implemented: {N} ({N}%)
⚠️ Partial: {N}
❌ Not implemented: {N}
❓ Unclear: {N}

Gaps:
  AC1.2: {partial — missing X}
  AC2.1: {not implemented}
  AC2.3: {unclear — needs runtime test}
```

Ask the user to confirm they want to create issues for the identified gaps before proceeding.

### Step 4 — Create Issues for Gaps

For each unmet or partial AC:

```
Title: [GAP] {Feature name}: AC{N.N} — {short description of what's missing}

Labels: bug (for regressions), task (for unimplemented features), sdd:backlog

Body:
## Unmet Acceptance Criterion

**Spec:** `specs/{feature}/spec.md`
**Criterion:** AC{N.N} under US{N}

> "{Full text of the acceptance criterion}"

## Current State
{Partial: describe what exists and what's missing}
{Not implemented: "No implementation found"}

## What Needs to Be Done
{Specific description of what code needs to be added or changed}

## Relevant Files
{List any files that partially address this or where implementation should go}

## Related Story Issue
#{Story issue number if it exists}
```

### Step 5 — Output Summary

```
Gap audit complete for "{Feature name}":

Compliance: {N}/{total} ACs met ({N}%)

Created {N} gap issues:
  #{N} — [GAP] AC1.2: {title}
  #{N} — [GAP] AC2.1: {title}

Recommendation: Run /sdd-implement targeting these gaps, or plan them into the next sprint.
```

## Notes

- This is most valuable **mid-sprint** (after partial implementation) and **pre-release** (final compliance check)
- "Unclear" items should be flagged but not turned into issues — they need a human decision first
- If the spec has changed since implementation started, state that conflicts in the gap report
