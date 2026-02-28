/**
 * ContentNav — sequential prev/next navigation for content detail pages.
 *
 * Renders at the bottom of a content page, linking to the chronologically
 * adjacent item of the same content type. Adjacent items are fetched by the
 * detail GROQ query (prev/next projections using ^.publishedAt).
 *
 * Props:
 *   prev     — { title, slug } | null — item published before current
 *   next     — { title, slug } | null — item published after current
 *   docType  — string — passed to getCanonicalPath() for URL construction
 *
 * Returns null when neither prev nor next is available.
 *
 * Used by: NodePage, ArticlePage, CaseStudyPage.
 */
import { Link } from 'react-router-dom'
import { getCanonicalPath } from '../lib/routes'
import styles from './ContentNav.module.css'

export default function ContentNav({ prev, next, docType }) {
  if (!prev && !next) return null

  return (
    <nav className={styles.nav} aria-label="Article navigation">
      {prev ? (
        <Link
          to={getCanonicalPath({ docType, slug: prev.slug })}
          className={`${styles.item} ${styles['item--prev']}`}
        >
          <p className={styles.label}>← Previous</p>
          <p className={styles.title}>{prev.title}</p>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          to={getCanonicalPath({ docType, slug: next.slug })}
          className={`${styles.item} ${styles['item--next']}`}
        >
          <p className={styles.label}>Next →</p>
          <p className={styles.title}>{next.title}</p>
        </Link>
      )}
    </nav>
  )
}
