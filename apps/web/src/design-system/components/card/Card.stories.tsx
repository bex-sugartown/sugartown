/**
 * Card — web adapter stories.
 *
 * Uses MemoryRouter (Card renders <Link to> for SPA navigation).
 * Mirrors DS Card stories but exercises web-specific props:
 *   - <Link> navigation for title, category, project, kpiLink
 *   - Web Chip adapter for tags/tools
 *   - children escape hatch
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Card from './Card';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof Card> = {
  title: 'Patterns/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: { layout: 'padded' },
  argTypes: {
    variant:  { control: { type: 'select' }, options: ['default', 'listing', 'metadata'] },
    density:  { control: { type: 'select' }, options: ['default', 'compact'] },
    status:   { control: { type: 'select' }, options: [undefined, 'draft', 'active', 'archived', 'evergreen', 'validated', 'exploring', 'deprecated', 'operationalized'] },
    evolution:{ control: { type: 'select' }, options: [undefined, 'exploring', 'operationalized', 'evergreen', 'deprecated'] },
    title:    { control: 'text' },
    eyebrow:  { control: 'text' },
    excerpt:  { control: 'text' },
    date:     { control: 'text' },
    href:     { control: 'text' },
    thumbnailUrl: { control: 'text' },
    thumbnailAlt: { control: 'text' },
    showFolio:    { control: 'boolean' },
    children:     { table: { disable: true } },
    tags:         { table: { disable: true } },
    tools:        { table: { disable: true } },
    metadata:     { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

const THUMB = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=480&q=80';

// ── Default variant ──────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    title: 'Building a headless CMS architecture',
    eyebrow: 'Architecture',
    excerpt: 'Exploring patterns for decoupled content delivery using Sanity and React.',
    date: '2026-04-15',
    href: '/articles/headless-cms-architecture',
  },
};

export const WithStatus: Story = {
  name: 'Default — with status',
  args: {
    title: 'Token drift and the validator',
    eyebrow: 'Design Systems',
    status: 'evergreen',
    excerpt: 'How the token validator catches cross-file drift before it ships.',
    href: '/articles/token-drift',
  },
};

export const WithThumbnail: Story = {
  name: 'Default — with thumbnail',
  args: {
    title: 'A case study in headless commerce',
    eyebrow: 'Case Study',
    excerpt: 'Migrating a Shopify storefront to a headless architecture with Sanity.',
    thumbnailUrl: THUMB,
    thumbnailAlt: 'Code on screen',
    href: '/case-studies/headless-commerce',
  },
};

// ── Listing variant ──────────────────────────────────────────────────────────

export const Listing: Story = {
  name: 'Listing variant',
  args: {
    variant: 'listing',
    title: 'The Sugartown Design System — year one',
    eyebrow: 'Design Systems',
    excerpt: 'What we built, why we built it, and what we wish we had done differently.',
    date: '2026-03-10',
    href: '/articles/design-system-year-one',
  },
};

export const ListingWithThumb: Story = {
  name: 'Listing — with thumbnail',
  args: {
    variant: 'listing',
    title: 'A case study in headless commerce',
    eyebrow: 'Case Study',
    thumbnailUrl: THUMB,
    thumbnailAlt: 'Code on screen',
    date: '2026-01-20',
    href: '/case-studies/headless-commerce',
  },
};

// ── Tags and chips ────────────────────────────────────────────────────────────

export const WithTags: Story = {
  name: 'With tags and tools',
  args: {
    title: 'Building with Sanity and React',
    eyebrow: 'Tutorial',
    excerpt: 'A practical guide to wiring a Sanity schema to a React frontend.',
    tags: [
      { label: 'Sanity', href: '/tags/sanity' },
      { label: 'React', href: '/tags/react' },
    ],
    tools: [
      { label: 'Figma', href: '/tools/figma' },
    ],
    href: '/articles/sanity-react',
  },
};

// ── Compact density ──────────────────────────────────────────────────────────

export const Compact: Story = {
  args: {
    density: 'compact',
    title: 'Quick note: schema deploy',
    eyebrow: 'Note',
    excerpt: 'Always run npx sanity schema deploy after editing schemas.',
    date: '2026-05-01',
    href: '/articles/schema-deploy',
  },
};

// ── Folio variant ─────────────────────────────────────────────────────────────

export const WithFolio: Story = {
  name: 'With folio strip',
  args: {
    title: 'Converging the Card primitive',
    eyebrow: 'Design Systems',
    status: 'evergreen',
    showFolio: true,
    excerpt: 'Aligning DS Card and web adapter across EPIC-0180.',
    href: '/articles/card-convergence',
  },
};

// ── Edge cases ───────────────────────────────────────────────────────────────

export const LongTitle: Story = {
  name: 'Edge — long title',
  args: {
    title: 'Why decoupled content architecture beats monolithic CMS for complex editorial workflows in 2026',
    eyebrow: 'Architecture',
    excerpt: 'A thorough investigation into the tradeoffs between headless and coupled CMS.',
    href: '/articles/decoupled-content',
  },
};

export const MinimalFields: Story = {
  name: 'Edge — minimal fields',
  args: {
    title: 'Untitled draft',
  },
};

export const WithChildren: Story = {
  name: 'Children escape hatch',
  render: () => (
    <Card title="Custom body content" eyebrow="Pattern">
      <div style={{ padding: '8px 0', fontSize: '0.875rem', color: 'var(--st-color-text-secondary)' }}>
        This body was injected via the <code>children</code> prop — used by MetadataCard for field grids.
      </div>
    </Card>
  ),
};

// ── Snapshot ─────────────────────────────────────────────────────────────────

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '900px' }}>
      <Card
        title="Default card"
        eyebrow="Article"
        excerpt="Body text for a default card with excerpt and date."
        date="2026-04-15"
        href="/articles/example"
      />
      <Card
        variant="listing"
        title="Listing card with thumbnail"
        eyebrow="Case Study"
        thumbnailUrl={THUMB}
        thumbnailAlt="Code"
        date="2026-03-10"
        href="/case-studies/example"
      />
      <Card
        title="With status chip"
        eyebrow="Node"
        status="evergreen"
        showFolio
        excerpt="Status chip in folio strip above the header."
        href="/nodes/example"
      />
      <Card
        density="compact"
        title="Compact density"
        eyebrow="Note"
        excerpt="Same data, tighter spacing."
        date="2026-05-01"
        href="/articles/compact"
      />
    </div>
  ),
};
