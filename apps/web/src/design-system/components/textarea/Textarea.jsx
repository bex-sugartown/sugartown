import styles from './Textarea.module.css'
export default function Textarea({
  id, name, rows = 4, value, defaultValue, placeholder,
  disabled = false, hasError = false, 'aria-describedby': ariaDescribedby,
  onChange, onBlur, className,
}) {
  return (
    <textarea
      id={id} name={name} rows={rows} value={value} defaultValue={defaultValue}
      placeholder={placeholder} disabled={disabled} aria-describedby={ariaDescribedby}
      aria-invalid={hasError || undefined} onChange={onChange} onBlur={onBlur}
      className={[styles.textarea, hasError && styles.error, disabled && styles.disabled, className].filter(Boolean).join(' ')}
    />
  )
}
