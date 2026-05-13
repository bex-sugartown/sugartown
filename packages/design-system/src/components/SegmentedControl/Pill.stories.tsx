import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Pill',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

function Controlled(props: Omit<React.ComponentProps<typeof SegmentedControl>, 'value' | 'onChange'> & { defaultValue?: string }) {
  const [value, setValue] = useState(props.defaultValue ?? props.options[0]?.value ?? '');
  return <SegmentedControl {...props} value={value} onChange={setValue} />;
}

export const TwoOptions: Story = {
  name: 'Two options',
  render: () => (
    <Controlled
      variant="pill"
      aria-label="Form factor"
      options={[
        { label: 'Mobile', value: 'mobile' },
        { label: 'Desktop', value: 'desktop' },
      ]}
      defaultValue="mobile"
    />
  ),
};

export const ThreeOptions: Story = {
  name: 'Three options',
  render: () => (
    <Controlled
      variant="pill"
      aria-label="Time range"
      options={[
        { label: '7d', value: '7d' },
        { label: '28d', value: '28d' },
        { label: '90d', value: '90d' },
      ]}
      defaultValue="28d"
    />
  ),
};
