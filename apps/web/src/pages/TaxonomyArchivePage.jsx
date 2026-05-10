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
import { useMemo } from 'react'
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
    layout: 'buckets',
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

const ALL_LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

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

// ─── Alpha strip ──────────────────────────────────────────────────────────────

function AlphaStrip({ activeLetters }) {
  return (
    <div className={styles.alphaStrip} aria-label="Jump to letter">
      {ALL_LETTERS.map((letter) => {
        const isActive = activeLetters.has(letter)
        return isActive ? (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className={`${styles.alphaBtn} ${styles.alphaBtnActive}`}
          >
            {letter}
          </a>
        ) : (
          <span
            key={letter}
            className={`${styles.alphaBtn} ${styles.alphaBtnDisabled}`}
            aria-hidden="true"
          >
            {letter}
          </span>
        )
      })}
    </div>
  )
}

// ─── Letter-bucket grid (Tags) ────────────────────────────────────────────────

function BucketGrid({ list, config }) {
  const { groups, letters } = useMemo(() => {
    const g = {}
    list.forEach((doc) => {
      const first = config.getLabel(doc).charAt(0)
      const key = /[A-Za-z]/.test(first) ? first.toUpperCase() : '#'
      ;(g[key] = g[key] || []).push(doc)
    })
    Object.values(g).forEach((arr) =>
      arr.sort((a, b) => config.getLabel(a).localeCompare(config.getLabel(b)))
    )
    const sorted = Object.keys(g).sort((a, b) => {
      if (a === '#') return -1
      if (b === '#') return 1
      return a.localeCompare(b)
    })
    return { groups: g, letters: sorted }
  }, [list, config])

  const activeLetters = new Set(letters)

  return (
    <>
      <AlphaStrip activeLetters={activeLetters} />
      <div className={styles.taxGrid}>
        {letters.map((L) => (
          <div key={L} className={styles.taxBucket} id={`letter-${L}`}>
            <div className={styles.taxLetter}>
              <span className={styles.taxLetterGlyph}>{L}</span>
              <span className={styles.taxLetterRule} aria-hidden="true" />
            </div>
            <ul className={styles.taxBucketList}>
              {groups[L].map((doc) => {
                const label = config.getLabel(doc)
                const sublabel = config.getSublabel(doc)
                const count = config.getCount(doc)
                return (
                  <li key={doc._id}>
                    <Link to={config.getPath(doc)} className={styles.taxRow}>
                      <span className={styles.taxRowInner}>
                        <span className={styles.taxRowName}>{label}</span>
                        {sublabel && (
                          <span className={styles.taxRowSub}>{sublabel}</span>
                        )}
                      </span>
                      {count != null && count > 0 && (
                        <span className={styles.taxRowCount}>{count}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
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
    <main className={styles.archivePage}>
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
      ) : config.layout === 'buckets' ? (
        <BucketGrid list={list} config={config} />
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
