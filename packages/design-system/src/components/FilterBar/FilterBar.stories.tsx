import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from './FilterBar';
import type { FilterModel } from './FilterBar';

/**
 * ## FilterBar
 *
 * No variant prop — FilterBar has a single visual form. `In Drawer` below
 * shows the same component rendered inside the mobile archive drawer
 * context (SUG-173); that's a usage context, not a component variant.
 *
 * Each facet (`filterModel.facets[]`) renders as a `<fieldset>` of
 * checkboxes — every facet supports selecting more than one option at
 * once (multi-select), not just "tags". The Default story below has two
 * Category options checked simultaneously to show this.
 */

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_FILTER_MODEL: FilterModel = {
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
        { id: 'cat-1', label: 'Engineering',   slug: 'engineering',   count: 15 },
        { id: 'cat-2', label: 'Strategy',      slug: 'strategy',      count: 7  },
        { id: 'cat-3', label: 'Research',      slug: 'research',      count: 4  },
      ],
    },
    {
      id: 'tags',
      label: 'Tag',
      options: [
        { id: 'tag-1', label: 'accessibility', slug: 'accessibility', count: 9  },
        { id: 'tag-2', label: 'performance',   slug: 'performance',   count: 5  },
        { id: 'tag-3', label: 'typography',    slug: 'typography',    count: 11 },
        { id: 'tag-4', label: 'tokens',        slug: 'tokens',        count: 3  },
      ],
    },
  ],
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof FilterBar> = {
  title: 'Patterns/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  argTypes: {
    filterModel: {
      control: { type: 'object' },
      description:
        'FilterModel — { facets: FilterFacet[] }. Each facet is { id, label, options: FilterOption[] }; each option is { id, label, slug?, count, colorHex? }. Renders nothing when null or facets is empty.',
    },
    activeFilters: {
      control: { type: 'object' },
      description:
        'Record<facetId, string[]>. Every facet is multi-select (checkboxes, not radios) — a facet\'s array can hold more than one selected value at a time.',
    },
    onFilterChange: { table: { disable: true } },
    onClearAll: { table: { disable: true } },
  },
  parameters: {
    chromatic: { disableSnapshot: false },
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '280px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

// ─── Story wrapper component (hooks require a named component) ────────────────

/** Starts with two Category options checked at once, to demonstrate multi-select on a single facet. */
function FilterBarStory() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    categories: ['engineering', 'strategy'],
    projects: ['brand-strategy'],
    tags: ['accessibility'],
  });
  const handleChange = (facetId: string, value: string, checked: boolean) => {
    setActiveFilters((prev) => {
      const current = prev[facetId] ?? [];
      return { ...prev, [facetId]: checked ? [...current, value] : current.filter((v) => v !== value) };
    });
  };
  return (
    <FilterBar
      filterModel={MOCK_FILTER_MODEL}
      activeFilters={activeFilters}
      onFilterChange={handleChange}
      onClearAll={() => setActiveFilters({})}
    />
  );
}

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Fully populated filter model — two Category options checked to show multi-select on one facet. */
export const Default: Story = { render: () => <FilterBarStory /> };

/**
 * In Drawer — simulates the mobile archive drawer context (SUG-173).
 * FilterBar fills the scrollable body of a 320px panel; footer buttons sit below.
 */
export const InDrawer: Story = {
  name: 'In Drawer (mobile archive)',
  parameters: { chromatic: { disableSnapshot: false } },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '320px',
          height: '540px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e5e5e5',
          borderRadius: '4px',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Story />
        </div>
        <div
          style={{
            borderTop: '1px solid #e5e5e5',
            padding: '12px 16px',
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #aaa',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: '#666',
            }}
          >
            Clear all
          </button>
          <button
            type="button"
            style={{
              flex: 2,
              padding: '8px 12px',
              background: 'var(--st-color-brand-primary, #e91e8c)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            Done
          </button>
        </div>
      </div>
    ),
  ],
  render: () => <FilterBarStory />,
};
