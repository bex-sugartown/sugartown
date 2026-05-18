/**
 * TaxonomyArchivePage — listing page for all items of a taxonomy type.
 *
 * Routes:
 *   /people      → list all person docs
 *   /categories  → list all category docs
 *   /tags        → list all tag docs
 *   /projects    → list all project docs
 *   /tools       → list all tool docs
 *
 * SUG-104: Tags uses a letter-bucket grid; all others use a flat row list.
 * Row pattern: color dot (if present) + name + count (right-aligned).
 * Tag rows: dot + mono name + description sublabel + count.
 */
import { useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useSanityList } from '../lib/useSanityDoc'
import { urlFor } from '../lib/sanity'
import {
  allPersonsQuery,
  allCategoriesQuery,
  allTagsQuery,
  allProjectsQuery,
  allToolsQuery,
} from '../lib/queries'
import AlphaFilter from '../components/AlphaFilter'
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
    getCount: () => null,
    hasImage: true,
    layout: 'rows',
  },
  categories: {
    title: 'Categories',
    lede: 'The top-level taxonomy. Each category gathers articles and knowledge nodes that share a working domain.',
    query: allCategoriesQuery,
    getPath: (doc) => `/categories/${doc.slug}`,
    getLabel: (doc) => doc.name,
    getSublabel: () => null,
    getColor: (doc) => doc.colorHex ?? null,
    getCount: (doc) => doc.count ?? null,
    hasImage: false,
    layout: 'rows',
  },
  tags: {
    title: 'Tags',
    lede: 'Free-form descriptors. Tags cross-cut categories — a piece can belong to one category and many tags.',
    query: allTagsQuery,
    getPath: (doc) => `/tags/${doc.slug}`,
    getLabel: (doc) => doc.name,
    getSublabel: (doc) => doc.description ?? null,
    getColor: () => null,
    getCount: (doc) => doc.count ?? null,
    hasImage: false,
    layout: 'flat-grid',
  },
  projects: {
    title: 'Projects',
    query: allProjectsQuery,
    getPath: (doc) => `/projects/${doc.slug}`,
    getLabel: (doc) => doc.name,
    getSublabel: () => null,
    getColor: (doc) => doc.colorHex ?? null,
    getCount: (doc) => doc.count ?? null,
    hasImage: false,
    layout: 'rows',
  },
  tools: {
    title: 'Tools & Platforms',
    query: allToolsQuery,
    getPath: (doc) => `/tools/${doc.slug}`,
    getLabel: (doc) => doc.name,
    getSublabel: () => null,
    getColor: () => null,
    getCount: (doc) => doc.count ?? null,
    hasImage: false,
    layout: 'rows',
  },
}

// ─── Person avatar helper ─────────────────────────────────────────────────────

function PersonAvatar({ doc }) {
  if (doc.image?.asset) {
    let url = null
    try { url = urlFor(doc.image).width(80).height(80).fit('crop').url() } catch { /* fall through */ }
    if (url) {
      return (
        <img
          src={url}
          alt={doc.image.alt ?? doc.name}
          className={styles.itemAvatar}
          width={40}
          height={40}
        />
      )
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
  const count = config.getCount(doc)
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
        {count != null && count > 0 && (
          <span className={styles.itemCount}>{count}</span>
        )}
      </Link>
    </li>
  )
}

// ─── Flat 3-col grid (Tags) ───────────────────────────────────────────────────

function FlatGrid({ list, config }) {
  const [filterLetter, setFilterLetter] = useState(null)

  const sorted = useMemo(
    () => [...list].sort((a, b) => config.getLabel(a).localeCompare(config.getLabel(b))),
    [list, config]
  )

  const activeLetters = useMemo(() => {
    const s = new Set()
    sorted.forEach((doc) => {
      const first = config.getLabel(doc).charAt(0)
      s.add(/[A-Za-z]/.test(first) ? first.toUpperCase() : '#')
    })
    return s
  }, [sorted, config])

  const filtered = useMemo(() => {
    if (!filterLetter) return sorted
    return sorted.filter((doc) => {
      const first = config.getLabel(doc).charAt(0)
      const key = /[A-Za-z]/.test(first) ? first.toUpperCase() : '#'
      return key === filterLetter
    })
  }, [sorted, filterLetter, config])

  // Split alphabetical list into 3 balanced columns
  const columns = useMemo(() => {
    if (filterLetter) return [filtered]
    const third = Math.ceil(filtered.length / 3)
    return [
      filtered.slice(0, third),
      filtered.slice(third, third * 2),
      filtered.slice(third * 2),
    ].filter((col) => col.length > 0)
  }, [filtered, filterLetter])

  return (
    <>
      <div className={styles.indexGroup}>
        <AlphaFilter
          activeLetters={activeLetters}
          filterLetter={filterLetter}
          onSelect={(l) => setFilterLetter(l === null ? null : l === filterLetter ? null : l)}
        />
      </div>
      <div className={filterLetter ? styles.indexGridSingle : styles.indexGrid}>
        {columns.map((col, i) => (
          <ul key={i} className={styles.indexList}>
            {col.map((doc) => {
              const label = config.getLabel(doc)
              const sublabel = config.getSublabel(doc)
              const count = config.getCount(doc)
              return (
                <li key={doc._id}>
                  <Link to={config.getPath(doc)} className={styles.listItem}>
                    <span className={styles.listItemInner}>
                      <span className={styles.listItemLabel}>{label}</span>
                      {sublabel && (
                        <span className={styles.listItemSub}>{sublabel}</span>
                      )}
                    </span>
                    {count != null && count > 0 && (
                      <span className={styles.listItemCount}>{count}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        ))}
      </div>
    </>
  )
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function TaxonomyArchivePage() {
  const location = useLocation()
  const pathSegment = location.pathname.split('/')[1] ?? ''
  const config = ARCHIVE_CONFIG[pathSegment]

  const { data: items, loading } = useSanityList(config?.query ?? null, {})

  if (!config) return <NotFoundPage />

  if (loading) {
    return <div className={pageStyles.loadingPage}>Loading…</div>
  }

  const list = items ?? []

  return (
    <main className={`${styles.archivePage}${config.layout === 'flat-grid' ? ` ${styles.archivePageWide}` : ''}`}>
      <div className={styles.archiveHeader}>
        <h1 className={styles.archiveTitle}>{config.title}</h1>
        {list.length > 0 && (
          <span className={styles.archiveCount}>{list.length}</span>
        )}
      </div>

      {config.lede && (
        <p className={styles.archiveLede}>{config.lede}</p>
      )}

      {list.length === 0 ? (
        <p className={pageStyles.archiveEmpty}>
          No {config.title.toLowerCase()} found.
        </p>
      ) : config.layout === 'flat-grid' ? (
        <FlatGrid list={list} config={config} />
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
