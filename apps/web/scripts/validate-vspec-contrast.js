#!/usr/bin/env node
/**
 * validate-vspec-contrast.js — measures the colour pairs a vspec declares (#263).
 *
 * `validate:contrast` checks token pairs. A vspec composes its own pairs (a hover label on a row wash,
 * a pressed label under the shade), and those were measured by hand until now. A vspec lists its pairs in
 * a sidecar `ST-N-slug.contrast.json` beside it:
 *
 *   { "vspec": "ST-N-slug.vspec.html",
 *     "pairs": [ { "name": "Label, hover", "cell": "list-hover", "sub": ".rowTitle",
 *                  "prop": "color", "min": 4.5, "shade": false, "pseudo": null } ] }
 *
 *   cell    value of the data-cell attribute on the prototype cell that holds the element
 *   sub     CSS selector inside the cell (omit for the cell itself)
 *   prop    color, or a border colour property (border-top-color, border-bottom-color)
 *   min     4.5 for text, 3 for non-text
 *   shade   true: composite --st-state-pressed-shade (text-default at 12%) under the element
 *   pseudo  "::before" etc., to measure a pseudo-element's colour
 *
 * Backgrounds are composited from the element up to, but not including, the prototype frame
 * (.vspecFrame), over the theme's canvas colour. The frame's own wash is not part of the live page, and
 * measuring on it produced a false 4.45:1 in ST-252 (the live page was 5.13:1).
 *
 * Usage: node scripts/validate-vspec-contrast.js [sidecar ...]   (no arguments: every sidecar in docs/)
 * Exits 1 when a pair is under its minimum, a cell or element is missing, or a sidecar is malformed.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../../..')
const { chromium } = createRequire(join(ROOT, 'package.json'))('@playwright/test')

function findSidecars(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) findSidecars(p, out)
    else if (name.endsWith('.contrast.json')) out.push(p)
  }
  return out
}

const args = process.argv.slice(2)
const sidecars = args.length ? args.map((a) => resolve(a)) : findSidecars(join(ROOT, 'docs'))
if (!sidecars.length) { console.log('No *.contrast.json sidecars found.'); process.exit(0) }

/* global document, getComputedStyle -- runs in the page via page.evaluate */
const measure = (pairs) => {
  const parse = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 } }
  const over = (t, b) => { const a = t.a + b.a * (1 - t.a); return { r: (t.r * t.a + b.r * b.a * (1 - t.a)) / a, g: (t.g * t.a + b.g * b.a * (1 - t.a)) / a, b: (t.b * t.a + b.b * b.a * (1 - t.a)) / a, a } }
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
  const ratio = (f, b) => { const x = lum(f), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
  const res = {}
  for (const theme of ['light-pink-moon', 'dark-pink-moon']) {
    document.documentElement.setAttribute('data-theme', theme)
    const canvas = parse(getComputedStyle(document.documentElement).getPropertyValue('--st-color-bg-canvas') ? (() => { const d = document.createElement('div'); d.style.background = 'var(--st-color-bg-canvas)'; document.body.appendChild(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c })() : 'rgb(255,255,255)')
    res[theme] = pairs.map((p) => {
      const cell = document.querySelector(`[data-cell="${p.cell}"]`)
      if (!cell) return { error: `no cell ${p.cell}` }
      const el = p.sub ? cell.querySelector(p.sub) : cell
      if (!el) return { error: `no element ${p.sub} in ${p.cell}` }
      const fg = parse(getComputedStyle(el, p.pseudo || null).getPropertyValue(p.prop || 'color'))
      const isBorder = (p.prop || '').startsWith('border')
      const chain = []
      for (let e = isBorder ? el.parentElement || cell : el; e && !e.classList.contains('vspecFrame') && e !== document.documentElement; e = e.parentElement) chain.push(parse(getComputedStyle(e).backgroundColor))
      let bg = { ...canvas, a: 1 }
      for (let i = chain.length - 1; i >= 0; i--) bg = over(chain[i], bg)
      if (p.shade) { const t = parse(getComputedStyle(document.body).color); bg = over({ r: t.r, g: t.g, b: t.b, a: 0.12 }, bg) }
      return { ratio: +ratio(over(fg, bg), bg).toFixed(2) }
    })
  }
  document.documentElement.setAttribute('data-theme', 'light-pink-moon')
  return res
}

let failed = 0
const browser = await chromium.launch()
for (const file of sidecars) {
  let spec
  try { spec = JSON.parse(readFileSync(file, 'utf8')) } catch { console.log(`✗ ${file}: not valid JSON`); failed++; continue }
  const vspec = resolve(dirname(file), spec.vspec || '')
  if (!spec.vspec || !existsSync(vspec) || !Array.isArray(spec.pairs) || !spec.pairs.length) { console.log(`✗ ${file}: needs "vspec" (an existing file) and a non-empty "pairs"`); failed++; continue }
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(pathToFileURL(vspec).href)
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important}' })
  const out = await page.evaluate(measure, spec.pairs)
  await page.close()
  console.log(`\n${file.replace(ROOT + '/', '')}`)
  spec.pairs.forEach((p, i) => {
    const min = p.min ?? 4.5
    const l = out['light-pink-moon'][i], d = out['dark-pink-moon'][i]
    if (l.error || d.error) { console.log(`  ✗ ${p.name}: ${l.error || d.error}`); failed++; return }
    const ok = l.ratio >= min && d.ratio >= min
    if (!ok) failed++
    console.log(`  ${ok ? '✓' : '✗'} ${p.name}: light ${l.ratio}, dark ${d.ratio} (min ${min})`)
  })
}
await browser.close()
if (failed) { console.log(`\n${failed} pair(s) under their minimum or unresolved.`); process.exit(1) }
console.log('\nAll declared pairs meet their minimum in both themes.')
