---
**Epic:** SUG-254 — Fix ESLint architectural boundary enforcement
**Linear Issue:** [SUG-254](https://linear.app/sugartown/issue/SUG-254/fix-eslint-architectural-boundary-enforcement-no-restricted-imports)
**Status:** Backlog — **paused 2026-07-27, blocked by [SUG-255](https://linear.app/sugartown/issue/SUG-255/restore-green-ci-zero-passing-runs-on-main-since-2026-05-10)**
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-254 — Fix ESLint architectural boundary enforcement

`packages/eslint-config/boundaries.js`'s `no-restricted-imports` rules have never actually fired for any package in the monorepo. Fix the enforcement mechanism across both legacy-eslintrc and flat-config packages, and remediate the real violations that surface once it's turned on.

---

## ⏸ Paused 2026-07-27 — read this before resuming

Activation began on 2026-07-27 and stopped during Phase 0. Its own Phase 0 (get to a green lint baseline so enforcement could be verified against something) uncovered that **CI has not passed once on `main` in the last 100 runs, since 2026-05-10**. That is now [SUG-255](https://linear.app/sugartown/issue/SUG-255/restore-green-ci-zero-passing-runs-on-main-since-2026-05-10), which **blocks this epic**: SUG-254's acceptance criterion "`pnpm lint` passes clean repo-wide" is unmeetable until CI is green.

No SUG-254 implementation work was done. The Phase 0 lint fixes (79 errors) were moved to SUG-255 where they belong, and landed on `main` as `52eb7702`. The feature branch was reset and holds nothing unique.

The activation audits **were** completed, and their results are recorded below. Do not re-derive them; re-verify cheaply and move on.

### Activation audit results (2026-07-27, empirical)

Verified via `--print-config` against each package's own ESLint binary and via the ESLint Node API. **Four** root causes, not the three this doc originally described:

| | Cause | Affects | Status |
|---|---|---|---|
| **A** | `overrides[].files` globs are repo-root-relative, but ESLint anchors them to the **consuming config's own directory** (the basePath of the config owning the extends chain), not repo root and not `boundaries.js`'s dir. `root: true` pins it, so changing cwd cannot help. | Rules 1, 2, 4 | confirmed; the competing "anchored to `packages/eslint-config/`" hypothesis was ruled out directly |
| **B** | Rules 1 and 2 both set `no-restricted-imports` on overlapping globs. ESLint override merge is **last-wins per rule** and does not merge `patterns` arrays — Rule 1 matches, then is discarded. | design-system, once A is fixed | confirmed: Rule1-only → `[["**/apps/**"]]`; Rule1+Rule2 as shipped → only Rule 2's patterns |
| **C** | `apps/web` / `apps/studio` / `apps/contentful-poc` are v9 flat config and cannot consume legacy `overrides[].files` at all. `@sugartown/eslint-config` also peer-deps `eslint ^8.0.0`. | Rule 3 | confirmed |
| **D** | **NEW.** Rule 4's glob is `packages/mcp-server/**/*.{ts}`. minimatch does **not** expand a single-element brace: `**/*.{ts}` vs `src/index.ts` → false; `{ts,tsx}` → true. | Rule 4 | confirmed; survives any fix to A |

**Net: exactly one boundary rule is live repo-wide** — the hand-redeclared block in `packages/mcp-server/.eslintrc.cjs` (`files: ['**/*.ts']`), which works because it is relative to that package's own directory. Fixing A alone is actively misleading: it leaves D dead, silently drops "packages cannot import apps" for design-system via B, and does nothing for C, while making the config *look* repaired.

### Three findings this doc did not anticipate

1. **`@sb-helpers/ChipDocs` can never be caught by Rule 1.** `no-restricted-imports` matches the **literal specifier string**, not the resolved path. Proven with the DS package's own ESLint: the deep relative path errors, the alias does not. The Vite alias at `apps/storybook/.storybook/main.ts:60` is a linter blindfold. Deleting the alias is the only Non-Goal-compliant remedy, and it is possible because `Chip.stories.tsx` is its sole consumer. **This must be an explicit deliverable, not a side effect.**
2. **`packages/mcp-server/src/tools/boundary.ts:31-36` live-`require`s `boundaries.js`** and reads `mod.overrides`, interpreting the globs as repo-root-relative — i.e. as *intended*, not as ESLint behaves. Its comment claims it "can never drift from what `pnpm lint` actually checks", while `pnpm lint` checked nothing. `sugartown_check_boundary` has been correctly answering "not permitted" for imports ESLint silently allowed: a false-confidence oracle. It breaks if `boundaries.js` is restructured, so it must change in the **same commit**.
3. **Two Scope items are vacuous as written.** No rule names `apps/studio` or `apps/storybook` as the *importing* side (Rule 3 restricts web FROM studio; nothing restricts studio itself), so there is no "equivalent enforcement to port" and no deliberate violation constructible. Adding one would violate this epic's own Non-Goals. `apps/studio` additionally has **no `lint` script at all** and 86 pre-existing problems (70 errors) if one were added. **Decision taken: strike both Scope items and their ACs**, record the reasoning, and encode the absence as an explicit allowlist entry rather than an omission. The "is storybook a package or an app?" item dissolves rather than resolves — storybook stays an app; moving the helper code out of `apps/` removes the tension.

### Confirmed violations (re-verify, do not re-derive)

| # | Rule | Location | Specifier |
|---|---|---|---|
| 1 | Rule 1 | `packages/design-system/src/components/PageHeader/PageHeader.stories.tsx:43` | `'../../../../../apps/storybook/.storybook/helpers/docs'` |
| 2 | Rule 1 | `packages/design-system/src/components/Chip/Chip.stories.tsx:5` | `'@sb-helpers/ChipDocs'` — invisible to lint, see finding 1 |
| 3 | *none* | `apps/web/src/components/EntityDetailPage.stories.jsx:24` | `'../../../../apps/storybook/.storybook/stories/EntityDetailPageDocs'` — app→app, not a rule violation, but breaks the moment the helpers move, so it must be handled in the same change |

Rules 2, 3 and 4 are otherwise clean, verified exhaustively (no dynamic imports, no type-only reaches, no workspace dep edges, no tsconfig paths into `apps/`).

### Approved approach

Replace glob-matched overrides with **explicit, glob-free scope keys** — a data-only `boundary-rules.js` (rules keyed by name + a `SCOPES` map + `patternsFor(scope)` returning one flat merged array, throwing loudly on an unknown scope) and a `boundaries-for.js` adapter consumed by **both** the v8 eslintrc packages and `apps/web`'s v9 flat config. Each package's lint run is already scoped to its own directory, so a rule never needs to know its own path — which is exactly what made the globs inert. This makes A, B and D structurally impossible rather than patched.

The two shared Storybook doc helpers move to a new source-only `packages/storybook-docs` (**not** into `packages/design-system`, whose tsconfig includes `src/` and would emit `.d.ts` for doc scaffolding unless given a second exclude — another "in `src/` but invisible to the build" island, which is why these violations went unnoticed in the first place).

Two helpers were already deleted as part of SUG-255's lint fix: `FilterBarDocs.tsx` and `ArchiveGridDocs.tsx`, zero importers, both unparseable, both marked "Gate 1 (API stability) NOT PASSED". Recoverable at `69d50c1b`. **Note:** `docs/reviews/rules-audit/2026-07.md:63` cites those two files as its only live evidence that the DS Documentation Authoring Gates are active; that row still needs annotating.

Full phase-by-phase plan, verification strategy, and file-level design: `~/.claude/plans/majestic-frolicking-sketch.md` (local only — reconstruct into this doc at resume).

### Amendment 2026-07-27 (post-mortem) — do not ship a second liveness checker

This epic's plan included a `scripts/validate-boundary-wiring.js` asserting that each boundary rule genuinely resolves. **That must not ship as its own mechanism.** SUG-255 now owns `validate:enforcement-liveness`, a general "does this gate actually fire" check extending `scripts/validate-validators.js`; boundary rules become one input to it.

The reason is this epic's own subject matter. The 2026-07-25→27 post-mortem found *five* separate declared-but-not-firing mechanisms — `boundaries.js`'s four rules, the Chromatic job, the CI suite, `sugartown_check_boundary`, and `validate:validators` itself, which SUG-239 built expressly to prevent silent enforcement decay and which passes green while CI is red, because it verifies a validator is wired rather than that its result is read. Adding a fourth single-purpose checker to that pile reproduces the fault it is meant to catch. One liveness mechanism, many inputs.

**Sequencing consequence:** SUG-254's verification phase now depends on SUG-255 Phase 5, in addition to the existing block on SUG-255 Phases 1–3 for a green baseline.

---

## Background

Discovered as a friction note during SUG-225 (Sugartown MCP Server v1). Root cause confirmed empirically via `eslint --print-config` probes against each package's real installed ESLint binary, and turns out to be three distinct, compounding gaps, not one:

1. **Glob-anchoring bug** — affects the three packages that actually reference `boundaries.js` via legacy eslintrc `extends`: `packages/design-system`, `packages/mcp-server`, `apps/storybook` (all on ESLint v8.57.1). The override `files` globs are written repo-root-relative (`'packages/design-system/**/*.{ts,tsx,js,jsx}'`), but ESLint resolves them relative to the **consuming package's own root-config directory**, not repo root and not `boundaries.js`'s own directory. Reproduced directly: a probe config nested so the target file's path relative to the root-config directory matched the pattern fired correctly; the real repo structure never satisfies that, so real invocations get zero matches, always.
2. **Rule-collision bug** (independent, only matters once #1 is fixed) — Rule 1 (`packages/**`) and Rule 2 (`packages/design-system/**`) both set `no-restricted-imports` on overlapping files. ESLint's override merge is last-wins, not additive: Rule 2 fully replaces Rule 1's config for design-system files. Confirmed empirically — a probe with corrected anchoring showed only Rule 2's message present when both should have applied.
3. **Never wired in at all** — `apps/web` and `apps/studio` are on ESLint v9 flat config (`eslint.config.js` / `eslint.config.mjs`), which has no `extends: ['@sugartown/eslint-config/boundaries']` mechanism. Rule 3 ("apps/web cannot import apps/studio") has never been enforceable for `apps/web`, independent of the glob bug — this app was never connected to `boundaries.js` in the first place.
4. **Compounding, `apps/storybook`-specific** — even after fixing #1, its `lint` script is `eslint .storybook --ext .ts,.tsx`, scoped only to the `.storybook/` directory, which can never match any `packages/**`/`apps/**` boundary pattern regardless of anchoring.

`packages/mcp-server` already has a working local fix (shipped in SUG-225): a redeclared `overrides` block directly in its own `.eslintrc.cjs` using `files: ['**/*.ts']`, which resolves correctly because it's relative to that package's own directory (also the real lint-invocation cwd). SUG-225 deliberately did not extend this repo-wide — unknown blast radius, out of scope for that epic.

An audit has already been run (correcting the scoping bug to see what actually surfaces) against `packages/design-system`, `apps/web`, `apps/studio`:
- **Rule 1** (packages cannot import apps): **2 real violations**, both in `packages/design-system` — [`PageHeader.stories.tsx:43`](../../packages/design-system/src/components/PageHeader/PageHeader.stories.tsx) imports from `../../../../../apps/storybook/.storybook/helpers/docs`; [`Chip.stories.tsx:5`](../../packages/design-system/src/components/Chip/Chip.stories.tsx) imports `ChipGuidelinesPage` from `@sb-helpers/ChipDocs` — `@sb-helpers` is a bare-specifier alias defined in `apps/storybook/.storybook/main.ts:60`, not a real npm/workspace dependency (the import site carries a `@ts-expect-error` acknowledging the alias isn't in `tsconfig.json`).
- **Rule 2** (design-system must be CMS-agnostic): clean, no violations found.
- **Rule 3** (apps/web cannot import apps/studio): clean, no violations found.
- `packages/mcp-server`: confirmed clean — no `apps/` or `design-system` imports in source.

## Objective

After this epic: every package that should enforce an architectural boundary rule does so in a way that's empirically verified to actually apply (not just declared), across both the legacy-eslintrc packages (`design-system`, `mcp-server`, `storybook`) and the flat-config apps (`web`, `studio`). The rule-collision bug is fixed so overlapping rules compose instead of clobbering each other. The 2 known real violations are remediated. This epic touches only ESLint config files and import statements in existing source files — no Sanity schema, no GROQ, no rendered UI, no content.

## Scope

- [ ] Decide and implement a corrected enforcement mechanism for the legacy-eslintrc packages (`packages/design-system`, `packages/mcp-server`, `apps/storybook`) — layer: tooling. At activation, evaluate at least two real options: (a) replicate `packages/mcp-server`'s local-override pattern (redeclare a correctly-scoped `overrides` block directly in each package's own `.eslintrc.cjs`), vs (b) restructure `boundaries.js` into per-rule shareable modules with no file-glob dependency at all (since each package's own lint invocation is already scoped to itself, a rule doesn't need a repo-root-relative path to know which package it's running in). Whichever is chosen must also fix the Rule 1 / Rule 2 collision (#2 in Background) so both patterns are simultaneously active for `packages/design-system`.
- [ ] Port equivalent boundary enforcement into `apps/web`'s `eslint.config.js` (flat config) — layer: tooling. This is a new code path, not a fix to something broken — apps/web has never had this rule wired in.
- [ ] Port equivalent boundary enforcement into `apps/studio`'s `eslint.config.mjs` (flat config) — layer: tooling. Same caveat as above.
- [ ] Resolve `apps/storybook`'s lint-script scope gap (#4 in Background) — layer: tooling. Either widen `"lint": "eslint .storybook --ext .ts,.tsx"` to also cover whatever `.storybook`-adjacent source the boundary rule needs to see, or write an explicit, reasoned decision for why `apps/storybook`'s boundary rule is intentionally inert and where that's documented.
- [ ] Decide whether `apps/storybook` is a "package" or an "app" for Rule 1 purposes — layer: process/rule design. Packages currently cannot import ANY `apps/**`, including `apps/storybook` — but `packages/design-system`'s own Storybook stories naturally need Storybook helper code that lives in `apps/storybook`. This may require a documented exemption or a restructuring of where that helper code lives, not just a rule tweak.
- [ ] Remediate the 2 confirmed real violations in `packages/design-system` — layer: source code. Fix `PageHeader.stories.tsx:43` and `Chip.stories.tsx:5` by moving the shared Storybook-helper code (`apps/storybook/.storybook/helpers/docs`, `apps/storybook/.storybook/helpers/ChipDocs.tsx`) to a location `packages/design-system` can legitimately depend on (or restructure so design-system's own stories don't need it) — not by carving out a rule exception for these two files.
- [ ] Re-run `pnpm lint` (`turbo run lint`) across the whole repo with every corrected rule active and confirm zero unintended new violations beyond the 2 already known and remediated above — layer: verification.

## Acceptance criteria

- [ ] `packages/design-system`, `packages/mcp-server`, `apps/storybook` each have a `no-restricted-imports` config that is empirically confirmed via `eslint --print-config` (run against a real source file, using each package's own actual lint invocation) to apply its intended rule(s).
- [ ] Rule 1 and Rule 2 no longer collide for `packages/design-system` — `eslint --print-config` on a design-system source file shows both patterns' `group`/`message` present simultaneously (or a single merged declaration covering both), not just the last-declared one.
- [ ] `apps/web`'s flat config enforces "cannot import `apps/studio`" — verified by introducing a deliberate test violation, confirming `pnpm --filter web lint` fails on it, then reverting the test violation.
- [ ] `apps/studio`'s flat config enforces its applicable boundary rule(s) — verified the same way (deliberate violation → lint fails → revert).
- [ ] `PageHeader.stories.tsx:43` and `Chip.stories.tsx:5` no longer import anything under `apps/storybook`, and `pnpm --filter @sugartown/design-system lint` passes clean with the corrected rules active.
- [ ] `apps/storybook`'s lint-script scope decision (fix or documented exemption) is written down in this epic's close-out and, if fixed, verified the same deliberate-violation way.
- [ ] The `apps/storybook` package-vs-app classification decision for Rule 1 is written down explicitly, with the rule or exemption reflecting it.
- [ ] `pnpm lint` passes clean repo-wide with all corrected rules active.

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, layout token, or multi-page rendered component changes. This epic is ESLint tooling config and import-path restructuring only; nothing it touches is rendered UI.

## Technical notes

- **Content Write Gate:** not applicable — no Sanity content writes.
- **Schema changes:** not applicable.
- **Upstream dependencies:** none blocking. SUG-225 (shipped, v0.31.0) is the origin/trigger for this epic but is already complete; this epic can proceed independently.
- **Activation audits (must be re-run before implementation begins, since repo state may have shifted since this epic was scoped):**
  - Re-verify the root-cause findings still hold: run `eslint --print-config` against a representative source file in each of `packages/design-system`, `packages/mcp-server`, `apps/storybook`, `apps/web`, `apps/studio`, using each package's own real local ESLint binary (not a hoisted or `npx`-resolved one — confirm via `<pkg>/node_modules/.bin/eslint --version` first, since this repo runs ESLint v8.57.1 for the legacy-config packages and v9.39.2 for the flat-config apps side by side).
  - Read `packages/eslint-config/index.js`, `base.js`, `react.js` to confirm exactly how `boundaries.js` composes with the other shared configs before restructuring it.
  - Re-run the violation audit (grep + read, not just the rule declarations) for `packages/design-system`, `apps/web`, `apps/studio` immediately before implementation — the 2 known violations and 2 clean results may have changed since this epic was scoped.
  - Check whether `apps/contentful-poc` (which also has its own flat `eslint.config.mjs`, noticed during root-cause investigation but not audited) needs boundary enforcement too — not required by this epic's Scope, but worth a one-line note either way.
- **Model & Mode [REQUIRED]:** `/model opus` + plan mode. This is a monorepo-boundary architecture epic — the corrected enforcement mechanism spans legacy eslintrc and flat config across 5 packages, and the mechanism decision (per-package local overrides vs. restructuring `boundaries.js` into glob-free per-rule modules) has real ambiguity that benefits from a Pre-Execution Completeness Gate walkthrough before code changes begin.

## Non-Goals

- Not adding any new boundary rules beyond the 4 already defined in `boundaries.js` (packages↛apps, design-system CMS-agnostic, web↛studio, mcp-server↛design-system) — this epic fixes enforcement of existing rules; it does not expand the rule set.
- Not migrating `packages/design-system`, `apps/storybook`, or `packages/mcp-server` off legacy ESLint v8 to flat config v9 — that is a separate, larger tooling migration. This epic's fix must work within the current legacy/flat split as it exists today.
- Not auditing `packages/design-system`, `apps/web`, or `apps/studio` for violations of any lint rule other than these 4 `no-restricted-imports` boundary rules.
- Not resolving `apps/contentful-poc`'s boundary-enforcement status beyond a one-line note (see Activation audits) — flagged as a possible future gap, not remediated here, since it wasn't part of the original audit scope.

## Related

- **Linear:** [SUG-254](https://linear.app/sugartown/issue/SUG-254/fix-eslint-architectural-boundary-enforcement-no-restricted-imports)
- **Origin:** `docs/shipped/SUG-225-sugartown-mcp-server-v1.md` (Post-Epic Close-Out → Friction line)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time (Doc Type Coverage / Query Layer / Schema Enum Audit are not applicable to this epic — no schema or GROQ surface — state that explicitly at activation rather than leaving them blank).
