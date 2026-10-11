import {defineType, defineField, defineArrayMember} from 'sanity'
import {RocketIcon} from '@sanity/icons'

/**
 * Release Note Document
 *
 * A dated, versioned ledger entry derived from CHANGELOG.md. Split from `article`
 * by the reader's job (ledger vs opinion), not by AI authorship (ST-147).
 *
 * Reuses the article `sections` array so the existing section renderer applies.
 * `releasedAt` is the canonical date; queries alias it to `publishedAt` so shared
 * components (MetadataCard, JSON-LD) keep working.
 */
export default defineType({
  name: 'releaseNote',
  title: 'Release Note',
  type: 'document',
  icon: RocketIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'metadata', title: 'Metadata'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description:
        'Internal reference title, used for SEO <title>, Studio previews and slugs. The visible page title is the Hero Section heading. (max. 100 characters)',
      group: 'content',
      validation: (Rule) =>
        Rule.required().max(100).error('Title is required and must be under 100 characters'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier, auto-generated from title',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required().error('Slug is required. Click "Generate" to create from title.'),
    }),
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      description: 'Semantic version this note covers, without a leading v (e.g. 0.36.0). Matches a CHANGELOG section.',
      group: 'metadata',
      validation: (Rule) =>
        Rule.required()
          .regex(/^\d+\.\d+\.\d+$/, {name: 'semver', invert: false})
          .error('Use MAJOR.MINOR.PATCH, e.g. 0.36.0'),
    }),
    defineField({
      name: 'releasedAt',
      title: 'Released At',
      type: 'date',
      description: 'Date the version shipped. Drives archive order.',
      group: 'metadata',
      validation: (Rule) => Rule.required().error('Release date is required'),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: 'One-sentence takeaway, used as the meta description. (soft max. 300 characters)',
      group: 'content',
      rows: 3,
      validation: (Rule) => Rule.max(300).warning('Keep the summary under 300 characters'),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      description: 'Body of the note. Same section types as an article.',
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
        defineArrayMember({type: 'trustReportSection'}),
        defineArrayMember({type: 'citedBlock'}),
        defineArrayMember({type: 'cardSection'}),
      ],
    }),
    defineField({
      name: 'citations',
      title: 'Citations / Endnotes',
      type: 'array',
      description: 'Endnote definitions for [1], [2] markers placed via the Citation Reference annotation.',
      group: 'content',
      of: [defineArrayMember({type: 'citationItem'})],
    }),
    defineField({
      name: 'aiDisclosure',
      title: 'AI Collaboration Disclosure',
      type: 'string',
      description:
        'e.g. "Drafted with Claude, edited by Bex Head." Renders in the sidebar. Leave blank for fully human-authored content. (max. 300 characters)',
      group: 'metadata',
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      description: 'Select existing persons.',
      group: 'metadata',
      of: [defineArrayMember({type: 'reference', to: [{type: 'person'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetadata',
      group: 'seo',
    }),
  ],
  preview: {
    select: {title: 'title', version: 'version', date: 'releasedAt'},
    prepare({title, version, date}) {
      return {
        title: title || 'Untitled Release Note',
        subtitle: [version ? `v${version}` : null, date].filter(Boolean).join(' · '),
      }
    },
  },
  orderings: [
    {title: 'Released (Newest First)', name: 'releasedDesc', by: [{field: 'releasedAt', direction: 'desc'}]},
    {title: 'Released (Oldest First)', name: 'releasedAsc', by: [{field: 'releasedAt', direction: 'asc'}]},
  ],
})
