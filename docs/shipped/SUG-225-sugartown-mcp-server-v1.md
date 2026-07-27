**Linear Issue:** SUG-225 _(the original author assigned SUG-207, then SUG-208 — both already taken by other epics. Confirmed and created via the Linear-first workflow on 2026-07-18.)_
## EPIC NAME: Sugartown MCP Server — v1 Implementation

---

## Model & Mode

**Recommendation: `opusplan`.** This is a genuine architectural-ambiguity epic per the template's own criteria: a new cross-cutting package (`packages/mcp-server/`) with no existing pattern to extend in this repo, a TypeScript-schema-file parsing strategy to design (ts-morph vs regex vs build-step), and an MCP protocol integration that has to get its tool-schema shapes right on the first pass (Claude Code sessions consume these tools directly — a malformed schema breaks every session that primes against it, not just one page). Plan under Opus, exit plan mode once the tool inventory and parsing approach are locked, execute under Sonnet.

---

## Pre-Execution Completeness Gate

This is a backend tooling epic with no page, component, schema, or visual surface. Most of the template's UI-oriented checklist items are structurally not applicable — stated explicitly below rather than silently skipped:

- [x] **Interaction surface audit** — N/A. No interactive element, button, link, or form control is created.
- [x] **Use case coverage** — N/A. No web adapter or consumer-facing component.
- [x] **Layout contract** — N/A. No layout or grid surface.
- [x] **All prop value enumerations** — N/A. No `select`/enum schema field is touched.
- [x] **Correct audit file paths** — Verified live on disk before writing this doc:
  - `apps/studio/schemas/` exists, contains `documents/` (23 doc type files), `objects/`, `sections/`, `index.ts`, `lib/` — confirmed via `ls`.
  - `apps/web/src/design-system/styles/tokens.css` and `packages/design-system/src/styles/tokens.css` both exist — confirmed via `ls`.
  - `CHANGELOG.md` exists at repo root with an `[Unreleased]` section using the documented format — confirmed via `head`.
  - `packages/eslint-config/boundaries.js` exists (64 lines) and encodes exactly the three rules the PRD describes (packages cannot import from apps; design-system must stay CMS-agnostic; — confirmed by reading the file directly, not from the PRD's description of it).
  - `docs/briefs/sugartown-mcp-prd.md` (v1.0, 2026-06-21) exists and is the source spec for this epic.
- [x] **Dark / theme modifier treatment** — N/A. No visual surface; standard Pink Moon constraints do not apply (stated explicitly in PRD §5).
- [x] **Studio schema changes scoped** — Explicitly out of scope. This epic makes zero changes to `apps/studio/schemas/`. The MCP server reads schema files as static TypeScript source; it does not modify them, register new types, or open a Studio session against them.
- [x] **Web adapter sync scoped** — N/A. No DS component is created or modified.
- [x] **Composition overlap audit** — N/A. No schema sub-object is added.
- [x] **Atomic Reuse Gate**:
  1. *Does this pattern already exist?* No — grepped the repo for `mcp-server`, `MCP`, and any existing `packages/mcp-*` directory. Nothing exists (`packages/` currently holds only `design-system`, `eslint-config`, `tsconfig`). No Linear issue previously tracked this work (confirmed by search before this epic doc was written).
  2. *Will this be consumed by more than one caller?* Yes — every future Claude Code session against this repo is a caller. This is the entire point of the PRD (§1: "Every Claude Code session... starts from zero").
  3. *Is the API composable?* Yes — each tool is a narrow, single-purpose read (`sugartown_get_schema`, `sugartown_get_tokens`, etc.) rather than one monolithic "get everything" call; tools are organized by concern (`tools/schema.ts`, `tools/tokens.ts`, `tools/component.ts`, ...) so a new tool extends the pattern rather than forking it.
- [x] **Token value cross-check** — N/A. No `--st-*` token is authored or consumed as a rendering decision; `sugartown_get_tokens` reads `tokens.css` as data, it does not apply tokens to a component.
- [x] **App.jsx routing pre-flight** — N/A. No page or route is added.
- [x] **Component-Reuse Manifest** — N/A (see below — no visual surface is added by this epic).
- [x] **Component registry update** — N/A. No DS component is created, retired, or structurally changed.

---

## Component-Reuse Manifest

N/A — this epic adds no page, section, or visual surface. `packages/mcp-server` is a backend Node process with no rendered output.

---

## Context

- `docs/briefs/sugartown-mcp-prd.md` (v1.0) is the complete product spec this epic implements. It is the primary reference for architecture, tool inventory, and constraints — this epic doc does not restate every detail, it operationalizes the PRD into an executable brief and resolves the PRD's open decisions.
- `packages/mcp-server/` does not exist yet. `packages/` currently contains `design-system`, `eslint-config`, `tsconfig`.
- `apps/studio/schemas/documents/` contains 23 document type files (e.g. `article.ts`, `caseStudy.ts`, `category.ts`) using Sanity's `defineType`/`defineField` pattern — this is the schema source `sugartown_get_schema` must parse.
- `apps/web/src/design-system/styles/tokens.css` and `packages/design-system/src/styles/tokens.css` are the two token files (generated from `tokens/source/tokens.json` via `pnpm tokens:build`) that `sugartown_get_tokens` must read.
- `packages/eslint-config/boundaries.js` (64 lines) is the live source of the three import-boundary rules that `sugartown_check_boundary` must expose as queryable facts — not a paraphrase, the actual `no-restricted-imports` patterns.
- `CHANGELOG.md` has a live `[Unreleased]` section following Keep a Changelog format — this is the source for `sugartown_get_changelog`.
- No prior epic has touched this surface; no Linear issue previously tracked it (verified by search before authoring this doc).

---

## Objective

After this epic, `packages/mcp-server/` exists as a buildable, lintable TypeScript package exposing 8 read-only MCP tools (v1 drops `sugartown_get_gate_status` per the PRD's own deferral) over stdio: `sugartown_get_schema`, `sugartown_get_tokens`, `sugartown_get_component`, `sugartown_check_boundary`, `sugartown_get_rule`, `sugartown_validate_field`, `sugartown_get_epic`, `sugartown_get_changelog`. It makes zero writes to Sanity, zero git operations, and imports nothing from `apps/*` or `packages/design-system`. `CLAUDE.md` and `packages/mcp-server/README.md` are updated with the tool-alias registration blocks specified in PRD §4. No Sanity schema, GROQ query, or React render-layer change is in scope — this epic is data-layer read tooling only, operating on files already on disk.

---

## Doc Type Coverage Audit

N/A — this epic does not add a field, section type, schema object, or renderer to any content document type. `sugartown_get_schema` reads existing schema *files* generically (by doc type name, resolved at call time) rather than hard-coding support for a subset of doc types; all 23 current document types are supported symmetrically by virtue of the parser walking `apps/studio/schemas/documents/*.ts` rather than an enumerated list.

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | N/A | No document schema changes in this epic — see Objective |
| `article`   | N/A | " |
| `caseStudy` | N/A | " |
| `node`      | N/A | " |
| `archivePage` | N/A | " |

---

## Schema Field Proposal

N/A — no new field is added to any Sanity schema in this epic.

---

## Open Decisions Resolved (carried from PRD §6)

| Decision | Resolution | Rationale |
|----------|-----------|-----------|
| TS schema parsing approach | **ts-morph** (full AST) | Regex-over-exports is exactly the brittleness risk flagged in the PRD's own Risks table (§7: "TypeScript schema parsing is brittle if file structure varies"). Schema files use `defineType`/`defineField` calls with nested objects (see `apps/studio/schemas/documents/*.ts`) — real parsing is needed, not string matching. A pre-compile-to-JSON build step adds an extra build dependency and a staleness risk (the JSON could drift from the `.ts` source between builds) for no benefit over reading the `.ts` files directly at call time. |
| Gate status source of truth | **No resolution needed — deferred with the tool.** | `sugartown_get_gate_status` is cut from v1 scope per PRD §9. This decision only becomes live if/when that tool is picked back up in a v2 epic. |
| MCP server startup mechanism | **Workspace-scoped pnpm script**, invoked manually or by Claude Code's own MCP client config — not a `predev` hook. | The PRD's own CLAUDE.md registration snippet (§4) already specifies `pnpm --filter @sugartown/mcp-server dev`. MCP servers are spawned on-demand by the MCP client (Claude Code), not by the web app's dev pipeline — a `predev` hook on the workspace root would wire an unrelated tool's lifecycle into every `pnpm dev` invocation for no reason. |
| External publication of `@sugartown/mcp-server` | **Internal-only for v1 — no resolution needed.** | Already stated as a v2 decision in PRD §6 and §9. Confirmed, not re-opened. |

---

## Scope

- [ ] Scaffold `packages/mcp-server/` (`package.json`, `tsconfig.json`, `src/index.ts`) per the PRD §4 file layout
- [ ] Add `@modelcontextprotocol/sdk` and `ts-morph` as dependencies
- [ ] Implement `src/lib/repo-root.ts` and `src/lib/file-reader.ts` (shared, `__dirname`-relative path resolution per PRD §7 risk mitigation)
- [ ] Implement `src/tools/schema.ts` → `sugartown_get_schema` (ts-morph AST read of `apps/studio/schemas/documents/*.ts`)
- [ ] Implement `src/tools/tokens.ts` → `sugartown_get_tokens` (reads both `tokens.css` files; tier filter by primitive/semantic/component)
- [ ] Implement `src/tools/component.ts` → `sugartown_get_component` (searches `packages/design-system/src/components/`, reports Storybook story count)
- [ ] Implement `src/tools/boundary.ts` → `sugartown_check_boundary` (reads `packages/eslint-config/boundaries.js` rules as data)
- [ ] Implement `src/tools/governance.ts` → `sugartown_get_rule` + `sugartown_validate_field` (static rule data per PRD §4, sourced from CLAUDE.md — the six named rules: `featuredImage`, `web-adapter-rule`, `single-field-authority`, `atomic-reuse-gate`, `orient-before-acting`, `four-slug-queries`)
- [ ] Implement `src/tools/epic.ts` → `sugartown_get_epic` (most-recently-modified file in `docs/backlog/`)
- [ ] Implement `src/tools/changelog.ts` → `sugartown_get_changelog` (parses `[Unreleased]` + last N versioned sections of `CHANGELOG.md`)
- [ ] Register all 8 tools in `src/index.ts` with `readOnlyHint: true`, `destructiveHint: false` annotations
- [ ] Add `packages/mcp-server/README.md` with the tool-alias reference table (PRD §4)
- [ ] Update `CLAUDE.md` with the MCP Server + MCP Tool Aliases sections (PRD §4, verbatim block)
- [ ] `pnpm --filter @sugartown/mcp-server build` passes with zero TypeScript errors
- [ ] `pnpm lint` passes on `packages/mcp-server` with zero boundary violations (no import from `apps/*` or `packages/design-system`)
- [ ] All 8 tools pass MCP Inspector validation

Not in scope this pass (explicit exclusions, see Non-Goals): `sugartown_get_gate_status`, any Sanity write tool, any git operation tool, Storybook rendering, Netlify orchestration, external npm publication.

---

## Query Layer Checklist

N/A — no GROQ query, section type, or field is added. This epic reads schema *files*, not the Sanity Content Lake API; no query is written or modified.

---

## Schema Enum Audit

N/A — no enum field is rendered or displayed. `sugartown_get_schema` returns a document type's raw field/type/validation data as read from source; it does not build a display-label map.

---

## Metadata Field Inventory

N/A — no MetadataCard or metadata-rendering surface is touched.

---

## Themed Colour Variant Audit

N/A — no themed surface, component, or CSS token value is authored. `sugartown_get_tokens` reads existing token values as data; it introduces no new token and renders nothing.

---

## Non-Goals

- **Write operations to Sanity** — the MCP is read-and-validate only (PRD §2). Mutations remain Claude Code's job via existing Sanity MCP tools, not this package's.
- **Git operations** (commits, branches, PRs) — out of scope; the five-gate close-out pipeline is a process, not an automation target here (PRD §2).
- **Storybook rendering** — component visual state is not callable via MCP; visual QA remains human-gated per CLAUDE.md's Visual Verification Rules (PRD §2).
- **Netlify deploy orchestration** — handled by GitHub Actions, not this package (PRD §2).
- **`sugartown_get_gate_status`** — deferred until gate tracking has a machine-readable source of truth (PRD §9). No Studio schema change is made to support it in this epic.
- **Studio schema changes** — this epic owns zero schema changes. If a future MCP tool needs schema *writes* (not reads), that is a separate epic with its own `feat(studio):` commit, per CLAUDE.md's Studio-schema-changes-get-their-own-commit rule.
- **Resume Factory and commerce adapter tools** — separate MCP scope, separate epic (PRD §9).

---

## Technical Constraints

**Monorepo / tooling**
- New workspace package at `packages/mcp-server/`, added automatically to `pnpm-workspace.yaml`'s existing `packages/*` glob — no workspace config change needed.
- Node.js >= 20, TypeScript, compiled to `dist/` via the package's own `tsc` build, invoked as `node dist/index.js`.
- `@modelcontextprotocol/sdk` and `ts-morph` are new dependencies scoped to `packages/mcp-server/package.json` only — not hoisted to root, not added to `apps/web` or `apps/studio`.

**Schema (Studio)**
- Zero schema changes. This package only *reads* `apps/studio/schemas/documents/*.ts` as TypeScript source via ts-morph static analysis — it does not import `sanity`, `@sanity/client`, or any Studio runtime code (PRD §5 constraint: "Zero Sanity API calls in v1. File-system reads only.").

**Query (GROQ)**
- N/A — no query layer touched.

**Render (Frontend)**
- N/A — no React component, page, or CSS is touched.

**Architectural boundary (specific to this package)**
- `packages/mcp-server` cannot import from `apps/*` (existing `no-restricted-imports` rule in `packages/eslint-config/boundaries.js`, rule 1 — applies automatically as a workspace member under `packages/**`).
- `packages/mcp-server` cannot import from `packages/design-system` — this is a *new* constraint specific to this package (the existing boundary rules only cover apps↔packages and design-system↔CMS, not package↔package). Add an explicit `no-restricted-imports` override for `packages/mcp-server/**/*.{ts}` targeting `packages/design-system` in the same commit that scaffolds the package, so the constraint is enforced by lint rather than convention alone.
- Zero `@sanity/client` or `sanity` imports anywhere in `packages/mcp-server/src/`.
- All 8 tool definitions carry `readOnlyHint: true` and `destructiveHint: false` per MCP tool annotation conventions.
- Error messages are actionable: `sugartown_get_schema` on an unknown doc type returns the list of valid doc types (enumerated from `apps/studio/schemas/documents/`); `sugartown_get_component` on a not-found name returns a `not_found` status with nearest-name suggestions.

---

## Migration Script Constraints

N/A — no migration or backfill script is in scope.

---

## Files to Modify

**New package**
- `packages/mcp-server/package.json` — CREATE
- `packages/mcp-server/tsconfig.json` — CREATE
- `packages/mcp-server/README.md` — CREATE (tool-alias table, PRD §4)
- `packages/mcp-server/src/index.ts` — CREATE (server entry, tool registration)
- `packages/mcp-server/src/tools/schema.ts` — CREATE
- `packages/mcp-server/src/tools/tokens.ts` — CREATE
- `packages/mcp-server/src/tools/component.ts` — CREATE
- `packages/mcp-server/src/tools/boundary.ts` — CREATE
- `packages/mcp-server/src/tools/governance.ts` — CREATE
- `packages/mcp-server/src/tools/epic.ts` — CREATE
- `packages/mcp-server/src/tools/changelog.ts` — CREATE
- `packages/mcp-server/src/lib/repo-root.ts` — CREATE
- `packages/mcp-server/src/lib/file-reader.ts` — CREATE

**Boundary enforcement**
- `packages/eslint-config/boundaries.js` — add package↔package override (`packages/mcp-server` cannot import `packages/design-system`)

**Docs**
- `CLAUDE.md` — add MCP Server + MCP Tool Aliases sections (top of file, per PRD §4)
- `docs/briefs/sugartown-mcp-prd.md` — update header: `Related epics: SUG-225`, `Status: Draft` → `Status: In implementation`

**No changes to:** `apps/studio/schemas/**` (read-only source), `apps/web/**`, `apps/web/src/lib/queries.js`, any `.module.css` file, `pnpm-workspace.yaml` (glob already covers new package).

---

## Deliverables

1. **Package** — `packages/mcp-server/` exists, builds via `pnpm --filter @sugartown/mcp-server build` with zero TypeScript errors
2. **8 tools implemented** — `sugartown_get_schema`, `sugartown_get_tokens`, `sugartown_get_component`, `sugartown_check_boundary`, `sugartown_get_rule`, `sugartown_validate_field`, `sugartown_get_epic`, `sugartown_get_changelog` — each callable via MCP Inspector with correct input/output schemas
3. **Boundary enforcement** — `pnpm lint` on `packages/mcp-server` reports zero violations; a deliberately-introduced `import ... from '../../apps/web/...'` (test-only, reverted) triggers the existing rule; a deliberately-introduced `import ... from '@sugartown/design-system'` triggers the new override
4. **Docs updated** — `CLAUDE.md` MCP section + `packages/mcp-server/README.md` alias table match PRD §4 verbatim
5. **PRD updated** — `docs/briefs/sugartown-mcp-prd.md` header reflects the real Linear issue ID and `Status: In implementation`

---

## Acceptance Criteria

- [ ] `pnpm --filter @sugartown/mcp-server build` passes with zero TypeScript errors
- [ ] `pnpm lint` passes on `packages/mcp-server` with zero boundary violations
- [ ] `sugartown_get_schema("caseStudy")` returns fields matching the live `apps/studio/schemas/documents/caseStudy.ts` file — zero discrepancies on manual spot-check against 3 sampled doc types
- [ ] `sugartown_get_tokens("semantic")` returns tokens with resolved values matching `tokens.css` — spot-checked against 5 sampled token names
- [ ] `sugartown_check_boundary("packages/mcp-server", "apps/web")` returns `permitted: false` with a rule reference sourced from `boundaries.js`
- [ ] `sugartown_check_boundary("packages/mcp-server", "packages/design-system")` returns `permitted: false` once the new override is added
- [ ] `sugartown_get_rule("featuredImage")` returns the deprecation instruction matching CLAUDE.md's stated rule, not a paraphrase
- [ ] `sugartown_get_component("Button")` returns a real path + story count for the existing DS Button component; `sugartown_get_component("Frobnicator")` returns `not_found` with suggestions
- [ ] `sugartown_get_epic()` returns the content of whichever file in `docs/backlog/` has the most recent mtime
- [ ] `sugartown_get_changelog(3)` returns exactly 3 entries from `CHANGELOG.md` matching the file's actual `[Unreleased]`/version content
- [ ] All 8 tools pass MCP Inspector schema validation
- [ ] Zero `@sanity/client` or `sanity` import anywhere under `packages/mcp-server/src/` (`grep -rn "@sanity/client\|from 'sanity'" packages/mcp-server/src/` returns nothing)

---

## Human QA Walkthrough

N/A (backend-only package, no browser-rendered surface). Human verification instead happens via MCP Inspector and direct tool invocation from a Claude Code session — listed above under Acceptance Criteria.

---

## Visual QA Gate

N/A — this epic produces no visual output. Per CLAUDE.md's Visual Verification Rules, the gate exists to prevent "builds without errors" being mistaken for "matches the spec" on rendered UI; there is no rendered UI here. The equivalent gate for this epic is the Acceptance Criteria's tool-output spot-checks above, which must be run and their actual output pasted into the close-out summary before Linear is marked Done.

---

## Risks / Edge Cases

**Schema risks**
- [ ] ts-morph parsing breaks if a schema file uses a non-standard export shape (e.g. a factory function wrapping `defineType` instead of a direct default export) — spot-check at least 3 doc type files with different authoring patterns (simple, one with `sections[]`, one with nested objects) before declaring the parser done, not just the first file tried.
- [ ] Does any schema file's `defineField` reference a field name that could be ambiguous across doc types (e.g. `status` exists on multiple types with different `options.list` per CLAUDE.md's Schema Enum Audit convention) — `sugartown_get_schema` must return per-doc-type field data, never a merged/deduped view across types.

**Query risks** — N/A, no query layer touched.

**Migration risks** — N/A, no migration script in scope.

**Path/portability risks**
- [ ] MCP server path resolution must use `__dirname`-relative resolution anchored to `packages/mcp-server/`, not `process.cwd()` or a hardcoded absolute path — verified by running the built server from a directory other than the repo root and confirming it still resolves `apps/studio/schemas/` correctly (PRD §7 risk).
- [ ] Governance rules in `governance.ts` are static data copied from CLAUDE.md at authoring time — they will drift silently if CLAUDE.md changes later and `governance.ts` isn't updated in lockstep. Add a one-line note to CLAUDE.md's own maintenance conventions (not this epic's scope to enforce mechanically, per PRD §7 — "add a note to the CLAUDE.md update checklist: sync governance.ts if rules change").

**Render risks** — N/A, no component rendered.

---

## Post-Epic Close-Out

Standard sequence per CLAUDE.md, with tooling-epic adjustments:

1. **Visual QA gate** — N/A, skip (no visual output; see Visual QA Gate section above for the substituted tool-output verification).
2. **Chromatic** — N/A, skip (no Storybook story, no visual surface).
3. **Data pipeline gap check** — N/A, this epic does not extend a build-time data pipeline.
3b. **Friction line** — none. Two accuracy gaps were caught and corrected during implementation, before any commit, rather than via a follow-up correction commit: (a) 3 of the 6 "sourced from CLAUDE.md" governance rules named in the PRD no longer matched the live repo — `web-adapter-rule` was actually inverted by SUG-224 (apps/web now consumes `@sugartown/design-system` directly, the opposite of the PRD's stated prohibition), and `orient-before-acting`/`four-slug-queries` live in sibling docs, never in CLAUDE.md itself. Resolved with the user via AskUserQuestion; `governance.ts` ships corrected, verified-live content. (b) `packages/eslint-config/boundaries.js`'s `no-restricted-imports` overrides have never actually fired for any package in this monorepo — ESLint resolves `overrides[].files` globs relative to the *linting* package's own root config directory, not repo root, so `boundaries.js`'s repo-root-relative globs (e.g. `'packages/**/*.{ts,tsx,js,jsx}'`) never match under `pnpm lint`'s per-package invocation via Turbo. Confirmed empirically, including against the pre-existing `packages/design-system` package. Fixed locally for `packages/mcp-server` (boundary rules redeclared in its own `.eslintrc.cjs` with package-relative globs) so this epic's own Deliverable #3 is genuinely enforced, not just documented; **Rules 1–3 in `boundaries.js` remain broken repo-wide and are out of scope here** — flagged as a follow-up (see below).
4. **Move epic doc** — `docs/backlog/SUG-225-sugartown-mcp-server-v1.md` → `docs/shipped/SUG-225-sugartown-mcp-server-v1.md`.
5. **Confirm clean tree** — `git status` clean.
6. **Release** — ran `/release` (MINOR bump), not `/mini-release`, per this doc's own note that a new package/feature surface may warrant MINOR — confirmed with the user before running.
7. **Update Linear** — transition SUG-225 to **Done**.

### Acceptance Criteria — actual results

All spot-checked directly against a built server (`node dist/index.js`) over stdio, plus `@modelcontextprotocol/inspector --cli`:

- `pnpm --filter @sugartown/mcp-server build` — zero TypeScript errors.
- `pnpm --filter @sugartown/mcp-server lint` — zero violations on clean tree; deliberately-introduced imports from `../../apps/web/...` and `@sugartown/design-system` (test-only, reverted) both triggered `no-restricted-imports` errors.
- `sugartown_get_schema("caseStudy")` — 12 top-level fields including nested `cardImage.fields[]` and `sections.arrayOf` (12 section types), validation chains resolved (e.g. `title`: `required().max(100).error(...)`). Also spot-checked `category.ts` (simple), `node.ts` (30 fields, `sections[]`), `tool.ts` (7 fields) — no parser crash across all 4 shapes.
- `sugartown_get_tokens("semantic")` — filtered correctly (e.g. `st-color-brand-primary` → `var(--st-color-pink)`, tier `semantic`); 655 tokens total (373 primitive / 198 component / 84 semantic per the naming-convention heuristic — no ground-truth tier field exists in `tokens.json`, documented as a heuristic in `tokens.ts`); zero mirror drift detected between the web and DS-package `tokens.css` copies.
- `sugartown_check_boundary("packages/mcp-server", "apps/web")` → `permitted: false`, rule text sourced live from `boundaries.js` via `createRequire`.
- `sugartown_check_boundary("packages/mcp-server", "packages/design-system")` → `permitted: false` once the new override was added.
- `sugartown_get_rule("featuredImage")` → returns corrected live status (see friction line above), not the original PRD paraphrase.
- `sugartown_get_component("Button")` → real path + `storyCount: 7`; `sugartown_get_component("Frobnicator")` → `not_found` with Levenshtein-nearest suggestions.
- `sugartown_get_epic()` → most-recently-modified file in `docs/backlog/` (currently `sugartown-backlog-priorities.md`, correct per the literal mtime rule — this is the priority index, not an individual epic; worth a note if the intent was ever "most recent SUG-* epic specifically").
- `sugartown_get_changelog(3)` → 3 entries, `[Unreleased]` first (non-empty), then the 2 most recent versioned sections.
- All 8 tools passed `@modelcontextprotocol/inspector --cli ... --method tools/list` schema validation and a live `tools/call`.
- `grep -rn "@sanity/client\|from 'sanity'" packages/mcp-server/src/` → no matches.

### Follow-up flagged (out of scope for SUG-225)

`packages/eslint-config/boundaries.js` Rules 1–3 (packages↔apps, design-system CMS-agnostic, web↔studio) do not actually fire under any current `pnpm lint` invocation, repo-wide, for the anchor-resolution reason above. This has been true since the rules were authored. Needs its own audit epic: confirm the scope of packages/files affected, decide the fix (per-package local overrides vs. a repo-root-invoked lint pass), and re-run lint to see what — if anything — was silently passing that shouldn't have been.
