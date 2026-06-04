import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Metric } from './Metric';

const meta: Meta<typeof Metric> = {
  title: 'Components/Metric',
  component: Metric,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Metric>;

export const Default: Story = {
  args: {
    value: '4.2s',
    label: 'Avg load time',
  },
};

export const TrendUp: Story = {
  args: {
    value: '94',
    label: 'Performance score',
    trend: 'up',
  },
};

export const TrendDown: Story = {
  args: {
    value: '1.8s',
    label: 'LCP',
    trend: 'down',
  },
};

export const TrendNeutral: Story = {
  args: {
    value: '0',
    label: 'CLS shift',
    trend: 'neutral',
  },
};

export const LargeNumber: Story = {
  args: {
    value: '142,000',
    label: 'Total page views',
  },
};
