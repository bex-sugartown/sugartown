import {defineType} from 'sanity'

export default defineType({
  name: 'logo',
  title: 'Logo',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Logo Image',
      type: 'image',
      options: {
        hotspot: true, // Enable focal point selection
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Describe the logo for screen readers (required for accessibility)',
          validation: (Rule) => Rule.required(),
        },
      ],
    },
    {
      name: 'linkUrl',
      title: 'Logo Link',
      type: 'url',
      description: 'Where should the logo link to? (typically homepage)',
      initialValue: '/',
      validation: (Rule) =>
        Rule.uri({
          scheme: ['http', 'https'],
          allowRelative: true,
        }),
    },
    {
      name: 'width',
      title: 'Display Width (px)',
      type: 'number',
      description: 'Logo width in pixels (height auto-scales)',
      initialValue: 120,
      validation: (Rule) => Rule.min(40).max(400),
    },
  ],
  preview: {
    select: {
      media: 'image',
      alt: 'image.alt',
    },
    prepare({media, alt}) {
      return {
        title: 'Logo',
        subtitle: alt,
        media: media,
      }
    },
  },
})
