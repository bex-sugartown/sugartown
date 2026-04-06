/**
 * ContentCard stories — shared listing card for archive grids.
 *
 * Maps Sanity content items to the DS Card primitive.
 * Uses MemoryRouter (Card renders <Link> for SPA navigation).
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import ContentCard from './ContentCard';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof ContentCard> = {
  title: 'Patterns/ContentCard',
  component: ContentCard,
  tags: ['autodocs'],
  decorators: [withRouter],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['default', 'listing'] },
    showExcerpt: { control: 'boolean' },
    showHeroImage: { control: 'boolean' },
    categoryPosition: { control: { type: 'select' }, options: ['before', 'after'] },
    item: { control: { type: 'object' }, description: 'Sanity content document (article, node, caseStudy)' },
    imageOverride: { table: { disable: true } },
    draftIds: { table: { disable: true } },
    docType: { table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ContentCard>;

// ─── Fixture data ────────────────────────────────────────────────────────────

const NODE_ITEM = {
  _id: 'node-001',
  _type: 'node',
  title: 'Prompt Engineering for Structured Output',
  slug: 'prompt-engineering-structured-output',
  excerpt: 'A reflection on using Claude to generate structured content from freeform instructions.',
  status: 'evergreen',
  aiTool: 'claude',
  publishedAt: '2026-03-15',
  projects: [
    { _id: 'proj-001', name: 'Sugartown Digital', slug: 'sugartown-digital', projectId: 'PROJ-001', colorHex: '#FF247D' },
  ],
  categories: [
    { _id: 'cat-001', name: 'AI Collaboration', slug: 'ai-collaboration', colorHex: '#FF247D' },
  ],
  tags: [
    { _id: 'tag-001', name: 'prompt engineering', slug: 'prompt-engineering' },
    { _id: 'tag-002', name: 'LLM workflows', slug: 'llm-workflows' },
    { _id: 'tag-003', name: 'context engineering', slug: 'context-engineering' },
  ],
  tools: [
    { _id: 'tool-001', name: 'Claude Code', slug: 'claude-code' },
    { _id: 'tool-002', name: 'Sanity', slug: 'sanity' },
  ],
};

const ARTICLE_ITEM = {
  _id: 'article-001',
  _type: 'article',
  title: 'Why Headless CMS Architecture Wins for Content Teams',
  slug: 'headless-cms-architecture',
  excerpt: 'A deep dive into the benefits of decoupled content infrastructure.',
  publishedAt: '2026-02-20',
  categories: [
    { _id: 'cat-002', name: 'Content Architecture', slug: 'content-architecture' },
  ],
  tags: [
    { _id: 'tag-004', name: 'headless cms', slug: 'headless-cms' },
    { _id: 'tag-005', name: 'composable', slug: 'composable' },
  ],
};

const CASE_STUDY_ITEM = {
  _id: 'cs-001',
  _type: 'caseStudy',
  title: 'Enterprise Content Platform Migration',
  slug: 'enterprise-content-migration',
  excerpt: 'Migrating a global retailer from monolithic CMS to headless architecture.',
  publishedAt: '2023-08-10',
  heroImageUrl: 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=800&h=450&fit=crop',
  categories: [
    { _id: 'cat-003', name: 'Design Systems', slug: 'design-systems', colorHex: '#2BD4AA' },
  ],
  tools: [
    { _id: 'tool-003', name: 'AEM', slug: 'aem' },
    { _id: 'tool-004', name: 'Contentful', slug: 'contentful' },
  ],
  tags: [
    { _id: 'tag-006', name: 'digital transformation', slug: 'digital-transformation' },
  ],
};

// ─── Stories ─────────────────────────────────────────────────────────────────

/** Node — grid card with all fields, evolution badge, AI tool. */
export const Node: Story = {
  decorators: [(Story) => <div style={{ maxWidth: '380px' }}><Story /></div>],
  args: {
    item: NODE_ITEM,
    docType: 'node',
  },
};

/** Node — listing variant (horizontal layout). */
export const NodeListing: Story = {
  name: 'Node · Listing',
  decorators: [(Story) => <div style={{ maxWidth: '720px' }}><Story /></div>],
  args: {
    item: NODE_ITEM,
    docType: 'node',
    variant: 'listing',
  },
};

/** Article — minimal fields. */
export const Article: Story = {
  decorators: [(Story) => <div style={{ maxWidth: '380px' }}><Story /></div>],
  args: {
    item: ARTICLE_ITEM,
  },
};

/** Case Study — with hero image. */
export const CaseStudy: Story = {
  name: 'Case Study',
  decorators: [(Story) => <div style={{ maxWidth: '380px' }}><Story /></div>],
  args: {
    item: CASE_STUDY_ITEM,
  },
};

/** Without excerpt. */
export const NoExcerpt: Story = {
  name: 'No Excerpt',
  decorators: [(Story) => <div style={{ maxWidth: '380px' }}><Story /></div>],
  args: {
    item: ARTICLE_ITEM,
    showExcerpt: false,
  },
};
