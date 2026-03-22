/**
 * NodePage — renders a single Sanity `node` document (knowledge graph).
 * Route: /nodes/:slug
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import sharedPTComponents from '../lib/portableTextComponents'
import { decodeHtml, decodePortableText } from '../lib/htmlUtils'
import { nodeBySlugQuery } from '../lib/queries'
import { useSanityDoc, useDocHasDraft } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { urlFor } from '../lib/sanity'
import { CitationNote, CitationZone } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

export default function NodePage() {
  const { slug } = useParams()
  const { data: node, loading, notFound } = useSanityDoc(nodeBySlugQuery, { slug })
  const siteSettings = useSiteSettings()
  const hasDraft = useDocHasDraft(node?._id)

  const seo = resolveSeo(node ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !node) return <NotFoundPage />

  // Extract leading hero section so it renders flush against the header
  const sections = node.sections ?? []
  const isHero = (s) => s._type === 'heroSection' || s._type === 'hero'
  const leadHero = sections[0] && isHero(sections[0]) ? sections[0] : null
  const restSections = leadHero ? sections.slice(1) : sections
  const heroImageUrl = leadHero?.backgroundImage?.asset
    ? urlFor(leadHero.backgroundImage.asset).width(1920).quality(90).url()
    : undefined

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} />
      {leadHero && <PageSections sections={[leadHero]} />}
      <div className={styles.detailPage}>
        <Link to="/knowledge-graph" className={styles.backLink}>
          ← Knowledge Graph
        </Link>

        <p className={styles.detailEyebrow}>Knowledge Node</p>

        <h1 className={styles.detailHeading}>{decodeHtml(node.title)}<DraftBadge docId={node._id} hasDraft={hasDraft} /></h1>

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

        {(node.challenge?.length > 0 || node.insight?.length > 0 || node.actionItem?.length > 0) && (
          <div className={styles.detailContent}>
            {node.challenge?.length > 0 && (
              <>
                <h2>Challenge</h2>
                <PortableText value={node.challenge} components={sharedPTComponents} />
              </>
            )}
            {node.insight?.length > 0 && (
              <>
                <h2>Insight</h2>
                <PortableText value={node.insight} components={sharedPTComponents} />
              </>
            )}
            {node.actionItem?.length > 0 && (
              <>
                <h2>Action Item</h2>
                <PortableText value={node.actionItem} components={sharedPTComponents} />
              </>
            )}
            {restSections.length > 0 && <hr className={styles.metadataDivider} />}
          </div>
        )}

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        {node.citations?.length > 0 && (
          <CitationZone>
            {node.citations.map((cite, i) => (
              <CitationNote key={cite._key ?? i} index={i + 1}>
                {cite.text}
                {cite.url && (
                  <>
                    {' '}
                    <a href={cite.url} target="_blank" rel="noopener noreferrer">
                      {cite.label || cite.url}
                    </a>
                  </>
                )}
              </CitationNote>
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
