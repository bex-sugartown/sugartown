import {defineField} from 'sanity'

/**
 * AI-generated image disclosure fields (SUG-55, SUG-178)
 *
 * One definition shared by every image that can be AI-generated: `richImage` and the hero
 * `backgroundImage`. Add the spread to any other image type that needs the on-site AI label.
 * The web app reads `aiGenerated` and `aiTool` and renders the AiLabel design-system component.
 */
export const aiImageFields = [
  defineField({
    name: 'aiGenerated',
    title: 'AI-Generated',
    type: 'boolean',
    description: 'Is this image AI-generated or AI-manipulated?',
    initialValue: false,
  }),
  defineField({
    name: 'aiTool',
    title: 'AI Tool',
    type: 'string',
    description: 'Which AI tool generated this image?',
    hidden: ({parent}) => !parent?.aiGenerated,
    options: {
      list: [
        {title: 'DALL-E', value: 'dall-e'},
        {title: 'Midjourney', value: 'midjourney'},
        {title: 'Stable Diffusion', value: 'stable-diffusion'},
        {title: 'Adobe Firefly', value: 'adobe-firefly'},
        {title: 'Other', value: 'other'},
      ],
      layout: 'dropdown',
    },
  }),
]
