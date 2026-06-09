/**
 * GlossaryTermPage — /glossary/:slug
 * Individual glossary term definition with related terms, used-in back-refs, and sources.
 * JSON-LD: DefinedTerm (schema.org)
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import sharedPTComponents from '../lib/portableTextComponents'
import { glossaryTermBySlugQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { Breadcrumb, Chip } from '../design-system'
import SeoHead from '../components/SeoHead'
import NotFoundPage from './NotFoundPage'
import styles from './GlossaryPage.module.css'

const STATUS_LABELS = {
  evergreen: 'Evergreen',
  validated: 'Validated',
  exploring: 'Exploring',
}

function plainText(blocks) {
  if (!blocks?.length) return ''
  return blocks
    .map((b) => b.children?.map((s) => s.text).join('') ?? '')
    .join(' ')
}

export default function GlossaryTermPage() {
  const { slug } = useParams()
  const siteSettings = useSiteSettings()
  const { data: term, loading, notFound } = useSanityDoc(glossaryTermBySlugQuery, { slug })

  if (!loading && notFound) return <NotFoundPage />

  const seo = term ? resolveSeo(term, siteSettings) : null

  const jsonLd = term
    ? {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: term.term,
        description: plainText(term.definition),
        url: `https://sugartown.io/glossary/${term.slug}`,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Sugartown Glossary',
          url: 'https://sugartown.io/glossary',
        },
      }
    : null

  return (
    <>
      {seo && (
        <SeoHead
          title={seo.title || `${term.term} — Sugartown Glossary`}
          description={seo.description || plainText(term.definition)}
          jsonLd={jsonLd}
        />
      )}

      <main className={styles.termPage}>
        {loading && <p className={styles.empty}>Loading…</p>}

        {!loading && term && (
          <div className={styles.termWrap}>

            <div className={styles.termHero}>
              <div className={styles.termEyebrow}>
                <Breadcrumb
                  items={[
                    { label: 'Library', href: '/library' },
                    { label: 'Glossary', href: '/glossary' },
                  ]}
                />
                {term.status && (
                  <Chip tone={term.status} size="sm">
                    {STATUS_LABELS[term.status] ?? term.status}
                  </Chip>
                )}
              </div>

              <h1 className={styles.termTitle}>
                {term.term}
                {term.abbreviation && (
                  <span className={styles.termAbbr} style={{ marginLeft: '0.75rem', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                    {term.abbreviation}
                  </span>
                )}
              </h1>

              {term.pronunciation && (
                <span className={styles.termPronunciation}>{term.pronunciation}</span>
              )}

              {term.definition && (
                <div className={styles.termDefinition}>
                  <PortableText value={term.definition} components={{ block: { normal: ({ children }) => <p>{children}</p> } }} />
                </div>
              )}

              {term.extendedDefinition && (
                <div className={styles.termExtended}>
                  <PortableText value={term.extendedDefinition} components={sharedPTComponents} />
                </div>
              )}
            </div>

            <div className={styles.termMetaGrid}>

              {term.relatedTerms?.length > 0 && (
                <div className={styles.termMetaSection}>
                  <h4 className={styles.metaHeading}>Related terms</h4>
                  <div className={styles.relatedChips}>
                    {term.relatedTerms.map((rel) => (
                      <Link
                        key={rel._id}
                        to={getCanonicalPath({ docType: rel._type, slug: rel.slug })}
                        className={styles.relatedChip}
                      >
                        {rel.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {term.usedIn?.length > 0 && (
                <div className={styles.termMetaSection}>
                  <h4 className={styles.metaHeading}>Used in</h4>
                  <ul className={styles.usedInList}>
                    {term.usedIn.map((doc) => (
                      <li key={doc._id}>
                        <span className={styles.docTypeBadge}>{doc._type === 'caseStudy' ? 'case study' : doc._type}</span>
                        <Link to={getCanonicalPath({ docType: doc._type, slug: doc.slug })}>
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {term.relatedContent?.length > 0 && (
                <div className={styles.termMetaSection}>
                  <h4 className={styles.metaHeading}>Related content</h4>
                  <ul className={styles.usedInList}>
                    {term.relatedContent.map((doc) => (
                      <li key={doc._id}>
                        <span className={styles.docTypeBadge}>{doc._type === 'caseStudy' ? 'case study' : doc._type}</span>
                        <Link to={getCanonicalPath({ docType: doc._type, slug: doc.slug })}>
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {term.sources?.length > 0 && (
                <div className={styles.termMetaSection}>
                  <h4 className={styles.metaHeading}>Sources</h4>
                  <ul className={styles.sourcesList}>
                    {term.sources.map((src, i) => (
                      <li key={i}>
                        {src.url ? (
                          <a href={src.url} target="_blank" rel="noopener noreferrer">{src.text}</a>
                        ) : (
                          src.text
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            <div className={styles.termBack}>
              <Link to="/glossary" className={styles.backLink}>← Glossary</Link>
            </div>

          </div>
        )}
      </main>
    </>
  )
}
