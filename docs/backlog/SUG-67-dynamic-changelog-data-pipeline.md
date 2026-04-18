**Linear Issue:** [SUG-67](https://linear.app/sugartown/issue/SUG-67/dynamic-changelog-data-pipeline-build-time-parse-to-json)

## EPIC NAME: Dynamic CHANGELOG data pipeline — build-time parse to JSON with PortableText variables

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — search all 5 layers for existing changelog/version/release utilities:
  - `apps/web/src/lib/version.js` (or wherever the footer version strip reads from — SUG-65 added build-time version + date injection; confirm shape and whether this epic should extend it or sit alongside)
  - `apps/web/src/components/portableTextComponents.jsx` × 2 instances + `apps/web/src/components/PageSections.jsx` (serializer registry per MEMORY.md — a new variable-interpolation pre-processor must be applied to all three OR centralised into a shared helper consumed by all three)
  - `scripts/` — existing Node build scripts (validators, version injectors) for the conventions this parser should match
  - Vite config in `apps/web/vite.config.js` — confirm the plugin hook style used by existing generators
- [ ] **Use case coverage** — list consumers: (a) homepage updates ticker (SUG-66) if Option A selected, (b) `/platform` page hero/body copy, (c) any PortableText body with `{{release.*}}` tokens, (d) footer version strip if it migrates off its current source. Confirm the reader works in both SSG-friendly contexts (build-time import) and runtime contexts (client-side read of the imported JSON).
- [ ] **Layout contract** — N/A (no visual output from this epic; purely data + interpolation utility). Visual consumers own their own layout.
- [ ] **All prop value enumerations** — `release.kind` enum must be defined: `MAJOR | MINOR | PATCH`. Parser infers from semver diff (X.Y.Z). Optional `descriptor` label (free text from CHANGELOG heading line).
- [ ] **Correct audit file paths** — verify before referencing:
  - `CHANGELOG.md` (root) exists ✓
  - `apps/web/src/lib/version.js` — confirm exact path (SUG-65 work)
  - `apps/web/vite.config.js` — confirm path
  - `scripts/` directory conventions
- [ ] **Dark / theme modifier treatment** — N/A (data layer).
- [ ] **Studio schema changes scoped** — **Out of scope.** This epic explicitly chooses "parse CHANGELOG" over "add `release` Sanity doc type". If a future epic promotes releases into Sanity, it owns that schema work with `feat(studio):` prefix.
- [ ] **Web adapter sync scoped** — N/A (no DS component).
- [ ] **Composition overlap audit** — N/A (no schema).
- [ ] **Atomic Reuse Gate** —
  1. Confirm no existing changelog parser across the 5 layers (expected: none; SUG-65's version injector reads `package.json`, not CHANGELOG)
  2. Consumed by ≥2 callers (SUG-66 ticker + `/platform` body + potential footer) — passes
  3. API composable: parser is a pure function, reader is a pure getter, interpolator takes `(text, data)` — no hidden state, no fixed slots

---

## Context

**Existing surfaces this epic touches:**
- `CHANGELOG.md` (root) — canonical ledger produced by the `/mini-release` workflow after every epic
- `apps/web/src/lib/version.js` — SUG-65 build-time version + date module (to be confirmed in Phase 0)
- `apps/web/vite.config.js` — where the build-time generator plugin is registered
- `apps/web/src/lib/portableTextComponents.jsx`, `apps/web/src/components/portableTextComponents.jsx`, `apps/web/src/components/PageSections.jsx` — PortableText serializer registry (MEMORY.md §PortableText Serializer Registry); the interpolation pre-processor must be applied consistently across all three OR all three must consume a single shared helper
- `apps/web/src/generated/` — new directory (gitignored); build-time output lives here

**Recent epics on the same surface:**
- SUG-65 (Footer Reset) — introduced build-time version + date injection pattern; this epic extends the same build-time generation approach to richer release data
- SUG-66 (Homepage Updates Ticker) — Phase 0 Option A depends on this pipeline; shipping SUG-67 first reduces SUG-66's scope to a single render-layer decision

**Doc types in scope:** none (data layer only). Consumers belong to other epics.

---

## Objective

Expose the root `CHANGELOG.md` as structured, typed data the application can read at build time — producing `apps/web/src/generated/releases.json` (shape: `{ current, all[], byKind, count, latestN }`) consumed via `apps/web/src/lib/releases.js`. Add a variable-interpolation helper (`interpolateReleaseVars(text, data)`) and a PortableText span-mark resolver so editors can write `{{release.current.version}}` or `{{release.count.minor}}` in Sanity body copy and have it render live release data. After this epic, CHANGELOG becomes the single source of truth for any release-related number or label shown on the site — the page cannot drift from the ledger because the render depends on the ledger.

Data layer: **none** (no Sanity schema).
Build layer: **Vite plugin** that runs `scripts/parse-changelog.js` before bundling and writes the JSON artifact.
Render layer: **`interpolateReleaseVars` helper** + PortableText mark + optional React hook `useReleases()`.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No      | No schema changes. Pages consume the variable via PortableText at render time. |
| `article`   | ☐ No      | Same — render-time consumer, not a schema change. |
| `caseStudy` | ☐ No      | Same. |
| `node`      | ☐ No      | Same. |
| `archivePage` | ☐ No    | Same. |

This epic is a **build tooling + render utility** epic. No doc type gains or loses a field.

---

## Phase 0 — Shape + interpolation syntax decision

> No implementation until this phase is signed off.

**Phase 0 deliverables:**

1. **Parser regex locked.** Sample the current `CHANGELOG.md` header conventions and write the regex explicitly in the spec. Expected form (confirm by reading the file):
   - `## [vX.Y.Z] — YYYY-MM-DD` or `## vX.Y.Z (YYYY-MM-DD)` or similar
   - Descriptor line immediately following the header (e.g. "Footer reset", "AI search optimization")
   - Section headers inside a release (`### Added`, `### Changed`, etc.) are ignored for this epic's output — descriptor + metadata only

2. **Output shape locked.** Proposed (subject to Phase 0 review):
   ```json
   {
     "generatedAt": "2026-04-18T16:30:00Z",
     "current": { "version": "0.21.3", "date": "2026-04-17", "descriptor": "Footer reset", "kind": "PATCH", "linearIssue": "SUG-65" },
     "latestN": [ /* same shape, top 5 */ ],
     "count": { "total": 42, "major": 0, "minor": 12, "patch": 30 },
     "all": [ /* full timeline, newest first */ ]
   }
   ```

3. **Interpolation syntax locked.** Proposed: `{{release.<path>}}` with dot-path access.
   - `{{release.current.version}}` → `"0.21.3"`
   - `{{release.current.descriptor}}` → `"Footer reset"`
   - `{{release.count.minor}}` → `12`
   - `{{release.latestN.0.version}}` → `"0.21.3"`
   - Unknown paths render as the raw token (fail-visible) in dev; stripped in prod (fail-quiet). Decision required in Phase 0.

4. **PortableText integration pattern decided.** Two options:
   - **Option A: Pre-process** — before handing blocks to `<PortableText>`, walk spans and replace `{{release.*}}` tokens in-place. Simple, applies once, works with any existing serializer.
   - **Option B: Custom span mark** — editors mark text with a `releaseVar` mark type pointing at a path. More "correct" but requires Studio schema work (conflicts with "no schema changes" scope).
   - **Recommended:** Option A. Keep out of Sanity; keep it a render-time transform.

5. **Fail mode decided.** If `releases.json` is missing at build time (fresh clone with no CHANGELOG, or parse failure), does the build fail or fall back to an empty shape? Recommended: **fail the build** with a clear error — silent fallbacks are how pages drift.

---

## Scope

- [ ] `scripts/parse-changelog.js` — pure Node, no deps beyond `fs`/`path`; exports a function so it can be unit-tested
- [ ] Vite plugin registration in `apps/web/vite.config.js` (runs parser on `buildStart`, re-runs on `CHANGELOG.md` change during dev)
- [ ] `apps/web/src/generated/releases.json` — add `apps/web/src/generated/` to `.gitignore`
- [ ] `apps/web/src/lib/releases.js` — exports `releases` (the imported JSON) + helpers:
  - `getCurrent()` → current release
  - `getLatestN(n)` → top N
  - `getCountByKind()` → `{ major, minor, patch, total }`
  - `interpolateReleaseVars(text, data?)` — pure string transform
- [ ] PortableText pre-processor utility: `apps/web/src/lib/portableTextReleaseVars.js` — walks `block.children[].text` and runs `interpolateReleaseVars`
- [ ] Wire pre-processor into the three serializer entry points OR centralise into a shared `renderPortableText()` consumed by all three (MEMORY.md §PortableText Serializer Registry)
- [ ] Unit tests for parser (fixture-based) and interpolator (edge cases: unknown path, nested array index, non-string input)
- [ ] Storybook story demonstrating variable rendering inside a PortableText block
- [ ] Documentation: short README snippet at top of `scripts/parse-changelog.js` listing supported tokens + a sample CHANGELOG entry

---

## Query Layer Checklist

N/A — no GROQ queries. This epic's "query" is reading a local JSON file imported at build time.

---

## Technical Constraints

- **Build-time only.** No network calls, no runtime filesystem access. The parser runs once per build; its output is a static import.
- **Pure functions.** Parser + interpolator must be pure (same input → same output) so they are trivially testable and cacheable.
- **No Sanity dependency.** This epic must not import from `@sanity/client` or schema files. The data lives entirely outside the CMS.
- **Serializer parity.** If the PortableText pre-processor is wired into one serializer location but not the others, editors will see `{{release.*}}` render correctly on articles but literally on section-builder text blocks. Either wire all three or centralise.
- **Fail-visible in dev, explicit in prod.** Unknown tokens must not silently disappear during authoring — the editor needs to see the typo.
- **CHANGELOG.md format is the contract.** If the parser requires the CHANGELOG to follow a stricter format than it currently does, update `docs/release-assistant-prompt.md` in the same commit so future releases conform.

---

## Acceptance Criteria

1. Running `pnpm build` (or `pnpm dev`) from `apps/web/` produces `apps/web/src/generated/releases.json` matching the locked shape.
2. Editing `CHANGELOG.md` during `pnpm dev` triggers a re-parse and HMR update within one reload.
3. A PortableText block containing `The site is at version {{release.current.version}}.` renders as `The site is at version 0.21.3.` on every page type (article, node, case study, page section builder).
4. An unknown token (`{{release.nonsense}}`) renders as the literal string in dev builds; strips to empty in prod builds.
5. If `CHANGELOG.md` is missing or unparseable, the build fails with a message pointing at the offending line.
6. Unit tests cover: MAJOR / MINOR / PATCH semver classification, date parsing, descriptor extraction, malformed entry handling, dot-path resolution with array indices, unknown-path behaviour per environment.
7. The Linear issue (SUG-67) has at least one commit referencing it on `origin/main` before transitioning to Done (CLAUDE.md §Linear Done = code in remote).

---

## Non-Goals

- Sanity `release` doc type (deferred; would be a separate epic if ever needed)
- Runtime / live changelog fetching from GitHub API
- `/changelog` aggregator page (SUG-66 or a follow-up owns render surfaces)
- Rewriting `/mini-release` workflow — this epic consumes the CHANGELOG it produces; it does not change the producer
- Publishing release notes to external channels (RSS, email, webhooks)

---

## Rollback Plan

1. Revert the Vite plugin registration in `apps/web/vite.config.js`
2. Remove the PortableText pre-processor wiring from the three serializer entry points
3. Delete `apps/web/src/generated/` (gitignored, safe to remove)
4. Leave `scripts/parse-changelog.js` and `apps/web/src/lib/releases.js` in place (dead code, but harmless) — or revert the commit entirely

No schema migration. No data migration. No downstream dependencies until SUG-66 or another consumer lands.

---

## Definition of Done

- All acceptance criteria pass
- Unit tests green, Storybook story published
- `pnpm validate:tokens` and `pnpm validate:urls` unaffected
- At least one PortableText block on a real Sanity document demonstrates a live `{{release.*}}` variable rendering correctly in preview
- Epic doc moved from `docs/backlog/` to `docs/shipped/` and Linear SUG-67 transitioned to Done
