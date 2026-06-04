import React from 'react'
import styles from './Field.module.css'

export default function Field({ label, htmlFor, helperText, errorMessage, required = false, children, className }) {
  const helperId = helperText ? `${htmlFor}-helper` : undefined
  const errorId = errorMessage ? `${htmlFor}-error` : undefined
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined

  const control = React.Children.only(children)
  const controlWithProps = React.cloneElement(control, {
    'aria-describedby': describedBy,
    hasError: Boolean(errorMessage),
  })

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      {controlWithProps}
      {helperText && <p id={helperId} className={styles.helperText}>{helperText}</p>}
      {errorMessage && (
        <p id={errorId} role="alert" aria-live="polite" className={styles.errorMessage}>{errorMessage}</p>
      )}
    </div>
  )
}
