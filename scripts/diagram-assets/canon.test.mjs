// ST-182: the normaliser treats Sanity's re-serialisation as equal and a moved element as drift.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { svgDifference } from './canon.mjs'

const source = `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="512" viewBox="0 0 880 512">
  <!-- legend -->
  <path d="M0,0 L10,5" fill="#0d1226"/>
  <text x="800" y="452" text-anchor="end">solid &amp; pink</text>
</svg>`

test('a re-serialised copy is equal', () => {
  const reserialised = `<svg viewBox="0 0 880 512" height="512" width="880" xmlns="http://www.w3.org/2000/svg"><path fill="#0d1226" d="M0,0 L10,5">
</path>
  <text text-anchor="end" y="452" x="800">solid &#38; pink</text></svg>`
  assert.equal(svgDifference(source, reserialised), null)
})

test('a moved legend is drift', () => {
  const moved = source.replace('x="800"', 'x="32"').replace(' text-anchor="end"', '')
  assert.notEqual(svgDifference(source, moved), null)
})

test('changed text is drift', () => {
  assert.notEqual(svgDifference(source, source.replace('solid', 'dashed')), null)
})

test('a dropped attribute is drift', () => {
  assert.notEqual(svgDifference(source, source.replace(' width="880"', '')), null)
})
