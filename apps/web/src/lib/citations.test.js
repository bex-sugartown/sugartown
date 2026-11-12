// Run: pnpm --filter web test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitCitations } from './citations.js'

test('plain strings come back whole', () => {
  assert.deepEqual(splitCitations('no citation here'), ['no citation here'])
  assert.deepEqual(splitCitations('brackets [a] only'), ['brackets [a] only'])
  assert.deepEqual(splitCitations('[0] is not a note'), ['[0] is not a note'])
  assert.deepEqual(splitCitations(undefined), [undefined])
})

test('[N] becomes a marker and the space before it is dropped', () => {
  assert.deepEqual(splitCitations('Hard-coded, not machine learning. [1]'),
    ['Hard-coded, not machine learning.', { cite: 1 }, ''])
})

test('several markers in one cell', () => {
  assert.deepEqual(splitCitations('A [2] and B [10] end'),
    ['A', { cite: 2 }, ' and B', { cite: 10 }, ' end'])
})

test('validate:content L flags typed [N] in text and dangling numbers, passes clean', async () => {
  const { createRequire } = await import('node:module')
  const { judgeCitations } = createRequire(import.meta.url)('../../scripts/lib/content-rules.cjs')
  const block = (text, defs = [], marks = []) => ({ defs, spans: [{ _type: 'span', text, marks }] })
  const clean = {
    citationCount: 2,
    markBlocks: [[block('A claim.', [{ _key: 'c1', _type: 'citationRef', index: 1 }], ['c1'])]],
    tableCells: [[['Cell one. [1]', 'Record'], ['Cell two. [2]', 'Study']]],
  }
  assert.deepEqual(judgeCitations(clean), [])
  const typed = { ...clean, markBlocks: [[block('A claim. [1]')]] }
  assert.equal(judgeCitations(typed)[0].kind, 'typed')
  const danglingCell = { ...clean, tableCells: [[['Cell. [9]']]] }
  assert.equal(judgeCitations(danglingCell)[0].kind, 'dangling')
  const danglingMark = { ...clean, markBlocks: [[block('A.', [{ _key: 'c', _type: 'citationRef', index: 7 }], ['c'])]] }
  assert.equal(judgeCitations(danglingMark)[0].where, 'mark')
})
