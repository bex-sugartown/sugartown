/**
 * DraftBadge stories — inline badge for draft documents in preview mode.
 *
 * Uses mocked contentState (via vite alias) — window.__STORYBOOK_PREVIEW_MODE__
 * controls whether isPreviewMode() returns true.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DraftBadge from './DraftBadge';

// Enable preview mode for all stories in this file
const withPreviewMode = (Story: React.ComponentType) => {
  (window as any).__STORYBOOK_PREVIEW_MODE__ = true;
  return <Story />;
};

const meta: Meta<typeof DraftBadge> = {
  title: 'Web Components/DraftBadge',
  component: DraftBadge,
  tags: ['autodocs'],
  decorators: [withPreviewMode],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DraftBadge>;

/** Draft document — badge visible (docId starts with "drafts."). */
export const DraftDocument: Story = {
  name: 'Draft Document',
  args: {
    docId: 'drafts.abc123',
    hasDraft: false,
  },
};

/** Published with pending draft changes. */
export const HasDraft: Story = {
  name: 'Published + Draft Changes',
  args: {
    docId: 'abc123',
    hasDraft: true,
  },
};

/** Published, no drafts — badge hidden. */
export const NoDraft: Story = {
  name: 'Published (no badge)',
  args: {
    docId: 'abc123',
    hasDraft: false,
  },
};
