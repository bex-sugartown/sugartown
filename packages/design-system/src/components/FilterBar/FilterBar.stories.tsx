import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from './FilterBar';
import type { FilterModel } from './FilterBar';

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
  title: 'Primitives/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: {
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

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Fully populated filter model, no active filters */
export const Default: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

    const handleChange = (facetId: string, value: string, checked: boolean) => {
      setActiveFilters((prev) => {
        const current = prev[facetId] ?? [];
        return {
          ...prev,
          [facetId]: checked
            ? [...current, value]
            : current.filter((v) => v !== value),
        };
      });
    };

    const handleClear = () => setActiveFilters({});

    return (
      <FilterBar
        filterModel={MOCK_FILTER_MODEL}
        activeFilters={activeFilters}
        onFilterChange={handleChange}
        onClearAll={handleClear}
      />
    );
  },
};

/** Filter model with some pre-selected active filters */
export const WithActiveFilters: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
      projects: ['brand-strategy', 'web-platform'],
      tags: ['accessibility'],
    });

    const handleChange = (facetId: string, value: string, checked: boolean) => {
      setActiveFilters((prev) => {
        const current = prev[facetId] ?? [];
        return {
          ...prev,
          [facetId]: checked
            ? [...current, value]
            : current.filter((v) => v !== value),
        };
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
  },
};

/** Null filter model — renders nothing (null guard) */
export const EmptyModel: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        FilterBar renders nothing when filterModel is null or has no facets.
      </p>
      <FilterBar
        filterModel={null}
        activeFilters={{}}
        onFilterChange={() => {}}
        onClearAll={() => {}}
      />
      <p style={{ fontSize: '0.875rem', color: '#999' }}>(Nothing rendered above)</p>
    </div>
  ),
};

/** Single facet — minimal model */
export const SingleFacet: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
    const model: FilterModel = {
      facets: [
        {
          id: 'categories',
          label: 'Category',
          options: [
            { id: 'cat-1', label: 'Engineering', slug: 'engineering', count: 15 },
            { id: 'cat-2', label: 'Strategy',    slug: 'strategy',    count: 7  },
          ],
        },
      ],
    };
    return (
      <FilterBar
        filterModel={model}
        activeFilters={activeFilters}
        onFilterChange={(facetId, value, checked) =>
          setActiveFilters((prev) => ({
            ...prev,
            [facetId]: checked
              ? [...(prev[facetId] ?? []), value]
              : (prev[facetId] ?? []).filter((v) => v !== value),
          }))
        }
        onClearAll={() => setActiveFilters({})}
      />
    );
  },
};
