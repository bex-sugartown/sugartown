/**
 * resolveNavLink
 *
 * Resolves a typed nav item to { url, openInNewTab }.
 * Falls back to legacy link.url for items not yet migrated to typed linkType fields.
 *
 * linkType values:
 *   'internal' — reference to a page doc (slug resolves to /:slug)
 *   'archive'  — reference to an archivePage doc (slug resolves to /:slug)
 *   'external' — plain URL string (user-supplied, may open in new tab)
 *   undefined  — legacy fallback (reads link.url + link.openInNewTab)
 *
 * Usage:
 *   import { resolveNavLink } from '../lib/resolveNavUrl'
 *   const { url, openInNewTab } = resolveNavLink(navItem)
 */
export function resolveNavLink(item) {
  if (!item) return {url: null, openInNewTab: false}

  const {linkType, internalPage, archiveRef, externalUrl, openInNewTab, link} = item

  switch (linkType) {
    case 'internal':
      // page docs live at /:slug (root namespace)
      return {
        url: internalPage?.slug ? `/${internalPage.slug}` : null,
        openInNewTab: false
      }

    case 'archive':
      // archivePage slugs ARE the URL path (e.g. 'articles' → '/articles')
      return {
        url: archiveRef?.slug ? `/${archiveRef.slug}` : null,
        openInNewTab: false
      }

    case 'external':
      return {
        url: externalUrl || null,
        openInNewTab: openInNewTab ?? false
      }

    default:
      // Legacy fallback — items stored before typed link migration keep working
      return {
        url: link?.url || null,
        openInNewTab: link?.openInNewTab ?? false
      }
  }
}
