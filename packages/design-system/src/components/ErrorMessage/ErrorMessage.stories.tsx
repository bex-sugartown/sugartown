import type { Meta, StoryObj } from '@storybook/react';
import { ErrorMessage } from './ErrorMessage';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/Form/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
  args: { id: 'email-error', children: 'Please enter a valid email address.' },
};
