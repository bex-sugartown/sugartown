/**
 * ThemeToggle stories — dark/light theme switch button.
 *
 * Self-contained component with no external dependencies.
 * Reads and writes data-theme on document.documentElement.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ThemeToggle from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Patterns/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
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
