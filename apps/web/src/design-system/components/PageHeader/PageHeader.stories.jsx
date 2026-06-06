/**
 * PageHeader — Patterns/PageHeader
 *
 * Full-width identity band at the top of archive, entity, and taxonomy pages.
 * Lives in Page's header slot, above the main content container.
 *
 * Page-type coverage:
 * | Archive            | breadcrumb, title, count, description, italic            |
 * | Person folio       | breadcrumb, media, title, description, tint, italic      |
 * | Entity folio       | breadcrumb, media, title, description, tint              |
 * | Taxonomy detail    | breadcrumb, title, count, description                    |
 * | Any                | + actions                                                |
 *
 * H1 italic rule (Typography Conventions story):
 *   italic=true  — archive masteheads, person folios
 *   italic=false — entity folios (project, tool), taxonomy detail pages
 *
 * SUG-157
 */

import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import Breadcrumb from '../Breadcrumb/Breadcrumb'
import Avatar from '../avatar/Avatar'

// ─── Shared decorator ────────────────────────────────────────────────────────

function withRouter(StoryFn) {
  return React.createElement(MemoryRouter, null, React.createElement(StoryFn))
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

export default {
  title: 'Patterns/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-width identity band at the top of archive, entity, and taxonomy pages. Accepts MetadataCard as a slot — see Patterns/MetadataCard for that pattern.',
      },
    },
  },
}

// ─── Archive ─────────────────────────────────────────────────────────────────

/** Archive page — breadcrumb + title + count + description. No media, tint, or metadata. */
export const ArchiveArticles = {
  name: 'Archive — Articles',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'Articles' }]} />}
      title="Articles"
      count={24}
      description="Writing on design engineering, content strategy, and the systems that hold them together."
      italic
    />
  ),
}

/** Multi-type library archive — no breadcrumb, title + count only. */
export const ArchiveLibrary = {
  name: 'Archive — Library',
  render: () => (
    <PageHeader
      title="Library"
      count={87}
      description="All content across articles, knowledge nodes, and case studies in one view."
      italic
    />
  ),
}

// ─── Entity / Folio ───────────────────────────────────────────────────────────

/**
 * Person Folio — italic per H1 rule (person folios = italic).
 * breadcrumb + Avatar + title + description + tint.
 */
export const EntityPersonFolio = {
  name: 'Entity — Person Folio',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'People', href: '/people' }]} />}
      media={<Avatar name="Bex Walton" size="xl" />}
      title="Bex Walton"
      description="Design engineer and content strategist. Builds systems that make the gap between design intent and implementation reality smaller."
      tint="var(--st-color-seafoam-300)"
      italic
    />
  ),
}

/** Tool Folio — roman per H1 rule (entity folios = roman). */
export const EntityToolFolio = {
  name: 'Entity — Tool Folio',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'Tools', href: '/tools' }]} />}
      media={<Avatar name="Figma" size="xl" />}
      title="Figma"
      description="Collaborative interface design tool used for component design, prototyping, and design token management."
      tint="var(--st-color-midnight-300)"
    />
  ),
}

// ─── Taxonomy ─────────────────────────────────────────────────────────────────

/** Tag detail — roman per H1 rule (taxonomy detail pages = roman). */
export const TaxonomyTagDetail = {
  name: 'Taxonomy — Tag Detail',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'Tags', href: '/tags' }]} />}
      title="Design Systems"
      count={12}
      description="Articles, nodes, and case studies tagged with Design Systems."
    />
  ),
}

// ─── With actions ─────────────────────────────────────────────────────────────

/** Shows the actions slot — edit/admin controls rendered top-right. */
export const WithActions = {
  name: 'With Actions',
  render: () => (
    <PageHeader
      breadcrumb={<Breadcrumb items={[{ label: 'Articles', href: '/articles' }]} />}
      title="Articles"
      count={24}
      description="Writing on design engineering, content strategy, and the systems that hold them together."
      actions={
        <button
          style={{
            fontFamily: 'var(--st-font-family-mono)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid var(--st-color-border-default)',
            color: 'var(--st-color-text-muted)',
            cursor: 'pointer',
          }}
        >
          Edit in Studio
        </button>
      }
    />
  ),
}

// ─── Snapshot (Chromatic) ─────────────────────────────────────────────────────

export const Snapshot = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Articles' }]} />}
        title="Articles"
        count={24}
        description="Writing on design engineering, content strategy, and the systems that hold them together."
        italic
      />
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'People', href: '/people' }]} />}
        media={<Avatar name="Bex Walton" size="xl" />}
        title="Bex Walton"
        description="Design engineer and content strategist."
        tint="var(--st-color-seafoam-300)"
        italic
      />
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Tags', href: '/tags' }]} />}
        title="Design Systems"
        count={12}
        description="Articles, nodes, and case studies tagged with Design Systems."
      />
    </div>
  ),
}
