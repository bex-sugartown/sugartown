import {defineType, defineField} from 'sanity'
import {LinkIcon} from '@sanity/icons'

/**
 * Link Item — reusable internal/external link object.
 *
 * Single source of truth for all link item fields across the CMS.
 * Use `type: 'linkItem'` in any parent schema that needs a link chooser.
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
        Rule.uri({scheme: ['http', 'https']}).error('Must be a valid URL'),
      hidden: ({parent}) => parent?.type !== 'external'
    })
  ]
})
