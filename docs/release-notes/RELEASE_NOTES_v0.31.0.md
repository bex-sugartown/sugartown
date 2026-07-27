# Release Notes — v0.31.0

**Date:** 2026-07-27
**Scope:** Sugartown monorepo (packages/mcp-server, apps/web, packages/design-system, apps/studio)

---

## What this release is

A new local MCP server that exposes the repo's own governance rules, schema, tokens, and boundary
data as callable tools for Claude Code sessions, alongside a GovernancePage accuracy pass, an
enforcement-visibility hardening pass, and workflow-gate conversions accumulated across the last
10 mini-releases.

---

## What changed

### Sugartown MCP Server (v1)

`packages/mcp-server` is a new local stdio MCP server exposing 8 read-only tools: schema lookup
(parsed live from Sanity document-type source via `ts-morph`), design-token lookup, component
existence checks, architectural-boundary checks, governance-rule lookup, field-name validation
against known deprecations, active-epic content, and recent changelog entries. `sugartown_get_gate_status`
is deferred to a future release.

Building it surfaced two accuracy corrections. Three of the six governance rules it exposes no
longer matched the live repo: the rule describing how `apps/web` should import the design system
had been reversed by an earlier release (`apps/web` now consumes `@sugartown/design-system`
directly, not the mirror pattern the rule originally described), and two other rules were being
attributed to the wrong source document. All three now reflect verified current state. Separately,
building the server's own boundary check surfaced that the repo's architectural-boundary ESLint
rules have never actually fired for any package, due to how ESLint resolves glob paths under this
monorepo's per-package lint invocation. This is fixed for `packages/mcp-server` itself; the same
defect remains open for the rest of the repo (see "Not in this release").

### GovernancePage accuracy pass

The workflow lifecycle diagram was replaced with an 8-phase, layer-tagged version and a doc-index
table mapping each phase to its real governing document. The AI Governance Coverage tiles were
rewritten in plain language to match the underlying schema's actual field intent, and the Release
Process diagram's gate numbering was corrected to match the real 7-gate process.

### Enforcement visibility

Two validators that existed but weren't wired anywhere (`validate:css-names`, `validate:taxonomy`)
are now enforced in pre-commit and CI respectively. A new `validate:validators` meta-check catches
any future validator that gets written but never wired in. `validate:schema-parity` now runs a real
local-vs-deployed schema diff instead of an always-passing stub.

### Testing infrastructure

Five Playwright route smoke tests (homepage, archive, detail, taxonomy, 404) now run against a
built preview in CI and block merge on failure — the first Playwright install in this repo.

### Workflow gates

The remaining human-approval skills that weren't yet using the standard select-list gate pattern
(`/mini-release`, `/morning`, `/eod`, `/switch`, `/new-epic`, `/glossy`, `/chromatic`, `/update-cwv`,
and the epic template) were converted to `AskUserQuestion`. Linear issue status now syncs
automatically through the epic lifecycle (Backlog → Todo → In Progress → Done), and 3 missing
dependency relations were backfilled.

### Design system

Fixed a build-time bug where several components (Grid, Card, Columns, Metric) silently lost their
styling in the packaged build — hyphenated CSS-module class names weren't matching the built
package's camelCased class map, dropping dividers, variant styling, layout, and trend colouring.

---

## Not in this release

- `sugartown_get_gate_status` (MCP tool) — deferred pending a machine-readable gate-status source.
- Repo-wide architectural-boundary ESLint enforcement — 3 of the 4 boundary rules in
  `packages/eslint-config/boundaries.js` still don't fire under `pnpm lint`, for any package other
  than the newly-added `packages/mcp-server`. This needs its own audit epic.

---

## Validator state at release

- `pnpm --filter @sugartown/mcp-server build` — zero TypeScript errors
- `pnpm --filter @sugartown/mcp-server lint` — zero violations; boundary rules verified to actually fire
- `pnpm validate:tokens` — 655 unique tokens, all references resolve
- `pnpm validate:style-mirror` — all enforced style + component mirrors byte-identical
- `pnpm validate:tokens --strict-colors` — no hardcoded colour values found
- `pnpm validate:dead-refs` — no new dead style references (4 pre-existing grandfathered)
- `pnpm validate:css-names` — no content-type-scoped CSS class names in pages/
- `pnpm validate:validators` — 10/11 validate:* scripts wired, 1 manual-by-design, 0 orphaned
