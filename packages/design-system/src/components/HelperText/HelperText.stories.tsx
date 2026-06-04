import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HelperText } from './HelperText';

const meta: Meta<typeof HelperText> = {
  title: 'Primitives/Form/HelperText',
  component: HelperText,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof HelperText>;

export const Default: Story = {
  args: { id: 'email-helper', children: 'We will never share your email with anyone.' },
};
