import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Components/Form/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { htmlFor: 'email', children: 'Email address' },
};

export const Required: Story = {
  args: { htmlFor: 'email', required: true, children: 'Email address' },
};
