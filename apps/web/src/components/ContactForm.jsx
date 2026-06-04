import { useState, useEffect, useRef } from 'react'
import Button from '../design-system/components/button/Button'
import Field from '../design-system/components/field/Field'
import Input from '../design-system/components/input/Input'
import Textarea from '../design-system/components/textarea/Textarea'
import styles from './ContactForm.module.css'

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

export default function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errors, setErrors] = useState({})
  const recaptchaReady = useRef(false)

  useEffect(() => {
    loadRecaptchaScript().then(() => { recaptchaReady.current = true })
  }, [])

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
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setStatus('submitting')
    try {
      const recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact_submit' })
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', 'g-recaptcha-response': recaptchaToken, ...fields }),
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
          <p className={styles.successBody}>Thanks for reaching out. I'll get back to you soon.</p>
        </div>
      </div>
    )
  }

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
      <Field label="Name" htmlFor="contact-name" errorMessage={errors.name}>
        <Input
          id="contact-name"
          name="name"
          type="text"
          value={fields.name}
          onChange={handleChange}
          autoComplete="name"
          disabled={status === 'submitting'}
        />
      </Field>

      <Field label="Email" htmlFor="contact-email" errorMessage={errors.email}>
        <Input
          id="contact-email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          autoComplete="email"
          disabled={status === 'submitting'}
        />
      </Field>

      <Field label="Message" htmlFor="contact-message" errorMessage={errors.message}>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          value={fields.message}
          onChange={handleChange}
          disabled={status === 'submitting'}
        />
      </Field>

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
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
