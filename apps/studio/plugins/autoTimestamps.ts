/**
 * autoTimestampsPlugin
 *
 * Wraps the Publish document action for content types that carry
 * publishedAt / updatedAt fields. On every publish:
 *
 *   updatedAt   → always overwritten with current datetime
 *   publishedAt → set to current datetime only if currently empty
 *                 (preserves any value the author has manually entered)
 *
 * initialValue on the field handles new-document pre-population.
 * This plugin handles the "on re-publish" case.
 *
 * Applied to: node, article, caseStudy, page
 */

import {definePlugin, useDocumentOperation, type DocumentActionComponent, type DocumentActionProps} from 'sanity'

const TIMESTAMPED_TYPES = new Set(['node', 'article', 'caseStudy', 'page'])

function withAutoTimestamp(OriginalAction: DocumentActionComponent): DocumentActionComponent {
  return function AutoTimestampPublish(props: DocumentActionProps) {
    const {patch} = useDocumentOperation(props.id, props.type)
    const original = OriginalAction(props)

    if (!original) return null

    return {
      ...original,
      onHandle: () => {
        const now = new Date().toISOString()
        const mutations: Array<{set: Record<string, string>}> = [
          {set: {updatedAt: now}},
        ]

        // publishedAt: set only if missing — never overwrite user's choice
        if (!props.draft?.publishedAt) {
          mutations.push({set: {publishedAt: now}})
        }

        patch.execute(mutations)
        original.onHandle?.()
      },
    }
  }
}

export const autoTimestampsPlugin = definePlugin({
  name: 'sugartown-auto-timestamps',
  document: {
    actions: (prev, {schemaType}) => {
      if (!TIMESTAMPED_TYPES.has(schemaType)) return prev
      return prev.map((action) =>
        action.action === 'publish' ? withAutoTimestamp(action) : action,
      ) as DocumentActionComponent[]
    },
  },
})
