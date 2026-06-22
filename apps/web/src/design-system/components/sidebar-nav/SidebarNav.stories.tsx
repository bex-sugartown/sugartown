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
};

export default meta;
type Story = StoryObj<typeof SidebarNav>;

/** Standard sidebar nav — active link and indented sub-items visible. */
export const Default: Story = {
  args: {
    label: 'On this page',
    items: ITEMS,
    activeId: 'workspace-topology',
  },
};

/** Collapsible variant — wraps the list in a `<details>` disclosure element. */
export const Collapsible: Story = {
  args: {
    label: 'On this page',
    items: ITEMS,
    activeId: 'workspace-topology',
    collapsible: true,
    defaultOpen: true,
  },
};
