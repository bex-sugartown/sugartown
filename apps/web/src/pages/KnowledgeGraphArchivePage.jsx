/**
 * KnowledgeGraphArchivePage — lists all published `node` documents.
 * Route: /knowledge-graph  (also handles /nodes via router alias)
 */
import { Link } from 'react-router-dom'
import { allNodesQuery } from '../lib/queries'
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

export default function KnowledgeGraphArchivePage() {
  const { data: nodes, loading } = useSanityList(allNodesQuery)

  return (
    <main className={styles.archivePage}>
      <h1 className={styles.archiveHeading}>Knowledge Graph</h1>
      <p className={styles.archiveDescription}>
        A living map of AI collaboration experiments, insights, and patterns.
      </p>

      {loading && <p className={styles.archiveEmpty}>Loading…</p>}

      {!loading && nodes.length === 0 && (
        <p className={styles.archiveEmpty}>No nodes published yet. Check back soon.</p>
      )}

      {!loading && nodes.length > 0 && (
        <div className={styles.archiveGrid}>
          {nodes.map((node) => (
            <Link
              key={node._id}
              to={getCanonicalPath({ docType: 'node', slug: node.slug?.current })}
              className={styles.archiveCard}
            >
              <p className={styles.archiveCardTitle}>{node.title}</p>
              {node.excerpt && (
                <p className={styles.archiveCardExcerpt}>{node.excerpt}</p>
              )}
              <p className={styles.archiveCardMeta}>
                {node.aiTool && `${node.aiTool} · `}
                {formatDate(node.publishedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
