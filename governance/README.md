# Governance Hierarchy

> This folder holds cross-team governance documents that all product specs **inherit from**.  
> These files are **read-only context** for AI agents — never modified per-feature.

---

## The Four-Level Model

```
Level 1 — Enterprise Constitution        governance/enterprise-constitution.md
           Non-negotiable org-wide rules  (provided by Enterprise Architecture)
                │
                ▼
Level 2 — Blueprint                      governance/blueprints/[bu-name]/blueprint.md
           BU reference architectures     (generated with /sdd-blueprint)
           and approved service catalog
                │
                ▼
Level 3 — Domain Specification           governance/domain-specs/[domain-name]/domain-spec.md
           Namespace, shared models,      (generated with /sdd-domain-spec)
           domain constraints
                │
                ▼
Level 4 — Product Constitution           context/constitution.md
           Product-specific principles    (generated with /sdd-constitution)
           and team agreements
```

**Override rule:** A lower level cannot override a higher level. Conflicts resolve in favor of the higher-level document.

---

## How to Populate This Folder

| Level | File | Who Provides It | How |
|---|---|---|---|
| Enterprise | `enterprise-constitution.md` | Enterprise Architecture team | Copy from your org's governance repo |
| Blueprint | `blueprints/[bu-name]/blueprint.md` | BU Architecture Council | Run `/sdd-blueprint` |
| Domain | `domain-specs/[domain-name]/domain-spec.md` | Domain Architects | Run `/sdd-domain-spec` |
| Product | `context/constitution.md` | Product team | Run `/sdd-constitution` |

---

## How AI Agents Load Governance Context

When working on a product feature, reference governance in priority order:

```
#file:governance/enterprise-constitution.md
#file:governance/blueprints/[bu-name]/blueprint.md
#file:governance/domain-specs/[domain-name]/domain-spec.md
#file:context/constitution.md
```

Only include the levels that exist for your project. A solo team project may only need Level 4.

---

## Naming Conventions

```
governance/
├── enterprise-constitution.md
├── blueprints/
│   └── [bu-name]/
│       └── blueprint.md           ← e.g., blueprints/attg/blueprint.md
└── domain-specs/
    └── [domain-name]/
        └── domain-spec.md         ← e.g., domain-specs/tax/domain-spec.md
```

BU and domain folder names should be lowercase, hyphenated, and match the namespace segment.  
`EY.ATTG.TAX` → `blueprints/attg/` + `domain-specs/tax/`
