/**
 * Preheader stories — site-wide announcement banner.
 *
 * Uses the Link atom (needs MemoryRouter).
 * Supports date-based visibility and background colour variants.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Preheader from './Preheader';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof Preheader> = {
  title: 'Web Components/Preheader',
  component: Preheader,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Preheader>;

/** Pink background (default) with message and link. */
export const Pink: Story = {
  args: {
    preheader: {
      message: 'New: Knowledge Graph v2 is live',
      url: '/knowledge-graph',
      label: 'Explore',
      backgroundColor: 'pink',
      publishAt: '2025-01-01T00:00:00Z',
      unpublishAt: '2030-12-31T23:59:59Z',
    },
  },
};

/** Green background variant. */
export const Green: Story = {
  args: {
    preheader: {
      message: 'Case study published: Enterprise CMS Migration',
      url: '/case-studies',
      label: 'Read more',
      backgroundColor: 'green',
      publishAt: '2025-01-01T00:00:00Z',
      unpublishAt: '2030-12-31T23:59:59Z',
    },
  },
};

/** Message only — no link. */
export const MessageOnly: Story = {
  name: 'Message Only (no link)',
  args: {
    preheader: {
      message: 'Site under active development — content is being migrated.',
      backgroundColor: 'pink',
      publishAt: '2025-01-01T00:00:00Z',
      unpublishAt: '2030-12-31T23:59:59Z',
    },
  },
};

/** Expired — should render nothing (unpublishAt in the past). */
export const Expired: Story = {
  name: 'Expired (hidden)',
  args: {
    preheader: {
      message: 'This should not be visible.',
      backgroundColor: 'pink',
      unpublishAt: '2020-01-01T00:00:00Z',
    },
  },
};
