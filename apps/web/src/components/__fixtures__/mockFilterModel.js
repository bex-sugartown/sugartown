/**
 * Mock filter model for Storybook stories.
 * Shape mirrors buildFilterModel() output from apps/web/src/lib/filterModel.js.
 */

export const mockFilterModel = {
  facets: [
    {
      id: 'categories',
      label: 'Category',
      type: 'reference',
      options: [
        { id: 'cat-1', label: 'Content Strategy', slug: 'content-strategy', count: 3 },
        { id: 'cat-2', label: 'Design Engineering', slug: 'design-engineering', count: 5 },
        { id: 'cat-3', label: 'UX', slug: 'ux', count: 2 },
        { id: 'cat-4', label: 'AI', slug: 'ai', count: 4 },
      ],
    },
    {
      id: 'tags',
      label: 'Tag',
      type: 'reference',
      options: [
        { id: 'tag-1', label: 'CMS', slug: 'cms', count: 2 },
        { id: 'tag-2', label: 'Design Systems', slug: 'design-systems', count: 4 },
        { id: 'tag-3', label: 'CSS', slug: 'css', count: 3 },
        { id: 'tag-5', label: 'Typography', slug: 'typography', count: 1 },
        { id: 'tag-6', label: 'Workflow', slug: 'workflow', count: 2 },
      ],
    },
  ],
}

export const mockActiveFilters = {}

export const mockActiveFiltersWithSelection = {
  categories: ['design-engineering'],
}
