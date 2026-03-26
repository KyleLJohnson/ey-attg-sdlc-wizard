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
export default function GitHubPublish({ files, projectName }) {
  // Auth
  const [pat, setPat]         = useState('');
  const [showPat, setShowPat] = useState(false);
  const [token, setToken]     = useState(null);
  const [user, setUser]       = useState(null);

  // Repo config
  const [repoName, setRepoName]       = useState(slugify(projectName));
  const [repoDesc, setRepoDesc]       = useState('');
  const [repoPrivate, setRepoPrivate] = useState(false);

  // Process
  const [phase, setPhase]       = useState('idle');  // idle | verifying | pushing | done | error
  const [progress, setProgress] = useState('');
  const [repoUrl, setRepoUrl]   = useState('');
  const [error, setError]       = useState('');

  const fileCount = files ? Object.keys(files).length : 0;

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

  // ── Create repo + push all files in 4 API calls ──────────────────────────
  async function createAndPush() {
    if (!token || !repoName.trim()) return;
    setPhase('pushing');
    setError('');

    try {
      // ── Step 1: Create the repository ────────────────────────────────────
      setProgress('Creating repository…');
      const createRes = await ghFetch('/user/repos', token, {
        method: 'POST',
        body: {
          name:        repoName.trim(),
          description: repoDesc.trim() || `SpecDD Starter Kit — ${projectName || 'my project'}`,
          private:     repoPrivate,
          auto_init:   false,   // empty repo — we supply the initial commit
        },
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        const msg = err.errors?.[0]?.message || err.message || `HTTP ${createRes.status}`;
        throw new Error(`Could not create repository: ${msg}`);
      }
      const repo = await createRes.json();

      // ── Step 2: Build git tree (all files in one request) ─────────────────
      // Passing content inline avoids one blob-creation call per file.
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

      // ── Step 3: Create initial commit ────────────────────────────────────
      setProgress('Creating initial commit…');
      const commitRes = await ghFetch(`/repos/${repo.full_name}/git/commits`, token, {
        method: 'POST',
        body: {
          message: 'chore: initialize SpecDD Starter Kit\n\nGenerated by the SpecDD Starter Kit Setup Wizard.',
          tree:    tree.sha,
          parents: [],
        },
      });
      if (!commitRes.ok) {
        const err = await commitRes.json().catch(() => ({}));
        throw new Error(`Could not create commit: ${err.message || commitRes.status}`);
      }
      const commit = await commitRes.json();

      // ── Step 4: Create main branch ref ───────────────────────────────────
      setProgress('Setting up main branch…');
      const refRes = await ghFetch(`/repos/${repo.full_name}/git/refs`, token, {
        method: 'POST',
        body: { ref: 'refs/heads/main', sha: commit.sha },
      });
      if (!refRes.ok) {
        const err = await refRes.json().catch(() => ({}));
        throw new Error(`Could not create branch ref: ${err.message || refRes.status}`);
      }

      // ── Step 5: Set default branch ────────────────────────────────────────
      await ghFetch(`/repos/${repo.full_name}`, token, {
        method: 'PATCH',
        body: { default_branch: 'main' },
      });

      setRepoUrl(repo.html_url);
      setPhase('done');
    } catch (err) {
      setError(err.message || 'Push failed. Please try again.');
      setPhase('error');
    }
  }

  // ── Render: success ──────────────────────────────────────────────────────
  if (phase === 'done') {
    const shortName = repoUrl.replace('https://github.com/', '');
    return (
      <div className="gh-success">
        <div className="gh-success-check">✓</div>
        <h3>Repository created!</h3>
        <p>Your SpecDD Starter Kit has been pushed to GitHub.</p>
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-github"
          style={{ display: 'inline-flex', gap: 8, marginBottom: 24 }}
        >
          <GHIcon />
          Open {shortName} →
        </a>
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

      {/* Repo settings */}
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

      {error && <div className="gh-error" style={{ marginTop: 16 }}>{error}</div>}

      {phase === 'pushing' ? (
        <div className="gh-progress" style={{ marginTop: 16 }}>
          <span className="gh-spinner" />
          {progress}
        </div>
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
