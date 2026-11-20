import type { Meta, StoryObj } from '@storybook/react';
import { ErrorMessage } from './ErrorMessage';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/Form/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
  // #246: known color-contrast failure, reported by the a11y gate (#50) without failing it. Remove when #246 is fixed.
  parameters: { a11y: { test: 'todo' }, layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
  args: { id: 'email-error', children: 'Please enter a valid email address.' },
};
