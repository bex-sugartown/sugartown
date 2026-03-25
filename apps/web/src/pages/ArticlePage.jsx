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
import { CitationNote, CitationZone } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

const portableTextComponents = {
  ...sharedPTComponents,
  types: {
    ...sharedPTComponents.types,
    richImage: ({ value }) => {
      if (!value?.asset) return null
      return (
        <figure className={styles.inlineImage}>
          <img
            src={urlFor(value.asset).width(900).quality(85).url()}
            alt={value.alt ?? ''}
            className={styles.inlineImageImg}
          />
          {value.caption && (
            <figcaption className={styles.inlineImageCaption}>{value.caption}</figcaption>
          )}
        </figure>
      )
    },
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

  // Extract leading hero section so it renders flush against the header
  const { leadHero, restSections, heroImageUrl } = extractLeadHero(post.sections)

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} />
      {leadHero && <PageSections sections={[leadHero]} />}
      <div className={styles.detailPage}>
        <p className={styles.detailEyebrow}>Article</p>
        <h1 className={styles.detailHeading}>{decodeHtml(post.title)}</h1>

        <MetadataCard
          authors={post.authors}
          contentType="Article"
          contentTypeHref={getArchivePath('article')}
          publishedAt={post.publishedAt}
          status={post.status}
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

        {post.citations?.length > 0 && (
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
        )}

        <ContentNav prev={post.prev} next={post.next} docType="article" />
      </div>
    </main>
  )
}
