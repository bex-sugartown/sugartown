import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
  title: 'Components/Layout/Box',
  component: Box,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    children: 'Box with no styling applied — transparent, zero padding.',
  },
};

export const WithPadding: Story = {
  args: {
    padding: '4',
    background: 'surface',
    children: 'padding="4" (16px), background="surface"',
  },
};

export const WithBorder: Story = {
  args: {
    padding: '4',
    borderWidth: 1,
    borderColor: 'default',
    borderRadius: 'sm',
    children: 'borderWidth=1, borderColor="default", borderRadius="sm"',
  },
};

export const PaddingAxes: Story = {
  args: {
    paddingX: '5',
    paddingY: '2',
    background: 'subtle',
    children: 'paddingX="5" (24px), paddingY="2" (8px)',
  },
};

export const AsSection: Story = {
  args: {
    as: 'section',
    padding: '5',
    background: 'elevated',
    borderRadius: 'md',
    children: 'Rendered as <section>, padding="5", background="elevated", borderRadius="md"',
  },
};

export const Nested: Story = {
  render: () => (
    <Box padding="5" background="surface" borderRadius="sm">
      <Box padding="3" background="elevated" borderRadius="xs">
        Inner box with different background
      </Box>
    </Box>
  ),
};
