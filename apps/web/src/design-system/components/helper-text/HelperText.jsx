import styles from './HelperText.module.css'
export default function HelperText({ id, children, className }) {
  return (
    <p id={id} className={[styles.helperText, className].filter(Boolean).join(' ')}>
      {children}
    </p>
  )
}
