import {defineType, defineField, defineArrayMember} from 'sanity'
import {MenuIcon} from '@sanity/icons'

/**
 * Navigation Document
 *
 * Reusable navigation menus for headers, footers, and sidebars.
 * Supports nested menu items for dropdown/mega menus.
 *
 * navItem and childNavItem are registered object types in schemas/objects/
 * so that Sanity's array UI renders context menus (⋯) with Remove/Duplicate/Move.
 */
export default defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Menu Title',
      type: 'string',
      description: 'Internal identifier (e.g., "Primary Nav", "Footer Nav", "Mobile Menu")',
      validation: (Rule) =>
        Rule.required()
          .max(50)
          .error('Title is required and must be under 50 characters'),
    }),
    defineField({
      name: 'header',
      title: 'Display Header',
      type: 'string',
      description:
        'Optional public-facing heading for this menu (e.g. shown as footer column heading). If empty, no heading is displayed.',
      validation: (Rule) => Rule.max(50),
    }),
    defineField({
      name: 'items',
      title: 'Menu Items',
      type: 'array',
      description: 'The navigation menu structure',
      of: [defineArrayMember({type: 'navItem'})],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('At least one menu item is required'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      header: 'header',
      items: 'items',
    },
    prepare({title, header, items}) {
      const itemCount = items?.length || 0
      const headerNote = header ? ` → "${header}"` : ''
      return {
        title: title || 'Untitled Menu',
        subtitle: `${itemCount} item${itemCount !== 1 ? 's' : ''}${headerNote}`,
      }
    },
  },
})
