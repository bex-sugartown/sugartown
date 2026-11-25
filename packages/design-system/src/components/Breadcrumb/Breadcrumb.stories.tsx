/**
 * Breadcrumb stories — SUG-139, ported to the package SUG-224 Phase 0 decision A
 * (2026-07-23) — package copy is canonical.
 *
 * No MemoryRouter needed: the package renders links through the DS Link seam
 * (SUG-230), which falls back to a plain <a> when no LinkProvider is mounted —
 * Storybook doesn't mount one, so hrefs render as plain anchors here.
 */

import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumb from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
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

/**
 * Linked final crumb — the last item still has an href, so it is navigable
 * and must NOT render with `aria-current="page"` or the current-crumb style.
 * The package's `isCurrent = isLast && !item.href` gets this right; the web
 * mirror (scheduled for removal, SUG-224) used plain `isLast` and would
 * mislabel this case. See the code comment in Breadcrumb.tsx.
 */
export const LinkedFinalCrumb: Story = {
  name: 'Linked final crumb (navigable, not "current")',
  args: {
    items: [
      { label: 'Library', href: '/library' },
      { label: 'Tools & Platforms', href: '/tools' },
      { label: 'Vercel', href: '/tools/vercel' },
    ],
  },
};
