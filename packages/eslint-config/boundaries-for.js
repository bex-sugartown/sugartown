/**
 * boundaries-for.js — the single adapter both ESLint config systems consume.
 *
 * Turns the data in `boundary-rules.js` into a config fragment. Legacy v8
 * eslintrc packages spread it into their top-level `rules`; `apps/web`'s v9
 * flat config spreads it into a config object's `rules`. Same source, one
 * translation, so the v8/v9 split cannot produce two divergent rule sets — the
 * repo ran both for months with only the v8 side even attempting enforcement.
 *
 * Note the deliberate absence of `overrides`/`files`. Callers apply this at the
 * top level of their own config, which is already scoped to their package by
 * the lint invocation itself. Re-stating the scope as a glob is what broke the
 * previous implementation four different ways.
 *
 * CommonJS, and imported from `apps/web`'s ESM flat config with an explicit
 * `.js` extension. That extension is load-bearing: this package has no
 * `exports` map — adding one breaks v8's extension-search for the three legacy
 * consumers — and Node's ESM resolver does not extension-search.
 */

const { patternsFor } = require('./boundary-rules.js')

/**
 * @param {string} scope workspace dir relative to repo root, e.g. 'apps/web'
 * @returns {{ rules: Record<string, unknown> }}
 */
function boundariesFor(scope) {
  return {
    rules: {
      'no-restricted-imports': ['error', { patterns: patternsFor(scope) }],
    },
  }
}

module.exports = boundariesFor
module.exports.boundariesFor = boundariesFor
