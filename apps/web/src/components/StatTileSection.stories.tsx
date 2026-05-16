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

/** CWV field metrics — p75 values as stat tiles (LCP / CLS / INP). */
export const CwvFieldMetrics: Story = {
  name: 'CWV field metrics (LCP / CLS / INP)',
  args: {
    sections: [{
      _type: 'statTileSection',
      _key: 'sts-cwv',
      name: 'Core Web Vitals',
      kicker: 'p75 · field data · desktop',
      items: [
        { _key: 'lcp', metric: 'LCP',  valueAfter: '1.9s',  valueBefore: 'Good threshold: < 2.5s',  evidenceType: 'measurement' },
        { _key: 'cls', metric: 'CLS',  valueAfter: '0.040', valueBefore: 'Good threshold: < 0.1',   evidenceType: 'measurement' },
        { _key: 'inp', metric: 'INP',  valueAfter: '160ms', valueBefore: 'Good threshold: < 200ms', evidenceType: 'measurement' },
      ],
    }],
    context: 'detail',
  },
};
