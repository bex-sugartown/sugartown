import { Link } from 'react-router-dom'
import { useSanityDoc } from '../lib/useSanityDoc'
import { latestArticleQuery, latestNodeQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { getLinkProps } from '../lib/linkUtils'
import stats from '../generated/stats.json'
import styles from './RecentContentSection.module.css'

// ── TickerCard ──────────────────────────────────────────────────────────────
// Internal component — not exported. Uses card tokens but no border wrapper;
// the section grid provides hairline dividers via gap+background technique.

function TickerCard({ type, title, descriptor, meta, href, loading }) {
  const inner = (
    <>
      <span className={styles.cardType}>{type}</span>
      <div className={styles.cardTitle}>
        {loading ? <span className={styles.skeleton} style={{ width: '70%' }} /> : title}
      </div>
      {descriptor && !loading && (
        <p className={styles.cardDescriptor}>{descriptor}</p>
      )}
      <div className={styles.cardMeta}>
        {loading ? <span className={styles.skeleton} style={{ width: '40%' }} /> : meta}
      </div>
    </>
  )

  if (loading || !href) {
    return <div className={styles.card}>{inner}</div>
  }

  const { isExternal, linkProps } = getLinkProps(href)

  if (isExternal) {
    return <a className={styles.card} {...linkProps}>{inner}</a>
  }

  return (
    <Link to={href} className={styles.card}>
      {inner}
    </Link>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── RecentContentSection ────────────────────────────────────────────────────

export default function RecentContentSection({ section }) {
  const heading = section?.heading || 'Recently shipped'

  const { data: latestArticle, loading: articleLoading } = useSanityDoc(latestArticleQuery)
  const { data: latestNode, loading: nodeLoading } = useSanityDoc(latestNodeQuery)

  const release = stats.release?.current

  return (
    <section className={styles.section}>
      {heading && <h2 className={styles.heading}>{heading}</h2>}

      <div className={styles.grid}>

        {/* ── Release column (build-time data) ── */}
        <TickerCard
          type="Release"
          title={release ? `v${release.version}` : '—'}
          descriptor={release?.descriptor}
          meta={release ? `${release.date} · ${release.linearIssue ?? 'changelog'}` : null}
          href="https://github.com/bex-sugartown/sugartown/blob/main/CHANGELOG.md"
        />

        {/* ── Article column (runtime Sanity query) ── */}
        <TickerCard
          type="Article"
          title={latestArticle?.title}
          descriptor={null}
          meta={[
            latestArticle?.category?.title,
            formatDate(latestArticle?.publishedAt),
          ].filter(Boolean).join(' · ')}
          href={latestArticle ? getCanonicalPath({ docType: 'article', slug: latestArticle.slug }) : null}
          loading={articleLoading}
        />

        {/* ── Node column (runtime Sanity query) ── */}
        <TickerCard
          type="Node"
          title={latestNode?.title}
          descriptor={null}
          meta={[
            latestNode?.category?.title,
            formatDate(latestNode?.publishedAt),
          ].filter(Boolean).join(' · ')}
          href={latestNode ? getCanonicalPath({ docType: 'node', slug: latestNode.slug }) : null}
          loading={nodeLoading}
        />

      </div>
    </section>
  )
}
