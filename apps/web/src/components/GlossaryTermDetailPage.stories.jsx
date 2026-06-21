import React from 'react'
/**
 * Pages/GlossaryTermDetailPage — glossary term detail layout (SUG-162).
 *
 * Production route: /glossary/:slug → GlossaryTermPage.jsx
 *
 * Structure (must match the shipped page — drift is a Visual QA finding):
 *   Breadcrumb (Library / Glossary — no term crumb)
 *   H1 + neutral abbreviation Chip (variant="badge", md, no dot)
 *   Templated pronunciation (/ … / added by template)
 *   Lead definition in DS Blockquote
 *   Extended definition — full Portable Text incl. nested ordered lists
 *   Metadata ledger — DescriptionList columns={2} ledger
 */
import { MemoryRouter, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import sharedPTComponents from '../lib/portableTextComponents'
import { Blockquote, Breadcrumb, Chip, DescriptionList, PageHeader } from '../design-system'
import pageStyles from '../pages/pages.module.css'
import styles from '../pages/GlossaryPage.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/GlossaryTermDetailPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouter],
}

// ─── PT fixtures ──────────────────────────────────────────────────────────────

const block = (text, extra = {}) => ({
  _type: 'block',
  _key: Math.random().toString(36).slice(2),
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: '.s', marks: [], text }],
  ...extra,
})

const LEAD_DEFINITION = [
  block(
    'A node is a general term for a point of connection, intersection, or swelling where things join together.'
  ),
]

// MW-style numbered senses — ordinary nested ol list blocks, no bespoke schema
const EXTENDED_DEFINITION = [
  block('a point, line, or surface of a vibrating body or system that is free or relatively free from vibratory motion', { listItem: 'number', level: 1 }),
  block('a point at which a wave has an amplitude of zero', { listItem: 'number', level: 2 }),
  block('a point at which subsidiary parts originate or center', { listItem: 'number', level: 1 }),
  block('a point on a stem at which a leaf or leaves are inserted', { listItem: 'number', level: 2 }),
  block('Merriam-Webster.com Simple Definition, s.v. “node,” accessed June 9, 2026.'),
]

// ─── Shared shell — mirrors GlossaryTermPage.jsx render structure ─────────────

function RefRows({ docs }) {
  return (
    <ul className={styles.refList}>
      {docs.map((doc) => (
        <li key={doc.title} className={styles.refRow}>
          <Chip variant="tag" label={doc.typeLabel} size="sm" />
          <Link to={doc.href}>{doc.title}</Link>
        </li>
      ))}
    </ul>
  )
}

function TermShell({ term, abbreviation, pronunciation, items }) {
  return (
    <main className={pageStyles.entityDetailPage}>
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
            {term}
            {abbreviation && (
              <Chip
                variant="badge"
                label={abbreviation}
                className={styles.headingChip}
                aria-label={`Abbreviation: ${abbreviation}`}
              />
            )}
          </>
        }
      >
        {pronunciation && <p className={styles.pronunciation}>{pronunciation}</p>}
      </PageHeader>

      <Blockquote>
        <PortableText
          value={LEAD_DEFINITION}
          components={{ block: { normal: ({ children }) => <p>{children}</p> } }}
        />
      </Blockquote>

      <div className={pageStyles.detailContent}>
        <PortableText value={EXTENDED_DEFINITION} components={sharedPTComponents} />
      </div>

      {items.length > 0 && <DescriptionList items={items} columns={2} ledger />}
    </main>
  )
}

const statusChip = (status, label) => ({
  label: 'Status',
  value: <Chip variant="badge" status={status} label={label} />,
})

const relatedTermsRow = {
  label: 'Related Terms',
  value: (
    <div className={styles.chipRow}>
      <Chip label="knowledge graph" href="/glossary/knowledge-graph" variant="tag" />
      <Chip label="counterfactual" href="/glossary/counterfactual" variant="tag" />
    </div>
  ),
}

const usedInRow = {
  label: 'Used In',
  value: (
    <RefRows
      docs={[
        { typeLabel: 'Page', title: 'About', href: '/about' },
        { typeLabel: 'Article', title: 'The Seafoam That Should Have Been Lime', href: '/articles/seafoam' },
      ]}
    />
  ),
}

const relatedContentRow = {
  label: 'Related Content',
  value: (
    <RefRows
      docs={[{ typeLabel: 'Node', title: 'Visualizing the Knowledge Graph', href: '/nodes/visualizing' }]}
    />
  ),
}

const sourcesRow = {
  label: 'Sources',
  value: (
    <ul className={styles.sourcesList}>
      <li>
        <a href="https://www.merriam-webster.com/dictionary/node" target="_blank" rel="noopener noreferrer">
          Merriam-Webster
        </a>
      </li>
      <li>Oxford English Dictionary, “node, n.”</li>
    </ul>
  ),
}

// ─── Stories ──────────────────────────────────────────────────────────────────

export const FullMetadata = {
  name: 'Full metadata (/glossary/node)',
  render: () => (
    <TermShell
      term="Node"
      abbreviation="KG"
      pronunciation="/ ˈnōd /"
      items={[statusChip('evergreen', 'Evergreen'), relatedTermsRow, usedInRow, relatedContentRow, sourcesRow]}
    />
  ),
}

export const Minimal = {
  name: 'Minimal — no abbreviation / pronunciation / sources',
  render: () => (
    <TermShell
      term="Counterfactual"
      items={[statusChip('exploring', 'Exploring'), relatedTermsRow]}
    />
  ),
}

export const MissingStatus = {
  name: 'Missing status — legacy doc render guard',
  render: () => (
    <TermShell
      term="Headless CMS"
      abbreviation="CMS"
      items={[relatedTermsRow, usedInRow, sourcesRow]}
    />
  ),
}
