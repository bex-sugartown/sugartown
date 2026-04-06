/**
 * Pagination stories — page navigation with ellipsis logic.
 *
 * Pure presentational — no external dependencies.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Pagination from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Patterns/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 }, description: 'Current active page (1-indexed)' },
    totalPages: { control: { type: 'number', min: 1 }, description: 'Total page count. Returns null when ≤ 1' },
    onPageChange: { action: 'pageChanged', description: 'Callback with page number' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

/** Few pages — all numbers shown, no ellipsis. */
export const FewPages: Story = {
  name: 'Few Pages (5)',
  args: {
    currentPage: 3,
    totalPages: 5,
    onPageChange: (page: number) => console.log('Navigate to page', page),
  },
};

/** Many pages — ellipsis shown on both sides. */
export const ManyPages: Story = {
  name: 'Many Pages (20)',
  args: {
    currentPage: 10,
    totalPages: 20,
    onPageChange: (page: number) => console.log('Navigate to page', page),
  },
};

/** First page — Prev button disabled. */
export const FirstPage: Story = {
  name: 'First Page',
  args: {
    currentPage: 1,
    totalPages: 12,
    onPageChange: (page: number) => console.log('Navigate to page', page),
  },
};

/** Last page — Next button disabled. */
export const LastPage: Story = {
  name: 'Last Page',
  args: {
    currentPage: 12,
    totalPages: 12,
    onPageChange: (page: number) => console.log('Navigate to page', page),
  },
};

/** Single page — should render nothing. */
export const SinglePage: Story = {
  name: 'Single Page (hidden)',
  args: {
    currentPage: 1,
    totalPages: 1,
    onPageChange: (page: number) => console.log('Navigate to page', page),
  },
};
