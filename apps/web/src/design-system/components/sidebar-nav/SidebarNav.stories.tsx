/**
 * SidebarNav stories — shared anchor-link list (SUG-112 Phase 2).
 *
 * In-browser scrollspy requires a real scroll context; Storybook renders
 * in a fixed-height iframe, so scrollspy state is shown via the activeId prop
 * override rather than live observation.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SidebarNav from './SidebarNav';

const meta: Meta<typeof SidebarNav> = {
  title: 'Patterns/SidebarNav',
  component: SidebarNav,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof SidebarNav>;

const ITEMS = [
  { id: 'introduction', label: 'Introduction', href: '#introduction' },
  { id: 'problem-space', label: 'The Problem Space', href: '#problem-space' },
  { id: 'approach', label: 'Our Approach', href: '#approach' },
  { id: 'implementation', label: 'Implementation', href: '#implementation' },
  { id: 'results', label: 'Results', href: '#results' },
];

const ITEMS_WITH_SUB: typeof ITEMS = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'architecture', label: 'Architecture', href: '#architecture' },
  { id: 'workspace-topology', label: 'Workspace topology', href: '#workspace-topology', level: 3 } as any,
  { id: 'build-pipeline', label: 'Build pipeline', href: '#build-pipeline', level: 3 } as any,
  { id: 'artifacts', label: 'Artifacts', href: '#artifacts' },
];

const ITEMS_WITH_EXTERNAL: typeof ITEMS = [
  ...ITEMS.slice(0, 3),
  { id: 'storybook', label: 'Storybook', href: 'https://storybook.example.com', external: true } as any,
];

export const Default: Story = {
  args: {
    label: 'On this page',
    items: ITEMS,
  },
};

export const WithActiveLink: Story = {
  args: {
    label: 'On this page',
    items: ITEMS,
    activeId: 'approach',
  },
};

export const SubItems: Story = {
  args: {
    label: 'On this page',
    items: ITEMS_WITH_SUB,
    activeId: 'workspace-topology',
  },
};

export const WithExternalLink: Story = {
  args: {
    label: 'Navigation',
    items: ITEMS_WITH_EXTERNAL,
    activeId: 'approach',
  },
};

export const Collapsible: Story = {
  args: {
    label: 'On this page',
    items: ITEMS,
    collapsible: true,
    defaultOpen: true,
  },
};

export const CollapsedByDefault: Story = {
  args: {
    label: 'On this page',
    items: ITEMS,
    collapsible: true,
    defaultOpen: false,
  },
};

export const LongLabels: Story = {
  args: {
    label: 'On this page',
    items: [
      { id: 'a', label: 'An unusually long section heading that will likely wrap or truncate depending on the sidebar width', href: '#a' },
      { id: 'b', label: 'Another perfectly normal length heading', href: '#b' },
      { id: 'c', label: 'Short', href: '#c' },
    ],
    activeId: 'a',
  },
};

export const Empty: Story = {
  args: {
    label: 'On this page',
    items: [],
  },
};
