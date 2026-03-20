import {defineType, defineField} from 'sanity'

/**
 * childNavItem — Child/dropdown navigation item
 *
 * Used inside navItem.children arrays. Same fields as navItem
 * minus the recursive children array.
 */
export default defineType({
  name: 'childNavItem',
  title: 'Child Navigation Item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          {title: 'Internal Page', value: 'internal'},
          {title: 'Archive / Listing', value: 'archive'},
          {title: 'External URL', value: 'external'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'internal',
    }),
    defineField({
      name: 'internalPage',
      title: 'Internal Page',
      type: 'reference',
      to: [{type: 'page'}, {type: 'archivePage'}],
      hidden: ({parent}) => parent?.linkType !== 'internal',
      description: 'Links to a Page or Archive Page — URL resolves from its slug automatically',
    }),
    defineField({
      name: 'archiveRef',
      title: 'Archive / Listing Page',
      type: 'reference',
      to: [{type: 'archivePage'}],
      hidden: ({parent}) => parent?.linkType !== 'archive',
      description: 'Links to an Archive Page document (e.g. Articles, Case Studies)',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'external',
      description: 'Full URL including https://',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      hidden: ({parent}) => parent?.linkType !== 'external',
      initialValue: false,
    }),
    // Legacy field — hidden, preserved for backward compat
    defineField({
      name: 'link',
      title: 'Link (legacy)',
      type: 'link',
      hidden: () => true,
    }),
  ],
  preview: {
    select: {
      title: 'label',
      linkType: 'linkType',
      internalSlug: 'internalPage.slug.current',
      archiveSlug: 'archiveRef.slug.current',
      externalUrl: 'externalUrl',
      legacyUrl: 'link.url',
    },
    prepare({title, linkType, internalSlug, archiveSlug, externalUrl, legacyUrl}) {
      let url = legacyUrl || 'No URL'
      if (linkType === 'internal') url = internalSlug ? `/${internalSlug}` : '⚠ No page'
      if (linkType === 'archive') url = archiveSlug ? `/${archiveSlug}` : '⚠ No archive'
      if (linkType === 'external') url = externalUrl || '⚠ No URL'
      return {
        title: title || 'Untitled Item',
        subtitle: url,
      }
    },
  },
})
