import {defineArrayMember, defineField} from 'sanity'

/**
 * AI-generated image disclosure fields (SUG-55, SUG-178)
 *
 * One definition shared by every image that can be AI-generated: `richImage`, the hero
 * `backgroundImage`, card-builder and gallery images, and (ST-181) the SEO share image. Add the spread to any other image type that needs the on-site AI label.
 * The web app reads `aiGenerated` and `aiTool` and renders the AiLabel design-system component.
 *
 * ST-178: the Sanity image CDN strips embedded metadata, so a flagged image also carries
 * `provenanceFiles`: sized JPEG copies made by scripts/ai-provenance/stamp.py (mark baked into the
 * pixels, IPTC metadata in the file), uploaded as file assets and served as-is.
 */
export const aiImageFields = [
  defineField({
    name: 'aiGenerated',
    title: 'AI-Generated',
    type: 'boolean',
    description: 'Is this image AI-generated or AI-manipulated?',
    initialValue: false,
    validation: (Rule) =>
      Rule.custom((value, context) => {
        const parent = context.parent as {provenanceFiles?: unknown[]} | undefined
        if (value && !parent?.provenanceFiles?.length) {
          return 'Flagged AI-generated but no stamped copies yet: the image has no baked mark or embedded metadata. Ask a Claude session to run the stamping tool and attach the copies.'
        }
        return true
      }).warning(),
  }),
  defineField({
    name: 'aiTool',
    title: 'AI Tool',
    type: 'string',
    description: 'Which AI tool generated this image? A Claude session can suggest this from the source file when it stamps the image.',
    hidden: ({parent}) => !parent?.aiGenerated,
    options: {
      list: [
        {title: 'ChatGPT', value: 'chatgpt'},
        {title: 'Claude', value: 'claude'},
        {title: 'Claude Code', value: 'claude-code'},
        {title: 'Gemini', value: 'gemini'},
        {title: 'Adobe Firefly', value: 'adobe-firefly'},
        {title: 'Photoshop Generative Fill', value: 'photoshop-generative-fill'},
        {title: 'Canva AI', value: 'canva-ai'},
        {title: 'Microsoft Copilot', value: 'microsoft-copilot'},
        {title: 'Stable Diffusion', value: 'stable-diffusion'},
        {title: 'Other', value: 'other'},
      ],
      layout: 'dropdown',
    },
  }),
  defineField({
    name: 'aiToolVersion',
    title: 'AI Tool Version',
    type: 'string',
    description:
      'Optional. The version or model of the tool, for example "v6.1". Written into the stamped files as the IPTC AI System Version Used. Leave empty when unknown.',
    hidden: ({parent}) => !parent?.aiGenerated,
  }),
  defineField({
    name: 'provenanceFiles',
    title: 'Stamped copies',
    type: 'array',
    description:
      'Sized JPEG copies with the AI mark in the pixels and IPTC metadata in the file. Made by scripts/ai-provenance/stamp.py, not by hand. The site serves these instead of the Sanity image URL for flagged images.',
    hidden: ({parent}) => !parent?.aiGenerated,
    of: [
      defineArrayMember({
        type: 'object',
        name: 'provenanceFile',
        fields: [
          defineField({
            name: 'width',
            title: 'Width (px)',
            type: 'number',
            validation: (Rule) => Rule.required().integer().min(1),
          }),
          defineField({
            name: 'file',
            title: 'File',
            type: 'file',
            options: {accept: 'image/jpeg'},
            validation: (Rule) => Rule.required(),
          }),
        ],
        preview: {
          select: {width: 'width'},
          prepare: ({width}: {width?: number}) => ({title: width ? `${width}px` : 'Stamped copy'}),
        },
      }),
    ],
  }),
]
