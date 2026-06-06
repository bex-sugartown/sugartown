import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Surface } from './Surface';

const meta: Meta<typeof Surface> = {
  title: 'Foundations/Layout/Surface',
  component: Surface,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Surface>;

const Content = ({ label }: { label: string }) => (
  <div style={{ padding: '24px', fontFamily: 'var(--st-font-family-mono)', fontSize: '12px' }}>
    {label}
  </div>
);

export const Elevation0: Story = {
  render: () => <Surface elevation={0}><Content label="elevation=0 — flat, no shadow" /></Surface>,
};

export const Elevation1: Story = {
  render: () => <Surface elevation={1}><Content label="elevation=1 — subtle shadow" /></Surface>,
};

export const Elevation2: Story = {
  render: () => <Surface elevation={2}><Content label="elevation=2 — raised" /></Surface>,
};

export const Elevation3: Story = {
  render: () => <Surface elevation={3}><Content label="elevation=3 — floating" /></Surface>,
};

export const AllElevations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--st-color-bg-canvas)', padding: '32px' }}>
      {([0, 1, 2, 3] as const).map((e) => (
        <Surface key={e} elevation={e}>
          <Content label={`elevation=${e}`} />
        </Surface>
      ))}
    </div>
  ),
};
