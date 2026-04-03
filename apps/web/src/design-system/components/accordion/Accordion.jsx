/**
 * Accordion — web app adapter of the DS Accordion visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Accordion/Accordion.tsx
 * CSS sync: Accordion.module.css must match DS Accordion.module.css.
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import { useState, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './Accordion.module.css'

export default function Accordion({
  items,
  multi = false,
  defaultOpen = [],
  className,
}) {
  const [openIds, setOpenIds] = useState(new Set(defaultOpen))
  const baseId = useId()

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(multi ? prev : [])
      if (prev.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const classNames = [styles.accordion, className].filter(Boolean).join(' ')

  if (!items || items.length === 0) return null

  return (
    <div className={classNames}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id)
        const triggerId = `${baseId}-trigger-${item.id}`
        const panelId = `${baseId}-panel-${item.id}`

        return (
          <div
            key={item.id}
            className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
          >
            <button
              id={triggerId}
              type="button"
              className={styles.trigger}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
            >
              <span className={styles.triggerLabel}>{item.trigger}</span>
              <ChevronDown
                size={20}
                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                aria-hidden="true"
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
            >
              <div className={styles.panelInner}>{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
