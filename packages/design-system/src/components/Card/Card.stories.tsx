/**
 * Card stories — SUG-79 · 12 API-demonstration stories
 *
 * Realistic Sugartown content data throughout.
 * No lorem ipsum. No featuredImage references.
 * Thumbnail images use Sanity CDN — never featuredImage (deprecated BL-07).
 *
 * Theme is controlled by the Storybook toolbar global (default: dark).
 * Stories that verify a specific theme use `globals: { theme }` to set it.
 * The `withTheme` decorator in preview.ts stamps data-theme on <html>.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

// ─── Placeholder image URLs (never featuredImage) ─────────────────────────────
const THUMB_16_9  = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=480&h=270&fit=crop';
const THUMB_RAIL  = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=96&h=120&fit=crop';

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
    // Options synced with schemas/documents/project.ts → status field (SUG-47)
    status:           { control: { type: 'select' }, options: [
      'dreaming', 'designing', 'developing', 'testing', 'deploying', 'iterating',
    ]},
    // Options synced with schemas/documents/node.ts → status field (SUG-47)
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
// SNAPSHOT — Chromatic composite (all variants in one screenshot)
// Grid / layout stories moved to CardGrid.stories.tsx (SUG-79).
// ═══════════════════════════════════════════════════════════════════

/**
 * Chromatic snapshot — node, article, case study card variants
 * composed into a single screenshot for VRT baseline.
 */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'padded',
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: '1100px' }}>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Node (full)</h4>
        <Card {...NODE_FULL} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Case Study (full)</h4>
        <Card {...CASE_STUDY_FULL} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Article (minimal)</h4>
        <Card {...ARTICLE_MINIMAL} />
      </div>
    </div>
  ),
};
