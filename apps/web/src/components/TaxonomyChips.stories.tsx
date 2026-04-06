/**
 * TaxonomyChips stories — taxonomy classification chip list.
 *
 * Renders projects, categories, tags, and tools as linked chips.
 * Uses MemoryRouter (Chip renders <Link> for taxonomy detail pages).
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import TaxonomyChips from './TaxonomyChips';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof TaxonomyChips> = {
  title: 'Patterns/TaxonomyChips',
  component: TaxonomyChips,
  tags: ['autodocs'],
  decorators: [withRouter],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md'], description: 'Chip size variant' },
    projects: { control: { type: 'object' }, description: 'Project refs [{_id, name, slug, colorHex?}]' },
    categories: { control: { type: 'object' }, description: 'Category refs [{_id, name, slug, colorHex?}]' },
    tags: { control: { type: 'object' }, description: 'Tag refs [{_id, name, slug}]' },
    tools: { control: { type: 'object' }, description: 'Tool refs [{_id, name, slug}]' },
    className: { table: { disable: true } },
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof TaxonomyChips>;

/** Full taxonomy — all four chip types. */
export const Full: Story = {
  args: {
    projects: [
      { _id: 'proj-001', name: 'Sugartown Digital', slug: 'sugartown-digital', colorHex: '#FF247D' },
    ],
    categories: [
      { _id: 'cat-001', name: 'AI Collaboration', slug: 'ai-collaboration', colorHex: '#FF247D' },
      { _id: 'cat-002', name: 'Content Architecture', slug: 'content-architecture', colorHex: '#2BD4AA' },
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
  },
};

/** Tags only — no projects, categories, or tools. */
export const TagsOnly: Story = {
  name: 'Tags Only',
  args: {
    tags: [
      { _id: 'tag-001', name: 'prompt engineering', slug: 'prompt-engineering' },
      { _id: 'tag-002', name: 'LLM workflows', slug: 'llm-workflows' },
      { _id: 'tag-003', name: 'composable', slug: 'composable' },
      { _id: 'tag-004', name: 'headless cms', slug: 'headless-cms' },
    ],
  },
};

/** Small size variant. */
export const SmallSize: Story = {
  name: 'Small Size',
  args: {
    ...Full.args,
    size: 'sm',
  },
};

/** Empty — should render nothing. */
export const Empty: Story = {
  args: {},
};
