/**
 * HomePage — renders the site homepage.
 *
 * Fetches the Sanity `page` with slug "home" if it exists, otherwise
 * falls back to a generic empty state. The `NodesExample` component
 * is preserved from the original App.jsx for parity.
 *
 * Route: /
 */
import { pageBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import PageSections from '../components/PageSections'
import NodesExample from '../components/NodesExample'
import styles from './pages.module.css'

export default function HomePage() {
  const { data: page, loading } = useSanityDoc(pageBySlugQuery, { slug: 'home' })

  if (loading) return <div className={styles.loadingPage}>Loading…</div>

  return (
    <main>
      {page?.sections && page.sections.length > 0 ? (
        <PageSections sections={page.sections} />
      ) : (
        <div className={styles.detailPage}>
          <h1 className={styles.detailHeading}>Welcome to Sugartown</h1>
          <p className={styles.detailExcerpt}>
            Add homepage content in Sanity Studio to see it here.
          </p>
        </div>
      )}

      {/* Knowledge Graph Nodes — preserved from original App.jsx */}
      <NodesExample />
    </main>
  )
}
