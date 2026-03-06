/**
 * Citation — web app adapter of the DS Citation visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Citation/Citation.tsx
 * CSS sync: Citation.module.css must match DS Citation.module.css (see MEMORY.md token drift rules).
 *
 * Three exports: CitationMarker, CitationNote, CitationZone
 * Typography layer — not card layer.
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import styles from './Citation.module.css'

// ── CitationMarker ────────────────────────────────────

/**
 * Inline superscript citation marker — renders as a pink pill with [n].
 * Place inline within body copy.
 */
export function CitationMarker({ index, targetId }) {
  const id = targetId ?? `st-citation-${index}`

  return (
    <sup className={styles.marker} aria-label={`Citation ${index}`}>
      <a href={`#${id}`} className={styles.markerLink}>
        [{index}]
      </a>
    </sup>
  )
}

// ── CitationNote ──────────────────────────────────────

/**
 * Single footnote line item — renders [n] + source text in monospace.
 * Place inside a CitationZone.
 */
export function CitationNote({ index, children, id }) {
  const noteId = id ?? `st-citation-${index}`

  return (
    <p id={noteId} className={styles.note}>
      <span className={styles.index}>[{index}]</span>
      {children}
    </p>
  )
}

// ── CitationZone ──────────────────────────────────────

/**
 * Semantic wrapper for all footnotes on a content surface.
 * Renders a dashed top border and stacks notes vertically.
 */
export function CitationZone({ children }) {
  return (
    <footer className={styles.zone} role="doc-endnotes">
      {children}
    </footer>
  )
}
