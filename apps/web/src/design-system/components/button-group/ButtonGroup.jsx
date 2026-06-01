/**
 * ButtonGroup — web adapter (SUG-126).
 * Mirrors: packages/design-system/src/components/ButtonGroup/ButtonGroup.tsx
 * Layout-only primitive — codifies multi-button flex strip.
 */
import styles from './ButtonGroup.module.css'

export default function ButtonGroup({ children, align = 'start', wrap = true, className }) {
  return (
    <div className={[styles.group, styles[align], wrap ? styles.wrap : '', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
