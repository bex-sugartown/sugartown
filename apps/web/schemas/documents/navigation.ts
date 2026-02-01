import {defineType, defineField, defineArrayMember} from 'sanity'
import {MenuIcon} from '@sanity/icons'

/**
 * navItem - Recursive Navigation Item
 *
 * Used within navigation menus to support nested/dropdown menus
 */
const navItem = {
  name: 'navItem',
  title: 'Navigation Item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The text displayed for this menu item',
      validation: (Rule) =>
        Rule.required()
          .max(50)
          .error('Label is required and must be under 50 characters')
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link',
      description: 'Where this menu item navigates to',
      validation: (Rule) => Rule.required().error('Link is required')
    }),
    defineField({
      name: 'children',
      title: 'Dropdown Items',
      type: 'array',
      description: 'Optional: add child items to create a dropdown/mega menu',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'childNavItem',
          title: 'Child Navigation Item',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required().max(50)
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'link',
              validation: (Rule) => Rule.required()
            })
          ],
          preview: {
            select: {
              title: 'label',
              url: 'link.url'
            },
            prepare({title, url}) {
              return {
                title: title || 'Untitled Item',
                subtitle: url || 'No URL'
              }
            }
          }
        })
      ],
      validation: (Rule) =>
        Rule.max(10)
          .warning('Consider limiting dropdown menus to 10 items for usability')
    })
  ],
  preview: {
    select: {
      title: 'label',
      url: 'link.url',
      hasChildren: 'children'
    },
    prepare({title, url, hasChildren}) {
      return {
        title: title || 'Untitled Item',
        subtitle: `${url || 'No URL'}${hasChildren?.length ? ` (${hasChildren.length} items)` : ''}`
      }
    }
  }
}

/**
 * Navigation Document
 *
 * Reusable navigation menus for headers, footers, and sidebars
 * Supports nested menu items for dropdown/mega menus
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
          .error('Title is required and must be under 50 characters')
    }),
    defineField({
      name: 'items',
      title: 'Menu Items',
      type: 'array',
      description: 'The navigation menu structure',
      of: [defineArrayMember(navItem)],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('At least one menu item is required')
    })
  ],
  preview: {
    select: {
      title: 'title',
      items: 'items'
    },
    prepare({title, items}) {
      const itemCount = items?.length || 0
      return {
        title: title || 'Untitled Menu',
        subtitle: `${itemCount} item${itemCount !== 1 ? 's' : ''}`
      }
    }
  }
})
