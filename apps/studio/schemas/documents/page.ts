import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
// Stage 4: taxonomy references added to page — same primitives as post/caseStudy/node

/**
 * Page Document - Flexible Page Builder
 *
 * Static pages with modular section-based layout.
 * Supports hierarchical page structures (parent-child relationships).
 *
 * SEO: uses the shared `seoMetadata` object (Schema 1: SEO Metadata).
 * All four top-level content types (page, post, caseStudy, node) use the
 * same `seo` field of type `seoMetadata` for a consistent Studio UI and
 * a consistent GROQ projection shape.
 *
 * Migration note: previously `seo` was an inline object with
 * metaTitle / metaDescription / ogImage. Those sub-field names no longer
 * exist in this schema. Existing stored values are not erased — they are
 * simply not projected. No Sanity data migration required at this stage;
 * content teams can re-enter SEO values via Studio.
 */
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'metadata', title: 'Metadata'},
    {name: 'seo', title: 'SEO'},
    {name: 'migration', title: 'Migration'},
  ],
  fields: [
    // CONTENT GROUP
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference title — used for SEO <title>, Studio previews, and slugs. The visible page title is the Hero Section heading.',
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
    // SUG-48: parent and template moved to content tab, beneath slug
    defineField({
      name: 'parent',
      title: 'Parent Page',
      type: 'reference',
      to: [{type: 'page'}],
      description: 'Optional: nest this page under another page (enables /page/subpage/ URL nesting — see SUG-51)',
      group: 'content',
      options: {
        filter: ({document}) => {
          return {
            filter: '_id != $id',
            params: {id: document._id}
          }
        }
      }
    }),
    defineField({
      name: 'template',
      title: 'Page Template',
      type: 'string',
      description: 'Layout template for this page (rendering: see SUG-52)',
      group: 'content',
      options: {
        list: [
          {title: 'Default (Standard Width)', value: 'default'},
          {title: 'Full Width (Edge to Edge)', value: 'full-width'},
          {title: 'With Sidebar', value: 'sidebar'}
        ],
        layout: 'radio'
      },
      initialValue: 'default'
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      description: 'Build your page with flexible sections',
      group: 'content',
      of: [
        defineArrayMember({type: 'heroSection'}),
        defineArrayMember({type: 'textSection'}),
        defineArrayMember({type: 'imageGallery'}),
        defineArrayMember({type: 'ctaSection'}),
        defineArrayMember({type: 'htmlSection'}),
        defineArrayMember({type: 'cardBuilderSection'}),
        defineArrayMember({type: 'calloutSection'}),
        defineArrayMember({type: 'mermaidSection'}),
        defineArrayMember({type: 'accordionSection'}),
      ]
    }),
    // SUG-48: citations added to page (was missing — present on node, article, caseStudy)
    defineField({
      name: 'citations',
      title: 'Citations / Endnotes',
      type: 'array',
      description: 'Endnote definitions for [1], [2] etc. markers placed in content via the Citation Reference annotation. Each entry appears in the endnote zone at the bottom of the page.',
      group: 'content',
      of: [
        defineArrayMember({type: 'citationItem'})
      ]
    }),

    // METADATA GROUP — dates, authors, taxonomy connections, template, parent
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When was this page published?',
      group: 'metadata',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'Last significant update to this page',
      group: 'metadata',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      description: 'Person references — canonical author taxonomy field',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'person'}]
        })
      ]
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Page categories — optional for organisation',
      group: 'metadata',
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
      description: 'Page tags — optional for organisation',
      group: 'metadata',
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
      description: 'Related projects — canonical project taxonomy field',
      group: 'metadata',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),

    // parent and template moved to content group (SUG-48)

    // SEO GROUP — shared seoMetadata object (Schema 1: SEO Metadata)
    // Identical across page / post / caseStudy / node for Studio UI consistency.
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
      slug: 'slug.current',
      parentTitle: 'parent.title',
      template: 'template'
    },
    prepare({title, slug, parentTitle, template}) {
      return {
        title: title || 'Untitled Page',
        subtitle: parentTitle ? `↳ ${parentTitle} / ${slug || ''}` : `/${slug || ''}`,
        description: template ? `Template: ${template}` : undefined
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
