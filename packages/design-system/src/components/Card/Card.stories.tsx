/**
 * Card stories — SUG-79 / SUG-82
 *
 * Realistic Sugartown content data throughout.
 * No lorem ipsum. No featuredImage references.
 * Thumbnail images use Sanity CDN — never featuredImage (deprecated BL-07).
 *
 * All stories use showFolio=true where an eyebrow is present — this is the
 * canonical Ledger Tradition card structure (SUG-82).
 *
 * Theme globals: 'light-pink-moon' (default) / 'dark-pink-moon'. Legacy
 * 'light' and 'dark' values are deprecated and must not appear in stories.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

// ─── Placeholder image URLs (never featuredImage) ─────────────────────────────
const THUMB_16_9  = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=480&h=270&fit=crop';
const THUMB_RAIL  = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=96&h=120&fit=crop';

// ─── Realistic fixture data ────────────────────────────────────────────────────
// aiTool omitted — deprecated. Claude appears in tools[] (the canonical slot).

const NODE_FULL = {
  variant: 'default' as const,
  showFolio: true,
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
  date: '2025-11-14',
  href: '/nodes/prompt-architecture-long-form',
};

const ARTICLE_MINIMAL = {
  variant: 'default' as const,
  showFolio: true,
  eyebrow: 'Article',
  title: 'Typography at Scale: Variable Fonts in Production',
  category: { label: 'Engineering', href: '/categories/engineering' },
  date: '2024-01-08',
  href: '/articles/variable-fonts-production',
};

const CASE_STUDY_FULL = {
  variant: 'default' as const,
  showFolio: true,
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
    status:           { control: { type: 'select' }, options: [
      'dreaming', 'designing', 'developing', 'testing', 'deploying', 'iterating', 'draft',
    ]},
    evolution:        { control: { type: 'select' }, options: [
      'exploring', 'validated', 'operationalized', 'deprecated', 'evergreen',
    ]},
    showFolio:        { control: 'boolean' },
    title:            { control: 'text' },
    eyebrow:          { control: 'text' },
    excerpt:          { control: 'text' },
    href:             { control: 'text' },
    accentColor:      { control: 'color' },
    thumbnailUrl:     { control: 'text' },
    thumbnailAlt:     { control: 'text' },
    date:             { control: 'text' },
    nextStep:         { control: 'text' },
    toolsLabel:       { control: 'text' },
    tagsLabel:        { control: 'text' },
    category:         { control: { type: 'object' } },
    project:          { control: { type: 'object' } },
    metadata:         { control: { type: 'object' } },
    tags:             { control: { type: 'object' } },
    tools:            { control: { type: 'object' } },
    kpiLink:          { control: { type: 'object' } },
    // Deprecated props — hidden from controls
    categoryPosition: { table: { disable: true } },
    aiTool:           { table: { disable: true } },
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
 * Full node card — light-pink-moon. Folio slot active: eyebrow + evolution
 * badge in the canvas strip, header shows category + title.
 */
export const DefaultFull: Story = {
  name: 'DefaultFull',
  globals: { theme: 'light-pink-moon' },
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
 * accentColor="#2BD4AA" — left border strip + header wash.
 * Folio label and body eyebrow suppressed; folio shows type + badge.
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
 * Title only — all optional props omitted, showFolio off (no eyebrow to show).
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
 * thumbnailUrl — hero renders above folio, full-width.
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
  },
};

/**
 * Compact density — tighter padding and smaller type scale.
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
 * Folio slot — light-pink-moon. Canonical Ledger Tradition card structure.
 * Eyebrow left, evolution badge right, both in grey canvas strip.
 */
export const WithFolioSlot: Story = {
  name: 'WithFolioSlot',
  globals: { theme: 'light-pink-moon' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ...NODE_FULL,
  },
};

// ═══════════════════════════════════════════════════════════════════
// LISTING VARIANT
// ═══════════════════════════════════════════════════════════════════

/**
 * Listing basic — title, excerpt, date, project, evolution badge.
 * No folio (listing variant typically omits eyebrow strip).
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
 * Listing with thumbnail — left-rail column layout.
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
 * Full-card listing — href set, no other links. Verify full-card hit target.
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
// SNAPSHOT — Chromatic composite
// ═══════════════════════════════════════════════════════════════════

/**
 * Chromatic snapshot — node, article, case study with folio slots active.
 * Captures the canonical Ledger Tradition card structure for VRT baseline.
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
