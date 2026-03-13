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
      type: 'url',
      description: 'Full URL to your profile',
      validation: (Rule) => Rule.required(),
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
