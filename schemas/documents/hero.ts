import {defineType} from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Hero Banner',
  type: 'document',
  fields: [
    {
      name: 'heading',
      title: 'Main Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(80),
    },
    {
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(200),
    },
    {
      name: 'ctaButton',
      title: 'Call-to-Action Button',
      type: 'link',
      description: 'Primary action button',
    },
    {
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'link',
      description: 'Optional second button (less prominent styling)',
    },
    {
      name: 'backgroundMedia',
      title: 'Background Image',
      type: 'media',
      description: 'Optional background image (hero text overlays this)',
    },
    {
      name: 'backgroundStyle',
      title: 'Background Style',
      type: 'string',
      options: {
        list: [
          {title: 'Sugartown Pink', value: 'pink'},
          {title: 'Seafoam', value: 'seafoam'},
          {title: 'White', value: 'white'},
          {title: 'Image', value: 'image'},
        ],
      },
      initialValue: 'pink',
      description: 'Solid color or use background image',
    },
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'subheading',
      media: 'backgroundMedia.image',
    },
  },
})