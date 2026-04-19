/**
 * PageSidebar stories — right-rail at 1024px+, disclosure below content otherwise (SUG-69).
 *
 * Uses MemoryRouter for <Link> support. Fixture data mirrors real Sanity document shapes.
 * Individual slot stories + a composite Snapshot story for Chromatic VRT.
 *
 * Note: sticky positioning and the two-column grid only activate when the sidebar is
 * rendered inside `.detailPage[data-has-margin]`. In Storybook isolation we show the
 * sidebar contents at their natural width (~220px).
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSidebar from './PageSidebar';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

// ─── Fixture data ───────────────────────────────────────────────────────────

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

const SECTIONS_SINGLE_HEADING = [
  { _key: 'sec-solo', _type: 'textSection', heading: 'Only Section', content: [] },
];

const RELATED_CONTENT = [
  { _id: 'node-001', _type: 'node', title: 'The Great Disconnection', slug: 'the-great-disconnection' },
  { _id: 'article-001', _type: 'article', title: 'Building a Knowledge Graph', slug: 'building-a-knowledge-graph' },
  { _id: 'cs-001', _type: 'caseStudy', title: 'Sugartown CMS Migration', slug: 'sugartown-cms-migration' },
];

const SERIES = { title: 'AI Collaboration Patterns', slug: 'ai-collaboration-patterns' };
const AI_TOOLS = [
  { _id: 'tool-claude-code', name: 'Claude Code', slug: 'claude-code' },
  { _id: 'tool-sanity', name: 'Sanity', slug: 'sanity' },
];
const AUTHORS = [{ name: 'Rebecca Alice' }];

// ─── Meta ───────────────────────────────────────────────────────────────────

const meta: Meta<typeof PageSidebar> = {
  title: 'Patterns/PageSidebar',
  component: PageSidebar,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof PageSidebar>;

const wrap = (Story: React.ComponentType) => (
  <div style={{ maxWidth: '240px' }}>
    <Story />
  </div>
);

// ─── Individual slots ───────────────────────────────────────────────────────

export const TocOnly: Story = {
  name: 'TOC Only',
  decorators: [wrap],
  args: { sections: SECTIONS_WITH_HEADINGS },
};

export const RelatedOnly: Story = {
  name: 'Related Only',
  decorators: [wrap],
  args: { related: RELATED_CONTENT },
};

export const SeriesOnly: Story = {
  name: 'Series Only',
  decorators: [wrap],
  args: { series: SERIES, partNumber: 3 },
};

export const AiDisclosureAuto: Story = {
  name: 'AI Disclosure · Auto',
  decorators: [wrap],
  args: { tools: AI_TOOLS, authors: AUTHORS },
};

export const AiDisclosureManual: Story = {
  name: 'AI Disclosure · Manual',
  decorators: [wrap],
  args: {
    aiDisclosure: 'This document was co-authored with Claude Code. All editorial decisions are human-made.',
  },
};

// ─── Combined / edge ────────────────────────────────────────────────────────

export const AllSlots: Story = {
  name: 'All Slots',
  decorators: [wrap],
  args: {
    sections: SECTIONS_WITH_HEADINGS,
    related: RELATED_CONTENT,
    series: SERIES,
    partNumber: 2,
    tools: AI_TOOLS,
    authors: AUTHORS,
  },
};

export const Empty: Story = {
  name: 'Empty (renders null)',
  decorators: [wrap],
  args: {},
};

export const SingleHeading: Story = {
  name: 'Single Heading (no TOC)',
  decorators: [wrap],
  args: { sections: SECTIONS_SINGLE_HEADING, related: RELATED_CONTENT },
};

// ─── Chromatic snapshot ─────────────────────────────────────────────────────

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'start' }}>
      <div style={{ maxWidth: '240px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>All Slots</h4>
        <PageSidebar
          sections={SECTIONS_WITH_HEADINGS}
          related={RELATED_CONTENT}
          series={SERIES}
          partNumber={2}
          tools={AI_TOOLS}
          authors={AUTHORS}
        />
      </div>
      <div style={{ maxWidth: '240px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>TOC Only</h4>
        <PageSidebar sections={SECTIONS_WITH_HEADINGS} />
      </div>
      <div style={{ maxWidth: '240px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Related Only</h4>
        <PageSidebar related={RELATED_CONTENT} />
      </div>
      <div style={{ maxWidth: '240px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Series + AI</h4>
        <PageSidebar series={SERIES} partNumber={3} tools={AI_TOOLS} authors={AUTHORS} />
      </div>
      <div style={{ maxWidth: '240px' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#888' }}>Manual Disclosure</h4>
        <PageSidebar aiDisclosure="Co-authored with Claude Code. All decisions are human-made." />
      </div>
    </div>
  ),
};
