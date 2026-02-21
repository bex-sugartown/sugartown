import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {standardPortableText} from '../objects/portableTextConfig'

/**
 * Article Document
 *
 * Standard article content type with rich content support.
 * Previously named "post" / "Blog Post" — renamed in Stage 6 for semantic clarity.
 * Sugartown is not a feed; it is a structured content system.
 *
 * SEO: uses the shared `seoMetadata` object (Schema 1: SEO Metadata).
 */
export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'metadata', title: 'Metadata'},
    {name: 'connections', title: 'Connections'},
    {name: 'seo', title: 'SEO'},
    {name: 'migration', title: 'Migration'},
  ],
  fields: [
    // CONTENT GROUP
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The article title',
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
      description: 'Brief summary for article listings and social sharing',
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
      description: 'Main image for the article (shown in listings and headers)',
      group: 'content'
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description: 'Full article content',
      group: 'content',
      of: standardPortableText
    }),

    // METADATA GROUP
    defineField({
      name: 'author',
      title: 'Author (Legacy)',
      type: 'string',
      // Stage 5: hidden from Studio — use authors[] (person references) instead.
      // Data preserved in Sanity for migration. TODO Stage 7+: remove after migration.
      description: 'Legacy plain-text author. Superseded by "Authors" (person references). Hidden from Studio.',
      group: 'metadata',
      hidden: true,
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When was this article published?',
      group: 'metadata',
      validation: (Rule) => Rule.required().error('Published date is required'),
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'Last significant update to this article',
      group: 'metadata'
    }),

    // CONNECTIONS GROUP
    // Stage 4: Canonical taxonomy primitives — authors, categories, tags, projects
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      description: 'Select existing persons or create new — the canonical author field.',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'person'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Article categories',
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
      description: 'Article tags',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}]
        })
      ]
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      description: 'Canonical project taxonomy field. Prefer this over "Related Projects".',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),
    defineField({
      name: 'relatedProjects',
      title: 'Related Projects (Legacy)',
      type: 'array',
      description: 'Legacy field — kept for backward compatibility. Prefer "Projects" above.',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),

    // SEO GROUP — shared seoMetadata object (Schema 1: SEO Metadata)
    // Identical across page / article / caseStudy / node for Studio UI consistency.
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
      group: 'seo',
    }),

    // MIGRATION GROUP — populated by migrate:import, read-only in Studio
    defineField({
      name: 'legacySource',
      title: 'Legacy Source',
      type: 'legacySource',
      group: 'migration',
      description: 'Migration metadata from WordPress. Read-only — set by import script.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publishedAt',
      media: 'featuredImage.asset'
    },
    prepare({title, date, media}) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'
      return {
        title: title || 'Untitled Article',
        subtitle: formattedDate,
        media
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
      title: 'Published Date (Oldest First)',
      name: 'publishedAsc',
      by: [{field: 'publishedAt', direction: 'asc'}]
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}]
    }
  ]
})
