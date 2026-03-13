import {defineType, defineField, defineArrayMember} from 'sanity'
import {UserIcon} from '@sanity/icons'
import {standardPortableText} from '../objects/portableTextConfig'

/**
 * Person Document - Author / Contributor / Profile
 *
 * The canonical "person" entity across the Sugartown ecosystem.
 * Used for author attribution on all content types (article, node, caseStudy, page)
 * and later reusable by the Resume Factory engine.
 *
 * Stage 5: Person/Profile as Reusable Content Type
 * Stage 7 (EPIC-0145): headline, location, pronouns, expertise, featured, seo, socialLinks
 *
 * Schema groups (tabs):
 *   Basics   — name, shortName, slug (was "Identity")
 *   Profile  — titles, bio, image, subtitle/headline, location, pronouns, featured
 *   Links    — socialLinks, links (legacy)
 *   SEO      — seoMetadata object
 *   Legacy   — hidden back-compat fields
 *
 * Route: /people/:slug
 */
export default defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'basics', title: 'Basics', default: true},
    {name: 'profile', title: 'Profile'},
    {name: 'links', title: 'Links'},
    {name: 'seo', title: 'SEO'},
    {name: 'legacy', title: 'Legacy'},
  ],
  fields: [
    // ════════════════════════════════════════════════════════════════════════
    // BASICS GROUP — name, shortName, slug
    // Core identifying data: the minimum required to route and attribute content.
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: 'Legal / full name — used in formal contexts like resume, CV, and bios.',
      group: 'basics',
      validation: (Rule) =>
        Rule.required()
          .max(100)
          .error('Full name is required and must be under 100 characters'),
    }),
    defineField({
      name: 'shortName',
      title: 'Short Name',
      type: 'string',
      description: 'Preferred byline name — used for author attribution on articles, nodes, and case studies. Shown in parens after full name on the profile page.',
      group: 'basics',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier — used for the /people/:slug route.',
      group: 'basics',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required()
          .error('Slug is required. Click "Generate" to create from name.'),
    }),

    // ════════════════════════════════════════════════════════════════════════
    // PROFILE GROUP — titles, bio, image, subtitle, location, pronouns
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'titles',
      title: 'Roles / Titles',
      type: 'array',
      description: 'Job titles or roles (e.g., "Product Manager", "Content Architect"). Shown in author bylines and on the profile page.',
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
    defineField({
      name: 'headline',
      title: 'Subtitle',
      type: 'string',
      description: 'One-line tagline — renders as the pink (#ff247d) subtitle directly below the name on the profile page.',
      group: 'profile',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City, region, or country (e.g., "San Francisco Bay Area")',
      group: 'profile',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'pronouns',
      title: 'Pronouns',
      type: 'string',
      description: 'Personal pronouns (e.g., "she/her/hers", "they/them")',
      group: 'profile',
      validation: (Rule) => Rule.max(50),
    }),
    defineField({
      name: 'expertise',
      title: 'Expertise',
      type: 'array',
      description: 'Areas of expertise — select from the category taxonomy. Displayed as linked chips on the profile page.',
      group: 'profile',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}],
        }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Feature on homepage or listings',
      group: 'profile',
      initialValue: false,
    }),

    // ════════════════════════════════════════════════════════════════════════
    // SEO GROUP — seoMetadata object
    // Mirrors the SEO tab pattern used by article, node, caseStudy, and page.
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
      group: 'seo',
    }),

    // ════════════════════════════════════════════════════════════════════════
    // LINKS GROUP — structured external links
    // ════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      description: 'Structured social profile links with platform icons.',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'object',
          title: 'Social Link',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'GitHub', value: 'github'},
                  {title: 'X (Twitter)', value: 'x'},
                  {title: 'Twitter (legacy)', value: 'twitter'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Dribbble', value: 'dribbble'},
                  {title: 'Behance', value: 'behance'},
                  {title: 'Bluesky', value: 'bluesky'},
                  {title: 'Mastodon', value: 'mastodon'},
                  {title: 'Website', value: 'website'},
                  {title: 'Email', value: 'email'},
                  {title: 'RSS', value: 'rss'},
                  {title: 'Link', value: 'other'},
                ],
                layout: 'dropdown',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
            }),
            defineField({
              name: 'label',
              title: 'Label (optional override)',
              type: 'string',
              description: 'Override the default platform label for display',
            }),
          ],
          preview: {
            select: {platform: 'platform', url: 'url', label: 'label'},
            prepare({platform, url, label}) {
              return {
                title: label || platform || 'Link',
                subtitle: url || '',
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'links',
      title: 'Links (Legacy)',
      type: 'array',
      description: 'Legacy unstructured link list — prefer Social Links above.',
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
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'GitHub', value: 'github'},
                  {title: 'X (Twitter)', value: 'x'},
                  {title: 'Twitter (legacy)', value: 'twitter'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Dribbble', value: 'dribbble'},
                  {title: 'Behance', value: 'behance'},
                  {title: 'Bluesky', value: 'bluesky'},
                  {title: 'Mastodon', value: 'mastodon'},
                  {title: 'Website', value: 'website'},
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
      name: 'name',
      shortName: 'shortName',
      media: 'image',
    },
    prepare({name, shortName, media}) {
      // Show "Becky Alice (Bex)" format when shortName is set
      const displayName = name && shortName ? `${name} (${shortName})` : name || shortName
      return {
        title: displayName || 'Unnamed Person',
        subtitle: 'Person',
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
