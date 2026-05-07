import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSections from './PageSections';
import { richContent, simpleParagraph } from './__fixtures__/portableText';

const meta: Meta<typeof PageSections> = {
  title: 'Patterns/TextSection',
  component: PageSections,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { chromatic: { disableSnapshot: false } },
};

export default meta;
type Story = StoryObj<typeof PageSections>;

export const WithHeadingAndContent: Story = {
  args: {
    sections: [{ _type: 'textSection', _key: 'ts-1', heading: 'Why Structured Content Matters', content: richContent }],
    context: 'detail',
  },
};

export const ContentOnly: Story = {
  args: {
    sections: [{ _type: 'textSection', _key: 'ts-2', content: simpleParagraph }],
    context: 'detail',
  },
};

export const Empty: Story = {
  args: {
    sections: [{ _type: 'textSection', _key: 'ts-3' }],
    context: 'detail',
  },
};
