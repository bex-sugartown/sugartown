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
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

export default function NodePage() {
  const { slug } = useParams()
  const { data: node, loading, notFound } = useSanityDoc(nodeBySlugQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = resolveSeo(node ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !node) return <NotFoundPage />

  return (
    <main className={styles.detailPage}>
      <SeoHead seo={seo} />
      <Link to="/knowledge-graph" className={styles.backLink}>
        ← Knowledge Graph
      </Link>

      <p className={styles.detailEyebrow}>Knowledge Node</p>

      <h1 className={styles.detailHeading}>{node.title}</h1>

      <MetadataCard
        authors={node.authors}
        contentType="Node"
        publishedAt={node.publishedAt}
        status={node.status}
        aiTool={node.aiTool}
        conversationType={node.conversationType}
        tools={node.tools}
        categories={node.categories}
        tags={node.tags}
        projects={node.projects}
      />

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

      {node.sections?.length > 0 && (
        <PageSections sections={node.sections} />
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

      <ContentNav prev={node.prev} next={node.next} docType="node" />
    </main>
  )
}
