/**
 * RootPage — renders a Sanity `page` document fetched by slug.
 * Route: /:slug  (root pages like /about, /contact, etc.)
 */
import { useParams } from 'react-router-dom'
import { pageBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import PageSections from '../components/PageSections'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

export default function RootPage() {
  const { slug } = useParams()
  const { data: page, loading, notFound } = useSanityDoc(pageBySlugQuery, { slug })

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !page) return <NotFoundPage />

  return (
    <main>
      {page.sections && page.sections.length > 0 ? (
        <PageSections sections={page.sections} />
      ) : (
        <div className={styles.detailPage}>
          <h1 className={styles.detailHeading}>{page.title}</h1>
        </div>
      )}
    </main>
  )
}
