# Technical Plan: [Feature Name]

**Spec ID:** [NNN]  
**Status:** Draft | Ready for Review | Approved | Superseded  
**Author:** [Name]  
**Reviewer:** [Name]  
**Created:** [DATE]  
**Updated:** [DATE]  
**Linked spec:** `specs/[NNN]-[feature-name]/spec.md`

---

## Output Documents (this feature)

```
specs/[NNN]-[feature-name]/
├── plan.md          ← This file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output (if applicable)
├── quickstart.md    ← Phase 1 output (key validation scenarios)
├── contracts/       ← Phase 1 output (API/interface contracts)
└── tasks.md         ← Created by /sdd-tasks, not by /sdd-plan
```

---

## Constitution Check

*Gate: Must pass before proceeding to implementation phases. Re-check after design.*

| Principle | Status | Notes |
|---|---|---|
| [Constitution principle 1] | ✅ Compliant / ⚠️ Violation | [Notes] |
| [Constitution principle 2] | ✅ Compliant / ⚠️ Violation | [Notes] |

> If violations exist, either adjust the plan to comply, or document in **Complexity Tracking** below with explicit justification.

---

## Architecture Overview

[2–3 sentences: where this feature fits in the system and the key technical approach]

---

## System Diagram

```
[ASCII or mermaid diagram showing components and data flow]
```

---

## Technology Selections

| Concern | Selected Technology | Rationale |
|---|---|---|
| [e.g., API layer] | [e.g., REST / GraphQL] | [Reason] |
| [e.g., Data store] | [e.g., PostgreSQL] | [Reason] |
| [e.g., Caching] | [e.g., Redis] | [Reason] |

---

## Component Breakdown

| Component | Responsibility | New / Modified |
|---|---|---|
| [Component 1] | [What it does] | New |
| [Component 2] | [What changes] | Modified |

---

## Data Model Changes

See `data-model.md` for full schema. Summary:
- **New tables:** [list]
- **Modified tables:** [list]
- **Migrations required:** Yes / No

---

## API Design

See `contracts/` directory for full specs. Summary:
- **New endpoints:** [list]
- **Modified endpoints:** [list]
- **Breaking changes:** Yes / No
- **Events/webhooks:** [list or N/A]

---

## Integration Points

| System | Integration Type | Notes |
|---|---|---|
| [System 1] | [REST / Event / DB] | [Key constraint] |

---

## State Management

[How application state is managed for this feature — client and/or server side]

---

## Error Handling

| Error Scenario | Handling Strategy | User Message |
|---|---|---|
| [Scenario 1] | [e.g., Alert + retry] | [Message text] |
| [Scenario 2] | [e.g., Log + fallback] | [Message text] |

---

## Security Considerations

- **Authentication:** [How authn is handled]
- **Authorization:** [Permission checks required]
- **Input validation:** [Validation strategy]
- **Sensitive data:** [What's sensitive and how it's protected]

---

## Performance Considerations

- **Indexing:** [What indexes are added / needed]
- **Caching:** [What is cached, TTL, invalidation strategy]
- **Pagination:** [Strategy for large results]
- **Async operations:** [What is deferred / queued]

---

## Testing Strategy

| Test Type | Coverage Target | Tooling |
|---|---|---|
| Unit | [e.g., All service functions] | [e.g., Jest / pytest] |
| Integration | [e.g., All API endpoints] | [e.g., Supertest] |
| E2E | [e.g., Happy path journeys] | [e.g., Playwright] |

---

## Deployment & Rollout

- **Migration strategy:** [Forward-only / reversible]
- **Feature flags:** [Yes / No — flag name]
- **Rollback plan:** [Steps to revert]
- **Monitoring alerts:** [What to watch after deploy]

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| [Risk 1] | Low/Med/High | Low/Med/High | [Mitigation] |

---

## Complexity Tracking

> Fill ONLY if the Constitution Check has violations that require justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| [e.g., banned library X] | [specific need] | [why compliant alternative is insufficient] |

---

## Definition of Done

- [ ] All tasks in `tasks.md` marked complete
- [ ] All acceptance criteria in `spec.md` verified
- [ ] All tests pass, coverage target met
- [ ] Code reviewed and approved
- [ ] `spec.md` status updated to "Implemented"

---

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | [DATE] | [Name] | Initial draft |
