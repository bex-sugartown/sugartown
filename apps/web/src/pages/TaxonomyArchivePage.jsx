/**
 * TaxonomyArchivePage — listing page for all items of a taxonomy type.
 *
 * Routes:
 *   /people      → list all person docs
 *   /categories  → list all category docs
 *   /tags        → list all tag docs
 *   /projects    → list all project docs
 *
 * Derives type from the first URL path segment (same pattern as TaxonomyDetailPage).
 * Each item links to its canonical detail route.
 *
 * People use PersonProfilePage (/people/:slug).
 * Categories + Tags use TaxonomyDetailPage (/categories/:slug, /tags/:slug).
 * Projects use ProjectDetailPage (/projects/:slug).
 */
import { useLocation, Link } from 'react-router-dom'
import { useSanityList } from '../lib/useSanityDoc'
import { urlFor } from '../lib/sanity'
import {
  allPersonsQuery,
  allCategoriesQuery,
  allTagsQuery,
  allProjectsQuery,
} from '../lib/queries'
import NotFoundPage from './NotFoundPage'
import styles from './TaxonomyArchivePage.module.css'
import pageStyles from './pages.module.css'

// ─── Archive config keyed by URL path segment ─────────────────────────────────

const ARCHIVE_CONFIG = {
  people: {
    title: 'People',
    query: allPersonsQuery,
    getPath: (doc) => `/people/${doc.slug}`,
    getLabel: (doc) => doc.name,
    getSublabel: (doc) => doc.primaryTitle ?? null,
    getColor: () => null,
    hasImage: true,
  },
  categories: {
    title: 'Categories',
    query: allCategoriesQuery,
    getPath: (doc) => `/categories/${doc.slug}`,
    getLabel: (doc) => doc.name,
    getSublabel: (doc) => doc.description ?? null,
    getColor: (doc) => doc.colorHex ?? null,
    hasImage: false,
  },
  tags: {
    title: 'Tags',
    query: allTagsQuery,
    getPath: (doc) => `/tags/${doc.slug}`,
    getLabel: (doc) => doc.name,
    getSublabel: (doc) => doc.description ?? null,
    getColor: () => null,
    hasImage: false,
  },
  projects: {
    title: 'Projects',
    query: allProjectsQuery,
    getPath: (doc) => `/projects/${doc.slug}`,
    getLabel: (doc) => doc.name,
    getSublabel: (doc) => doc.description ?? null,
    getColor: (doc) => doc.colorHex ?? null,
    hasImage: false,
  },
}

// ─── Person avatar helper ─────────────────────────────────────────────────────

function PersonAvatar({ doc }) {
  if (doc.image?.asset) {
    try {
      const url = urlFor(doc.image).width(80).height(80).fit('crop').url()
      return (
        <img
          src={url}
          alt={doc.image.alt ?? doc.name}
          className={styles.itemAvatar}
          width={40}
          height={40}
        />
      )
    } catch {
      // fall through to initial
    }
  }
  return (
    <div className={styles.itemAvatarFallback} aria-hidden="true">
      {doc.name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
  )
}

// ─── Single taxonomy item row ─────────────────────────────────────────────────

function TaxonomyItem({ doc, config }) {
  const label = config.getLabel(doc)
  const sublabel = config.getSublabel(doc)
  const colorHex = config.getColor(doc)
  const path = config.getPath(doc)

  return (
    <li className={styles.item}>
      <Link to={path} className={styles.itemLink}>
        {colorHex && (
          <span
            className={styles.itemColorDot}
            style={{ backgroundColor: colorHex }}
            aria-hidden="true"
          />
        )}
        {config.hasImage && <PersonAvatar doc={doc} />}
        <span className={styles.itemText}>
          <span className={styles.itemLabel}>{label}</span>
          {sublabel && (
            <span className={styles.itemSublabel}>{sublabel}</span>
          )}
        </span>
      </Link>
    </li>
  )
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function TaxonomyArchivePage() {
  const location = useLocation()
  const pathSegment = location.pathname.split('/')[1] ?? ''
  const config = ARCHIVE_CONFIG[pathSegment]

  // Always call hook unconditionally (rules of hooks)
  const { data: items, loading } = useSanityList(config?.query ?? null, {})

  if (!config) return <NotFoundPage />

  if (loading) {
    return <div className={pageStyles.loadingPage}>Loading…</div>
  }

  const list = items ?? []

  return (
    <main className={styles.archivePage}>
      <div className={styles.archiveHeader}>
        <h1 className={styles.archiveTitle}>{config.title}</h1>
        {list.length > 0 && (
          <span className={styles.archiveCount}>{list.length}</span>
        )}
      </div>

      {list.length === 0 ? (
        <p className={pageStyles.archiveEmpty}>
          No {config.title.toLowerCase()} found.
        </p>
      ) : (
        <ul className={styles.itemList}>
          {list.map((doc) => (
            <TaxonomyItem key={doc._id} doc={doc} config={config} />
          ))}
        </ul>
      )}
    </main>
  )
}
