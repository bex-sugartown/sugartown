import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Form/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { id: 'message', placeholder: 'Write your message…' },
};

export const WithValue: Story = {
  args: { id: 'message', rows: 6, defaultValue: 'Some existing content here.' },
};

export const ErrorState: Story = {
  args: { id: 'message', hasError: true, defaultValue: 'Invalid content' },
};

export const Disabled: Story = {
  args: { id: 'message', disabled: true, defaultValue: 'Cannot edit this' },
};
