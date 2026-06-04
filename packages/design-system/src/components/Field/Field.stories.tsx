import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Field } from './Field';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';

const meta: Meta<typeof Field> = {
  title: 'Components/Form/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
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

export const WithHelper: Story = {
  render: () => (
    <Field label="Email address" htmlFor="email" helperText="We will never share your email.">
      <Input id="email" type="email" placeholder="bex@sugartown.io" />
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field label="Email address" htmlFor="email" errorMessage="Please enter a valid email address.">
      <Input id="email" type="email" defaultValue="not-valid" />
    </Field>
  ),
};

export const WithHelperAndError: Story = {
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
