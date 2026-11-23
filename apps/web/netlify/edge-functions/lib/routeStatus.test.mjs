// Run: node --test apps/web/netlify/edge-functions/lib/routeStatus.test.mjs  (#256 Phase 2)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalisePath, checkAgainstManifest, decideStatus, sanityExistsUrl } from './routeStatus.js'

const manifest = {
  static: ['/', '/articles', '/tags', '/platform/cms', '/sitemap'],
  prefixes: { '/articles': ['real-article'], '/tags': ['figma'] },
  anyPrefixes: ['/blog'],
  rootSlugs: ['about'],
  types: { '/articles': 'article', '/tags': 'tag' },
  rootType: 'page',
  sanity: { projectId: 'p', dataset: 'd' },
}
const never = async () => { throw new Error('should not be asked') }

test('normalisePath drops trailing slashes and keeps root', () => {
  assert.equal(normalisePath('/articles/'), '/articles')
  assert.equal(normalisePath('/'), '/')
  assert.equal(normalisePath('/a%20b'), '/a b')
})

test('known routes are 200 without asking Sanity', async () => {
  for (const p of ['/', '/articles', '/articles/real-article', '/tags/figma', '/about', '/blog/anything', '/platform/cms', '/articles/']) {
    assert.equal(await decideStatus(p, manifest, never), 200, p)
  }
})

test('a nonsense path is 404, and a nonsense multi-segment path never asks Sanity', async () => {
  assert.equal(await decideStatus('/a/b/c', manifest, never), 404)
  assert.equal(await decideStatus('/zz-not-a-page', manifest, async () => false), 404)
  assert.equal(await decideStatus('/articles/nope', manifest, async () => false), 404)
})

test('a slug published after the last deploy is 200 when Sanity has it', async () => {
  let asked
  const status = await decideStatus('/tags/new-tag', manifest, async (type, slug) => { asked = [type, slug]; return true })
  assert.equal(status, 200)
  assert.deepEqual(asked, ['tag', 'new-tag'])
})

test('a Sanity failure keeps the 200 (fail open)', async () => {
  assert.equal(await decideStatus('/zz', manifest, async () => { throw new Error('down') }), 200)
})

test('a miss with an unknown prefix is 404', () => {
  assert.equal(checkAgainstManifest('/wat/thing', manifest).type, null)
})

test('sanity URL carries the type and slug as JSON params', () => {
  const url = new URL(sanityExistsUrl(manifest.sanity, 'tag', 'x'))
  assert.equal(url.searchParams.get('$type'), '"tag"')
  assert.equal(url.searchParams.get('$slug'), '"x"')
})
