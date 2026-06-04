import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList } from './DescriptionList';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

const SAMPLE_ITEMS = [
  { label: 'Status', value: 'Published' },
  { label: 'Author', value: 'Bex' },
  { label: 'Date', value: '4 June 2026' },
  { label: 'Reading time', value: '5 min' },
];

export const SingleColumn: Story = {
  args: {
    items: SAMPLE_ITEMS,
    columns: 1,
  },
};

export const TwoColumn: Story = {
  args: {
    items: SAMPLE_ITEMS,
    columns: 2,
  },
};

export const LongValues: Story = {
  args: {
    items: [
      { label: 'Title', value: 'A very long article title that might wrap across multiple lines of text' },
      { label: 'Description', value: 'A description that is also quite long and contains detailed information about the content' },
      { label: 'Tags', value: 'design-systems, tokens, primitives, accessibility, css-modules' },
    ],
    columns: 1,
  },
};
