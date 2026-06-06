import React from 'react'
/**
 * Pages/TaxonomyDetailPage — taxonomy detail page template.
 *
 * Documents the two taxonomy detail variants — tag and category — both
 * rendered by TaxonomyDetailPage.jsx. Shows the detail header with accent
 * bar, breadcrumb, description, and content card listing.
 *
 * Production routes: /tags/:slug, /categories/:slug
 */
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumb } from '../design-system'
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

function TaxonomyDetailShell({ name, description, colorHex, breadcrumbs, items, docType }) {
  return (
    <main className={pageStyles.entityDetailPage}>
      <div className={pageStyles.detailHeader}>
        {colorHex && (
          <span
            className={pageStyles.accentBar}
            style={{ backgroundColor: colorHex }}
            aria-hidden="true"
          />
        )}
        <Breadcrumb items={breadcrumbs} />
      </div>
      <h1 className={pageStyles.archiveHeading}>{name}</h1>
      {description && <p className={pageStyles.archiveDescription}>{description}</p>}
      <p className={pageStyles.archiveResultCount}>{items.length} items</p>
      <div className={pageStyles.archiveGrid}>
        {items.map((item) => (
          <ContentCard key={item._id} item={item} docType={docType ?? item._type} />
        ))}
      </div>
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
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
      colorHex="#FF247D"
      breadcrumbs={[{ label: 'Categories', href: '/categories' }, { label: 'Design Engineering' }]}
      items={[...mockArticles, ...mockNodes]}
    />
  ),
}
