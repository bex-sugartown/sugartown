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
 * and the related-content grid that follows. Static fixtures — no Sanity data.
 *
 * Production routes:
 *   /people/:slug    → PersonProfilePage.jsx
 *   /tools/:slug     → ToolDetailPage.jsx
 *   /projects/:slug  → ProjectDetailPage.jsx
 */
import { MemoryRouter } from 'react-router-dom'
import { Grid, SectionLabel, Breadcrumb } from '../design-system'
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

// ─── Person Folio ─────────────────────────────────────────────────────────────

export const PersonFolio = {
  name: 'Person Folio (/people/:slug)',
  render: () => (
    <main className={pageStyles.entityDetailPage}>
      <Breadcrumb items={[{ label: 'People', href: '/people' }]} />

      <div className={pageStyles.entityFolio} style={{ '--entity-thumb-size': '80px' }}>
        <div className={pageStyles.entityThumbnailFallback} aria-hidden="true">B</div>
        <div className={pageStyles.folioIdentity}>
          <h1 className={pageStyles.narrativeHeading}>Bex Walton</h1>
          <p className={pageStyles.detailEyebrow}>Design Engineer</p>
          <p className={pageStyles.entityDescription}>
            Design engineer and content strategist. Builds systems that make the gap between design intent and implementation reality smaller.
          </p>
        </div>
      </div>

      <section>
        <SectionLabel title="Articles" kicker={String(mockArticles.length)} />
        <Grid columns={2} spacing="lg">
          {mockArticles.map((item) => (
            <ContentCard key={item._id} item={item} docType="article" showExcerpt={false} showHeroImage={false} />
          ))}
        </Grid>
      </section>

      <section>
        <SectionLabel title="Knowledge Nodes" kicker={String(mockNodes.length)} />
        <Grid columns={2} spacing="lg">
          {mockNodes.map((item) => (
            <ContentCard key={item._id} item={item} docType="node" showExcerpt={false} showHeroImage={false} />
          ))}
        </Grid>
      </section>
    </main>
  ),
}

// ─── Tool Folio ───────────────────────────────────────────────────────────────

export const ToolFolio = {
  name: 'Tool Folio (/tools/:slug)',
  render: () => (
    <main className={pageStyles.entityDetailPage}>
      <Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: 'Tools & Platforms', href: '/tools' }]} />

      <div className={pageStyles.entityFolio} style={{ '--entity-thumb-size': '72px' }}>
        <div className={pageStyles.entityThumbnailFallback} aria-hidden="true">S</div>
        <div className={pageStyles.folioIdentity}>
          <h1 className={pageStyles.narrativeHeading}>Sanity</h1>
          <p className={pageStyles.detailEyebrow}>CMS · Platform</p>
          <p className={pageStyles.entityDescription}>
            Headless CMS with a real-time collaborative editing experience and a developer-first content lake architecture.
          </p>
          <a
            href="https://sanity.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 'var(--st-font-size-label)', color: 'var(--st-color-text-secondary)' }}
          >
            sanity.io
          </a>
        </div>
      </div>

      <section>
        <SectionLabel title="Articles" kicker={String(mockArticles.length)} />
        <Grid columns={2} spacing="lg">
          {mockArticles.map((item) => (
            <ContentCard key={item._id} item={item} docType="article" showExcerpt={false} showHeroImage={false} />
          ))}
        </Grid>
      </section>
    </main>
  ),
}

// ─── Project Folio ────────────────────────────────────────────────────────────

export const ProjectFolio = {
  name: 'Project Folio (/projects/:slug)',
  render: () => (
    <main className={pageStyles.entityDetailPage}>
      <Breadcrumb items={[{ label: 'Projects', href: '/projects' }]} />

      <div className={pageStyles.entityFolio} style={{ '--entity-thumb-size': '72px' }}>
        <div
          className={pageStyles.entityThumbnailFallback}
          style={{ backgroundColor: '#FF247D', color: '#fff' }}
          aria-hidden="true"
        >
          S
        </div>
        <div className={pageStyles.folioIdentity}>
          <h1 className={pageStyles.narrativeHeading}>Sugartown Digital</h1>
          <p className={pageStyles.detailEyebrow}>Active project</p>
          <p className={pageStyles.entityDescription}>
            The design and engineering system behind sugartown.io — tokens, components, content model, knowledge graph, and everything in between.
          </p>
        </div>
      </div>

      <section>
        <SectionLabel title="Articles" kicker={String(mockArticles.length)} />
        <Grid columns={2} spacing="lg">
          {mockArticles.map((item) => (
            <ContentCard key={item._id} item={item} docType="article" showExcerpt={false} showHeroImage={false} />
          ))}
        </Grid>
      </section>

      <section>
        <SectionLabel title="Knowledge Nodes" kicker={String(mockNodes.length)} />
        <Grid columns={2} spacing="lg">
          {mockNodes.map((item) => (
            <ContentCard key={item._id} item={item} docType="node" showExcerpt={false} showHeroImage={false} />
          ))}
        </Grid>
      </section>
    </main>
  ),
}
