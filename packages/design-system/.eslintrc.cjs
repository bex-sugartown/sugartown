const boundariesFor = require('@sugartown/eslint-config/boundaries-for.js')

module.exports = {
  root: true,
  extends: ['@sugartown/eslint-config/react'],
  // Rules applied at the top level, not via overrides[].files. The globs this
  // replaces anchored to THIS directory rather than repo root, so they matched
  // nothing — and where Rule 1 and Rule 2 did overlap, ESLint's last-wins merge
  // threw Rule 1 away. patternsFor() returns one flat merged array, and a single
  // declaration cannot collide with itself. SUG-254.
  rules: boundariesFor('packages/design-system').rules,
}
