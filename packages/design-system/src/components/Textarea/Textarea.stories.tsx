import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

// Textarea has no label of its own: in use it sits inside Field, which supplies one. A bare
// Textarea story would fail the axe 'label' rule (#50), so each story gets a visually hidden
// label, which changes nothing on screen.
const visuallyHidden: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

const meta: Meta<typeof Textarea> = {
  title: 'Components/Form/Textarea',
  component: Textarea,
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
