import { defineConfig, devices } from '@playwright/test'

/**
 * Route smoke tests — a tripwire, not a test suite. Five specs, one
 * assertion each, proving the app actually renders. See SUG-240.
 *
 * Runs against a built preview (`vite preview`), not the dev server —
 * matches how a real regression would surface. Playwright's `webServer`
 * builds and starts the preview automatically; set PLAYWRIGHT_BASE_URL to
 * point at an already-running server (e.g. a Netlify deploy preview)
 * instead.
 */

const PORT = 4173
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,

  use: {
    baseURL,
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only spin up a local preview server when no external base URL is given.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm --filter web build && pnpm --filter web preview -- --port 4173',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})
