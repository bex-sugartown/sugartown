import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSections from './PageSections';
import { simpleParagraph } from './__fixtures__/portableText';

const meta: Meta<typeof PageSections> = {
  title: 'Patterns/CitedBlock',
  component: PageSections,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { chromatic: { disableSnapshot: false } },
};

export default meta;
type Story = StoryObj<typeof PageSections>;

export const WithHeadingAndBody: Story = {
  args: {
    sections: [{
      _type: 'citedBlock',
      _key: 'cb-1',
      heading: 'Key Finding',
      body: simpleParagraph,
    }],
    context: 'detail',
  },
};

export const WithReferences: Story = {
  args: {
    sections: [{
      _type: 'citedBlock',
      _key: 'cb-2',
      heading: 'Further Reading',
      body: simpleParagraph,
      references: [
        { _id: 'ref-1', _type: 'article', slug: 'token-driven-design', title: 'Token-Driven Design Systems' },
        { _id: 'ref-2', _type: 'node',    slug: 'content-graph',       title: 'The Content Graph Approach' },
      ],
    }],
    context: 'detail',
  },
};

export const BodyOnly: Story = {
  args: {
    sections: [{ _type: 'citedBlock', _key: 'cb-3', body: simpleParagraph }],
    context: 'detail',
  },
};
