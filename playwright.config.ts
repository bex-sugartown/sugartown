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

/**
 * `http://localhost:4173` must be registered as a Sanity CORS origin
 * (sanity.io/manage → API → CORS origins). Do not change this port without
 * adding the new one there first.
 *
 * Why it matters, and why the failure is confusing (SUG-260, 2026-08-08):
 * Sanity echoes the request origin back in Access-Control-Allow-Origin for
 * *authenticated* requests, but requires an explicit allowlist entry for
 * *anonymous* ones. The web client dropped its viewer token in SUG-260 Phase 3,
 * so every browser origin now has to be on that list.
 *
 * Three of these five specs hit routes the build does not prerender (the
 * articles archive, a tool detail page, a category detail page) and therefore
 * need a live client-side fetch. Without the CORS entry they fail as "zero
 * cards rendered", which reads like a content problem and is not one. Check the
 * browser console for a CORS error before investigating the data.
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
