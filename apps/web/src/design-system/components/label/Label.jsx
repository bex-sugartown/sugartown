import styles from './Label.module.css'
export default function Label({ htmlFor, required = false, children, className }) {
  return (
    <label htmlFor={htmlFor} className={[styles.label, className].filter(Boolean).join(' ')}>
      {children}
      {required && <span className={styles.required} aria-hidden="true"> *</span>}
    </label>
  )
}
