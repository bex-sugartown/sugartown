---
**Epic:** SUG-254 — Fix ESLint architectural boundary enforcement
**Linear Issue:** [SUG-254](https://linear.app/sugartown/issue/SUG-254/fix-eslint-architectural-boundary-enforcement-no-restricted-imports)
**Status:** Phases 1–7 complete 2026-07-28, close-out pending Chromatic review — originally paused 2026-07-27, blocked by [SUG-255](https://linear.app/sugartown/issue/SUG-255/restore-green-ci-zero-passing-runs-on-main-since-2026-05-10)**
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

- [x] Decide and implement a corrected enforcement mechanism for the legacy-eslintrc packages (`packages/design-system`, `packages/mcp-server`, `apps/storybook`) — layer: tooling. At activation, evaluate at least two real options: (a) replicate `packages/mcp-server`'s local-override pattern (redeclare a correctly-scoped `overrides` block directly in each package's own `.eslintrc.cjs`), vs (b) restructure `boundaries.js` into per-rule shareable modules with no file-glob dependency at all (since each package's own lint invocation is already scoped to itself, a rule doesn't need a repo-root-relative path to know which package it's running in). Whichever is chosen must also fix the Rule 1 / Rule 2 collision (#2 in Background) so both patterns are simultaneously active for `packages/design-system`.
- [x] Port equivalent boundary enforcement into `apps/web`'s `eslint.config.js` (flat config) — layer: tooling. This is a new code path, not a fix to something broken — apps/web has never had this rule wired in.
- [x] ~~Port equivalent boundary enforcement into `apps/studio`'s `eslint.config.mjs` (flat config)~~ — **STRUCK, vacuous.** No rule names `apps/studio` as the *importing* side: Rule 3 restricts web FROM studio, and nothing restricts studio itself. There was no enforcement to port and no deliberate violation constructible; inventing one would have meant a fifth rule, which this epic's Non-Goals forbid. `apps/studio` additionally has no `lint` script at all (86 pre-existing problems if one were added — tracked as SUG-257). Recorded as an explicit `NO_BOUNDARY_SCOPE` entry in `packages/eslint-config/boundary-rules.js` with its reason, so the absence is auditable rather than looking like an oversight.
- [x] ~~Resolve `apps/storybook`'s lint-script scope gap~~ — **STRUCK, vacuous for the same reason.** The gap was only a gap if a boundary rule needed to see `.storybook`-adjacent source, and no rule names `apps/storybook` as the importing side. Its `extends: [.../boundaries]` line is removed rather than repaired — it added the appearance of enforcement and none of the substance. `NO_BOUNDARY_SCOPE` entry with reason.
- [x] ~~Decide whether `apps/storybook` is a "package" or an "app" for Rule 1 purposes~~ — **DISSOLVED rather than decided.** The question only existed because shared doc helpers sat inside `apps/`. Phase 1 moved them to `packages/storybook-docs`, so a package importing them is a package importing a package. Storybook stays an app, no exemption exists, and no reclassification was needed. Restructuring where the code lives beat adjudicating a rule — which is what the Scope item itself suspected.
- [x] Remediate the 2 confirmed real violations in `packages/design-system` — layer: source code. Fix `PageHeader.stories.tsx:43` and `Chip.stories.tsx:5` by moving the shared Storybook-helper code (`apps/storybook/.storybook/helpers/docs`, `apps/storybook/.storybook/helpers/ChipDocs.tsx`) to a location `packages/design-system` can legitimately depend on (or restructure so design-system's own stories don't need it) — not by carving out a rule exception for these two files.
- [x] Re-run `pnpm lint` (`turbo run lint`) across the whole repo with every corrected rule active and confirm zero unintended new violations beyond the 2 already known and remediated above — layer: verification.
- [x] **Add a boundary probe to `scripts/validate-enforcement-liveness.js`** — layer: tooling. **Added 2026-07-28 by SUG-255's close-out (step 5b).** SUG-255 Phase 5 built the single liveness harness this epic asked for and absorbed the proposed `validate:boundary-wiring` into it, per this epic's own "one liveness mechanism, many inputs" — so do **not** write a separate boundary checker. The remaining work is one probe in the existing harness: introduce an import that each corrected rule should forbid, run that package's own lint invocation, and assert it fails. That is the same deliberate-violation method the acceptance criteria below already require, expressed as a permanent check rather than a one-time verification, so a rule that goes inert again fails CI instead of waiting 176 days for the next investigation. Follow the existing probe contract: the harness runs every gate clean first and requires exit 0 before trusting a failure as detection, so a probe whose lint invocation is wrong reports `invalid` rather than falsely reporting the gate live.

  *Why this item exists:* SUG-255's close-out recorded the absorption in its own doc and nothing more. This Scope had no corresponding entry, which is exactly the SUG-230 → SUG-231 failure that CLAUDE.md close-out step 5b was written to prevent — each side assuming the other owned it. An assertion is not a handoff.

## Acceptance criteria

- [x] `packages/design-system`, `packages/mcp-server`, `apps/storybook` each have a `no-restricted-imports` config that is empirically confirmed via `eslint --print-config` (run against a real source file, using each package's own actual lint invocation) to apply its intended rule(s).
- [x] Rule 1 and Rule 2 no longer collide for `packages/design-system` — `eslint --print-config` on a design-system source file shows both patterns' `group`/`message` present simultaneously (or a single merged declaration covering both), not just the last-declared one.
- [x] `apps/web`'s flat config enforces "cannot import `apps/studio`" — verified by introducing a deliberate test violation, confirming `pnpm --filter web lint` fails on it, then reverting the test violation.
- [x] ~~`apps/studio`'s flat config enforces its applicable boundary rule(s)~~ — **struck with its Scope item**; no rule applies, so nothing is constructible to verify.
- [x] `PageHeader.stories.tsx:43` and `Chip.stories.tsx:5` no longer import anything under `apps/storybook`, and `pnpm --filter @sugartown/design-system lint` passes clean with the corrected rules active.
- [x] `apps/storybook`'s lint-script scope decision is written down — documented exemption, not a fix. `NO_BOUNDARY_SCOPE` entry plus the close-out below. Verified negatively: `--print-config` on `.storybook/main.ts` returns `null` for `no-restricted-imports`, proving the decoration is gone rather than silently present.
- [x] The `apps/storybook` package-vs-app classification is written down: **it stays an app, and the question dissolved** when the helpers moved to `packages/storybook-docs`. No rule and no exemption encode a reclassification, because none happened.
- [x] `pnpm lint` passes clean repo-wide with all corrected rules active.
- [x] `pnpm validate:enforcement-liveness` carries a boundary probe that **fails** when a corrected rule is reverted to its inert form, and passes when restored. Asserting it passes on a healthy repo is not sufficient — that is the property `validate:validators` had throughout the 176 days these rules were dead.

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

## Post-Epic Close-Out (2026-07-28) — Phases 1–7

Boundary enforcement is live for the first time. Before this epic, exactly **one** of four declared rules fired anywhere in the monorepo, and it fired only because SUG-225 had hand-copied it into `packages/mcp-server`'s own config as a local workaround.

### Fixed structurally, not patched

Every one of the four causes was a **file-matching** failure, so the replacement does no file matching. Rules are data (`boundary-rules.js`: `RULES` + a `SCOPES` map + `patternsFor()`); one adapter (`boundaries-for.js`) serves both ESLint config systems.

| Cause | Why it cannot recur |
|---|---|
| A — globs anchored to the consuming config's dir | No globs. Each package's lint run is already scoped to itself; the rule never needs its own path. |
| B — last-wins override merge discarded a colliding rule | `patternsFor()` returns one flat merged array. A single declaration cannot collide with itself. |
| C — flat config can't consume legacy `overrides` | Both systems consume the same adapter. |
| D — `**/*.{ts}` single-element brace matched nothing | No braces, no globs. |

An unknown scope **throws** rather than returning `[]`. A scope typo that quietly resolves to "no rules" is how this stayed healthy-looking for 176 days.

### Verification

**A — `--print-config`**, each package's own binary from its own cwd:

| Scope | Patterns | Expected |
|---|---|---|
| `packages/design-system` | 2 | 2 |
| `packages/mcp-server` | 2 | 2 |
| `packages/storybook-docs` | 1 | 1 |
| `apps/web` | 1 | 1 |
| `apps/storybook` | `null` | `null` — negative assertion, proves the decoration is gone rather than silently present |

**B — deliberate violation → lint fails → revert**, `--force` throughout so no replayed cache entry could mask a new failure. design-system fired **Rule 1 and Rule 2 simultaneously on a single import** (the collision criterion). `apps/web` fired Rule 3 for the first time in the repo's history.

**C — permanent.** Phase 5 added one probe per scope to `validate:enforcement-liveness`, generated from the same `SCOPES` map the configs consume, so a scope added without a probe is impossible. Each probe requires **every** rule in its scope to report — not merely that lint failed. Proven against both failure shapes: rules removed → inert, exit 1; cause B reintroduced → *"1 of 2 rule(s) never reported"*, naming the last-wins collision, exit 1. An exit-code-only probe would have passed that second test, which is exactly how the original bug hid.

**D — end-to-end:** `pnpm lint` 0 repo-wide, `pnpm typecheck` 0, `pnpm --filter web build` 0, `pnpm --filter storybook storybook:build` 0.

### Decisions taken

- **Two Scope items struck as vacuous** (`apps/studio` enforcement, `apps/storybook` lint-script scope). No rule names either as the *importing* side, so there was nothing to port and no deliberate violation constructible. Both are `NO_BOUNDARY_SCOPE` entries with stated reasons — an audited absence, not an omission. `apps/contentful-poc` gets the same treatment as its one-line note.
- **The package-vs-app question dissolved.** Moving the helpers out of `apps/` removed the tension; storybook stays an app, with no exemption and no reclassification.
- **The `@sb-helpers` alias was a linter blindfold.** `no-restricted-imports` matches the literal specifier string, not the resolved path, so `@sb-helpers/ChipDocs` could never have been caught by Rule 1 even after the rule was repaired. Deleted, not exempted — `Chip.stories.tsx` was its sole consumer. Its `@ts-expect-error` went with it (the alias was never in tsconfig, which is why the import needed suppressing).
- **`sugartown_check_boundary` was a false-confidence oracle.** It read the old globs as repo-root-relative — as intended, not as ESLint resolves them — so it answered "not permitted" for imports ESLint silently allowed. It now reads `SCOPES` directly, and distinguishes "checked and allowed" from "not enforced here", a distinction the old tool could not draw.
- **Orphan helpers:** `FilterBarDocs.tsx` and `ArchiveGridDocs.tsx` were deleted by SUG-255's lint pass, recoverable at `69d50c1b`. `docs/reviews/rules-audit/2026-07.md` row 8 was already annotated by SUG-255's `f2fc6b46` — verified present rather than re-applied.

### Corrections to this epic's own plan

- **The Phase 1/2 boundary was unreachable as drawn.** Phase 1 was scoped to the six in-storybook importers with design-system's two violations left to Phase 2, but Phase 1's gate is `storybook:build` — and Storybook compiles design-system's stories. Relocation is one atomic unit: every consumer moves or the tree does not build.
- **Phase 7's `@storybook/react` item rested on a false premise.** SUG-254's plan inherited SUG-255's epic-doc claim that the package "does not exist in SB10", which would have made declaring it impossible. SUG-255 Ph2 disproved that. Re-verified here before acting: not resolvable from `packages/design-system` before, resolvable after. 46 undeclared imports now declared.
- **Two verification helpers were themselves wrong**, in opposite directions. Verification A first reported `null` for `apps/web` against a correct config — it compared severity to the string `'error'`, but ESLint v9 emits the number `2`. The Phase 5 boundary probe first reported all four scopes inert against rules that demonstrably fire — ESLint's formatter strips a rule message's trailing period, so `includes(message)` never matched. Both are the same defect class as the gates being tested: a checker confidently wrong about its own evidence.

### Residual gaps — documented, not fixed here

- **`apps/web` lints only `src/**/*.{js,jsx}`.** Exactly **32** `.ts`/`.tsx` files under `apps/web/src` (measured, not cited) are linted by nothing. Rule 3 is clean across all of them today. Covering them needs `typescript-eslint` in web's flat config — real scope creep. **SUG-258.**
- **`apps/studio` has no lint script**, 86 pre-existing problems if one were added. **SUG-257.**
- **`apps/web`'s 30 remaining `@storybook/react` imports** stay undeclared. SUG-255 Ph2 scoped them out; SUG-258 will begin linting them.

### Close-out checklist

| Step | State |
|---|---|
| 1b · Route smoke tests + run ID | pending — branch not yet merged |
| 2 · Schema deploy | n/a — no `apps/studio/schemas/` change |
| 3 · Visual QA gate | **see below — blocking** |
| 4 · Chromatic | build 85 run, 3 changes **awaiting review** |
| 5 · Data pipeline gap | n/a |
| 5b · Handoffs landed | SUG-257 / SUG-258 exist in Linear and are named above |
| 6b · Vspec preserved | n/a — no vspec |
| 8b · Incident log | INC-011 covers this; its Resolution needs updating at close-out |

**Visual QA / Chromatic — blocking.** [Build 85](https://www.chromatic.com/build?appId=69de2a8dfe5a14bc405087d5&number=85): 376 stories, 365 snapshots, **3 visual changes**. The premise was that a pure import-path refactor yields zero diffs, so these are accounted for rather than approved. `StoryTemplate`'s rendered prose was deliberately rewritten in Phase 1 — it instructed authors to import via relative paths that no longer exist — so a diff on that story and its autodocs page is expected and correct. The third needs human eyes. Phases 3–7 touched no rendered surface (ESLint config, a validator script, one devDep), so build 85 still represents the current visual state.

## Related

- **Linear:** [SUG-254](https://linear.app/sugartown/issue/SUG-254/fix-eslint-architectural-boundary-enforcement-no-restricted-imports)
- **Origin:** `docs/shipped/SUG-225-sugartown-mcp-server-v1.md` (Post-Epic Close-Out → Friction line)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time (Doc Type Coverage / Query Layer / Schema Enum Audit are not applicable to this epic — no schema or GROQ surface — state that explicitly at activation rather than leaving them blank).
