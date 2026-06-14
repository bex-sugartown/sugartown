/**
 * PreviewBanner — persistent bar shown when preview mode is active.
 *
 * Renders above the sticky Header so all page content shifts down naturally.
 * Only imported when `VITE_SANITY_PREVIEW=true` is set (dev-only) — the
 * conditional import in App.jsx lets Vite tree-shake this from production builds.
 *
 * EPIC-preview-ui · Preview UI Chrome
 */
import { useSyncExternalStore } from 'react'
import styles from './PreviewBanner.module.css'
import { subscribePreviewDoc, getPreviewDoc, studioEditUrl } from '../lib/previewDoc'

export default function PreviewBanner() {
  const doc = useSyncExternalStore(subscribePreviewDoc, getPreviewDoc, () => null)

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div className={styles.inner}>
        <span className={styles.icon} aria-hidden="true">&#9888;</span>
        <span>Preview Mode — showing draft content</span>
        <a
          className={styles.studioLink}
          href={studioEditUrl(doc)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {doc ? 'Edit this in Studio' : 'Open Studio'}
        </a>
      </div>
    </div>
  )
}
