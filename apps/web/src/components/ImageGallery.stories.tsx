import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSections from './PageSections';

const meta: Meta<typeof PageSections> = {
  title: 'Patterns/ImageGallery',
  component: PageSections,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { chromatic: { disableSnapshot: false } },
};

export default meta;
type Story = StoryObj<typeof PageSections>;

// Uses a real Sanity CDN asset reference so urlFor() resolves correctly
const ASSET = { _type: 'reference' as const, _ref: 'image-d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500-jpg' };

const IMAGES = [
  { _key: 'img-1', asset: ASSET, alt: 'Platform architecture diagram', caption: 'Token layer overview' },
  { _key: 'img-2', asset: ASSET, alt: 'Component grid layout', caption: 'Component registry' },
  { _key: 'img-3', asset: ASSET, alt: 'Design system token map' },
];

export const Grid: Story = {
  args: {
    sections: [{
      _type: 'imageGallery',
      _key: 'ig-1',
      heading: 'Design System Overview',
      layout: 'grid',
      // #208: the linked image opens the lightbox like the others and shows its Read link there.
      images: IMAGES.map((img, i) => (i === 1 ? { ...img, link: { url: 'https://example.com/post', openInNewTab: true } } : img)),
    }],
    context: 'detail',
  },
};

export const Carousel: Story = {
  args: {
    sections: [{
      _type: 'imageGallery',
      _key: 'ig-2',
      layout: 'carousel',
      // ST-201: one multi-case story. Linked peek slides (click advances, no new tab),
      // a credit, and a long caption exercise controls and caption legibility.
      images: [
        { ...IMAGES[0], credit: 'AI-generated illustration' },
        { ...IMAGES[1], caption: 'A longer caption that wraps onto a second line so the caption bar contrast and clamp are visible over a busy image', link: { url: 'https://example.com/post', openInNewTab: true } },
        { ...IMAGES[2], caption: 'Linked, same tab', link: { url: '/articles', openInNewTab: false } },
      ],
    }],
    context: 'detail',
  },
};

export const SingleImage: Story = {
  args: {
    sections: [{
      _type: 'imageGallery',
      _key: 'ig-3',
      layout: 'grid',
      images: [IMAGES[0]],
    }],
    context: 'detail',
  },
};
