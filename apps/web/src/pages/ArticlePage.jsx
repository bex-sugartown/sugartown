/**
 * ArticlePage — renders a single Sanity `article` document.
 * Route: /articles/:slug
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import sharedPTComponents from '../lib/portableTextComponents'
import { decodeHtml, decodePortableText } from '../lib/htmlUtils'
import { articleBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { urlFor } from '../lib/sanity'
import { CitationNote, CitationZone } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

const portableTextComponents = {
  ...sharedPTComponents,
  types: {
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

  const seo = resolveSeo(post ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !post) return <NotFoundPage />

  // Extract leading hero section so it renders flush against the header,
  // above the back-nav / title / metadata card.
  const sections = post.sections ?? []
  const isHero = (s) => s._type === 'heroSection' || s._type === 'hero'
  const leadHero = sections[0] && isHero(sections[0]) ? sections[0] : null
  const restSections = leadHero ? sections.slice(1) : sections

  return (
    <main>
      <SeoHead seo={seo} />
      {leadHero && <PageSections sections={[leadHero]} />}
      <div className={styles.detailPage}>
        <Link to="/articles" className={styles.backLink}>
          ← All Articles
        </Link>

        <p className={styles.detailEyebrow}>Article</p>
        <h1 className={styles.detailHeading}>{decodeHtml(post.title)}</h1>

        <MetadataCard
          authors={post.authors}
          legacyAuthor={post.author}
          contentType="Article"
          publishedAt={post.publishedAt}
          status={post.status}
          tools={post.tools}
          categories={post.categories}
          tags={post.tags}
          projects={post.projects}
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

        <ContentNav prev={post.prev} next={post.next} docType="article" />
      </div>
    </main>
  )
}
