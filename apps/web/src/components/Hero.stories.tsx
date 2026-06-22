/**
 * Hero stories — heroSection with full schema prop coverage.
 *
 * Uses HeroSection from PageSections (the real page-section renderer).
 * Two width variants: full-width (edge-to-edge) and content-width (max-width + radius).
 * When no backgroundImage is supplied, the hero renders on a white background.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from './PageSections';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof HeroSection> = {
  title: 'Regions/Hero',
  component: HeroSection,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    section: {
      control: { type: 'object' },
      description:
        'heroSection object — eyebrow, heading, subheading, backgroundImage (image + alt + hotspot), ' +
        'imageTreatment { type: none | duotone | duotone-subtle | duotone-extreme | dark-scrim | greyscale | color, panel: boolean }, ' +
        'imageWidth: full-width | content-width, ' +
        'showStatRail: boolean, showMetaFinePrint: boolean, ctas[] { label, url, style, openInNewTab }.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

// Full heroSection prop set — matches Sanity heroSection schema and Studio settings panel
const BASE_SECTION = {
  _type: 'heroSection' as const,
  eyebrow: 'Platform',
  heading: 'Built as infrastructure.',
  subheading: 'A governed monorepo: versioned releases, enforced boundaries, a portable design system.',
  backgroundImage: {
    asset: { _id: 'image-hero-platform-mock' },
    hotspot: { x: 0.5, y: 0.4 },
    alt: 'Vercel Production and Preview deployments dashboard',
  },
  imageTreatment: { type: 'duotone-extreme', panel: true },
  showStatRail: false,
  showMetaFinePrint: true,
  _meta: { date: '2024-03-01' },
  ctas: [
    { _key: 'cta-1', label: 'View the platform', url: '/platform', style: 'secondary', openInNewTab: false },
  ],
};

/** Full-width hero — image stretches edge to edge. Duotone extreme treatment with frosted panel. */
export const Default: Story = {
  name: 'Default (full width)',
  args: {
    section: { ...BASE_SECTION, imageWidth: 'full-width' },
  },
};

/** Content-width hero — constrained to reading column width with 35px radius. */
export const ContentWidth: Story = {
  name: 'Content width',
  args: {
    section: { ...BASE_SECTION, imageWidth: 'content-width' },
  },
};

// ═══════════════════════════════════════════════════════════════════
// SNAPSHOT — Chromatic VRT (both width variants in one capture)
// ═══════════════════════════════════════════════════════════════════

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'fullscreen',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem', background: 'var(--st-color-bg-surface)' }}>
      <HeroSection section={{ ...BASE_SECTION, imageWidth: 'full-width' }} />
      <HeroSection section={{ ...BASE_SECTION, imageWidth: 'content-width' }} />
    </div>
  ),
};
