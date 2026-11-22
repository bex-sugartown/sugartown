import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { HelperText } from './HelperText';

const meta: Meta<typeof HelperText> = {
  title: 'Components/Form/HelperText',
  component: HelperText,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof HelperText>;

export const Default: Story = {
  args: { id: 'email-helper', children: 'We will never share your email with anyone.' },
  // #50 Phase 1: the id is what a control's aria-describedby points at, so it must reach the DOM.
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('We will never share your email with anyone.');
    await expect(text).toBeVisible();
    await expect(text).toHaveAttribute('id', 'email-helper');
  },
};
