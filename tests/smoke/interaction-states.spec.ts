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

// ST-252: the same contract for links, rows, disclosures and cards. Pressed is the inset shade on
// rows, cards and toggles ('shade') or a heavier underline on text links ('underline'). Each
// surface also draws the DS focus ring. Not covered here: the citation marker and back-link and the
// FilterBar option (no hoverable target on the pages tried), Sidebar and SidebarNav (not visible on any page tried);
// those were checked with forced pseudo-states in the rendered probe.
type Pressed = 'shade' | 'underline'
type Surface252 = { name: string; path: string; selector: string; box?: string; pressed: Pressed }

const A = '/articles/pink-moon-and-ledger'
const SURFACES_252: Surface252[] = [
  { name: 'Accordion trigger', path: A, selector: 'button[class*="Accordion-module__trigger"]', pressed: 'shade' },
  { name: 'Breadcrumb link', path: '/tools/aem', selector: 'a[class*="Breadcrumb-module__link"]', pressed: 'underline' },
  { name: 'List row', path: '/tools/aem-assets', selector: 'a[class*="List-module__rowLink"]', pressed: 'shade' },
  { name: 'Card', path: '/articles', selector: 'a[class*="Card-module__titleLink"]', box: '[class*="Card-module__card"]', pressed: 'shade' },
  { name: 'IndexCell', path: '/glossary', selector: '[class*="IndexCell-module__cell"]', pressed: 'shade' },
]

const snap = (el: Locator) =>
  el.evaluate((e) => {
    const c = getComputedStyle(e)
    return { boxShadow: c.boxShadow, thickness: c.textDecorationThickness, bg: c.backgroundColor }
  })

for (const theme of ['light', 'dark'] as Theme[]) {
  for (const s of SURFACES_252) {
    test(`states (${theme}): ${s.name} shows pressed and a focus ring`, async ({ page }) => {
      await applyTheme(page, theme)
      await page.goto(s.path)
      await page.waitForLoadState('networkidle')
      await assertTheme(page, theme)
      const el = page.locator(s.selector).locator('visible=true').first()
      const box = s.box ? el.locator(`xpath=ancestor::*[contains(@class,"${s.box.slice(s.box.indexOf('"') + 1, -2)}")][1]`) : el
      await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await page.waitForTimeout(400) // smooth-scroll and sticky header settle before the pointer lands
      // Press on the interactive element itself: the card's body is not the link.
      const bb = await (s.box ? el : box).boundingBox()
      if (!bb) throw new Error('no box for ' + s.name)
      await el.hover({ position: { x: Math.min(bb.width / 2, 40), y: bb.height / 2 } }) // actionability scrolls inner containers
      await page.waitForTimeout(300) // hover transitions settle
      const hover = await snap(box)
      await page.mouse.down()
      if (s.pressed === 'shade') await expect.poll(async () => (await snap(box)).boxShadow, { message: 'pressed shade' }).toMatch(/inset/)
      if (s.pressed === 'underline') await expect.poll(async () => (await snap(el)).thickness, { message: 'pressed underline' }).not.toBe(hover.thickness)
      // Release away from the element: a click would navigate or toggle.
      await page.mouse.move(0, 0)
      await page.mouse.up()

      const target = el
      await page.keyboard.press('Tab') // keyboard modality, so :focus-visible applies to the focus below
      await target.focus()
      // Card draws its ring on the title link's ::after, which covers the card.
      const outline = await target.evaluate((e, pseudo) => getComputedStyle(e, pseudo).outlineStyle, s.name === 'Card' ? '::after' : null)
      expect(outline, 'DS focus ring').toBe('solid')
    })
  }
}
