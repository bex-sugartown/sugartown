// #224 probes (issue section 4) that need no Sanity: run with `pnpm test:export-draft`.
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { renderDocument, renderSection, compareSections, stampValue, setStamp, page, newDraftFromTemplate } from './render.mjs'

const doc = {
  _id: 'drafts.x', _rev: 'rev1', _updatedAt: '2026-11-14T00:00:00Z', title: 'T', slug: { current: 't' },
  citations: [{ text: 'Source', url: 'https://example.com', label: 'Ex' }],
  sections: [
    { _key: 'hero-1', _type: 'heroSection', eyebrow: 'Article', heading: 'T' },
    { _key: 's1', _type: 'textSection', heading: 'One', content: [
      { _key: 'b1', _type: 'block', style: 'normal', markDefs: [{ _key: 'c1', _type: 'citationRef', index: 1 }],
        children: [{ _key: 'x', _type: 'span', marks: ['c1'], text: 'A claim & a fact.' }] },
      { _key: 't1', _type: 'tableBlock', hasHeaderRow: true, rows: [{ cells: ['H'] }, { cells: ['cell [1]'] }] },
    ] },
  ],
}
const html = (d) => page({ title: 't', css: '', toggleJs: '', main: renderDocument(d, { now: 'NOW' }) })

test('stamp carries the document id and _rev', () => {
  const h = html(doc)
  assert.equal(stampValue(h, 'Sanity document'), 'drafts.x')
  assert.equal(stampValue(h, '_rev'), 'rev1')
  assert.equal(stampValue(setStamp(h, 'Status', 'synced'), 'Status'), 'synced')
})

test('one draftSection per Sanity section, plus citations', () => {
  const h = html(doc)
  assert.equal((h.match(/class="draftSection"/g) || []).length, doc.sections.length + 1)
  assert.equal((h.match(/<li id="cit-/g) || []).length, 1)
  assert.match(h, /<sup class="draftCite"><a href="#cit-1">\[1\]<\/a><\/sup>/)
})

test('an unknown section type is shown, never dropped', () => {
  const h = renderSection({ _key: 'z9', _type: 'mysterySection', foo: 1 })
  assert.match(h, /mysterySection not rendered/)
  assert.match(h, /data-key="z9"/)
})

test('identical renders compare clean', () => {
  assert.deepEqual(compareSections(html(doc), html({ ...doc, _rev: 'rev2' })), [])
})

test('a planted text change is caught, with its section key', () => {
  const edited = html(doc).replace('A claim &amp; a fact.', 'A claim, edited.')
  const d = compareSections(edited, html(doc))
  assert.equal(d.length, 1)
  assert.equal(d[0].key, 's1')
  assert.equal(d[0].kind, 'text differs')
})

test('a section added locally or missing locally is caught', () => {
  const extra = html(doc).replace('</main>', '<section class="draftSection" data-type="textSection" data-key="new1"><p>New</p></section></main>')
  assert.deepEqual(compareSections(extra, html(doc)).map((x) => x.kind), ['only in working draft'])
  const live2 = html({ ...doc, sections: [...doc.sections, { _key: 's2', _type: 'textSection', content: [] }] })
  assert.deepEqual(compareSections(html(doc), live2).map((x) => x.kind), ['only in Sanity'])
})

test('new: template becomes a stand-alone draft with the stamp filled', () => {
  const tpl = `<title>x</title>\n<link rel="stylesheet" href="../a.css">\n<style>\n.a{}\n</style>\n<table class="draftStamp"><tr><th>Status</th><td>drafting</td></tr><tr><th>Sanity document</th><td></td></tr><tr><th>Updated</th><td></td></tr><tr><th>Tracking issue</th><td></td></tr></table>\n<script src="../t.js"></script>`
  const h = newDraftFromTemplate(tpl, { css: 'TOKENS', toggleJs: 'TOGGLE', id: 'ST-1', issue: '#1' })
  assert.doesNotMatch(h, /<link /)
  assert.match(h, /TOKENS/)
  assert.match(h, /<script>\nTOGGLE\n<\/script>/)
  assert.equal(stampValue(h, 'Tracking issue'), '#1')
  assert.equal(stampValue(h, 'Sanity document'), 'not created')
})

test('new: the committed template gets its FILL stamp cells filled', () => {
  const tpl = readFileSync(new URL('../../docs/conventions/content-draft-template.html', import.meta.url), 'utf8')
  const h = newDraftFromTemplate(tpl, { css: 'TOKENS', toggleJs: 'TOGGLE', id: 'ST-9', issue: '#9' })
  assert.equal(stampValue(h, 'Tracking issue'), '#9')
  assert.equal(stampValue(h, 'Status'), 'drafting')
  assert.equal(stampValue(h, 'Sanity document'), 'not created')
  assert.doesNotMatch(h, /<link |<script src=/)
})
