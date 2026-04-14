/**
 * NodePage — renders a single Sanity `node` document (knowledge graph).
 * Route: /nodes/:slug
 */
import { useParams } from 'react-router-dom'
import { nodeBySlugQuery } from '../lib/queries'
import { useSanityDoc, useDocHasDraft } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { getArchivePath } from '../lib/routes'
import { extractLeadHero } from '../lib/heroUtils'
import { CitationNote, CitationZone } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import MarginColumn, { hasMarginContent } from '../components/MarginColumn'
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

  // Extract leading hero — hero heading is the page title
  const { leadHero, restSections, heroImageUrl } = extractLeadHero(node.sections)
  const showMargin = hasMarginContent({ ...node, sections: restSections })

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} />
      {leadHero && <PageSections sections={[leadHero]} docMeta={{ date: node.publishedAt, status: node.status, readingTime: node.readingTime }} />}
      <div className={styles.detailPage} data-has-margin={showMargin || undefined}>

        <MetadataCard
          authors={node.authors}
          contentType="Node"
          contentTypeHref={getArchivePath('node')}
          publishedAt={node.publishedAt}
          status={node.status}
          readingTime={node.readingTime}
          tools={node.tools}
          categories={node.categories}
          tags={node.tags}
          projects={node.projects}
          draftBadge={<DraftBadge docId={node._id} hasDraft={hasDraft} />}
        />

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        <MarginColumn
          sections={restSections}
          related={node.related}
          series={node.series}
          partNumber={node.partNumber}
          tools={node.tools}
          authors={node.authors}
          aiDisclosure={node.aiDisclosure}
        />

        {node.citations?.length > 0 && (
          <div className={styles.detailPageFullSpan}>
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
          </div>
        )}

        {node.conversationLink && (
          <p className={styles.detailPageFullSpan} style={{ marginTop: '2rem' }}>
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

        <div className={styles.detailPageFullSpan}>
          <ContentNav prev={node.prev} next={node.next} docType="node" />
        </div>
      </div>
    </main>
  )
}
