/**
 * Storybook mock for apps/web/src/lib/sanity.js
 *
 * Provides a stub urlFor() that returns a chainable builder
 * resolving to a placeholder image URL. This avoids needing
 * real Sanity credentials in Storybook.
 */

const PLACEHOLDER = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=600&h=400&fit=crop'

function createBuilder(assetUrl) {
  const builder = {
    width:   () => builder,
    height:  () => builder,
    quality: () => builder,
    auto:    () => builder,
    fit:     () => builder,
    url:     () => assetUrl || PLACEHOLDER,
  }
  return builder
}

export function urlFor(source) {
  // If the source has a direct URL (fixture data), use it
  const assetUrl = source?.url || source?.asset?.url || null
  return createBuilder(assetUrl)
}

// Default: return null (no data). Stories override this via __setClientFetch.
let _fetch = () => Promise.resolve(null)

export function __setClientFetch(fn) { _fetch = fn }
export function __resetClientFetch() { _fetch = () => Promise.resolve(null) }

export const client = {
  fetch: (...args) => _fetch(...args),
}

export const rawClient = {
  fetch: () => Promise.resolve([]),
}
