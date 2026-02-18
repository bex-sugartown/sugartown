/**
 * NodePage — renders a single Sanity `node` document (knowledge graph).
 * Route: /nodes/:slug
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { nodeBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import SeoHead from '../components/SeoHead'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NodePage() {
  const { slug } = useParams()
  const { data: node, loading, notFound } = useSanityDoc(nodeBySlugQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = resolveSeo({
    docSeo: node?.seo ?? null,
    docTitle: node?.title ?? null,
    docType: 'node',
    docSlug: slug,
    siteDefaults: siteSettings,
  })

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !node) return <NotFoundPage />

  return (
    <main className={styles.detailPage}>
      <SeoHead seo={seo} />
      <Link to="/knowledge-graph" className={styles.backLink}>
        ← Knowledge Graph
      </Link>

      <p className={styles.detailEyebrow}>
        Knowledge Node
        {node.aiTool && ` · ${node.aiTool}`}
        {node.conversationType && ` · ${node.conversationType}`}
      </p>

      <h1 className={styles.detailHeading}>{node.title}</h1>

      {node.excerpt && <p className={styles.detailExcerpt}>{node.excerpt}</p>}

      <div className={styles.detailMeta}>
        {node.publishedAt && <span>{formatDate(node.publishedAt)}</span>}
        {node.status && <span>Status: {node.status}</span>}
      </div>

      {(node.challenge || node.insight || node.actionItem) && (
        <div className={styles.detailContent}>
          {node.challenge && (
            <>
              <h2>Challenge</h2>
              <p>{node.challenge}</p>
            </>
          )}
          {node.insight && (
            <>
              <h2>Insight</h2>
              <p>{node.insight}</p>
            </>
          )}
          {node.actionItem && (
            <>
              <h2>Action Item</h2>
              <p>{node.actionItem}</p>
            </>
          )}
        </div>
      )}

      {node.content && (
        <div className={styles.detailContent}>
          <PortableText value={node.content} />
        </div>
      )}

      {node.categories?.length > 0 && (
        <ul className={styles.tagList} style={{ marginTop: '2rem' }}>
          {node.categories.map((cat) => (
            <li key={cat.slug?.current || cat.name} className={styles.tag}>
              {cat.name}
            </li>
          ))}
        </ul>
      )}

      {node.conversationLink && (
        <p style={{ marginTop: '2rem' }}>
          <a
            href={node.conversationLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.placeholderLink}
          >
            View original conversation →
          </a>
        </p>
      )}
    </main>
  )
}
