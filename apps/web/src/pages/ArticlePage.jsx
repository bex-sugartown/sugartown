/**
 * ArticlePage — renders a single Sanity `article` document.
 * Route: /articles/:slug
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { articleBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { urlFor } from '../lib/sanity'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

const portableTextComponents = {
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

  return (
    <main className={styles.detailPage}>
      <SeoHead seo={seo} />
      <Link to="/articles" className={styles.backLink}>
        ← All Articles
      </Link>

      <p className={styles.detailEyebrow}>Article</p>
      <h1 className={styles.detailHeading}>{post.title}</h1>

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

      {post.sections?.length > 0 && (
        <PageSections sections={post.sections} />
      )}

      {post.content && (
        <div className={styles.detailContent}>
          <PortableText value={post.content} components={portableTextComponents} />
        </div>
      )}

      <ContentNav prev={post.prev} next={post.next} docType="article" />
    </main>
  )
}
