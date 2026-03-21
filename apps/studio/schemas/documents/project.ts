import {defineType, defineField, defineArrayMember} from 'sanity'
import {RocketIcon} from '@sanity/icons'

/**
 * Project Document
 *
 * Project registry - controlled vocabulary for work tracking and KPI measurement.
 * Links content (nodes, articles, case studies) to active projects.
 *
 * Tabs: Basics (ID, name, slug, status, priority, color) | Profile (description,
 *       categories, tags, KPIs) | SEO
 */
export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: RocketIcon,

  groups: [
    {name: 'basics',  title: 'Basics',  default: true},
    {name: 'profile', title: 'Profile'},
    {name: 'seo',     title: 'SEO'},
  ],

  fields: [
    // ── Basics ────────────────────────────────────────────────────────────────
    defineField({
      name: 'projectId',
      title: 'Project ID',
      type: 'string',
      description: 'Unique identifier in format PROJ-XXX (e.g., PROJ-001)',
      group: 'basics',
      validation: (Rule) =>
        Rule.required()
          .custom(async (value, context) => {
            if (!value) return true
            if (!/^PROJ-\d{3}$/.test(value)) {
              return 'Project ID must follow format PROJ-XXX (e.g., PROJ-001)'
            }
            const {document, getClient} = context
            const client = getClient({apiVersion: '2024-01-01'})
            const id = document._id.replace(/^drafts\./, '')
            const query = '*[_type == "project" && projectId == $projectId && !(_id in [$id, $draftId])][0]'
            const params = {projectId: value, id, draftId: `drafts.${id}`}
            const existing = await client.fetch(query, params)
            return existing ? 'This Project ID is already in use' : true
          })
    }),
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'string',
      description: 'Human-readable project name',
      group: 'basics',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Project name is required and must be under 100 characters')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-safe identifier. Auto-generated from name — click Generate.',
      group: 'basics',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Phase of development',
      group: 'basics',
      options: {
        list: [
          {title: '💭 Dreaming',   value: 'dreaming'},
          {title: '🎨 Designing',  value: 'designing'},
          {title: '⚙️ Developing', value: 'developing'},
          {title: '🧪 Testing',    value: 'testing'},
          {title: '🚀 Deploying',  value: 'deploying'},
          {title: '🔄 Iterating',  value: 'iterating'}
        ],
        layout: 'radio'
      },
      initialValue: 'dreaming',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      description: 'Priority ranking (1 = highest, 5 = lowest)',
      group: 'basics',
      options: {
        list: [
          {title: '🔴 Critical (1)', value: 1},
          {title: '🟠 High (2)',     value: 2},
          {title: '🟡 Medium (3)',   value: 3},
          {title: '🟢 Low (4)',      value: 4},
          {title: '⚪ Backlog (5)',  value: 5}
        ]
      },
      validation: (Rule) =>
        Rule.min(1)
          .max(5)
          .integer()
          .warning('Priority should be between 1 (critical) and 5 (backlog)')
    }),
    defineField({
      name: 'colorHex',
      title: 'Brand Color',
      type: 'color',
      description: 'Color for knowledge graph visualization and archive filter chips.',
      group: 'basics',
      options: {
        disableAlpha: true,
        colorList: [
          {title: 'Sugartown Pink',  value: '#FF247D'},
          {title: 'Maroon',          value: '#b91c68'},
          {title: 'Lime',            value: '#D1FF1D'},
          {title: 'Seafoam',         value: '#2BD4AA'},
          {title: 'Midnight',        value: '#0D1226'},
          {title: 'Charcoal',        value: '#1e1e1e'},
          {title: 'Softgrey',        value: '#94A3B8'},
          {title: 'Blue',            value: '#0066CC'},
        ],
      },
    }),

    // ── Profile ───────────────────────────────────────────────────────────────
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief overview of the project goals and scope',
      group: 'profile',
      rows: 4,
      validation: (Rule) => Rule.max(500)
    }),
    defineField({
      name: 'tools',
      title: 'Tools & Platforms',
      type: 'array',
      description: 'Tools, platforms, or technologies used in this project',
      group: 'profile',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tool'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Category classification for this project',
      group: 'profile',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}]
        })
      ]
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Thematic tags for this project',
      group: 'profile',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}]
        })
      ]
    }),
    defineField({
      name: 'kpis',
      title: 'Key Performance Indicators',
      type: 'array',
      description: 'Measurable goals and current progress',
      group: 'profile',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'kpi',
          title: 'KPI',
          fields: [
            defineField({
              name: 'metric',
              title: 'Metric',
              type: 'string',
              description: 'What are you measuring? (e.g., "Monthly Active Users")',
              validation: (Rule) => Rule.required().max(100)
            }),
            defineField({
              name: 'target',
              title: 'Target',
              type: 'string',
              description: 'Goal value (e.g., "1,000 users")',
              validation: (Rule) => Rule.max(50)
            }),
            defineField({
              name: 'current',
              title: 'Current',
              type: 'string',
              description: 'Current value (e.g., "742 users")',
              validation: (Rule) => Rule.max(50)
            })
          ],
          preview: {
            select: {
              metric:  'metric',
              current: 'current',
              target:  'target'
            },
            prepare({metric, current, target}) {
              return {
                title:    metric || 'Untitled KPI',
                subtitle: `${current || '—'} / ${target || '—'}`
              }
            }
          }
        })
      ]
    }),

    // ── SEO ───────────────────────────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
      group: 'seo',
    }),
  ],

  preview: {
    select: {
      projectId: 'projectId',
      name:      'name',
      status:    'status',
      priority:  'priority',
      colorHex:  'colorHex'
    },
    prepare({projectId, name, status, priority, colorHex}) {
      const statusLabels = {
        dreaming:   '💭 Dreaming',
        designing:  '🎨 Designing',
        developing: '⚙️ Developing',
        testing:    '🧪 Testing',
        deploying:  '🚀 Deploying',
        iterating:  '🔄 Iterating',
        // legacy values — kept so existing docs don't show blank in preview
        planning: '📋 Planning (legacy)',
        active:   '🚀 Active (legacy)',
        archived: '📦 Archived (legacy)',
      }
      const priorityLabels = {
        1: '🔴',
        2: '🟠',
        3: '🟡',
        4: '🟢',
        5: '⚪'
      }
      const colorSuffix = colorHex?.hex ? ` • ${colorHex.hex}` : ''
      return {
        title:    name || 'Untitled Project',
        subtitle: `${projectId || 'No ID'} • ${statusLabels[status as keyof typeof statusLabels] || status}${colorSuffix}`,
        description: priority ? `Priority: ${priorityLabels[priority as keyof typeof priorityLabels]}` : undefined
      }
    }
  },

  orderings: [
    {
      title: 'Priority (High to Low)',
      name:  'priorityAsc',
      by:    [{field: 'priority', direction: 'asc'}]
    },
    {
      title: 'Project ID',
      name:  'projectIdAsc',
      by:    [{field: 'projectId', direction: 'asc'}]
    },
    {
      title: 'Name (A-Z)',
      name:  'nameAsc',
      by:    [{field: 'name', direction: 'asc'}]
    }
  ]
})
