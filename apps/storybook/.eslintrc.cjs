module.exports = {
  root: true,
  extends: ['@sugartown/eslint-config/react'],
  // No boundary rules by design — see NO_BOUNDARY_SCOPE in
  // packages/eslint-config/boundary-rules.js. No rule names apps/storybook as
  // the importing side, so there is nothing to enforce here; the previous
  // `extends: [.../boundaries]` line added the appearance of enforcement and
  // none of the substance. SUG-254.
}
