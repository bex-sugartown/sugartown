import { test, expect } from '@playwright/test'

// Route: /tools/vercel (ToolDetailPage). Real published document, chosen
// because it's already the canonical sibling-comparison reference elsewhere
// in the repo's conventions (CLAUDE.md §Visual QA gate). Asserts the H1
// resolves real Sanity data, not a loading/placeholder state — catches the
// class of bug where a hooks-order violation renders a blank or stuck page.
test('tool detail page renders its real title, not a placeholder', async ({ page }) => {
  await page.goto('/tools/vercel')

  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toBeVisible()
  await expect(heading).toContainText('Vercel')
})
