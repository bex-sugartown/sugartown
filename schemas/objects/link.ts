import {defineType, defineField} from 'sanity'
import {LinkIcon} from '@sanity/icons'

/**
 * Link Object
 *
 * Reusable link component with icon support for social links
 * Used across CTAs, navigation items, and social media links
 */
export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
          allowRelative: true
        })
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The text displayed for this link',
      validation: (Rule) => Rule.max(100).warning('Label should be under 100 characters')
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'Whether the link should open in a new browser tab',
      initialValue: true
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Optional icon name (e.g., "twitter", "github", "linkedin")',
      options: {
        list: [
          {title: 'Twitter/X', value: 'twitter'},
          {title: 'LinkedIn', value: 'linkedin'},
          {title: 'GitHub', value: 'github'},
          {title: 'Email', value: 'email'},
          {title: 'RSS', value: 'rss'},
          {title: 'External Link', value: 'external'}
        ]
      }
    })
  ],
  preview: {
    select: {
      title: 'label',
      url: 'url',
      icon: 'icon'
    },
    prepare({title, url, icon}) {
      return {
        title: title || 'Untitled Link',
        subtitle: url,
        media: icon ? LinkIcon : undefined
      }
    }
  }
})
