/**
 * Card stories — EPIC-0156 · 17 required stories
 *
 * Realistic Sugartown content data throughout.
 * No lorem ipsum. No featuredImage references.
 * Thumbnail images use placehold.co — never featuredImage (deprecated BL-07).
 *
 * Theme is controlled by the Storybook toolbar global (default: dark).
 * Stories that verify a specific theme use `globals: { theme }` to set it.
 * The `withTheme` decorator in preview.ts stamps data-theme on <html>.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

// ─── Placeholder image URLs (never featuredImage) ─────────────────────────────
const THUMB_16_9  = 'https://placehold.co/480x270/141830/FF247D?text=Sugartown';
const THUMB_RAIL  = 'https://placehold.co/96x120/141830/2BD4AA?text=ST';

// ─── Realistic fixture data ────────────────────────────────────────────────────

const NODE_FULL = {
  variant: 'default' as const,
  eyebrow: 'Node · PROJ-002',
  category: { label: 'AI Methodology', href: '/categories/ai-methodology' },
  title: 'Prompt Architecture for Long-Form Reasoning',
  evolution: 'exploring' as const,
  excerpt:
    'Structured prompt decomposition strategies that improve coherence in multi-step reasoning tasks. Covers chain-of-thought scaffolding, context window discipline, and output normalisation.',
  tags: [
    { label: 'Prompting',   href: '/tags/prompting' },
    { label: 'LLM',         href: '/tags/llm' },
    { label: 'Reasoning',   href: '/tags/reasoning' },
  ],
  tools: [
    { label: 'Claude',      href: '/tools/claude' },
    { label: 'Agentic Caucus' },
  ],
  nextStep: 'Cross-reference with Validation Protocol node',
  aiTool: 'Claude',
  date: '2025-11-14',
  href: '/nodes/prompt-architecture-long-form',
};

const ARTICLE_MINIMAL = {
  variant: 'default' as const,
  eyebrow: 'Article',
  title: 'Typography at Scale: Variable Fonts in Production',
  category: { label: 'Engineering', href: '/categories/engineering' },
  date: '2024-01-08',
  aiTool: 'Claude',
  href: '/articles/variable-fonts-production',
};

const CASE_STUDY_FULL = {
  variant: 'default' as const,
  eyebrow: 'Case Study',
  title: 'Building a Token-Driven Design System for a Live Product',
  category: { label: 'Systems Design', href: '/categories/systems-design' },
  excerpt:
    'How we extracted a scalable three-tier token architecture from a WordPress theme, migrated to CSS custom properties, and shipped Storybook alongside the production codebase without a rewrite.',
  tags: [
    { label: 'Design Systems', href: '/tags/design-systems' },
    { label: 'CSS',            href: '/tags/css' },
    { label: 'Tokens',         href: '/tags/tokens' },
  ],
  tools: [
    { label: 'Figma' },
    { label: 'Storybook' },
  ],
  date: '2025-03-01',
  href: '/case-studies/token-driven-design-system',
};

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant:          { control: { type: 'select' }, options: ['default', 'listing', 'metadata'] },
    density:          { control: { type: 'select' }, options: ['default', 'compact'] },
    // Project lifecycle (Studio: project.status). Never combine with evolution.
    status:           { control: { type: 'select' }, options: [
      'draft', 'active', 'archived', 'implemented',
      'dreaming', 'designing', 'developing', 'testing', 'deploying', 'iterating',
    ]},
    // Node evolution (Studio: node.status). Never combine with status.
    evolution:        { control: { type: 'select' }, options: [
      'exploring', 'validated', 'operationalized', 'deprecated', 'evergreen',
    ]},
    categoryPosition: { control: { type: 'select' }, options: ['before', 'after'] },
    title:            { control: 'text' },
    eyebrow:          { control: 'text' },
    excerpt:          { control: 'text' },
    href:             { control: 'text' },
    accentColor:      { control: 'color' },
    thumbnailUrl:     { control: 'text' },
    thumbnailAlt:     { control: 'text' },
    date:             { control: 'text' },
    nextStep:         { control: 'text' },
    aiTool:           { control: 'text' },
    toolsLabel:       { control: 'text' },
    tagsLabel:        { control: 'text' },
    category:         { control: { type: 'object' } },
    project:          { control: { type: 'object' } },
    metadata:         { control: { type: 'object' } },
    tags:             { control: { type: 'object' } },
    tools:            { control: { type: 'object' } },
    kpiLink:          { control: { type: 'object' } },
    children:         { table: { disable: true } },
    footerChildren:   { table: { disable: true } },
    className:        { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// ═══════════════════════════════════════════════════════════════════
// DEFAULT VARIANT
// ═══════════════════════════════════════════════════════════════════

/**
 * Full default card with all props populated.
 * Light theme. Match legacy screenshot position.
 */
export const DefaultFull: Story = {
  name: 'DefaultFull',
  globals: { theme: 'light' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: { ...NODE_FULL },
};

/**
 * Same data as DefaultFull, dark theme.
 * No prop change — token overrides handle the colour swap.
 */
export const DefaultDark: Story = {
  name: 'DefaultDark',
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: { ...NODE_FULL },
};

/**
 * accentColor="#2BD4AA" — verify left strip, eyebrow tint, header wash.
 */
export const DefaultWithAccent: Story = {
  name: 'DefaultWithAccent',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ...NODE_FULL,
    accentColor: '#2BD4AA',
  },
};

/**
 * Title only. All optional props omitted.
 * Card must not collapse or show broken layout.
 */
export const DefaultTitleOnly: Story = {
  name: 'DefaultTitleOnly',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'A Card With Only a Title',
  },
};

/**
 * thumbnailUrl provided — hero renders above header, full-width.
 * Omit thumbnailUrl = no slot.
 */
export const DefaultWithHero: Story = {
  name: 'DefaultWithHero',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ...CASE_STUDY_FULL,
    thumbnailUrl: THUMB_16_9,
    thumbnailAlt: 'Design system token architecture diagram',
    href: '/case-studies/token-driven-design-system',
  },
};

/**
 * Compact density — visibly tighter padding AND smaller type scale.
 * Not padding-only.
 */
export const DefaultCompact: Story = {
  name: 'DefaultCompact',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ...NODE_FULL,
    density: 'compact',
  },
};

/**
 * Category before title (default position).
 * Renders between eyebrow and title.
 */
export const CategoryBefore: Story = {
  name: 'CategoryBefore',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ...NODE_FULL,
    categoryPosition: 'before',
  },
};

/**
 * Category after title — alternative position.
 * Side-by-side comparison with CategoryBefore.
 */
export const CategoryAfter: Story = {
  name: 'CategoryAfter',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ...NODE_FULL,
    categoryPosition: 'after',
  },
};

// ═══════════════════════════════════════════════════════════════════
// LISTING VARIANT
// ═══════════════════════════════════════════════════════════════════

/**
 * Listing basic — title, excerpt, date, project, status.
 * Single column, content-width. No thumbnail.
 */
export const ListingBasic: Story = {
  name: 'ListingBasic',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: 'listing',
    title: 'Prompt Architecture for Long-Form Reasoning',
    excerpt:
      'Structured prompt decomposition strategies that improve coherence in multi-step reasoning tasks. Covers chain-of-thought scaffolding and context window discipline.',
    project: { label: 'PROJ-002 · Knowledge Platform', href: '/projects/knowledge-platform' },
    evolution: 'exploring',
    date: '2025-11-14',
  },
};

/**
 * Listing with thumbnail — left-rail fixed-width column.
 * Verify column layout and vertical alignment.
 */
export const ListingWithThumb: Story = {
  name: 'ListingWithThumb',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: 'listing',
    title: 'Building a Token-Driven Design System for a Live Product',
    excerpt:
      'How we extracted a scalable three-tier token architecture from a WordPress theme and shipped Storybook alongside the production codebase.',
    project: { label: 'PROJ-001 · Sugartown', href: '/projects/sugartown' },
    date: '2025-03-01',
    thumbnailUrl: THUMB_RAIL,
    thumbnailAlt: 'Token architecture diagram',
  },
};

/**
 * Full-card listing — href set, no other links.
 * Verify full-card hit target. Keyboard nav. Focus ring via brand token.
 */
export const ListingFullCard: Story = {
  name: 'ListingFullCard',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: 'listing',
    title: 'Typography at Scale: Variable Fonts in Production',
    excerpt:
      'An exploration of variable font axes, performance trade-offs, and how font subsetting enabled a 60% reduction in web font payload.',
    date: '2024-01-08',
    href: '/articles/variable-fonts-production',
  },
};

// ═══════════════════════════════════════════════════════════════════
// GRID STORIES
// Require st-layout-grid class (added to globals.css in EPIC-0156).
// ═══════════════════════════════════════════════════════════════════

const GRID_CARDS = [
  {
    // Node — uses evolution
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
    // Case Study — no badge
    title: 'Building a Token-Driven Design System',
    eyebrow: 'Case Study · PROJ-001',
    category: { label: 'Systems Design', href: '/categories/systems-design' },
    excerpt: 'Three-tier CSS token architecture extracted from a live WordPress theme.',
    tags: [{ label: 'Design Systems' }, { label: 'Tokens' }, { label: 'CSS' }],
    date: '2025-03-01',
    href: '/case-studies/token-driven-design-system',
  },
  {
    // Article — no badge
    title: 'Typography at Scale: Variable Fonts in Production',
    eyebrow: 'Article',
    category: { label: 'Engineering', href: '/categories/engineering' },
    excerpt:
      'Variable font axes, performance trade-offs, and how subsetting cut web font load time by 60%.',
    tools: [{ label: 'Figma' }],
    date: '2024-01-08',
    href: '/articles/variable-fonts-production',
  },
  {
    // Node — evolution
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
    // Document — no badge
    title: 'Sugartown IA Brief — Phase 1',
    eyebrow: 'Document',
    category: { label: 'Strategy', href: '/categories/strategy' },
    excerpt: 'Constraint doc for routing, nav, content creation, and archive setup for Phase 1.',
    date: '2026-02-26',
    href: '/nodes/ia-brief-phase-1',
  },
  {
    // Node — uses evolution
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

/**
 * Six default cards in st-layout-grid.
 * Varying content lengths — verify header + footer pinned at all heights.
 */
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

const LISTING_CARDS = [
  {
    // Node — uses evolution
    variant: 'listing' as const,
    title: 'Prompt Architecture for Long-Form Reasoning',
    excerpt: 'Structured prompt decomposition that improves coherence in multi-step reasoning tasks. Covers chain-of-thought scaffolding, context window discipline, and output normalisation.',
    project: { label: 'PROJ-002 · Knowledge Platform', href: '/projects/knowledge-platform' },
    evolution: 'exploring' as const,
    date: '2025-11-14',
    href: '/nodes/prompt-architecture-long-form',
  },
  {
    // Case Study — no badge
    variant: 'listing' as const,
    title: 'Building a Token-Driven Design System for a Live Product',
    excerpt: 'Three-tier CSS token architecture extracted from a live WordPress theme, migrated without a rewrite.',
    project: { label: 'PROJ-001 · Sugartown', href: '/projects/sugartown' },
    date: '2025-03-01',
    href: '/case-studies/token-driven-design-system',
  },
  {
    // Article — no badge
    variant: 'listing' as const,
    title: 'Typography at Scale: Variable Fonts in Production',
    excerpt: 'Variable font axes, performance trade-offs, and how subsetting cut web font load time by 60%.',
    date: '2024-01-08',
    href: '/articles/variable-fonts-production',
  },
  {
    variant: 'listing' as const,
    // Node — evolution
    title: 'Agentic Caucus Protocol v1',
    excerpt: 'Structured multi-agent deliberation framework for high-stakes product and strategy decisions.',
    project: { label: 'PROJ-002 · Knowledge Platform', href: '/projects/knowledge-platform' },
    evolution: 'exploring' as const,
    date: '2025-12-01',
  },
];

/**
 * CardTypography — EPIC-0161 Workstream B.
 * Side-by-side comparison: old Playfair/1.4rem/700 vs new Fira Sans/1rem/600.
 * Left card shows the new (active) style; right card shows legacy for reference.
 */
export const CardTypography: Story = {
  name: 'CardTypography · Before/After',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '760px' }}>
      <div>
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          New · Fira Sans 1rem / 600
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

/**
 * Narrow context: 620px-wide viewport simulating FilterBar sidebar present.
 * Cards should stack single-column — verifies container query / narrow-context collapse.
 * EPIC-0161 Workstream A.
 */
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

/**
 * CardChipLabels — EPIC-0161 Workstream C.
 * Three states: tools only, tags only, both groups.
 * Verifies "Tools ·" and "Tags ·" labels appear/disappear correctly with empty data.
 */
export const CardChipLabels: Story = {
  name: 'CardChipLabels · Group Labels',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', maxWidth: '960px' }}>
      <div>
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Tools only
        </p>
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
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Tags only
        </p>
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
        <p style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: '0.65rem', color: 'var(--st-color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Both groups
        </p>
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

/**
 * Stack of listing cards, content-width container. Consistent spacing.
 */
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
