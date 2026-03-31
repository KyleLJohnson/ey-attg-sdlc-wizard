/**
 * bundle-kit.js
 * Reads all sdd-kit files and writes them to src/data/kit-files.json
 * so the wizard can include them in the pushed GitHub repository.
 *
 * Kit content location (searched in order):
 *   1. $KIT_PATH environment variable
 *   2. ./sdd-kit/  (relative to project root — recommended for this project)
 *
 * To populate ./sdd-kit/, copy the contents of sdd-kit/ from the original
 * SpecDD Starter Kit project, or run setup.ps1 which does this automatically.
 *
 * Run via:  npm run bundle-kit  (auto-runs before npm run dev/build)
 */

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// ── Locate kit root ──────────────────────────────────────────────────────────
function findKitRoot() {
  if (process.env.KIT_PATH) {
    if (existsSync(process.env.KIT_PATH)) return process.env.KIT_PATH;
    console.error(`✗ KIT_PATH="${process.env.KIT_PATH}" does not exist.`);
    process.exit(1);
  }
  const local = join(PROJECT_ROOT, 'sdd-kit');
  if (existsSync(local)) return local;

  console.error(`
✗ Could not find sdd-kit content.

  Run setup.ps1 to copy the kit from the original project, or:

    Set KIT_PATH=<path-to-sdd-kit> in your .env file, or
    Copy the sdd-kit folder to: ${local}
`);
  process.exit(1);
}

const KIT_ROOT = findKitRoot();
const OUT_DIR  = join(PROJECT_ROOT, 'src', 'data');
const OUT_FILE = join(OUT_DIR, 'kit-files.json');

// ── Directories to skip entirely ─────────────────────────────────────────────
const SKIP_DIRS = new Set([
  'website', 'node_modules', '.git', '.astro', '.idea', 'dist',
]);

// ── File extensions to include ───────────────────────────────────────────────
const INCLUDE_EXTS = new Set([
  '.md', '.json', '.yml', '.yaml', '.txt', '.sh', '.gitkeep', '.gitignore',
]);

// ── Files whose content is replaced by the wizard ───────────────────────────
const WIZARD_REPLACES = new Set([
  'context/project.md',
  'context/tech-stack.md',
  'context/constitution.md',
  '.github/copilot-instructions.md',
]);

// ── Walk the kit root ────────────────────────────────────────────────────────
function processEntry(entry, dir, result) {
  const fullPath = join(dir, entry);
  const relPath  = relative(KIT_ROOT, fullPath).replaceAll('\\', '/');
  let stat;
  try { stat = statSync(fullPath); } catch { return; }
  if (stat.isDirectory()) {
    if (!SKIP_DIRS.has(entry)) walk(fullPath, result);
    return;
  }
  if (WIZARD_REPLACES.has(relPath)) return;
  const ext = extname(entry).toLowerCase();
  const isDotFile = basename(entry).startsWith('.');
  if (INCLUDE_EXTS.has(ext) || isDotFile) {
    try { result[relPath] = readFileSync(fullPath, 'utf8'); } catch { /* skip unreadable */ }
  }
}

function walk(dir, result = {}) {
  let entries;
  try { entries = readdirSync(dir); } catch { return result; }
  for (const entry of entries) processEntry(entry, dir, result);
  return result;
}

// ── Generate ─────────────────────────────────────────────────────────────────
const files = walk(KIT_ROOT);

// ── Also bundle agentic workflow files from .github/workflows/ ───────────────
// These are pushed to the target repo so the agentic workflow fires
// automatically when the SDLC issue is created.
const WORKFLOWS_DIR    = join(PROJECT_ROOT, '.github', 'workflows');
const WORKFLOW_EXCLUDE = new Set(['deploy.yml']);
try {
  for (const entry of readdirSync(WORKFLOWS_DIR)) {
    if (WORKFLOW_EXCLUDE.has(entry)) continue;
    const ext = extname(entry).toLowerCase();
    if (ext === '.yml' || ext === '.md') {
      try {
        files[`.github/workflows/${entry}`] = readFileSync(join(WORKFLOWS_DIR, entry), 'utf8');
      } catch { /* skip unreadable */ }
    }
  }
} catch { /* skip if workflows dir is missing */ }

// ── Also bundle custom agent definitions from .github/agents/ ────────────────
// These define the Copilot custom agents (planning, backend, uiux, testing)
// and must be present in target repos for the agentic workflow to function.
const AGENTS_DIR = join(PROJECT_ROOT, '.github', 'agents');
try {
  for (const entry of readdirSync(AGENTS_DIR)) {
    const ext = extname(entry).toLowerCase();
    if (ext === '.md') {
      try {
        files[`.github/agents/${entry}`] = readFileSync(join(AGENTS_DIR, entry), 'utf8');
      } catch { /* skip unreadable */ }
    }
  }
} catch { /* skip if agents dir is missing */ }

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(files, null, 2));

const count = Object.keys(files).length;
console.log(`✓ Bundled ${count} sdd-kit files → src/data/kit-files.json`);
