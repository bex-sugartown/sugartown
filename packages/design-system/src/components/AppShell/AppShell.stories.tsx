import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'Components/Layout/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof AppShell>;

const Strip = ({ children, bg, h }: { children: React.ReactNode; bg?: string; h?: string }) => (
  <div style={{ background: bg ?? 'var(--st-color-brand-primary)', color: '#fff', padding: '12px 16px', height: h, fontFamily: 'var(--st-font-family-mono)', fontSize: '12px', boxSizing: 'border-box' }}>
    {children}
  </div>
);

export const WithSidebar: Story = {
  render: () => (
    <AppShell
      header={<Strip>header</Strip>}
      sidebar={<Strip bg="var(--st-color-ink)" h="400px">sidebar</Strip>}
      main={<Strip bg="var(--st-color-bg-surface)" h="400px"><span style={{ color: 'var(--st-color-text-default)' }}>main</span></Strip>}
      footer={<Strip bg="var(--st-color-ink)">footer</Strip>}
    />
  ),
};

export const WithoutSidebar: Story = {
  render: () => (
    <AppShell
      header={<Strip>header</Strip>}
      main={<Strip bg="var(--st-color-bg-surface)" h="400px"><span style={{ color: 'var(--st-color-text-default)' }}>main — full width, no sidebar</span></Strip>}
      footer={<Strip bg="var(--st-color-ink)">footer</Strip>}
    />
  ),
};
