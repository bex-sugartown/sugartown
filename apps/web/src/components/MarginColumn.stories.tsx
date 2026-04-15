/**
 * MarginColumn stories — responsive sidebar for detail pages (SUG-52).
 *
 * App-level component. Uses MemoryRouter for <Link>.
 * Fixture data mirrors real Sanity document shapes.
 *
 * Stories cover each slot (TOC, Related, Series, AI Disclosure) individually
 * and combined. The Snapshot story composes all variants for Chromatic VRT.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import MarginColumn from './MarginColumn';

// ─── Decorator: MemoryRouter for <Link> support ─────────────────────────────

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

// ─── Fixture data ───────────────────────────────────────────────────────────

/** Sections with headings that produce a TOC */
const SECTIONS_WITH_HEADINGS = [
  {
    _key: 'sec-1',
    _type: 'textSection',
    heading: 'The Problem Space',
    content: [
      { _type: 'block', _key: 'b1', style: 'h2', children: [{ _type: 'span', text: 'Defining the gap' }] },
      { _type: 'block', _key: 'b2', style: 'normal', children: [{ _type: 'span', text: 'Body text.' }] },
      { _type: 'block', _key: 'b3', style: 'h3', children: [{ _type: 'span', text: 'Sub-problem: context loss' }] },
    ],
  },
  {
    _key: 'sec-2',
    _type: 'textSection',
    heading: 'The Approach',
    content: [
      { _type: 'block', _key: 'b4', style: 'h2', children: [{ _type: 'span', text: 'Structured content' }] },
      { _type: 'block', _key: 'b5', style: 'h3', children: [{ _type: 'span', text: 'Schema-first design' }] },
    ],
  },
  {
    _key: 'sec-3',
    _type: 'textSection',
    heading: 'What We Learned',
    content: [],
  },
];

/** Minimal sections — only 1 heading, TOC should not render */
const SECTIONS_SINGLE_HEADING = [
  {
    _key: 'sec-solo',
    _type: 'textSection',
    heading: 'Only Section',
    content: [],
  },
];

const RELATED_CONTENT = [
  { _id: 'node-001', _type: 'node', title: 'The Great Disconnection', slug: 'the-great-disconnection' },
  { _id: 'article-001', _type: 'article', title: 'Building a Knowledge Graph', slug: 'building-a-knowledge-graph' },
  { _id: 'cs-001', _type: 'caseStudy', title: 'Sugartown CMS Migration', slug: 'sugartown-cms-migration' },
];

const SERIES = {
  title: 'AI Collaboration Patterns',
  slug: 'ai-collaboration-patterns',
};

const AI_TOOLS = [
  { _id: 'tool-claude-code', name: 'Claude Code', slug: 'claude-code' },
  { _id: 'tool-sanity', name: 'Sanity', slug: 'sanity' },
];

const AUTHORS = [{ name: 'Rebecca Alice' }];

// ─── Meta ───────────────────────────────────────────────────────────────────

const meta: Meta<typeof MarginColumn> = {
  title: 'Patterns/MarginColumn',
  component: MarginColumn,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MarginColumn>;

// ─── Wrapper to constrain width (margin column is ~260px in real layout) ────

const marginWrap = (Story: React.ComponentType) => (
  <div style={{ maxWidth: '280px' }}>
    <Story />
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Individual slot stories
// ═══════════════════════════════════════════════════════════════════

/** TOC only — multiple headings from sections with PortableText h2/h3. */
export const TocOnly: Story = {
  name: 'TOC Only',
  decorators: [marginWrap],
  args: {
    sections: SECTIONS_WITH_HEADINGS,
  },
};

/** Related content only — cross-type badges (Node, Article, Case Study). */
export const RelatedOnly: Story = {
  name: 'Related Only',
  decorators: [marginWrap],
  args: {
    related: RELATED_CONTENT,
  },
};

/** Series navigation — part number + series link. */
export const SeriesOnly: Story = {
  name: 'Series Only',
  decorators: [marginWrap],
  args: {
    series: SERIES,
    partNumber: 3,
  },
};

/** AI Disclosure — dynamically assembled from tools[] + authors. */
export const AiDisclosureAuto: Story = {
  name: 'AI Disclosure · Auto',
  decorators: [marginWrap],
  args: {
    tools: AI_TOOLS,
    authors: AUTHORS,
  },
};

/** AI Disclosure — manual override text. */
export const AiDisclosureManual: Story = {
  name: 'AI Disclosure · Manual',
  decorators: [marginWrap],
  args: {
    aiDisclosure: 'This document was co-authored with Claude Code. All editorial decisions are human-made.',
  },
};

// ═══════════════════════════════════════════════════════════════════
// Combined / edge case stories
// ═══════════════════════════════════════════════════════════════════

/** All slots populated — the maximal state. */
export const AllSlots: Story = {
  name: 'All Slots',
  decorators: [marginWrap],
  args: {
    sections: SECTIONS_WITH_HEADINGS,
    related: RELATED_CONTENT,
    series: SERIES,
    partNumber: 2,
    tools: AI_TOOLS,
    authors: AUTHORS,
  },
};

/** Empty — returns null when no slots have content. Renders nothing. */
export const Empty: Story = {
  name: 'Empty (renders null)',
  decorators: [marginWrap],
  args: {},
};

/** Single heading — TOC should NOT render (needs 2+ headings). */
export const SingleHeading: Story = {
  name: 'Single Heading (no TOC)',
  decorators: [marginWrap],
  args: {
    sections: SECTIONS_SINGLE_HEADING,
    related: RELATED_CONTENT,
  },
};

// ═══════════════════════════════════════════════════════════════════
// SNAPSHOT — Chromatic composite (all variants in one screenshot)
// ═══════════════════════════════════════════════════════════════════

/**
 * Chromatic snapshot — all meaningful visual states composed into a
 * single screenshot. Keeps snapshot count low on the free tier.
 */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: {
    chromatic: { disableSnapshot: false },
  },
  render: () => (
    <MemoryRouter>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'start' }}>
        {/* All slots */}
        <div style={{ maxWidth: '280px' }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>All Slots</h4>
          <MarginColumn
            sections={SECTIONS_WITH_HEADINGS}
            related={RELATED_CONTENT}
            series={SERIES}
            partNumber={2}
            tools={AI_TOOLS}
            authors={AUTHORS}
          />
        </div>
        {/* TOC only */}
        <div style={{ maxWidth: '280px' }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>TOC Only</h4>
          <MarginColumn sections={SECTIONS_WITH_HEADINGS} />
        </div>
        {/* Related only */}
        <div style={{ maxWidth: '280px' }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Related Only</h4>
          <MarginColumn related={RELATED_CONTENT} />
        </div>
        {/* Series + AI Disclosure */}
        <div style={{ maxWidth: '280px' }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Series + AI Disclosure</h4>
          <MarginColumn
            series={SERIES}
            partNumber={3}
            tools={AI_TOOLS}
            authors={AUTHORS}
          />
        </div>
        {/* Manual AI disclosure */}
        <div style={{ maxWidth: '280px' }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Manual Disclosure</h4>
          <MarginColumn aiDisclosure="Co-authored with Claude Code. All decisions are human-made." />
        </div>
      </div>
    </MemoryRouter>
  ),
};
