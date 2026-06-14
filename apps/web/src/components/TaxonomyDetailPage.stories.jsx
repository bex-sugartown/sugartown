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
import { Breadcrumb, PageHeader } from '../design-system'
import ContentList from './ContentList'
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

function TaxonomyDetailShell({ name, description, breadcrumbs, items, docType }) {
  return (
    <main className={pageStyles.entityDetailPage}>
      <PageHeader
        breadcrumb={<Breadcrumb items={breadcrumbs} />}
        title={name}
        count={items.length}
        description={description}
      />

      <section>
        <p className={pageStyles.archiveResultCount}>
          {items.length} item{items.length === 1 ? '' : 's'}
        </p>
        <ContentList items={items} docType={docType} />
        <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
      </section>
    </main>
  )
}

export const TagDetail = {
  name: 'Tag Detail (/tags/:slug)',
  render: () => (
    <TaxonomyDetailShell
      name="Design Systems"
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
      description="Where design decisions meet implementation reality — tokens, CSS architecture, component APIs, and the gap between intent and output."
      breadcrumbs={[{ label: 'Categories', href: '/categories' }, { label: 'Design Engineering' }]}
      items={[...mockArticles, ...mockNodes]}
    />
  ),
}
