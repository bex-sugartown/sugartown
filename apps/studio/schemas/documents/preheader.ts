import {defineType, defineField} from 'sanity'
import {BellIcon} from '@sanity/icons'

/**
 * Preheader Document
 *
 * Reusable announcement/preheader bar with scheduling capabilities
 * Can be referenced by siteSettings to display above the header
 */
export default defineType({
  name: 'preheader',
  title: 'Preheader',
  type: 'document',
  icon: BellIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal name for this preheader (not displayed on site)',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'string',
      description: 'The announcement text displayed in the preheader',
      validation: (Rule) => Rule.max(150).warning('Keep message under 150 characters for best display')
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link',
      description: 'Optional link for the announcement'
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Background color for the preheader bar',
      options: {
        list: [
          {title: 'Sugartown Pink', value: 'pink'},
          {title: 'Seafoam', value: 'seafoam'},
          {title: 'Dark', value: 'dark'},
          {title: 'Light', value: 'light'}
        ],
        layout: 'radio'
      },
      initialValue: 'pink'
    }),
    defineField({
      name: 'publishAt',
      title: 'Publish At',
      type: 'datetime',
      description: 'When this preheader should start displaying (leave empty to show immediately when selected)',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep: 1
      }
    }),
    defineField({
      name: 'unpublishAt',
      title: 'Unpublish At',
      type: 'datetime',
      description: 'When this preheader should stop displaying (leave empty to show indefinitely)',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep: 1
      },
      validation: (Rule) =>
        Rule.custom((unpublishAt, context) => {
          const publishAt = context.document?.publishAt as string | undefined
          if (unpublishAt && publishAt && new Date(unpublishAt) <= new Date(publishAt)) {
            return 'Unpublish date must be after publish date'
          }
          return true
        })
    }),
    defineField({
      name: 'timezone',
      title: 'Timezone',
      type: 'string',
      description: 'Timezone for publish/unpublish times',
      options: {
        list: [
          {title: 'UTC', value: 'UTC'},
          {title: 'US Eastern (ET)', value: 'America/New_York'},
          {title: 'US Central (CT)', value: 'America/Chicago'},
          {title: 'US Mountain (MT)', value: 'America/Denver'},
          {title: 'US Pacific (PT)', value: 'America/Los_Angeles'},
          {title: 'UK (GMT/BST)', value: 'Europe/London'},
          {title: 'Central Europe (CET)', value: 'Europe/Paris'},
          {title: 'Australia Eastern (AEST)', value: 'Australia/Sydney'}
        ]
      },
      initialValue: 'America/New_York'
    })
  ],
  preview: {
    select: {
      title: 'title',
      message: 'message',
      publishAt: 'publishAt',
      unpublishAt: 'unpublishAt'
    },
    prepare({title, message, publishAt, unpublishAt}) {
      const now = new Date()
      const pubDate = publishAt ? new Date(publishAt) : null
      const unpubDate = unpublishAt ? new Date(unpublishAt) : null

      let status = 'Active'
      if (pubDate && pubDate > now) {
        status = `Scheduled: ${pubDate.toLocaleDateString()}`
      } else if (unpubDate && unpubDate < now) {
        status = 'Expired'
      } else if (pubDate && unpubDate) {
        status = `Active until ${unpubDate.toLocaleDateString()}`
      }

      return {
        title: title || 'Untitled Preheader',
        subtitle: `${status} | ${message || 'No message'}`
      }
    }
  },
  orderings: [
    {
      title: 'Publish Date (Newest)',
      name: 'publishAtDesc',
      by: [{field: 'publishAt', direction: 'desc'}]
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}]
    }
  ]
})
