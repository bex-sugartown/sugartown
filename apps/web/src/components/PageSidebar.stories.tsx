/**
 * PageSidebar stories — right-rail at 1024px+, disclosure below content otherwise (SUG-69).
 *
 * Uses MemoryRouter for <Link> support. Boolean controls toggle each slot on/off.
 * Note: sticky positioning and the two-column grid only activate when the sidebar is
 * rendered inside `.detailPage[data-has-margin]`. In Storybook isolation we show the
 * sidebar contents at their natural width (~240px).
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSidebar from './PageSidebar';

// ─── Fixture data ───────────────────────────────────────────────────────────

const SECTIONS = [
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

const RELATED = [
  { _id: 'node-001',    _type: 'node',      title: 'The Great Disconnection',    slug: 'the-great-disconnection' },
  { _id: 'article-001', _type: 'article',   title: 'Building a Knowledge Graph', slug: 'building-a-knowledge-graph' },
  { _id: 'cs-001',      _type: 'caseStudy', title: 'Sugartown CMS Migration',    slug: 'sugartown-cms-migration' },
];

const SERIES   = { title: 'AI Collaboration Patterns', slug: 'ai-collaboration-patterns' };
const AI_TOOLS = [
  { _id: 'tool-claude-code', name: 'Claude Code', slug: 'claude-code' },
  { _id: 'tool-sanity',      name: 'Sanity',      slug: 'sanity' },
];
const AUTHORS = [{ name: 'Rebecca Alice' }];

// ─── Flat arg type ───────────────────────────────────────────────────────────

type SidebarArgs = {
  showSeries:      boolean;
  showToc:         boolean;
  showRelated:     boolean;
  showAiDisclosure: boolean;
};

function buildProps(args: SidebarArgs) {
  return {
    sections:    args.showToc         ? SECTIONS  : undefined,
    related:     args.showRelated     ? RELATED   : undefined,
    series:      args.showSeries      ? SERIES    : undefined,
    partNumber:  args.showSeries      ? 2         : undefined,
    tools:       args.showAiDisclosure ? AI_TOOLS : undefined,
    authors:     args.showAiDisclosure ? AUTHORS  : undefined,
  };
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta<SidebarArgs> = {
  title: 'Patterns/PageSidebar',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: '240px' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: { layout: 'padded' },
  argTypes: {
    showSeries:       { control: 'boolean', description: 'Show the series membership block.' },
    showToc:          { control: 'boolean', description: 'Show the on-this-page table of contents.' },
    showRelated:      { control: 'boolean', description: 'Show the related content block.' },
    showAiDisclosure: { control: 'boolean', description: 'Show the AI disclosure block (auto-generated from tools + authors).' },
  },
  args: {
    showSeries:       true,
    showToc:          true,
    showRelated:      true,
    showAiDisclosure: true,
  },
};

export default meta;
type Story = StoryObj<SidebarArgs>;

/** All four slots active — toggle each with the checkboxes above. */
export const Default: Story = {
  render: (args) => <PageSidebar {...buildProps(args)} />,
};

// ─── Chromatic snapshot ─────────────────────────────────────────────────────

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => (
    <PageSidebar
      sections={SECTIONS}
      related={RELATED}
      series={SERIES}
      partNumber={2}
      tools={AI_TOOLS}
      authors={AUTHORS}
    />
  ),
};
