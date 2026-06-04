import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Page } from './Page';

const meta: Meta<typeof Page> = {
  title: 'Components/Layout/Page',
  component: Page,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Page>;

const Strip = ({ children, bg }: { children: React.ReactNode; bg?: string }) => (
  <div style={{ background: bg ?? 'var(--st-color-brand-primary)', color: '#fff', padding: '12px 16px', fontFamily: 'var(--st-font-family-mono)', fontSize: '12px' }}>
    {children}
  </div>
);

export const ReadingWidth: Story = {
  render: () => (
    <Page
      size="reading"
      header={<Strip>header slot</Strip>}
      footer={<Strip bg="var(--st-color-ink)">footer slot</Strip>}
    >
      <Strip bg="var(--st-color-bg-surface)">
        <span style={{ color: 'var(--st-color-text-default)' }}>main content — reading (760px)</span>
      </Strip>
    </Page>
  ),
};

export const DetailWidth: Story = {
  render: () => (
    <Page
      size="detail"
      header={<Strip>header slot</Strip>}
      footer={<Strip bg="var(--st-color-ink)">footer slot</Strip>}
    >
      <Strip bg="var(--st-color-bg-surface)">
        <span style={{ color: 'var(--st-color-text-default)' }}>main content — detail (1080px)</span>
      </Strip>
    </Page>
  ),
};
