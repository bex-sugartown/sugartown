import { test, expect } from '@playwright/test'

// #266: below the sidebar breakpoint the Contents strip must sit directly under the header at every
// scroll position. It used to be fixed at the header's height from the viewport top, so at scroll 0 (the
// header sits below the banner and preheader) it was hidden behind the header.
test('Contents strip is not covered by the header at the top of the page or when scrolled', async ({ page }) => {
  await page.setViewportSize({ width: 548, height: 900 })
  await page.goto('/articles')
  await page.waitForLoadState('networkidle')
  const href = await page.locator('a[class*="Card-module__titleLink"]').first().getAttribute('href')
  await page.goto(href!)
  await page.waitForLoadState('networkidle')
  const strip = page.locator('[class*="ContentsStrip_strip"], [class*="_strip_"]').first()
  if (!(await strip.count())) test.skip(true, 'this article has no sidebar content')

  const covered = () =>
    strip.evaluate((el) => {
      const b = el.getBoundingClientRect()
      const hit = document.elementFromPoint(b.left + 60, b.top + b.height / 2)
      return !(hit && el.contains(hit))
    })

  await expect.poll(covered, { message: 'strip at scroll 0' }).toBe(false)
  await page.evaluate(() => window.scrollTo(0, 400))
  await expect.poll(covered, { message: 'strip after scrolling' }).toBe(false)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(covered, { message: 'strip back at scroll 0' }).toBe(false)
})
