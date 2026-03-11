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
    {name: 'seo', title: 'SEO'},
    {name: 'migration', title: 'Migration'},
    {name: 'legacy', title: 'Legacy'},
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
      name: 'sections',
      title: 'Article Sections',
      type: 'array',
      description: 'Build your article layout with flexible sections (hero, text, gallery, CTA, raw HTML)',
      group: 'content',
      of: [
        defineArrayMember({type: 'heroSection'}),
        defineArrayMember({type: 'textSection'}),
        defineArrayMember({type: 'imageGallery'}),
        defineArrayMember({type: 'ctaSection'}),
        defineArrayMember({type: 'htmlSection'}),
        defineArrayMember({type: 'cardBuilderSection'}),
        defineArrayMember({type: 'calloutSection'})
      ]
    }),
    defineField({
      name: 'content',
      title: 'Content (Legacy)',
      type: 'array',
      description: '⚠️ Deprecated — use Article Sections → Text Section instead. This field renders with different typography than sections. Existing content still displays but new content should use the sections array.',
      group: 'legacy',
      deprecated: {reason: 'Use a Text Section in the Article Sections array instead. Sections provide consistent typography and spacing.'},
      of: standardPortableText
    }),

    // METADATA GROUP — dates, authors, taxonomy connections all in one tab
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
      group: 'metadata',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      description: 'Select existing persons or create new — the canonical author field.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'person'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    // STATUS REMOVED — editorial lifecycle (draft/published/archived) is handled
    // natively by Sanity's document state + perspective:'published' on the web client.
    // Semantic status fields are kept on node (evolution) and project (lifecycle) only.

    defineField({
      name: 'tools',
      title: 'Tools & Platforms',
      type: 'array',
      description: 'Tools, platforms, or technologies directly featured in this article. Select from published tool documents. Use tags for conceptual themes.',
      group: 'metadata',
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
      // Guided multiplicity: 1–2 categories strongly preferred. Warning fires at 3+.
      // Do not change to a single-reference — multi-category is intentional.
      description: 'Article categories. Aim for 1–2; a warning appears at 3 or more.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}]
        })
      ],
      validation: (Rule) =>
        Rule.max(2)
          .warning('Prefer 1–2 categories per article for clarity. Add more only if genuinely cross-domain.')
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      // Tags must be references to published tag documents — no freeform strings.
      // The controlled vocabulary lives in the tag document collection.
      // See docs/taxonomy/controlled-vocabulary.md for the canonical list.
      description: 'Conceptual and thematic tags from the controlled vocabulary. Do not create new tags without editorial review.',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'tag'}]
        })
      ],
      validation: (Rule) => Rule.unique()
    }),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      description: 'Canonical project taxonomy field. Prefer this over "Related Projects".',
      group: 'metadata',
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
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),
    // Legacy plain-text author — hidden, data preserved for audit
    defineField({
      name: 'author',
      title: 'Author (Legacy)',
      type: 'string',
      description: 'Legacy plain-text author. Superseded by "Authors" (person references). Hidden from Studio.',
      group: 'metadata',
      hidden: true,
      validation: (Rule) => Rule.max(100)
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
    },
    prepare({title, date}) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'
      return {
        title: title || 'Untitled Article',
        subtitle: formattedDate,
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
