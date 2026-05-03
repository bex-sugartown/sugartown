/**
 * Card listing variant stories — split from Primitives/Card (SUG-96)
 *
 * listing variant = plain document row (title, excerpt, date, project, evolution).
 * No folio/eyebrow strip. Distinct from the Ledger Tradition folio card.
 * Used in archive pages and related-content lists (single-column or wide contexts).
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const THUMB_RAIL = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=96&h=120&fit=crop';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card/Listing',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

/** Document row — title, excerpt, date, project, evolution badge. */
export const ListingRow: Story = {
  name: 'ListingRow',
  args: {
    variant: 'listing',
    title: 'Prompt Architecture for Long-Form Reasoning',
    excerpt:
      'Structured prompt decomposition strategies that improve coherence in multi-step reasoning tasks. Covers chain-of-thought scaffolding and context window discipline.',
    project: { label: 'PROJ-002 · Knowledge Platform', href: '/projects/knowledge-platform' },
    evolution: 'exploring',
    date: '2025-11-14',
  },
};

/** Document row with left-rail thumbnail column. */
export const ListingRowWithThumb: Story = {
  name: 'ListingRowWithThumb',
  args: {
    variant: 'listing',
    title: 'Building a Token-Driven Design System for a Live Product',
    excerpt:
      'How we extracted a scalable three-tier token architecture from a WordPress theme and shipped Storybook alongside the production codebase.',
    project: { label: 'PROJ-001 · Sugartown', href: '/projects/sugartown' },
    date: '2025-03-01',
    thumbnailUrl: THUMB_RAIL,
    thumbnailAlt: 'Token architecture diagram',
  },
};

/** Full-card listing — href on card, no other links. Verifies full-card hit target. */
export const ListingRowFullCard: Story = {
  name: 'ListingRowFullCard',
  args: {
    variant: 'listing',
    title: 'Typography at Scale: Variable Fonts in Production',
    excerpt:
      'An exploration of variable font axes, performance trade-offs, and how font subsetting enabled a 60% reduction in web font payload.',
    date: '2024-01-08',
    href: '/articles/variable-fonts-production',
  },
};

/** Snapshot — all three listing row shapes for Chromatic VRT. */
export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '640px' }}>
      <Card {...ListingRow.args} />
      <Card {...ListingRowWithThumb.args} thumbnailUrl={THUMB_RAIL} thumbnailAlt="Token architecture diagram" />
      <Card {...ListingRowFullCard.args} />
    </div>
  ),
};
