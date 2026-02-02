import {defineType, defineField, defineArrayMember} from 'sanity'
import {CaseIcon} from '@sanity/icons'

/**
 * Case Study Document - Portfolio Work
 *
 * Showcase portfolio projects and client work with flexible section-based layout
 * Similar to Page but with additional project-specific metadata
 */
export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  icon: CaseIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'projectDetails', title: 'Project Details'},
    {name: 'connections', title: 'Connections'}
  ],
  fields: [
    // CONTENT GROUP
    defineField({
      name: 'title',
      title: 'Case Study Title',
      type: 'string',
      description: 'The project name or case study title',
      group: 'content',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Title is required and must be under 100 characters')
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from title)',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) =>
        Rule.required()
          .error('Slug is required. Click "Generate" to create from title.')
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Brief project summary for portfolio listings',
      group: 'content',
      rows: 3,
      validation: (Rule) =>
        Rule.max(300)
          .warning('Keep excerpts concise - under 300 characters recommended')
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'richImage',
      description: 'Main project image (shown in portfolio listings)',
      group: 'content'
    }),
    defineField({
      name: 'sections',
      title: 'Case Study Sections',
      type: 'array',
      description: 'Build your case study with flexible sections',
      group: 'content',
      of: [
        defineArrayMember({type: 'heroSection'}),
        defineArrayMember({type: 'textSection'}),
        defineArrayMember({type: 'imageGallery'}),
        defineArrayMember({type: 'ctaSection'})
      ]
    }),

    // PROJECT DETAILS GROUP
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Client or company name',
      group: 'projectDetails',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'role',
      title: 'Your Role',
      type: 'string',
      description: 'What was your role on this project? (e.g., "Lead Designer", "Full Stack Developer")',
      group: 'projectDetails',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'dateRange',
      title: 'Project Date Range',
      type: 'object',
      description: 'When did this project take place?',
      group: 'projectDetails',
      fields: [
        defineField({
          name: 'startDate',
          title: 'Start Date',
          type: 'date',
          options: {
            dateFormat: 'YYYY-MM-DD'
          }
        }),
        defineField({
          name: 'endDate',
          title: 'End Date',
          type: 'date',
          description: 'Leave blank if ongoing',
          options: {
            dateFormat: 'YYYY-MM-DD'
          }
        })
      ],
      preview: {
        select: {
          start: 'startDate',
          end: 'endDate'
        },
        prepare({start, end}) {
          if (!start) return {title: 'No dates set'}
          const startFormatted = new Date(start).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          })
          const endFormatted = end
            ? new Date(end).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              })
            : 'Present'
          return {
            title: `${startFormatted} – ${endFormatted}`
          }
        }
      }
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When was this case study published?',
      group: 'projectDetails',
      validation: (Rule) => Rule.required().error('Published date is required'),
      initialValue: () => new Date().toISOString()
    }),

    // CONNECTIONS GROUP
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Case study categories (e.g., "Web Design", "Branding")',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}]
        })
      ],
      validation: (Rule) =>
        Rule.max(3)
          .warning('Consider using 1-3 categories for clarity')
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Skills and technologies used',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}]
        })
      ]
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Related Projects',
      type: 'array',
      description: 'Link this case study to active projects',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      client: 'client',
      role: 'role',
      media: 'featuredImage.asset',
      startDate: 'dateRange.startDate'
    },
    prepare({title, client, role, media, startDate}) {
      const year = startDate ? new Date(startDate).getFullYear() : null

      return {
        title: title || 'Untitled Case Study',
        subtitle: [client, role, year].filter(Boolean).join(' • '),
        media: media
      }
    }
  },
  orderings: [
    {
      title: 'Published Date (Newest First)',
      name: 'publishedDesc',
      by: [{field: 'publishedAt', direction: 'desc'}]
    },
    {
      title: 'Project Start (Newest First)',
      name: 'startDateDesc',
      by: [{field: 'dateRange.startDate', direction: 'desc'}]
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}]
    }
  ]
})
