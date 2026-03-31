---
agent: agent
description: Create a time-boxed technical spike document to resolve genuine technical uncertainty before writing a feature spec. Run this when you don't know enough to spec or estimate a story accurately.
---

# SpecDD: Create Technical Spike

You are a senior engineer facilitating a targeted technical investigation. Help the user define and document a time-boxed spike to resolve uncertainty that would cause a spec to be inaccurate or un-estimable.

## When to Run a Spike (vs. Just Speccing)

**Run a spike when:**
- The team doesn't know enough to write accurate acceptance criteria
- An integration with an external system is unproven in this context
- A performance or scalability claim needs validation before committing to an approach
- A technology choice between 2+ options can only be resolved by trying them
- A domain concept is ambiguous enough that the spec would need major revision after implementation starts

**Do NOT run a spike when:**
- The answer can be found in documentation in under 30 minutes
- The question is "should we do X?" where X is already decided in governance or constitution
- The uncertainty is about requirements (that's `/sdd-clarify`, not a spike)

## Pre-Flight Checks

1. Read `context/constitution.md` — verify the spike is within product scope
2. Check `specs/spikes/` to find the next spike number (create the folder if it doesn't exist)
3. If a related spec exists, read it to understand the uncertainty in context

## Process

### Step 1 — Define the Question
The spike must answer **exactly one question**. If the user has multiple questions, create separate spikes.

Ask if not already stated:
- What is the single question this spike must answer?
- What would make this spike successful?
- What is the proposed timebox? (suggest: 1h / 2h / 4h / 1 day)

### Step 2 — Write the Spike Document

```markdown
# SPIKE-{NNN}: {Short Title}

**Date:** {YYYY-MM-DD}
**Timebox:** {X hours / X days}
**Owner:** {Name or team}
**Status:** Open | In Progress | Complete | Abandoned
**Related Spec:** {specs/{feature}/spec.md if applicable}

---

## Question to Answer

{One sentence. If you have more than one question, split into multiple spikes.}

## Background

{Why is this uncertain? What do we already know? What have we already tried? What would happen if we just guessed wrong?}

## Approach

{How will we investigate? What will we build, read, benchmark, or prototype?}

**Explicitly out of scope for this spike:**
- {Thing 1 we are NOT answering}
- {Thing 2 we are NOT answering}

## Timebox Budget

| Activity | Estimated Time |
|---|---|
| Setup / context reading | {X min} |
| Prototype / experiment | {X min} |
| Results write-up | {X min} |
| **Total** | **{X hrs}** |

## Success Criteria

- [ ] {Measurable criterion 1 — binary pass/fail}
- [ ] {Measurable criterion 2}

---

## Results

*Fill in after the spike completes.*

{What was found? Include actual measurements, error messages, prototype results — not just "it works".}

## Decision / Recommendation

*Fill in after the spike completes.*

{Based on findings: what should we do? If a new ADR is needed, state that here.}

## Artifacts

- {Link to prototype code branch, benchmark result file, POC repo, etc.}
```

### Step 3 — Save and Follow Up

1. Save to `specs/spikes/SPIKE-{NNN}-{slug}.md`
2. Confirm: "SPIKE-{NNN} created. Timebox: {X hrs}. Run `/sdd-specify` once the spike is complete."

## Spike Discipline

- **Stop at the timebox** — even if uncertain. Document what was found so far.
- **Don't gold-plate** — the spike deliverable is a decision, not production code
- **Update the spike file** when complete — fill in Results and Decision sections
- **Follow up** — a completed spike should directly unblock a spec (`/sdd-specify`) or an ADR (`/sdd-adr`)
