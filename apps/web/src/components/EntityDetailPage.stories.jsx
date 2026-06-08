import React from 'react'
/**
 * Pages/EntityDetailPage — entity detail page templates.
 *
 * Documents the folio + content-sections layout used by:
 *   PersonProfilePage  — /people/:slug
 *   ToolDetailPage     — /tools/:slug
 *   ProjectDetailPage  — /projects/:slug
 *
 * Each story renders the folio anatomy (thumbnail/avatar + identity block)
 * and the related-content grid that follows.
 *
 * Props supported by EntityShell:
 *   colorHex  — renders a full-width accentBar (project pattern)
 *   metadata  — renders a MetadataCard below the heading block
 *   folio     — renders the avatar/thumbnail + identity block (person/tool pattern)
 *
 * Production routes:
 *   /people/:slug    → PersonProfilePage.jsx
 *   /tools/:slug     → ToolDetailPage.jsx
 *   /projects/:slug  → ProjectDetailPage.jsx
 */
import { MemoryRouter } from 'react-router-dom'
import { EntityDetailPageDocsPage } from '../../../../apps/storybook/.storybook/stories/EntityDetailPageDocs.stories'
import { Grid, SectionLabel, Breadcrumb, PageHeader, Avatar } from '../design-system'
import MetadataCard from './MetadataCard'
import ContentCard from './ContentCard'
import { mockArticles, mockNodes } from './__fixtures__/mockContentCards'
import pageStyles from '../pages/pages.module.css'
import sectionStyles from './PageSections.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/EntityDetailPage',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouter],
}

// ─── Shared shell ─────────────────────────────────────────────────────────────

function EntityShell({ breadcrumbs, colorHex, heading, description, media, metadata, sections, italic }) {
  return (
    <main className={pageStyles.entityDetailPage}>
      <PageHeader
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        media={media}
        title={heading}
        italic={italic}
        description={description}
        tint={colorHex ?? undefined}
      />

      {metadata && (
        <MetadataCard {...metadata} />
      )}

      <div className={sectionStyles.detailContext}>
        {sections.map((section) => (
          <section key={section.title}>
            <SectionLabel title={section.title} kicker={String(section.items.length)} />
            <Grid columns={2} spacing="lg">
              {section.items.map((item) => (
                <ContentCard key={item._id} item={item} docType={section.docType ?? item._type} showExcerpt={false} showHeroImage={false} />
              ))}
            </Grid>
          </section>
        ))}
      </div>
    </main>
  )
}

// ─── Person Folio ─────────────────────────────────────────────────────────────

export const PersonFolio = {
  name: 'Person Folio (/people/:slug)',
  render: () => (
    <EntityShell
      breadcrumbs={[{ label: 'People', href: '/people' }]}
      media={<Avatar name="Bex Walton" size="xl" />}
      heading="Bex Walton"
      description="Design engineer and content strategist. Builds systems that make the gap between design intent and implementation reality smaller."
      colorHex="var(--st-color-seafoam-300)"
      italic
      metadata={{
        contentType: 'Person',
        contentTypeHref: '/people',
        categories: [{ _id: 'c1', name: 'Design Engineering', slug: 'design-engineering', colorHex: '#FF247D' }],
        tags: [{ _id: 't1', name: 'Design Systems', slug: 'design-systems' }],
      }}
      sections={[
        { title: 'Articles', docType: 'article', items: mockArticles },
        { title: 'Knowledge Nodes', docType: 'node', items: mockNodes },
      ]}
    />
  ),
}

// ─── Tool Folio ───────────────────────────────────────────────────────────────

export const ToolFolio = {
  name: 'Tool Folio (/tools/:slug)',
  render: () => (
    <EntityShell
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Tools & Platforms', href: '/tools' }]}
      media={<Avatar name="Sanity" size="xl" />}
      heading="Sanity"
      description="Headless CMS with a real-time collaborative editing experience and a developer-first content lake architecture."
      colorHex="var(--st-color-midnight-300)"
      metadata={{
        contentType: 'Tool',
        contentTypeHref: '/tools',
        tags: [{ _id: 't2', name: 'CMS', slug: 'cms' }, { _id: 't3', name: 'Headless', slug: 'headless' }],
      }}
      sections={[
        { title: 'Articles', docType: 'article', items: mockArticles },
      ]}
    />
  ),
}

// ─── Project Detail ───────────────────────────────────────────────────────────
// Production ProjectDetailPage has no folio/thumbnail — just heading, accentBar,
// MetadataCard, then content sections. Mirrors /projects/mini-repo.

export const ProjectDetail = {
  name: 'Project Detail (/projects/:slug)',
  render: () => (
    <EntityShell
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Projects', href: '/projects' }]}
      colorHex="#00B4A6"
      heading="Mini Repo"
      description="A minimal monorepo scaffold with pnpm workspaces, Turbo, and a shared design system. Reference implementation for new Sugartown sub-projects."
      metadata={{
        contentType: 'Project',
        contentTypeHref: '/projects',
        status: 'live',
        categories: [{ _id: 'c1', name: 'Design Engineering', slug: 'design-engineering', colorHex: '#FF247D' }],
        tags: [{ _id: 't1', name: 'Design Systems', slug: 'design-systems' }, { _id: 't2', name: 'Monorepo', slug: 'monorepo' }],
        tools: [{ _id: 'tool1', name: 'Storybook', slug: 'storybook' }],
      }}
      sections={[
        { title: 'Articles', docType: 'article', items: mockArticles },
        { title: 'Knowledge Nodes', docType: 'node', items: mockNodes },
      ]}
    />
  ),
}

// ─── Guidelines ───────────────────────────────────────────────────────────────

export const Guidelines = {
  name: 'Guidelines',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    actions: { disable: true },
  },
  render: () => <EntityDetailPageDocsPage />,
}
