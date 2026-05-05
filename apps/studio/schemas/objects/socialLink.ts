import {defineType} from 'sanity'
import {SOCIAL_PLATFORM_OPTIONS, PLATFORM_LABELS} from '../lib/iconOptions'

export default defineType({
  name: 'socialLink',
  title: 'Social Link',
  type: 'object',
  fields: [
    {
      name: 'platform',
      title: 'Platform',
      type: 'string',
      description: 'Social media platform (determines icon)',
      options: {
        list: [...SOCIAL_PLATFORM_OPTIONS],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'url',
      title: 'Profile URL',
      type: 'string',
      description: 'Full URL to your profile (e.g. https://… or mailto:… or tel:…)',
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return true
          try {
            const url = new URL(value)
            return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)
              ? true
              : 'Must start with https://, http://, mailto:, or tel:'
          } catch {
            return 'Must be a valid URL (e.g. https://… or mailto:you@example.com)'
          }
        }),
    },
    {
      name: 'label',
      title: 'Accessible Label',
      type: 'string',
      description: 'Screen reader text (e.g., "Visit my LinkedIn profile")',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      platform: 'platform',
      url: 'url',
    },
    prepare({platform, url}) {
      return {
        title: PLATFORM_LABELS[platform] || (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown'),
        subtitle: url,
      }
    },
  },
})
