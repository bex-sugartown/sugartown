/**
 * Sidebar stories — layout primitive (sticky shell + mobile disclosure).
 *
 * Note: sticky positioning only activates in a tall scroll context.
 * Stories show the disclosure/rail structure; use the platform or detail
 * page in the browser to verify sticky behaviour end-to-end.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    side: { control: 'radio', options: ['left', 'right'] },
    breakpoint: { control: 'radio', options: ['md', 'lg'] },
    mobileStyle: { control: 'radio', options: ['appendix', 'strip'] },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const Placeholder = ({ label }: { label: string }) => (
  <div style={{ padding: '0.5rem 0', color: 'var(--st-color-text-muted)', fontSize: '0.8125rem' }}>
    {label}
  </div>
);

// ── Right rail (content sidebar) ────────────────────────────

export const RightRail: Story = {
  name: 'Right rail (content)',
  args: {
    label: 'On this page',
    side: 'right',
    breakpoint: 'lg',
    mobileStyle: 'appendix',
    'aria-label': 'Page details',
  },
  render: (args) => (
    <div style={{ maxWidth: '240px' }}>
      <Sidebar {...args}>
        <Placeholder label="TOC — SidebarNav goes here" />
        <Placeholder label="Related content" />
        <Placeholder label="AI Disclosure" />
      </Sidebar>
    </div>
  ),
};

// ── Left nav rail (platform sidebar) ────────────────────────

export const LeftRail: Story = {
  name: 'Left rail (nav)',
  args: {
    label: 'Platform',
    side: 'left',
    breakpoint: 'md',
    mobileStyle: 'strip',
    'aria-label': 'Platform navigation',
  },
  render: (args) => (
    <div style={{ width: '220px' }}>
      <Sidebar {...args}>
        <Placeholder label="Nav sections — SidebarNav goes here" />
        <Placeholder label="Section B" />
        <Placeholder label="Section C" />
      </Sidebar>
    </div>
  ),
};

// ── Mobile appendix (open disclosure) ───────────────────────

export const MobileAppendix: Story = {
  name: 'Mobile — appendix',
  parameters: { viewport: { defaultViewport: 'mobile' } },
  render: () => (
    <Sidebar label="More from this page" mobileStyle="appendix" aria-label="Page details">
      <Placeholder label="TOC links" />
      <Placeholder label="Related content" />
    </Sidebar>
  ),
};

// ── Mobile strip (nav disclosure) ───────────────────────────

export const MobileStrip: Story = {
  name: 'Mobile — strip',
  parameters: { viewport: { defaultViewport: 'mobile' } },
  render: () => (
    <Sidebar label="Platform" mobileStyle="strip" side="left" breakpoint="md" aria-label="Platform navigation">
      <Placeholder label="Nav sections" />
    </Sidebar>
  ),
};
