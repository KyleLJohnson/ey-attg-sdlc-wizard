---
applyTo: "**"
---
# MCP Tools — SpecDD Workflow Integration

MCP (Model Context Protocol) servers extend the AI agent with live, tool-based access to real systems. Use them during the SpecDD workflow to pull real context into specs and push outputs to real systems rather than generating placeholder text.

## Available MCP Servers

### Azure DevOps MCP (ADO)
Connects the agent to Azure DevOps: work items, boards, PRs, pipelines, repos, wikis, test plans, and team capacity.

**Activate with:** `activate_azure_devops_work_item_management_tools`, `activate_pull_request_management_tools`, `activate_azure_devops_pipeline_management_tools`, `activate_azure_devops_project_management_tools`

| SpecDD Phase | How to use |
|---|---|
| `/sdd-specify` | Query backlog items for related user stories; surface existing work that constrains the spec |
| `/sdd-tasks` | Map `T001 [US1]` tasks to ADO User Story IDs; set parent/child links |
| `/sdd-issues-from-spec` | Create ADO Features + User Stories instead of GitHub Issues |
| `/sdd-issues-from-plan` | Create ADO Tasks linked to User Stories; set iterations from sprint plan |
| `/sdd-issues-unmet` | Query ADO for existing items before creating duplicates |
| `/sdd-implement` | Update work item State (`Active → Resolved`) as tasks complete; create PRs via ADO |
| `/sdd-adr` | Link ADR to relevant ADO Epic or Feature item |
| `/sdd-context-map` | Save context map as an ADO Wiki page |

**Tip:** Prefer ADO MCP over `gh` CLI when the project is hosted on Azure DevOps. The `sdd-issues-from-*` prompts will detect which is available.

---

### Figma MCP
Connects the agent to Figma: design node context, code connect mappings, FigJam diagram generation, and design system rules.

**Activate with:** `mcp_com_figma_mcp_get_design_context`, `mcp_com_figma_mcp_get_figjam`, `mcp_com_figma_mcp_generate_diagram`

| SpecDD Phase | How to use |
|---|---|
| `/sdd-specify` | Pull a Figma frame URL to extract layout, component names, and UX flows as AC context. Ask: "Here is the Figma design: [URL]. Extract user flows and acceptance criteria." |
| `/sdd-context-map` | Generate the bounded-context Mermaid diagram as a FigJam board. Provide the Figma file key. |
| `/sdd-implement` | Use `get_design_context` on a Figma node to generate component code that matches the design. Use `add_code_connect_map` to register the mapping. |
| `/sdd-checklist` | Compare implemented UI against Figma design node as a visual QA step |

**Required:** Provide the Figma file key (from the URL: `figma.com/design/{FILE_KEY}/...`) and node IDs when invoking these commands.

---

### Motif MCP (EY Design System)
Connects the agent to the Motif Web Components design system: component API docs, design tokens, usage examples, breaking changes, and quality scoring.

**Activate with:** `activate_motif_component_documentation_and_management`, `activate_motif_design_guidance_and_setup`, `activate_frontend_framework_detection_and_examples`

| SpecDD Phase | How to use |
|---|---|
| `/sdd-specify` | List available Motif components that cover the UI requirements; include component names as implementation constraints in the spec |
| `/sdd-plan` | Detect frontend framework → get Motif usage examples for that framework; list design tokens for spacing/color |
| `/sdd-implement` | Fetch component API docs (props, events, slots) before generating code; validate against current Motif version |
| `/sdd-checklist` | Run `motif_evaluate_usage_quality` on generated code; target score ≥ 80 before approving |
| `/sdd-adr` | Check `motif_get_breaking_changes` before recording a decision to upgrade Motif versions |

**EY projects only.** If not using the Motif design system, this MCP is not applicable.

---

### PostgreSQL MCP
Connects the agent to PostgreSQL databases: schema introspection, read-only queries, schema modifications, CSV bulk load, and Oracle migration tooling.

**Activate with:** `activate_pgsql_connection_management`, `activate_pgsql_schema_management`

| SpecDD Phase | How to use |
|---|---|
| `/sdd-specify` | For data-heavy features: introspect existing schema to inform entity definitions. Ask: "Connect to [server] and describe the relevant tables." |
| `/sdd-plan` | Validate proposed data model against existing schema; identify migration scope |
| `/sdd-implement` | Run test queries to validate migrations; use `pgsql_bulk_load_csv` for test data seeding |
| `/sdd-spike` | Use a spike to prototype a query or migration before committing to the plan |

**Important:** Use `pgsql_query` (read-only) during spec/plan phases. Only use `pgsql_modify` with explicit user confirmation — it is a destructive operation.

---

### SonarQube MCP *(configure if available)*
Connects the agent to SonarQube/SonarCloud for code quality, security hotspots, coverage, and technical debt.

> **Status:** Not natively registered in this workspace. To enable, add the SonarQube MCP server to your `.vscode/mcp.json` or equivalent config.

| SpecDD Phase | How to use |
|---|---|
| `/sdd-checklist` | Pull quality gate status; fail the checklist if coverage < threshold or security hotspots exist |
| `/sdd-implement` | After each task batch, run a quality gate check and fix issues before marking tasks done |
| `/sdd-adr` | Record technical debt decisions with SonarQube debt metrics as supporting evidence |

---

### GitHub MCP *(configure if using GitHub.com)*
Connects the agent to GitHub Issues, PRs, milestones, releases, and Discussions — for projects hosted on GitHub rather than Azure DevOps.

> **Status:** Not natively registered in this workspace. To enable, add the GitHub MCP server to your `.vscode/mcp.json` or equivalent config.

| SpecDD Phase | How to use |
|---|---|
| `/sdd-issues-from-spec` | Prefer GitHub MCP over `gh` CLI when available — no authentication prompts |
| `/sdd-issues-from-plan` | Create issues with label and milestone assignment via MCP |
| `/sdd-issues-unmet` | Query open issues to avoid duplicates before creating gap issues |
| `/sdd-implement` | Create draft PRs and add review comments via MCP |

---

## MCP Decision Flow

When starting a new feature, determine which MCPs to activate:

```
Is the project hosted on Azure DevOps?
  → Yes: activate ADO MCP (use for all work item + PR operations)
  → No (GitHub): configure GitHub MCP

Does the spec have associated Figma designs?
  → Yes: activate Figma MCP before /sdd-specify

Is this an EY project using Motif components?
  → Yes: activate Motif MCP before /sdd-plan

Does the feature touch a database?
  → Yes: activate PostgreSQL MCP before /sdd-plan; ask before /sdd-implement modifies

Is code quality gating required?
  → Yes: configure SonarQube MCP; use in /sdd-checklist
```

## Fallback Rule

If an MCP server is not available or not configured, fall back to the non-MCP approach defined in each prompt (e.g., `gh` CLI for GitHub Issues, manual Figma review, direct file reads for schema). MCP enriches the workflow but is never a hard dependency.

## Configuring MCP Servers

Add to `.vscode/mcp.json` in this workspace (create if it doesn't exist):

```json
{
  "servers": {
    "sonarqube": {
      "command": "npx",
      "args": ["-y", "@sonarsource/mcp-server-sonarqube"],
      "env": {
        "SONAR_TOKEN": "${env:SONAR_TOKEN}",
        "SONAR_HOST_URL": "https://sonarcloud.io"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

ADO, Figma, and Motif MCP servers are registered at the VS Code / agent level — no `.vscode/mcp.json` entry required.
