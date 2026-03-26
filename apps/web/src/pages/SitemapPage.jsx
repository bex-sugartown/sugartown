import { Link } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { useSanityDoc } from '../lib/useSanityDoc'
import { sitemapQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import styles from './SitemapPage.module.css'
import pageStyles from './pages.module.css'

// ─── Display config ─────────────────────────────────────────────────────────

/** Group display order — editorial weight (most important first) */
const GROUP_ORDER = [
  'article',
  'caseStudy',
  'node',
  'page',
  'archivePage',
  'project',
  'category',
  'tag',
  'person',
  'tool',
]

/** Human-readable labels for each doc type */
const TYPE_LABELS = {
  article: 'Articles',
  caseStudy: 'Case Studies',
  node: 'Knowledge Graph',
  page: 'Pages',
  archivePage: 'Archive Pages',
  category: 'Categories',
  tag: 'Tags',
  project: 'Projects',
  person: 'People',
  tool: 'Tools',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function groupByType(docs) {
  const groups = {}
  for (const doc of docs) {
    if (!groups[doc._type]) groups[doc._type] = []
    groups[doc._type].push(doc)
  }
  return groups
}

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SitemapPage() {
  const { data, loading } = useSanityDoc(sitemapQuery)

  if (loading) {
    return <div className={pageStyles.loadingPage}>Loading sitemap...</div>
  }

  const content = data?.content ?? []
  const stats = data?.stats ?? { totalPublished: 0, hiddenFromSearch: 0 }
  const groups = groupByType(content)
  const activeTypes = GROUP_ORDER.filter((type) => groups[type]?.length > 0)

  return (
    <>
      <SeoHead
        seo={{
          title: 'Sitemap — Sugartown Digital',
          description:
            'Complete site map of sugartown.io — every page, article, case study, and knowledge graph entry, grouped by content type.',
          robots: { index: true, follow: true },
        }}
      />

      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Sitemap</h1>
          <p className={styles.stats}>
            <span className={styles.statItem}>
              <strong>{stats.totalPublished}</strong> pages
            </span>
            <span className={styles.statSep} aria-hidden="true">·</span>
            <span className={styles.statItem}>
              <strong>{activeTypes.length}</strong> content types
            </span>
            {stats.hiddenFromSearch > 0 && (
              <>
                <span className={styles.statSep} aria-hidden="true">·</span>
                <span className={styles.statItem}>
                  <strong>{stats.hiddenFromSearch}</strong> hidden from search
                </span>
              </>
            )}
          </p>
        </header>

        {activeTypes.map((type) => {
          const items = groups[type]
          const label = TYPE_LABELS[type] || type

          return (
            <section key={type} className={styles.group} aria-labelledby={`sitemap-${type}`}>
              <h2 id={`sitemap-${type}`} className={styles.groupHeading}>
                {label}
                <span className={styles.groupCount}>({items.length})</span>
              </h2>

              <ul className={styles.linkList}>
                {items.map((doc) => {
                  const path = getCanonicalPath({
                    docType: doc._type,
                    slug: doc.slug,
                  })
                  const date = formatDate(doc._updatedAt)

                  return (
                    <li
                      key={doc._id}
                      className={`${styles.linkItem} ${doc.noIndex ? styles.noIndex : ''}`}
                    >
                      <Link to={path} className={styles.link}>
                        {doc.title || doc.slug}
                      </Link>
                      {doc.noIndex && (
                        <span className={styles.noIndexBadge} title="This page is excluded from search engine indexing">
                          noindex
                        </span>
                      )}
                      {date && (
                        <time className={styles.date} dateTime={doc._updatedAt}>
                          {date}
                        </time>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </main>
    </>
  )
}
