/**
 * GlossaryTermPage — /glossary/:slug
 * Individual glossary term definition with related terms, used-in back-refs, and sources.
 * Layout per SUG-162 design handoff: H1 + neutral abbreviation chip, templated
 * pronunciation, Blockquote lead definition, two-column DescriptionList ledger.
 * JSON-LD: DefinedTerm (schema.org)
 */
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import sharedPTComponents from '../lib/portableTextComponents'
import { glossaryTermBySlugQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { Blockquote, Breadcrumb, Chip, DescriptionList, PageHeader } from '../design-system'
import SeoHead from '../components/SeoHead'
import ContentNav from '../components/ContentNav'
import { setPreviewDoc } from '../lib/previewDoc'
import NotFoundPage from './NotFoundPage'
import pageStyles from './pages.module.css'
import styles from './GlossaryPage.module.css'

const REF_TYPE_LABELS = {
  article: 'Article',
  caseStudy: 'Case Study',
  node: 'Node',
  page: 'Page',
  glossaryTerm: 'Term',
  tag: 'Tag',
  category: 'Category',
  tool: 'Tool',
  person: 'Person',
  project: 'Project',
}

function plainText(blocks) {
  if (!blocks?.length) return ''
  return blocks
    .map((b) => b.children?.map((s) => s.text).join('') ?? '')
    .join(' ')
}

// Sanity values are inconsistent: some carry pre-typed slashes ("/ˌkaʊ…/"),
// some don't ("'nōd"). Strip surrounding slashes; the template adds its own.
function formatPronunciation(value) {
  const bare = value.replace(/^[\s/]+|[\s/]+$/g, '')
  return bare ? `/ ${bare} /` : null
}

function RefRows({ docs }) {
  return (
    <ul className={styles.refList}>
      {docs.map((doc) => (
        <li key={doc._id} className={styles.refRow}>
          <Chip variant="tag" label={REF_TYPE_LABELS[doc._type] ?? doc._type} size="sm" />
          <Link to={getCanonicalPath({ docType: doc._type, slug: doc.slug })}>
            {doc.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function GlossaryTermPage() {
  const { slug } = useParams()
  const siteSettings = useSiteSettings()
  const { data: term, loading, notFound } = useSanityDoc(glossaryTermBySlugQuery, { slug })

  // Register the current doc so the preview banner can deep-link into Studio (dev-only; no-op in prod).
  useEffect(() => {
    if (term?._id) setPreviewDoc({ id: term._id, type: 'glossaryTerm' })
    return () => setPreviewDoc(null)
  }, [term?._id])

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

  const pronunciation = term?.pronunciation ? formatPronunciation(term.pronunciation) : null

  // Related terms exclude category refs — categories have their own metadata line.
  const relatedTermsNoCategory = term?.relatedTerms?.filter((rel) => rel._type !== 'category') ?? []

  const metadataItems = term
    ? [
        term.categories?.length > 0 && {
          label: 'Category',
          value: (
            <div className={styles.chipRow}>
              {term.categories.map((cat) => (
                <Chip
                  key={cat._id}
                  label={cat.name}
                  href={getCanonicalPath({ docType: 'category', slug: cat.slug })}
                  variant="tag"
                />
              ))}
            </div>
          ),
        },
        relatedTermsNoCategory.length > 0 && {
          label: 'Related Terms',
          value: (
            <div className={styles.chipRow}>
              {relatedTermsNoCategory.map((rel) => (
                <Chip
                  key={rel._id}
                  label={rel.label}
                  href={getCanonicalPath({ docType: rel._type, slug: rel.slug })}
                  variant="tag"
                />
              ))}
            </div>
          ),
        },
        term.usedIn?.length > 0 && {
          label: 'Used In',
          value: <RefRows docs={term.usedIn} />,
        },
        term.relatedContent?.length > 0 && {
          label: 'Related Content',
          value: <RefRows docs={term.relatedContent} />,
        },
        term.sources?.length > 0 && {
          label: 'Sources',
          value: (
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
          ),
        },
      ].filter(Boolean)
    : []

  return (
    <>
      {seo && <SeoHead seo={seo} jsonLd={jsonLd} />}

      <main className={pageStyles.entityDetailPage}>
        {loading && <div className={pageStyles.loadingPage}>Loading…</div>}

        {!loading && term && (
          <>
            {/* ── Identity ──────────────────────────────────────────── */}
            <PageHeader
              breadcrumb={
                <Breadcrumb
                  items={[
                    { label: 'Library', href: '/library' },
                    { label: 'Glossary', href: '/glossary' },
                  ]}
                />
              }
              title={
                <>
                  {term.term}
                  {term.abbreviation && (
                    <Chip
                      variant="status"
                      label={term.abbreviation}
                      className={styles.headingChip}
                      aria-label={`Abbreviation: ${term.abbreviation}`}
                    />
                  )}
                </>
              }
            >
              {pronunciation && (
                <p className={styles.pronunciation}>{pronunciation}</p>
              )}
            </PageHeader>

            {/* ── Definition ────────────────────────────────────────── */}
            {term.definition && (
              <Blockquote>
                <PortableText
                  value={term.definition}
                  components={{ block: { normal: ({ children }) => <p>{children}</p> } }}
                />
              </Blockquote>
            )}

            {term.extendedDefinition && (
              <div className={pageStyles.detailContent}>
                <PortableText value={term.extendedDefinition} components={sharedPTComponents} />
              </div>
            )}

            {/* ── Metadata ledger ───────────────────────────────────── */}
            {metadataItems.length > 0 && (
              <DescriptionList items={metadataItems} columns={2} ledger />
            )}

            {/* ── Sequential nav (alphabetical) ─────────────────────── */}
            <ContentNav prev={term.prev} next={term.next} docType="glossaryTerm" />
          </>
        )}
      </main>
    </>
  )
}
