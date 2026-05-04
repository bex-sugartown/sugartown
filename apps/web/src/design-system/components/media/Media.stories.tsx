import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Media from './Media';

const THUMB = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80';

const meta: Meta<typeof Media> = {
  title: 'Web/Media',
  component: Media,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: '640px' }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Media>;

export const Default: Story = {
  args: { src: THUMB, alt: 'Code on a screen' },
};

export const WithCaption: Story = {
  name: 'With caption',
  args: { src: THUMB, alt: 'Code on a screen', caption: 'A developer reviews code in a modern IDE.' },
};

export const DuotoneStandard: Story = {
  name: 'Duotone — standard',
  args: {
    src: THUMB,
    alt: 'Code on a screen',
    overlay: { type: 'duotone-standard' },
  },
};

export const DuotoneFeatured: Story = {
  name: 'Duotone — featured',
  args: {
    src: THUMB,
    alt: 'Code on a screen',
    overlay: { type: 'duotone-featured' },
  },
};

export const DarkScrim: Story = {
  name: 'Dark scrim overlay',
  args: {
    src: THUMB,
    alt: 'Code on a screen',
    overlay: { type: 'dark-scrim' },
  },
};

export const Greyscale: Story = {
  name: 'Greyscale',
  args: {
    src: THUMB,
    alt: 'Code on a screen',
    overlay: { type: 'greyscale' },
  },
};

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '800px' }}>
      <Media src={THUMB} alt="Default" />
      <Media src={THUMB} alt="Duotone" overlay={{ type: 'duotone-standard' }} />
      <Media src={THUMB} alt="Greyscale" overlay={{ type: 'greyscale' }} />
      <Media src={THUMB} alt="Dark scrim" overlay={{ type: 'dark-scrim' }} />
    </div>
  ),
};
