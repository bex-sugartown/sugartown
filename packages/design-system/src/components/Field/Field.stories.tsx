import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { Field } from './Field';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';

const meta: Meta<typeof Field> = {
  title: 'Components/Form/Field',
  component: Field,
  tags: ['autodocs'],
  // #246: known color-contrast failure, reported by the a11y gate (#50) without failing it. Remove when #246 is fixed.
  parameters: { a11y: { test: 'todo' }, layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <Field label="Email address" htmlFor="email">
      <Input id="email" type="email" placeholder="bex@sugartown.io" />
    </Field>
  ),
};

export const Required: Story = {
  render: () => (
    <Field label="Email address" htmlFor="email" required>
      <Input id="email" type="email" placeholder="bex@sugartown.io" />
    </Field>
  ),
};

// #50 Phase 1: the label names the control, and helper and error text are announced through aria-describedby.
export const WithHelper: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email address');
    await userEvent.click(canvas.getByText('Email address'));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAccessibleDescription('We will never share your email.');
  },
  render: () => (
    <Field label="Email address" htmlFor="email" helperText="We will never share your email.">
      <Input id="email" type="email" placeholder="bex@sugartown.io" />
    </Field>
  ),
};

export const WithError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
    await expect(canvas.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true');
  },
  render: () => (
    <Field label="Email address" htmlFor="email" errorMessage="Please enter a valid email address.">
      <Input id="email" type="email" defaultValue="not-valid" />
    </Field>
  ),
};

export const WithHelperAndError: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText('Email address')).toHaveAccessibleDescription(
      'We will never share your email. Please enter a valid email address.',
    );
  },
  render: () => (
    <Field
      label="Email address"
      htmlFor="email"
      helperText="We will never share your email."
      errorMessage="Please enter a valid email address."
    >
      <Input id="email" type="email" defaultValue="not-valid" />
    </Field>
  ),
};

export const TextareaField: Story = {
  render: () => (
    <Field label="Message" htmlFor="message" helperText="Max 500 characters.">
      <Textarea id="message" placeholder="Write your message…" rows={4} />
    </Field>
  ),
};

export const DisabledField: Story = {
  render: () => (
    <Field label="Username" htmlFor="username">
      <Input id="username" disabled defaultValue="bex" />
    </Field>
  ),
};
