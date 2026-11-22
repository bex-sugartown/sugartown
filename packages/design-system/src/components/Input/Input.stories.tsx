import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './Input';

// Input has no label of its own: in use it sits inside Field, which supplies one. A bare
// Input story would fail the axe 'label' rule (#50), so each story gets a visually hidden
// label, which changes nothing on screen.
const visuallyHidden: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

const meta: Meta<typeof Input> = {
  title: 'Components/Form/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story, context) => (
      <>
        <label htmlFor={context.args.id} style={visuallyHidden}>{context.name}</label>
        <Story />
      </>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Input>;

// #50 Phase 1: typing reaches the control; a disabled control accepts nothing; hasError sets aria-invalid.
export const Default: Story = {
  args: { id: 'name', placeholder: 'Enter your name' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByPlaceholderText('Enter your name');
    await userEvent.type(input, 'Bex');
    await expect(input).toHaveValue('Bex');
  },
};

export const WithValue: Story = {
  args: { id: 'email', type: 'email', defaultValue: 'bex@sugartown.io' },
};

export const ErrorState: Story = {
  args: { id: 'email', type: 'email', hasError: true, defaultValue: 'not-an-email' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByDisplayValue('not-an-email')).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Disabled: Story = {
  args: { id: 'name', disabled: true, defaultValue: 'Cannot edit this' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByDisplayValue('Cannot edit this');
    await expect(input).toBeDisabled();
    await userEvent.type(input, 'x');
    await expect(input).toHaveValue('Cannot edit this');
  },
};
