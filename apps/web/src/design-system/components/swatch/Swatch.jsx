/**
 * Swatch — web adapter.
 * Mirrors: packages/design-system/src/components/Swatch/Swatch.tsx
 *
 * Renders a square color dot + mono uppercase label.
 * color: CSS color string, or null for outlined empty square.
 * size: dot size in px, default 8.
 */
import styles from './Swatch.module.css'

export default function Swatch({ color, label, size = 8, className }) {
  const dotStyle = { width: size, height: size, ...(color ? { background: color } : {}) }
  return (
    <span className={[styles.swatch, className].filter(Boolean).join(' ')} style={color ? { color } : undefined}>
      <span
        className={color ? styles.dot : `${styles.dot} ${styles.dotOutlined}`}
        style={dotStyle}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
