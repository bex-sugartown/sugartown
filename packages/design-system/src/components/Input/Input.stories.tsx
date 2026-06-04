import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Form/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { id: 'name', placeholder: 'Enter your name' },
};

export const WithValue: Story = {
  args: { id: 'email', type: 'email', defaultValue: 'bex@sugartown.io' },
};

export const ErrorState: Story = {
  args: { id: 'email', type: 'email', hasError: true, defaultValue: 'not-an-email' },
};

export const Disabled: Story = {
  args: { id: 'name', disabled: true, defaultValue: 'Cannot edit this' },
};
