/**
 * Hero stories — heroSection with flat individual controls.
 *
 * Uses HeroSection from PageSections (the real page-section renderer).
 * Args are flat fields (text, boolean, select); render() composes them into the section object.
 * When no backgroundImage asset is present, the hero renders on a white background.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from './PageSections';

// Flat arg type — mirrors Studio settings panel fields
type HeroArgs = {
  eyebrow: string;
  heading: string;
  subheading: string;
  altText: string;
  overlayType: string;
  panel: boolean;
  imageWidth: 'full-width' | 'content-width';
  showStatRail: boolean;
  showMetaFinePrint: boolean;
  ctaLabel: string;
  ctaUrl: string;
};

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

// Composes flat story args into the heroSection object HeroSection expects
function buildSection(args: HeroArgs, extra?: object) {
  return {
    _type: 'heroSection' as const,
    eyebrow: args.eyebrow,
    heading: args.heading,
    subheading: args.subheading,
    backgroundImage: {
      asset: { _id: 'image-hero-platform-mock' },
      hotspot: { x: 0.5, y: 0.4 },
      alt: args.altText,
    },
    imageTreatment: { type: args.overlayType, panel: args.panel },
    imageWidth: args.imageWidth,
    showStatRail: args.showStatRail,
    showMetaFinePrint: args.showMetaFinePrint,
    _meta: { date: '2024-03-01' },
    ctas: args.ctaLabel
      ? [{ _key: 'cta-1', label: args.ctaLabel, url: args.ctaUrl, style: 'secondary', openInNewTab: false }]
      : [],
    ...extra,
  };
}

const meta: Meta<HeroArgs> = {
  title: 'Regions/Hero',
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    eyebrow: {
      control: 'text',
      description: 'Short label above the heading. Renders in lime uppercase.',
    },
    heading: {
      control: 'text',
      description: 'Main hero heading.',
    },
    subheading: {
      control: 'text',
      description: 'Optional supporting text below the heading.',
    },
    altText: {
      control: 'text',
      description: 'Alt text for the background image.',
    },
    overlayType: {
      control: { type: 'select' },
      options: ['none', 'duotone', 'duotone-subtle', 'duotone-extreme', 'dark-scrim', 'greyscale', 'color'],
      description: 'Image treatment overlay type.',
    },
    panel: {
      control: 'boolean',
      description: 'Adds a frosted glass panel behind the text content. Suppresses text glow.',
    },
    imageWidth: {
      control: { type: 'radio' },
      options: ['full-width', 'content-width'],
      description: 'Full-width stretches edge to edge. Content-width constrains with 35px radius.',
    },
    showStatRail: {
      control: 'boolean',
      description: 'Show build-time trust metrics rail (version, epics, commits, vulnerabilities).',
    },
    showMetaFinePrint: {
      control: 'boolean',
      description: 'Show published date as fine print below the CTAs.',
    },
    ctaLabel: {
      control: 'text',
      description: 'CTA button label. Leave empty to hide the button.',
    },
    ctaUrl: {
      control: 'text',
      description: 'CTA button URL.',
    },
  },
  args: {
    eyebrow: 'Platform',
    heading: 'Built as infrastructure.',
    subheading: 'A governed monorepo: versioned releases, enforced boundaries, a portable design system.',
    altText: 'Vercel Production and Preview deployments dashboard',
    overlayType: 'duotone-extreme',
    panel: true,
    imageWidth: 'full-width',
    showStatRail: false,
    showMetaFinePrint: true,
    ctaLabel: 'View the platform',
    ctaUrl: '/platform',
  },
};

export default meta;
type Story = StoryObj<HeroArgs>;

/** Full-width hero — image stretches edge to edge. */
export const Default: Story = {
  name: 'Default (full width)',
  args: { imageWidth: 'full-width' },
  render: (args) => <HeroSection section={buildSection(args)} />,
};

/** Content-width hero — constrained to reading column width with 35px radius. */
export const ContentWidth: Story = {
  name: 'Content width',
  args: { imageWidth: 'content-width' },
  render: (args) => <HeroSection section={buildSection(args)} />,
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
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem', background: 'var(--st-color-bg-surface)' }}>
      <HeroSection section={buildSection(args, { imageWidth: 'full-width' })} />
      <HeroSection section={buildSection(args, { imageWidth: 'content-width' })} />
    </div>
  ),
};
