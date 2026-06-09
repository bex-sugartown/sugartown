/**
 * GlossaryArchivePage — /glossary
 * Alphabetical listing of all glossaryTerm documents with AlphaFilter,
 * category filter chips (DS Chip), and dl/dt/dd semantics.
 * JSON-LD: DefinedTermSet (schema.org)
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { allGlossaryTermsQuery } from '../lib/queries'
import { getCanonicalPath } from '../lib/routes'
import { useSanityList } from '../lib/useSanityDoc'
import { Breadcrumb, PageHeader, Chip } from '../design-system'
import AlphaFilter from '../components/AlphaFilter'
import LetterSectionHeader from '../components/LetterSectionHeader'
import SeoHead from '../components/SeoHead'
import styles from './GlossaryPage.module.css'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function plainText(blocks) {
  if (!blocks?.length) return ''
  return blocks
    .map((b) => b.children?.map((s) => s.text).join('') ?? '')
    .join(' ')
}

export default function GlossaryArchivePage() {
  const { data: terms, loading } = useSanityList(allGlossaryTermsQuery)
  const [activeCategory, setActiveCategory] = useState(null)
  const [filterLetter, setFilterLetter] = useState(null)

  const categories = useMemo(() => {
    const seen = new Map()
    terms.forEach((t) => {
      t.categories?.forEach((c) => {
        if (!seen.has(c._id)) seen.set(c._id, c)
      })
    })
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [terms])

  const filtered = useMemo(() => {
    if (!activeCategory) return terms
    return terms.filter((t) =>
      t.categories?.some((c) => c._id === activeCategory)
    )
  }, [terms, activeCategory])

  const byLetter = useMemo(() => {
    const map = {}
    filtered.forEach((t) => {
      const letter = (t.term?.[0] ?? '#').toUpperCase()
      if (!map[letter]) map[letter] = []
      map[letter].push(t)
    })
    return map
  }, [filtered])

  const lettersWithTerms = useMemo(() => new Set(Object.keys(byLetter)), [byLetter])

  const visibleLetters = filterLetter
    ? ALPHABET.filter((l) => l === filterLetter && byLetter[l])
    : ALPHABET.filter((l) => byLetter[l])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Sugartown Glossary',
    description: 'Key terms and concepts used across Sugartown Digital',
    url: 'https://sugartown.io/glossary',
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: plainText(t.definition),
      url: `https://sugartown.io/glossary/${t.slug}`,
    })),
  }

  return (
    <>
      <SeoHead
        title="Glossary — Sugartown Digital"
        description="Controlled vocabulary for Sugartown Digital. Definitions for the terms, concepts, and patterns that appear across articles, case studies, and the knowledge graph."
        jsonLd={jsonLd}
      />

      <main className={styles.archivePage}>
        <PageHeader
          breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: 'Glossary' }]} />}
          title="Glossary"
          count={terms.length}
          description="Controlled vocabulary for Sugartown Digital. Definitions for the terms, concepts, and patterns that appear across articles, case studies, and the knowledge graph."
          italic
        />

        {/* Category filter */}
        {categories.length > 0 && (
          <div className={styles.filterRow}>
            <Chip
              variant="tag"
              featured={!activeCategory}
              onClick={() => setActiveCategory(null)}
            >
              All
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c._id}
                variant="tag"
                featured={activeCategory === c._id}
                onClick={() => setActiveCategory(c._id)}
              >
                {c.name}
              </Chip>
            ))}
          </div>
        )}

        {/* A-Z filter */}
        <div className={styles.alphaFilterRow}>
          <AlphaFilter
            activeLetters={lettersWithTerms}
            filterLetter={filterLetter}
            onSelect={(l) => setFilterLetter(l === filterLetter ? null : l)}
          />
        </div>

        {loading && <p className={styles.empty}>Loading…</p>}

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>
            {activeCategory ? 'No terms in this category.' : 'No glossary terms published yet.'}
          </p>
        )}

        {/* Term groups by letter */}
        {!loading &&
          visibleLetters.map((letter) => (
            <div key={letter} className={styles.letterGroup}>
              <LetterSectionHeader letter={letter} />
              <dl className={styles.termList}>
                {byLetter[letter].map((term) => (
                  <div key={term._id}>
                    <dt className={styles.termDt}>
                      <Link
                        to={getCanonicalPath({ docType: 'glossaryTerm', slug: term.slug })}
                        className={styles.termLink}
                      >
                        {term.term}
                      </Link>
                      {term.abbreviation && (
                        <span className={styles.termAbbr}>{term.abbreviation}</span>
                      )}
                    </dt>
                    <dd className={styles.termDd}>
                      {term.definition ? (
                        <PortableText value={term.definition} components={{ block: { normal: ({ children }) => <>{children}</> } }} />
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
      </main>
    </>
  )
}
