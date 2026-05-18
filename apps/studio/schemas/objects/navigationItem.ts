import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'navigationItem',
  title: 'Navigation Item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Text shown in navigation',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Link destination',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['http', 'https'],
          allowRelative: true,
        }),
    }),
    defineField({
      name: 'isActive',
      title: 'Highlight as Active',
      type: 'boolean',
      description: 'Visually indicate this is the current page',
      initialValue: false,
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url',
      isActive: 'isActive',
    },
    prepare({title, subtitle, isActive}) {
      return {
        title: isActive ? `${title} ⭐` : title,
        subtitle: subtitle,
      }
    },
  },
})
