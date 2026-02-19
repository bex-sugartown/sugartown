import {defineType, defineField, defineArrayMember} from 'sanity'
import {UserIcon} from '@sanity/icons'
import {standardPortableText} from '../objects/portableTextConfig'

/**
 * Person Document - Author / Contributor / Profile
 *
 * The canonical "person" entity across the Sugartown ecosystem.
 * Used for author attribution on all content types (post, node, caseStudy, page)
 * and later reusable by the Resume Factory engine.
 *
 * Stage 5: Person/Profile as Reusable Content Type
 * - Upgraded from Stage 4 stub (name, slug, role, text bio, email, website)
 * - Now includes: titles[], portable text bio, structured links[]
 * - Legacy `role`, `email`, `website` fields hidden in favour of titles[] / links[]
 * - Drives authors[] references across all content types
 * - Usable as a taxonomy facet via buildFilterModel()
 *
 * Route: /people/:slug (reserved — TaxonomyPlaceholderPage until Stage 6)
 */
export default defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'identity', title: 'Identity', default: true},
    {name: 'profile', title: 'Profile'},
    {name: 'links', title: 'Links'},
    {name: 'legacy', title: 'Legacy'},
  ],
  fields: [
    // ════════════════════════════════════════════════════════════════════════
    // IDENTITY GROUP — name, slug
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: 'Display name used everywhere this person is referenced.',
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
      description: 'URL-friendly identifier — used for the /people/:slug route.',
      group: 'identity',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().error('Slug is required. Click "Generate" to create from name.'),
    }),

    // ════════════════════════════════════════════════════════════════════════
    // PROFILE GROUP — titles, bio, image
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'titles',
      title: 'Roles / Titles',
      type: 'array',
      description: 'Job titles or roles (e.g., "Product Manager", "Content Architect"). Shown in author bylines.',
      group: 'profile',
      of: [defineArrayMember({type: 'string'})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      description: 'Short bio for author attribution and profile surfaces. Supports rich text.',
      group: 'profile',
      of: standardPortableText,
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      description: 'Headshot or avatar shown next to author bylines.',
      group: 'profile',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for accessibility (e.g., "Becky smiling at camera")',
        }),
      ],
    }),

    // ════════════════════════════════════════════════════════════════════════
    // LINKS GROUP — structured external links
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      description: 'Website, social profiles, and other external links.',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'object',
          title: 'Link',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Display label (e.g., "My Portfolio", "@aliceb")',
              validation: (Rule) => Rule.required().max(60),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
            }),
            defineField({
              name: 'kind',
              title: 'Link Type',
              type: 'string',
              description: 'Used for icon display and semantic meaning.',
              options: {
                list: [
                  {title: 'Website', value: 'website'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'GitHub', value: 'github'},
                  {title: 'Twitter / X', value: 'twitter'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'Other', value: 'other'},
                ],
                layout: 'dropdown',
              },
              initialValue: 'other',
            }),
          ],
          preview: {
            select: {label: 'label', kind: 'kind', url: 'url'},
            prepare({label, kind, url}) {
              return {
                title: label || url || 'Untitled Link',
                subtitle: kind || 'other',
              }
            },
          },
        }),
      ],
    }),

    // ════════════════════════════════════════════════════════════════════════
    // LEGACY GROUP — Stage 4 stub fields, hidden from Studio
    // Data is preserved in Sanity; these fields are no longer edited directly.
    // TODO Stage 6+: run migration script, then remove these fields.
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'role',
      title: 'Role (Legacy)',
      type: 'string',
      description: 'Superseded by "Roles / Titles" above. Kept for data safety only.',
      group: 'legacy',
      hidden: true,
    }),
    defineField({
      name: 'email',
      title: 'Email (Legacy)',
      type: 'email',
      description: 'Moved to Links. Kept for data safety only.',
      group: 'legacy',
      hidden: true,
    }),
    defineField({
      name: 'website',
      title: 'Website (Legacy)',
      type: 'url',
      description: 'Superseded by structured Links array. Kept for data safety only.',
      group: 'legacy',
      hidden: true,
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle0: 'titles[0]',
      subtitleLegacy: 'role',
      media: 'image',
    },
    prepare({title, subtitle0, subtitleLegacy, media}) {
      return {
        title: title || 'Unnamed Person',
        subtitle: subtitle0 || subtitleLegacy || '',
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
