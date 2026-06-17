import styles from './Select.module.css'

export default function Select({ children, className = '', ...props }) {
  return (
    <div className={styles.wrapper}>
      <select className={[styles.select, className].filter(Boolean).join(' ')} {...props}>
        {children}
      </select>
      <span className={styles.chevron} aria-hidden="true" />
    </div>
  )
}
