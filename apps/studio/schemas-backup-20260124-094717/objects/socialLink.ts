import {defineType} from 'sanity'

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
        list: [
          {title: 'LinkedIn', value: 'linkedin'},
          {title: 'GitHub', value: 'github'},
          {title: 'Twitter/X', value: 'twitter'},
          {title: 'Instagram', value: 'instagram'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'Facebook', value: 'facebook'},
          {title: 'Dribbble', value: 'dribbble'},
          {title: 'Behance', value: 'behance'},
        ],
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
      const icons: Record<string, string> = {
        linkedin: '💼',
        github: '🐙',
        twitter: '🐦',
        instagram: '📷',
        youtube: '▶️',
        facebook: '👥',
        dribbble: '🏀',
        behance: '🎨',
      }
      return {
        title: platform.charAt(0).toUpperCase() + platform.slice(1),
        subtitle: url,
        media: () => icons[platform] || '🔗',
      }
    },
  },
})
