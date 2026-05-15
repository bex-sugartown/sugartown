import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StatGrid, StatGridCell } from './StatGrid';

const meta: Meta<typeof StatGrid> = {
  title: 'Components/StatGrid',
  component: StatGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof StatGrid>;

export const Stats4Col: Story = {
  render: () => (
    <StatGrid columns={4}>
      <StatGridCell label="In flight"       value="3"       href="#" />
      <StatGridCell label="Current release" value="v0.23.29" href="#" />
      <StatGridCell label="Epics shipped"   value="42"      href="#" />
      <StatGridCell label="Vulnerabilities" value="0"       href="#" />
    </StatGrid>
  ),
};

export const Stats3Col: Story = {
  render: () => (
    <StatGrid columns={3}>
      <StatGridCell label="Design tokens"  value="595" signal="+ 5 priority tokens" />
      <StatGridCell label="DS components"  value="14"  signal="+ 3 web adapters" />
      <StatGridCell label="Story coverage" value="86%" signal="12 of 14 DS components" />
    </StatGrid>
  ),
};

export const Artifacts4Col: Story = {
  render: () => (
    <StatGrid columns={4}>
      <StatGridCell label="Brief"       value="IA Brief"            foot="Markdown →" href="#" />
      <StatGridCell label="Conventions" value="CLAUDE.md"           foot="Markdown →" href="#" />
      <StatGridCell label="Brief"       value="AI Ethics"           foot="Markdown →" href="#" />
      <StatGridCell label="Prompt"      value="Release Assistant"   foot="Prompt →"   href="#" />
    </StatGrid>
  ),
};
