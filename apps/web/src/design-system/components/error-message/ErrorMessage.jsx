import styles from './ErrorMessage.module.css'
export default function ErrorMessage({ id, children, className }) {
  return (
    <p id={id} role="alert" aria-live="polite" className={[styles.errorMessage, className].filter(Boolean).join(' ')}>
      {children}
    </p>
  )
}
