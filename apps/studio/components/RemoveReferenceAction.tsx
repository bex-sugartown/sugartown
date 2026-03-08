/**
 * RemoveReferenceAction — unlink a category/tag/tool from a referencing document
 *
 * Used inside defineIncomingReferenceDecoration on category.ts, tag.ts, and tool.ts.
 * Each decoration creates a field-specific instance via the factory:
 *   createRemoveReferenceAction('categories')   — for category docs
 *   createRemoveReferenceAction('tags')          — for tag docs
 *   createRemoveReferenceAction('tools')         — for tool docs
 *
 * The action patches the *referencing* document (article / node / caseStudy)
 * to remove the current category, tag, or tool from its array field.
 */

import {useState} from 'react'
import {getDraftId, useFormValue, type SanityDocument} from 'sanity'
import {type IncomingReferenceAction} from 'sanity/structure'
import {TrashIcon} from '@sanity/icons'

export function createRemoveReferenceAction(
  fieldName: 'categories' | 'tags' | 'tools',
): IncomingReferenceAction {
  const labelMap: Record<string, string> = {
    categories: 'category',
    tags: 'tag',
    tools: 'tool',
  }
  const label = labelMap[fieldName]

  const RemoveAction: IncomingReferenceAction = ({document, getClient}) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const client = getClient({apiVersion: '2025-05-01'})

    // Current document = the category or tag being viewed
    const currentDoc = useFormValue([]) as Pick<SanityDocument, '_id'> | undefined
    const sourceId = currentDoc?._id?.replace(/^drafts\./, '')

    const docTitle =
      (document as SanityDocument & {title?: string}).title || document._id

    return {
      label: 'Unlink',
      icon: TrashIcon,
      tone: 'critical',
      disabled: !sourceId,
      dialog: dialogOpen
        ? {
            type: 'confirm' as const,
            message: `Remove this ${label} from "${docTitle}"?`,
            onCancel: () => setDialogOpen(false),
            onConfirm: async () => {
              if (!sourceId) return
              const publishedId = document._id.replace(/^drafts\./, '')
              const draftId = getDraftId(publishedId)

              // Find every version of this document (published and/or draft).
              const docs = await client.fetch<SanityDocument[]>(
                `*[_id in [$draftId, $publishedId]]{ _id }`,
                {draftId, publishedId},
              )
              if (docs.length === 0) return

              // Patch ALL existing versions so the reference disappears
              // immediately from the "Assigned content" panel — no manual
              // publish step required.
              const tx = client.transaction()
              for (const doc of docs) {
                tx.patch(doc._id, (p) =>
                  p.unset([`${fieldName}[_ref=="${sourceId}"]`]),
                )
              }
              await tx.commit()
              setDialogOpen(false)
            },
          }
        : null,
      onHandle: () => setDialogOpen(true),
    }
  }

  return RemoveAction
}
