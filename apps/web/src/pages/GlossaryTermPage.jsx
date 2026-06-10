/**
 * GlossaryTermPage — /glossary/:slug
 * Individual glossary term definition with related terms, used-in back-refs, and sources.
 * JSON-LD: DefinedTerm (schema.org)
 */
import { useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import sharedPTComponents from '../lib/portableTextComponents'
import { glossaryTermBySlugQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { Breadcrumb, Chip, Grid, SectionLabel } from '../design-system'
import SeoHead from '../components/SeoHead'
import ContentCard from '../components/ContentCard'
import NotFoundPage from './NotFoundPage'
import pageStyles from './pages.module.css'
import styles from './GlossaryPage.module.css'

const STATUS_LABELS = {
  evergreen: 'Evergreen',
  validated: 'Validated',
  exploring: 'Exploring',
  active:    'Active',
  draft:     'Draft',
  deprecated: 'Deprecated',
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

      <main className={pageStyles.entityDetailPage}>
        {loading && <div className={pageStyles.loadingPage}>Loading…</div>}

        {!loading && term && (
          <>
            <Breadcrumb
              items={[
                { label: 'Library', href: '/library' },
                { label: 'Glossary', href: '/glossary' },
              ]}
            />

            {/* ── Identity ──────────────────────────────────────────── */}
            <div className={pageStyles.folioIdentity}>
              {term.status && (
                <p className={pageStyles.detailEyebrow}>
                  {STATUS_LABELS[term.status] ?? term.status}
                </p>
              )}
              <h1 className={pageStyles.narrativeHeading}>
                {term.term}
                {term.abbreviation && (
                  <span className={styles.termAbbr}>{term.abbreviation}</span>
                )}
              </h1>
              {term.pronunciation && (
                <p className={styles.termPronunciation}>{term.pronunciation}</p>
              )}
            </div>

            {/* ── Definition ────────────────────────────────────────── */}
            {(term.definition || term.extendedDefinition) && (
              <div className={pageStyles.detailContent}>
                {term.definition && (
                  <PortableText
                    value={term.definition}
                    components={{ block: { normal: ({ children }) => <p>{children}</p> } }}
                  />
                )}
                {term.extendedDefinition && (
                  <PortableText value={term.extendedDefinition} components={sharedPTComponents} />
                )}
              </div>
            )}

            {/* ── Related terms ─────────────────────────────────────── */}
            {term.relatedTerms?.length > 0 && (
              <section className={styles.termSection}>
                <SectionLabel title="Related Terms" kicker={String(term.relatedTerms.length)} />
                <div className={styles.chipRow}>
                  {term.relatedTerms.map((rel) => (
                    <Chip
                      key={rel._id}
                      label={rel.label}
                      href={getCanonicalPath({ docType: rel._type, slug: rel.slug })}
                      variant="tag"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Used in ───────────────────────────────────────────── */}
            {term.usedIn?.length > 0 && (
              <section className={styles.termSection}>
                <SectionLabel title="Used In" kicker={String(term.usedIn.length)} />
                <Grid columns={2} spacing="lg">
                  {term.usedIn.map((doc) => (
                    <ContentCard
                      key={doc._id}
                      item={doc}
                      docType={doc._type}
                      showExcerpt={false}
                      showHeroImage={false}
                    />
                  ))}
                </Grid>
              </section>
            )}

            {/* ── Related content ───────────────────────────────────── */}
            {term.relatedContent?.length > 0 && (
              <section className={styles.termSection}>
                <SectionLabel title="Related Content" kicker={String(term.relatedContent.length)} />
                <Grid columns={2} spacing="lg">
                  {term.relatedContent.map((doc) => (
                    <ContentCard
                      key={doc._id}
                      item={doc}
                      docType={doc._type}
                      showExcerpt={false}
                      showHeroImage={false}
                    />
                  ))}
                </Grid>
              </section>
            )}

            {/* ── Sources ───────────────────────────────────────────── */}
            {term.sources?.length > 0 && (
              <section className={styles.termSection}>
                <SectionLabel title="Sources" />
                <ul className={styles.sourcesList}>
                  {term.sources.map((src, i) => (
                    <li key={i}>
                      {src.url ? (
                        <a href={src.url} target="_blank" rel="noopener noreferrer">
                          {src.text}
                        </a>
                      ) : (
                        src.text
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}
