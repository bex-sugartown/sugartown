import { useState, useEffect, useRef } from 'react'
import Button from '../design-system/components/button/Button'
import { Field, Input, Textarea } from '@sugartown/design-system'
import styles from './Form.module.css'

const RECAPTCHA_SITE_KEY = '6Lcf9pMsAAAAAOM7s8cUPaoyhFEnV3WE5cZfXusG'

const encode = (data) =>
  Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')

function loadRecaptchaScript() {
  if (window.grecaptcha?.execute) return Promise.resolve()
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      const check = setInterval(() => {
        if (window.grecaptcha?.execute) { clearInterval(check); resolve() }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => { window.grecaptcha.ready(() => resolve()) }
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    document.head.appendChild(script)
  })
}

function validateFields(fields, schema) {
  const errors = {}
  schema.forEach(({ name, label, required, validate }) => {
    if (required && !fields[name]?.trim()) {
      errors[name] = `${label} is required`
    } else if (validate) {
      const msg = validate(fields[name])
      if (msg) errors[name] = msg
    }
  })
  return errors
}

/**
 * Form — generic form pattern. Renders Field[] from a field schema.
 *
 * Field schema entry: { name, label, type, rows?, required?, validate?, autoComplete? }
 *
 * Submission:
 * - `action` (string): Netlify form name — submits to `/` with `form-name` + reCAPTCHA
 * - `onSubmit` (function): called with field values; handles submission externally
 */
export default function Form({ fields: fieldSchema, action, onSubmit: onSubmitProp, submitLabel = 'Submit' }) {
  const initialValues = Object.fromEntries(fieldSchema.map(({ name }) => [name, '']))
  const [values, setValues] = useState(initialValues)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errors, setErrors] = useState({})
  const recaptchaReady = useRef(false)

  useEffect(() => {
    if (action) {
      loadRecaptchaScript().then(() => { recaptchaReady.current = true })
    }
  }, [action])

  function handleChange(e) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateFields(values, fieldSchema)
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setStatus('submitting')
    try {
      if (onSubmitProp) {
        await onSubmitProp(values)
      } else if (action) {
        const recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'form_submit' })
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encode({ 'form-name': action, 'g-recaptcha-response': recaptchaToken, ...values }),
        })
        if (!res.ok) throw new Error(`${res.status}`)
      }
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.form}>
        <div className={styles.successMessage} role="status">
          <h3 className={styles.successHeading}>Message sent</h3>
          <p className={styles.successBody}>Thanks for reaching out. I'll get back to you soon.</p>
        </div>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {fieldSchema.map(({ name, label, type = 'text', rows, autoComplete }) => (
        <Field key={name} label={label} htmlFor={`form-${name}`} errorMessage={errors[name]}>
          {type === 'textarea' ? (
            <Textarea
              id={`form-${name}`}
              name={name}
              rows={rows ?? 6}
              value={values[name]}
              onChange={handleChange}
              disabled={status === 'submitting'}
            />
          ) : (
            <Input
              id={`form-${name}`}
              name={name}
              type={type}
              value={values[name]}
              onChange={handleChange}
              autoComplete={autoComplete}
              disabled={status === 'submitting'}
            />
          )}
        </Field>
      ))}

      {/* Honeypot — hidden from users, catches bots */}
      <p className={styles.honeypot}>
        <label>
          Don't fill this out if you're human:
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      {status === 'error' && (
        <p className={styles.formError} role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <Button type="submit" variant="primary" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : submitLabel}
      </Button>
    </form>
  )
}
