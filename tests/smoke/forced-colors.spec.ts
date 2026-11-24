import { test, expect, type Locator } from '@playwright/test'

// #262: in forced-colours mode the browser removes box-shadow and replaces colours, so pressed used to
// match hover and some hover matched rest. Each shaded surface now draws a Highlight outline: 1px on
// hover, 3px while pressed. This spec runs the real pointer against the built site with forced colours emulated
// per page (page.emulateMedia; the test.use option did not take effect here).

type Surface = { name: string; path: string; selector: string; box?: string }
const A = '/articles/pink-moon-and-ledger'
const SURFACES: Surface[] = [
  { name: 'List row', path: '/tools/aem-assets', selector: 'a[class*="List-module__rowLink"]' },
  { name: 'Accordion trigger', path: A, selector: 'button[class*="Accordion-module__trigger"]' },
  { name: 'IndexCell', path: '/glossary', selector: '[class*="IndexCell-module__cell"]' },
  { name: 'Button primary', path: '/', selector: 'a[class*="Button-module__primary"], button[class*="Button-module__primary"]' },
  { name: 'Chip link', path: '/', selector: 'a[class*="Chip-module__interactive"]' },
  { name: 'Card', path: '/articles', selector: 'a[class*="Card-module__titleLink"]', box: 'Card-module__card' },
]

const outline = (el: Locator) => el.evaluate((e) => { const c = getComputedStyle(e); return `${c.outlineStyle} ${c.outlineWidth}` })

for (const s of SURFACES) {
  test(`forced colours: ${s.name} shows hover and pressed`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
    await page.goto(s.path)
    await page.waitForLoadState('networkidle')
    const el = page.locator(s.selector).locator('visible=true').first()
    const box = s.box ? el.locator(`xpath=ancestor::*[contains(@class,"${s.box}")][1]`) : el
    await el.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }))
    await page.waitForTimeout(400)
    const rest = await outline(box)
    const bb = await el.boundingBox()
    if (!bb) throw new Error('no box for ' + s.name)
    await el.hover({ position: { x: Math.min(bb.width / 2, 40), y: bb.height / 2 } })
    await expect.poll(() => outline(box), { message: 'hover outline' }).toBe('solid 1px')
    expect(rest, 'rest has no outline').not.toBe('solid 1px')
    await page.mouse.down()
    await expect.poll(() => outline(box), { message: 'pressed outline' }).toBe('solid 3px')
    // Release away from the element: a click would navigate or toggle.
    await page.mouse.move(0, 0)
    await page.mouse.up()
  })
}
