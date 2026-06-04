import styles from './Input.module.css'
export default function Input({
  type = 'text', id, name, value, defaultValue, placeholder,
  disabled = false, hasError = false, autoComplete,
  'aria-describedby': ariaDescribedby,
  onChange, onBlur, className,
}) {
  return (
    <input
      type={type} id={id} name={name} value={value} defaultValue={defaultValue}
      placeholder={placeholder} disabled={disabled} autoComplete={autoComplete}
      aria-describedby={ariaDescribedby}
      aria-invalid={hasError || undefined} onChange={onChange} onBlur={onBlur}
      className={[styles.input, hasError && styles.error, disabled && styles.disabled, className].filter(Boolean).join(' ')}
    />
  )
}
