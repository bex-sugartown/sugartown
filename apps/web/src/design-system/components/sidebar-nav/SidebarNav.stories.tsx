/**
 * SidebarNav stories — shared anchor-link list (SUG-112 Phase 2).
 *
 * Scrollspy requires a real scroll context; active state is shown via
 * the activeId prop override rather than live observation.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SidebarNav from './SidebarNav';

const ITEMS = [
  { id: 'overview',           label: 'Overview',           href: '#overview' },
  { id: 'architecture',       label: 'Architecture',       href: '#architecture' },
  { id: 'workspace-topology', label: 'Workspace topology', href: '#workspace-topology', level: 3 },
  { id: 'build-pipeline',     label: 'Build pipeline',     href: '#build-pipeline',     level: 3 },
  { id: 'artifacts',          label: 'Artifacts',          href: '#artifacts' },
  { id: 'results',            label: 'Results',            href: '#results' },
];

const meta: Meta<typeof SidebarNav> = {
  title: 'Patterns/SidebarNav',
  component: SidebarNav,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '240px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    collapsible: {
      control: 'boolean',
      description: 'Wrap the list in a `<details>` disclosure element. Use at sm/md breakpoints; leave false (default) at lg+.',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Initial open state when `collapsible` is true.',
    },
  },
  args: {
    collapsible: false,
  },
};

export default meta;
type Story = StoryObj<typeof SidebarNav>;

/** Large-screen layout — always visible, no disclosure wrapper (`collapsible=false`). */
export const Default: Story = {
  args: {
    label: 'On this page',
    items: ITEMS,
    activeId: 'workspace-topology',
  },
};

/** Small/medium breakpoint layout — list wrapped in a `<details>` disclosure, open by default. */
export const Collapsible: Story = {
  args: {
    label: 'On this page',
    items: ITEMS,
    activeId: 'workspace-topology',
    collapsible: true,
    defaultOpen: true,
  },
};
