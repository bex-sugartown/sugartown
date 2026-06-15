/**
 * Drawer — generic slide-out panel shell (SUG-153).
 *
 * Primitive API: label, open, onClose, children.
 * Content is the caller's responsibility — see use-case stories below.
 *
 * Use cases shipped:
 *   - Nav Drawer: Drawer + DrawerNav (rendered by Header on mobile)
 *   - Filter Drawer: Drawer + FilterBar + footer (SUG-173, archive pages on mobile)
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Drawer from './Drawer';
import DrawerNav from './DrawerNav';
import ThemeToggle from './ThemeToggle';
import { Button, FilterBar } from '../design-system';
import {
  NAV_ITEMS,
  FOOTER_COLUMNS,
  SOCIAL_LINKS,
} from './__fixtures__/siteSettings';

// ─── Shared decorator ─────────────────────────────────────────────────────────
// transform: translateZ(0) makes this div a containing block for position:fixed
// children so the overlay and panel stay within the story frame in Docs view.

const withFrame = (w = 375, h = 600) =>
  (Story: React.ComponentType) => (
    <MemoryRouter>
      <div
        style={{
          width: `${w}px`,
          height: `${h}px`,
          position: 'relative',
          overflow: 'hidden',
          transform: 'translateZ(0)',
          background: 'var(--st-color-bg-surface, #fff)',
        }}
      >
        <Story />
      </div>
    </MemoryRouter>
  );

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    label:   { control: 'text',    description: 'Visible heading + aria-label for the panel' },
    open:    { control: 'boolean', description: 'Controls open/closed state' },
    onClose: { action: 'closed',   description: 'Called on overlay click, close button, or Escape' },
    children: { table: { disable: true }, description: "Panel body content — caller's responsibility" },
  },
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'padded',
    docs: { story: { inline: false, height: '620px' } },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

// ─── Nav Drawer (navigation use case) ────────────────────────────────────────

function NavDrawerStory({ open }: { open: boolean }) {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <>
      {!isOpen && (
        <button type="button" onClick={() => setIsOpen(true)} style={{ padding: '8px 16px' }}>
          Open menu
        </button>
      )}
      <Drawer label="Menu" open={isOpen} onClose={() => setIsOpen(false)}>
        <DrawerNav
          items={NAV_ITEMS}
          cta={<Button variant="primary" href="/contact">Get in Touch</Button>}
          themeToggle={<ThemeToggle />}
          footerColumns={FOOTER_COLUMNS}
          socialLinks={SOCIAL_LINKS}
          copyrightText="All rights reserved."
          siteTitle="Sugartown Digital"
          onClose={() => setIsOpen(false)}
        />
      </Drawer>
    </>
  );
}

/** Nav Drawer — open. Drawer shell + DrawerNav content (rendered by Header on mobile). */
export const NavDrawerOpen: Story = {
  name: 'Nav Drawer — open',
  decorators: [withFrame()],
  render: () => <NavDrawerStory open={true} />,
};

/** Nav Drawer — closed. Overlay and panel hidden; only the trigger button is visible. */
export const NavDrawerClosed: Story = {
  name: 'Nav Drawer — closed',
  decorators: [withFrame()],
  render: () => <NavDrawerStory open={false} />,
};

// ─── Filter Drawer (archive mobile use case, SUG-173) ────────────────────────

const FILTER_MODEL = {
  facets: [
    {
      id: 'projects',
      label: 'Project',
      options: [
        { id: 'proj-1', label: 'Brand Strategy', slug: 'brand-strategy', count: 12, colorHex: '#7C3AED' },
        { id: 'proj-2', label: 'Web Platform',   slug: 'web-platform',   count: 8,  colorHex: '#0891B2' },
        { id: 'proj-3', label: 'Design System',  slug: 'design-system',  count: 21, colorHex: '#D97706' },
      ],
    },
    {
      id: 'categories',
      label: 'Category',
      options: [
        { id: 'cat-1', label: 'Engineering', slug: 'engineering', count: 15 },
        { id: 'cat-2', label: 'Strategy',    slug: 'strategy',    count: 7  },
        { id: 'cat-3', label: 'Research',    slug: 'research',    count: 4  },
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
          Open filters
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
            onClick={() => { setActiveFilters({}); setOpen(false); }}
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
 * Drawer shell + FilterBar content + Clear All / Done footer.
 * Footer buttons will migrate to DS Button ghost/primary in SUG-174.
 */
export const FilterDrawer: Story = {
  name: 'Filter Drawer (mobile archive)',
  decorators: [withFrame()],
  render: () => <FilterDrawerStory />,
};
