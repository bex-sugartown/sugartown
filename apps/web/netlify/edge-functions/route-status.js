// route-status.js — #256 Phase 2 (Inbound Visibility E1.2).
// The SPA fallback (`/* /app.html 200`) answers 200 for every unknown URL, which Search Console
// reports as soft 404s. This function lets Netlify route the request as usual, and when the answer
// is an HTML 200 for a path that is not a real route, returns the same body with status 404, so the
// app still renders its not-found page.
//
// "Real route" = in dist/route-manifest.json (built from App.jsx and Sanity), or, on a miss, found
// in Sanity right now, so a page published after the last deploy does not 404. Sanity errors keep
// the 200 (fail open).
import { decideStatus, sanityExistsUrl } from './lib/routeStatus.js'

const MANIFEST_TTL_MS = 5 * 60 * 1000
const SANITY_TIMEOUT_MS = 1500
let cached = null

async function loadManifest(origin) {
  if (cached && Date.now() - cached.at < MANIFEST_TTL_MS) return cached.manifest
  const res = await fetch(new URL('/route-manifest.json', origin))
  if (!res.ok) throw new Error(`manifest ${res.status}`)
  cached = { at: Date.now(), manifest: await res.json() }
  return cached.manifest
}

export default async (request, context) => {
  const response = await context.next()
  if (request.method !== 'GET' || response.status !== 200) return response
  if (!(response.headers.get('content-type') || '').includes('text/html')) return response

  let manifest
  try {
    manifest = await loadManifest(request.url)
  } catch {
    return response // no manifest: behave as before this function existed
  }

  const askSanity = async (type, slug) => {
    const res = await fetch(sanityExistsUrl(manifest.sanity, type, slug), { signal: AbortSignal.timeout(SANITY_TIMEOUT_MS) })
    if (!res.ok) throw new Error(`sanity ${res.status}`)
    const { result } = await res.json()
    return result > 0
  }

  const status = await decideStatus(new URL(request.url).pathname, manifest, askSanity)
  if (status === 200) return response
  return new Response(response.body, { status, statusText: 'Not Found', headers: response.headers })
}

export const config = {
  path: '/*',
  excludedPath: ['/assets/*', '/route-manifest.json', '/sitemap.xml', '/robots.txt', '/*.json', '/*.svg', '/*.png', '/*.jpg', '/*.webp', '/*.ico'],
}
