import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseSort, applySortParams, sortItems, dateFieldFor } from './archiveSort.js'

const items = [
  { title: 'Old but rewritten', publishedAt: '2026-01-01T00:00:00Z', _updatedAt: '2026-11-28T00:00:00Z' },
  { title: 'Recent', publishedAt: '2026-11-20T00:00:00Z', _updatedAt: '2026-11-21T00:00:00Z' },
  { title: 'Middle', publishedAt: '2026-06-01T00:00:00Z', _updatedAt: '2026-06-02T00:00:00Z' },
  { title: 'No date' },
]
const titles = (list) => list.map((i) => i.title)

test('default sort is newest published first, undated last', () => {
  const state = parseSort(new URLSearchParams(''))
  assert.deepEqual(state, { key: 'published', dir: 'desc' })
  assert.deepEqual(titles(sortItems(items, state)), ['Recent', 'Middle', 'Old but rewritten', 'No date'])
})

test('updated puts the rewritten old item first', () => {
  const state = parseSort(new URLSearchParams('sort=updated'))
  assert.equal(titles(sortItems(items, state))[0], 'Old but rewritten')
})

test('order=asc reverses a date sort and keeps undated last', () => {
  const state = parseSort(new URLSearchParams('sort=published&order=asc'))
  assert.deepEqual(titles(sortItems(items, state)), ['Old but rewritten', 'Middle', 'Recent', 'No date'])
})

test('title sorts A to Z by default and Z to A with order=desc', () => {
  const asc = parseSort(new URLSearchParams('sort=title'))
  assert.deepEqual(titles(sortItems(items, asc)), ['Middle', 'No date', 'Old but rewritten', 'Recent'])
  const desc = parseSort(new URLSearchParams('sort=title&order=desc'))
  assert.deepEqual(titles(sortItems(items, desc)), ['Recent', 'Old but rewritten', 'No date', 'Middle'])
})

test('unknown params fall back to the default', () => {
  assert.deepEqual(parseSort(new URLSearchParams('sort=bogus&order=sideways')), { key: 'published', dir: 'desc' })
})

test('default state writes no params and other params survive', () => {
  const p = applySortParams(new URLSearchParams('contentType=node&page=3&sort=updated'), { key: 'published', dir: 'desc' })
  assert.equal(p.toString(), 'contentType=node')
})

test('non-default state writes sort, and order only when it differs', () => {
  assert.equal(applySortParams(new URLSearchParams(''), { key: 'updated', dir: 'desc' }).toString(), 'sort=updated')
  assert.equal(applySortParams(new URLSearchParams(''), { key: 'title', dir: 'desc' }).toString(), 'sort=title&order=desc')
  assert.equal(applySortParams(new URLSearchParams(''), { key: 'published', dir: 'asc' }).toString(), 'order=asc')
})

test('date field follows the sort, title sorting shows published', () => {
  assert.equal(dateFieldFor('updated'), '_updatedAt')
  assert.equal(dateFieldFor('published'), 'publishedAt')
  assert.equal(dateFieldFor('title'), 'publishedAt')
})
