// routeStatus.js — #256 Phase 2. Pure logic for the route-status edge function: is a request path a
// real route? No imports, so the Netlify Edge runtime (Deno) and `node --test` both load it.
//
// The manifest is written at build by scripts/build-route-manifest.mjs:
//   { static: ['/', '/articles', ...],
//     prefixes: { '/articles': ['slug', ...], ... },   // /<prefix>/:slug routes backed by a Sanity type
//     anyPrefixes: ['/blog', ...],                      // /<prefix>/:slug routes that only redirect
//     rootSlugs: ['about', ...],                        // /:slug page documents
//     types: { '/articles': 'article', ... }, rootType: 'page',
//     sanity: { projectId, dataset } }

/** Path without query, trailing slash or percent-encoding differences. '/' stays '/'. */
export function normalisePath(pathname) {
  let p = pathname
  try { p = decodeURIComponent(pathname) } catch { /* keep the raw path */ }
  p = p.replace(/\/+$/, '')
  return p === '' ? '/' : p
}

/** 'known' | 'unknown'. A slug missing from the manifest is still 'unknown' until Sanity is asked. */
export function checkAgainstManifest(pathname, manifest) {
  const path = normalisePath(pathname)
  if (manifest.static.includes(path)) return { verdict: 'known' }

  const parts = path.split('/').filter(Boolean)
  if (parts.length === 1) {
    if (manifest.rootSlugs.includes(parts[0])) return { verdict: 'known' }
    return { verdict: 'unknown', type: manifest.rootType, slug: parts[0] }
  }
  if (parts.length === 2) {
    const prefix = `/${parts[0]}`
    if (manifest.anyPrefixes.includes(prefix)) return { verdict: 'known' }
    const slugs = manifest.prefixes[prefix]
    if (slugs) {
      if (slugs.includes(parts[1])) return { verdict: 'known' }
      return { verdict: 'unknown', type: manifest.types[prefix], slug: parts[1] }
    }
  }
  // Multi-segment path outside every known pattern: nothing in Sanity can match it.
  return { verdict: 'unknown', type: null, slug: null }
}

/** Query URL asking Sanity whether a published document of `type` has this slug. */
export function sanityExistsUrl({ projectId, dataset }, type, slug) {
  const q = `count(*[_type == $type && slug.current == $slug && !(_id in path("drafts.**"))])`
  const params = new URLSearchParams({ query: q, '$type': JSON.stringify(type), '$slug': JSON.stringify(slug) })
  return `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?${params}`
}

/**
 * Final status for an HTML 200 response. `askSanity(type, slug)` resolves true, false, or throws.
 * Fails open: any error from Sanity keeps the 200, so an outage cannot turn live pages into 404s.
 */
export async function decideStatus(pathname, manifest, askSanity) {
  const check = checkAgainstManifest(pathname, manifest)
  if (check.verdict === 'known') return 200
  if (!check.type) return 404
  try {
    return (await askSanity(check.type, check.slug)) ? 200 : 404
  } catch {
    return 200
  }
}
