/**
 * @deprecated — story moved to Patterns/IconButton/ThemeToggle.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ThemeToggle from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Legacy/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

/**
 * Default state — renders a sun/moon icon button.
 * Click to toggle between dark and light themes.
 */
export const Default: Story = {};
