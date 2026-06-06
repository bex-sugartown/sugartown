import React from 'react'
/**
 * Pages/TaxonomyDetailPage — taxonomy detail page template.
 *
 * Documents the two taxonomy detail variants — tag and category — both
 * rendered by TaxonomyDetailPage.jsx. Shows the detail header with accent
 * bar, breadcrumb, description, and content card listing grouped by type
 * with SectionLabel between each group.
 *
 * Production routes: /tags/:slug, /categories/:slug
 */
import { MemoryRouter } from 'react-router-dom'
import { Grid, SectionLabel, Breadcrumb, PageHeader } from '../design-system'
import ContentCard from './ContentCard'
import Pagination from './Pagination'
import { mockArticles, mockNodes } from './__fixtures__/mockContentCards'
import pageStyles from '../pages/pages.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/TaxonomyDetailPage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouter],
}

const TYPE_LABELS = {
  article: 'Articles',
  node: 'Knowledge Nodes',
  caseStudy: 'Case Studies',
}

function groupByType(items, defaultDocType) {
  const groups = {}
  for (const item of items) {
    const type = defaultDocType ?? item._type
    if (!groups[type]) groups[type] = []
    groups[type].push(item)
  }
  return Object.entries(groups).map(([type, groupItems]) => ({ type, items: groupItems }))
}

function TaxonomyDetailShell({ name, eyebrow, description, breadcrumbs, items, docType }) {
  const groups = groupByType(items, docType)
  const totalItems = items.length

  return (
    <main className={pageStyles.entityDetailPage}>
      <PageHeader
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        eyebrow={eyebrow}
        title={name}
        count={totalItems}
        description={description}
      />

      {groups.map((group) => (
        <section key={group.type} style={{ marginTop: '2rem' }}>
          <SectionLabel title={TYPE_LABELS[group.type] ?? group.type} kicker={String(group.items.length)} />
          <Grid columns={2} spacing="lg">
            {group.items.map((item) => (
              <ContentCard key={item._id} item={item} docType={group.type} showExcerpt={false} showHeroImage={false} />
            ))}
          </Grid>
        </section>
      ))}

      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    </main>
  )
}

export const TagDetail = {
  name: 'Tag Detail (/tags/:slug)',
  render: () => (
    <TaxonomyDetailShell
      name="Design Systems"
      eyebrow="Tag"
      description="Explorations into component libraries, token pipelines, and the organisational challenges of maintaining shared UI at scale."
      breadcrumbs={[{ label: 'Tags', href: '/tags' }, { label: 'Design Systems' }]}
      items={mockArticles}
      docType="article"
    />
  ),
}

export const CategoryDetail = {
  name: 'Category Detail (/categories/:slug)',
  render: () => (
    <TaxonomyDetailShell
      name="Design Engineering"
      eyebrow="Category"
      description="Where design decisions meet implementation reality — tokens, CSS architecture, component APIs, and the gap between intent and output."
      breadcrumbs={[{ label: 'Categories', href: '/categories' }, { label: 'Design Engineering' }]}
      items={[...mockArticles, ...mockNodes]}
    />
  ),
}
