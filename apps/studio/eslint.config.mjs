import studio from '@sanity/eslint-config-studio'
import globals from 'globals'

export default [
  ...studio,

  // Node scripts run outside the Studio bundle, so they need Node globals
  // (console, process). Without this every one of them fails no-undef. SUG-257.
  {
    files: ['scripts/**', 'migrations/**'],
    languageOptions: {
      globals: globals.node,
    },
  },
]
