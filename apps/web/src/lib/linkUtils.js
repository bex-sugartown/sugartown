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
 * - Null/undefined/empty URLs are neither — callers handle the fallback
 */

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

  const external = isExternalUrl(url) || openInNewTab

  if (external) {
    return {
      isExternal: true,
      linkProps: {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }
  }

  return {
    isExternal: false,
    linkProps: {
      to: url,
    },
  }
}
