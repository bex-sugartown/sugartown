import {defineType} from 'sanity'

export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Link Text',
      type: 'string',
      description: 'Visible text for the link',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'External URL or internal path (e.g., /about, https://example.com)',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['http', 'https', 'mailto', 'tel'],
          allowRelative: true,
        }),
    },
    {
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'Open link in new browser tab/window',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url',
    },
    prepare({title, subtitle}) {
      return {
        title: title,
        subtitle: subtitle,
        media: () => '🔗',
      }
    },
  },
})
