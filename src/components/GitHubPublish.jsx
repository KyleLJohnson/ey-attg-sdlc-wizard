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
 */

import { useState } from 'react';

const GITHUB_API = 'https://api.github.com';
const PAT_CREATE_URL = 'https://github.com/settings/tokens/new?scopes=repo&description=EY+ATTG+SDLC+Wizard';

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
export default function GitHubPublish({ files, projectName, mode = 'greenfield', existingRepo = '' }) {
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
  async function createPr() {
    if (!token || !targetRepo) return;
    setPhase('pushing');
    setError('');
    const branch = prBranch.trim() || 'sdlc-kit-setup';

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
      const latestCommitSha = refData.object.sha;

      // Step 3: Get base tree SHA from that commit
      const commitRes = await ghFetch(`/repos/${targetRepo}/git/commits/${latestCommitSha}`, token);
      if (!commitRes.ok) throw new Error('Could not read latest commit.');
      const commitData = await commitRes.json();
      const baseTreeSha = commitData.tree.sha;

      // Step 4: Build kit tree on top of existing content
      setProgress(`Building git tree (${fileCount} files)…`);
      const treeItems = Object.entries(files).map(([path, content]) => ({
        path, mode: '100644', type: 'blob', content,
      }));
      const treeRes = await ghFetch(`/repos/${targetRepo}/git/trees`, token, {
        method: 'POST',
        body: { tree: treeItems, base_tree: baseTreeSha },
      });
      if (!treeRes.ok) {
        const e = await treeRes.json().catch(() => ({}));
        throw new Error(`Could not create git tree: ${e.message || treeRes.status}`);
      }
      const tree = await treeRes.json();

      // Step 5: Create commit
      setProgress('Creating commit…');
      const commitCreateRes = await ghFetch(`/repos/${targetRepo}/git/commits`, token, {
        method: 'POST',
        body: {
          message: 'chore: add SpecDD Starter Kit\n\nGenerated by the EY ATTG SDLC Wizard.',
          tree: tree.sha,
          parents: [latestCommitSha],
        },
      });
      if (!commitCreateRes.ok) {
        const e = await commitCreateRes.json().catch(() => ({}));
        throw new Error(`Could not create commit: ${e.message || commitCreateRes.status}`);
      }
      const newCommit = await commitCreateRes.json();

      // Step 6: Create PR branch
      setProgress(`Creating branch "${branch}"…`);
      const branchRes = await ghFetch(`/repos/${targetRepo}/git/refs`, token, {
        method: 'POST',
        body: { ref: `refs/heads/${branch}`, sha: newCommit.sha },
      });
      if (!branchRes.ok) {
        const e = await branchRes.json().catch(() => ({}));
        const msg = e.errors?.[0]?.message || e.message || branchRes.status;
        throw new Error(`Could not create branch "${branch}": ${msg}`);
      }

      // Step 7: Open PR
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
          head: branch,
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
      const issueBody = [
        '## Project Summary',
        '',
        `**Name:** ${projectName || targetRepo}`,
        '',
        `**Repository:** ${targetRepo}`,
        '',
        '---',
        '*Generated by the EY ATTG SDLC Wizard.*',
      ].join('\n');
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
  // Uses auto_init:true so the git backend is ready before tree API calls,
  // avoiding the "Git Repository is empty" 409 error on brand-new repos.
  async function createAndPush() {
    if (!token || !repoName.trim()) return;
    setPhase('pushing');
    setError('');

    try {
      // ── Step 1: Create the repository (auto_init seeds the git backend) ──
      setProgress('Creating repository…');
      const createRes = await ghFetch('/user/repos', token, {
        method: 'POST',
        body: {
          name:        repoName.trim(),
          description: repoDesc.trim() || `SpecDD Starter Kit — ${projectName || 'my project'}`,
          private:     repoPrivate,
          auto_init:   true,   // ensures git backend is ready; we will overwrite with our commit
        },
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        const msg = err.errors?.[0]?.message || err.message || `HTTP ${createRes.status}`;
        throw new Error(`Could not create repository: ${msg}`);
      }
      const repo = await createRes.json();
      const defaultBranch = repo.default_branch || 'main';

      // ── Step 2: Get the initial commit SHA created by auto_init ──────────
      setProgress('Reading initial commit…');
      const initRefRes = await ghFetch(`/repos/${repo.full_name}/git/ref/heads/${defaultBranch}`, token);
      if (!initRefRes.ok) {
        const err = await initRefRes.json().catch(() => ({}));
        throw new Error(`Could not read initial ref: ${err.message || initRefRes.status}`);
      }
      const initRef = await initRefRes.json();
      const initialCommitSha = initRef.object.sha;

      // ── Step 3: Build kit tree (all files inline, no base_tree) ──────────
      // Omitting base_tree gives us a clean tree with only our kit files,
      // replacing the auto_init README.md entirely.
      setProgress(`Building git tree (${fileCount} files)…`);
      const treeItems = Object.entries(files).map(([path, content]) => ({
        path,
        mode: '100644',
        type: 'blob',
        content,
      }));
      const treeRes = await ghFetch(`/repos/${repo.full_name}/git/trees`, token, {
        method: 'POST',
        body: { tree: treeItems },
      });
      if (!treeRes.ok) {
        const err = await treeRes.json().catch(() => ({}));
        throw new Error(`Could not create git tree: ${err.message || treeRes.status}`);
      }
      const tree = await treeRes.json();

      // ── Step 4: Create kit commit (parent = auto_init commit) ─────────────
      setProgress('Creating commit…');
      const commitRes = await ghFetch(`/repos/${repo.full_name}/git/commits`, token, {
        method: 'POST',
        body: {
          message: 'chore: initialize SpecDD Starter Kit\n\nGenerated by the EY ATTG SDLC Setup Wizard.',
          tree:    tree.sha,
          parents: [initialCommitSha],
        },
      });
      if (!commitRes.ok) {
        const err = await commitRes.json().catch(() => ({}));
        throw new Error(`Could not create commit: ${err.message || commitRes.status}`);
      }
      const commit = await commitRes.json();

      // ── Step 5: Fast-forward default branch to our commit ────────────────
      setProgress(`Updating ${defaultBranch} branch…`);
      const updateRefRes = await ghFetch(`/repos/${repo.full_name}/git/refs/heads/${defaultBranch}`, token, {
        method: 'PATCH',
        body: { sha: commit.sha, force: false },
      });
      if (!updateRefRes.ok) {
        const err = await updateRefRes.json().catch(() => ({}));
        throw new Error(`Could not update branch ref: ${err.message || updateRefRes.status}`);
      }

      // ── Step 6: Create SDLC label + issue to kick off agentic workflow ────
      setProgress('Creating SDLC label…');
      await ghFetch(`/repos/${repo.full_name}/labels`, token, {
        method: 'POST',
        body: { name: 'SDLC', color: '0075ca', description: 'Triggers the SDLC Greenfield Planning agentic workflow' },
      });

      setProgress('Creating project summary issue…');
      const issueBody = [
        `## Project Summary`,
        ``,
        `**Name:** ${projectName || repoName.trim()}`,
        ``,
        `**Description:** ${repoDesc.trim() || `SpecDD Starter Kit \u2014 ${projectName || 'my project'}`}`,
        ``,
        `---`,
        `*Generated by the EY ATTG SDLC Wizard.*`,
      ].join('\n');
      const issueRes = await ghFetch(`/repos/${repo.full_name}/issues`, token, {
        method: 'POST',
        body: {
          title:  `Project: ${projectName || repoName.trim()}`,
          body:   issueBody,
          labels: ['SDLC'],   // fires issues.labeled → Greenfield Planning workflow
        },
      });
      if (issueRes.ok) {
        const issue = await issueRes.json();
        setIssueUrl(issue.html_url);
      }
      // Issue creation failure is non-fatal — repo push already succeeded

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
                View SDLC issue (workflow running) →
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
              <li>Click <strong>Create SDLC Issue</strong> above — this labels it <code>SDLC</code> and triggers the Planning agentic workflow.</li>
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
        <p>Your SpecDD Starter Kit has been pushed to GitHub. The Greenfield Planning workflow will start automatically.</p>
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
              View project issue (SDLC workflow running) →
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
          <strong>Required scope:</strong> <code>repo</code> — to create and write to repositories.{' '}
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
