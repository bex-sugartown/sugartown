import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Table, { TableWrap } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Web/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: '720px' }}><Story /></div>],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['default', 'responsive', 'wide'] },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const TableBody = () => (
  <>
    <thead>
      <tr>
        <th>Component</th>
        <th>Layer</th>
        <th>Has story</th>
        <th>Chromatic</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Card</td><td>Web adapter</td><td>✅</td><td>✅</td></tr>
      <tr><td>Chip</td><td>Web adapter</td><td>✅</td><td>✅</td></tr>
      <tr><td>Button</td><td>Web adapter</td><td>✅</td><td>✅</td></tr>
    </tbody>
  </>
);

export const Default: Story = {
  render: () => (
    <TableWrap>
      <Table><TableBody /></Table>
    </TableWrap>
  ),
};

export const Responsive: Story = {
  render: () => (
    <TableWrap variant="responsive">
      <Table variant="responsive"><TableBody /></Table>
    </TableWrap>
  ),
};

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '720px' }}>
      <TableWrap>
        <Table><TableBody /></Table>
      </TableWrap>
    </div>
  ),
};
