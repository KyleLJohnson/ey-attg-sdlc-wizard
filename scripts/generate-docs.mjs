/**
 * generate-docs.mjs
 * Generates the EY ATTG SDLC Wizard deployment & user guide as a Word (.docx) file.
 * Run:  node scripts/generate-docs.mjs
 */

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  TableOfContents, StyleLevel, TableRow, TableCell, Table, WidthType,
  BorderStyle, ShadingType, PageBreak, ExternalHyperlink,
  convertInchesToTwip, LevelFormat, NumberFormat,
} from 'docx';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT = join(__dirname, '..', 'EY-ATTG-SDLC-Wizard-Guide.docx');

// ── Colour palette ───────────────────────────────────────────────────────────
const EY_YELLOW   = 'FFE600';
const EY_BLACK    = '1A1A1A';
const EY_GREY     = 'F2F2F2';
const EY_DARK     = '2E2E38';
const EY_BLUE     = '155FA0';
const EY_BORDER   = 'CCCCCC';
const WHITE       = 'FFFFFF';

// ── Helpers ──────────────────────────────────────────────────────────────────
const pt  = (n) => n * 2;                // half-points (docx unit)
const twip = convertInchesToTwip;

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: pt(18), after: pt(6) },
    shading: { type: ShadingType.SOLID, color: EY_DARK, fill: EY_DARK },
    run: { color: WHITE, bold: true, size: pt(16) },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: pt(14), after: pt(4) },
    border: { bottom: { color: EY_YELLOW, size: 6, style: BorderStyle.SINGLE } },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: pt(10), after: pt(3) },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: pt(11), color: EY_BLACK, ...opts })],
    spacing: { after: pt(6) },
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: pt(11), color: EY_BLACK });
}

function code(text) {
  return new TextRun({
    text,
    font: 'Courier New',
    size: pt(10),
    color: '2E2E38',
    shading: { type: ShadingType.SOLID, color: 'F0F0F0', fill: 'F0F0F0' },
  });
}

function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      children: [new TextRun({
        text: line || ' ',
        font: 'Courier New',
        size: pt(9),
        color: EY_DARK,
      })],
      spacing: { before: 0, after: 0 },
      shading: { type: ShadingType.SOLID, color: 'F5F5F5', fill: 'F5F5F5' },
      indent: { left: twip(0.25) },
      border: {
        left: { color: EY_YELLOW, size: 12, style: BorderStyle.SINGLE },
      },
    })
  );
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, size: pt(11), color: EY_BLACK })],
    bullet: { level },
    spacing: { after: pt(3) },
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, size: pt(11), color: EY_BLACK })],
    numbering: { reference: 'steps', level },
    spacing: { after: pt(3) },
  });
}

function note(text, type = 'info') {
  const bg   = type === 'warn' ? 'FFF8E1' : type === 'tip' ? 'E8F5E9' : 'E3F2FD';
  const left = type === 'warn' ? 'FFC107' : type === 'tip' ? '4CAF50' : '2196F3';
  const label = type === 'warn' ? '⚠ Note: ' : type === 'tip' ? '✔ Tip: ' : 'ℹ Info: ';
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, size: pt(10), color: EY_DARK }),
      new TextRun({ text, size: pt(10), color: EY_DARK }),
    ],
    spacing: { before: pt(4), after: pt(4) },
    shading: { type: ShadingType.SOLID, color: bg, fill: bg },
    indent: { left: twip(0.15) },
    border: { left: { color: left, size: 12, style: BorderStyle.SINGLE } },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function hr() {
  return new Paragraph({
    text: '',
    border: { bottom: { color: EY_BORDER, size: 4, style: BorderStyle.SINGLE } },
    spacing: { before: pt(8), after: pt(8) },
  });
}

// Simple 2-column table
function twoColTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: pt(3), bottom: pt(3), left: twip(0.1), right: twip(0.1) },
    rows: rows.map(([col1, col2], i) =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: col1, bold: i === 0, size: pt(10), color: EY_DARK })],
              spacing: { before: pt(2), after: pt(2) },
              shading: i === 0
                ? { type: ShadingType.SOLID, color: EY_DARK, fill: EY_DARK }
                : { type: ShadingType.SOLID, color: EY_GREY, fill: EY_GREY },
            })],
            width: { size: 35, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: col2,
                bold: i === 0,
                size: pt(10),
                color: i === 0 ? WHITE : EY_BLACK,
              })],
              spacing: { before: pt(2), after: pt(2) },
              shading: i === 0
                ? { type: ShadingType.SOLID, color: EY_DARK, fill: EY_DARK }
                : undefined,
            })],
            width: { size: 65, type: WidthType.PERCENTAGE },
          }),
        ],
      })
    ),
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: EY_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: EY_BORDER },
      left:   { style: BorderStyle.SINGLE, size: 4, color: EY_BORDER },
      right:  { style: BorderStyle.SINGLE, size: 4, color: EY_BORDER },
      insideH:{ style: BorderStyle.SINGLE, size: 2, color: EY_BORDER },
      insideV:{ style: BorderStyle.SINGLE, size: 2, color: EY_BORDER },
    },
  });
}

// ── Cover page ───────────────────────────────────────────────────────────────
function coverPage() {
  return [
    new Paragraph({
      children: [new TextRun({ text: ' ', size: pt(48) })],
      spacing: { before: pt(60) },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'EY ATTG SDLC Wizard',
        bold: true, size: pt(32), color: WHITE,
        shading: { type: ShadingType.SOLID, color: EY_DARK, fill: EY_DARK },
      })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: EY_DARK, fill: EY_DARK },
      spacing: { before: pt(6), after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'Deployment & User Guide',
        bold: true, size: pt(22), color: EY_YELLOW,
      })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: EY_DARK, fill: EY_DARK },
      spacing: { before: 0, after: pt(8) },
    }),
    new Paragraph({
      children: [new TextRun({ text: ' ', size: pt(8) })],
      shading: { type: ShadingType.SOLID, color: EY_YELLOW, fill: EY_YELLOW },
    }),
    new Paragraph({
      children: [new TextRun({ text: ' ', size: pt(16) })],
    }),
    new Paragraph({
      children: [new TextRun({ text: 'EY Advisory Technology Group', size: pt(12), color: EY_DARK })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Version 1.0  ·  March 2026', size: pt(11), color: '666666' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: pt(6) },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'INTERNAL USE ONLY', size: pt(10), color: '999999', italics: true })],
      alignment: AlignmentType.CENTER,
    }),
    pageBreak(),
  ];
}

// ── Document sections ────────────────────────────────────────────────────────

const overview = [
  h1('1. Overview'),
  body('The EY ATTG SDLC Wizard is a browser-based tool that automates the setup of Spec-Driven Development (SpecDD) starter kits on GitHub. It walks engineers and project leads through a guided 9-step wizard, collects project context, and publishes a fully configured GitHub repository — complete with AI agent instructions, spec templates, governance documents, GitHub Actions workflows, and a pre-configured Copilot Coding Agent secret — without requiring any local tooling beyond a web browser.'),
  body(''),
  h2('1.1 What It Does'),
  bullet('Guides the user through 9 steps: Welcome → Project → Tech Stack → Governance → Principles → MCP Tools → Agent & LLM → Preview → Publish'),
  bullet('Generates 120 customised files (context/, specs/, instructions/, templates/, .github/, governance/) tailored to the project\'s tech stack, governance model, and AI agent configuration'),
  bullet('Creates a new GitHub repository and pushes all files in a reliable multi-commit strategy that works around GitHub API object limits'),
  bullet('Stores COPILOT_GITHUB_TOKEN as a repository Actions secret so the Copilot Coding Agent workflows run immediately'),
  bullet('Alternatively supports brownfield mode: opens a pull request on an existing repository'),
  body(''),
  h2('1.2 Key Concepts'),
  twoColTable([
    ['Term', 'Definition'],
    ['SpecDD', 'Spec-Driven Development: author human-readable specifications first, then use AI to generate code from them'],
    ['SDD Kit', '120+ files committed to a repo: context docs, spec templates, agent instructions, governance blueprints, GitHub Actions workflows'],
    ['Greenfield', 'Create a brand-new GitHub repository populated with the full SDD Kit'],
    ['Brownfield', 'Open a pull request on an existing repository to add the SDD Kit alongside current code'],
    ['Copilot Coding Agent', 'GitHub-hosted AI agent that triggers automatically from GitHub Actions when a spec or plan is committed'],
    ['COPILOT_GITHUB_TOKEN', 'Fine-grained PAT stored as a repo Actions secret; required by the Copilot Coding Agent workflows'],
    ['Classic PAT (ghp_)', 'Personal Access Token used to create the repo and push files — NOT compatible with Copilot Coding Agent'],
    ['Fine-grained PAT (github_pat_)', 'Newer token format required by GitHub Copilot Coding Agent workflows'],
  ]),
  body(''),
  h2('1.3 Architecture'),
  body('The wizard is a fully static web application — all processing happens in the browser. There is no server-side component, no database, and no OAuth flow.'),
  body(''),
  twoColTable([
    ['Layer', 'Technology'],
    ['Framework', 'Astro 5.x (static output) + React 18 (interactive components)'],
    ['Styling', 'Custom CSS (src/styles/wizard.css) — no external CSS framework'],
    ['GitHub Integration', 'Direct browser → api.github.com REST calls using a PAT'],
    ['Secret Encryption', 'libsodium-wrappers (lazy-loaded) — required by the GitHub Secrets API'],
    ['Hosting', 'GitHub Pages (free, zero-infrastructure) via GitHub Actions deploy workflow'],
    ['Build', 'Vite (bundled by Astro); kit files inlined into kit-files.json at build time'],
    ['Testing', 'Playwright end-to-end tests'],
  ]),
];

const prerequisites = [
  pageBreak(),
  h1('2. Prerequisites'),
  h2('2.1 To Deploy / Host the Wizard'),
  twoColTable([
    ['Requirement', 'Details'],
    ['GitHub Account', 'Any personal or organization account; must have permission to create repositories and enable GitHub Pages'],
    ['Node.js 20+', 'Required only for local development — not needed if deploying via GitHub Actions'],
    ['npm 9+', 'Bundled with Node.js 20'],
    ['SDD Kit Source Files', 'The sdd-kit/ folder must be populated before building. Run setup.ps1 or copy manually from the SpecDD Starter Kit project'],
    ['Git', 'Required for cloning and pushing the wizard repo'],
  ]),
  body(''),
  h2('2.2 For End Users (Running the Wizard)'),
  twoColTable([
    ['Requirement', 'Details'],
    ['GitHub Account', 'Required to create/push repositories'],
    ['Classic PAT (ghp_...)', 'Scopes: repo + workflow. Used to create the repo and push all files including GitHub Actions workflows'],
    ['Fine-grained PAT (github_pat_...)', 'Required for COPILOT_GITHUB_TOKEN. Needs Contents, Issues, Pull requests (read/write) on the target repo. Stored as a GitHub Actions secret'],
    ['GitHub Copilot access', 'The account must have Copilot license/access for the Coding Agent workflows to function'],
    ['Modern web browser', 'Chrome, Edge, Firefox, or Safari — no extensions required'],
  ]),
  note('The classic PAT and fine-grained PAT must belong to the same GitHub account. The classic PAT handles repository creation and file pushing; the fine-grained PAT is stored as a secret for the Copilot Coding Agent to use at runtime.', 'info'),
];

const deployment = [
  pageBreak(),
  h1('3. Deployment Guide'),
  body('The recommended deployment is GitHub Pages, which provides a free, always-on, zero-infrastructure hosting solution. The entire deployment pipeline is configured via the included deploy.yml workflow.'),
  body(''),
  h2('3.1 Initial Setup (One-Time)'),
  h3('Step 1 — Fork or Clone the Wizard Repository'),
  ...codeBlock([
    'git clone https://github.com/YOUR_ORG/ey-attg-sdlc-wizard.git',
    'cd ey-attg-sdlc-wizard',
  ]),
  body(''),
  h3('Step 2 — Populate the SDD Kit Files'),
  body('The sdd-kit/ folder must be populated with the SpecDD Starter Kit content before the first build. The setup.ps1 script automates this on Windows:'),
  ...codeBlock([
    '.\\setup.ps1',
    '# Or if the kit is in a custom location:',
    '.\\setup.ps1 -KitSource "C:\\path\\to\\your\\sdd-kit"',
  ]),
  body('Alternatively, copy the sdd-kit/ directory manually into the project root so the structure is:'),
  ...codeBlock([
    'ey-attg-sdlc-wizard/',
    '├── sdd-kit/           ← copy content here',
    '│   ├── context/',
    '│   ├── docs/',
    '│   ├── specs/',
    '│   ├── templates/',
    '│   └── ...',
    '├── src/',
    '├── scripts/',
    '└── package.json',
  ]),
  body(''),
  h3('Step 3 — Install Dependencies (Local Dev Only)'),
  ...codeBlock([
    'npm install',
  ]),
  body(''),
  h3('Step 4 — (Optional) Configure .env for Local Development'),
  body('Copy .env.example to .env:'),
  ...codeBlock([
    'copy .env.example .env',
  ]),
  twoColTable([
    ['Variable', 'Purpose'],
    ['BASE_PATH', 'URL base path. Leave as / for local dev. Set automatically from GITHUB_REPOSITORY in GitHub Actions.'],
    ['SITE_URL', 'Full URL of the hosted site (used for canonical links). Example: https://kylejohnson.github.io'],
  ]),
  body(''),
  h3('Step 5 — Verify the Build Locally'),
  ...codeBlock([
    'npm run build',
    '# Or to run the dev server with hot reload:',
    'npm run dev',
  ]),
  body('Open http://localhost:4321 to verify the wizard loads.'),
  body(''),
  h2('3.2 Deploy to GitHub Pages'),
  h3('Step 1 — Push the Repository to GitHub'),
  ...codeBlock([
    'git remote add origin https://github.com/YOUR_ORG/ey-attg-sdlc-wizard.git',
    'git push -u origin main',
  ]),
  body(''),
  h3('Step 2 — Enable GitHub Pages'),
  numbered('Go to the repository on GitHub'),
  numbered('Click Settings → Pages'),
  numbered('Under Source, select GitHub Actions'),
  numbered('Click Save'),
  body(''),
  h3('Step 3 — Trigger the First Deployment'),
  body('The deploy.yml workflow runs automatically on every push to main. You can also trigger it manually:'),
  numbered('Go to Actions tab in the repository'),
  numbered('Select "Deploy to GitHub Pages" workflow'),
  numbered('Click "Run workflow" → "Run workflow"'),
  body(''),
  body('After ~2 minutes, the wizard will be live at:'),
  ...codeBlock([
    'https://YOUR_ORG.github.io/ey-attg-sdlc-wizard/',
  ]),
  note('The base path is derived automatically from the GITHUB_REPOSITORY environment variable — no manual configuration needed.', 'tip'),
  body(''),
  h2('3.3 Updating the Wizard'),
  body('To update the deployed wizard (e.g. after changing wizard steps or kit files):'),
  numbered('Make and commit your changes locally'),
  numbered('Push to main — the deploy workflow triggers automatically'),
  ...codeBlock([
    'git add .',
    'git commit -m "chore: update wizard"',
    'git push',
  ]),
  body(''),
  h2('3.4 Alternative Deployment Options'),
  twoColTable([
    ['Option', 'Notes'],
    ['Netlify / Vercel', 'Works with static output. Set build command to npm run build, publish directory to dist/. Set SITE_URL env var to your domain.'],
    ['Azure Static Web Apps', 'Use the Azure SWA GitHub Action. No special config needed — the Astro static output is fully compatible.'],
    ['Self-hosted server (nginx/Apache)', 'Copy the dist/ folder to your web root. No server-side processing required. If hosted at a sub-path, set BASE_PATH accordingly.'],
    ['Intranet / SharePoint embedding', 'Host the static files on any web server accessible within your intranet. The wizard communicates only with api.github.com.'],
  ]),
  note('For any non-GitHub Pages deployment, set SITE_URL and BASE_PATH in your build environment before running npm run build.', 'warn'),
];

const userGuide = [
  pageBreak(),
  h1('4. User Guide — Running the Wizard'),
  body('This section describes how a project team uses the deployed wizard to set up a new project or add the SDD Kit to an existing one.'),
  body(''),
  h2('4.1 Overview of the 9-Step Wizard'),
  twoColTable([
    ['Step', 'What You Do'],
    ['0 — Welcome', 'Choose Greenfield (create a new repo) or Brownfield (add to an existing repo). Review the overview.'],
    ['1 — Project', 'Enter project name, description, problem statement, personas, business/technical outcomes, and optionally paste a feature specification.'],
    ['2 — Tech Stack', 'Select programming languages, frontend/backend frameworks, testing tools, database, infrastructure, identity platform, source control, DevOps tools, and optional EY Motif / Swagger / Accessibility flags.'],
    ['3 — Governance', 'Choose governance levels (product-level and/or enterprise) and enter Business Unit and Domain names.'],
    ['4 — Principles', 'Set code quality standards, performance requirements, security controls, architecture style (modular monolith, microservices, etc.), minimum test coverage, and any additional coding rules.'],
    ['5 — MCP Tools', 'Select which Model Context Protocol tools the AI agent should have access to (e.g. GitHub, Azure, databases).'],
    ['6 — Agent & LLM', 'Choose the primary AI agent platform (GitHub Copilot, Cursor, Windsurf, etc.) and the language model (GPT-4o, Claude 3.7, etc.).'],
    ['7 — Preview', 'Review all generated file content before publishing. Files are fully rendered and can be copied individually.'],
    ['8 — Publish', 'Authenticate with GitHub and push the kit to a new or existing repository.'],
  ]),
  body(''),
  h2('4.2 Greenfield — Creating a New Repository'),
  h3('4.2.1 Connect to GitHub'),
  numbered('Click "Create a token on GitHub →" to open the PAT creation page (pre-filled with repo + workflow scopes)'),
  numbered('Set the token name (e.g. EY ATTG SDLC Wizard) and expiration, then click Generate token'),
  numbered('Copy the token (ghp_...) and paste it into the "Personal Access Token (classic)" field'),
  numbered('Click Connect — the wizard verifies the token and shows your GitHub username'),
  body(''),
  h3('4.2.2 Configure the Repository'),
  twoColTable([
    ['Field', 'Description'],
    ['Repository name', 'Slug used as the GitHub repo name. Auto-populated from the project name on step 1.'],
    ['Description', 'Optional. Shown on the GitHub repo page.'],
    ['Visibility', 'Public or Private. Private repos require a paid GitHub plan for some features.'],
    ['Copilot token', 'Fine-grained PAT (github_pat_...) stored as COPILOT_GITHUB_TOKEN. Required for the Coding Agent workflows to run. See section 4.4 for creation instructions.'],
  ]),
  body(''),
  h3('4.2.3 What Happens When You Click "Create repository & push N files"'),
  numbered('Repository is created with auto_init: true'),
  numbered('Wizard polls until the git backend is ready (~2–5 seconds)'),
  numbered('First batch of up to 85 non-workflow files committed and pushed'),
  numbered('Additional batches committed until all non-workflow files are pushed'),
  numbered('GitHub Actions workflow files (.github/workflows/) pushed in a final dedicated commit (requires workflow PAT scope)'),
  numbered('COPILOT_GITHUB_TOKEN secret created in the new repo using the fine-grained PAT'),
  numbered('SDLC label created in the repo'),
  numbered('Initial SDLC issue created to trigger the Greenfield Planning Copilot Coding Agent workflow'),
  note('The multi-batch commit strategy is required because GitHub\'s API enforces a limit of ~114 unique new objects per commit. The wizard handles this transparently.', 'info'),
  body(''),
  h2('4.3 Brownfield — Pull Request on Existing Repository'),
  body('Use this mode when you want to add the SDD Kit to a team repository that already has code.'),
  numbered('On step 0 (Welcome), select Brownfield'),
  numbered('On step 1 (Project), enter the existing repo URL or owner/repo slug'),
  numbered('Complete the wizard steps as normal'),
  numbered('On step 8 (Publish), enter the classic PAT and optionally name the PR branch'),
  numbered('Click "Create pull request" — the wizard creates a branch with all kit files and opens a PR'),
  numbered('Review the PR on GitHub, then merge when ready'),
  note('The COPILOT_GITHUB_TOKEN secret is not automatically created in brownfield mode. Add it manually via the repo\'s Settings → Secrets → Actions page after merging.', 'warn'),
  body(''),
  h2('4.4 Creating the Required Personal Access Tokens'),
  h3('Classic PAT (ghp_...) — for repo creation and file pushing'),
  numbered('Go to https://github.com/settings/tokens/new'),
  numbered('Description: e.g. EY ATTG SDLC Wizard'),
  numbered('Expiration: set an appropriate duration (90 days recommended)'),
  numbered('Select scopes: repo (full) and workflow'),
  numbered('Click Generate token and copy immediately (shown only once)'),
  body(''),
  h3('Fine-grained PAT (github_pat_...) — for COPILOT_GITHUB_TOKEN'),
  numbered('Go to https://github.com/settings/personal-access-tokens/new'),
  numbered('Token name: e.g. SDLC Copilot Agent'),
  numbered('Expiration: set an appropriate duration'),
  numbered('Repository access: select the specific repository being created, OR select "All repositories" if you plan to reuse this token across many projects'),
  numbered('Under Repository permissions, grant Read & Write to: Contents, Issues, Pull requests'),
  numbered('Optionally grant Read-only to: Actions (allows the agent to check workflow status)'),
  numbered('Click Generate token and copy immediately'),
  note('Classic PATs (ghp_) are explicitly rejected by GitHub Copilot Coding Agent workflows. Only fine-grained PATs (github_pat_) are accepted. This is a GitHub platform requirement, not a wizard constraint.', 'warn'),
];

const kitContents = [
  pageBreak(),
  h1('5. SDD Kit — Repository Contents'),
  body('The following 120 files are pushed to every new repository created by the wizard. Files marked with [W] are generated dynamically by the wizard based on your inputs; all others are copied from the bundled kit.'),
  body(''),
  h2('5.1 Context Files (Wizard-Generated)'),
  twoColTable([
    ['File', 'Description'],
    ['context/project.md [W]', 'Project identity, problem statement, key personas, business and technical outcomes'],
    ['context/tech-stack.md [W]', 'Approved languages, frameworks, testing tools, database, infrastructure — from wizard step 2'],
    ['context/constitution.md [W]', 'Coding standards, architecture style, security controls, performance requirements — from wizard step 4'],
    ['.github/copilot-instructions.md [W]', 'Workspace-level AI agent instructions auto-loaded by GitHub Copilot, Cursor, and other agents'],
  ]),
  body(''),
  h2('5.2 GitHub Copilot Coding Agent Workflows'),
  body('These are Copilot Coding Agent definition files (Markdown with YAML front-matter) and their corresponding dependency lock files. They are stored in .github/workflows/ and trigger GitHub Copilot to run as an autonomous coding agent.'),
  twoColTable([
    ['File', 'Trigger'],
    ['greenfield-coding.md + .lock.yml', 'Triggered when docs/plan.md is pushed to main, or when an implementation PR is closed without merging'],
    ['greenfield-testing.md + .lock.yml', 'Triggered when an implementation PR is opened or updated'],
    ['greenfield-from-centralrepo.md + .lock.yml', 'Alternative trigger for projects using a central spec repository pattern'],
  ]),
  body(''),
  h2('5.3 Kit Infrastructure Files'),
  twoColTable([
    ['Directory', 'Contents'],
    ['specs/_template/', 'Spec templates: spec.md, plan.md, tasks.md, api.md, data-model.md, research.md, checklist.md, quickstart.md'],
    ['instructions/', 'Coding Agent instruction files for code generation and spec generation'],
    ['.github/agents/', 'SpecDD agent definition files (sdd-specify, sdd-plan, sdd-implement, etc.)'],
    ['.github/hooks/', 'Git hook helpers'],
    ['.github/instructions/', 'Auto-loaded instruction files for governance, workflow, agent behavior'],
    ['.github/prompts/', 'Reusable prompt files for common SpecDD operations'],
    ['governance/', 'Enterprise constitution template, domain spec templates, blueprint templates'],
    ['templates/', 'Document templates: spec, plan, tasks, blueprint, constitution, domain spec, etc.'],
    ['context/architecture.md', 'Architecture decision record template'],
    ['docs/', 'SpecDD methodology guide, FAQ, workflow reference, starter guide'],
    ['examples/', 'Example instruction files and prompt files'],
    ['SETUP.md', 'Post-clone setup guide stamped with repo name and generation timestamp'],
    ['README.md', 'Project README overview'],
  ]),
];

const tokens = [
  pageBreak(),
  h1('6. Token & Secret Reference'),
  h2('6.1 Classic PAT — Wizard Operations'),
  body('Used by the wizard itself to interact with the GitHub API. Not stored anywhere after the browser session ends.'),
  twoColTable([
    ['Attribute', 'Value'],
    ['Token format', 'ghp_...'],
    ['Required scopes', 'repo (full), workflow'],
    ['Used for', 'Create repository, push files (including .github/workflows/), fetch repo public key, set Actions secrets, create labels, create issues'],
    ['Stored?', 'Browser memory only — cleared when the page is closed or "Disconnect" is clicked'],
    ['Expiry recommendation', '90 days, then rotate'],
  ]),
  body(''),
  h2('6.2 Fine-grained PAT — Copilot Coding Agent'),
  body('Stored as COPILOT_GITHUB_TOKEN Actions secret in the target repository. Used by GitHub Copilot Coding Agent workflows at runtime.'),
  twoColTable([
    ['Attribute', 'Value'],
    ['Token format', 'github_pat_...'],
    ['Required permissions', 'Contents (read/write), Issues (read/write), Pull requests (read/write)'],
    ['Optional permissions', 'Actions (read-only) — allows agent to check workflow status'],
    ['Repository access', 'The specific target repo, or all repositories for a reusable token'],
    ['Stored as', 'COPILOT_GITHUB_TOKEN secret in the target repo\'s Actions secrets'],
    ['Expiry recommendation', 'Set a reasonable expiry; rotate by updating the secret in Settings → Secrets → Actions'],
  ]),
  note('When the fine-grained PAT expires, the Copilot Coding Agent workflows will fail with an authentication error. Update the secret in the target repo\'s Settings → Secrets → Actions page.', 'warn'),
];

const troubleshooting = [
  pageBreak(),
  h1('7. Troubleshooting'),
  twoColTable([
    ['Error', 'Cause & Resolution'],
    ['Could not create repository: name already taken', 'A repo with this name already exists under your account. Choose a different repository name.'],
    ['Could not push workflow files: Token missing the "workflow" scope', 'The classic PAT was created without the workflow scope. Regenerate the PAT at github.com/settings/tokens with repo + workflow scopes.'],
    ['Repository git backend did not become ready in time', 'GitHub\'s API was slow to initialise. Click the back button and try again — this is transient.'],
    ['COPILOT_GITHUB_TOKEN is a classic PAT (ghp_...)', 'The "Copilot token" field was left blank (wizard fell back to the classic PAT) or a classic PAT was pasted. Create a fine-grained PAT and paste it into the "Copilot token" field.'],
    ['None of the following secrets are set: COPILOT_GITHUB_TOKEN', 'The secret was not created (possibly because the wizard ran without a Copilot token). Go to the repo → Settings → Secrets → Actions → New secret. Name: COPILOT_GITHUB_TOKEN, Value: your fine-grained PAT.'],
    ['Could not create git tree chunk N (HTTP 404): Not Found', 'The 114-object-per-commit GitHub API limit was hit. This should be handled automatically by the multi-batch strategy; if it persists, delete the broken repo and retry.'],
    ['Could not create branch "sdlc-kit-setup": already exists', 'A previous brownfield attempt left the branch behind. Delete the branch on GitHub and retry, or change the PR branch name in the wizard.'],
    ['deploy.yml workflow fails: Pages not enabled', 'GitHub Pages must be enabled before the first deploy. Go to Settings → Pages → Source → GitHub Actions.'],
    ['sdd-kit content not found during build', 'The sdd-kit/ directory is empty or missing. Run setup.ps1 or copy the kit content manually before building.'],
  ]),
];

const futureFeatures = [
  pageBreak(),
  h1('8. Recommended Future Features & Enhancements'),
  body('The following enhancements are recommended based on observed usage patterns, known limitations, and strategic roadmap priorities.'),
  body(''),
  h2('8.1 High Priority'),
  h3('OAuth App / GitHub App Authentication'),
  body('Replace the PAT-based authentication with a proper GitHub OAuth App or GitHub App flow. Benefits:'),
  bullet('No token management burden on the user — one-click "Sign in with GitHub"'),
  bullet('Token scopes are pre-approved at the app level; no user-side scope configuration errors'),
  bullet('Installation tokens are short-lived and auto-rotated'),
  bullet('Required for enterprise SSO environments where classic PATs are disabled'),
  body('Implementation note: requires a small serverless backend (Cloudflare Worker, Azure Function) or a proxy to exchange the OAuth code for a token without exposing client secrets in the browser.'),
  body(''),
  h3('Automatic Fine-grained PAT Creation / GitHub App Installation Token'),
  body('Currently users must manually create a fine-grained PAT and paste it into the Copilot token field. A GitHub App flow would eliminate this entirely — the installation token is automatically scoped to the created repo with the correct permissions.'),
  body(''),
  h3('Brownfield COPILOT_GITHUB_TOKEN Secret Creation'),
  body('The wizard currently skips secret creation in brownfield mode. Add the same encryption+PUT flow post-merge (triggered by a webhook, or by asking the user to reconnect after PR merge).'),
  body(''),
  h2('8.2 Medium Priority'),
  h3('Wizard State Persistence (localStorage)'),
  body('Allow users to save wizard progress and resume across browser sessions. The current implementation loses all input on page refresh. Use localStorage with the PAT explicitly excluded from persistence.'),
  body(''),
  h3('Export as ZIP (No GitHub Account Required)'),
  body('Add a "Download as ZIP" button on the Preview step so users without GitHub accounts (or in air-gapped environments) can get the kit files directly. The JSZip library is already a dependency.'),
  body(''),
  h3('Team / Org Defaults Configuration'),
  body('Allow a team administrator to publish a configuration JSON to a known URL (e.g. the wizard repo itself) that pre-populates governance levels, tech stack defaults, and enterprise constitution rules for all users. New projects inherit org standards automatically.'),
  body(''),
  h3('Repository Template Support'),
  body('Instead of using the Git Data API to push individual files, create a GitHub repository template from the generated kit. Teams can then use "Use this template" on GitHub rather than the full wizard flow for subsequent projects.'),
  body(''),
  h3('Kit File Version Pinning & Update Notifications'),
  body('Track the kit version bundled at build time. When a new kit version is released, show a banner in the wizard and allow users to pull the latest instructions/templates without re-running the full wizard. Implement as a GitHub API call to compare the deployed kit SHA with the latest release.'),
  body(''),
  h2('8.3 Lower Priority / Future Exploration'),
  h3('Multi-Repo / Monorepo Support'),
  body('Allow the wizard to push kit files to a specific subdirectory within an existing monorepo (e.g. apps/my-service/) rather than the repo root. Requires updating path construction in the GitHubPublish.jsx batching logic.'),
  body(''),
  h3('ADO (Azure DevOps) Support'),
  body('Add a parallel publish flow for Azure DevOps repositories. The wizard would use the ADO REST API to create a new repository and push files. Governance-heavy teams often have ADO as their primary SCM.'),
  body(''),
  h3('Copilot Coding Agent Workflow Customisation'),
  body('Expose the Coding Agent workflow trigger configuration in the wizard UI — for example, allowing teams to select which branches trigger the agents, or to disable specific agents (e.g. keep Planning but disable Coding for projects where the agent should only generate specs, not code).'),
  body(''),
  h3('Wizard Analytics / Telemetry'),
  body('Track anonymous usage metrics (e.g. how many projects created per week, most popular tech stack selections, brownfield vs greenfield split) using a privacy-safe analytics endpoint. Helps prioritise future improvements.'),
  body(''),
  h3('Fine-grained PAT Token Validation'),
  body('When the user pastes a fine-grained PAT, validate it via GET /repos/{owner}/{repo} before storing it as a secret. Provide a clear error if the PAT lacks the required permissions, rather than allowing the issue to surface at workflow runtime.'),
  body(''),
  h3('Spec Import from Confluence / Jira'),
  body('On the Project step, add integration with Confluence/Jira to import an existing spec or epic directly, rather than pasting raw markdown. Requires OAuth integration with those platforms.'),
  body(''),
  h2('8.4 Security Hardening'),
  h3('Content Security Policy'),
  body('Add a strict Content-Security-Policy header to prevent XSS. The wizard communicates only with api.github.com — a tight CSP (connect-src https://api.github.com) is feasible.'),
  body(''),
  h3('PAT Masking in Error Messages'),
  body('Audit all error message surfaces to ensure the PAT value never appears in UI error text or console logs.'),
  body(''),
  h3('Token Rotation Reminder'),
  body('Add a note in the success screen reminding users when their PAT expires and linking to the settings page for rotation.'),
];

const appendix = [
  pageBreak(),
  h1('Appendix A — File Reference'),
  twoColTable([
    ['File / Directory', 'Purpose'],
    ['src/components/Wizard.jsx', 'Main wizard component — 9-step form, validation, state management'],
    ['src/components/GitHubPublish.jsx', 'GitHub API integration — repo creation, multi-batch file push, secret encryption'],
    ['src/components/generators.js', 'File generation logic — produces tailored kit files from wizard form data'],
    ['src/data/kit-files.json', 'Bundled kit file content (auto-generated by bundle-kit.js at build time, ~900 KB)'],
    ['src/styles/wizard.css', 'All styling for the wizard UI'],
    ['src/pages/index.astro', 'Single page entry point — mounts the Wizard React component'],
    ['scripts/bundle-kit.js', 'Reads sdd-kit/ directory and writes kit-files.json'],
    ['scripts/setup.ps1', 'One-time Windows setup script — copies kit files from SpecDD Starter Kit project'],
    ['.github/workflows/deploy.yml', 'GitHub Actions workflow — builds and deploys to GitHub Pages'],
    ['.github/workflows/greenfield-*.md', 'Copilot Coding Agent definitions pushed to each new project repository'],
    ['.env.example', 'Template for local development environment variables'],
    ['astro.config.mjs', 'Astro framework configuration — static output, React integration, dynamic base path'],
    ['package.json', 'npm project manifest — lists Astro, React, libsodium-wrappers, docx, jszip dependencies'],
  ]),
  body(''),
  h1('Appendix B — GitHub API Limits & Workarounds'),
  body('The following GitHub API limitations were discovered during development and are handled transparently by the wizard:'),
  twoColTable([
    ['Limitation', 'Wizard Workaround'],
    ['~114 unique new git objects per commit (undocumented)', 'Multi-batch strategy: up to 85 files per commit, nested subtrees, each batch committed and PATCHed before the next starts'],
    ['.github/workflows/ requires "workflow" PAT scope', 'Workflow files pushed in a dedicated final commit; clear error shown if scope is missing'],
    ['Classic PATs rejected by Copilot Coding Agent', 'Separate "Copilot token" field; clear error message with link to fine-grained PAT creation page'],
    ['base_tree on globally content-identical trees causes 404', 'SETUP.md stamped with repo name + timestamp to make each repo\'s tree content-unique'],
    ['POST /git/trees body size limits', 'Inline content in tree items (not SHA refs) for reliability; kept under limits by batch sizing'],
  ]),
];

// ── Assemble document ────────────────────────────────────────────────────────
const doc = new Document({
  title: 'EY ATTG SDLC Wizard — Deployment & User Guide',
  description: 'Comprehensive guide covering installation, deployment, user workflows, and future roadmap',
  creator: 'EY Advisory Technology Group',
  numbering: {
    config: [
      {
        reference: 'steps',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: pt(11), color: EY_BLACK },
      },
      heading1: {
        run: { font: 'Calibri', size: pt(16), bold: true, color: WHITE },
        paragraph: {
          spacing: { before: pt(18), after: pt(8) },
          shading: { type: ShadingType.SOLID, color: EY_DARK, fill: EY_DARK },
        },
      },
      heading2: {
        run: { font: 'Calibri', size: pt(13), bold: true, color: EY_DARK },
        paragraph: { spacing: { before: pt(12), after: pt(4) } },
      },
      heading3: {
        run: { font: 'Calibri', size: pt(11), bold: true, color: EY_BLUE },
        paragraph: { spacing: { before: pt(8), after: pt(3) } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top:    twip(1),
            right:  twip(1),
            bottom: twip(1),
            left:   twip(1.25),
          },
        },
      },
      children: [
        ...coverPage(),
        ...overview,
        ...prerequisites,
        ...deployment,
        ...userGuide,
        ...kitContents,
        ...tokens,
        ...troubleshooting,
        ...futureFeatures,
        ...appendix,
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync(OUT, buffer);
console.log(`✔ Generated: ${OUT}`);
