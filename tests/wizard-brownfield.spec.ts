/**
 * End-to-end test: EY ATTG SDLC Wizard — Brownfield path
 *
 * Walks through all 9 wizard steps and creates a PR on an existing repository.
 *
 * Prerequisites:
 *   Set GITHUB_PAT and (optionally) BROWNFIELD_REPO before running:
 *     $env:GITHUB_PAT = "ghp_..."
 *     $env:BROWNFIELD_REPO = "owner/repo"
 *     npx playwright test
 */

import { test, expect, type Page } from '@playwright/test';

const GITHUB_PAT = process.env.GITHUB_PAT ?? '';
const BROWNFIELD_REPO = process.env.BROWNFIELD_REPO ?? '';
const PLANNING_AGENT_NAME = 'planningAgent';
const PLANNING_AGENT_ASSIGNMENT_COMMENT = '/agent planningAgent';
const BROWNFIELD_PROJECT_NAME = `Brownfield SDLC Validation ${Date.now()}`;

if (!GITHUB_PAT) {
  throw new Error(
    'GITHUB_PAT environment variable is not set.\n'
    + 'Create a classic token with repo/workflow scopes at https://github.com/settings/tokens\n'
    + 'then run:  $env:GITHUB_PAT = "ghp_..." before running the test.'
  );
}

if (!BROWNFIELD_REPO) {
  throw new Error(
    'BROWNFIELD_REPO environment variable is not set.\n'
    + 'This test now requires an explicit target repository because it must create and merge a real PR.\n'
    + 'Set it like:  $env:BROWNFIELD_REPO = "owner/repo" before running the test.'
  );
}

async function clickNext(page: Page) {
  await dismissDevToolbar(page);
  const activeStep = page.locator('.wizard-step-item.active .wizard-step-label');
  const currentStep = (await activeStep.textContent())?.trim() || '';
  const startBtn = page.getByRole('button', { name: /let'?s get started/i });
  const btn = await startBtn.isVisible().catch(() => false)
    ? startBtn
    : page.locator('.wizard-footer-right .btn-primary').last();

  for (let attempt = 0; attempt < 5; attempt++) {
    await btn.click({ force: true });
    try {
      await expect(activeStep).not.toHaveText(currentStep, { timeout: 1200 });
      return;
    } catch {
      // Retry until the wizard advances after hydration/UI settles.
    }
  }
}

async function dismissDevToolbar(page: Page) {
  await page.locator('astro-dev-toolbar').evaluateAll(nodes => {
    for (const node of nodes) node.remove();
  }).catch(() => {});
}

function activeStep(page: Page) {
  return page.locator('.wizard-step-item.active .wizard-step-label');
}

function welcomeModeSummary(page: Page) {
  return page.locator('.welcome-hero-left p').last();
}

async function selectExistingProject(page: Page) {
  const existingProject = page.getByRole('button', { name: /existing project/i });
  for (let attempt = 0; attempt < 6; attempt++) {
    await existingProject.click({ force: true });
    try {
      await expect(welcomeModeSummary(page)).toContainText(/opens a pr on your existing repo/i, { timeout: 1500 });
      return;
    } catch {
      await page.waitForTimeout(300);
    }
  }
  throw new Error('Brownfield mode did not activate on the Welcome step.');
}

async function toggleCard(page: Page, labelText: string) {
  await page.locator('.checkbox-item, .radio-item, .mcp-card, .agent-card, .gov-level-card')
    .filter({ hasText: labelText })
    .first()
    .click();
}

function parseOwnerRepoFromUrl(url: string) {
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!match) throw new Error(`Could not parse owner/repo from URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}

function parseIssueNumberFromUrl(url: string) {
  const match = url.match(/\/issues\/(\d+)/i);
  if (!match) throw new Error(`Could not parse issue number from URL: ${url}`);
  return Number(match[1]);
}

function parsePrNumberFromUrl(url: string) {
  const match = url.match(/\/pull\/(\d+)/i);
  if (!match) throw new Error(`Could not parse PR number from URL: ${url}`);
  return Number(match[1]);
}

async function ghApi(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_PAT}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${path} failed: HTTP ${res.status} ${text}`);
  }

  return res;
}

async function mergePullRequest(prUrl: string) {
  const { owner, repo } = parseOwnerRepoFromUrl(prUrl);
  const pullNumber = parsePrNumberFromUrl(prUrl);

  await ghApi(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
    method: 'PUT',
    body: JSON.stringify({ merge_method: 'squash' }),
  });

  const prRes = await ghApi(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  const pr = await prRes.json();
  expect(pr.merged).toBeTruthy();
}

async function assignIssueToPlanningAgent(issueUrl: string) {
  const { owner, repo } = parseOwnerRepoFromUrl(issueUrl);
  const issueNumber = parseIssueNumberFromUrl(issueUrl);

  try {
    await ghApi(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      body: JSON.stringify({ assignees: ['copilot'] }),
    });
  } catch {
    // Non-blocking: some repositories do not allow assigning copilot directly.
  }

  await ghApi(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: PLANNING_AGENT_ASSIGNMENT_COMMENT }),
  });

  const commentsRes = await ghApi(`/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`);
  const comments = await commentsRes.json();
  const hasAssignmentComment = comments.some((c: { body?: string }) =>
    (c.body || '').includes(PLANNING_AGENT_ASSIGNMENT_COMMENT) ||
    (c.body || '').includes(PLANNING_AGENT_NAME)
  );
  expect(hasAssignmentComment).toBeTruthy();
}

test('brownfield flow creates PR, issue, merges PR, and assigns planning agent', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await dismissDevToolbar(page);
  await expect(activeStep(page)).toContainText(/welcome/i);

  // Step 0: switch to brownfield mode, then start
  await selectExistingProject(page);
  await clickNext(page);
  await expect(page.locator('#proj-repo-0')).toBeVisible({ timeout: 10_000 });

  // Step 1: project + required brownfield repository
  await expect(activeStep(page)).toContainText(/project/i);
  await page.fill('#proj-repo-0', BROWNFIELD_REPO);
  await page.fill('#proj-name', BROWNFIELD_PROJECT_NAME);
  await page.fill('#proj-desc', 'Validate brownfield PR flow for existing repositories');
  await page.fill('#proj-problem', 'Need confidence that brownfield path creates PRs safely without overwriting files.');
  await page.fill('#persona-0-role', 'Engineering Lead');
  await page.fill('#persona-0-desc', 'Owns modernization and delivery workflow');
  await page.fill('#persona-0-goals', 'Add SDLC kit to existing repos through controlled PRs');
  await clickNext(page);

  // Step 2: tech stack
  await expect(activeStep(page)).toContainText(/tech stack/i);
  await toggleCard(page, 'TypeScript');
  await page.selectOption('#fe-select', 'React');
  await page.selectOption('#be-select', 'ASP.NET Core');
  await page.selectOption('#source-control-select', 'GitHub');
  await toggleCard(page, 'GitHub Actions');
  await clickNext(page);

  // Step 3: governance
  await expect(activeStep(page)).toContainText(/governance/i);
  await clickNext(page);

  // Step 4: principles
  await expect(activeStep(page)).toContainText(/principles/i);
  await page.fill('#code-quality', 'Lint, test, and review before merge');
  await page.fill('#perf-target', 'API p99 < 300ms');
  await page.fill('#test-coverage', '80');
  await clickNext(page);

  // Step 5: MCP tools
  await expect(activeStep(page)).toContainText(/mcp/i);
  await toggleCard(page, 'GitHub MCP');
  await clickNext(page);

  // Step 6: agent
  await expect(activeStep(page)).toContainText(/agent/i);
  await clickNext(page);

  // Step 7: preview
  await expect(activeStep(page)).toContainText(/preview/i);
  await clickNext(page);

  // Step 8: publish
  await expect(activeStep(page)).toContainText(/publish/i);
  await page.fill('#gh-pat', GITHUB_PAT);
  await page.click('button:has-text("Connect")');

  await expect(page.locator('.gh-user-badge')).toBeVisible({ timeout: 20_000 });
  await page.click('button:has-text("Create pull request")');

  await expect(page.locator('.gh-success')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('.gh-success h3')).toContainText(/Pull request/i);

  const prLink = page.locator('.gh-success a', { hasText: 'Open PR' }).first();
  await expect(prLink).toBeVisible({ timeout: 10_000 });
  const prHref = await prLink.getAttribute('href');
  if (!prHref) throw new Error('PR URL was not present in brownfield success state.');

  const issueLink = page.locator('.gh-success a[href*="/issues/"]');
  await expect(issueLink).toBeVisible({ timeout: 10_000 });
  const issueHref = await issueLink.getAttribute('href');
  if (!issueHref) throw new Error('Issue URL was not present in brownfield success state.');

  await mergePullRequest(prHref);
  await assignIssueToPlanningAgent(issueHref);

  console.log(`\n✓ Brownfield PR created: ${prHref}`);
  console.log(`✓ Brownfield issue created: ${issueHref}`);
  console.log('✓ Brownfield PR merged');
  console.log(`✓ Assigned issue to planning agent: ${PLANNING_AGENT_NAME}\n`);
});
