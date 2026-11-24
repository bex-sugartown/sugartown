// Rendered state probe (ST-252 post-mortem). For each target, force hover, pressed and focus-visible with CDP
// pseudo-states and report whether a computed style changed, in light and dark. Run from the repo root with a dev
// server on :5173 whose DS package is freshly built (pnpm --filter @sugartown/design-system build):
//   node tests/probes/state-probe.cjs
// Add a target to the list when a new interactive component ships. The Phase 0 audit runs this before a vspec is drawn.
const { chromium } = require('@playwright/test')
const T = { light: 'light-pink-moon', dark: 'dark-pink-moon' }
const A = '/articles/pink-moon-and-ledger'
const targets = [
  ['Accordion trigger', A, 'button[class*="Accordion-module__trigger"]', 1280],
  ['Breadcrumb link', '/tools/aem', 'a[class*="Breadcrumb-module__link"]', 1280],
  ['List rowLink', '/tools/aem-assets', 'a[class*="List-module__rowLink"]', 1280],
  ['Card titleLink', '/articles', 'a[class*="Card-module__titleLink"]', 1280],
  ['Citation marker', A, 'a[class*="Citation-module__markerLink"]', 1280],
  ['Citation backLink', A, 'a[class*="Citation-module__backLink"]', 1280],
  ['FilterBar option', '/articles', 'label[class*="FilterBar-module__optionLabel"]', 1280],
  ['FilterBar clear-all', '/articles?tag=x', 'button[class*="FilterBar-module__clearAllButton"]', 1280],
  ['IndexCell', '/glossary', '[class*="IndexCell-module__cell"]', 1280],
  ['MediaLabel', '/about', '[class*="MediaLabel-module__mediaLabel"]', 1280],
  ['Input', '/contact', 'input[class*="Input-module__input"]', 1280],
  ['Textarea', '/contact', 'textarea[class*="Textarea-module__textarea"]', 1280],
  ['Sidebar toggle', A, '[class*="Sidebar-module__toggle"]', 375],
  ['SidebarNav link', A, 'a[class*="SidebarNav-module__navLink"]', 1280],
  ['PageSidebar link', A, 'a[class*="PageSidebar-module__relatedLink"]', 1280],
]
const sig = (e) => { const c = getComputedStyle(e); return [c.color, c.backgroundColor, c.borderTopColor, c.boxShadow, c.transform, c.outlineStyle + c.outlineColor, c.textDecorationLine, c.textDecorationThickness, c.opacity].join(' | ') }
;(async () => {
  const b = await chromium.launch()
  for (const theme of ['light', 'dark']) {
    for (const [name, path, sel, w] of targets) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 } })
      await ctx.addInitScript((v) => localStorage.setItem('st-theme', v), T[theme])
      const p = await ctx.newPage()
      await p.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' }).catch(() => {})
      const el = p.locator(sel).first()
      if (!(await el.count())) { console.log(theme, name.padEnd(20), 'NOT FOUND'); await ctx.close(); continue }
      await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.addStyleTag({ content: '*{transition:none!important}' })
      const cdp = await ctx.newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('CSS.enable')
      const h = await el.elementHandle(); const u = 'a' + Math.random().toString(36).slice(2)
      await h.evaluate((e, u) => e.setAttribute('data-probe', u), u)
      const { root } = await cdp.send('DOM.getDocument', { depth: 0 })
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-probe="${u}"]` })
      const get = () => h.evaluate(sig)
      const rest = await get(); const r = {}
      const force = async (f) => { await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: f }); await p.waitForTimeout(150); return get() }
      const hov = await force(['hover']); const prs = await force(['hover', 'active']); const foc = await force(['focus-visible', 'focus'])
      await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })
      console.log(theme.padEnd(5), name.padEnd(20), 'hover', hov !== rest ? 'CHANGE' : 'none  ', '| pressed vs hover', prs !== hov ? 'CHANGE' : 'none  ', '| focus', foc !== rest ? 'CHANGE' : 'none')
      await ctx.close()
    }
  }
  await b.close()
})()
