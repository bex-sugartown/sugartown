import { test, expect } from '@playwright/test'

// A known bad path — asserts the SPA catch-all route renders NotFoundPage,
// not a white screen. `vite preview`'s historyApiFallback returns 200 +
// index.html for any path, so the real assertion is client-side content,
// not the HTTP status.
test('unknown route renders the 404 view, not a white screen', async ({ page }) => {
  await page.goto('/this-route-does-not-exist-smoke-test')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page Not Found')
})
