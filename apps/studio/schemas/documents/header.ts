import {defineType} from 'sanity'
import {WarningOutlineIcon} from '@sanity/icons'

/**
 * @deprecated Use siteSettings instead for header configuration
 * This schema is kept for backwards compatibility but should not be used for new content.
 * Header config is now managed via siteSettings.primaryNav and siteSettings.headerCta
 */
export default defineType({
  name: 'header',
  title: '[DEPRECATED] Site Header',
  type: 'document',
  icon: WarningOutlineIcon,
  deprecated: {
    reason: 'Use siteSettings instead for header configuration'
  },
  fields: [
    {
      name: 'logo',
      title: 'Site Logo',
      type: 'logo',
      description: 'Appears in top-left of header',
    },
    {
      name: 'navigation',
      title: 'Main Navigation',
      type: 'array',
      of: [{type: 'navigationItem'}],
      description: 'Primary navigation menu items',
      validation: (Rule) =>
        Rule.max(7).warning('Consider limiting to 7 items for better UX'),
    },
    {
      name: 'ctaButton',
      title: 'Call-to-Action Button',
      type: 'link',
      description: 'Optional highlighted button (e.g., "Contact", "Sign Up")',
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Header',
        subtitle: 'Global navigation and branding',
      }
    },
  },
})