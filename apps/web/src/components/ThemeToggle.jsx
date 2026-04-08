/**
 * ThemeToggle — Sugartown Pink Moon
 *
 * Toggles between data-theme="light-pink-moon" and data-theme="dark-pink-moon" on <html>.
 * Persists preference to localStorage['st-theme'].
 * Default: light-pink-moon (set by inline script in index.html).
 *
 * Classic modes (dark/light) are accepted from localStorage for backward compat
 * but the toggle always switches to Pink Moon variants.
 */
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import styles from './ThemeToggle.module.css'

const STORAGE_KEY = 'st-theme'
const LIGHT = 'light-pink-moon'
const DARK = 'dark-pink-moon'

function isDarkTheme(t) {
  return t === DARK || t === 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') ?? LIGHT
  )

  // Sync React state if data-theme is changed externally (e.g. devtools)
  useEffect(() => {
    const el = document.documentElement
    const observer = new MutationObserver(() => {
      setTheme(el.getAttribute('data-theme') ?? LIGHT)
    })
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  function toggle() {
    const next = isDarkTheme(theme) ? LIGHT : DARK
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }

  const dark = isDarkTheme(theme)

  return (
    <button
      type="button"
      onClick={toggle}
      className={styles.toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}
