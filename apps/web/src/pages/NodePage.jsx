/**
 * NodePage — renders a single Sanity `node` document (knowledge graph).
 * Route: /nodes/:slug
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import sharedPTComponents from '../lib/portableTextComponents'
import { decodeHtml, decodePortableText } from '../lib/htmlUtils'
import { nodeBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { CitationNote, CitationZone } from '../design-system'
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

  // Extract leading hero section so it renders flush against the header
  const sections = node.sections ?? []
  const isHero = (s) => s._type === 'heroSection' || s._type === 'hero'
  const leadHero = sections[0] && isHero(sections[0]) ? sections[0] : null
  const restSections = leadHero ? sections.slice(1) : sections

  return (
    <main>
      <SeoHead seo={seo} />
      {leadHero && <PageSections sections={[leadHero]} />}
      <div className={styles.detailPage}>
        <Link to="/knowledge-graph" className={styles.backLink}>
          ← Knowledge Graph
        </Link>

        <p className={styles.detailEyebrow}>Knowledge Node</p>

        <h1 className={styles.detailHeading}>{decodeHtml(node.title)}</h1>

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
                <p>{decodeHtml(node.challenge)}</p>
              </>
            )}
            {node.insight && (
              <>
                <h2>Insight</h2>
                <p>{decodeHtml(node.insight)}</p>
              </>
            )}
            {node.actionItem && (
              <>
                <h2>Action Item</h2>
                <p>{decodeHtml(node.actionItem)}</p>
              </>
            )}
          </div>
        )}

        {node.content && (
          <div className={styles.detailContent}>
            <PortableText value={decodePortableText(node.content)} components={sharedPTComponents} />
          </div>
        )}

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        {node.citations?.length > 0 && (
          <CitationZone>
            {node.citations.map((cite, i) => (
              <CitationNote
                key={cite._key ?? i}
                index={i + 1}
                text={cite.text}
                url={cite.url}
                label={cite.label}
              />
            ))}
          </CitationZone>
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
      </div>
    </main>
  )
}
