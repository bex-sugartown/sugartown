import { test, expect } from '@playwright/test'

// Route: /categories/governance (TaxonomyDetailPage). Real category with 18
// associated documents at the time this spec was written — picked by GROQ
// count query, not assumption. Asserts the page does NOT render its
// zero-results empty state, and DOES render a non-zero result count.
test('category detail page filters to a non-empty content set', async ({ page }) => {
  await page.goto('/categories/governance')

  await expect(page.getByText(/No content associated with this/i)).toHaveCount(0)
  await expect(page.getByText(/^\d+ items?$/)).toBeVisible()
})
