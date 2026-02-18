/**
 * ArticlesArchivePage — lists all published `post` documents.
 * Route: /articles
 */
import { Link } from 'react-router-dom'
import { allPostsQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { useSanityList } from '../lib/useSanityDoc'
import styles from './pages.module.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ArticlesArchivePage() {
  const { data: posts, loading } = useSanityList(allPostsQuery)

  return (
    <main className={styles.archivePage}>
      <h1 className={styles.archiveHeading}>Articles</h1>
      <p className={styles.archiveDescription}>
        Writing on AI collaboration, design, and building in public.
      </p>

      {loading && <p className={styles.archiveEmpty}>Loading…</p>}

      {!loading && posts.length === 0 && (
        <p className={styles.archiveEmpty}>No articles published yet. Check back soon.</p>
      )}

      {!loading && posts.length > 0 && (
        <div className={styles.archiveGrid}>
          {posts.map((post) => (
            <Link
              key={post._id}
              to={getCanonicalPath({ docType: 'post', slug: post.slug?.current })}
              className={styles.archiveCard}
            >
              <p className={styles.archiveCardTitle}>{post.title}</p>
              {post.excerpt && (
                <p className={styles.archiveCardExcerpt}>{post.excerpt}</p>
              )}
              <p className={styles.archiveCardMeta}>{formatDate(post.publishedAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
