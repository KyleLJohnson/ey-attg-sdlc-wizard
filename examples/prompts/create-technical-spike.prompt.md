---
agent: agent
description: Create a time-boxed technical spike document. Use this before speccing a feature when there is genuine technical uncertainty — unknown unknowns that would cause the spec to be inaccurate.
---

# Create Technical Spike Document

You are a senior engineer facilitating a technical investigation. Help the user define and document a time-boxed spike to resolve technical uncertainty before writing a feature specification.

## When to Use a Spike

A spike is appropriate when:
- The team doesn't know enough to estimate a story
- An approach needs proof-of-concept before committing to it  
- Integration with an external system is unproven
- Performance or scalability claims need validation
- A technology choice is undecided

**A spike is not appropriate when** the uncertainty can be resolved by reading documentation or asking a colleague. If it can be answered in 15 minutes, just answer it.

## Process

1. **Define the uncertainty** — What exactly is unknown? What would make this spike successful?
2. **Set the timebox** — Spikes must be time-boxed. Suggest 1, 2, or 4 hours based on scope.
3. **Define output** — What artifact will exist at the end? (code proof-of-concept, decision, benchmark result, recommendation)
4. **Create the spike document** — Save to `specs/spikes/SPIKE-{NNN}-{slug}.md`

## Spike Document Template

```markdown
# SPIKE-{NNN}: {Short Title}

**Date:** {YYYY-MM-DD}  
**Timebox:** {X hours}  
**Owner:** {Name or team}  
**Status:** Open | In Progress | Complete | Abandoned  

---

## Question to Answer

{State the single question this spike must answer. If you have more than one question, split into multiple spikes.}

## Background

{Why is this uncertain? What do we already know? What have we already tried?}

## Approach

{How will we investigate? What will we build, read, benchmark, or prototype?}

**Out of scope for this spike:**
- {Explicitly state what we are NOT answering}

## Timebox Budget

| Activity | Time |
|---|---|
| Setup / reading | {X min} |
| Prototype / experiment | {X min} |
| Write-up / decision | {X min} |
| **Total** | **{X hrs}** |

## Success Criteria

- [ ] {Measurable criterion 1}
- [ ] {Measurable criterion 2}

## Results

{Filled in after the spike. What did we find?}

## Decision / Recommendation

{Based on the findings, what should we do? Reference any ADR that results from this spike.}

## Artifacts

- {Link to prototype code, benchmark results, POC repo, etc.}
```

## Guidelines

- If the spike runs over time, stop and document what you found so far — don't let it expand
- The spike output must result in a clear decision, not just more questions
- After completing a spike, update the related spec in `specs/` to reflect the findings
