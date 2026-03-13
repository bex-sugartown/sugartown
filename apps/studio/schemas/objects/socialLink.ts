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
          {title: 'X (Twitter)', value: 'x'},
          {title: 'Twitter (legacy)', value: 'twitter'},
          {title: 'Instagram', value: 'instagram'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'Facebook', value: 'facebook'},
          {title: 'Dribbble', value: 'dribbble'},
          {title: 'Behance', value: 'behance'},
          {title: 'Bluesky', value: 'bluesky'},
          {title: 'Mastodon', value: 'mastodon'},
          {title: 'Website', value: 'website'},
          {title: 'Email', value: 'email'},
          {title: 'RSS', value: 'rss'},
          {title: 'Other', value: 'external'},
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
      const labels: Record<string, string> = {
        linkedin: 'LinkedIn',
        github: 'GitHub',
        x: 'X',
        twitter: 'Twitter/X',
        instagram: 'Instagram',
        youtube: 'YouTube',
        facebook: 'Facebook',
        dribbble: 'Dribbble',
        behance: 'Behance',
        bluesky: 'Bluesky',
        mastodon: 'Mastodon',
        website: 'Website',
        email: 'Email',
        rss: 'RSS',
        external: 'Link',
      }
      return {
        title: labels[platform] || (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown'),
        subtitle: url,
      }
    },
  },
})
