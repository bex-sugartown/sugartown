import { useId } from 'react'
import styles from './Switch.module.css'

export default function Switch({ label, hint, className = '', ...props }) {
  const id = useId()

  return (
    <label className={[styles.row, className].filter(Boolean).join(' ')}>
      <div className={styles.labelGroup}>
        {label && <span className={styles.labelText}>{label}</span>}
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      <input type="checkbox" role="switch" id={id} className={styles.input} {...props} />
      <span className={styles.track} aria-hidden="true" />
    </label>
  )
}
