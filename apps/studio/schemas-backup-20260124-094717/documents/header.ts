import {defineType} from 'sanity'

export default defineType({
  name: 'header',
  title: 'Site Header',
  type: 'document',
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