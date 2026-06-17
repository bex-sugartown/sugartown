import styles from './Radio.module.css'

export default function Radio({ label, id, className = '', ...props }) {
  return (
    <label className={[styles.row, className].filter(Boolean).join(' ')}>
      <input type="radio" id={id} className={styles.radio} {...props} />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}
