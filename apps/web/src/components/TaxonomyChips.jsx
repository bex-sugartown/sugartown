/**
 * TaxonomyChips — generic chip renderer for taxonomy classification surface.
 *
 * Renders projects, categories, and tags as linked pills in a consistent order.
 * Each chip links to its canonical taxonomy detail page via getCanonicalPath().
 * Color-aware: project and category chips use colorHex (via CSS custom property)
 * for border and text accent when available.
 *
 * Usage:
 *   <TaxonomyChips
 *     categories={doc.categories}
 *     tags={doc.tags}
 *     projects={doc.projects}
 *   />
 *
 * Props:
 *   categories — array of { _id, name, slug, colorHex? }
 *   tags       — array of { _id, name, slug }
 *   projects   — array of { _id, name, slug, colorHex? }
 *   className  — optional extra class on the chip list wrapper
 *
 * Safe fallback: chips with a missing slug render as a non-linked <span>.
 * Chips render in order: projects → categories → tags.
 * Duplicates (by _id) are removed before render.
 */
import { Link } from 'react-router-dom'
import { getCanonicalPath } from '../lib/routes'
import styles from './TaxonomyChips.module.css'

export default function TaxonomyChips({ categories, tags, projects, className }) {
  // Build ordered chip list: projects → categories → tags
  const raw = [
    ...(projects ?? []).map((p) => ({ ...p, kind: 'project' })),
    ...(categories ?? []).map((c) => ({ ...c, kind: 'category' })),
    ...(tags ?? []).map((t) => ({ ...t, kind: 'tag' })),
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
        const chipClass = [styles.chip, styles[chip.kind]].join(' ')
        const chipStyle = chip.colorHex ? { '--chip-color': chip.colorHex } : undefined

        // Chips with no slug fall back to a non-linked span (no broken links)
        if (!chip.slug) {
          return (
            <li key={chip._id}>
              <span className={chipClass} style={chipStyle}>
                {chip.name}
              </span>
            </li>
          )
        }

        const path = getCanonicalPath({ docType: chip.kind, slug: chip.slug })

        return (
          <li key={chip._id}>
            <Link
              to={path}
              className={[chipClass, styles.chipLink].join(' ')}
              style={chipStyle}
            >
              {chip.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
