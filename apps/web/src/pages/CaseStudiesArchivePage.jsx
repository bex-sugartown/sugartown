/**
 * CaseStudiesArchivePage — lists all published `caseStudy` documents.
 * Route: /case-studies
 */
import { Link } from 'react-router-dom'
import { allCaseStudiesQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { useSanityList } from '../lib/useSanityDoc'
import styles from './pages.module.css'

export default function CaseStudiesArchivePage() {
  const { data: caseStudies, loading } = useSanityList(allCaseStudiesQuery)

  return (
    <main className={styles.archivePage}>
      <h1 className={styles.archiveHeading}>Case Studies</h1>
      <p className={styles.archiveDescription}>
        Work, process, and outcomes from client and personal projects.
      </p>

      {loading && <p className={styles.archiveEmpty}>Loading…</p>}

      {!loading && caseStudies.length === 0 && (
        <p className={styles.archiveEmpty}>No case studies published yet. Check back soon.</p>
      )}

      {!loading && caseStudies.length > 0 && (
        <div className={styles.archiveGrid}>
          {caseStudies.map((cs) => (
            <Link
              key={cs._id}
              to={getCanonicalPath({ docType: 'caseStudy', slug: cs.slug?.current })}
              className={styles.archiveCard}
            >
              <p className={styles.archiveCardTitle}>{cs.title}</p>
              {cs.excerpt && (
                <p className={styles.archiveCardExcerpt}>{cs.excerpt}</p>
              )}
              <p className={styles.archiveCardMeta}>
                {cs.client && `${cs.client} · `}
                {cs.role}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
