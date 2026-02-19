import {defineType, defineField} from 'sanity'
import {UserIcon} from '@sanity/icons'

/**
 * Person Document - Author / Contributor Taxonomy Primitive
 *
 * Represents a person who authors or contributes to content (posts, case studies, nodes).
 * Used as a taxonomy reference across all top-level content types via the `authors` field.
 *
 * Stage 4: Taxonomy Relationship Architecture
 * - Introduced as a first-class taxonomy primitive (alongside category, tag, project).
 * - Content types reference persons via `authors[]` (array, even if usually one).
 * - Derived facet aggregation uses this to build filter options per archive.
 *
 * Future: expand with bio, social links, headshot image, role.
 */
export default defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'identity', title: 'Identity', default: true},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    // IDENTITY GROUP
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: 'Display name (e.g., "Alice Becky" or "Alice B.")',
      group: 'identity',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Name is required and must be under 100 characters'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier — used for future /people/:slug route',
      group: 'identity',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().error('Slug is required. Click "Generate" to create from name.'),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Job title or role (e.g., "Designer", "Developer", "Strategist")',
      group: 'identity',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      description: 'Brief bio shown on author pages and content detail pages',
      group: 'identity',
      rows: 3,
      validation: (Rule) => Rule.max(500).warning('Keep bio concise — under 500 characters'),
    }),
    defineField({
      name: 'image',
      title: 'Headshot',
      type: 'image',
      description: 'Author photo or avatar',
      group: 'identity',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for accessibility',
        }),
      ],
    }),

    // META GROUP
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      description: 'Contact email (optional — not shown publicly unless intended)',
      group: 'meta',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      description: 'Personal site or portfolio URL',
      group: 'meta',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Unnamed Person',
        subtitle: subtitle || '',
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
})
