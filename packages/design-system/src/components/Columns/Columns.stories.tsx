import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Columns } from './Columns';

const meta: Meta<typeof Columns> = {
  title: 'Components/Layout/Columns',
  component: Columns,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Columns>;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--st-color-brand-primary)', color: '#fff', padding: '24px 16px', fontFamily: 'var(--st-font-family-mono)', fontSize: '12px', textAlign: 'center' }}>
    {children}
  </div>
);

export const TwoColumn: Story = {
  render: () => (
    <Columns count={2} gap="5">
      <Cell>Column 1</Cell>
      <Cell>Column 2</Cell>
    </Columns>
  ),
};

export const ThreeColumn: Story = {
  render: () => (
    <Columns count={3} gap="4">
      <Cell>Column 1</Cell>
      <Cell>Column 2</Cell>
      <Cell>Column 3</Cell>
    </Columns>
  ),
};

export const FourColumn: Story = {
  render: () => (
    <Columns count={4} gap="3">
      <Cell>Col 1</Cell>
      <Cell>Col 2</Cell>
      <Cell>Col 3</Cell>
      <Cell>Col 4</Cell>
    </Columns>
  ),
};

export const WithCollapseAtMd: Story = {
  name: 'Collapses at md (resize to see)',
  render: () => (
    <Columns count={3} gap="4" collapse="md">
      <Cell>Stacks below 768px</Cell>
      <Cell>Column 2</Cell>
      <Cell>Column 3</Cell>
    </Columns>
  ),
};
