import {defineType, defineField} from 'sanity'

/**
 * Media Overlay Object
 *
 * Controls image overlay treatment (duotone or colour overlay).
 * Embedded in richImage schema to give authors per-image overlay control.
 *
 * Duotone presets use canonical brand colours:
 *   Pink: #ff247d (Sugartown Pink)
 *   Seafoam: #2bd4aa
 * The legacy #ED008E is deprecated.
 */
export default defineType({
  name: 'mediaOverlay',
  title: 'Image Overlay',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Overlay Type',
      type: 'string',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Duotone', value: 'duotone-featured'},
          {title: 'Duotone (Subtle)', value: 'duotone-subtle'},
          {title: 'Duotone (Extreme)', value: 'duotone-extreme'},
          {title: 'Dark Scrim', value: 'dark-scrim'},
          {title: 'Greyscale + Panel', value: 'greyscale-panel'},
          {title: 'Color Overlay', value: 'color'},
        ],
        layout: 'radio',
      },
      initialValue: 'none',
    }),
    defineField({
      name: 'overlayColor',
      title: 'Overlay Color',
      type: 'string',
      description: 'CSS color value or design token (e.g., #ff247d, rgba(0,0,0,0.5))',
      hidden: ({parent}) => parent?.type !== 'color',
    }),
    defineField({
      name: 'overlayOpacity',
      title: 'Overlay Opacity (%)',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(100),
      initialValue: 50,
      hidden: ({parent}) => parent?.type !== 'color',
    }),
  ],
})
