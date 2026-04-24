import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import RecentContentSection from '../../../../apps/web/src/components/RecentContentSection';
import { __setClientFetch, __resetClientFetch } from '../mocks/sanity.js';

const MOCK_ARTICLE = {
  _type: 'article',
  title: 'Designing for Ambiguity: When the Brief Is the Problem',
  slug: 'designing-for-ambiguity',
  publishedAt: '2026-04-22T09:00:00Z',
  category: { title: 'Design Practice', slug: 'design-practice' },
};

const MOCK_NODE = {
  _type: 'node',
  title: 'The Validator Said Zero Errors. It Was Watching the Wrong Door.',
  slug: 'validator-zero-errors-wrong-door',
  publishedAt: '2026-04-20T14:30:00Z',
  category: { title: 'Infrastructure', slug: 'infrastructure' },
};

const meta: Meta<typeof RecentContentSection> = {
  title: 'Patterns/RecentContentSection',
  component: RecentContentSection,
  decorators: [
    (Story) => React.createElement(MemoryRouter, null, React.createElement(Story)),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof RecentContentSection>;

// ── Default ──────────────────────────────────────────────────────────────────
// Both Sanity queries resolve with realistic data.

export const Default: Story = {
  beforeEach: () => {
    __setClientFetch((query: string) => {
      if (query.includes('"article"')) return Promise.resolve(MOCK_ARTICLE);
      if (query.includes('"node"')) return Promise.resolve(MOCK_NODE);
      return Promise.resolve(null);
    });
    return () => __resetClientFetch();
  },
  args: {
    section: { heading: 'Recently shipped' },
  },
};

// ── Loading ───────────────────────────────────────────────────────────────────
// Sanity queries are in-flight — skeleton state on article and node columns.
// Release column always renders (build-time stats.json, no network).

export const Loading: Story = {
  beforeEach: () => {
    // Never-resolving promise holds both columns in loading state
    __setClientFetch(() => new Promise(() => {}));
    return () => __resetClientFetch();
  },
  args: {
    section: { heading: 'Recently shipped' },
  },
};

// ── NoSanityData ──────────────────────────────────────────────────────────────
// Both queries return null — article and node columns render empty.
// Confirms the layout holds with just the release column populated.

export const NoSanityData: Story = {
  beforeEach: () => {
    __setClientFetch(() => Promise.resolve(null));
    return () => __resetClientFetch();
  },
  args: {
    section: { heading: 'Recently shipped' },
  },
};

// ── CustomHeading ─────────────────────────────────────────────────────────────
// Verifies the section.heading prop flows through correctly.

export const CustomHeading: Story = {
  beforeEach: () => {
    __setClientFetch((query: string) => {
      if (query.includes('"article"')) return Promise.resolve(MOCK_ARTICLE);
      if (query.includes('"node"')) return Promise.resolve(MOCK_NODE);
      return Promise.resolve(null);
    });
    return () => __resetClientFetch();
  },
  args: {
    section: { heading: "What's new" },
  },
};
