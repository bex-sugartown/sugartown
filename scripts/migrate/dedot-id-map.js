#!/usr/bin/env node
/**
 * dedot-id-map.js — SUG-260 Phase 1: the ID mapping module
 *
 * Pure functions, no I/O. Given the full document set, produce the
 * `wp.<type>.<id>` → `<type>-<slug>` mapping and the reference graph.
 *
 * Scheme (decided 2026-08-08, see docs/backlog/SUG-260-*.md §ID scheme):
 *   wp.person.bhead      → person-bex
 *   wp.caseStudy.166     → caseStudy-beauty-retail-from-monolith-to-microservice
 *   drafts.wp.node.1654  → drafts.node-ai-illustration-review-ethics-accessibility-ip
 *
 * The slug is capped at MAX_SLUG characters and cut at a hyphen boundary, never
 * mid-word. A draft always takes `drafts.` plus its published twin's final id,
 * computed from the shared published core id so the pair cannot diverge.
 */

export const MAX_SLUG = 50
export const DRAFT_PREFIX = 'drafts.'
export const WP_PREFIX = 'wp.'

/** True for any id this migration owns, published or draft. */
export function isWpId(id) {
  return id.startsWith(WP_PREFIX) || id.startsWith(DRAFT_PREFIX + WP_PREFIX)
}

/** Strip the drafts. prefix, returning the published core id. */
export function coreId(id) {
  return id.startsWith(DRAFT_PREFIX) ? id.slice(DRAFT_PREFIX.length) : id
}

/** Cut to `cap` characters at a hyphen boundary, never mid-word. */
export function truncateSlug(slug, cap = MAX_SLUG) {
  if (slug.length <= cap) return slug
  const cut = slug.slice(0, cap)
  const lastHyphen = cut.lastIndexOf('-')
  return (lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut).replace(/-+$/, '')
}

/**
 * Build the id mapping.
 *
 * @param {Array<object>} docs every document in the dataset, published and draft
 * @returns {{ mapping: Map<string,string>, collisions: string[], noSlug: string[], duplicates: string[] }}
 */
export function buildIdMap(docs) {
  const owned = docs.filter((d) => isWpId(d._id))
  const foreignIds = new Set(docs.filter((d) => !isWpId(d._id)).map((d) => d._id))

  // Pass 1 — base id per document, keyed so a draft and its twin agree.
  const prelim = new Map()
  for (const doc of owned) {
    const core = coreId(doc._id)
    const wpNumber = core.split('.')[2]
    const slug = doc?.slug?.current
    const base = slug
      ? `${doc._type}-${truncateSlug(slug)}`
      : `${doc._type}-${wpNumber}`
    prelim.set(doc._id, { core, base, wpNumber, isDraft: doc._id.startsWith(DRAFT_PREFIX) })
  }

  // Pass 2 — disambiguate on the *core* base, so twins resolve identically.
  const baseByCore = new Map()
  for (const { core, base } of prelim.values()) baseByCore.set(core, base)
  const baseCounts = new Map()
  for (const base of baseByCore.values()) {
    baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1)
  }

  const mapping = new Map()
  for (const [oldId, { base, wpNumber, isDraft }] of prelim) {
    const final = baseCounts.get(base) > 1 ? `${base}-${wpNumber}` : base
    mapping.set(oldId, isDraft ? DRAFT_PREFIX + final : final)
  }

  // Diagnostics the caller asserts on before writing anything.
  const produced = [...mapping.values()]
  const seen = new Set()
  const duplicates = []
  for (const id of produced) {
    if (seen.has(id)) duplicates.push(id)
    seen.add(id)
  }

  return {
    mapping,
    collisions: produced.filter((id) => foreignIds.has(id)),
    noSlug: owned.filter((d) => !d?.slug?.current).map((d) => d._id),
    duplicates,
  }
}

/**
 * Walk a document recursively and yield every reference.
 *
 * Deliberately structural rather than field-list-driven: 12 of the 39 reference
 * paths in this dataset live inside Portable Text markDefs and section arrays,
 * and a field list goes stale the first time an editor adds a link inside a new
 * section type.
 *
 * @param {object} doc
 * @param {(ref: string, path: string, node: object) => void} visit
 */
export function walkRefs(doc, visit) {
  const recurse = (node, path) => {
    if (Array.isArray(node)) {
      node.forEach((item, i) => recurse(item, `${path}[${i}]`))
      return
    }
    if (node === null || typeof node !== 'object') return
    if (typeof node._ref === 'string') {
      visit(node._ref, path, node)
      return
    }
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('_')) continue
      recurse(value, path ? `${path}.${key}` : key)
    }
  }
  recurse(doc, '')
}

/**
 * Deep-copy `doc`, rewriting every `_ref` found in `mapping`.
 *
 * @returns {{ doc: object, rewritten: number }}
 */
export function rewriteRefs(doc, mapping) {
  let rewritten = 0
  const transform = (node) => {
    if (Array.isArray(node)) return node.map(transform)
    if (node === null || typeof node !== 'object') return node
    if (typeof node._ref === 'string' && mapping.has(node._ref)) {
      rewritten += 1
      return { ...node, _ref: mapping.get(node._ref) }
    }
    const out = {}
    for (const [key, value] of Object.entries(node)) {
      out[key] = key.startsWith('_') ? value : transform(value)
    }
    return out
  }
  return { doc: transform(doc), rewritten }
}

/** Count every reference edge in the dataset that points at a mapped id. */
export function countMappedEdges(docs, mapping) {
  let edges = 0
  const sources = new Set()
  for (const doc of docs) {
    walkRefs(doc, (ref) => {
      if (mapping.has(ref)) {
        edges += 1
        sources.add(doc._id)
      }
    })
  }
  return { edges, sources }
}

/**
 * A reference that is allowed to point at nothing in this dataset.
 *
 * Weak references are designed to survive a missing target, and a
 * crossDatasetReference resolves against a different dataset entirely, so
 * checking either against local ids is wrong by construction. Found by the
 * pre-flight on its first run: `tasks.task` carries a weak cross-dataset ref at
 * `target.document`, which is Sanity's own Tasks feature working as intended.
 */
export function isUnresolvableByDesign(node) {
  return node._weak === true || node._type === 'crossDatasetReference'
}

/** Reference targets that do not exist in the dataset and are expected to. */
export function findDangling(docs) {
  const ids = new Set(docs.map((d) => d._id))
  const dangling = new Set()
  for (const doc of docs) {
    walkRefs(doc, (ref, _path, node) => {
      if (isUnresolvableByDesign(node)) return
      // A draft may legitimately reference a published id and vice versa.
      if (!ids.has(ref) && !ids.has(DRAFT_PREFIX + ref) && !ids.has(coreId(ref))) {
        dangling.add(ref)
      }
    })
  }
  return [...dangling]
}
