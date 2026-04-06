import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Media } from './Media';

/**
 * ## Media
 *
 * Responsive figure with optional duotone or colour overlay.
 *
 * Duotone presets use canonical brand colours:
 * - **Pink:** `#ff247d` (Sugartown Pink)
 * - **Seafoam:** `#2bd4aa`
 *
 * The legacy `#ED008E` is deprecated — all gradients use the unified palette.
 *
 * Canonical CSS: `artifacts/style 260118.css` §st-media--duotone
 */
const meta: Meta<typeof Media> = {
  title: 'Primitives/Media',
  component: Media,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    src: { control: 'text', description: 'Image URL (required)' },
    alt: { control: 'text', description: 'Alt text for accessibility (required)' },
    caption: { control: 'text', description: 'Optional figcaption below the image' },
    aspectRatio: { control: 'text', description: 'CSS aspect-ratio value, e.g. "16/9", "1/1"' },
    hoverScale: { control: 'boolean', description: 'Zoom on hover (default: true for duotone)' },
    overlay: { control: { type: 'object' }, description: 'Overlay config — type, preset, colour, opacity' },
    className: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '720px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Media>;

const SAMPLE_IMAGE = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=1200&h=800&fit=crop';
const SAMPLE_PORTRAIT = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=800&h=1200&fit=crop&crop=left';

// ── Default (no overlay) ─────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Sample landscape photograph',
    caption: 'Standard media component — no overlay applied.',
  },
};

// ── Duotone Standard ─────────────────────────────────────────────────────────

export const DuotoneStandard: Story = {
  name: 'Duotone / Standard',
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Duotone standard preset',
    caption: 'Standard duotone — Pink ~55% alpha, Seafoam ~45% alpha (content images).',
    overlay: {
      type: 'duotone',
      duotonePreset: 'standard',
    },
  },
};

// ── Duotone Featured ─────────────────────────────────────────────────────────

export const DuotoneFeatured: Story = {
  name: 'Duotone / Featured',
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Duotone featured preset',
    caption: 'Featured duotone — Pink ~70% alpha, Seafoam ~50% alpha (hero images).',
    overlay: {
      type: 'duotone',
      duotonePreset: 'featured',
    },
    aspectRatio: '21/9',
  },
};

// ── Duotone Subtle ───────────────────────────────────────────────────────────

export const DuotoneSubtle: Story = {
  name: 'Duotone / Subtle',
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Duotone subtle preset',
    caption: 'Subtle duotone — Pink ~30% alpha, Seafoam ~25% alpha (background wash).',
    overlay: {
      type: 'duotone',
      duotonePreset: 'subtle',
    },
  },
};

// ── Color Overlay: Pink 50% ──────────────────────────────────────────────────

export const ColorOverlayPink: Story = {
  name: 'Color Overlay / Pink 50%',
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Pink colour overlay at 50%',
    caption: 'Solid pink (#ff247d) at 50% opacity.',
    overlay: {
      type: 'color',
      color: '#ff247d',
      opacity: 50,
    },
  },
};

// ── Color Overlay: Black 30% ─────────────────────────────────────────────────

export const ColorOverlayBlack: Story = {
  name: 'Color Overlay / Black 30%',
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Black colour overlay at 30%',
    caption: 'Black overlay at 30% — improves text readability over images.',
    overlay: {
      type: 'color',
      color: '#000000',
      opacity: 30,
    },
  },
};

// ── With Aspect Ratio ────────────────────────────────────────────────────────

export const WithAspectRatio: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Media
        src={SAMPLE_IMAGE}
        alt="21/9 featured ratio"
        aspectRatio="21/9"
        overlay={{ type: 'duotone', duotonePreset: 'featured' }}
        caption="21/9 — Featured hero image"
      />
      <Media
        src={SAMPLE_IMAGE}
        alt="16/9 standard ratio"
        aspectRatio="16/9"
        caption="16/9 — Standard widescreen"
      />
      <div style={{ maxWidth: '300px' }}>
        <Media
          src={SAMPLE_IMAGE}
          alt="1/1 square ratio"
          aspectRatio="1/1"
          caption="1/1 — Square"
        />
      </div>
    </div>
  ),
};

// ── Hover Scale ──────────────────────────────────────────────────────────────

export const HoverScale: Story = {
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Hover to zoom',
    caption: 'Hover over the image to see the 1.05x scale animation (default for duotone).',
    overlay: {
      type: 'duotone',
      duotonePreset: 'standard',
    },
    hoverScale: true,
  },
};

// ── Stress Test: Tall Image ──────────────────────────────────────────────────

export const StressTestTallImage: Story = {
  name: 'Stress Test / Tall Image',
  args: {
    src: SAMPLE_PORTRAIT,
    alt: 'Tall portrait image',
    caption: 'A tall portrait image to test aspect ratio constraints.',
    aspectRatio: '3/4',
    overlay: {
      type: 'duotone',
      duotonePreset: 'subtle',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

// ── Stress Test: No Image ────────────────────────────────────────────────────

export const StressTestNoImage: Story = {
  name: 'Stress Test / No Image',
  args: {
    src: '',
    alt: 'Missing image',
    caption: 'This should render nothing (null) when src is empty.',
  },
};

// ── All Presets (overview) ───────────────────────────────────────────────────

export const AllPresets: Story = {
  name: 'All Duotone Presets',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
      <Media
        src="https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=600&h=400&fit=crop&crop=top"
        alt="Standard preset"
        overlay={{ type: 'duotone', duotonePreset: 'standard' }}
        caption="Standard (content)"
      />
      <Media
        src="https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=600&h=400&fit=crop&crop=center"
        alt="Featured preset"
        overlay={{ type: 'duotone', duotonePreset: 'featured' }}
        caption="Featured (hero)"
      />
      <Media
        src="https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=600&h=400&fit=crop&crop=bottom"
        alt="Subtle preset"
        overlay={{ type: 'duotone', duotonePreset: 'subtle' }}
        caption="Subtle (bg wash)"
      />
    </div>
  ),
};
