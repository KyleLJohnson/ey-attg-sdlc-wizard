/* eslint-disable react/prop-types */
/**
 * GitHubPublish.jsx
 *
 * Handles GitHub PAT authentication + repo create + file push.
 *
 * Props:
 *   files       {Object}  — path → content map from generateAllFiles()
 *   projectName {string}  — wizard project name (used as default repo name)
 *
 * Security notes:
 *   - The PAT is held only in React component state; never written to
 *     localStorage or sessionStorage
 *   - API calls go directly from the browser to api.github.com over HTTPS
 *   - repo scope is required (create + push to new repos)
 *   - workflow scope is required (push .github/workflows/ files)
 */

import { useState } from 'react';

const GITHUB_API = 'https://api.github.com';
const PAT_CREATE_URL = 'https://github.com/settings/tokens/new?scopes=repo%2Cworkflow&description=EY+ATTG+SDLC+Wizard';
const FINE_GRAINED_PAT_URL = 'https://github.com/settings/personal-access-tokens/new';

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(name) {
  return (name || 'my-project')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Normalise a full GitHub URL or bare owner/repo string to 'owner/repo'. Returns null if invalid. */
function parseRepo(input) {
  const trimmed = (input || '').trim();
  const urlMatch = trimmed.match(/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/);
  if (urlMatch) return urlMatch[1].replace(/\.git$/, '');
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) return trimmed;
  return null;
}

function ghFetch(path, token, opts = {}) {
  return fetch(`${GITHUB_API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...opts.headers,
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

// ── GitHubPublish ─────────────────────────────────────────────────────────────
export default function GitHubPublish({ files, projectName, mode = 'greenfield', existingRepo = '', wizardData = {} }) {
  // Auth
  const [pat, setPat]         = useState('');
  const [showPat, setShowPat] = useState(false);
  const [token, setToken]     = useState(null);
  const [user, setUser]       = useState(null);

  // Greenfield repo config
  const [repoName, setRepoName]       = useState(slugify(projectName));
  const [repoDesc, setRepoDesc]       = useState('');
  const [repoPrivate, setRepoPrivate] = useState(false);

  // Brownfield PR config
  const [prBranch, setPrBranch] = useState('sdlc-kit-setup');

  // Process
  const [phase, setPhase]           = useState('idle');  // idle | verifying | pushing | done | error
  const [progress, setProgress]     = useState('');
  const [repoUrl, setRepoUrl]       = useState('');
  const [prUrl, setPrUrl]           = useState('');
  const [issueUrl, setIssueUrl]     = useState('');
  const [issueCreating, setIssueCreating] = useState(false);
  const [error, setError]           = useState('');

  const fileCount = files ? Object.keys(files).length : 0;
  const targetRepo = parseRepo(existingRepo);   // 'owner/repo' or null

  // ── Verify PAT + fetch user ───────────────────────────────────────────────
  async function connectWithPat() {
    const trimmed = pat.trim();
    if (!trimmed) return;
    setPhase('verifying');
    setProgress('Verifying token…');
    setError('');
    try {
      const res = await ghFetch('/user', trimmed);
      if (res.status === 401) throw new Error('Invalid token — check that it has not expired and has the repo scope.');
      if (!res.ok) throw new Error(`GitHub returned HTTP ${res.status}`);
      const ghUser = await res.json();
      setToken(trimmed);
      setUser({ login: ghUser.login, avatar_url: ghUser.avatar_url, name: ghUser.name });
      setPhase('idle');
      setProgress('');
    } catch (err) {
      setError(err.message || 'Could not verify token.');
      setPhase('error');
    }
  }

  // ── Disconnect ───────────────────────────────────────────────────────────
  function disconnect() {
    setToken(null);
    setUser(null);
    setPat('');
    setPhase('idle');
    setError('');
  }

  // ── Create PR on existing repo (brownfield) ──────────────────────────────
  // Same multi-batch strategy as createAndPush: nested-subtree commits chained
  // via intermediate temporary refs, then PR branch pointed at final commit.
  async function createPr() {
    if (!token || !targetRepo) return;
    setPhase('pushing');
    setError('');
    const prBranchName = prBranch.trim() || 'sdlc-kit-setup';

    try {
      // Step 1: Verify access + get default branch
      setProgress('Verifying repository access…');
      const repoRes = await ghFetch(`/repos/${targetRepo}`, token);
      if (repoRes.status === 404) throw new Error(`Repository "${targetRepo}" not found — check the name and that the token has access.`);
      if (!repoRes.ok) throw new Error(`Could not access repository: HTTP ${repoRes.status}`);
      const repoData = await repoRes.json();
      const defaultBranch = repoData.default_branch || 'main';

      // Step 2: Get latest commit SHA on default branch
      setProgress(`Reading ${defaultBranch} branch…`);
      const refRes = await ghFetch(`/repos/${targetRepo}/git/ref/heads/${defaultBranch}`, token);
      if (!refRes.ok) {
        const e = await refRes.json().catch(() => ({}));
        throw new Error(`Could not read branch "${defaultBranch}": ${e.message || refRes.status}`);
      }
      const refData = await refRes.json();
      const baseCommitSha = refData.object.sha;

      // Step 3: Get base tree SHA from that commit
      const commitRes = await ghFetch(`/repos/${targetRepo}/git/commits/${baseCommitSha}`, token);
      if (!commitRes.ok) throw new Error('Could not read latest commit.');
      const baseTreeSha = (await commitRes.json()).tree.sha;

      // Step 4: Build & commit files in batches using nested subtrees (≤85 files
      // per commit) to stay under GitHub's ~114 new-objects-per-commit limit.
      const allEntries   = Object.entries(files);
      const nonWfEntries = allEntries.filter(([p]) => !p.includes('.github/workflows/'));
      const wfEntries    = allEntries.filter(([p]) =>  p.includes('.github/workflows/'));

      async function postLeafTree(items) {
        const res = await ghFetch(`/repos/${targetRepo}/git/trees`, token, {
          method: 'POST', body: { tree: items },
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(`Could not create sub-tree (HTTP ${res.status}): ${e.message || 'unknown'}`);
        }
        return (await res.json()).sha;
      }
      async function buildRootItemsRecurse(fileEntries) {
        const dirMap = {};
        const blobs = [];
        for (const [fp, content] of fileEntries) {
          const slash = fp.indexOf('/');
          if (slash === -1) blobs.push({ path: fp, mode: '100644', type: 'blob', content });
          else { const dir = fp.slice(0, slash); (dirMap[dir] ??= []).push([fp.slice(slash + 1), content]); }
        }
        const items = [...blobs];
        for (const [dir, children] of Object.entries(dirMap)) {
          const subItems = await buildRootItemsRecurse(children);
          items.push({ path: dir, mode: '040000', type: 'tree', sha: await postLeafTree(subItems) });
        }
        return items;
      }

      // We need an intermediate branch to chain commits through (can't PATCH
      // a branch that doesn't exist yet; must CREATE it first, then PATCH it).
      // Strategy: create PR branch at baseCommitSha, then PATCH it per batch.
      const tempBranchRes = await ghFetch(`/repos/${targetRepo}/git/refs`, token, {
        method: 'POST',
        body: { ref: `refs/heads/${prBranchName}`, sha: baseCommitSha },
      });
      if (!tempBranchRes.ok) {
        const e = await tempBranchRes.json().catch(() => ({}));
        const msg = e.errors?.[0]?.message || e.message || tempBranchRes.status;
        throw new Error(`Could not create branch "${prBranchName}": ${msg}`);
      }

      let prevCommitSha = baseCommitSha;
      let prevTreeSha   = baseTreeSha;
      const BATCH = 85;
      const totalBatches = Math.ceil(nonWfEntries.length / BATCH) + (wfEntries.length > 0 ? 1 : 0);
      let batchNum = 0;

      for (let i = 0; i < nonWfEntries.length; i += BATCH) {
        batchNum++;
        const batch = nonWfEntries.slice(i, i + BATCH);
        setProgress(`Pushing files… (batch ${batchNum}/${totalBatches})`);

        const rootItems = await buildRootItemsRecurse(batch);
        const treeRes = await ghFetch(`/repos/${targetRepo}/git/trees`, token, {
          method: 'POST',
          body: { tree: rootItems, base_tree: prevTreeSha },
        });
        if (!treeRes.ok) {
          const e = await treeRes.json().catch(() => ({}));
          throw new Error(`Could not create git tree (batch ${batchNum}, HTTP ${treeRes.status}): ${e.message || 'unknown'}`);
        }
        const treeSha = (await treeRes.json()).sha;

        const msg = batchNum === 1
          ? 'chore: add SpecDD Starter Kit\n\nGenerated by the EY ATTG SDLC Wizard.'
          : `chore: add SpecDD Starter Kit files (part ${batchNum})`;
        const cRes = await ghFetch(`/repos/${targetRepo}/git/commits`, token, {
          method: 'POST',
          body: { message: msg, tree: treeSha, parents: [prevCommitSha] },
        });
        if (!cRes.ok) {
          const e = await cRes.json().catch(() => ({}));
          throw new Error(`Could not create commit (batch ${batchNum}): ${e.message || cRes.status}`);
        }
        const newCommit = await cRes.json();

        const pRes = await ghFetch(
          `/repos/${targetRepo}/git/refs/heads/${prBranchName}`, token, {
            method: 'PATCH', body: { sha: newCommit.sha, force: false },
          });
        if (!pRes.ok) {
          const e = await pRes.json().catch(() => ({}));
          throw new Error(`Could not update branch (batch ${batchNum}): ${e.message || pRes.status}`);
        }
        prevCommitSha = newCommit.sha;
        prevTreeSha   = treeSha;
        if (i + BATCH < nonWfEntries.length || wfEntries.length > 0) {
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Workflow files batch
      if (wfEntries.length > 0) {
        batchNum++;
        setProgress(`Pushing workflow files… (batch ${batchNum}/${totalBatches})`);

        const prevTreeListRes = await ghFetch(`/repos/${targetRepo}/git/trees/${prevTreeSha}`, token);
        const prevTreeList = prevTreeListRes.ok ? await prevTreeListRes.json() : null;
        const existingGithubSha = prevTreeList?.tree?.find(e => e.path === '.github')?.sha ?? null;

        const wfBlobItems = wfEntries.map(([fp, content]) => ({
          path: fp.split('/').pop(), mode: '100644', type: 'blob', content,
        }));
        const wfSubSha = await postLeafTree(wfBlobItems);

        const githubTreeBody = existingGithubSha
          ? { base_tree: existingGithubSha, tree: [{ path: 'workflows', mode: '040000', type: 'tree', sha: wfSubSha }] }
          : { tree: [{ path: 'workflows', mode: '040000', type: 'tree', sha: wfSubSha }] };
        const gRes = await ghFetch(`/repos/${targetRepo}/git/trees`, token, {
          method: 'POST', body: githubTreeBody,
        });
        if (!gRes.ok) {
          const e = await gRes.json().catch(() => ({}));
          throw new Error(`Could not create .github tree (HTTP ${gRes.status}): ${e.message || 'unknown'}`);
        }
        const newGithubSha = (await gRes.json()).sha;

        const rRes = await ghFetch(`/repos/${targetRepo}/git/trees`, token, {
          method: 'POST',
          body: { base_tree: prevTreeSha, tree: [{ path: '.github', mode: '040000', type: 'tree', sha: newGithubSha }] },
        });
        if (!rRes.ok) {
          const e = await rRes.json().catch(() => ({}));
          throw new Error(`Could not create root tree for workflows (HTTP ${rRes.status}): ${e.message || 'unknown'}`);
        }
        const wfTreeSha = (await rRes.json()).sha;

        const wcRes = await ghFetch(`/repos/${targetRepo}/git/commits`, token, {
          method: 'POST',
          body: { message: 'chore: add GitHub Actions workflow files', tree: wfTreeSha, parents: [prevCommitSha] },
        });
        if (!wcRes.ok) {
          const e = await wcRes.json().catch(() => ({}));
          throw new Error(`Could not create workflow commit: ${e.message || wcRes.status}`);
        }
        const wfCommit = await wcRes.json();

        const wpRes = await ghFetch(
          `/repos/${targetRepo}/git/refs/heads/${prBranchName}`, token, {
            method: 'PATCH', body: { sha: wfCommit.sha, force: false },
          });
        if (!wpRes.ok) {
          const e = await wpRes.json().catch(() => ({}));
          const msg = wpRes.status === 404
            ? 'Token missing the "workflow" scope — regenerate your PAT with both repo and workflow selected.'
            : (e.message || wpRes.status);
          throw new Error(`Could not push workflow files: ${msg}`);
        }
        prevCommitSha = wfCommit.sha;
      }

      // Step 5: Open PR
      setProgress('Opening pull request…');
      const prRes = await ghFetch(`/repos/${targetRepo}/pulls`, token, {
        method: 'POST',
        body: {
          title: 'chore: add SpecDD Starter Kit',
          body: [
            '## SpecDD Starter Kit',
            '',
            `This PR adds the EY ATTG SDLC Starter Kit to **${projectName || targetRepo}**.`,
            '',
            '### What\'s included',
            '- `context/project.md` — project identity & personas',
            '- `context/tech-stack.md` — approved technologies',
            '- `context/constitution.md` — governing principles',
            '- `.github/copilot-instructions.md` — AI agent context (auto-loaded by Copilot)',
            '- All 80+ sdd-kit instruction, template, and agent files',
            '',
            '### Next step',
            'After merging, create an SDLC issue to trigger the Planning agentic workflow.',
            '',
            '---',
            '*Generated by the EY ATTG SDLC Wizard.*',
          ].join('\n'),
          head: prBranchName,
          base: defaultBranch,
        },
      });
      if (!prRes.ok) {
        const e = await prRes.json().catch(() => ({}));
        throw new Error(`Could not create pull request: ${e.message || prRes.status}`);
      }
      const pr = await prRes.json();
      setPrUrl(pr.html_url);
      setPhase('done');
    } catch (err) {
      setError(err.message || 'PR creation failed. Please try again.');
      setPhase('error');
    }
  }

  // ── Create SDLC label + issue (deferred for brownfield, post-merge) ───────
  async function createSdlcIssue() {
    if (!token || !targetRepo) return;
    setIssueCreating(true);
    setError('');
    try {
      // Create label (ignore 422 = already exists)
      await ghFetch(`/repos/${targetRepo}/labels`, token, {
        method: 'POST',
        body: { name: 'SDLC', color: '0075ca', description: 'Triggers the SDLC Planning agentic workflow' },
      });
      const p = wizardData?.project || {};
      const ts = wizardData?.techStack || {};
      const ag = wizardData?.agent || {};
      const mc = wizardData?.mcp || {};
      const issueBody = [
        '## Project Summary',
        '',
        `**Name:** ${projectName || targetRepo}`,
        p.description ? `**Description:** ${p.description}` : '',
        p.problemStatement ? `**Problem Statement:** ${p.problemStatement}` : '',
        p.userOutcome ? `**User Outcome:** ${p.userOutcome}` : '',
        p.businessOutcome ? `**Business Outcome:** ${p.businessOutcome}` : '',
        '',
        '## Tech Stack',
        ts.languages?.length ? `**Languages:** ${ts.languages.join(', ')}` : '',
        ts.frontend ? `**Frontend:** ${ts.frontend}` : '',
        ts.backend ? `**Backend:** ${ts.backend}` : '',
        ts.database ? `**Database:** ${ts.database}` : '',
        ts.infrastructure?.length ? `**Infrastructure:** ${ts.infrastructure.join(', ')}` : '',
        '',
        '## Agent & LLM',
        ag.primary ? `**Primary Agent:** ${ag.primary}` : '',
        ag.model ? `**Model:** ${ag.model}` : '',
        mc.tools?.length ? `**MCP Tools:** ${mc.tools.join(', ')}` : '',
        '',
        `**Repository:** ${targetRepo}`,
        '',
        '---',
        '*Generated by the EY ATTG SDLC Wizard.*',
      ].filter(line => line !== '').join('\n');
      const issueRes = await ghFetch(`/repos/${targetRepo}/issues`, token, {
        method: 'POST',
        body: {
          title: `Project: ${projectName || targetRepo}`,
          body: issueBody,
          labels: ['SDLC'],
        },
      });
      if (!issueRes.ok) throw new Error('Could not create issue.');
      const issue = await issueRes.json();
      setIssueUrl(issue.html_url);
    } catch (err) {
      setError(err.message || 'Could not create SDLC issue.');
    } finally {
      setIssueCreating(false);
    }
  }

  // ── Create repo + push all files ─────────────────────────────────────────
  // Strategy (multi-batch to stay under GitHub's ~114 new-objects-per-commit limit):
  //
  //   1. Create repo with auto_init:true → seeds the git object store.
  //   2. Poll until the auto_init commit is reachable.
  //   3. Split files into batches of ≤85 files, each committed separately:
  //        - Non-workflow files first (batches 1..N-1)
  //        - Final batch includes remaining non-wf files + workflow files (via
  //          nested .github subtree, because workflow files require 'workflow' scope
  //          but are fine once the token carries that scope).
  //      Each batch uses nested subtrees (POST sub-dirs first, then root with
  //      base_tree=prevTreeSha) to stay well under the 114-object limit.
  //   4. Fast-forward the default branch after every batch commit so that
  //      base_tree on the next batch always points to a "locally registered" tree.
  //   5. Create SDLC label + issue.
  //
  // Why nested subtrees & 85-file batches?
  //   GitHub counts ALL new git objects (blobs + intermediate tree nodes) vs the
  //   parent commit's pack. A batch of 85 files across ≤13 directories produces
  //   ≈98 total objects, safely below 114.
  async function createAndPush() {
    if (!token || !repoName.trim()) return;
    setPhase('pushing');
    setError('');

    try {
      // ── Step 1: Create repo ───────────────────────────────────────────────
      setProgress('Creating repository…');
      const createRes = await ghFetch('/user/repos', token, {
        method: 'POST',
        body: {
          name:        repoName.trim(),
          description: repoDesc.trim() || `SpecDD Starter Kit — ${projectName || 'my project'}`,
          private:     repoPrivate,
          auto_init:   true,
        },
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        const msg = err.errors?.[0]?.message || err.message || `HTTP ${createRes.status}`;
        throw new Error(`Could not create repository: ${msg}`);
      }
      const repo = await createRes.json();
      const full = repo.full_name;
      const defaultBranch = repo.default_branch || 'main';

      // ── Step 2: Poll until the auto_init commit is visible ────────────────
      setProgress('Waiting for repository to be ready…');
      let initSha = null;
      let initTreeSha = null;

      for (let attempt = 1; attempt <= 10; attempt++) {
        await new Promise(r => setTimeout(r, attempt * 700));
        const refRes = await ghFetch(`/repos/${full}/git/ref/heads/${defaultBranch}`, token);
        if (!refRes.ok) continue;
        const ref = await refRes.json();
        const sha = ref.object.sha;
        const probeRes = await ghFetch(`/repos/${full}/git/commits/${sha}`, token);
        if (!probeRes.ok) continue;
        const c = await probeRes.json();
        initSha = sha;
        initTreeSha = c.tree.sha;
        break;
      }
      if (!initSha) throw new Error('Repository git backend did not become ready in time. Please try again.');

      // Stamp SETUP.md with repo identity so this commit tree is unique per repo
      // (prevents GitHub's global content-dedup from yielding an already-reachable
      //  tree SHA, which would cause PATCH to fail).
      const stampedFiles = { ...files };
      if (stampedFiles['SETUP.md']) {
        stampedFiles['SETUP.md'] += `\n\n<!-- Repository: ${full} -->\n<!-- Generated: ${new Date().toISOString()} -->`;
      }

      const allEntries    = Object.entries(stampedFiles);
      const nonWfEntries  = allEntries.filter(([p]) => !p.includes('.github/workflows/'));
      const wfEntries     = allEntries.filter(([p]) =>  p.includes('.github/workflows/'));

      // ── Step 3: Post sub-directory trees (helper) ────────────────────────
      // POST a leaf-level tree (no nested dir references) and return its SHA.
      async function postLeafTree(blobItems) {
        const res = await ghFetch(`/repos/${full}/git/trees`, token, {
          method: 'POST',
          body: { tree: blobItems },
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(`Could not create sub-tree (HTTP ${res.status}): ${e.message || 'unknown'}`);
        }
        return (await res.json()).sha;
      }

      // Build a dir-node map from a flat file list, then recursively POST sub-trees.
      // Returns an array of root-level tree items (either blobs or {path, sha} dirs).
      async function buildRootItems(fileEntries) {
        const dirMap = {};
        const rootBlobs = [];
        for (const [fp, content] of fileEntries) {
          const slash = fp.indexOf('/');
          if (slash === -1) {
            rootBlobs.push({ path: fp, mode: '100644', type: 'blob', content });
          } else {
            const dir = fp.slice(0, slash);
            (dirMap[dir] ??= []).push([fp.slice(slash + 1), content]);
          }
        }
        const items = [...rootBlobs];
        for (const [dir, children] of Object.entries(dirMap)) {
          const subItems = await buildRootItemsRecurse(children);
          const sha = await postLeafTreeRecurse(subItems);
          items.push({ path: dir, mode: '040000', type: 'tree', sha });
        }
        return items;
      }

      // Recursively build sub-items for nested directories, posting leaf trees first.
      async function buildRootItemsRecurse(fileEntries) {
        const dirMap = {};
        const blobs = [];
        for (const [fp, content] of fileEntries) {
          const slash = fp.indexOf('/');
          if (slash === -1) {
            blobs.push({ path: fp, mode: '100644', type: 'blob', content });
          } else {
            const dir = fp.slice(0, slash);
            (dirMap[dir] ??= []).push([fp.slice(slash + 1), content]);
          }
        }
        const items = [...blobs];
        for (const [dir, children] of Object.entries(dirMap)) {
          const subItems = await buildRootItemsRecurse(children);
          const sha = await postLeafTreeRecurse(subItems);
          items.push({ path: dir, mode: '040000', type: 'tree', sha });
        }
        return items;
      }

      async function postLeafTreeRecurse(items) {
        const res = await ghFetch(`/repos/${full}/git/trees`, token, {
          method: 'POST',
          body: { tree: items },
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(`Could not create sub-tree (HTTP ${res.status}): ${e.message || 'unknown'}`);
        }
        return (await res.json()).sha;
      }

      // ── Step 4: Commit in batches of ≤85 non-workflow files ──────────────
      const BATCH = 85;
      let prevCommitSha = initSha;
      let prevTreeSha   = initTreeSha;
      const totalBatches = Math.ceil(nonWfEntries.length / BATCH) + (wfEntries.length > 0 ? 1 : 0);
      let batchNum = 0;

      for (let i = 0; i < nonWfEntries.length; i += BATCH) {
        batchNum++;
        const batch = nonWfEntries.slice(i, i + BATCH);
        setProgress(`Pushing files… (batch ${batchNum}/${totalBatches})`);

        const rootItems = await buildRootItems(batch);
        const isFirstBatch = (i === 0);
        const treeRes = await ghFetch(`/repos/${full}/git/trees`, token, {
          method: 'POST',
          body: {
            tree:      rootItems,
            base_tree: isFirstBatch ? initTreeSha : prevTreeSha,
          },
        });
        if (!treeRes.ok) {
          const e = await treeRes.json().catch(() => ({}));
          throw new Error(`Could not create git tree (batch ${batchNum}, HTTP ${treeRes.status}): ${e.message || 'unknown'}`);
        }
        const treeSha = (await treeRes.json()).sha;

        const commitRes = await ghFetch(`/repos/${full}/git/commits`, token, {
          method: 'POST',
          body: {
            message: batchNum === 1
              ? 'chore: initialize SpecDD Starter Kit\n\nGenerated by the EY ATTG SDLC Setup Wizard.'
              : `chore: add SpecDD Starter Kit files (part ${batchNum})`,
            tree:    treeSha,
            parents: [prevCommitSha],
          },
        });
        if (!commitRes.ok) {
          const e = await commitRes.json().catch(() => ({}));
          throw new Error(`Could not create commit (batch ${batchNum}): ${e.message || commitRes.status}`);
        }
        const newCommit = await commitRes.json();

        const patchRes = await ghFetch(
          `/repos/${full}/git/refs/heads/${defaultBranch}`, token, {
            method: 'PATCH',
            body: { sha: newCommit.sha, force: false },
          });
        if (!patchRes.ok) {
          const e = await patchRes.json().catch(() => ({}));
          throw new Error(`Could not update branch (batch ${batchNum}): ${e.message || patchRes.status}`);
        }

        prevCommitSha = newCommit.sha;
        prevTreeSha   = treeSha;
        // Brief pause between batches to let GitHub's pack propagate
        if (i + BATCH < nonWfEntries.length || wfEntries.length > 0) {
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // ── Step 5: Final batch — workflow files (requires `workflow` scope) ──
      if (wfEntries.length > 0) {
        batchNum++;
        setProgress(`Pushing workflow files… (batch ${batchNum}/${totalBatches})`);

        // We need to merge .github/workflows/ into the existing .github/ tree
        // from the previous commit rather than overwrite it.
        const prevTreeListRes = await ghFetch(`/repos/${full}/git/trees/${prevTreeSha}`, token);
        const prevTreeList = prevTreeListRes.ok ? await prevTreeListRes.json() : null;
        const existingGithubSha = prevTreeList?.tree?.find(e => e.path === '.github')?.sha ?? null;

        // Build workflows sub-tree (just filenames, no path separators)
        const wfBlobItems = wfEntries.map(([fp, content]) => ({
          path: fp.split('/').pop(),
          mode: '100644',
          type: 'blob',
          content,
        }));
        const wfSubRes = await ghFetch(`/repos/${full}/git/trees`, token, {
          method: 'POST',
          body: { tree: wfBlobItems },
        });
        if (!wfSubRes.ok) {
          const e = await wfSubRes.json().catch(() => ({}));
          throw new Error(`Could not create workflows sub-tree (HTTP ${wfSubRes.status}): ${e.message || 'unknown'}`);
        }
        const wfSubSha = (await wfSubRes.json()).sha;

        // Build merged .github/ tree (add 'workflows' dir to existing .github/)
        const githubTreeBody = existingGithubSha
          ? { base_tree: existingGithubSha, tree: [{ path: 'workflows', mode: '040000', type: 'tree', sha: wfSubSha }] }
          : { tree: [{ path: 'workflows', mode: '040000', type: 'tree', sha: wfSubSha }] };
        const githubRes = await ghFetch(`/repos/${full}/git/trees`, token, {
          method: 'POST',
          body: githubTreeBody,
        });
        if (!githubRes.ok) {
          const e = await githubRes.json().catch(() => ({}));
          throw new Error(`Could not create .github tree (HTTP ${githubRes.status}): ${e.message || 'unknown'}`);
        }
        const newGithubSha = (await githubRes.json()).sha;

        // Root tree: add .github reference on top of prevTreeSha
        const rootTreeRes = await ghFetch(`/repos/${full}/git/trees`, token, {
          method: 'POST',
          body: {
            base_tree: prevTreeSha,
            tree: [{ path: '.github', mode: '040000', type: 'tree', sha: newGithubSha }],
          },
        });
        if (!rootTreeRes.ok) {
          const e = await rootTreeRes.json().catch(() => ({}));
          throw new Error(`Could not create root tree for workflows (HTTP ${rootTreeRes.status}): ${e.message || 'unknown'}`);
        }
        const wfTreeSha = (await rootTreeRes.json()).sha;

        const wfCommitRes = await ghFetch(`/repos/${full}/git/commits`, token, {
          method: 'POST',
          body: {
            message: 'chore: add GitHub Actions workflow files',
            tree:    wfTreeSha,
            parents: [prevCommitSha],
          },
        });
        if (!wfCommitRes.ok) {
          const e = await wfCommitRes.json().catch(() => ({}));
          throw new Error(`Could not create workflow commit: ${e.message || wfCommitRes.status}`);
        }
        const wfCommit = await wfCommitRes.json();

        const wpRes = await ghFetch(
          `/repos/${full}/git/refs/heads/${defaultBranch}`, token, {
            method: 'PATCH',
            body: { sha: wfCommit.sha, force: false },
          });
        if (!wpRes.ok) {
          const e = await wpRes.json().catch(() => ({}));
          const msg = wpRes.status === 404
            ? 'Token missing the "workflow" scope — regenerate your PAT with both repo and workflow selected.'
            : (e.message || wpRes.status);
          throw new Error(`Could not push workflow files: ${msg}`);
        }
        prevCommitSha = wfCommit.sha;
      }

      // ── Step 6: Create SDLC label + issue ────────────────────────────────
      setProgress('Creating SDLC label…');
      await ghFetch(`/repos/${full}/labels`, token, {
        method: 'POST',
        body: { name: 'SDLC', color: '0075ca', description: 'Triggers the SDLC Greenfield Planning agentic workflow' },
      });

      setProgress('Creating project summary issue…');
      const p = wizardData?.project || {};
      const ts = wizardData?.techStack || {};
      const ag = wizardData?.agent || {};
      const mc = wizardData?.mcp || {};
      const issueBody = [
        `## Project Summary`,
        ``,
        `**Name:** ${projectName || repoName.trim()}`,
        (repoDesc.trim() || p.description) ? `**Description:** ${repoDesc.trim() || p.description}` : '',
        p.problemStatement ? `**Problem Statement:** ${p.problemStatement}` : '',
        p.userOutcome ? `**User Outcome:** ${p.userOutcome}` : '',
        p.businessOutcome ? `**Business Outcome:** ${p.businessOutcome}` : '',
        ``,
        `## Tech Stack`,
        ts.languages?.length ? `**Languages:** ${ts.languages.join(', ')}` : '',
        ts.frontend ? `**Frontend:** ${ts.frontend}` : '',
        ts.backend ? `**Backend:** ${ts.backend}` : '',
        ts.database ? `**Database:** ${ts.database}` : '',
        ts.infrastructure?.length ? `**Infrastructure:** ${ts.infrastructure.join(', ')}` : '',
        ``,
        `## Agent & LLM`,
        ag.primary ? `**Primary Agent:** ${ag.primary}` : '',
        ag.model ? `**Model:** ${ag.model}` : '',
        mc.tools?.length ? `**MCP Tools:** ${mc.tools.join(', ')}` : '',
        ``,
        `---`,
        `*Generated by the EY ATTG SDLC Wizard.*`,
      ].filter(line => line !== '').join('\n');
      const issueRes = await ghFetch(`/repos/${full}/issues`, token, {
        method: 'POST',
        body: {
          title:  `Project: ${projectName || repoName.trim()}`,
          body:   issueBody,
          labels: ['SDLC'],
        },
      });
      if (issueRes.ok) {
        const issue = await issueRes.json();
        setIssueUrl(issue.html_url);
      }

      setRepoUrl(repo.html_url);
      setPhase('done');
    } catch (err) {
      setError(err.message || 'Push failed. Please try again.');
      setPhase('error');
    }
  }

  // ── Render: success ──────────────────────────────────────────────────────
  if (phase === 'done') {
    // ── Brownfield success ──
    if (mode === 'brownfield') {
      return (
        <div className="gh-success">
          <div className="gh-success-check">✓</div>
          <h3>Pull request created!</h3>
          <p>
            Your SpecDD Starter Kit has been added as a pull request on{' '}
            <strong>{targetRepo}</strong>. Review the diff and merge when ready.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            {prUrl && (
              <a href={prUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-github" style={{ display: 'inline-flex', gap: 8 }}>
                <GHIcon />
                Open pull request →
              </a>
            )}
            {issueUrl ? (
              <a href={issueUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary" style={{ display: 'inline-flex', gap: 8 }}>
                View SDLC issue →
              </a>
            ) : (
              <button
                className="btn btn-secondary"
                style={{ display: 'inline-flex', gap: 8 }}
                onClick={createSdlcIssue}
                disabled={issueCreating}
              >
                {issueCreating ? <><span className="gh-spinner" /> Creating…</> : '🏷️ Create SDLC Issue →'}
              </button>
            )}
          </div>
          {error && <div className="gh-error" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="next-steps">
            <strong>What to do next:</strong>
            <ol>
              <li>Review and merge the pull request into your default branch.</li>
              <li>Click <strong>Create SDLC Issue</strong> above — this creates a labeled <code>SDLC</code> issue to track your project.</li>
              <li>Pull the latest in VS Code. Copilot picks up <code>.github/copilot-instructions.md</code> automatically.</li>
              <li>Review <code>context/constitution.md</code> and commit any edits.</li>
              {files && Object.keys(files).includes('.vscode/mcp.json') && (
                <li>Add your API tokens to <code>.vscode/mcp.json</code>, then add it to <code>.gitignore</code> — never commit tokens.</li>
              )}
            </ol>
          </div>
        </div>
      );
    }

    // ── Greenfield success ──
    const shortName = repoUrl.replace('https://github.com/', '');
    return (
      <div className="gh-success">
        <div className="gh-success-check">✓</div>
        <h3>Repository created!</h3>
        <p>Your SpecDD Starter Kit has been pushed to GitHub.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-github"
            style={{ display: 'inline-flex', gap: 8 }}
          >
            <GHIcon />
            Open {shortName} →
          </a>
          {issueUrl && (
            <a
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ display: 'inline-flex', gap: 8 }}
            >
              View project issue →
            </a>
          )}
        </div>
        <div className="next-steps">
          <strong>What to do next:</strong>
          <ol>
            <li>Clone or open the repo in VS Code. Copilot picks up <code>.github/copilot-instructions.md</code> automatically.</li>
            <li>Review <code>context/constitution.md</code> and commit any edits.</li>
            <li>Open Copilot Chat and run <code>/sdd-specify</code> to create your first feature spec.</li>
            {files && Object.keys(files).includes('.vscode/mcp.json') && (
              <li>Add your API tokens to <code>.vscode/mcp.json</code>, then add it to <code>.gitignore</code> — never commit tokens.</li>
            )}
          </ol>
        </div>
      </div>
    );
  }

  // ── Render: not authenticated — PAT input ────────────────────────────────
  if (!token) {
    return (
      <div className="gh-connect">
        <div className="gh-connect-card">
          <div className="gh-connect-icon"><GHIcon size={32} /></div>
          <div>
            <div className="gh-connect-title">Connect to GitHub</div>
            <div className="gh-connect-desc">
              Paste a Personal Access Token to create a new repository and push
              your {fileCount} kit files — no redirect required.
            </div>
          </div>
        </div>

        <div className="gh-scope-note">
          <strong>Required scopes:</strong> <code>repo</code> + <code>workflow</code> — repo to create/write repositories; workflow to push GitHub Actions files.{' '}
          <a href={PAT_CREATE_URL} target="_blank" rel="noopener noreferrer">
            Create a token on GitHub &rarr;
          </a>
        </div>

        {error && <div className="gh-error">{error}</div>}

        <div className="form-group" style={{ marginTop: 16 }}>
          <label htmlFor="gh-pat">Personal Access Token (classic)</label>
          <div className="gh-pat-row">
            <input
              id="gh-pat"
              type={showPat ? 'text' : 'password'}
              value={pat}
              onChange={e => setPat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && connectWithPat()}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              autoComplete="off"
              spellCheck={false}
              disabled={phase === 'verifying'}
            />
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={() => setShowPat(v => !v)}
              aria-label={showPat ? 'Hide token' : 'Show token'}
              disabled={phase === 'verifying'}
            >
              {showPat ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {phase === 'verifying' ? (
          <div className="gh-progress"><span className="gh-spinner" />{progress}</div>
        ) : (
          <button
            className="btn btn-github"
            onClick={connectWithPat}
            disabled={!pat.trim()}
            style={{ marginTop: 8 }}
          >
            <GHIcon />
            Connect
          </button>
        )}
      </div>
    );
  }

  // ── Render: authenticated, repo form ────────────────────────────────────
  return (
    <div className="gh-publish-form">
      {/* Connected user badge */}
      <div className="gh-user-badge">
        <img src={user.avatar_url} alt={user.login} className="gh-avatar" width={32} height={32} />
        <div>
          <div className="gh-user-name">{user.name || user.login}</div>
          <div className="gh-user-login">@{user.login}</div>
        </div>
        <button
          className="btn btn-secondary btn-icon"
          style={{ marginLeft: 'auto' }}
          onClick={disconnect}
          disabled={phase === 'pushing'}
        >
          Disconnect
        </button>
      </div>

      {/* Repo settings — brownfield: PR config; greenfield: new repo config */}
      {mode === 'brownfield' ? (
        <div className="gh-repo-settings">
          {/* Read-only target repo */}
          <div className="form-group">
            <label>Target Repository</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-primary)' }}>
                {targetRepo || existingRepo}
              </span>
              <a
                href={`https://github.com/${targetRepo || existingRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--text-muted)' }}
              >
                view on GitHub →
              </a>
            </div>
            <span className="label-hint">Kit files will be added as a pull request — nothing merged without your review</span>
          </div>

          {/* Editable PR branch name */}
          <div className="form-group">
            <label htmlFor="gh-pr-branch">
              PR branch name <span className="badge badge-optional">editable</span>
            </label>
            <input
              id="gh-pr-branch"
              type="text"
              value={prBranch}
              onChange={e => setPrBranch(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, '-'))}
              placeholder="sdlc-kit-setup"
              disabled={phase === 'pushing'}
            />
            <span className="label-hint">Branch must not already exist in the repo</span>
          </div>
        </div>
      ) : (
        <div className="gh-repo-settings">
          <div className="form-group">
            <label htmlFor="gh-repo-name">
              Repository name <span className="badge badge-required">required</span>
            </label>
            <div className="gh-repo-name-row">
              <span className="gh-repo-owner">{user.login}&thinsp;/</span>
              <input
                id="gh-repo-name"
                type="text"
                value={repoName}
                onChange={e => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, '-'))}
                placeholder="my-project-sdd-kit"
                disabled={phase === 'pushing'}
              />
            </div>
            <span className="label-hint">github.com/{user.login}/{repoName || '…'}</span>
          </div>

          <div className="form-group">
            <label htmlFor="gh-repo-desc">
              Description <span className="badge badge-optional">optional</span>
            </label>
            <input
              id="gh-repo-desc"
              type="text"
              value={repoDesc}
              onChange={e => setRepoDesc(e.target.value)}
              placeholder={`SpecDD Starter Kit — ${projectName || 'my project'}`}
              disabled={phase === 'pushing'}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <label className={`radio-item ${!repoPrivate ? 'selected' : ''}`} style={{ flex: 1 }}>
              <input type="radio" name="gh-visibility" checked={!repoPrivate}
                onChange={() => setRepoPrivate(false)} disabled={phase === 'pushing'} />
              <div>
                <div className="item-label">Public</div>
                <div className="item-desc">Anyone can see this repository</div>
              </div>
            </label>
            <label className={`radio-item ${repoPrivate ? 'selected' : ''}`} style={{ flex: 1 }}>
              <input type="radio" name="gh-visibility" checked={repoPrivate}
                onChange={() => setRepoPrivate(true)} disabled={phase === 'pushing'} />
              <div>
                <div className="item-label">Private</div>
                <div className="item-desc">Only you can see this repository</div>
              </div>
            </label>
          </div>

        </div>
      )}

      {error && <div className="gh-error" style={{ marginTop: 16 }}>{error}</div>}

      {phase === 'pushing' ? (
        <div className="gh-progress" style={{ marginTop: 16 }}>
          <span className="gh-spinner" />
          {progress}
        </div>
      ) : mode === 'brownfield' ? (
        <button
          className="btn btn-github"
          style={{ marginTop: 16 }}
          onClick={createPr}
          disabled={!targetRepo || !prBranch.trim()}
        >
          <GHIcon />
          Create pull request ({fileCount} files)
        </button>
      ) : (
        <button
          className="btn btn-github"
          style={{ marginTop: 16 }}
          onClick={createAndPush}
          disabled={!repoName.trim()}
        >
          <GHIcon />
          Create repository &amp; push {fileCount} files
        </button>
      )}
    </div>
  );
}

// ── Inline GitHub icon (avoids separate icon dep) ───────────────────────────
function GHIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
