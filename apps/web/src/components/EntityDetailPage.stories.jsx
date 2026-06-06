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
import { Grid, SectionLabel, Breadcrumb } from '../design-system'
import MetadataCard from './MetadataCard'
import ContentCard from './ContentCard'
import { mockArticles, mockNodes } from './__fixtures__/mockContentCards'
import pageStyles from '../pages/pages.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/EntityDetailPage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouter],
}

// ─── Shared shell ─────────────────────────────────────────────────────────────

function EntityShell({ breadcrumbs, colorHex, heading, eyebrow, description, folio, metadata, sections }) {
  const accentStyle = colorHex
    ? { '--project-accent': colorHex }
    : undefined

  return (
    <main className={pageStyles.entityDetailPage}>
      <Breadcrumb items={breadcrumbs} />

      {colorHex && (
        <div
          aria-hidden="true"
          style={{
            height: '6px',
            width: '100%',
            background: 'var(--project-accent, var(--st-color-brand-primary))',
            ...accentStyle,
          }}
        />
      )}

      {folio && (
        <div className={pageStyles.entityFolio} style={folio.thumbSize ? { '--entity-thumb-size': folio.thumbSize } : undefined}>
          <div
            className={pageStyles.entityThumbnailFallback}
            style={folio.thumbColor ? { backgroundColor: folio.thumbColor, color: '#fff' } : undefined}
            aria-hidden="true"
          >
            {folio.initial}
          </div>
          <div className={pageStyles.folioIdentity}>
            <h1 className={pageStyles.narrativeHeading}>{heading}</h1>
            {eyebrow && <p className={pageStyles.detailEyebrow}>{eyebrow}</p>}
            {description && <p className={pageStyles.entityDescription}>{description}</p>}
            {folio.url && (
              <a
                href={folio.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 'var(--st-font-size-label)', color: 'var(--st-color-text-secondary)' }}
              >
                {folio.urlLabel || folio.url}
              </a>
            )}
          </div>
        </div>
      )}

      {!folio && (
        <>
          <h1 className={pageStyles.narrativeHeading}>{heading}</h1>
          {eyebrow && <p className={pageStyles.detailEyebrow}>{eyebrow}</p>}
          {description && <p className={pageStyles.entityDescription}>{description}</p>}
        </>
      )}

      {metadata && (
        <MetadataCard {...metadata} />
      )}

      {sections.map((section) => (
        <section key={section.title} style={{ marginTop: '2rem' }}>
          <SectionLabel title={section.title} kicker={String(section.items.length)} />
          <Grid columns={2} spacing="lg">
            {section.items.map((item) => (
              <ContentCard key={item._id} item={item} docType={section.docType ?? item._type} showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      ))}
    </main>
  )
}

// ─── Person Folio ─────────────────────────────────────────────────────────────

export const PersonFolio = {
  name: 'Person Folio (/people/:slug)',
  render: () => (
    <EntityShell
      breadcrumbs={[{ label: 'People', href: '/people' }]}
      heading="Bex Walton"
      eyebrow="Design Engineer"
      description="Design engineer and content strategist. Builds systems that make the gap between design intent and implementation reality smaller."
      folio={{ initial: 'B', thumbSize: '80px' }}
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
      heading="Sanity"
      eyebrow="CMS · Platform"
      description="Headless CMS with a real-time collaborative editing experience and a developer-first content lake architecture."
      folio={{ initial: 'S', thumbSize: '72px', url: 'https://sanity.io', urlLabel: 'sanity.io' }}
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
      breadcrumbs={[{ label: 'Projects', href: '/projects' }]}
      colorHex="#00B4A6"
      heading="Mini Repo"
      eyebrow="Active project"
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
