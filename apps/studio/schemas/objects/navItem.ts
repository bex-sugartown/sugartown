import {defineType, defineField, defineArrayMember} from 'sanity'

/**
 * navItem — Top-level navigation item
 *
 * Used within navigation document menus. Supports nested children
 * (dropdown/mega menu) via childNavItem references.
 */
export default defineType({
  name: 'navItem',
  title: 'Navigation Item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The text displayed for this menu item',
      validation: (Rule) =>
        Rule.required()
          .max(50)
          .error('Label is required and must be under 50 characters'),
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      description: 'How this nav item navigates',
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
      description: 'External links only — internal/archive links always open in same tab',
      initialValue: false,
    }),
    // Legacy field — hidden in Studio, preserved for backward compat.
    // Do not remove until all nav items are migrated to typed linkType fields.
    defineField({
      name: 'link',
      title: 'Link (legacy)',
      type: 'link',
      hidden: () => true,
    }),
    defineField({
      name: 'children',
      title: 'Dropdown Items',
      type: 'array',
      description: 'Optional: add child items to create a dropdown/mega menu',
      of: [defineArrayMember({type: 'childNavItem'})],
      validation: (Rule) =>
        Rule.max(10).warning('Consider limiting dropdown menus to 10 items for usability'),
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
      hasChildren: 'children',
    },
    prepare({title, linkType, internalSlug, archiveSlug, externalUrl, legacyUrl, hasChildren}) {
      let url = legacyUrl || 'No URL'
      if (linkType === 'internal') url = internalSlug ? `/${internalSlug}` : '⚠ No page'
      if (linkType === 'archive') url = archiveSlug ? `/${archiveSlug}` : '⚠ No archive'
      if (linkType === 'external') url = externalUrl || '⚠ No URL'
      return {
        title: title || 'Untitled Item',
        subtitle: `${url}${hasChildren?.length ? ` (${hasChildren.length} items)` : ''}`,
      }
    },
  },
})
