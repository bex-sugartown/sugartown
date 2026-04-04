import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ImageLightbox from './ImageLightbox';

const meta: Meta<typeof ImageLightbox> = {
  title: 'Patterns/ImageLightbox',
  component: ImageLightbox,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ImageLightbox>;

/**
 * Mock images — use placeholder URLs since urlFor() isn't available in stories.
 * The component calls urlFor(image.asset) internally, but for stories we
 * pre-resolve the URLs in the fixture data and patch the component via
 * a decorator or accept that images won't render (documenting the API shape).
 */
const mockImages = [
  {
    asset: { _ref: 'image-1' },
    alt: 'Design system token architecture diagram',
    caption: 'Token hierarchy: global → alias → component',
  },
  {
    asset: { _ref: 'image-2' },
    alt: 'Component composition patterns',
    caption: 'Slot-based composition vs prop-driven configuration',
  },
  {
    asset: { _ref: 'image-3' },
    alt: 'Knowledge graph entity relationships',
    caption: 'Nodes, edges, and taxonomy connections',
  },
];

/** Lightbox wrapper — provides onClose and open/close toggle for interactive demo. */
function LightboxDemo({ images, initialIndex }: { images: typeof mockImages; initialIndex?: number }) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--st-color-text-primary, #fff)' }}>
          Lightbox closed. Click to reopen.
        </p>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'var(--st-color-brand-primary, #FF247D)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Open Lightbox
        </button>
      </div>
    );
  }
  return <ImageLightbox images={images} initialIndex={initialIndex ?? 0} onClose={() => setOpen(false)} />;
}

/** Gallery lightbox — multiple images with prev/next navigation. */
export const Gallery: Story = {
  render: () => <LightboxDemo images={mockImages} />,
};

/** Single image — no prev/next controls. */
export const SingleImage: Story = {
  render: () => <LightboxDemo images={[mockImages[0]]} />,
};

/** Start at second image. */
export const StartAtIndex: Story = {
  render: () => <LightboxDemo images={mockImages} initialIndex={1} />,
};
