/**
 * SegmentedControl — web adapter
 *
 * Mirrors: packages/design-system/src/components/SegmentedControl/SegmentedControl.tsx
 *
 * Two variants:
 *   "pill"  — connected pill track, text labels (CWV mobile/desktop toggle, default)
 *   "icon"  — spaced individual icon buttons (archive grid/list/graph toggle)
 *
 * Both variants use radiogroup semantics with arrow-key navigation.
 * The archive ArchivePage.jsx layoutToggleGroup should migrate to variant="icon".
 */
import { useCallback } from 'react'
import styles from './SegmentedControl.module.css'

export default function SegmentedControl({
  options,
  value,
  onChange,
  variant = 'pill',
  'aria-label': ariaLabel = 'View options',
  className,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      const idx = options.findIndex((o) => o.value === value)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        onChange(options[(idx + 1) % options.length].value)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        onChange(options[(idx - 1 + options.length) % options.length].value)
      }
    },
    [options, value, onChange]
  )

  const groupClass = [
    variant === 'pill' ? styles.pill : styles.iconGroup,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={groupClass}
      onKeyDown={handleKeyDown}
    >
      {options.map((opt) => {
        const isActive = opt.value === value
        const btnClass = [
          variant === 'pill' ? styles.pillSegment : styles.iconBtn,
          isActive && (variant === 'pill' ? styles.pillActive : styles.iconBtnActive),
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.ariaLabel ?? opt.label}
            tabIndex={isActive ? 0 : -1}
            className={btnClass}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon}
            {opt.label && <span>{opt.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
