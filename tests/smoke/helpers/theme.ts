import type { Page } from '@playwright/test'
import type { Theme } from './axe-allowlist'

// Theme control for the axe gate (ST-186). The site stores the choice in
// localStorage['st-theme'] and an inline script in apps/web/index.html applies it to
// <html data-theme> before first paint (apps/web/src/components/ThemeToggle.jsx).
const THEME_VALUE: Record<Theme, string> = {
  light: 'light-pink-moon',
  dark: 'dark-pink-moon',
}

// Call before page.goto. Setting storage before load is what makes the theme apply on
// first paint; clicking the toggle would add a click per test and test the toggle.
export async function applyTheme(page: Page, theme: Theme) {
  await page.addInitScript((value) => localStorage.setItem('st-theme', value), THEME_VALUE[theme])
}

// Call after the page has loaded. Throws if the theme did not apply, so a "dark" scan
// can never silently run against the light theme.
export async function assertTheme(page: Page, theme: Theme) {
  const actual = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  if (actual !== THEME_VALUE[theme]) {
    throw new Error(`assertTheme: expected data-theme "${THEME_VALUE[theme]}", found "${actual}"`)
  }
}
