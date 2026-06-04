import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Meter } from './Meter';

const meta: Meta<typeof Meter> = {
  title: 'Primitives/Meter',
  component: Meter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Meter>;

export const Default: Story = {
  args: {
    value: 65,
    label: 'Completion',
  },
};

export const WithValue: Story = {
  args: {
    value: 42,
    label: 'Progress',
    showValue: true,
  },
};

export const Full: Story = {
  args: {
    value: 100,
    label: 'Complete',
    showValue: true,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    label: 'Not started',
    showValue: true,
  },
};

export const CustomRange: Story = {
  args: {
    value: 7,
    min: 0,
    max: 10,
    label: 'Score',
    showValue: true,
  },
};
