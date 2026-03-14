import {defineType, defineField} from 'sanity'
import {LinkIcon} from '@sanity/icons'

/**
 * Link Item — reusable internal/external link object.
 *
 * Single source of truth for all link fields across the CMS.
 * Use `type: 'linkItem'` in any parent schema that needs a link chooser.
 *
 * Supports:
 * - Internal page references (slug-proof — URLs update automatically)
 * - External URLs (http, https, mailto, tel)
 * - Optional display label (internal refs can derive from doc title)
 * - Optional open-in-new-tab behavior
 *
 * Internal targets include all slug-bearing document types:
 * page, article, caseStudy, node, archivePage.
 */
export default defineType({
  name: 'linkItem',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'type',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          {title: 'Internal page', value: 'internal'},
          {title: 'External URL', value: 'external'}
        ],
        layout: 'radio'
      },
      initialValue: 'internal'
    }),
    defineField({
      name: 'internalRef',
      title: 'Internal Page',
      type: 'reference',
      to: [
        {type: 'page'},
        {type: 'article'},
        {type: 'caseStudy'},
        {type: 'node'},
        {type: 'archivePage'}
      ],
      hidden: ({parent}) => parent?.type !== 'internal'
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true}).error(
          'Must be a valid URL (http, https, mailto, or tel)'
        ),
      hidden: ({parent}) => parent?.type !== 'external'
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description:
        'Display text for this link. For internal pages this overrides the page title.',
      validation: (Rule) => Rule.max(100).warning('Label should be under 100 characters')
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'Open this link in a new browser tab',
      initialValue: false,
      hidden: ({parent}) => parent?.type !== 'external'
    })
  ],
  preview: {
    select: {
      label: 'label',
      type: 'type',
      internalTitle: 'internalRef.title',
      internalSlug: 'internalRef.slug.current',
      externalUrl: 'externalUrl'
    },
    prepare({label, type, internalTitle, internalSlug, externalUrl}) {
      const displayLabel = label || internalTitle || 'Untitled Link'
      let subtitle = 'No destination'
      if (type === 'internal') subtitle = internalSlug ? `/${internalSlug}` : '⚠ No page selected'
      if (type === 'external') subtitle = externalUrl || '⚠ No URL'
      return {
        title: displayLabel,
        subtitle
      }
    }
  }
})
