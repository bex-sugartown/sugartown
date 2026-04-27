/**
 * CardGrid stories — SUG-79
 *
 * Grid layout and chip-label pattern stories, moved from Card.stories.tsx.
 * These demonstrate Card behaviour in grid/list contexts, not the Card API itself.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Primitives/CardGrid',
  component: Card,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// ─── Fixture data ──────────────────────────────────────────────────────────────

const GRID_CARDS = [
  {
    showFolio: true,
    title: 'Prompt Architecture for Long-Form Reasoning',
    eyebrow: 'Node · PROJ-002',
    category: { label: 'AI Methodology', href: '/categories/ai-methodology' },
    evolution: 'exploring' as const,
    excerpt: 'Structured prompt decomposition that improves coherence in multi-step reasoning tasks.',
    tags: [{ label: 'Prompting' }, { label: 'LLM' }],
    date: '2025-11-14',
    href: '/nodes/prompt-architecture-long-form',
  },
  {
    showFolio: true,
    title: 'Building a Token-Driven Design System',
    eyebrow: 'Case Study · PROJ-001',
    category: { label: 'Systems Design', href: '/categories/systems-design' },
    excerpt: 'Three-tier CSS token architecture extracted from a live WordPress theme.',
    tags: [{ label: 'Design Systems' }, { label: 'Tokens' }, { label: 'CSS' }],
    date: '2025-03-01',
    href: '/case-studies/token-driven-design-system',
  },
  {
    showFolio: true,
    title: 'Typography at Scale: Variable Fonts in Production',
    eyebrow: 'Article',
    category: { label: 'Engineering', href: '/categories/engineering' },
    excerpt: 'Variable font axes, performance trade-offs, and how subsetting cut web font load time by 60%.',
    tools: [{ label: 'Figma' }],
    date: '2024-01-08',
    href: '/articles/variable-fonts-production',
  },
  {
    showFolio: true,
    title: 'Agentic Caucus Protocol v1',
    eyebrow: 'Node · PROJ-002',
    category: { label: 'AI Methodology', href: '/categories/ai-methodology' },
    evolution: 'exploring' as const,
    excerpt: 'Structured multi-agent deliberation framework for high-stakes decisions.',
    tags: [{ label: 'Agents' }, { label: 'Governance' }],
    tools: [{ label: 'Claude' }],
    date: '2025-12-01',
    href: '/nodes/agentic-caucus-protocol',
  },
  {
    showFolio: true,
    title: 'Sugartown IA Brief — Phase 1',
    eyebrow: 'Document',
    category: { label: 'Strategy', href: '/categories/strategy' },
    excerpt: 'Constraint doc for routing, nav, content creation, and archive setup for Phase 1.',
    date: '2026-02-26',
    href: '/nodes/ia-brief-phase-1',
  },
  {
    showFolio: true,
    title: 'Knowledge Graph Archive Design',
    eyebrow: 'Node · PROJ-002',
    category: { label: 'Product', href: '/categories/product' },
    evolution: 'exploring' as const,
    excerpt: 'Filter model, facet architecture, and URL namespace scheme for the KG archive.',
    tags: [{ label: 'IA' }, { label: 'Filters' }],
    date: '2025-10-12',
    href: '/nodes/knowledge-graph-archive-design',
  },
];

const LISTING_CARDS = [
  {
    variant: 'listing' as const,
    title: 'Prompt Architecture for Long-Form Reasoning',
    excerpt: 'Structured prompt decomposition that improves coherence in multi-step reasoning tasks. Covers chain-of-thought scaffolding, context window discipline, and output normalisation.',
    project: { label: 'PROJ-002 · Knowledge Platform', href: '/projects/knowledge-platform' },
    evolution: 'exploring' as const,
    date: '2025-11-14',
    href: '/nodes/prompt-architecture-long-form',
  },
  {
    variant: 'listing' as const,
    title: 'Building a Token-Driven Design System for a Live Product',
    excerpt: 'Three-tier CSS token architecture extracted from a live WordPress theme, migrated without a rewrite.',
    project: { label: 'PROJ-001 · Sugartown', href: '/projects/sugartown' },
    date: '2025-03-01',
    href: '/case-studies/token-driven-design-system',
  },
  {
    variant: 'listing' as const,
    title: 'Typography at Scale: Variable Fonts in Production',
    excerpt: 'Variable font axes, performance trade-offs, and how subsetting cut web font load time by 60%.',
    date: '2024-01-08',
    href: '/articles/variable-fonts-production',
  },
  {
    variant: 'listing' as const,
    title: 'Agentic Caucus Protocol v1',
    excerpt: 'Structured multi-agent deliberation framework for high-stakes product and strategy decisions.',
    project: { label: 'PROJ-002 · Knowledge Platform', href: '/projects/knowledge-platform' },
    evolution: 'exploring' as const,
    date: '2025-12-01',
  },
];

// ─── Stories ───────────────────────────────────────────────────────────────────

/** Six default cards in st-layout-grid. Varying content lengths — header and footer pinned. */
export const CardGrid: Story = {
  name: 'CardGrid',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: '2rem' }}>
      <div className="st-layout-grid">
        {GRID_CARDS.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>
    </div>
  ),
};

/** Side-by-side: current Cormorant Garamond title vs legacy Playfair reference. */
export const CardTypography: Story = {
  name: 'CardTypography · Before/After',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '760px' }}>
      <div>
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Current · Cormorant Garamond 18px
        </p>
        <Card
          eyebrow="Node · PROJ-002"
          title="Prompt Architecture for Long-Form Reasoning"
          category={{ label: 'AI Methodology', href: '/categories/ai-methodology' }}
          excerpt="Structured prompt decomposition strategies that improve coherence in multi-step reasoning tasks."
          tags={[{ label: 'Prompting' }, { label: 'LLM' }]}
          date="2025-11-14"
          href="/nodes/prompt-architecture-long-form"
        />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Legacy · Playfair 1.4rem / 700
        </p>
        <div style={{ '--st-card-title-size': '1.4rem' } as React.CSSProperties}>
          <Card
            eyebrow="Node · PROJ-002"
            title="Prompt Architecture for Long-Form Reasoning"
            category={{ label: 'AI Methodology', href: '/categories/ai-methodology' }}
            excerpt="Structured prompt decomposition strategies that improve coherence in multi-step reasoning tasks."
            tags={[{ label: 'Prompting' }, { label: 'LLM' }]}
            date="2025-11-14"
            href="/nodes/prompt-architecture-long-form"
          />
        </div>
      </div>
    </div>
  ),
};

/** 620px-wide viewport — cards should stack single-column (FilterBar present). */
export const NarrowContext: Story = {
  name: 'Grid · Narrow Context (620px)',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '620px', margin: '0 auto', border: '1px dashed rgba(255,255,255,0.1)' }}>
      <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.7rem', color: 'var(--st-color-text-muted)', marginBottom: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Narrow context · 620px (FilterBar present)
      </p>
      <div className="st-layout-grid" style={{ gridTemplateColumns: '1fr' }}>
        {GRID_CARDS.slice(0, 6).map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>
    </div>
  ),
};

/** Three states: tools only, tags only, both — verifies chip group labels appear and disappear. */
export const CardChipLabels: Story = {
  name: 'CardChipLabels · Group Labels',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', maxWidth: '960px' }}>
      <div>
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tools only</p>
        <Card
          eyebrow="Case Study"
          title="Token-Driven Design System"
          category={{ label: 'Systems Design', href: '/categories/systems-design' }}
          tools={[{ label: 'Figma' }, { label: 'Storybook' }]}
          date="2025-03-01"
          href="/case-studies/token-driven-design-system"
        />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tags only</p>
        <Card
          eyebrow="Article"
          title="Variable Fonts in Production"
          category={{ label: 'Engineering', href: '/categories/engineering' }}
          tags={[{ label: 'CSS' }, { label: 'Typography' }, { label: 'Performance' }]}
          date="2024-01-08"
          href="/articles/variable-fonts-production"
        />
      </div>
      <div>
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Both groups</p>
        <Card
          eyebrow="Node · PROJ-002"
          title="Prompt Architecture for Long-Form Reasoning"
          category={{ label: 'AI Methodology', href: '/categories/ai-methodology' }}
          tools={[{ label: 'Claude' }, { label: 'Agentic Caucus' }]}
          tags={[{ label: 'Prompting' }, { label: 'LLM' }, { label: 'Reasoning' }]}
          date="2025-11-14"
          href="/nodes/prompt-architecture-long-form"
        />
      </div>
    </div>
  ),
};

/** Stack of listing-variant cards at content width. Consistent spacing. */
export const ListingGrid: Story = {
  name: 'ListingGrid',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {LISTING_CARDS.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>
    </div>
  ),
};
