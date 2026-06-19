/**
 * SyncRelatedAction — bidirectional related-field sync on publish
 *
 * Wraps the default PublishAction for glossaryTerm, article, node, and caseStudy.
 * When the editor publishes, for each ref in the doc's related/relatedTerms field
 * this action ensures the referenced doc has a reverse ref back to this doc.
 *
 * Covered field pairs (both directions):
 *   glossaryTerm.relatedTerms ↔ glossaryTerm.relatedTerms (glossaryTermRef items only)
 *   article/node/caseStudy.related ↔ article/node/caseStudy.related
 *
 * Excluded: wp.* legacy IDs, relatedTags, relatedTools, relatedContent (no back-ref field).
 */

import {useState} from 'react'
import {type DocumentActionProps, type DocumentActionComponent, useClient} from 'sanity'

const SYNC_CONFIG: Record<string, {
  field: string
  filterRefType: string | null
  newRefType: string
}> = {
  glossaryTerm: {field: 'relatedTerms', filterRefType: 'glossaryTermRef', newRefType: 'glossaryTermRef'},
  article:      {field: 'related',      filterRefType: null,               newRefType: 'reference'},
  node:         {field: 'related',      filterRefType: null,               newRefType: 'reference'},
  caseStudy:    {field: 'related',      filterRefType: null,               newRefType: 'reference'},
}

export function createSyncRelatedAction(
  WrappedAction: DocumentActionComponent,
): DocumentActionComponent {
  const SyncRelatedAction = (props: DocumentActionProps) => {
    const wrapped = WrappedAction(props)
    const [syncing, setSyncing] = useState(false)
    const client = useClient({apiVersion: '2025-05-01'})

    const config = SYNC_CONFIG[props.type]
    if (!config || !wrapped) return wrapped

    return {
      ...wrapped,
      label: syncing ? 'Syncing…' : (wrapped.label ?? 'Publish'),
      disabled: syncing || wrapped.disabled,
      onHandle: async () => {
        setSyncing(true)
        try {
          await syncRelatedRefs(props, config, client)
        } finally {
          setSyncing(false)
          wrapped.onHandle?.()
        }
      },
    }
  }

  SyncRelatedAction.displayName = 'SyncRelatedAction'
  return SyncRelatedAction
}

async function syncRelatedRefs(
  props: DocumentActionProps,
  config: (typeof SYNC_CONFIG)[string],
  client: ReturnType<typeof useClient>,
) {
  const currentPublishedId = props.id.replace(/^drafts\./, '')
  const doc = (props.draft ?? props.published) as Record<string, any> | null
  if (!doc) return

  const rawRefs: any[] = doc[config.field] ?? []
  const targetRefs = config.filterRefType
    ? rawRefs.filter((r) => r._type === config.filterRefType)
    : rawRefs

  for (const ref of targetRefs) {
    const targetId: string | undefined = ref._ref
    if (!targetId || targetId === currentPublishedId || targetId.startsWith('wp.')) continue

    const alreadyLinked = await client.fetch<number>(
      `count(*[_id == $id && defined(${config.field}[_ref == $backRef])])`,
      {id: targetId, backRef: currentPublishedId},
    )
    if (alreadyLinked > 0) continue

    const newKey = `sync-${Math.random().toString(36).slice(2, 10)}`
    const newRef = {_key: newKey, _type: config.newRefType, _ref: currentPublishedId}

    const existing = await client.fetch<{_id: string}[]>(
      `*[_id in [$id, $draftId]]{_id}`,
      {id: targetId, draftId: `drafts.${targetId}`},
    )
    if (existing.length === 0) continue

    const tx = client.transaction()
    for (const version of existing) {
      tx.patch(version._id, (p: any) =>
        p.setIfMissing({[config.field]: []}).insert('after', `${config.field}[-1]`, [newRef]),
      )
    }
    await tx.commit()
  }
}
