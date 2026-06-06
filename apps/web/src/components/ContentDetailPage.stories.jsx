import React from 'react'
/**
 * Pages/ContentDetailPage — content item detail page templates.
 *
 * Documents the shared shell layout used by ArticlePage, NodePage, and
 * CaseStudyPage. Each story shows the structural anatomy: MetadataCard
 * in the left sidebar position, PortableText body in the main column,
 * and PageSidebar (TOC + related) in the right rail.
 *
 * These are layout documentation stories. They use static fixtures to
 * demonstrate the shell — not live Sanity data.
 *
 * Production routes:
 *   /articles/:slug      → ArticlePage.jsx
 *   /nodes/:slug         → NodePage.jsx
 *   /case-studies/:slug  → CaseStudyPage.jsx
 */
import { MemoryRouter } from 'react-router-dom'
import { PageHeader, Breadcrumb } from '../design-system'
import MetadataCard from './MetadataCard'
import PageSidebar from './PageSidebar'
import pageStyles from '../pages/pages.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/ContentDetailPage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouter],
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAuthors = [{ _id: 'p1', name: 'Bex Walton', slug: 'bex-walton' }]
const mockCategories = [{ _id: 'c1', name: 'Design Engineering', slug: 'design-engineering', colorHex: '#FF247D' }]
const mockTags = [{ _id: 't1', name: 'Design Systems', slug: 'design-systems' }, { _id: 't2', name: 'CSS', slug: 'css' }]
const mockTools = [{ _id: 'tool1', name: 'Sanity', slug: 'sanity' }, { _id: 'tool2', name: 'Storybook', slug: 'storybook' }]

// Static PortableText blocks — gives PageSidebar something to build a TOC from
const mockContent = [
  { _type: 'block', _key: 'b1', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's1', marks: [], text: 'Most designers encounter structured content through a CMS. Fewer understand why the structure itself is the design decision — the field names, the constraints, the relationships between document types.' }] },
  { _type: 'block', _key: 'b2', style: 'h2', markDefs: [], children: [{ _type: 'span', _key: 's2', marks: [], text: 'The schema is the design spec' }] },
  { _type: 'block', _key: 'b3', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's3', marks: [], text: 'When you define a field as a reference rather than a string, you are encoding a governance decision. That decision will outlast the UI built on top of it by several years, at minimum.' }] },
  { _type: 'block', _key: 'b4', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's4', marks: [], text: 'Content modelling is not a backend concern. It is an information architecture decision that happens to live in a database.' }] },
  { _type: 'block', _key: 'b5', style: 'h2', markDefs: [], children: [{ _type: 'span', _key: 's5', marks: [], text: 'What changes when you get the structure right' }] },
  { _type: 'block', _key: 'b6', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's6', marks: [], text: 'Filters work. Relationships are navigable. Taxonomy is consistent. The archive page can sort by anything.' }] },
]

const ArticleBody = () => (
  <div className={pageStyles.detailContent}>
    <p>Most designers encounter structured content through a CMS. Fewer understand why the structure itself is the design decision — the field names, the constraints, the relationships between document types.</p>
    <h2>The schema is the design spec</h2>
    <p>When you define a field as a reference rather than a string, you are encoding a governance decision. That decision will outlast the UI built on top of it by several years, at minimum.</p>
    <p>Content modelling is not a backend concern. It is an information architecture decision that happens to live in a database. Designers who understand this build better systems than those who treat it as someone else&apos;s problem.</p>
    <h2>What changes when you get the structure right</h2>
    <p>Filters work. Relationships are navigable. Taxonomy is consistent. The archive page can sort by anything. The detail page can surface related items without a manual editorial step. The search index has something to work with.</p>
    <p>None of these are engineering wins. They are design wins expressed through data structure.</p>
  </div>
)

const NodeBody = () => (
  <div className={pageStyles.detailContent}>
    <p>The commit message said &ldquo;fix: CSS token validator — check both mirrors.&rdquo; The model had caught something I had missed: the validator was only auditing one of the two generated <code>tokens.css</code> files.</p>
    <h2>What happened</h2>
    <p>A token was renamed in <code>tokens/source/tokens.json</code>. The build regenerated both output files. The validator ran against the web app file. Passed. The design system package file still had the old reference. Silent failure, deferred until Chromatic ran.</p>
    <p>I had written the validator. I had not noticed it only watched one door. The model noticed on the second read-through of the script.</p>
    <h2>What I took from this</h2>
    <p>Validators are only as good as their scope. A script that checks one file and reports &ldquo;zero errors&rdquo; is not a clean bill of health. It is a partial audit with a misleading exit code.</p>
  </div>
)

const CaseStudyBody = () => (
  <div className={pageStyles.detailContent}>
    <p>Three years of post-launch content had accrued in a schema designed for a different editorial model. What began as a blog became a knowledge base. What began as a knowledge base became a product catalogue. The schema never kept up.</p>
    <h2>The constraint</h2>
    <p>We could not take the site down. We could not migrate in a single batch. We could not rebuild the front end simultaneously. The migration had to happen in production, incrementally, while the editorial team continued publishing.</p>
    <h2>The approach</h2>
    <p>We ran document type by document type, oldest first. Each type got a new schema, a migration script, a routing test, and a sign-off from an editor before the old type was retired. Fourteen types, eleven weeks, zero downtime.</p>
  </div>
)

// ─── Article Shell ────────────────────────────────────────────────────────────

export const ArticleShell = {
  name: 'Article Shell (/articles/:slug)',
  render: () => (
    <main>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Articles', href: '/articles' }]} />}
        title="What Structured Content Actually Means for Designers"
      />
      <div className={pageStyles.detailPage} data-has-margin>
        <MetadataCard
          authors={mockAuthors}
          contentType="Article"
          contentTypeHref="/articles"
          publishedAt="2026-05-15T09:00:00Z"
          status="evergreen"
          tools={mockTools}
          categories={mockCategories}
          tags={mockTags}
        />
        <ArticleBody />
        <PageSidebar content={mockContent} />
      </div>
    </main>
  ),
}

// ─── Node Shell ───────────────────────────────────────────────────────────────

export const NodeShell = {
  name: 'Node Shell (/nodes/:slug)',
  render: () => (
    <main>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Knowledge Graph', href: '/knowledge-graph' }]} />}
        title="The Validator Said Zero Errors. It Was Watching the Wrong Door."
      />
      <div className={pageStyles.detailPage} data-has-margin>
        <MetadataCard
          contentType="Node"
          contentTypeHref="/knowledge-graph"
          publishedAt="2026-04-10T10:00:00Z"
          status="evergreen"
          categories={[{ _id: 'c2', name: 'Design Engineering', slug: 'design-engineering', colorHex: '#FF247D' }]}
          tags={[{ _id: 't3', name: 'CSS', slug: 'css' }]}
          tools={mockTools}
        />
        <NodeBody />
        <PageSidebar content={mockContent} />
      </div>
    </main>
  ),
}

// ─── Case Study Shell ─────────────────────────────────────────────────────────

export const CaseStudyShell = {
  name: 'Case Study Shell (/case-studies/:slug)',
  render: () => (
    <main>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Case Studies', href: '/case-studies' }]} />}
        title="Rebuilding the Content Model for a Global Media Brand"
      />
      <div className={pageStyles.detailPage} data-has-margin>
        <MetadataCard
          authors={mockAuthors}
          contentType="Case Study"
          contentTypeHref="/case-studies"
          categories={[{ _id: 'c1', name: 'Content Strategy', slug: 'content-strategy', colorHex: '#D4A853' }]}
          tags={[{ _id: 't4', name: 'CMS', slug: 'cms' }]}
          projects={[{ _id: 'proj1', name: 'Media Rebuild', slug: 'media-rebuild', colorHex: '#D4A853' }]}
          status="live"
        />
        <CaseStudyBody />
        <PageSidebar content={mockContent} />
      </div>
    </main>
  ),
}
