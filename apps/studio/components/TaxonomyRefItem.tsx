/**
 * TaxonomyRefItem — visible remove button for taxonomy reference arrays
 *
 * Registered globally via form.components.item in sanity.config.ts.
 * Adds an explicit X button on hover for items in categories[], tags[], and tools[]
 * arrays, working around a missing context-menu in Sanity v5.13.
 *
 * Uses useDocumentOperation().patch instead of the raw onRemove callback
 * so that a draft is created automatically when the document is published.
 *
 * For all other arrays, delegates to the default rendering unchanged.
 */

import {type ItemProps, useFormValue, useDocumentOperation} from 'sanity'
import {CloseIcon} from '@sanity/icons'

const TAXONOMY_ARRAYS = new Set(['categories', 'tags', 'tools'])

export function TaxonomyRefItem(props: ItemProps) {
  const pathLen = props.path.length
  const parentField = pathLen >= 2 ? props.path[pathLen - 2] : null
  const isTaxonomy =
    typeof parentField === 'string' && TAXONOMY_ARRAYS.has(parentField)

  // Hooks must be called unconditionally (React rules-of-hooks).
  const docId = (useFormValue(['_id']) as string | undefined) ?? ''
  const docType = (useFormValue(['_type']) as string | undefined) ?? ''
  const publishedId = docId.replace(/^drafts\./, '')
  const ops = useDocumentOperation(publishedId, docType)

  if (!isTaxonomy) {
    return props.renderDefault(props)
  }

  // Extract the array item's _key from the path (e.g. ['categories', {_key:'x'}])
  const lastSegment = props.path[pathLen - 1]
  const itemKey =
    typeof lastSegment === 'object' &&
    lastSegment !== null &&
    '_key' in lastSegment
      ? (lastSegment as {_key: string})._key
      : null

  const handleRemove = () => {
    if (!parentField || !itemKey || !publishedId) return
    // patch.execute handles draft creation automatically.
    ops.patch.execute([{unset: [`${parentField}[_key=="${itemKey}"]`]}])
  }

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
      <div style={{flex: 1}}>{props.renderDefault(props)}</div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={!itemKey || !publishedId}
        title="Remove"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--card-badge-critical-fg-color, #f03e2f)',
          opacity: 0.7,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7' }}
      >
        <CloseIcon />
      </button>
    </div>
  )
}
