import { test, expect } from '@playwright/test'

// Route: /articles (ArchivePage). Real published content — the articles
// archive has never been empty in production. Assertion checks shape
// ("more than zero cards"), not exact count or content, so it doesn't
// break on legitimate content updates.
test('articles archive renders more than zero cards', async ({ page }) => {
  await page.goto('/articles')

  const cards = page.locator('article')
  await expect(cards.first()).toBeVisible()
  expect(await cards.count()).toBeGreaterThan(0)
})
