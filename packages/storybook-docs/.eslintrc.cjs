module.exports = {
  root: true,
  extends: ['@sugartown/eslint-config/react'],
  // Boundary rules are attached in SUG-254 Phase 3, once the glob-free scope
  // mechanism replaces boundaries.js. Deliberately not wired to the old
  // `@sugartown/eslint-config/boundaries` here: that config is inert (its
  // overrides[].files globs anchor to the consuming package's own directory),
  // so extending it would add the appearance of enforcement and none of it.
}
