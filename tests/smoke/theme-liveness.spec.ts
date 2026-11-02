import { test, expect } from '@playwright/test'
import { assertTheme } from './helpers/theme'

// Liveness probe for the theme guard (ST-186, R-9). A page loaded without applyTheme is in
// the default light theme, so asserting dark must throw. If assertTheme ever stops checking,
// this fails, so a dark axe scan cannot pass while scanning the light theme.
test('theme guard throws when the dark theme was not applied', async ({ page }) => {
  await page.goto('/')
  await expect(assertTheme(page, 'dark')).rejects.toThrow(/dark-pink-moon/)
})
