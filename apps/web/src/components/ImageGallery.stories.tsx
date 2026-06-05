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
      images: IMAGES,
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
      images: IMAGES,
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

export const CarouselDarkMode: Story = {
  args: {
    sections: [{
      _type: 'imageGallery',
      _key: 'ig-4',
      layout: 'carousel',
      images: IMAGES,
    }],
    context: 'detail',
  },
  globals: { theme: 'dark-pink-moon' },
};
