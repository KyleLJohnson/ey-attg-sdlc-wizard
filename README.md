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
| Two separate PATs | Classic `ghp_` for repo creation/push; fine-grained `github_pat_` stored as `COPILOT_GITHUB_TOKEN` for the Copilot Coding Agent |

---

## Agentic Workflow

After the wizard publishes a new repository, three GitHub Actions / GitHub Copilot Coding Agent workflows are active immediately:

```
Developer commits docs/plan.md
          │
          ▼
┌─────────────────────────────┐
│  greenfield-coding.md       │  Trigger: push to docs/plan.md on main
│  Copilot Coding Agent       │           OR closed implementation PR
│                             │  Action:  reads plan.md → implements
│  Requires:                  │           MVP → opens PR on
│    COPILOT_GITHUB_TOKEN      │           copilot/implement-* branch
└──────────────┬──────────────┘
               │  opens PR
               ▼
┌─────────────────────────────┐
│  greenfield-testing.md      │  Trigger: implementation PR opened/updated
│  Copilot Coding Agent       │  Action:  writes or updates tests for the
│                             │           PR's changed files
└──────────────┬──────────────┘
               │  PR reviewed & merged
               ▼
          Production code
```

`greenfield-from-centralrepo.md` provides an alternative trigger for teams using a central spec repository pattern.

### The `COPILOT_GITHUB_TOKEN` Secret

The wizard automatically creates this secret in every new repository using the fine-grained PAT you provide on the Publish step. It must be a **fine-grained** PAT (`github_pat_...`) — GitHub explicitly rejects classic PATs for Copilot Coding Agent authentication.

Required permissions on the target repository:

- **Contents** — Read & Write
- **Issues** — Read & Write
- **Pull requests** — Read & Write

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
| Fine-grained PAT (`github_pat_...`) | Stored as `COPILOT_GITHUB_TOKEN`; needs Contents, Issues, Pull requests read/write |
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
3. Enter a repository name and paste your **fine-grained PAT** into the **Copilot token** field
4. Click **Create repository & push N files**

The wizard will:
- Create the repository
- Push all kit files in multi-batch commits
- Store `COPILOT_GITHUB_TOKEN` as an Actions secret
- Create the SDLC issue that kicks off the planning workflow

### Brownfield (existing repository)

1. On step 0, choose **Brownfield**
2. Complete the wizard steps with your project's existing context
3. On the **Publish** step, paste your classic PAT and the target repository name
4. Click **Create pull request**

> After merging the PR, manually add the `COPILOT_GITHUB_TOKEN` secret via **Settings → Secrets → Actions** in the target repository.

---

## GitHub Tokens

### Classic PAT — wizard operations

- Format: `ghp_...`
- Required scopes: `repo` (full) + `workflow`
- Create at: `https://github.com/settings/tokens/new`
- Used by the wizard to create repos, push files, and set secrets
- **Not stored** — browser memory only, cleared on disconnect

### Fine-grained PAT — Copilot Coding Agent

- Format: `github_pat_...`
- Required permissions: Contents, Issues, Pull requests (Read & Write)
- Create at: `https://github.com/settings/personal-access-tokens/new`
- Stored as `COPILOT_GITHUB_TOKEN` Actions secret in the target repository
- Classic PATs (`ghp_`) are **explicitly rejected** by GitHub Copilot Coding Agent workflows

---

## Project Structure

```
ey-attg-sdlc-wizard/
├── .github/
│   └── workflows/
│       ├── deploy.yml                        # GitHub Pages CI/CD
│       ├── greenfield-coding.lock.yml/.md    # Copilot Coding Agent
│       ├── greenfield-testing.lock.yml/.md   # Copilot Testing Agent
│       └── greenfield-from-centralrepo.lock.yml/.md
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
