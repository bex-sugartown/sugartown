/**
 * buildSnapshot — Sanity data written into the served HTML at build time (#235, #236).
 *
 * scripts/build-page-snapshots.mjs writes it; the app reads it so the first render does not wait
 * on a Sanity query. The app still refetches and swaps in live data, so a stale snapshot shows
 * only until that fetch returns.
 *
 * | Snapshot      | In                     | Read by   | Why                                      |
 * |---------------|------------------------|-----------|------------------------------------------|
 * | home          | dist/index.html        | HomePage  | content and hero paint without the query |
 * | siteSettings  | index.html, app.html   | App       | header paints with the page (no shift)   |
 */
import { isPreviewMode } from './contentState'

export const SNAPSHOT_ELEMENT_IDS = {
  home: 'st-home-snapshot',
  siteSettings: 'st-site-settings-snapshot',
}

/** A snapshot's data, or undefined. Never in preview mode (preview shows drafts; snapshots are published content). */
export function readBuildSnapshot(elementId) {
  if (typeof document === 'undefined' || isPreviewMode()) return undefined
  const el = document.getElementById(elementId)
  if (!el) return undefined
  try {
    return JSON.parse(el.textContent) ?? undefined
  } catch {
    return undefined
  }
}

/** The build-time homepage document on `/`, else undefined. */
export function readHomeSnapshot() {
  if (typeof window === 'undefined' || window.location.pathname !== '/') return undefined
  return readBuildSnapshot(SNAPSHOT_ELEMENT_IDS.home)
}
