/**
 * TaxonomyChips — generic chip renderer for taxonomy classification surface.
 *
 * Renders projects, categories, and tags as visual pills in a consistent order.
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
 * Non-linked for now — taxonomy detail pages are placeholder (Stage 8+).
 * Chips render in order: projects → categories → tags.
 */
import styles from './TaxonomyChips.module.css'

export default function TaxonomyChips({ categories, tags, projects, className }) {
  const chips = [
    ...(projects ?? []).map((p) => ({ ...p, kind: 'project' })),
    ...(categories ?? []).map((c) => ({ ...c, kind: 'category' })),
    ...(tags ?? []).map((t) => ({ ...t, kind: 'tag' })),
  ]

  if (!chips.length) return null

  return (
    <ul
      className={[styles.chipList, className].filter(Boolean).join(' ')}
      aria-label="Content classification"
    >
      {chips.map((chip) => (
        <li
          key={chip._id}
          className={[styles.chip, styles[chip.kind]].join(' ')}
          style={chip.colorHex ? { '--chip-color': chip.colorHex } : undefined}
        >
          {chip.name}
        </li>
      ))}
    </ul>
  )
}
