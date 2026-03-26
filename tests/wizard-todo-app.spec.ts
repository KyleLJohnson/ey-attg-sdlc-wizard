/**
 * End-to-end test: EY ATTG SDLC Wizard — "Todo Azure App Service" project
 *
 * Walks through all 9 wizard steps and publishes a real GitHub repo.
 *
 * Prerequisites:
 *   Set GITHUB_PAT to a classic token with `repo` scope before running:
 *     $env:GITHUB_PAT = "ghp_..."
 *     npx playwright test
 */

import { test, expect, type Page } from '@playwright/test';

// ── Config ────────────────────────────────────────────────────────────────────
const GITHUB_PAT  = process.env.GITHUB_PAT ?? '';
const REPO_NAME   = 'todo-azure-app-service-sdd';

if (!GITHUB_PAT) {
  throw new Error(
    'GITHUB_PAT environment variable is not set.\n' +
    'Create a classic token with repo scope at https://github.com/settings/tokens\n' +
    'then run:  $env:GITHUB_PAT = "ghp_..." before running the test.'
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Click Next / the primary footer CTA */
async function clickNext(page: Page) {
  // The next button is always the last button in .wizard-footer-right
  const nextBtn = page.locator('.wizard-footer-right .btn-primary').last();
  await nextBtn.click();
}

/** Toggle a checkbox-item or radio-item card by its visible label text */
async function toggleCard(page: Page, labelText: string) {
  await page.locator('.checkbox-item, .radio-item, .mcp-card, .agent-card, .gov-level-card')
    .filter({ hasText: labelText })
    .first()
    .click();
}

// ── Test ──────────────────────────────────────────────────────────────────────
test('create Todo Azure App Service project and publish to GitHub', async ({ page }) => {

  // ── Step 0: Welcome ──────────────────────────────────────────────────────
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/welcome|get started/i);
  await clickNext(page);

  // ── Step 1: Project ──────────────────────────────────────────────────────
  await expect(page.locator('h1')).toContainText(/project/i);

  await page.fill('#proj-name', 'Todo Azure App Service');
  await page.fill('#proj-desc', 'A task management app for managing to-do items hosted on Azure App Service');
  await page.fill('#proj-problem', 'Teams need a simple, reliable task tracker that integrates with Azure AD and scales on Azure infrastructure.');

  // Fill persona 1
  await page.fill('#persona-0-role', 'End User');
  await page.fill('#persona-0-desc', 'Knowledge worker who creates and manages tasks');
  await page.fill('#persona-0-goals', 'Quickly create, assign, and complete tasks');

  // Business constraints
  await page.fill('#proj-biz-constraints', 'Must deploy to Azure\nMust use Microsoft Entra ID for auth');
  await page.fill('#proj-tech-constraints', 'Azure App Service only\nNo third-party cloud providers');

  await clickNext(page);

  // ── Step 2: Tech Stack ───────────────────────────────────────────────────
  await expect(page.locator('h1')).toContainText(/tech stack/i);

  // Languages
  await toggleCard(page, 'TypeScript');
  await toggleCard(page, 'C#');

  // Frontend
  await page.selectOption('#fe-select', 'React');

  // Backend
  await page.selectOption('#be-select', 'ASP.NET Core');

  // Testing
  await toggleCard(page, 'Playwright');

  // Source control
  await page.selectOption('#source-control-select', 'GitHub');

  // DevOps
  await toggleCard(page, 'GitHub Actions');
  await toggleCard(page, 'Azure DevOps (ADO)');

  // Database
  await page.selectOption('#db-select', 'Azure PostgreSQL');

  // Infrastructure
  await toggleCard(page, 'Azure Services');

  // Identity
  await toggleCard(page, 'Microsoft Entra ID (Azure AD)');

  await clickNext(page);

  // ── Step 3: Governance ───────────────────────────────────────────────────
  await expect(page.locator('h1')).toContainText(/governance/i);
  // L1 (Enterprise) and L4 (Product) are pre-selected and non-interactive — leave defaults
  await clickNext(page);

  // ── Step 4: Principles ───────────────────────────────────────────────────
  await expect(page.locator('h1')).toContainText(/principles/i);

  await page.fill('#code-quality', 'All code must be peer-reviewed, linted (ESLint/StyleCop), and covered by automated tests before merge');
  await page.fill('#perf-target', 'p99 API latency < 300ms; page load < 2s on 4G');

  // Test coverage — clear then type
  await page.fill('#test-coverage', '80');

  // Security
  await toggleCard(page, 'OWASP Top 10');
  await toggleCard(page, 'GDPR');

  // Architecture style — Modular Monolith is already selected by default; keep it
  await expect(page.locator('.radio-item.selected')).toContainText(/modular monolith/i);

  await clickNext(page);

  // ── Step 5: MCP Tools ────────────────────────────────────────────────────
  await expect(page.locator('h1')).toContainText(/mcp/i);

  await toggleCard(page, 'GitHub MCP');
  await toggleCard(page, 'Azure DevOps MCP');

  await clickNext(page);

  // ── Step 6: Agent & LLM ─────────────────────────────────────────────────
  await expect(page.locator('h1')).toContainText(/agent/i);

  // GitHub Copilot is pre-selected — confirm and choose GPT-4o model
  await expect(page.locator('.agent-card.selected')).toContainText(/github copilot/i);
  await page.locator('.radio-item').filter({ hasText: 'GPT-4o' }).click();

  await clickNext(page);

  // ── Step 7: Preview ──────────────────────────────────────────────────────
  await expect(page.locator('h1')).toContainText(/preview/i);

  // Verify key files were generated
  await expect(page.locator('.preview-tab').filter({ hasText: 'context/project.md' })).toBeVisible();
  await expect(page.locator('.preview-tab').filter({ hasText: 'context/tech-stack.md' })).toBeVisible();
  await expect(page.locator('.preview-tab').filter({ hasText: '.github/copilot-instructions.md' })).toBeVisible();

  // Confirm the file content looks right
  await page.locator('.preview-tab').filter({ hasText: 'context/project.md' }).click();
  await expect(page.locator('.preview-body, pre, code').first()).toContainText(/Todo Azure App Service/i);

  await clickNext(page);

  // ── Step 8: Publish ──────────────────────────────────────────────────────
  await expect(page.locator('h1')).toContainText(/publish/i);

  // Enter PAT
  await page.fill('#gh-pat', GITHUB_PAT);
  await page.click('button:has-text("Connect")');

  // Wait for token verification — user badge should appear
  await expect(page.locator('.gh-user-badge')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.gh-user-login')).toBeVisible();

  // Set repo name and make it public
  await page.fill('#gh-repo-name', REPO_NAME);
  await page.fill('#gh-repo-desc', 'Todo Azure App Service — generated by EY ATTG SDLC Wizard');

  // Ensure Public is selected (it should be by default)
  await page.locator('input[type="radio"][name="gh-visibility"]').first().check();

  // Push!
  await page.click('button:has-text("Create repository")');

  // Wait for success state — GitHub API calls can take a few seconds
  await expect(page.locator('.gh-success')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.gh-success h3')).toContainText(/repository created/i);

  // Confirm the repo link points to our expected repo
  const repoLink = page.locator('.gh-success a[href*="github.com"]').first();
  await expect(repoLink).toBeVisible();
  const href = await repoLink.getAttribute('href');
  expect(href).toContain(REPO_NAME);

  // Confirm the project summary issue was created with SDLC label (triggers workflow)
  const issueLink = page.locator('.gh-success a[href*="/issues/"]');
  await expect(issueLink).toBeVisible({ timeout: 10_000 });
  await expect(issueLink).toContainText(/SDLC workflow/i);
  const issueHref = await issueLink.getAttribute('href');
  expect(issueHref).toContain(REPO_NAME);
  expect(issueHref).toContain('/issues/');

  console.log(`\n✓ Repo created:      ${href}`);
  console.log(`✓ Issue + SDLC label: ${issueHref}`);
  console.log(`✓ Greenfield Planning workflow triggered\n`);
});
