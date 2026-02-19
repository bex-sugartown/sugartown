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
import { getAuthorByline } from '../lib/person'
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

export default function ArticlePage() {
  const { slug } = useParams()
  const { data: post, loading, notFound } = useSanityDoc(articleBySlugQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = resolveSeo({
    docSeo: post?.seo ?? null,
    docTitle: post?.title ?? null,
    docType: 'article',
    docSlug: slug,
    siteDefaults: siteSettings,
  })

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

      {post.excerpt && <p className={styles.detailExcerpt}>{post.excerpt}</p>}

      <div className={styles.detailMeta}>
        {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
        {getAuthorByline(post.authors, post.author) && (
          <span>By {getAuthorByline(post.authors, post.author)}</span>
        )}
        {post.categories?.length > 0 && (
          <span>{post.categories.map((c) => c.name).join(', ')}</span>
        )}
      </div>

      {post.tags?.length > 0 && (
        <ul className={styles.tagList}>
          {post.tags.map((tag) => (
            <li key={tag.slug || tag.name} className={styles.tag}>
              {tag.name}
            </li>
          ))}
        </ul>
      )}

      {post.content && (
        <div className={styles.detailContent}>
          <PortableText value={post.content} />
        </div>
      )}
    </main>
  )
}
