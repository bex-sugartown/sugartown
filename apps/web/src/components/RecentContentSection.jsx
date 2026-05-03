import { useSanityDoc } from '../lib/useSanityDoc'
import { latestArticleQuery, latestNodeQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import stats from '../generated/stats.json'
import SectionLabel from '../design-system/components/section-label/SectionLabel'
import Tile from '../design-system/components/tile/Tile'
import styles from './RecentContentSection.module.css'

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── RecentContentSection ────────────────────────────────────────────────────
// Three fixed columns: release (build-time), article, node.
// caseStudy is intentionally excluded — publish cadence is too low to warrant
// a permanent column; it would routinely show stale content beside fresher articles.

export default function RecentContentSection({ section }) {
  const heading = section?.heading || 'Recently shipped'

  const { data: latestArticle, loading: articleLoading } = useSanityDoc(latestArticleQuery)
  const { data: latestNode, loading: nodeLoading } = useSanityDoc(latestNodeQuery)

  const release = stats.release?.current

  return (
    <section className={styles.section}>
      {heading && <SectionLabel as="h2">{heading}</SectionLabel>}

      <div className={styles.grid}>

        {/* ── Release column (build-time data) ── */}
        <Tile
          label="Release"
          title={release ? `v${release.version}` : '—'}
          body={release?.descriptor}
          meta={release ? `${release.date} · ${release.linearIssue ?? 'changelog'}` : null}
          href="https://github.com/bex-sugartown/sugartown/blob/main/CHANGELOG.md"
          labelColor="brand"
          titleSize="lg"
        />

        {/* ── Article column (runtime Sanity query) ── */}
        <Tile
          label="Article"
          title={latestArticle?.title}
          meta={[
            latestArticle?.category?.title,
            formatDate(latestArticle?.publishedAt),
          ].filter(Boolean).join(' · ')}
          href={latestArticle ? getCanonicalPath({ docType: 'article', slug: latestArticle.slug }) : null}
          loading={articleLoading}
          labelColor="brand"
          titleSize="lg"
        />

        {/* ── Node column (runtime Sanity query) ── */}
        <Tile
          label="Node"
          title={latestNode?.title}
          meta={[
            latestNode?.category?.title,
            formatDate(latestNode?.publishedAt),
          ].filter(Boolean).join(' · ')}
          href={latestNode ? getCanonicalPath({ docType: 'node', slug: latestNode.slug }) : null}
          loading={nodeLoading}
          labelColor="brand"
          titleSize="lg"
        />

      </div>
    </section>
  )
}
