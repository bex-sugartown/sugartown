/**
 * ArticlePage — renders a single Sanity `article` document.
 * Route: /articles/:slug
 */
import { useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import sharedPTComponents from '../lib/portableTextComponents'
import { decodeHtml, decodePortableText } from '../lib/htmlUtils'
import { articleBySlugQuery } from '../lib/queries'
import { useSanityDoc, useDocHasDraft } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { urlFor } from '../lib/sanity'
import { getArchivePath } from '../lib/routes'
import { extractLeadHero } from '../lib/heroUtils'
import { useState } from 'react'
import { CitationNote, CitationZone, Media } from '../design-system'
import ImageLightbox from '../components/ImageLightbox'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import MarginColumn, { hasMarginContent } from '../components/MarginColumn'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

function ArticleInlineImage({ value }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!value?.asset) return null
  const imgSrc = urlFor(value.asset).width(900).auto('format').url()

  return (
    <>
      <figure
        className={`${styles.inlineImage} ${styles.inlineImageClickable}`}
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxOpen(true) } }}
        aria-label={`View full size: ${value.alt || 'image'}`}
      >
        <Media
          src={imgSrc}
          alt={value.alt ?? ''}
          overlay={value.overlay}
          className={styles.inlineImageImg}
        />
        {value.caption && (
          <figcaption className={styles.inlineImageCaption}>{value.caption}</figcaption>
        )}
      </figure>
      {lightboxOpen && (
        <ImageLightbox
          images={[value]}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

const portableTextComponents = {
  ...sharedPTComponents,
  types: {
    ...sharedPTComponents.types,
    richImage: ({ value }) => <ArticleInlineImage value={value} />,
  },
}

export default function ArticlePage() {
  const { slug } = useParams()
  const { data: post, loading, notFound } = useSanityDoc(articleBySlugQuery, { slug })
  const siteSettings = useSiteSettings()
  const hasDraft = useDocHasDraft(post?._id)

  const seo = resolveSeo(post ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !post) return <NotFoundPage />

  // Extract leading hero — hero heading is the page title
  const { leadHero, restSections, heroImageUrl } = extractLeadHero(post.sections)
  const showMargin = hasMarginContent(post)

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} />
      {leadHero && <PageSections sections={[leadHero]} docMeta={{ date: post.publishedAt, status: post.status, readingTime: post.readingTime }} />}
      <div className={styles.detailPage} data-has-margin={showMargin || undefined}>

        <MetadataCard
          authors={post.authors}
          contentType="Article"
          contentTypeHref={getArchivePath('article')}
          publishedAt={post.publishedAt}
          status={post.status}
          readingTime={post.readingTime}
          tools={post.tools}
          categories={post.categories}
          tags={post.tags}
          projects={post.projects}
          draftBadge={<DraftBadge docId={post._id} hasDraft={hasDraft} />}
        />

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        {post.content && (
          <div className={styles.detailContent}>
            <PortableText value={decodePortableText(post.content)} components={portableTextComponents} />
          </div>
        )}

        <MarginColumn
          sections={post.sections}
          related={post.related}
          series={post.series}
          partNumber={post.partNumber}
          tools={post.tools}
          authors={post.authors}
          aiDisclosure={post.aiDisclosure}
        />

        {post.citations?.length > 0 && (
          <div className={styles.detailPageFullSpan}>
            <CitationZone>
              {post.citations.map((cite, i) => (
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

        <div className={styles.detailPageFullSpan}>
          <ContentNav prev={post.prev} next={post.next} docType="article" />
        </div>
      </div>
    </main>
  )
}
