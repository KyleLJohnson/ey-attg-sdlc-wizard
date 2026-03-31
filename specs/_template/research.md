# Research Notes: [Feature Name]

<!--
  Feature: [NNN]-[feature-slug]
  Used during: /sdd-specify and /sdd-plan phases
  Last updated: [DATE]
-->

---

## Purpose

This file captures research performed during spec and plan creation:
- Existing code analysis (brownfield context)
- External API or library investigation
- UX/competitor research
- Technical feasibility findings
- Performance benchmarking

---

## Existing Codebase Analysis

### Relevant Existing Components

| Component | Location | Relevance |
|---|---|---|
| [Component name] | `[path/to/file.ts]` | [How it relates to this feature] |

### Existing Patterns to Follow

```
[Code pattern or convention found in the codebase that this feature should match]
```

### Integration Constraints Found

- [e.g., Existing User service returns paginated results — new code must handle same format]
- [e.g., All database access goes through Repository layer — do not call DB directly]

---

## External API / Library Research

### [API / Library Name]
- **Purpose:** [Why it's being considered]
- **Documentation:** [Link]
- **Version evaluated:** [version]
- **License:** [MIT / Apache / proprietary]
- **Findings:** [Key capabilities, limitations, integration complexity]
- **Decision:** Use / Don't use / Evaluate further

---

## UX / Product Research

### Competitor / Reference Examples
- [Product X]: [How they solve this problem — URL if available]
- [Product Y]: [Key UX pattern observed]

### User Research Findings
- [Any user feedback, analytics data, or research that informs this spec]

---

## Performance Research

### Baseline Measurements
| Metric | Current Value | Target |
|---|---|---|
| [e.g., Page load time] | [current] | [target] |
| [e.g., DB query time] | [current] | [target] |

### Benchmarks / References
- [Any perf benchmarks for proposed libraries or approaches]

---

## Security Research

- [CVEs or known issues with libraries being considered]
- [Security model research for authentication/authorization approach]
- [Compliance requirement analysis]

---

## Open Items for Follow-Up

| Item | Owner | Due | Status |
|---|---|---|---|
| [Investigation needed] | [Person] | [Date] | Open |
