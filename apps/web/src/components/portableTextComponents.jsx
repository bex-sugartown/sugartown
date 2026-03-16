/**
 * portableTextComponents.jsx — Shared PortableText serializer components
 *
 * Canonical link annotation and divider block renderers used across all
 * PortableText rendering contexts (PageSections, ContentBlock, CardBuilderSection).
 *
 * Link resolution uses linkUtils.js for internal/external detection and
 * routes.js getCanonicalPath() for internal reference URL building.
 */
import { Link } from 'react-router-dom'
import { getCanonicalPath } from '../lib/routes'
import { getLinkProps, isExternalUrl } from '../lib/linkUtils'
import styles from './portableTextComponents.module.css'

/**
 * LinkAnnotation — shared PT link mark renderer.
 *
 * Handles three cases:
 * 1. Internal reference (type === 'internal') — uses getCanonicalPath + React Router <Link>
 * 2. External URL (type === 'external' or legacy href-only) — uses <a> with target/rel
 * 3. Missing/broken ref — renders children as plain text (no broken link)
 *
 * Backward compatible: existing link marks with only `href` (no `type` field)
 * are treated as external links (legacy behaviour).
 */
export function LinkAnnotation({ value, children, className }) {
  // Resolve href: internal ref → canonical path, external → href/externalUrl
  let href
  if (value?.type === 'internal' && value?.internalSlug) {
    href = getCanonicalPath({
      docType: value.internalType,
      slug: value.internalSlug,
    })
  } else {
    href = value?.href || value?.externalUrl
  }

  // No href = broken/missing reference — render as plain text
  if (!href) return <>{children}</>

  const { isExternal, linkProps } = getLinkProps(href, value?.openInNewTab)
  const linkClass = className || styles.link

  if (isExternal) {
    return (
      <a {...linkProps} className={linkClass}>
        {children}
      </a>
    )
  }

  return (
    <Link {...linkProps} className={linkClass}>
      {children}
    </Link>
  )
}

/**
 * DividerBlock — horizontal rule block type renderer.
 *
 * Styles: 'default' (standard pink-tinted rule) or 'subtle' (reduced opacity).
 */
export function DividerBlock({ value }) {
  const style = value?.style || 'default'
  const className = [
    styles.divider,
    style === 'subtle' ? styles.dividerSubtle : '',
  ]
    .filter(Boolean)
    .join(' ')

  return <hr className={className} />
}
