/**
 * GlossaryTermAnnotation — inline PT mark renderer for glossaryTermRef annotations.
 *
 * Renders as a dotted-underline link to /glossary/:slug with a hover popover
 * showing the term name, abbreviation, first definition block, and a "Read full
 * definition" link.
 *
 * WCAG 1.4.13: popover is hoverable and dismissible via Escape / blur.
 * Mobile (@media pointer: coarse): tap navigates to /glossary/:slug, no popover.
 *
 * The `value.term` reference must be expanded in the GROQ query that fetches this
 * content. The query must project: `term->{ term, abbreviation, "slug": slug.current,
 * "definitionPreview": definition[0..0] }` onto `value.term`.
 *
 * First occurrence in a document should use <dfn> wrapper — the caller wraps
 * children in dfn when `isFirstOccurrence` is tracked at the page level (Phase 2+).
 * For now the component always renders as <span> with glossary-link treatment.
 */
import { Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { getCanonicalPath } from '../lib/routes'
import styles from '../pages/GlossaryPage.module.css'

export default function GlossaryTermAnnotation({ value, children }) {
  const termRef = value?.term

  // Graceful fallback: if term ref wasn't resolved in GROQ, render plain text
  if (!termRef?.slug) {
    return <>{children}</>
  }

  const href = getCanonicalPath({ docType: 'glossaryTerm', slug: termRef.slug })
  const preview = termRef.definitionPreview

  const plainPreview = preview
    ? preview.map((b) => b.children?.map((s) => s.text).join('')).join(' ')
    : null

  return (
    <span className={styles.glossaryLink} tabIndex={0}>
      <Link to={href} style={{ color: 'inherit', textDecoration: 'none' }}>
        {children}
      </Link>
      <span className={styles.glossaryPopover} role="tooltip">
        <span className={styles.popoverTerm}>
          {termRef.term}
          {termRef.abbreviation && (
            <span className={styles.popoverAbbr}>{termRef.abbreviation}</span>
          )}
        </span>
        {plainPreview && (
          <span className={styles.popoverDefinition}>{plainPreview}</span>
        )}
        <Link to={href} className={styles.popoverLink}>
          Read full definition →
        </Link>
      </span>
    </span>
  )
}
