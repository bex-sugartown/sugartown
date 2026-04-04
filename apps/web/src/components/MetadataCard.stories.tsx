/**
 * MetadataCard stories — catalog card layout.
 *
 * App-level component (not DS primitive). Uses MemoryRouter for <Link>.
 * Fixture data mirrors real Sanity document shapes as passed by page templates.
 *
 * Stories cover the four primary content types that use MetadataCard:
 *   1. Node        — full fields: call number, author, conversation, status, type, ai tool, tools, categories, tags, date
 *   2. Case Study  — author, type, tools, categories, tags, date (no call number)
 *   3. Article     — minimal: author, type, ai tool, categories, tags, date
 *   4. Project     — call number, priority, kpis, categories, tags, date
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import MetadataCard from './MetadataCard';

// ─── Decorator: MemoryRouter for <Link> support ─────────────────────────────

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

// ─── Fixture data — mirrors Sanity document shapes ──────────────────────────

const PERSON_BEX = {
  _id: 'person-bex',
  name: 'Rebecca Alice',
  shortName: 'Bex',
  slug: 'bex',
};

const TOOLS = {
  claudeCode: { _id: 'tool-claude-code', name: 'Claude Code', slug: 'claude-code' },
  sanity:     { _id: 'tool-sanity',      name: 'Sanity',      slug: 'sanity' },
  figma:      { _id: 'tool-figma',       name: 'Figma',       slug: 'figma' },
  storybook:  { _id: 'tool-storybook',   name: 'Storybook',   slug: 'storybook' },
  aem:        { _id: 'tool-aem',         name: 'AEM',         slug: 'aem' },
  contentful: { _id: 'tool-contentful',  name: 'Contentful',  slug: 'contentful' },
  oracleAtg:  { _id: 'tool-oracle-atg',  name: 'Oracle ATG',  slug: 'oracle-atg' },
};

const CATEGORIES = {
  aiCollab:    { _id: 'cat-ai-collab',    name: 'AI Collaboration',          slug: 'ai-collaboration',    colorHex: '#FF247D' },
  waysWorking: { _id: 'cat-ways-working', name: 'Ways of Working',           slug: 'ways-of-working',     colorHex: '#2BD4AA' },
  contentArch: { _id: 'cat-content-arch', name: 'Content Architecture',      slug: 'content-architecture', colorHex: '#FF247D' },
  designSys:   { _id: 'cat-design-sys',   name: 'Design Systems',            slug: 'design-systems',      colorHex: '#2BD4AA' },
  platformStr: { _id: 'cat-platform-str', name: 'Product & Platform Strategy', slug: 'product-platform-strategy' },
};

const TAGS = {
  promptEng:    { _id: 'tag-prompt-eng',    name: 'prompt engineering',     slug: 'prompt-engineering' },
  aiWorkflows:  { _id: 'tag-ai-workflows',  name: 'ai workflows',          slug: 'ai-workflows' },
  humanInLoop:  { _id: 'tag-human-loop',    name: 'human-in-the-loop',     slug: 'human-in-the-loop' },
  llmWorkflows: { _id: 'tag-llm-workflows', name: 'LLM workflows',        slug: 'llm-workflows' },
  waysWorking:  { _id: 'tag-ways-working',  name: 'ways of working',       slug: 'ways-of-working' },
  claudeCode:   { _id: 'tag-claude-code',   name: 'claude-code',           slug: 'claude-code' },
  processInsight: { _id: 'tag-process',     name: 'process insight',       slug: 'process-insight' },
  postMortem:   { _id: 'tag-post-mortem',   name: 'Post Mortem',           slug: 'post-mortem' },
  contextEng:   { _id: 'tag-context-eng',   name: 'Context Engineering',   slug: 'context-engineering' },
  composable:   { _id: 'tag-composable',    name: 'composable',            slug: 'composable' },
  dam:          { _id: 'tag-dam',           name: 'dam',                   slug: 'dam' },
  designSystem: { _id: 'tag-design-sys',    name: 'design system',         slug: 'design-system' },
  digitalTrans: { _id: 'tag-digital-trans', name: 'digital transformation', slug: 'digital-transformation' },
  headlessCms:  { _id: 'tag-headless-cms',  name: 'headless cms',          slug: 'headless-cms' },
  omnichannel:  { _id: 'tag-omnichannel',   name: 'omnichannel',           slug: 'omnichannel' },
  pimPxm:       { _id: 'tag-pim-pxm',      name: 'PIM / PXM',            slug: 'pim-pxm' },
};

const PROJECTS = {
  sugartown: {
    _id: 'proj-001',
    name: 'Sugartown Digital',
    slug: 'sugartown-digital',
    projectId: 'PROJ-001',
    colorHex: '#FF247D',
  },
  knowledgePlatform: {
    _id: 'proj-002',
    name: 'Knowledge Platform',
    slug: 'knowledge-platform',
    projectId: 'PROJ-002',
    colorHex: '#2BD4AA',
  },
};

// ─── Meta ───────────────────────────────────────────────────────────────────

const meta: Meta<typeof MetadataCard> = {
  title: 'Patterns/MetadataCard',
  component: MetadataCard,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MetadataCard>;

// ═══════════════════════════════════════════════════════════════════
// NODE — full catalog card with call number
// ═══════════════════════════════════════════════════════════════════

/**
 * Node (full) — all fields populated.
 * Shows: PROJ-001 call number, Author/Status paired, Conversation/Type,
 * AI Tool, Tools chips, Category chips, Tag chips, Published date right-aligned.
 */
export const NodeFull: Story = {
  name: 'Node · Full',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    authors: [PERSON_BEX],
    contentType: 'Node',
    publishedAt: '2026-02-28',
    status: 'evergreen',
    aiTool: 'claude',
    conversationType: 'reflection',
    tools: [TOOLS.claudeCode, TOOLS.sanity],
    categories: [CATEGORIES.aiCollab, CATEGORIES.waysWorking],
    tags: [
      TAGS.promptEng, TAGS.aiWorkflows, TAGS.humanInLoop,
      TAGS.llmWorkflows, TAGS.waysWorking, TAGS.claudeCode,
      TAGS.processInsight, TAGS.postMortem, TAGS.contextEng,
    ],
    projects: [PROJECTS.sugartown],
  },
};

// ═══════════════════════════════════════════════════════════════════
// CASE STUDY — no call number, client/role fields
// ═══════════════════════════════════════════════════════════════════

/**
 * Case Study — Author/Type paired, tools, categories, tags, date.
 * No call number (no project with projectId in the fixture).
 */
export const CaseStudy: Story = {
  name: 'Case Study',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    authors: [PERSON_BEX],
    contentType: 'Case Study',
    publishedAt: '2023-08-10',
    tools: [TOOLS.aem, TOOLS.contentful, TOOLS.oracleAtg],
    categories: [CATEGORIES.contentArch, CATEGORIES.designSys, CATEGORIES.platformStr],
    tags: [
      TAGS.composable, TAGS.dam, TAGS.designSystem,
      TAGS.digitalTrans, TAGS.headlessCms, TAGS.omnichannel, TAGS.pimPxm,
    ],
  },
};

/**
 * Case Study with client and role fields.
 */
export const CaseStudyWithClient: Story = {
  name: 'Case Study · Client + Role',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ...CaseStudy.args,
    client: 'Sugartown (internal)',
    role: 'Lead Designer + Engineer',
  },
};

// ═══════════════════════════════════════════════════════════════════
// ARTICLE — minimal fields
// ═══════════════════════════════════════════════════════════════════

/**
 * Article (minimal) — author, type, ai tool, one category, date.
 * Verifies the card doesn't look sparse with few fields.
 */
export const ArticleMinimal: Story = {
  name: 'Article · Minimal',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    authors: [PERSON_BEX],
    contentType: 'Article',
    publishedAt: '2024-01-08',
    aiTool: 'claude',
    categories: [CATEGORIES.designSys],
    tags: [TAGS.designSystem],
  },
};

// ═══════════════════════════════════════════════════════════════════
// PROJECT — call number from projectId prop, KPIs, priority
// ═══════════════════════════════════════════════════════════════════

/**
 * Project detail — projectId as call number, priority, KPIs, categories, tags.
 */
export const ProjectDetail: Story = {
  name: 'Project · Detail',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    projectId: 'PROJ-002',
    status: 'in-progress',
    priority: 2,
    kpis: [
      { metric: 'Node Coverage',     current: '47',  target: '100' },
      { metric: 'Taxonomy Accuracy',  current: '82%', target: '95%' },
      { metric: 'Archive Completeness', current: '3/5' },
    ],
    categories: [CATEGORIES.aiCollab],
    tags: [TAGS.aiWorkflows, TAGS.contextEng],
    publishedAt: '2025-01-01',
  },
};
