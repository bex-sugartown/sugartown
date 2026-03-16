/**
 * DraftBadge — inline badge for documents with unpublished changes in preview mode.
 *
 * Renders when:
 *   1. Preview mode is active (VITE_SANITY_PREVIEW=true)
 *   2. The document is draft-only (_id starts with "drafts.") OR has pending
 *      draft changes (_hasDraft === true from GROQ projection)
 *
 * Usage:
 *   <h1>{title}<DraftBadge docId={item._id} hasDraft={item._hasDraft} /></h1>
 *
 * EPIC-preview-ui · Preview UI Chrome
 */
import { isPreviewMode } from '../lib/contentState'
import styles from './DraftBadge.module.css'

export default function DraftBadge({ docId, hasDraft }) {
  if (!isPreviewMode()) return null
  if (!docId?.startsWith('drafts.') && !hasDraft) return null

  return (
    <span className={styles.badge} aria-label="Draft document">
      Draft
    </span>
  )
}
