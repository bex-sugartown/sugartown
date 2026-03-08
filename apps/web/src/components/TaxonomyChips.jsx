/**
 * TaxonomyChips — generic chip renderer for taxonomy classification surface.
 *
 * Renders projects, categories, tags, and tools as linked chips in a consistent order.
 * Each chip links to its canonical taxonomy detail page via getCanonicalPath().
 * Color-aware: project and category chips use colorHex (via CSS custom property)
 * for border and text accent when available.
 *
 * Visual rendering delegates to the DS Chip component (via web adapter),
 * achieving visual consistency with Storybook and the Card component.
 *
 * Usage:
 *   <TaxonomyChips
 *     categories={doc.categories}
 *     tags={doc.tags}
 *     projects={doc.projects}
 *     tools={doc.tools}
 *   />
 *
 * Props:
 *   categories — array of { _id, name, slug, colorHex? }
 *   tags       — array of { _id, name, slug }
 *   projects   — array of { _id, name, slug, colorHex? }
 *   tools      — array of { _id, name, slug }
 *   className  — optional extra class on the chip list wrapper
 *   size       — 'sm' | 'md' (default: 'md')
 *
 * Safe fallback: chips with a missing slug render as a non-linked <span>.
 * Chips render in order: projects → categories → tags → tools.
 * Duplicates (by _id) are removed before render.
 */
import { getCanonicalPath } from '../lib/routes'
import { Chip } from '../design-system'
import styles from './TaxonomyChips.module.css'

export default function TaxonomyChips({ categories, tags, projects, tools, className, size = 'md' }) {
  // Build ordered chip list: projects → categories → tags → tools
  const raw = [
    ...(projects ?? []).map((p) => ({ ...p, kind: 'project' })),
    ...(categories ?? []).map((c) => ({ ...c, kind: 'category' })),
    ...(tags ?? []).map((t) => ({ ...t, kind: 'tag' })),
    ...(tools ?? []).map((t) => ({ ...t, kind: 'tool' })),
  ]

  // Deduplicate by _id (guards against duplicate references in Sanity data)
  const seen = new Set()
  const chips = raw.filter((chip) => {
    if (!chip._id || seen.has(chip._id)) return false
    seen.add(chip._id)
    return true
  })

  if (!chips.length) return null

  return (
    <ul
      className={[styles.chipList, className].filter(Boolean).join(' ')}
      aria-label="Content classification"
    >
      {chips.map((chip) => {
        // Resolve the canonical URL path (or undefined if no slug)
        const href = chip.slug
          ? getCanonicalPath({ docType: chip.kind, slug: chip.slug })
          : undefined

        return (
          <li key={chip._id}>
            <Chip
              label={chip.name}
              href={href}
              colorHex={chip.colorHex}
              size={size}
            />
          </li>
        )
      })}
    </ul>
  )
}
