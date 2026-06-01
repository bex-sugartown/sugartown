/**
 * Breadcrumb stories — SUG-139
 *
 * Uses MemoryRouter because the web adapter renders react-router-dom <Link>.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/** Single back-link — no current crumb. Used on archive pages that are the terminal destination. */
export const SingleLevel: Story = {
  args: {
    items: [{ label: 'Library', href: '/library' }],
  },
};

/** Two-level — back-link + current. Standard archive breadcrumb. */
export const TwoLevel: Story = {
  args: {
    items: [
      { label: 'Library', href: '/library' },
      { label: 'Knowledge Graph' },
    ],
  },
};

/** Three-level — Library → taxonomy archive → detail. Used on tool/category/project detail pages. */
export const ThreeLevel: Story = {
  args: {
    items: [
      { label: 'Library', href: '/library' },
      { label: 'Tools & Platforms', href: '/tools' },
      { label: 'Vercel' },
    ],
  },
};

/** Non-Library root — used on PersonProfilePage (no Library ancestor). */
export const NonLibraryRoot: Story = {
  args: {
    items: [
      { label: 'People', href: '/people' },
      { label: 'Becky Head' },
    ],
  },
};

/** Long labels — verifies no wrapping occurs. */
export const LongLabels: Story = {
  args: {
    items: [
      { label: 'Library', href: '/library' },
      { label: 'Product & Platform Strategy', href: '/categories/product-platform-strategy' },
      { label: 'Platform selection risk is real — here is what reduces it' },
    ],
  },
};
