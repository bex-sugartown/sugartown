import { useState } from 'react'
import Button from '../design-system/components/button/Button'
import styles from './ContactForm.module.css'

const encode = (data) =>
  Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')

export default function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errors, setErrors] = useState({})

  function validate() {
    const next = {}
    if (!fields.name.trim()) next.name = 'Name is required'
    if (!fields.email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      next.email = 'Please enter a valid email address'
    }
    if (!fields.message.trim()) next.message = 'Message is required'
    return next
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', ...fields }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.contactForm}>
        <div className={styles.successMessage} role="status">
          <h3 className={styles.successHeading}>Message sent</h3>
          <p className={styles.successBody}>
            Thanks for reaching out. I'll get back to you soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      className={styles.contactForm}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.field}>
        <label htmlFor="contact-name" className={styles.label}>Name</label>
        <input
          id="contact-name"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          type="text"
          name="name"
          value={fields.name}
          onChange={handleChange}
          autoComplete="name"
          disabled={status === 'submitting'}
        />
        {errors.name && (
          <p className={styles.errorText} role="alert">{errors.name}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-email" className={styles.label}>Email</label>
        <input
          id="contact-email"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          type="email"
          name="email"
          value={fields.email}
          onChange={handleChange}
          autoComplete="email"
          disabled={status === 'submitting'}
        />
        {errors.email && (
          <p className={styles.errorText} role="alert">{errors.email}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message" className={styles.label}>Message</label>
        <textarea
          id="contact-message"
          className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
          name="message"
          rows={6}
          value={fields.message}
          onChange={handleChange}
          disabled={status === 'submitting'}
        />
        {errors.message && (
          <p className={styles.errorText} role="alert">{errors.message}</p>
        )}
      </div>

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

      <Button
        type="submit"
        variant="primary"
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
