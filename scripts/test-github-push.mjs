/**
 * Diagnostic script — tests the exact GitHub API sequence used by createAndPush().
 * Run: node scripts/test-github-push.mjs <PAT> [owner]
 *
 * Creates a scratch repo, walks through every API step using the FULL kit-files
 * payload (same as the wizard), prints full status codes + response bodies,
 * then deletes the scratch repo.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [,, TOKEN, OWNER_OVERRIDE] = process.argv;
if (!TOKEN) { console.error('Usage: node scripts/test-github-push.mjs <PAT>'); process.exit(1); }

const BASE = 'https://api.github.com';
const REPO_NAME = `sdlc-wizard-test-${Date.now()}`;

async function api(path, opts = {}) {
  const { method = 'GET', body } = opts;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept:        'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok, json };
}

function log(step, status, ok, snippet) {
  const icon = ok ? '✅' : '❌';
  console.log(`\n${icon} Step ${step}  HTTP ${status}`);
  console.log(JSON.stringify(snippet, null, 2));
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Load the real kit-files payload (same as the wizard uses) ───────────────
const kitPath = path.join(__dirname, '../src/data/kit-files.json');
let kitFiles;
try {
  kitFiles = JSON.parse(readFileSync(kitPath, 'utf-8'));
  console.log(`📂 Loaded kit-files.json: ${Object.keys(kitFiles).length} files  (${(Buffer.byteLength(JSON.stringify(kitFiles)) / 1024).toFixed(1)} KB)`);
} catch {
  console.warn('⚠️  kit-files.json not found, using 2-file stub');
  kitFiles = {
    'README.md':  '# test\n',
    'foo/bar.md': '# bar\n',
  };
}

const TEST_TREE = Object.entries(kitFiles).map(([filePath, content]) => ({
  path: filePath, mode: '100644', type: 'blob', content,
}));

(async () => {
  // 0. Resolve owner
  const meRes = await api('/user');
  const owner = OWNER_OVERRIDE || meRes.json?.login;
  console.log(`\n👤 Authenticated as: ${owner}  (HTTP ${meRes.status})`);
  if (!meRes.ok) { console.error('Auth failed'); process.exit(1); }

  // 1. Create repo
  console.log(`\n📦 Creating repo: ${REPO_NAME}`);
  const createRes = await api('/user/repos', {
    method: 'POST',
    body: { name: REPO_NAME, private: true, auto_init: true },
  });
  log(1, createRes.status, createRes.ok, {
    full_name:      createRes.json?.full_name,
    default_branch: createRes.json?.default_branch,
    message:        createRes.json?.message,
    errors:         createRes.json?.errors,
  });
  if (!createRes.ok) process.exit(1);

  const fullName     = createRes.json.full_name;
  const defaultBranch = createRes.json.default_branch || 'main';

  // 2. Poll ref + readiness probe
  let initSha = null;
  console.log(`\n🔍 Polling ref + commit readiness probe…`);
  for (let i = 1; i <= 10; i++) {
    await sleep(i * 700);
    const refRes = await api(`/repos/${fullName}/git/ref/heads/${defaultBranch}`);
    console.log(`  attempt ${i} — ref: HTTP ${refRes.status}  sha=${refRes.json?.object?.sha ?? '—'}`);
    if (!refRes.ok) continue;
    const sha = refRes.json.object.sha;

    const probeRes = await api(`/repos/${fullName}/git/commits/${sha}`);
    console.log(`  attempt ${i} — commit probe: HTTP ${probeRes.status}`);
    if (probeRes.ok) { initSha = sha; break; }
  }
  if (!initSha) { console.error('❌ Git backend never became ready'); process.exit(1); }
  console.log(`✅ initSha = ${initSha}`);

  // Inject a unique timestamp into one file to ensure the tree SHA is new each run.
  // Without this, all 120 blob SHAs are identical across runs (content-addressed),
  // producing the same chunk-1 tree SHA — which GitHub deduplicates globally and
  // never registers as "owned" by any specific repo. That makes base_tree fail.
  const stampedFiles = { ...kitFiles };
  const stampFile = 'SETUP.md';
  if (stampedFiles[stampFile]) {
    stampedFiles[stampFile] = stampedFiles[stampFile]
      + `\n\n<!-- Generated: ${new Date().toISOString()} -->`;
  }

  // 3+4. Build the tree bottom-up as nested subtrees.
  // GitHub's /git/trees API limits 114 total items per request (new + base_tree).
  // Our kit has 120 files, exceeding this limit. No chunking/base_tree chain works.
  // Solution: parse paths into a directory tree; recurse leaves→root, posting one
  // tree per directory. Each directory has ≪114 items; no base_tree needed.
  // Inline content → blobs/trees are stored LOCALLY (no global deduplication issue).
  console.log('\n🌳 Building nested subtrees bottom-up…');

  function buildDirNode(files) {
    const root = {};
    for (const [fp, content] of Object.entries(files)) {
      const parts = fp.split('/');
      let node = root;
      for (let i = 0; i < parts.length - 1; i++) { node[parts[i]] ??= {}; node = node[parts[i]]; }
      node[parts.at(-1)] = content;
    }
    return root;
  }

  async function postDirTree(dirNode, label) {
    const items = [];
    for (const [name, value] of Object.entries(dirNode)) {
      if (typeof value === 'string') {
        items.push({ path: name, mode: '100644', type: 'blob', content: value });
      } else {
        const subSha = await postDirTree(value, `${label}/${name}`);
        items.push({ path: name, mode: '040000', type: 'tree', sha: subSha });
      }
    }
    const res = await api(`/repos/${fullName}/git/trees`, { method: 'POST', body: { tree: items } });
    const kb = (Buffer.byteLength(JSON.stringify({ tree: items })) / 1024).toFixed(1);
    console.log(`  ${label || '(root)'}: ${items.length} items  ${kb} KB  HTTP ${res.status}  sha=${res.json?.sha ?? '—'}`);
    if (!res.ok) throw new Error(`postDirTree(${label}) failed: ${JSON.stringify(res.json)}`);
    return res.json.sha;
  }

  const rootTreeSha = await postDirTree(buildDirNode(stampedFiles), '').catch(e => {
    console.error('❌', e.message); process.exit(1);
  });
  log(4, 201, true, { rootTreeSha });

  // 5. Create final commit (squash — only initSha as parent)
  const commitRes = await api(`/repos/${fullName}/git/commits`, {
    method: 'POST',
    body: { message: 'chore: initialize SpecDD Starter Kit', tree: rootTreeSha, parents: [initSha] },
  });
  log(5, commitRes.status, commitRes.ok, { sha: commitRes.json?.sha, message: commitRes.json?.message });

  // 6. Probe the new commit before updating the ref
  console.log(`\n🔍 Probing new commit ${commitRes.json.sha}…`);
  for (let p = 1; p <= 10; p++) {
    await sleep(p * 500);
    const probe = await api(`/repos/${fullName}/git/commits/${commitRes.json.sha}`);
    console.log(`  commit probe ${p}: HTTP ${probe.status}  tree=${probe.json?.tree?.sha ?? '—'}`);
    if (probe.ok) break;
  }

  // 6b. Update the ref — retry with delay (new commit may take a moment to propagate)
  if (commitRes.ok) {
    const getRef = await api(`/repos/${fullName}/git/ref/heads/${defaultBranch}`);
    console.log(`\n🔍 Pre-PATCH ref: HTTP ${getRef.status}  sha=${getRef.json?.object?.sha ?? '—'}`);

    let refUpdated = false;
    for (let attempt = 1; attempt <= 8; attempt++) {
      if (attempt > 1) await sleep(attempt * 1000);
      const patchRes = await api(`/repos/${fullName}/git/refs/heads/${defaultBranch}`, {
        method: 'PATCH',
        body: { sha: commitRes.json.sha, force: true },
      });
      console.log(`  PATCH attempt ${attempt}: HTTP ${patchRes.status}  sha=${patchRes.json?.object?.sha ?? patchRes.json?.message ?? '—'}`);
      if (patchRes.ok) { log(6, patchRes.status, true, { ref: patchRes.json?.ref }); refUpdated = true; break; }
    }
    if (!refUpdated) console.error('❌ Could not update ref after all retries');
  }

  // Cleanup
  console.log('\n🗑️  Deleting test repo…');
  const delRes = await api(`/repos/${fullName}`, { method: 'DELETE' });
  console.log(`  HTTP ${delRes.status} ${delRes.ok ? '(deleted)' : '(delete failed — remove manually)'}`);

  console.log('\n✅ Diagnostic complete.');
})();
