/**
 * Drawer stories — slide-out mobile navigation drawer.
 *
 * Uses MemoryRouter (for NavLink/Link).
 * Renders in open state by default for visual testing.
 * Includes accordion submenus, CTA, footer links, social icons.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Drawer from './Drawer';
import ThemeToggle from './ThemeToggle';
import { Button, FilterBar } from '../design-system';
import {
  NAV_ITEMS,
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
} from './__fixtures__/siteSettings';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const withMobileWidth = (Story: React.ComponentType) => (
  <div style={{ maxWidth: '375px', height: '100vh', position: 'relative', overflow: 'hidden' }}>
    <Story />
  </div>
);

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  decorators: [withRouter],
  argTypes: {
    open: { control: 'boolean', description: 'Drawer visibility state' },
    items: { control: { type: 'object' }, description: 'Nav items array with optional children (accordion submenus)' },
    footerColumns: { control: { type: 'object' } },
    socialLinks: { control: { type: 'object' } },
    copyrightText: { control: 'text' },
    siteTitle: { control: 'text' },
    onClose: { action: 'closed' },
    cta: { table: { disable: true } },
    themeToggle: { table: { disable: true } },
  },
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const CTA_ELEMENT = (
  <Button variant="primary" href="/contact">Get in Touch</Button>
);

/** Open drawer — full nav with accordion submenu, CTA, footer, social. */
export const Open: Story = {
  decorators: [withMobileWidth],
  args: {
    items: NAV_ITEMS,
    cta: CTA_ELEMENT,
    themeToggle: <ThemeToggle />,
    footerColumns: FOOTER_COLUMNS,
    socialLinks: SOCIAL_LINKS,
    copyrightText: 'All rights reserved.',
    siteTitle: 'Sugartown Digital',
    open: true,
    onClose: () => {},
  },
};

/** Closed state — drawer hidden (overlay invisible). */
export const Closed: Story = {
  decorators: [withMobileWidth],
  args: {
    ...Open.args,
    open: false,
  },
};

/** Minimal — nav items only, no CTA or footer content. */
export const Minimal: Story = {
  name: 'Minimal (nav only)',
  decorators: [withMobileWidth],
  args: {
    items: NAV_ITEMS.filter((item: { children?: unknown[] }) => !item.children),
    open: true,
    onClose: () => {},
  },
};

// ─── Filter drawer (SUG-173) ─────────────────────────────────────────────────

const FILTER_MODEL = {
  facets: [
    {
      id: 'projects',
      label: 'Project',
      options: [
        { id: 'proj-1', label: 'Brand Strategy',  slug: 'brand-strategy',  count: 12, colorHex: '#7C3AED' },
        { id: 'proj-2', label: 'Web Platform',     slug: 'web-platform',    count: 8,  colorHex: '#0891B2' },
        { id: 'proj-3', label: 'Design System',    slug: 'design-system',   count: 21, colorHex: '#D97706' },
      ],
    },
    {
      id: 'categories',
      label: 'Category',
      options: [
        { id: 'cat-1', label: 'Engineering',  slug: 'engineering',  count: 15 },
        { id: 'cat-2', label: 'Strategy',     slug: 'strategy',     count: 7  },
        { id: 'cat-3', label: 'Research',     slug: 'research',     count: 4  },
      ],
    },
    {
      id: 'tags',
      label: 'Tag',
      options: [
        { id: 'tag-1', label: 'accessibility', slug: 'accessibility', count: 9  },
        { id: 'tag-2', label: 'performance',   slug: 'performance',   count: 5  },
        { id: 'tag-3', label: 'typography',    slug: 'typography',    count: 11 },
      ],
    },
  ],
};

function FilterDrawerStory() {
  const [open, setOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    projects: ['design-system'],
  });
  const handleChange = (facetId: string, value: string, checked: boolean) => {
    setActiveFilters((prev) => {
      const current = prev[facetId] ?? [];
      return { ...prev, [facetId]: checked ? [...current, value] : current.filter((v) => v !== value) };
    });
  };
  return (
    <>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} style={{ padding: '8px 16px' }}>
          Open filter drawer
        </button>
      )}
      <Drawer label="Filter articles" open={open} onClose={() => setOpen(false)}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <FilterBar
            filterModel={FILTER_MODEL}
            activeFilters={activeFilters}
            onFilterChange={handleChange}
            onClearAll={() => setActiveFilters({})}
          />
        </div>
        <div style={{ borderTop: '1px solid var(--st-color-border-subtle)', padding: '12px 16px', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="filterDrawerClearBtn"
            onClick={() => setActiveFilters({})}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #aaa', background: 'transparent', cursor: 'pointer', fontSize: '0.8125rem', color: '#666' }}
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ flex: 2, padding: '8px 12px', background: 'var(--st-color-brand-primary, #e91e8c)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}
          >
            Done
          </button>
        </div>
      </Drawer>
    </>
  );
}

/**
 * Filter Drawer — Drawer used as a mobile filter panel (SUG-173).
 * Generic Drawer shell wraps FilterBar + Clear All / Done footer.
 * Bespoke footer buttons will migrate to DS Button ghost/primary variants in SUG-174.
 */
export const FilterDrawer: Story = {
  name: 'Filter Drawer (mobile archive)',
  decorators: [
    (Story) => (
      <div style={{ width: '375px', height: '600px', position: 'relative', overflow: 'hidden', transform: 'translateZ(0)' }}>
        <Story />
      </div>
    ),
  ],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => <FilterDrawerStory />,
};
