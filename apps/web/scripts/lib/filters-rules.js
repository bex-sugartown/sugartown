/**
 * filters-rules.js — the judging half of validate-filters.js (SUG-269, #93).
 *
 * Pure: archivePage + content items in, verdict out. No client, no env, no
 * process.exit, no console output. validate-filters.js fetches and prints; the
 * liveness probe feeds this same function a deliberately broken fixture.
 *
 * buildFilterModel is imported from src/lib/filterModel.js, the code the app
 * runs. Until #216 this file held a hand-synced copy, which had already drifted
 * (no contentType facet, a different default order, no groupByParent), so the
 * gate judged code the app did not run. Do not reintroduce a copy: the liveness
 * probe "validate:filters (judges the app's model)" fails if this file stops
 * re-exporting the app's own function.
 */

import { buildFilterModel } from '../../src/lib/filterModel.js'

// ─── WP-era key guard ─────────────────────────────────────────────────────────
// Hard fail if any of these keys appear in GROQ projections or model output.
// They were purged in v0.11.0 and must not reappear.

export const WP_KEYS = ['wp_category', 'wp_tag', 'gem_status', 'gem_related_project']

/**
 * detectWpKeys(obj, path) → string[]
 * Recursively walks an object and returns paths where WP-era keys are found.
 */
export function detectWpKeys(obj, path = '') {
  if (!obj || typeof obj !== 'object') return []
  const found = []
  for (const key of Object.keys(obj)) {
    const fullPath = path ? `${path}.${key}` : key
    if (WP_KEYS.includes(key)) {
      found.push(fullPath)
    }
    found.push(...detectWpKeys(obj[key], fullPath))
  }
  return found
}

/**
 * detectWpKeysInString(str) → string[]
 * Checks a GROQ query string for WP-era key substrings.
 */
export function detectWpKeysInString(str) {
  return WP_KEYS.filter((k) => str.includes(k))
}

export { buildFilterModel }

/**
 * Judge one archive: build its filter model and apply the error rules.
 * `fails` is true for every case validate-filters.js exits 1 on at the model stage:
 * buildFilterModel threw, it returned an _error, or WP-era keys are in its output.
 */
export function judgeArchive(archivePage, contentItems) {
  let model
  try {
    model = buildFilterModel(archivePage, contentItems)
  } catch (err) {
    return { model: null, threw: err.message, modelError: null, wpKeysInModel: [], fails: true }
  }
  if (model._error) {
    return { model, threw: null, modelError: model._error, wpKeysInModel: [], fails: true }
  }
  const wpKeysInModel = detectWpKeys(model)
  return { model, threw: null, modelError: null, wpKeysInModel, fails: wpKeysInModel.length > 0 }
}
