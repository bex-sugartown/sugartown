import styles from './Checkbox.module.css'

export default function Checkbox({ label, id, className = '', ...props }) {
  return (
    <label className={[styles.row, className].filter(Boolean).join(' ')}>
      <input type="checkbox" id={id} className={styles.checkbox} {...props} />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}
