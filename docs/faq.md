# Frequently Asked Questions

---

## About SpecDD

### Q: How is SpecDD different from just writing good prompts?
A: A well-crafted one-off prompt is ad-hoc. SpecDD is a **structured process** with multiple gates, living artifacts, and explicit traceability between requirements and implementation. The spec exists as a persistent artifact that the AI references across sessions — not just a prompt you type once and discard.

### Q: Do I need to write the spec myself or does the AI?
A: The AI **generates** the spec based on your high-level input — but you **review and approve** it before it drives anything. Your role is to steer and verify; the AI does the drafting. The quality of your input to `/sdd-specify` directly determines the quality of the spec.

### Q: Is SpecDD just for big features? Isn't it overkill for small changes?
A: Yes — calibrate to size. For small, isolated bug fixes, a spec is overkill. For anything that touches multiple components, introduces new patterns, or will be maintained over time, the spec investment pays back quickly. See [greenfield-guide.md](../instructions/spec-generation/greenfield-guide.md) for sizing guidance.

### Q: Is SpecDD appropriate for all types of development work?
A: Not equally. SpecDD works best for **end-to-end or standalone feature builds** — especially in brownfield contexts with existing architecture constraints. It is less effective for:
- Scattered refactors across unrelated modules
- Incremental edits or narrow fixes that touch only 1–2 files
- Routine technical maintenance (code cleanups, deprecating old APIs)

For those cases, local AI tools (Copilot inline, Cursor edits) are faster and more precise. Reserve SpecDD for medium-to-large features where design structure, system integration, and context propagation matter.

### Q: Can I use SpecDD with an existing codebase?
A: Absolutely — it's actually where SpecDD delivers the most value, by giving the AI enough context to not inadvertently break existing patterns. See [brownfield-guide.md](../instructions/spec-generation/brownfield-guide.md) for the recommended approach.

### Q: Which teams benefit most from SpecDD?
A: Based on EPAM's production deployments, SpecDD delivers the highest ROI for:

| Team Type | Why SpecDD Helps |
|---|---|
| Teams using AI-native tooling (Copilot, Cursor, Claude Code) | Structured specs give agents reliable, non-hallucinated output |
| Leads/architects hitting the ceiling of agentic development | SpecDD provides context alignment and multi-service coordination |
| Enterprise/brownfield projects | Legacy constraints and compliance requirements need explicit encoding |
| Multi-service engineering orgs | Mismatched assumptions across services create rework; specs prevent this |
| Platform teams building shared services | Clear contracts, versioning discipline, and predictable integration patterns |

Teams doing purely isolated fixes, simple scripts, or single-file tools see less benefit.

---

## Setup & Tooling

### Q: Do I need the GitHub Spec Kit CLI?
A: No. This starter kit is self-contained — it provides all the prompt files, templates, and structure you need. The GitHub Spec Kit CLI (`specify`) is optional and provides additional automation. If you want to use it, see [SETUP.md](../SETUP.md#option-b--github-spec-kit-cli).

### Q: Which AI agents are supported?
A: GitHub Copilot is the primary target for this kit (using `.github/prompts/*.prompt.md` slash commands). The prompts work equally well with Claude Code (using `CLAUDE.md`), Cursor, Gemini CLI, and most other code-capable agents. See [README.md](../README.md#supported-ai-agents) for setup per agent.

### Q: How do I set this up for a team?
A: The entire kit is version-controlled. All team members use the same prompt files, Context, and spec templates from the repo. The `.github/copilot-instructions.md` is automatically applied to all Copilot sessions in the workspace.

### Q: Which AI model should we use for SpecDD?
A: Model intelligence directly affects output quality — and this is a **productivity decision, not just a cost choice**. More capable models (e.g., Claude Sonnet 4.5 vs. 4.0) hold context across longer implementations, detect existing code for reuse more reliably, follow constitution rules more consistently, and make stronger architectural choices. In EPAM's enterprise production deployment, upgrading from Claude Sonnet 4.0 to 4.5 cut rework time nearly in half. The economics: a more capable model costs more per token but saves exponentially more engineering hours. Using cheaper or older models often means spending the difference fixing and refactoring their output.

---

## Spec Writing

### Q: How detailed should the spec be?
A: Detailed enough that two developers would independently implement it the same way, but no more. The spec defines **what** and **why**. The plan defines **how**. Avoid specking implementation details (those belong in `plan.md`). A spec with 3–7 user stories and GIVEN/WHEN/THEN acceptance criteria is usually the right size.

### Q: What if requirements change mid-implementation?
A: Update `spec.md` first — it's the source of truth. Then update `plan.md` if the technical approach changes. Then update `tasks.md` to reflect changed/added tasks. Never implement requirements that aren't in the spec.

### Q: The AI generated a spec that misses my intent. What do I do?
A: Don't proceed to planning with a bad spec. Either:
1. Revise your input prompt and re-run `/sdd-specify` with more specific guidance
2. Edit `spec.md` directly, then commit the revised version
3. Use `/sdd-clarify` to surface and resolve the gaps

---

## Implementation

### Q: Can I run all tasks at once instead of one at a time?
A: You can, but it's not recommended for most cases. Task-by-task execution lets you catch issues early before they compound. For a small feature with simple, independent tasks, the AI can execute multiple tasks safely. For anything complex or interrelated, sequential execution with verification is much safer.

### Q: What if the AI modifies existing code I didn't want it to touch?
A: Add explicit "do not modify" constraints to your prompt, or add them to `agent-boundaries.md`. Then re-run the task. For brownfield projects, the research phase should identify which existing files must not be changed.

### Q: How do I handle a task that turns out to be much larger than expected?
A: Split it. Update `tasks.md` to replace the oversized task with 2–4 smaller sub-tasks. This is a normal part of the process — early task estimates often reveal complexity only when you start implementing.

### Q: How much time does it take to write a good constitution?
A: Writing an effective constitution is **not an entry-level task**. Expect 2–3 days of initial effort from senior engineers who understand the system's structure, team working patterns, and the reasoning behind architectural choices. Before generating the constitution, clean up any outdated `.md` files in your repo — the AI heavily weights these when drafting. Plan to continue refining the constitution through real-world use; most early revisions involve removing generated code that violated unstated rules. A constitution is a living document — it evolves as the system does and becomes more valuable over time.

### Q: Should I expect to keep all the AI-generated code?
A: No — and **60–80% retention after review is an excellent result**. Expect 20–40% of generated code to need adjustment for missed edge cases, integration issues, over-engineered patterns, or constitution violations. Code quality also varies unpredictably within a single feature — some outputs are production-ready, others have subtle issues. Treat AI output like a capable junior developer's PR: review carefully, correct where needed, and accept that human judgment remains essential.

---

## Quality & Review

### Q: How do I verify the AI actually satisfied an acceptance criterion?
A: Each task in `tasks.md` should have an explicit **acceptance test** — a command to run or a manual check to perform. After implementation, run it. If it passes, the criterion is satisfied. If not, the task isn't done yet.

### Q: Should I review every line of AI-generated code?
A: You should review all code before merging, but your focus should be on:
1. Does it satisfy the spec?
2. Does it follow the plan's technical design?
3. Does it pass the quality checklist?
You don't need to re-read obvious boilerplate line-by-line — focus your review on the critical logic.

### Q: The AI keeps violating the same rule. How do I fix this?
A: Add the rule explicitly to:
1. `context/constitution.md` (Section 7 — AI Agent Rules)
2. `.github/copilot-instructions.md` (or your agent's config)
3. `instructions/code-generation/agent-boundaries.md`
The more specific and prominent the rule, the more consistently it will be followed.

### Q: Reviewing AI-generated markdown is exhausting. Is that normal?
A: Yes — this is a real, widely-reported, and under-discussed cost of AI-assisted development. AI-generated specs and plans are grammatically correct and architecturally plausible, which makes them harder to review than code: there's no compiler to catch conceptual errors. Validating plausible-sounding text for factual and architectural accuracy requires sustained concentration that depletes faster than most teams expect.

Mitigations that help:
- Use structured review checklists to anchor attention (see [spec-quality-checklist.md](../instructions/spec-generation/spec-quality-checklist.md))
- Rotate who reviews which artifacts across team members
- Take short breaks between reviewing different artifact types (spec vs. plan vs. tasks)
- Treat it like code review — not casual reading

The cognitive load doesn't disappear with SpecDD — it shifts from *writing* to *verifying*. The net benefit is still strongly positive, but teams that underestimate review burden often abandon the process before reaping the gains.

---

## Enterprise & Team Adoption

### Q: What is "SpecFall" and how do we avoid it?
A: SpecFall is the SpecDD equivalent of Scrumerfall — installing spec-driven ceremonies without changing how people actually work together. Symptoms: specs are created but ignored in practice, product managers don't own the "What" phase, architects aren't involved in the "How" phase, specs become stale markdown that nobody reviews.

Avoid it by treating SpecDD as an **organizational capability**, not just a technical practice:
- Product team owns and approves `spec.md` (the What)
- Architects own and approve `plan.md` (the How)
- Engineers own and approve `tasks.md` (the execution)
- QA transitions from validating implementations to validating harness quality

### Q: Our feature spans multiple repositories. Where does the spec live?
A: Use architectural decomposition:
1. Create a **parent-level spec** in a shared location (or the primary repo) covering business intent, affected repositories, and integration contracts
2. Create **per-repo specs** scoped to that repository's responsibilities
3. Business context lives in the backlog (Jira / ADO); technical sub-tasks live in their respective repos

See [brownfield-guide.md](../instructions/spec-generation/brownfield-guide.md#multi-repository-brownfield-features) for the full pattern.

### Q: The AI-generated code had a bug. Was that a spec problem or a code problem?
A: Ask two questions:
1. **Was the correct behavior described in the spec?** If no — it's an Intent-to-Spec gap. Update the spec/constitution so future features capture this intent automatically.
2. **Was the spec correct but the AI diverged?** If yes — it's a Spec-to-Implementation gap. Strengthen task detail, add explicit implementation constraints, or add to `agent-boundaries.md`.

In mature SpecDD, bugs become **harness improvement opportunities** rather than just one-off code fixes.

### Q: How does SpecDD change the role of QA/testers?
A: QA transitions from "validate finished implementations" to **"validate the context harnesses that shape agent behavior"**:
- Review spec quality: are the acceptance criteria testable and complete?
- Validate that tasks correctly trace back to spec requirements
- Identify harness gaps when bugs surface (was intent captured correctly?)
- Build automated spec-to-implementation alignment checks

This is more leverage: improving the harness prevents entire classes of future bugs, rather than catching individual defects after the fact.

### Q: Is every change — even small bug fixes — supposed to go through SpecDD?
A: In early adoption: no, calibrate to size. In mature SpecDD adoption: ideally yes, because specs are the primary interface for directing AI agent execution. Directly patching code without updating the spec widens the gap, and the defect can resurface in different forms when the AI regenerates code from the unchanged spec. The goal is to make it easy to "do the right thing" at the spec level.
