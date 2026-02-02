import {defineType} from 'sanity'

export default defineType({
  name: 'media',
  title: 'Media',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Describe the image for accessibility',
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional image caption (shown below image)',
    },
  ],
  preview: {
    select: {
      media: 'image',
      alt: 'image.alt',
      caption: 'caption',
    },
    prepare({media, alt, caption}) {
      return {
        title: alt,
        subtitle: caption || 'No caption',
        media: media,
      }
    },
  },
})
