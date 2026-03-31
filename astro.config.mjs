import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// When deployed via GitHub Actions, GITHUB_REPOSITORY is "owner/repo-name".
// We use the repo name as the base path automatically.
// Locally it falls back to BASE_PATH env var, or "/" (root).
const repoBase = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : (process.env.BASE_PATH || '/');

const disableDevToolbar = process.env.PLAYWRIGHT === '1' || process.env.CI === '1';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.github.io',
  base: repoBase,
  devToolbar: { enabled: !disableDevToolbar },
  integrations: [react()],
  output: 'static',
});
