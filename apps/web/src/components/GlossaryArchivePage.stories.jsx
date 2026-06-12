import React, { useState } from 'react'
/**
 * Pages/GlossaryArchivePage — glossary archive layout (SUG-162; fills the
 * Pages/ coverage gap left by SUG-156 — glossary shipped after that audit).
 *
 * Production route: /glossary → GlossaryArchivePage.jsx
 *
 * Structure: PageHeader (italic, count), category filter chips, AlphaFilter,
 * letter groups with dl/dt/dd definition rows + abbreviation badges.
 */
import { MemoryRouter, Link } from 'react-router-dom'
import { Breadcrumb, PageHeader, Chip } from '../design-system'
import AlphaFilter from './AlphaFilter'
import LetterSectionHeader from './LetterSectionHeader'
import styles from '../pages/GlossaryPage.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/GlossaryArchivePage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouter],
}

const TERMS = [
  {
    term: 'Counterfactual',
    slug: 'counterfactual',
    definition: 'A reasoning device: the version of events that would have happened under a different decision. Used in nodes to make decision quality visible.',
    letter: 'C',
  },
  {
    term: 'Content operations',
    slug: 'content-operations',
    abbreviation: 'ContentOps',
    definition: 'The systems, governance, and workflows that move content from draft to published without heroics.',
    letter: 'C',
  },
  {
    term: 'Headless CMS',
    slug: 'headless-cms',
    abbreviation: 'CMS',
    definition: 'A content management system where the editorial backend is decoupled from the presentation layer.',
    letter: 'H',
  },
  {
    term: 'Node',
    slug: 'node',
    definition: 'A point of connection, intersection, or swelling where things join together.',
    letter: 'N',
  },
]

const LETTERS = ['C', 'H', 'N']

function ArchiveShell({ filterLetter: initialLetter = null }) {
  const [filterLetter, setFilterLetter] = useState(initialLetter)
  const visibleLetters = filterLetter ? LETTERS.filter((l) => l === filterLetter) : LETTERS

  return (
    <main className={styles.archivePage}>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: 'Glossary' }]} />}
        title="Glossary"
        count={TERMS.length}
        description="Controlled vocabulary for Sugartown Digital. Definitions for the terms, concepts, and patterns that appear across articles, case studies, and the knowledge graph."
        italic
      />

      <div className={styles.filterRow}>
        <Chip variant="tag" featured onClick={() => {}}>All</Chip>
        <Chip variant="tag" onClick={() => {}}>Design Engineering</Chip>
        <Chip variant="tag" onClick={() => {}}>Content</Chip>
      </div>

      <div className={styles.alphaFilterRow}>
        <AlphaFilter
          activeLetters={new Set(LETTERS)}
          filterLetter={filterLetter}
          onSelect={(l) => setFilterLetter(l === filterLetter ? null : l)}
        />
      </div>

      {visibleLetters.map((letter) => (
        <div key={letter} className={styles.letterGroup}>
          <LetterSectionHeader letter={letter} />
          <dl className={styles.termList}>
            {TERMS.filter((t) => t.letter === letter).map((term) => (
              <div key={term.slug}>
                <dt className={styles.termDt}>
                  <Link to={`/glossary/${term.slug}`} className={styles.termLink}>
                    {term.term}
                  </Link>
                  {term.abbreviation && (
                    <span className={styles.termAbbr}>{term.abbreviation}</span>
                  )}
                </dt>
                <dd className={styles.termDd}>{term.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </main>
  )
}

export const Default = {
  name: 'Archive (/glossary)',
  render: () => <ArchiveShell />,
}

export const LetterFiltered = {
  name: 'Letter filtered (C active)',
  render: () => <ArchiveShell filterLetter="C" />,
}
