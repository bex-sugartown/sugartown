import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Blockquote from './Blockquote';

const meta: Meta<typeof Blockquote> = {
  title: 'Web/Blockquote',
  component: Blockquote,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: '640px' }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Blockquote>;

export const Default: Story = {
  args: {
    children: <p>The best design systems are invisible — they disappear into the product.</p>,
  },
};

export const WithCitation: Story = {
  name: 'With citation',
  args: {
    children: <p>Typography is the craft of endowing human language with a durable visual form.</p>,
    citation: 'Robert Bringhurst, The Elements of Typographic Style',
  },
};

export const LongQuote: Story = {
  name: 'Long quote',
  args: {
    children: (
      <p>
        A well-designed system doesn't just solve today's problems — it anticipates tomorrow's.
        The architecture you choose now will either constrain or enable every decision that follows.
        The most durable design choices are those that encode constraint, not just convenience.
      </p>
    ),
    citation: 'Sugartown Design Principles',
  },
};
