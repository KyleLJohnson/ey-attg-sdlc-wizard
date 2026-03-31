# Constitution Template

> Run `/sdd-constitution` to generate this from your project context,
> or fill in manually. See `context/constitution.md` for the live version.

---

# [PROJECT_NAME] — Project Constitution

**Version:** 1.0  
**Status:** Draft | Approved  
**Last updated:** [DATE]  
**Approved by:** [NAMES]

---

## Governance Layer

**Level:** product (Level 4 of 4)  
**Namespace:** `[ORG.BU.DOMAIN.PRODUCT]` *(remove if not in a governed BU)*  
**Inherits From:** *(remove lines that don't apply)*
- `governance/enterprise-constitution.md`
- `governance/blueprints/[bu-name]/blueprint.md`
- `governance/domain-specs/[domain-name]/domain-spec.md`

> A lower level cannot override a higher level. If any rule below conflicts with an inherited document, the inherited document wins.

---

## 1. Core Values

| Value | Principle | What It Means in Practice |
|---|---|---|
| [e.g., Quality] | [e.g., Correctness over speed] | [e.g., No feature ships without tests] |
| [e.g., Security] | [e.g., Security is not optional] | [e.g., Threat model required for auth features] |
| [e.g., Simplicity] | [e.g., Prefer boring tech] | [e.g., No new framework without tech lead approval] |

---

## 2. Architecture Principles

- **[Principle 1]:** [Description]
- **[Principle 2]:** [Description]
- **[Principle 3]:** [Description]

---

## 3. Technology Governance

**Approved languages:** [List]  
**Approved frameworks:** [List]  
**Approved cloud services:** [List]  
**Banned patterns:** [List]  

**Dependency approval process:** [Description]

---

## 4. Testing & Quality Gates

**Required coverage:** [e.g., 80% minimum on new code]  
**Required test types:** [e.g., Unit + Integration for all features; E2E for user-facing flows]  
**Definition of Done:**
- [ ] All tasks complete
- [ ] All ACs satisfied
- [ ] Tests pass
- [ ] Code reviewed
- [ ] Spec updated

---

## 5. Developer Process

**Branch naming:** [convention]  
**Commit convention:** [e.g., Conventional Commits]  
**PR policy:** [e.g., 1 approver, must reference spec, CI must pass]

---

## 6. Security & Compliance

- [ ] Never commit secrets — use environment variables
- [ ] All inputs validated server-side
- [ ] PII encrypted at rest and in transit
- [ ] [Compliance requirements: GDPR / SOC2 / HIPAA / etc.]

---

## 7. AI Agent Rules

### Always Do
- [List]

### Ask Before Doing  
- [List]

### Never Do
- [List]
