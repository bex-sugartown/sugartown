/**
 * TaxonomyPlaceholderPage — placeholder for reserved taxonomy routes.
 * Routes: /tags/:slug, /categories/:slug, /projects/:slug, /people/:slug
 *
 * These routes are reserved and will be implemented in Stage 4 (taxonomy UI).
 */
import { useParams, useLocation, Link } from 'react-router-dom'
import styles from './pages.module.css'

const TAXONOMY_LABELS = {
  tags: 'Tag',
  categories: 'Category',
  projects: 'Project',
  people: 'Person',
}

export default function TaxonomyPlaceholderPage() {
  const { slug } = useParams()
  const location = useLocation()

  // Derive taxonomy type from the first path segment
  const taxonomyType = location.pathname.split('/')[1] ?? ''
  const label = TAXONOMY_LABELS[taxonomyType] ?? 'Page'

  return (
    <main className={styles.placeholderPage}>
      <div className={styles.placeholderContent}>
        <p className={styles.placeholderEyebrow}>{label}</p>
        <h1 className={styles.placeholderHeading}>
          {slug ? slug.replace(/-/g, ' ') : label}
        </h1>
        <p className={styles.placeholderBody}>
          This {label.toLowerCase()} page is coming soon. Full taxonomy browsing will be
          available in a future update.
        </p>
        <Link to="/" className={styles.placeholderLink}>
          ← Back to home
        </Link>
      </div>
    </main>
  )
}
