const boundariesFor = require('@sugartown/eslint-config/boundaries-for.js')

module.exports = {
  root: true,
  extends: ['@sugartown/eslint-config/react'],
  // These helpers were moved out of apps/storybook precisely so packages could
  // import them without crossing a boundary. Rule 1 applies here so the package
  // cannot reach back into apps/ and recreate the coupling it was made to fix.
  rules: boundariesFor('packages/storybook-docs').rules,
}
