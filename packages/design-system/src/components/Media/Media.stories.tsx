import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Media } from './Media';

const SAMPLE_IMAGE = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=1200&h=800&fit=crop';

// ─── Overlay builder (story layer) ────────────────────────────────────────────

type OverlayPreset = 'none' | 'duotone' | 'duotone-subtle' | 'duotone-extreme' | 'dark-scrim' | 'greyscale' | 'color';

function buildOverlay(type: OverlayPreset, color = '#ff247d', opacity = 40) {
  if (type === 'none' || !type) return undefined;
  if (type === 'duotone')         return { type: 'duotone' as const, duotonePreset: 'standard' as const };
  if (type === 'duotone-subtle')  return { type: 'duotone' as const, duotonePreset: 'subtle' as const };
  if (type === 'duotone-extreme') return { type: 'duotone-extreme' as const };
  if (type === 'dark-scrim')      return { type: 'dark-scrim' as const };
  if (type === 'greyscale')       return { type: 'greyscale' as const };
  if (type === 'color')           return { type: 'color' as const, color, opacity };
  return undefined;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Media> = {
  title: 'Components/Media',
  component: Media,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Sample landscape photograph',
    caption: 'Standard media component — no overlay applied.',
  },
  argTypes: {
    src:         { control: 'text', description: 'Image URL (required)' },
    alt:         { control: 'text', description: 'Alt text for accessibility (required)' },
    caption:     { control: 'text', description: 'Optional figcaption below the image' },
    aspectRatio: {
      control: { type: 'select' },
      options: ['', '1/1', '4/3', '16/9', '21/9'],
      description: 'CSS aspect-ratio value. Empty = image intrinsic ratio.',
    },
    hoverScale:  { control: 'boolean', description: 'Zoom on hover (default: true when overlay is set)' },
    bleed:       { control: 'boolean', description: 'Full-bleed — zero border-radius, no margin. Use for full-width hero images.' },
    hotspot:     { table: { disable: true } },
    // Story-layer flat controls for overlay (not a real prop — mapped to overlay object in render)
    overlayType: {
      control: { type: 'select' },
      options: ['none', 'duotone', 'duotone-subtle', 'duotone-extreme', 'dark-scrim', 'greyscale', 'color'],
      description: 'Overlay treatment. Passed as `overlay.type` in the real prop.',
      table: { category: 'Overlay' },
    },
    overlayColor: {
      control: 'color',
      description: 'Color for `color` overlay type.',
      table: { category: 'Overlay' },
    },
    overlayOpacity: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
      description: 'Opacity 0–100 for `color` overlay.',
      table: { category: 'Overlay' },
    },
    // Real overlay prop — hidden; users interact via flat controls above
    overlay:   { table: { disable: true } },
    width:     { table: { disable: true } },
    height:    { table: { disable: true } },
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

// Story args include the flat overlay controls (not real Media props)
type StoryArgs = React.ComponentProps<typeof Media> & {
  overlayType?: OverlayPreset;
  overlayColor?: string;
  overlayOpacity?: number;
};
type Story = StoryObj<StoryArgs>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    overlayType: 'none',
    overlayColor: '#ff247d',
    overlayOpacity: 40,
  },
  render: ({ overlayType, overlayColor, overlayOpacity, overlay: _overlay, ...args }) => (
    <Media
      {...args}
      overlay={buildOverlay(overlayType ?? 'none', overlayColor, overlayOpacity)}
    />
  ),
};

// ─── Aspect Ratios ────────────────────────────────────────────────────────────

export const AspectRatios: Story = {
  name: 'Aspect Ratios',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>1/1 — square</p>
        <div style={{ maxWidth: '320px' }}>
          <Media src={SAMPLE_IMAGE} alt="Square 1:1" aspectRatio="1/1" />
        </div>
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>16/9 — content width</p>
        <Media src={SAMPLE_IMAGE} alt="Content-width 16:9" aspectRatio="16/9" />
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>21/9 — full bleed / hero (0 radius, 0 margin)</p>
        <Media
          src={SAMPLE_IMAGE}
          alt="Full-width 21:9 hero"
          aspectRatio="21/9"
          bleed
          overlay={{ type: 'duotone', duotonePreset: 'featured' }}
        />
      </div>
    </div>
  ),
};

// ─── Overlays ─────────────────────────────────────────────────────────────────

const OVERLAY_SAMPLES: Array<{ label: string; overlay: React.ComponentProps<typeof Media>['overlay'] }> = [
  { label: 'Duotone',         overlay: { type: 'duotone', duotonePreset: 'standard' } },
  { label: 'Duotone Subtle',  overlay: { type: 'duotone', duotonePreset: 'subtle' } },
  { label: 'Duotone Extreme', overlay: { type: 'duotone-extreme' } },
  { label: 'Dark Scrim',      overlay: { type: 'dark-scrim' } },
  { label: 'Greyscale',       overlay: { type: 'greyscale' } },
  { label: 'Color Overlay',   overlay: { type: 'color', color: 'var(--st-color-pink)', overlayOpacity: 40 } },
];

export const Overlays: Story = {
  name: 'Overlays',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {OVERLAY_SAMPLES.map(({ label, overlay }) => (
        <div key={label}>
          <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>{label}</p>
          <Media
            src={SAMPLE_IMAGE}
            alt={label}
            aspectRatio="16/9"
            overlay={overlay}
          />
        </div>
      ))}
    </div>
  ),
};

// ─── Hotspot ──────────────────────────────────────────────────────────────────

/**
 * hotspot — Sanity hotspot (x, y: 0–1) translated to CSS object-position, so a
 * cropped/cover-fit image keeps the subject in frame instead of snapping to
 * center. SUG-224 Phase 4 batch 3: ported from the web adapter, which
 * PageSections/CardBuilderSection depend on for hotspot-aware thumbnails.
 */
export const WithHotspot: Story = {
  name: 'WithHotspot',
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div>
        <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>No hotspot (centered)</p>
        <Media src={SAMPLE_IMAGE} alt="Centered crop" aspectRatio="1/1" />
      </div>
      <div>
        <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>hotspot={'{'}x: 0.2, y: 0.1{'}'}</p>
        <Media src={SAMPLE_IMAGE} alt="Hotspot-cropped" aspectRatio="1/1" hotspot={{ x: 0.2, y: 0.1 }} />
      </div>
    </div>
  ),
};

// ─── Snapshot (Chromatic) ─────────────────────────────────────────────────────

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: {
    chromatic: { disableSnapshot: false },
    controls: { disable: true },
    layout: 'padded',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
      <Media src={SAMPLE_IMAGE} alt="No overlay" aspectRatio="16/9" caption="Default" />
      <Media src={SAMPLE_IMAGE} alt="Duotone" aspectRatio="16/9" overlay={{ type: 'duotone', duotonePreset: 'standard' }} caption="Duotone" />
      <Media src={SAMPLE_IMAGE} alt="Dark scrim" aspectRatio="16/9" overlay={{ type: 'dark-scrim' }} caption="Dark Scrim" />
      <Media src={SAMPLE_IMAGE} alt="Greyscale" aspectRatio="16/9" overlay={{ type: 'greyscale' }} caption="Greyscale" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ maxWidth: '320px' }}>
          <Media src={SAMPLE_IMAGE} alt="1/1" aspectRatio="1/1" caption="1/1" />
        </div>
        <Media src={SAMPLE_IMAGE} alt="21/9" aspectRatio="21/9" overlay={{ type: 'duotone', duotonePreset: 'featured' }} caption="21/9" />
      </div>
    </div>
  ),
};
