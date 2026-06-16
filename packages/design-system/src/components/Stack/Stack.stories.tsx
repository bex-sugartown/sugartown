import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Foundations/Layout/Stack',
  component: Stack,
};
export default meta;
type Story = StoryObj<typeof Stack>;

const Box = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--st-color-brand-primary)', color: '#fff', padding: '12px 20px', fontFamily: 'var(--st-font-family-mono)', fontSize: '12px', whiteSpace: 'nowrap' }}>
    {children}
  </div>
);

export const Vertical: Story = {
  render: () => (
    <Stack gap="4" direction="vertical">
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stack gap="4" direction="horizontal">
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const Responsive: Story = {
  name: 'Responsive direction',
  render: () => (
    <Stack gap="4" direction={{ base: 'vertical', md: 'horizontal' }}>
      <Box>Vertical on mobile</Box>
      <Box>Horizontal from md+</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
};

export const AllGaps: Story = {
  name: 'All gap sizes',
  render: () => (
    <Stack gap="6" direction="vertical">
      {(['0', '1', '2', '3', '4', '5', '6'] as const).map((g) => (
        <Stack key={g} gap={g} direction="horizontal">
          <Box>{`gap="${g}"`}</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      ))}
    </Stack>
  ),
};

export const CenteredRow: Story = {
  render: () => (
    <Stack gap="3" direction="horizontal" align="center" justify="center">
      <Box>Left</Box>
      <Box style={{ padding: '24px 20px' }}>Tall</Box>
      <Box>Right</Box>
    </Stack>
  ),
};
