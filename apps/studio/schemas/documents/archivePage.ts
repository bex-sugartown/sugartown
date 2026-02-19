import {defineType, defineField, defineArrayMember} from 'sanity'
import {MasterDetailIcon} from '@sanity/icons'

/**
 * Archive Page Document - Listing/Index Pages
 *
 * Configurable listing page for content collections (e.g., /case-studies/, /knowledge-graph/).
 * Supports pinned featured items, taxonomy pre-filtering, and a configurable frontend filter sidebar.
 *
 * Key Features:
 * - Auto-sort with ability to pin featured items at top
 * - Editor-configured taxonomy pre-filtering (categories, tags, projects)
 * - Frontend filter sidebar configuration (exposed to website visitors)
 * - Flexible display styles (text, card, card+excerpt)
 * - Pagination support
 * - Embedded SEO metadata with siteSettings fallback
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GROQ Query Examples for Frontend
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. Fetch Archive Page by Slug:
 *
 * const archivePage = await client.fetch(`
 *   *[_type == "archivePage" && slug.current == $slug][0] {
 *     title,
 *     description,
 *     hero,
 *     contentTypes,
 *     featuredItems[]-> {
 *       _id,
 *       _type,
 *       title,
 *       slug,
 *       publishedAt,
 *       featuredImage,
 *       excerpt
 *     },
 *     taxonomyFilters {
 *       categories[]->{ _id, title, slug },
 *       tags[]->{ _id, title, slug },
 *       projects[]->{ _id, title, slug }
 *     },
 *     enableFrontendFilters,
 *     frontendFilters,
 *     listStyle,
 *     sortBy,
 *     itemsPerPage,
 *     showPagination,
 *     seo
 *   }
 * `, { slug: '/case-studies/' })
 *
 *
 * 2. Query Filtered Content (with frontend filters applied):
 *
 * const content = await client.fetch(`
 *   *[
 *     _type in $contentTypes
 *     && defined(slug.current)
 *     ${categoryFilter ? '&& references($categoryId)' : ''}
 *     ${tagFilter ? '&& references($tagId)' : ''}
 *     ${searchTerm ? '&& [title, excerpt] match $searchTerm' : ''}
 *   ] | order(publishedAt desc) [0...$limit] {
 *     _id,
 *     _type,
 *     title,
 *     slug,
 *     publishedAt,
 *     featuredImage,
 *     excerpt,
 *     categories[]->{ title, slug },
 *     tags[]->{ title, slug }
 *   }
 * `, {
 *   contentTypes: ['caseStudy', 'post', 'node'],
 *   categoryId: 'category-id-here',
 *   tagId: 'tag-id-here',
 *   searchTerm: 'ai*',
 *   limit: 12
 * })
 *
 *
 * 3. Get All Available Filters for Sidebar:
 *
 * const filters = await client.fetch(`{
 *   "categories": *[_type == "category"] | order(title asc) {
 *     _id,
 *     title,
 *     slug,
 *     "count": count(*[_type in $contentTypes && references(^._id)])
 *   }[count > 0],
 *   "tags": *[_type == "tag"] | order(title asc) {
 *     _id,
 *     title,
 *     slug,
 *     "count": count(*[_type in $contentTypes && references(^._id)])
 *   }[count > 0]
 * }`, { contentTypes: ['caseStudy', 'post', 'node'] })
 *
 *
 * 4. Example: Query all Nodes for Knowledge Graph archive page:
 *
 * const nodes = await client.fetch(`
 *   *[_type == "node" && defined(slug.current)] | order(publishedAt desc) {
 *     _id,
 *     title,
 *     slug,
 *     publishedAt,
 *     excerpt,
 *     categories[]->{ title, slug },
 *     tags[]->{ title, slug },
 *     relatedProjects[]->{ title, slug }
 *   }
 * `)
 */
export default defineType({
  name: 'archivePage',
  title: 'Archive Page',
  type: 'document',
  icon: MasterDetailIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'filtering', title: 'Filtering'},
    {name: 'display', title: 'Display'},
    {name: 'seo', title: 'SEO'}
  ],
  fields: [
    // ════════════════════════════════════════════════════════════════════════
    // CONTENT GROUP — Title, slug, description, hero
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'title',
      title: 'Archive Title',
      type: 'string',
      description: 'e.g., "Case Studies" or "Knowledge Graph"',
      group: 'content',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Title is required and must be under 100 characters')
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'The URL path segment — no slashes (e.g., case-studies, knowledge-graph, articles). Must match the canonical route.',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) =>
          input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
      },
      validation: (Rule) =>
        Rule.required().custom((slug) => {
          if (!slug?.current) return 'Slug is required'
          const pattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/
          return pattern.test(slug.current)
            ? true
            : 'Slug must contain only lowercase letters, numbers, and hyphens — no leading or trailing slashes (e.g., case-studies)'
        })
    }),
    defineField({
      name: 'description',
      title: 'Archive Description',
      type: 'text',
      description: 'Intro text shown at top of archive page',
      group: 'content',
      rows: 3,
      validation: (Rule) =>
        Rule.max(500)
          .warning('Keep descriptions concise')
    }),

    // Hero Section
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      description: 'Optional hero banner at the top of the archive page',
      group: 'content',
      fields: [
        defineField({
          name: 'heading',
          title: 'Hero Heading',
          type: 'string',
          description: 'Optional. Overrides archive title in hero'
        }),
        defineField({
          name: 'subheading',
          title: 'Subheading',
          type: 'text',
          rows: 2
        }),
        defineField({
          name: 'backgroundImage',
          title: 'Background Image',
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Describe the image for accessibility'
            })
          ]
        }),
        defineField({
          name: 'content',
          title: 'Additional Content',
          type: 'array',
          description: 'Rich text content below hero heading',
          of: [
            defineArrayMember({type: 'block'}),
            defineArrayMember({
              type: 'image',
              options: {hotspot: true},
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string'
                }),
                defineField({
                  name: 'caption',
                  title: 'Caption',
                  type: 'string'
                })
              ]
            })
          ]
        })
      ]
    }),

    // ════════════════════════════════════════════════════════════════════════
    // FILTERING GROUP — Content types, featured items, taxonomy, date range,
    //                    frontend filter sidebar config
    // ════════════════════════════════════════════════════════════════════════

    // Content Type Selection
    defineField({
      name: 'contentTypes',
      title: 'Content Types to Display',
      type: 'array',
      description: 'Select which content types appear in this archive',
      group: 'filtering',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: 'Case Studies', value: 'caseStudy'},
          {title: 'Blog Posts', value: 'post'},
          {title: 'Projects', value: 'project'},
          {title: 'Nodes (Knowledge Graph)', value: 'node'}
        ]
      },
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Select at least one content type')
    }),

    // Featured Items (Pinned to top)
    defineField({
      name: 'featuredItems',
      title: 'Featured Items',
      type: 'array',
      description: 'Pin specific items to appear first, before auto-sorted content',
      group: 'filtering',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [
            {type: 'caseStudy'},
            {type: 'post'},
            {type: 'project'},
            {type: 'node'}
          ]
        })
      ],
      validation: (Rule) =>
        Rule.max(6)
          .warning('Consider limiting to 6 featured items for a clean layout')
    }),

    // Taxonomy Filters (Editor pre-filtering)
    defineField({
      name: 'taxonomyFilters',
      title: 'Default Taxonomy Filters',
      type: 'object',
      description: 'Pre-filter content by taxonomy (editors only). Leave empty to show all.',
      group: 'filtering',
      fields: [
        defineField({
          name: 'categories',
          title: 'Filter by Categories',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})]
        }),
        defineField({
          name: 'tags',
          title: 'Filter by Tags',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})]
        }),
        defineField({
          name: 'projects',
          title: 'Filter by Projects',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'project'}]})]
        })
      ]
    }),

    // Date Range Filter (Optional)
    defineField({
      name: 'dateRange',
      title: 'Date Range Filter',
      type: 'object',
      description: 'Optional. Limit content to specific date range',
      group: 'filtering',
      fields: [
        defineField({
          name: 'startDate',
          title: 'From Date',
          type: 'date'
        }),
        defineField({
          name: 'endDate',
          title: 'To Date',
          type: 'date'
        })
      ],
      validation: (Rule) =>
        Rule.custom((dateRange) => {
          if (!dateRange?.startDate || !dateRange?.endDate) return true
          if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
            return 'End date must be after start date'
          }
          return true
        })
    }),

    // ════════════════════════════════════════════════════════════════════════
    // FILTER CONFIG (Stage 4: Taxonomy Relationship Architecture)
    // ════════════════════════════════════════════════════════════════════════
    // filterConfig replaces the boolean-flag pattern of frontendFilters with a
    // structured, ordered, per-facet configuration. The FilterModel builder reads
    // this at runtime to produce a stable JSON model for the frontend filter UI.
    //
    // Facet options (the selectable values) are DERIVED from content usage at
    // query time — they are NOT entered here manually.
    defineField({
      name: 'filterConfig',
      title: 'Filter Configuration',
      type: 'object',
      description: 'Configure which taxonomy facets appear in the filter sidebar, their order, and selection behaviour',
      group: 'filtering',
      fields: [
        defineField({
          name: 'facets',
          title: 'Facets',
          type: 'array',
          description: 'Ordered list of facets. Add, remove, or reorder. Options are derived from content — not entered here.',
          of: [
            defineArrayMember({
              type: 'object',
              title: 'Facet',
              fields: [
                defineField({
                  name: 'facet',
                  title: 'Facet',
                  type: 'string',
                  description: 'Which taxonomy dimension this facet represents',
                  options: {
                    list: [
                      {title: 'Author (person)', value: 'author'},
                      {title: 'Project', value: 'project'},
                      {title: 'Category', value: 'category'},
                      {title: 'Tag', value: 'tag'},
                    ]
                  },
                  validation: (Rule) => Rule.required()
                }),
                defineField({
                  name: 'label',
                  title: 'Label Override',
                  type: 'string',
                  description: 'Optional: override the default facet label (e.g., "Topic" instead of "Category")',
                  validation: (Rule) => Rule.max(50)
                }),
                defineField({
                  name: 'enabled',
                  title: 'Enabled',
                  type: 'boolean',
                  description: 'Show this facet in the filter sidebar',
                  initialValue: true
                }),
                defineField({
                  name: 'order',
                  title: 'Order',
                  type: 'number',
                  description: 'Display position (1 = first). Facets are sorted by this value.',
                  initialValue: 1
                }),
                defineField({
                  name: 'selection',
                  title: 'Selection Mode',
                  type: 'string',
                  description: 'Single: selecting one option deselects others. Multi: multiple options can be active at once.',
                  options: {
                    list: [
                      {title: 'Single select', value: 'single'},
                      {title: 'Multi select', value: 'multi'},
                    ],
                    layout: 'radio'
                  },
                  initialValue: 'multi'
                }),
                defineField({
                  name: 'defaultSelectedSlugs',
                  title: 'Default Selected Slugs',
                  type: 'array',
                  description: 'Optional: slugs of options pre-selected when the archive loads. Leave empty for no default.',
                  of: [{type: 'string'}]
                })
              ],
              preview: {
                select: {
                  facet: 'facet',
                  label: 'label',
                  enabled: 'enabled',
                  order: 'order',
                  selection: 'selection',
                },
                prepare({facet, label, enabled, order, selection}) {
                  const facetLabels: Record<string, string> = {
                    author: 'Author',
                    project: 'Project',
                    category: 'Category',
                    tag: 'Tag',
                  }
                  const displayLabel = label || facetLabels[facet] || facet
                  const status = enabled === false ? ' (disabled)' : ''
                  return {
                    title: `${order ?? '?'}. ${displayLabel}${status}`,
                    subtitle: `${selection || 'multi'}-select`,
                  }
                }
              }
            })
          ]
        })
      ]
    }),

    // Frontend Filter Sidebar Toggle
    defineField({
      name: 'enableFrontendFilters',
      title: 'Enable Frontend Filters',
      type: 'boolean',
      description: 'Show filter sidebar for website visitors',
      group: 'filtering',
      initialValue: true
    }),

    // Frontend Filter Sidebar Configuration
    defineField({
      name: 'frontendFilters',
      title: 'Frontend Filter Options',
      type: 'object',
      description: 'Configure which filters visitors can use on the website',
      group: 'filtering',
      hidden: ({parent}) => !parent?.enableFrontendFilters,
      fields: [
        defineField({
          name: 'showContentTypeFilter',
          title: 'Show Content Type Filter',
          type: 'boolean',
          description: 'Let users filter by case study, blog post, node, etc.',
          initialValue: true
        }),
        defineField({
          name: 'showCategoryFilter',
          title: 'Show Category Filter',
          type: 'boolean',
          initialValue: true
        }),
        defineField({
          name: 'showTagFilter',
          title: 'Show Tag Filter',
          type: 'boolean',
          initialValue: true
        }),
        defineField({
          name: 'showProjectFilter',
          title: 'Show Project Filter',
          type: 'boolean',
          initialValue: false
        }),
        defineField({
          name: 'showDateFilter',
          title: 'Show Date/Year Filter',
          type: 'boolean',
          description: 'Let users filter by publication date',
          initialValue: false
        }),
        defineField({
          name: 'showSearchBox',
          title: 'Show Search Box',
          type: 'boolean',
          description: 'Let users search within archive',
          initialValue: true
        })
      ]
    }),

    // ════════════════════════════════════════════════════════════════════════
    // DISPLAY GROUP — List style, sort order, pagination
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'listStyle',
      title: 'List Display Style',
      type: 'string',
      group: 'display',
      options: {
        list: [
          {title: 'Text Only', value: 'text-only'},
          {title: 'Card with Image', value: 'card-with-image'},
          {title: 'Card with Image + Excerpt', value: 'card-with-image-excerpt'}
        ],
        layout: 'radio'
      },
      initialValue: 'card-with-image-excerpt'
    }),
    defineField({
      name: 'sortBy',
      title: 'Sort Order',
      type: 'string',
      description: 'How to order content (after featured items)',
      group: 'display',
      options: {
        list: [
          {title: 'Newest First', value: 'publishedAt-desc'},
          {title: 'Oldest First', value: 'publishedAt-asc'},
          {title: 'Title A-Z', value: 'title-asc'},
          {title: 'Title Z-A', value: 'title-desc'}
        ]
      },
      initialValue: 'publishedAt-desc'
    }),
    defineField({
      name: 'itemsPerPage',
      title: 'Items Per Page',
      type: 'number',
      description: 'Number of items to show before pagination',
      group: 'display',
      validation: (Rule) =>
        Rule.required()
          .min(6)
          .max(50)
          .error('Items per page must be between 6 and 50'),
      initialValue: 12
    }),
    defineField({
      name: 'showPagination',
      title: 'Enable Pagination',
      type: 'boolean',
      group: 'display',
      initialValue: true
    }),

    // ════════════════════════════════════════════════════════════════════════
    // SEO GROUP — Embedded SEO metadata
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'seo',
      title: 'SEO & Social Sharing',
      type: 'seoMetadata',
      description: 'Leave fields empty to use site defaults',
      group: 'seo'
    })
  ],

  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      contentTypes: 'contentTypes'
    },
    prepare({title, slug, contentTypes}) {
      const typeLabels: Record<string, string> = {
        caseStudy: 'Case Studies',
        post: 'Blog Posts',
        project: 'Projects',
        node: 'Nodes'
      }
      const types = contentTypes?.map(
        (t: string) => typeLabels[t] || t
      ).join(', ') || 'No content types'

      return {
        title: title || 'Untitled Archive',
        subtitle: `${slug || '/???/'} • ${types}`
      }
    }
  },

  orderings: [
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}]
    },
    {
      title: 'Title (Z-A)',
      name: 'titleDesc',
      by: [{field: 'title', direction: 'desc'}]
    }
  ]
})
