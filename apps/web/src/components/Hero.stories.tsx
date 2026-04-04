/**
 * Hero stories — page hero section with heading, subheading, CTAs,
 * and background style variants (colour fills or image with duotone).
 *
 * Uses Button (needs MemoryRouter) and urlFor (mocked via vite alias).
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Hero from './Hero';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta: Meta<typeof Hero> = {
  title: 'Layout/Hero',
  component: Hero,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

const BASE_HERO = {
  heading: 'Building content-driven digital experiences',
  subheading: 'Strategy, architecture, and engineering for teams that publish at scale.',
  ctas: [
    { url: '/services', label: 'Our Services', openInNewTab: false },
    { url: '/case-studies', label: 'See Our Work', openInNewTab: false },
  ],
};

/** Default — dark background (no explicit style). */
export const Default: Story = {
  args: {
    hero: { ...BASE_HERO },
  },
};

/** Pink background fill. */
export const PinkBackground: Story = {
  name: 'Pink Background',
  args: {
    hero: { ...BASE_HERO, backgroundStyle: 'pink' },
  },
};

/** Green background fill. */
export const GreenBackground: Story = {
  name: 'Green Background',
  args: {
    hero: { ...BASE_HERO, backgroundStyle: 'green' },
  },
};

/** White background fill. */
export const WhiteBackground: Story = {
  name: 'White Background',
  args: {
    hero: { ...BASE_HERO, backgroundStyle: 'white' },
  },
};

/** Background image with hotspot (uses mocked urlFor). */
export const BackgroundImage: Story = {
  name: 'Background Image',
  args: {
    hero: {
      ...BASE_HERO,
      backgroundStyle: 'image',
      backgroundMedia: {
        image: {
          asset: { _id: 'image-hero-bg' },
          hotspot: { x: 0.5, y: 0.3 },
        },
        useDuotone: false,
      },
    },
  },
};

/** Background image with duotone filter. */
export const BackgroundImageDuotone: Story = {
  name: 'Background Image + Duotone',
  args: {
    hero: {
      ...BASE_HERO,
      backgroundStyle: 'image',
      backgroundMedia: {
        image: {
          asset: { _id: 'image-hero-bg' },
          hotspot: { x: 0.5, y: 0.3 },
        },
        useDuotone: true,
      },
    },
  },
};

/** Single CTA only. */
export const SingleCta: Story = {
  name: 'Single CTA',
  args: {
    hero: {
      ...BASE_HERO,
      ctas: [{ url: '/contact', label: 'Get in Touch', openInNewTab: false }],
    },
  },
};

/** Heading only — no subheading or CTAs. */
export const HeadingOnly: Story = {
  name: 'Heading Only',
  args: {
    hero: {
      heading: 'Sugartown Digital',
      backgroundStyle: 'pink',
    },
  },
};
