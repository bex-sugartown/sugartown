import { test, expect, devices } from '@playwright/test'

// #267: hover effects apply only where the device can hover, so a tap does not leave a lift, glow or
// wash behind (pressed, :active, is the touch feedback). Playwright's emulated tap does not leave a
// device :hover state, so this reads the loaded stylesheets instead: in a touch context no :hover
// rule may be active. A rule outside `@media (hover: hover)` is active there and fails the test.
test.use({ ...devices['Pixel 7'] })

const ROUTES = ['/', '/articles', '/platform/governance']

for (const route of ROUTES) {
  test(`touch: no :hover rule is active on ${route}`, async ({ page }) => {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => matchMedia('(hover: hover)').matches), 'touch context cannot hover').toBe(false)

    const active = await page.evaluate(() => {
      const found: string[] = []
      const walk = (rules: CSSRuleList) => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSMediaRule) {
            if (matchMedia(rule.conditionText).matches) walk(rule.cssRules)
          } else if (rule instanceof CSSStyleRule) {
            if (/:hover\b/.test(rule.selectorText)) found.push(rule.selectorText)
            walk(rule.cssRules)
          } else if ('cssRules' in rule) {
            walk((rule as CSSGroupingRule).cssRules)
          }
        }
      }
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          walk(sheet.cssRules)
        } catch {
          // cross-origin sheet (fonts): nothing of ours in it
        }
      }
      return found
    })
    expect(active, 'hover rules active on touch').toEqual([])
  })
}
