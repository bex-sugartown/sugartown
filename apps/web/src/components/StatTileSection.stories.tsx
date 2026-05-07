import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSections from './PageSections';

const meta: Meta<typeof PageSections> = {
  title: 'Patterns/StatTileSection',
  component: PageSections,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { chromatic: { disableSnapshot: false } },
};

export default meta;
type Story = StoryObj<typeof PageSections>;

const SAMPLE_ITEMS = [
  { _key: 'i1', metric: 'Design tokens', valueAfter: '659', evidenceType: 'audit' },
  { _key: 'i2', metric: 'Components', valueAfter: '14', valueBefore: '5 at project start', evidenceType: 'audit' },
  { _key: 'i3', metric: 'Story coverage', valueAfter: '86%', impactStatement: '12 of 14 DS components with Chromatic VRT', evidenceType: 'measurement' },
];

export const Default: Story = {
  args: {
    sections: [{
      _type: 'statTileSection',
      _key: 'sts-1',
      name: 'Design System',
      items: SAMPLE_ITEMS,
    }],
    context: 'detail',
  },
};

export const WithoutLabel: Story = {
  args: {
    sections: [{
      _type: 'statTileSection',
      _key: 'sts-2',
      items: SAMPLE_ITEMS,
    }],
    context: 'detail',
  },
};

export const SingleTile: Story = {
  args: {
    sections: [{
      _type: 'statTileSection',
      _key: 'sts-3',
      items: [{ _key: 'i1', metric: 'Commits', valueAfter: '975' }],
    }],
    context: 'detail',
  },
};
