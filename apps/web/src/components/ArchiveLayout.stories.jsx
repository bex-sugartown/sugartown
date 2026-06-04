/**
 * Patterns/ArchiveLayout — documents the five archive layout variants used
 * across /articles, /case-studies, /knowledge-graph, /tags, and taxonomy pages.
 *
 * These are spec/documentation stories — not live data. They use mock fixtures.
 */
import { Grid, Card, Container, Stack } from '../design-system'
import ContentCard from './ContentCard'

export default {
  title: 'Patterns/ArchiveLayout',
}

const MOCK_CARDS = Array.from({ length: 6 }, (_, i) => ({
  _id: `card-${i}`,
  title: `Article title ${i + 1}`,
  excerpt: 'A brief description of the content sits here, providing enough context for the reader to decide whether to click.',
  publishedAt: '2026-01-01',
  slug: { current: `article-${i + 1}` },
  categories: [],
  tags: [],
}))

export const GridView = {
  name: 'Grid (3-col — Articles, CaseStudies)',
  render: () => (
    <Container size="archive">
      <Grid columns={3} tabletColumns={2} spacing="md">
        {MOCK_CARDS.map((card) => (
          <Card key={card._id}>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 .5rem' }}>{card.title}</h3>
              <p style={{ margin: 0, fontSize: '.875rem' }}>{card.excerpt}</p>
            </div>
          </Card>
        ))}
      </Grid>
    </Container>
  ),
}

export const ListView = {
  name: 'List (1-col — Taxonomy detail, Knowledge Graph)',
  render: () => (
    <Container size="archive">
      <Stack direction="column" gap="4">
        {MOCK_CARDS.map((card) => (
          <Card key={card._id} variant="listing">
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 .5rem' }}>{card.title}</h3>
              <p style={{ margin: 0, fontSize: '.875rem' }}>{card.excerpt}</p>
            </div>
          </Card>
        ))}
      </Stack>
    </Container>
  ),
}

export const TwoColTaxonomy = {
  name: 'Two-column taxonomy grid (Tags, Categories)',
  render: () => (
    <Container size="archive">
      <Grid columns={2} tabletColumns={2} spacing="sm">
        {MOCK_CARDS.map((card) => (
          <Card key={card._id}>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 .5rem' }}>{card.title}</h3>
              <p style={{ margin: 0, fontSize: '.875rem' }}>{card.excerpt}</p>
            </div>
          </Card>
        ))}
      </Grid>
    </Container>
  ),
}

export const EmptyState = {
  name: 'Empty state',
  render: () => (
    <Container size="archive">
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--st-color-text-secondary)' }}>
        <p>No results found. Try adjusting your filters.</p>
      </div>
    </Container>
  ),
}
