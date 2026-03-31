# Enterprise Constitution

<!--
  GOVERNANCE METADATA
  Level:       enterprise
  Owner:       [ENTERPRISE_ARCHITECTURE_TEAM]
  Version:     [VERSION]
  Last updated: [DATE]
  Approved by: [APPROVER]
  
  HOW TO USE:
  1. Copy this file from your enterprise governance repository and replace this placeholder.
  2. Or use /sdd-blueprint with scope "enterprise" to generate content from scratch.
  3. Product teams must NOT modify this file — raise a governance change request instead.
-->

---

## Status

`PLACEHOLDER` — Replace with your organization's enterprise governance document.

---

## 1. Organization-Wide Standards

- **Cloud Platform:** [e.g., Azure-first. All workloads must run on approved Azure services.]
- **Identity & Access:** [e.g., All authentication via enterprise SSO. No local service accounts in production.]
- **Data Residency:** [e.g., Production data must remain within approved geographic regions.]
- **Security Baseline:** [e.g., ISO 27001 / SOC 2 Type II compliance required for all production systems.]

---

## 2. Compliance Requirements

- **Regulatory:** [e.g., GDPR, CCPA, SOX — list what applies to your organization]
- **Audit Trail:** [e.g., All production deployments must be logged and auditable for 7 years]
- **Data Classification:** [Define PII, Confidential, Internal, Public tiers and handling rules]

---

## 3. Approved Cloud Services

| Category | Approved Services | Notes |
|---|---|---|
| Compute | [e.g., Azure Functions, AKS, App Service] | |
| Storage | [e.g., Azure Blob, Azure SQL, Cosmos DB] | |
| Messaging | [e.g., Azure Service Bus, Event Hub] | |
| AI/ML | [e.g., Azure OpenAI, Azure AI Services] | |
| Networking | [e.g., Azure Front Door, APIM, Private Link] | |

---

## 4. Banned Practices (Enterprise-Wide)

- [ ] [e.g., No self-managed infrastructure outside approved IaC patterns]
- [ ] [e.g., No direct production database access — managed identities only]
- [ ] [e.g., No unapproved third-party AI services that process enterprise or client data]
- [ ] [e.g., No secrets in source code or environment variables — use Key Vault]

---

## 5. AI Agent Rules (Enterprise)

- All AI-generated code must be reviewed by a human before merging to main
- AI agents must not access production systems or live data
- Prompts containing client data must be handled per data classification policy
