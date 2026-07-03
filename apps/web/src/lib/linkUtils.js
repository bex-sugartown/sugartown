/**
 * linkUtils.js — Shared link resolution utilities
 *
 * Centralises internal vs external URL detection and link prop generation.
 * Consumed by Button, Link atom, NavigationItem, and any future clickable surface.
 *
 * Rules:
 * - URLs starting with http:// or https:// are external
 * - mailto:, tel:, and other protocol URLs are treated as external (plain <a>)
 * - Relative paths (e.g. /contact) are internal → React Router <Link>
 * - An absolute http(s) URL pointing at THIS site's own host is internal —
 *   see toInternalPath() — so self-links do SPA routing, not a full reload
 * - Null/undefined/empty URLs are neither — callers handle the fallback
 */

// Hostnames that are "us". An absolute link to one of these is internal (SPA),
// not external. Subdomains (e.g. pinkmoon.sugartown.io for Storybook) are
// intentionally NOT listed — they stay external. The current runtime host
// (e.g. localhost:5173) is added at call time so dev links normalise too.
const SITE_HOSTNAMES = ['sugartown.io', 'www.sugartown.io']

/**
 * If `url` is an absolute http(s) URL pointing at this site's own host, return
 * its relative path (pathname + search + hash). Otherwise return null.
 *
 * Prerender-safe: when `window` is absent (the prerender step runs in Node) it
 * falls back to the static SITE_HOSTNAMES list only.
 *
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function toInternalPath(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const ownHosts = new Set(SITE_HOSTNAMES)
  if (typeof window !== 'undefined' && window.location?.host) {
    ownHosts.add(window.location.host)      // includes port, e.g. localhost:5173
    ownHosts.add(window.location.hostname)  // bare host, no port
  }
  if (!ownHosts.has(parsed.host) && !ownHosts.has(parsed.hostname)) return null
  return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/'
}

/**
 * Returns true if the URL should be rendered as an external <a> (not React Router).
 * Covers http(s), mailto:, tel:, and any other protocol scheme.
 *
 * @param {string|null|undefined} url
 * @returns {boolean}
 */
export function isExternalUrl(url) {
  if (!url) return false
  // Any protocol scheme → external
  return /^[a-z][a-z0-9+.-]*:/i.test(url)
}

/**
 * Returns the correct props object for rendering a link element.
 *
 * For external URLs:  { href, target: '_blank', rel: 'noopener noreferrer' }
 * For internal URLs:  { to: url } (for React Router <Link>)
 *
 * The `openInNewTab` flag from Sanity forces external-style rendering
 * even for internal URLs (useful for "open in new window" overrides).
 *
 * @param {string|null|undefined} url
 * @param {boolean} [openInNewTab=false]
 * @returns {{ isExternal: boolean, linkProps: object }}
 */
export function getLinkProps(url, openInNewTab = false) {
  if (!url) {
    return { isExternal: false, linkProps: {} }
  }

  // Normalise an absolute self-link to a relative path so it routes via the SPA
  // instead of triggering a full reload (or, in dev, a bounce to production).
  const internalPath = toInternalPath(url)
  const resolved = internalPath ?? url

  // A normalised self-link is internal even if openInNewTab was set — but we
  // still honour openInNewTab by opening the relative path in a new tab.
  const external = internalPath ? openInNewTab : (isExternalUrl(resolved) || openInNewTab)

  if (external) {
    return {
      isExternal: true,
      linkProps: {
        href: resolved,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }
  }

  return {
    isExternal: false,
    linkProps: {
      to: resolved,
    },
  }
}
