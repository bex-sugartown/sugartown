import {defineType, defineField, defineArrayMember} from 'sanity'
import {RocketIcon} from '@sanity/icons'

/**
 * Project Document
 *
 * Project registry - controlled vocabulary for work tracking and KPI measurement
 * Links content (nodes, posts, case studies) to active projects
 */
export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'projectId',
      title: 'Project ID',
      type: 'string',
      description: 'Unique identifier in format PROJ-XXX (e.g., PROJ-001)',
      validation: (Rule) =>
        Rule.required()
          .custom(async (value, context) => {
            if (!value) return true
            // Format check
            if (!/^PROJ-\d{3}$/.test(value)) {
              return 'Project ID must follow format PROJ-XXX (e.g., PROJ-001)'
            }
            // Uniqueness check
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
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Project name is required and must be under 100 characters')
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief overview of the project goals and scope',
      rows: 4,
      validation: (Rule) => Rule.max(500)
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Current project lifecycle stage',
      options: {
        list: [
          {title: '📋 Planning', value: 'planning'},
          {title: '🚀 Active', value: 'active'},
          {title: '📦 Archived', value: 'archived'}
        ],
        layout: 'radio'
      },
      initialValue: 'planning',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      description: 'Priority ranking (1 = highest, 5 = lowest)',
      options: {
        list: [
          {title: '🔴 Critical (1)', value: 1},
          {title: '🟠 High (2)', value: 2},
          {title: '🟡 Medium (3)', value: 3},
          {title: '🟢 Low (4)', value: 4},
          {title: '⚪ Backlog (5)', value: 5}
        ]
      },
      validation: (Rule) =>
        Rule.min(1)
          .max(5)
          .integer()
          .warning('Priority should be between 1 (critical) and 5 (backlog)')
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}]
        })
      ],
      description: 'Thematic tags for this project'
    }),
    defineField({
      name: 'colorHex',
      title: 'Color (Hex)',
      type: 'string',
      description: 'Hex color used for knowledge graph visualization and archive filter chips (e.g., #0099FF).',
      validation: (Rule) =>
        Rule.regex(/^#([0-9a-fA-F]{6})$/, {
          name: 'hex color',
          invert: false,
        }).warning('Use a 6-digit hex color like #0099FF.')
    }),
    defineField({
      name: 'kpis',
      title: 'Key Performance Indicators',
      type: 'array',
      description: 'Measurable goals and current progress',
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
              metric: 'metric',
              current: 'current',
              target: 'target'
            },
            prepare({metric, current, target}) {
              return {
                title: metric || 'Untitled KPI',
                subtitle: `${current || '—'} / ${target || '—'}`
              }
            }
          }
        })
      ]
    })
  ],
  preview: {
    select: {
      projectId: 'projectId',
      name: 'name',
      status: 'status',
      priority: 'priority',
      colorHex: 'colorHex'
    },
    prepare({projectId, name, status, priority, colorHex}) {
      const statusLabels = {
        planning: '📋 Planning',
        active: '🚀 Active',
        archived: '📦 Archived'
      }
      const priorityLabels = {
        1: '🔴',
        2: '🟠',
        3: '🟡',
        4: '🟢',
        5: '⚪'
      }
      const colorSuffix = colorHex ? ` • ${colorHex}` : ''
      return {
        title: name || 'Untitled Project',
        subtitle: `${projectId || 'No ID'} • ${statusLabels[status as keyof typeof statusLabels] || status}${colorSuffix}`,
        description: priority ? `Priority: ${priorityLabels[priority as keyof typeof priorityLabels]}` : undefined
      }
    }
  },
  orderings: [
    {
      title: 'Priority (High to Low)',
      name: 'priorityAsc',
      by: [{field: 'priority', direction: 'asc'}]
    },
    {
      title: 'Project ID',
      name: 'projectIdAsc',
      by: [{field: 'projectId', direction: 'asc'}]
    },
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}]
    }
  ]
})
