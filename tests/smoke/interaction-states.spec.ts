import { test, expect, type Page, type Locator } from '@playwright/test'
import type { Theme } from './helpers/axe-allowlist'
import { applyTheme, assertTheme } from './helpers/theme'

// ST-251: hover, pressed and keyboard focus on the design-system chips, buttons and segmented
// controls, in both themes. Storybook cannot show these states in a static story, so this spec is
// where they are checked. Each surface asserts the contract: hover lifts and glows (the pill glows
// only), pressed adds the inset shade with no lift, keyboard focus draws the DS ring.
type Surface = {
  name: string
  path: string
  selector: string
  lift: boolean // hover lifts 1px
  glow: boolean // hover adds the soft glow
}

const SURFACES: Surface[] = [
  { name: 'Chip link', path: '/', selector: 'a[class*="Chip-module__interactive"]', lift: true, glow: true },
  { name: 'Button primary', path: '/', selector: 'a[class*="Button-module__primary"], button[class*="Button-module__primary"]', lift: false, glow: false },
  { name: 'IconButton', path: '/', selector: 'button[class*="IconButton-module__iconButton"]', lift: true, glow: true },
  { name: 'SegmentedControl pill, selected', path: '/platform/governance', selector: '[role=radio][aria-checked="true"]', lift: false, glow: true },
]

const style = (el: Locator) =>
  el.evaluate((e) => {
    const c = getComputedStyle(e)
    return { transform: c.transform, boxShadow: c.boxShadow, outlineStyle: c.outlineStyle }
  })

async function open(page: Page, theme: Theme, surface: Surface) {
  await applyTheme(page, theme)
  await page.goto(surface.path)
  await page.waitForLoadState('networkidle')
  await assertTheme(page, theme)
  const el = page.locator(surface.selector).locator('visible=true').first()
  await el.scrollIntoViewIfNeeded()
  return el
}

for (const theme of ['light', 'dark'] as Theme[]) {
  for (const surface of SURFACES) {
    test(`states (${theme}): ${surface.name} hovers, presses and focuses per the contract`, async ({ page }) => {
      const el = await open(page, theme, surface)

      // Poll: styles settle over the 150 to 200ms transitions, and a loaded runner can be slower.
      await el.hover()
      await expect.poll(async () => (await style(el)).transform !== 'none', { message: 'hover lift' }).toBe(surface.lift)
      await expect
        .poll(async () => { const b = (await style(el)).boxShadow; return b !== 'none' && !b.includes('inset') }, { message: 'hover glow' })
        .toBe(surface.glow)

      await page.mouse.down()
      await expect.poll(async () => (await style(el)).boxShadow, { message: 'pressed shade' }).toMatch(/inset/)
      await expect.poll(async () => (await style(el)).transform, { message: 'pressed does not lift' }).toBe('none')
      // Release away from the element: a click would navigate (Chip link) or switch the theme (IconButton).
      await page.mouse.move(0, 0)
      await page.mouse.up()

      await page.keyboard.press('Tab') // keyboard modality, so :focus-visible applies
      await el.focus()
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      expect((await style(el)).outlineStyle, 'DS focus ring').toBe('solid')
    })
  }
}
