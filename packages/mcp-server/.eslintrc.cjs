const boundariesFor = require('@sugartown/eslint-config/boundaries-for.js')

module.exports = {
  root: true,
  extends: ['@sugartown/eslint-config/base'],
  env: {
    node: true,
  },
  // Was a 20-line hand-copied overrides block, added by SUG-225 as a local
  // workaround when boundaries.js was found inert. It worked — it was the only
  // live boundary rule in the monorepo — but it worked by duplicating rule text
  // that could drift from the shared source silently. SUG-254 retires the
  // local-redeclare pattern rather than replicating it to the other packages.
  rules: boundariesFor('packages/mcp-server').rules,
}
