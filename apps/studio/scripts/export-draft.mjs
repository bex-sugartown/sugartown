/**
 * #224 export:draft — start, export and check a content working draft
 * (docs/write-pipeline-prompt.md §0b). Run from the repo root:
 *
 *   pnpm export:draft new    ST-123-short-slug
 *   pnpm export:draft export ST-123-short-slug drafts.<id> [--force]
 *   pnpm export:draft check  ST-123-short-slug [drafts.<id>]
 *
 * The working draft is docs/drafts/ST-123-short-slug/ST-123-short-slug.html.
 *   new     copies docs/conventions/content-draft-template.html there, styles inlined,
 *           stamp filled (issue, status drafting). Refuses if the file exists.
 *   export  renders the live Sanity document there. If a working draft already exists, it
 *           overwrites only when nothing would be lost: same text, section by section, as
 *           a fresh render. Otherwise it stops and prints the differences (--force overrides).
 *   check   compares the working draft with the live document, section by section.
 *           Exit 1 on any difference. With no ID given it uses the stamp's Sanity document.
 *           On a match it updates the stamp: _rev, time, status synced.
 *
 * Lives in apps/studio/scripts/ because `sanity` resolves from the studio's node_modules.
 * Uses your Sanity CLI login. Session-invoked; never in pre-commit or CI.
 */
import { getCliClient } from 'sanity/cli'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  renderDocument, page, stampValue, setStamp, compareSections, newDraftFromTemplate,
} from '../../../scripts/export-draft/render.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const read = (p) => readFileSync(resolve(root, p), 'utf8')

const args = process.argv.slice(2).filter((a) => a !== '--')
const force = args.includes('--force')
const [mode, name, docArg] = args.filter((a) => a !== '--force')

function usage(msg) {
  if (msg) console.error(`export:draft: ${msg}`)
  console.error('Usage: pnpm export:draft new|export|check ST-<n>-<slug> [drafts.<id>] [--force]')
  process.exit(2)
}
if (!['new', 'export', 'check'].includes(mode)) usage(mode ? `unknown mode "${mode}"` : 'no mode given')
const idMatch = (name || '').match(/^(ST-\d+)-[a-z0-9-]+$/)
if (!idMatch) usage(`"${name || ''}" is not ST-<n>-<short-slug> (lowercase, hyphens)`)
const id = idMatch[1]
const issue = `#${id.slice(3)}`
const file = resolve(root, 'docs/drafts', name, `${name}.html`)
const rel = `docs/drafts/${name}/${name}.html`

const template = read('docs/conventions/content-draft-template.html')
const templateCss = template.slice(template.indexOf('<style>') + 7, template.indexOf('</style>'))
const css = [
  read('apps/web/src/design-system/styles/tokens.css'),
  read('apps/web/src/design-system/styles/theme.pink-moon.css'),
  read('docs/conventions/doc-base.css'),
].join('\n')
const toggleJs = read('docs/conventions/doc-theme-toggle.js')

if (mode === 'new') {
  if (existsSync(file)) { console.error(`export:draft: ${rel} already exists. Nothing written.`); process.exit(1) }
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, newDraftFromTemplate(template, { css, toggleJs, id, issue }))
  console.log(`new: ${rel} (status drafting, ${issue}). Fill every FILL marker.`)
  process.exit(0)
}

const existing = existsSync(file) ? readFileSync(file, 'utf8') : ''
const docId = docArg || stampValue(existing, 'Sanity document')
if (!/^drafts\.[\w-]+$|^[\w-]+$/.test(docId || '') || docId === 'not created') usage('give the Sanity document ID (drafts.<id>), or run export first')

const client = getCliClient({ apiVersion: '2024-06-01' }).withConfig({ dataset: 'production', perspective: 'raw', useCdn: false })
const doc = await client.fetch(
  `*[_id == $id][0]{..., "authorNames": authors[]->name, "categoryNames": categories[]->name,
    "tagNames": tags[]->name, "toolNames": tools[]->name, "relatedTitles": related[]->title}`,
  { id: docId },
)
if (!doc) { console.error(`export:draft: ${docId} not found in production.`); process.exit(1) }

const fullCss = `${css}\n${templateCss}`
const render = (status) =>
  page({ title: `${id} working draft: ${doc.title}`, css: fullCss, toggleJs, main: renderDocument(doc, { issue, status }) })

const printDiffs = (diffs) => {
  for (const d of diffs) {
    console.error(`  ${d.key}: ${d.kind}`)
    if (d.local) console.error(`    working draft: …${d.local}…`)
    if (d.live) console.error(`    Sanity:        …${d.live}…`)
  }
}

if (mode === 'export') {
  if (existing && !force) {
    const diffs = compareSections(existing, render('in review'))
    if (diffs.length) {
      console.error(`export:draft: ${rel} holds ${diffs.length} section(s) that differ from Sanity (stamp _rev ${stampValue(existing, '_rev') || 'none'}, live _rev ${doc._rev}). Nothing written.`)
      printDiffs(diffs)
      console.error('Sync the working draft first, or decide which copy wins and re-run with --force.')
      process.exit(1)
    }
  }
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, render('in review'))
  console.log(`export: ${rel} from ${doc._id} rev ${doc._rev}, ${(doc.sections || []).length} sections, ${(doc.citations || []).length} citations, status in review.`)
  process.exit(0)
}

// check
if (!existing) { console.error(`export:draft: ${rel} does not exist. Run new or export first.`); process.exit(1) }
const diffs = compareSections(existing, render('synced'))
if (diffs.length) {
  console.error(`check: ${diffs.length} section(s) differ between ${rel} and ${doc._id} rev ${doc._rev}:`)
  printDiffs(diffs)
  process.exit(1)
}
let updated = setStamp(existing, '_rev', doc._rev)
updated = setStamp(updated, 'Status', 'synced')
updated = setStamp(updated, 'Updated', `${new Date().toISOString()} (checked against Sanity)`)
writeFileSync(file, updated)
console.log(`check: ${rel} matches ${doc._id} rev ${doc._rev}, all ${(doc.sections || []).length} sections. Stamp set to synced.`)
