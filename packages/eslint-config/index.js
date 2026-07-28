module.exports = {
  base: require('./base.js'),
  react: require('./react.js'),
  // `boundaries` is gone. It exported an ESLint `overrides` block whose globs
  // never matched; it is replaced by ./boundary-rules.js (data) plus
  // ./boundaries-for.js (adapter), which consumers require directly by path.
  // Deleted outright rather than aliased, so any stale
  // `extends: ['@sugartown/eslint-config/boundaries']` fails loudly instead of
  // resolving to something that silently enforces nothing — which is exactly
  // how the original spent 176 days looking healthy. SUG-254.
  boundaryRules: require('./boundary-rules.js'),
  boundariesFor: require('./boundaries-for.js'),
}
