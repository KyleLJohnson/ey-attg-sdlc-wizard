# EY ATTG SDLC Wizard

A browser-based wizard that generates a fully configured [Spec-Driven Development (SpecDD)](sdd-kit/docs/starter-guide.md) starter kit and publishes it directly to GitHub — no local tooling required for end users.

---

## Table of Contents

- [Architecture](#architecture)
- [Agentic Workflow](#agentic-workflow)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Updating the SDD Kit](#updating-the-sdd-kit)
- [Using the Wizard](#using-the-wizard)
- [GitHub Tokens](#github-tokens)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (static SPA)                      │
│                                                             │
│  Astro 5.x + React 18                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  9-Step Wizard (Wizard.jsx)                          │   │
│  │  Step 0  Welcome  →  Mode: Greenfield | Brownfield   │   │
│  │  Step 1  Project        name, description, personas  │   │
│  │  Step 2  Tech Stack     languages, frameworks, infra │   │
│  │  Step 3  Governance     BU, domain, levels           │   │
│  │  Step 4  Principles     constitution, architecture   │   │
│  │  Step 5  MCP Tools      tool selection               │   │
│  │  Step 6  Agent & LLM    Copilot, model choice        │   │
│  │  Step 7  Preview        rendered file browser        │   │
│  │  Step 8  Publish        GitHubPublish.jsx            │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│                  generators.js                               │
│           (120 files rendered from form data)                │
└────────────────────────┬────────────────────────────────────┘
                         │  REST  (browser → api.github.com)
                         ▼
              ┌─────────────────────┐
              │   GitHub REST API   │
              │  POST /repos        │
              │  POST /git/trees    │  multi-batch ≤85 files
              │  POST /git/commits  │  per commit (API limit)
              │  PATCH /git/refs    │
              │  PUT  /secrets/...  │  libsodium-wrappers
              │  POST /issues       │
              └─────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Fully static (no backend) | Zero infrastructure cost; deploys as a GitHub Pages site |
| Kit bundled at build time | `sdd-kit/` → `src/data/kit-files.json` (~900 KB) via `scripts/bundle-kit.js` |
| Multi-batch commit strategy | GitHub API enforces an undocumented ~114-unique-object-per-commit limit; files are split into ≤85-file batches |
| Workflow files in final commit | `.github/workflows/` files require the `workflow` PAT scope; they are pushed in a dedicated last commit so scope errors surface clearly |
| libsodium-wrappers (lazy) | Required by the GitHub Secrets API to encrypt PAT values; dynamically imported to keep the initial bundle lean |
| Single classic PAT | `ghp_` token is the only credential required — used for repo creation, push, and API operations |
| Repo analysis before PR | For brownfield targets, the full git tree is fetched before any write; files that already exist are excluded, and repos with nothing new are skipped entirely — no accidental overwrites |
| Tech-role filtering | Framework-specific instruction files are tagged frontend/backend and filtered per repo based on the repo name slug — frontend repos don't receive backend instructions and vice versa |
| Comprehensive SDLC issue | The generated issue includes every field filled in during the wizard: personas, feature spec, NFRs, full tech stack, governance, architecture principles, and agent/LLM config |

---

## Agentic Workflow

After the wizard publishes a repository, a four-agent system driven by a single workflow automates the full implementation cycle:

```
Developer creates / updates planning.md and merges PR into any branch
          │
          ▼
┌──────────────────────────────────────┐
│  mainworkflow.yml                    │  Trigger: PR merged (non-Copilot/
│  "Create multiple issues"            │           non-automation actor)
│                                      │           OR workflow_dispatch
│  Reads planning.md → creates 3       │
│  GitHub Issues labeled "copilot",    │  Guard: skips if PR was opened by
│  assigned to the Copilot agent:      │  copilot[bot] / github-actions[bot]
│                                      │  or branch starts with copilot/
│  1. "UI/UX changes"                  │
│  2. "Backend changes"                │
│  3. "Testing changes"                │
└──────┬──────────┬──────────┬─────────┘
       │          │          │
       ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ ui-ux    │ │ backend  │ │ testing      │
│ agent.md │ │ agent.md │ │ agent.md     │
│          │ │          │ │              │
│ Reads    │ │ Reads    │ │ Reads        │
│ plan.md, │ │ plan.md, │ │ plan.md,     │
│ makes FE │ │ implements│ │ writes unit  │
│ changes  │ │ FastAPI   │ │ tests for FE │
│ only     │ │ backend   │ │ and BE       │
│          │ │ only      │ │ (no app code)│
└──────────┘ └──────────┘ └──────────────┘
       \          │          /
        \         │         /
         ▼        ▼        ▼
       Each agent opens its own PR
```

### Planning agent

Before the workflow fires, a developer (or the **planning agent**) resolves a GitHub Issue into a detailed implementation plan:

```
GitHub Issue created
          │
          ▼
┌─────────────────────────────┐
│  planning.agent.md          │  Assigned to the "planningAgent" custom agent
│                             │  Reads the issue body → produces a structured
│  Output: planned/plan.md   │  plan covering frontend, backend, and database
│  (todo list for all agents) │  Opens a PR on Planning_Branch
└─────────────────────────────┘
          │  PR merged
          ▼
   mainworkflow.yml fires
```

### Agent responsibilities

| Agent | File | Scope | Source of truth |
|---|---|---|---|
| **planningAgent** | `planning.agent.md` | Creates `planned/plan.md` from a GitHub Issue | Issue body |
| **Backendagent** | `backend.agent.md` | Implements FastAPI backend — `backend/` only | `planned/plan.md` |
| **ui-uxagent** | `uiux.agent.md` | Implements frontend UI changes — `frontend/` only | `planned/plan.md` |
| **TestingAgent** | `testing.agent.md` | Writes unit tests for backend + frontend — no app code changes | `planned/plan.md` |

### `mainworkflow.yml` — issue fan-out

Trigger conditions:
- A pull request is **merged** (not just closed) by a non-automation actor whose branch does not start with `copilot/`
- Manual `workflow_dispatch`
- PRs labeled `skip-uiux-automation` are excluded

On trigger: reads `planning.md` from the target branch, ensures the `copilot` label exists, checks that `copilot` can be assigned, deduplicates against open issues, then creates (up to) three issues — **UI/UX changes**, **Backend changes**, **Testing changes** — each labeled `copilot` and assigned to the Copilot coding agent.

---

## Prerequisites

### To Deploy / Host the Wizard

| Requirement | Notes |
|---|---|
| Node.js 20+ | `node --version` to verify |
| npm 9+ | Bundled with Node.js 20 |
| Git | For cloning and pushing |
| SDD Kit source files | The `sdd-kit/` directory must be populated before building (see [Local Development](#local-development)) |
| GitHub account | Permission to create repos and enable GitHub Pages |

### For End Users (Running the Wizard)

| Requirement | Notes |
|---|---|
| GitHub account | To create / push repositories |
| Classic PAT (`ghp_...`) | Scopes: `repo` + `workflow` |
| GitHub Copilot access | Required for the Coding Agent workflows to execute |
| Modern browser | Chrome, Edge, Firefox, or Safari |

---

## Local Development

### 1. Clone the repository

```powershell
git clone https://github.com/YOUR_ORG/ey-attg-sdlc-wizard.git
cd ey-attg-sdlc-wizard
```

### 2. Populate the SDD Kit

The `sdd-kit/` directory must contain the SpecDD Starter Kit content before the first build. On Windows, run the included setup script:

```powershell
# From the default SpecDD Starter Kit location:
.\setup.ps1

# Or specify a custom path:
.\setup.ps1 -KitSource "C:\path\to\your\sdd-kit"
```

The script copies `sdd-kit/`, installs dependencies, and runs the bundler.

### 3. Install dependencies (if not run via setup.ps1)

```powershell
npm install
```

### 4. (Optional) Configure environment variables

```powershell
copy .env.example .env
```

| Variable | Purpose |
|---|---|
| `BASE_PATH` | URL sub-path. Leave as `/` for local dev. Set automatically from `GITHUB_REPOSITORY` in CI. |
| `SITE_URL` | Full hosted URL, e.g. `https://myorg.github.io` |

### 5. Start the dev server

```powershell
npm run dev
# → http://localhost:4321
```

> The `predev` hook runs `bundle-kit.js` automatically before starting the server.

### 6. Build for production

```powershell
npm run build
# Output in dist/
```

### Run tests

```powershell
npm test              # headless Playwright
npm run test:headed   # with browser window
```

---

## Deploy to GitHub Pages

### 1. Push the repository to GitHub

```powershell
git remote add origin https://github.com/YOUR_ORG/ey-attg-sdlc-wizard.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to **Settings → Pages** in your GitHub repository
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### 3. Trigger the deployment

The `.github/workflows/deploy.yml` workflow runs automatically on every push to `main`. To trigger manually:

1. Go to the **Actions** tab
2. Select **Deploy to GitHub Pages**
3. Click **Run workflow**

Your wizard will be live at:

```
https://YOUR_ORG.github.io/ey-attg-sdlc-wizard/
```

> The base path is derived automatically from the `GITHUB_REPOSITORY` environment variable — no manual configuration needed.

### Deployment pipeline summary

```
push to main
     │
     ▼
deploy.yml (GitHub Actions)
  ├── checkout
  ├── setup Node.js 20
  ├── npm install
  ├── npm run bundle-kit   ← inlines sdd-kit/ into kit-files.json
  ├── npm run build        ← Astro static build → dist/
  ├── upload-pages-artifact
  └── deploy-pages
```

---

## Updating the SDD Kit

When the SpecDD Starter Kit content changes (new templates, updated instructions, etc.):

1. Copy the updated `sdd-kit/` directory into the project root
2. Run the bundler (or let `predev`/`prebuild` do it automatically):

```powershell
npm run bundle-kit
```

3. Commit and push — the deploy workflow re-bundles and redeploys automatically:

```powershell
git add sdd-kit/ src/data/kit-files.json
git commit -m "chore: update sdd-kit to vX.Y.Z"
git push
```

> Files generated dynamically by the wizard (`context/project.md`, `context/tech-stack.md`, `context/constitution.md`, `.github/copilot-instructions.md`) are intentionally excluded from the bundle — they are always produced fresh from the form data.

---

## Using the Wizard

### Greenfield (new repository)

1. Complete all 9 wizard steps
2. On the **Publish** step, paste your **classic PAT** (`ghp_...`) and click **Connect**
3. Enter a repository name and click **Create repository & push N files**

The wizard will:
- Create the repository
- Push all kit files in multi-batch commits
- Automatically create the SDLC issue that kicks off the planning workflow

### Brownfield (existing repository)

Brownfield mode supports **up to 3 target repositories** for multi-repo projects.

1. On step 0, choose **Brownfield**
2. Complete the wizard steps with your project's existing context
3. On the **Publish** step, paste your classic PAT and click **Connect**
4. Enter **Repo 1** (required) and optionally **Repo 2** and **Repo 3** in `owner/repo` format
5. Click **Create pull request**

For each repository the wizard will, in order:

1. **Analyse the repo** — fetch its full file tree via the GitHub API and build a list of every path already present
2. **Route by path prefix** — assign files to each repo using path-prefix routing (Option A); upgraded to AI-driven routing (Option B) when 2+ repos and a feature spec are provided
3. **Filter by tech role** — strip instruction files that don't match the repo's role (frontend vs backend), inferred from the repo name slug (see table below)
4. **Skip already-present files** — any file that already exists in the repo is excluded so nothing is ever overwritten
5. **Skip the repo entirely** if no new files remain after the above filters — no branch or PR is created, and a "N files already present — no PR needed" badge is shown in the success screen instead
6. Otherwise, **open a PR** with a dynamic body that lists the actual new files by category and notes how many were skipped

The SDLC summary issue is created on Repo 1 and includes all fields filled out during the wizard (personas, feature spec, NFRs, full tech stack, governance, architecture principles, agent & LLM config).

#### Multi-repo file routing

| Strategy | When active | How it works |
|---|---|---|
| **Option A** — path-prefix | Always (default) | `src/`, `app/`, `frontend/` → Repo 2; `api/`, `server/`, `backend/` → Repo 3; shared infrastructure (`context/`, `.github/`, `sdd-kit/`) → all repos |
| **Option B** — AI-driven | 2+ repos **and** a feature spec is present | Sends the spec + file list to `gpt-4o-mini` via GitHub Models API; the model returns a per-file routing map that overrides Option A (per-file fallback to Option A when not in map) |

#### Tech-role filtering (multi-repo only)

When more than one repo is targeted, framework-specific instruction files are filtered so they only land in a repo whose purpose matches:

| Role inferred from repo name | Kept | Removed |
|---|---|---|
| **Frontend** — slug contains `frontend`, `fe-`, `ui`, `web`, `client`, `react`, `angular`, `next`, `portal`, `spa` | All shared files + `reactjs`, `nextjs`, `angular`, `motif-design-system`, `a11y` instructions | `aspnet-rest-apis`, `nestjs`, `springboot`, `python`, `swagger-api-docs`, `containerization`, `kubernetes` instructions |
| **Backend** — slug contains `backend`, `api`, `be-`, `server`, `service`, `aspnet`, `spring`, `nest`, `python`, `worker` | All shared files + `aspnet-rest-apis`, `nestjs`, `springboot`, `python`, `swagger-api-docs`, `containerization`, `kubernetes` instructions | `reactjs`, `nextjs`, `angular`, `motif-design-system`, `a11y` instructions |
| **Fullstack** — anything else | All files | Nothing removed |

Shared instruction files (`agent-behavior`, `agent-safety`, `security-and-owasp`, `typescript-5-es2022`, `github-actions`, `azure-devops-pipelines`, `governance`, `sdd-workflow`, etc.) are always sent to every repo regardless of role.

---

## GitHub Tokens

### Classic PAT — wizard operations

- Format: `ghp_...`
- Required scopes: `repo` (full) + `workflow`
- Create at: `https://github.com/settings/tokens/new`
- Used by the wizard to create repos, push files, create PRs, and create issues
- Also used (when Option B is active) to call the GitHub Models API for AI-assisted file routing
- **Not stored** — browser memory only, cleared on disconnect

---

## Project Structure

```
ey-attg-sdlc-wizard/
├── .github/
│   ├── agents/
│   │   ├── planning.agent.md    # planningAgent — reads GitHub Issue → creates planned/plan.md
│   │   ├── backend.agent.md     # Backendagent  — FastAPI backend implementation (backend/ only)
│   │   ├── uiux.agent.md        # ui-uxagent    — frontend UI changes (frontend/ only)
│   │   └── testing.agent.md     # TestingAgent  — unit tests for backend + frontend
│   └── workflows/
│       ├── deploy.yml           # GitHub Pages CI/CD
│       └── mainworkflow.yml     # Issue fan-out: merge → create UI/UX + Backend + Testing issues
├── scripts/
│   ├── bundle-kit.js        # Bundles sdd-kit/ → src/data/kit-files.json
│   ├── generate-docs.mjs    # Generates Word deployment guide
│   └── setup.ps1            # One-time Windows setup
├── sdd-kit/                 # SpecDD Starter Kit source files (not committed)
├── src/
│   ├── components/
│   │   ├── Wizard.jsx           # 9-step wizard shell
│   │   ├── GitHubPublish.jsx    # GitHub API integration
│   │   ├── generators.js        # File generation logic
│   │   └── steps/               # Individual step components
│   ├── data/
│   │   └── kit-files.json       # Bundled kit (auto-generated)
│   ├── pages/
│   │   └── index.astro          # Entry point
│   └── styles/
│       └── wizard.css
├── .env.example
├── astro.config.mjs
└── package.json
```
