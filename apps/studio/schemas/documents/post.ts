import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {standardPortableText} from '../objects/portableTextConfig'

/**
 * Post Document - Blog Post
 *
 * Standard blog post content type with rich content support.
 * Migrated from WordPress posts.
 *
 * SEO: uses the shared `seoMetadata` object (Schema 1: SEO Metadata).
 * // TODO Stage 6: rename post → article; SEO already aligned
 */
export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'metadata', title: 'Metadata'},
    {name: 'connections', title: 'Connections'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // CONTENT GROUP
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The blog post title',
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
      description: 'Brief summary for post listings and social sharing',
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
      description: 'Main image for the post (shown in listings and headers)',
      group: 'content'
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description: 'Full post content',
      group: 'content',
      of: standardPortableText
    }),

    // METADATA GROUP
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'Post author (future: will be reference to author document)',
      group: 'metadata',
      validation: (Rule) => Rule.max(100)
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When was this post published?',
      group: 'metadata',
      validation: (Rule) => Rule.required().error('Published date is required'),
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'Last significant update to this post',
      group: 'metadata'
    }),

    // CONNECTIONS GROUP
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Post categories',
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
      description: 'Post tags',
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
      description: 'Link this post to active projects',
      group: 'connections',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}]
        })
      ]
    }),

    // SEO GROUP — shared seoMetadata object (Schema 1: SEO Metadata)
    // Identical across page / post / caseStudy / node for Studio UI consistency.
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      date: 'publishedAt',
      media: 'featuredImage.asset'
    },
    prepare({title, author, date, media}) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'

      return {
        title: title || 'Untitled Post',
        subtitle: `${author || 'No author'} • ${formattedDate}`,
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
