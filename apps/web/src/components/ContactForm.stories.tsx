import type { Meta, StoryObj } from '@storybook/react';
import ContactForm from './ContactForm';

const meta: Meta<typeof ContactForm> = {
  title: 'Patterns/ContactForm',
  component: ContactForm,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

/** Default contact form — name, email, message fields with validation. */
export const Default: Story = {};
