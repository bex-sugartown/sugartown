# SUG-115 — Platform section DS remediation

**Linear Issue:** [SUG-115](https://linear.app/sugartown/issue/SUG-115/platform-section-ds-remediation-16-finding-audit-close-out)
**Priority:** High
**Tags:** Frontend · Design System · Infrastructure
**Audit source:** `Downloads/Project_Section_extracted/handoff_platform_audit/` (AUDIT.md, CHANGES.md, Platform Audit.html)
**Branch audited:** `claude/condescending-chatterjee-611ed2`
**Shipped:** 2026-05-14 — merged to `main`
<!-- Chromatic: pending — CHROMATIC_PROJECT_TOKEN not set in shell; run manually -->

---

## Background

A Claude design handoff audit reviewed the `/platform` section against the Pink Moon design system. It found 16 issues across four groups: one rendering bug (resolved), six component-reuse misses where DS primitives exist but pages roll their own, five token-discipline escapes (raw rem/hex/inline style), and three cleanup items (dead CSS, unused imports).

The audit HTML (`Platform Audit.html`) is the canonical reference — it shows shipped vs. recommended side-by-side. **When this doc and the HTML disagree, the HTML wins.**

No new components, tokens, or design decisions are required. Every fix maps to primitives already in the codebase: `Card`, `Tile`, `SectionLabel`, `CodeBlock`, `DataTable`, `Callout`, `Chip`, `usePlatformHero`, `PlatformHubPage.module.css`.

---

## Scope

15 open findings (§01 resolved on branch). Organized into 6 atomic commits per CHANGES.md, smallest blast radius first.

### Commit 1 — Hero + Registry stub consistency (§05, §11)

**Files:**
- `apps/web/src/pages/platform/DesignSystemRegistryPage.jsx`
- `apps/web/src/components/PlatformLayout/PlatformHero.module.css`
- `apps/web/src/components/PlatformLayout/PlatformHero.jsx`

**Changes:**

§05 — `DesignSystemRegistryPage` skips `usePlatformHero` and renders its own bespoke header (`.header`, `.eyebrow`, `.eyebrowLink`, `.heading`, `.intro`). Wire it to `usePlatformHero` and delete those classes from `PlatformHubPage.module.css` — Registry was the last consumer.

§11 — `PlatformHero.module.css` hard-locks `background: var(--st-color-ink)` with fixed light primitives. Flip to: **light hero by default, dark hero when dark theme is active** via semantic tokens. Full diff:

```diff
.hero {
-  background: var(--st-color-ink);
+  background: var(--st-color-bg-elevated);
+  border-bottom: 1px solid var(--st-color-border-subtle);
-  padding-block: 3.5rem 3rem;
+  padding-block: var(--st-space-7) var(--st-space-hero-bottom);
}
.eyebrow {
-  font-family: var(--st-font-family-mono);
-  font-size: 0.75rem;
-  letter-spacing: 0.1em;
+  font-family: var(--st-label-font);
+  font-size: var(--st-label-size);
+  font-weight: var(--st-label-weight);
+  letter-spacing: var(--st-label-tracking);
}
.eyebrowLink {
-  color: var(--st-color-text-eyebrow);
+  color: var(--st-color-brand-primary);
}
.heading {
-  color: var(--st-color-softgrey-50);
+  color: var(--st-color-text-default);
}
.subtitle {
-  font-size: 1.125rem;
-  color: var(--st-color-softgrey-400);
+  font-size: var(--st-font-size-lg);
+  color: var(--st-color-text-muted);
}
```

**Acceptance:** `/platform/design-system/registry` renders via `usePlatformHero`. Theme toggle on `/platform/*` flips the hero band light↔dark. Bespoke header classes removed from `PlatformHubPage.module.css`.

---

### Commit 2 — Strip inline `style` from `GovernancePage` (§06, §13)

**Files:**
- `apps/web/src/pages/platform/GovernancePage.jsx`
- `apps/web/src/pages/platform/PlatformHubPage.module.css`

§06 — Two `style={{…}}` JSX props in `GovernancePage.jsx` (release-table version cell + roadmap teaser `<p>`) bypass `validate:tokens`. Move to CSS classes:

```css
/* PlatformHubPage.module.css */
.releaseVersionLink {
  color: var(--st-color-brand-primary);
  font-family: var(--st-font-family-mono);
  font-size: var(--st-font-size-sm);
}
.sectionLede {
  font-size: var(--st-font-size-sm);
  color: var(--st-color-text-muted);
  margin: var(--st-space-3) 0 var(--st-space-2);
}
```

§13 — Inline `<Link style={{ color: 'var(--st-color-text-default)' }}>` uses the wrong token (text-default, not link-default) and is an inline style. Replace with:

```css
.inlineLink { color: var(--st-color-link-default); text-decoration: none; border-bottom: 1px solid currentColor; }
.inlineLink:hover { color: var(--st-color-link-hover); }
```

**Acceptance:** No `style={{…}}` in `GovernancePage.jsx`. `pnpm validate:tokens` passes.

---

### Commit 3 — `SectionLabel` flush prop + folio numbers (§07, §14)

**Files:**
- `apps/web/src/design-system/components/section-label/SectionLabel.jsx`
- `apps/web/src/design-system/components/section-label/SectionLabel.module.css`
- `apps/web/src/pages/platform/CmsPage.jsx`
- `apps/web/src/pages/platform/MonorepoPage.jsx`
- `apps/web/src/pages/platform/GovernancePage.jsx`
- `apps/web/src/pages/platform/DesignSystemPage.jsx`
- `apps/web/src/pages/platform/PlatformHubPage.module.css` (delete `.labelFlush`)

§07 — Every `SectionLabel` on `/platform/*` is called with only `name` + `kicker`, omitting the `§NN` folio number. Add `number="§01"` etc., numbered per-page from §01.

§14 — Promote `.labelFlush { margin-bottom: 0 !important }` to a first-class `flush` prop on `SectionLabel`, then delete the override from `PlatformHubPage.module.css`.

```diff
- export default function SectionLabel({ number, name, title, kicker, className }) {
+ export default function SectionLabel({ number, name, title, kicker, flush, className }) {
-   <div className={[styles.root, className].filter(Boolean).join(' ')}>
+   <div className={[styles.root, flush && styles.flush, className].filter(Boolean).join(' ')}>
```

```css
/* SectionLabel.module.css */
.flush { margin-bottom: 0; }
```

**Acceptance:** All `SectionLabel` on `/platform/*` show §NN. `.labelFlush` deleted. `flush` prop documented.

---

### Commit 4 — Migrate `.diagramBlock` → `<CodeBlock>` + registry teaser → `<DataTable>` (§03, §04, §12, §15)

**Files:**
- `apps/web/src/pages/platform/CmsPage.jsx`
- `apps/web/src/pages/platform/MonorepoPage.jsx`
- `apps/web/src/pages/platform/DesignSystemPage.jsx`
- `apps/web/src/pages/platform/PlatformHubPage.module.css`

§03 — Replace `<div className={styles.diagramBlock}>` with `<CodeBlock code={…} language="text" filename="…" />`. The `white-space: pre` bug (§01) disappears by construction. Delete `.diagramBlock` from CSS.

§04 — `.registryTeaser` rolls a bespoke grid with `1fr 2fr auto` but only populates two of three columns — the `auto` column is permanently empty. Replace with `<DataTable columns={REGISTRY_COLUMNS} rows={REGISTRY_PREVIEW} variant="trust" />` (same pattern `GovernancePage` already uses). Delete `.registryTeaser`, `.registryRow`, `.registryName`, `.registryDesc`, `.registryFooter` (~50 lines).

§12 — Most raw rems in `.registryRow` / `.releaseRow` disappear with §03/§04. Mop up any that survive: `0.625rem → --st-space-2`, `0.8125rem → --st-font-size-sm`, `1.25rem → --st-spacing-inset-md`.

§15 — `.releaseStrip`, `.releaseRow`, `.releaseVersion`, `.releaseDate`, `.releaseSummary` (~34 lines) are dead — `GovernancePage` already uses `DataTable variant="trust"` for the release table. Delete.

**Net:** ~80 lines removed from `PlatformHubPage.module.css`.

**Acceptance:** `/platform/cms#relationships` and `/platform/monorepo#build-pipeline` render through `<CodeBlock language="text">`. `/platform/design-system#component-registry` renders through `<DataTable variant="trust">` with no ghost trailing column. All deleted classes are gone.

---

### Commit 5 — Mermaid palette via theme tokens (§02)

**Files:**
- `apps/web/src/pages/platform/DesignSystemPage.jsx`
- `apps/web/src/pages/platform/GovernancePage.jsx`

Both files hard-code hex (`#1a2436`, `#f5f7fa`, `#ff247d`, `#2bd4aa`, `#D1FF1D`) directly in Mermaid `style`/`classDef` strings inside `TOKEN_DIAGRAM.code` and `RELEASE_DIAGRAM.code`. Diagrams cannot follow theme swaps and fail `validate:tokens --strict-colors`.

**No new helper needed.** `PageSections.jsx` already implements the full mermaid theme system:
- `getComputedStyle(document.documentElement)` + a `token(name, fallback)` resolver
- A light/dark `palette` object built entirely from `--st-*` tokens (midnight, pink, softgrey, maroon, charcoal primitives)
- Passed into `mermaid.initialize({ themeVariables: { … } })`
- Inline `style`/`classDef`/`class` directive stripping so Sanity content can't override the palette

The platform pages need to adopt the same pattern. The fix is to:
1. Remove the hardcoded hex `style` directives from `TOKEN_DIAGRAM.code` and `RELEASE_DIAGRAM.code` — let the `themeVariables` palette do the colouring
2. Use the same `token()` + `palette` + `mermaid.initialize()` call sequence that `PageSections.jsx` uses (or extract it to a shared helper in `lib/` if both callers and `PageSections` would benefit from DRY — check first whether the pages use `mermaid` directly or delegate through `PageSections`)

Reference implementation: `apps/web/src/components/PageSections.jsx` — search for `// Read theme palette from CSS custom properties`.

**Acceptance:** No hex literals in `TOKEN_DIAGRAM.code` or `RELEASE_DIAGRAM.code`. Diagrams re-render correctly after theme toggle. `pnpm validate:tokens --strict-colors` passes for both files.

---

### Commit 6 — Token sweep + lint (§09, §10, §16)

**Files:**
- `apps/web/src/pages/platform/PlatformHubPage.module.css`
- `apps/web/src/components/PlatformLayout/PlatformSidebar.module.css`
- `apps/web/src/pages/platform/CmsPage.jsx`
- `apps/web/src/pages/platform/MonorepoPage.jsx`
- `apps/web/src/pages/platform/DesignSystemPage.jsx`

§09 — Two raw `2.5rem` section spacing values → `var(--st-space-section-break-detail)`.

§10 — Three off-token font sizes in `PlatformSidebar.module.css`:
- `.sectionLabel { font-size: 0.6rem }` → `var(--st-label-size)`
- `.navLink { font-size: 0.875rem }` → `var(--st-font-size-sm)`
- `.summary { font-size: 0.7rem }` → `var(--st-label-size)`

§16 — Remove unused `PLATFORM_ROUTES` import from `CmsPage.jsx` and `MonorepoPage.jsx`. In `DesignSystemPage.jsx`, replace hardcoded `kicker="Preview — 3 of 42"` with `kicker={\`Preview — ${REGISTRY_PREVIEW.length} of ${REGISTRY_TOTAL}\`}`.

**Acceptance:** `pnpm validate:tokens` passes. `pnpm lint` passes with zero unused-import warnings on platform files.

---

## Deferred (not in this epic)

### §08 — CMS Tile strip
Requires extending `stats.json` (or its build script) with a `cms` block: `docTypes`, `fields`, `references`, `sectionObjects`. Wire when that data exists. The JSX change is 8 lines once the data is available.

### RoadmapPage inline-to-Governance
Descoped from this audit. Track separately. When it lands: delete `RoadmapPage.jsx`, remove the `/platform/roadmap` route and sidebar nav item.

---

## Conflicts and questions

### ⚠ Branch status — confirm before starting
The audit was run against `claude/condescending-chatterjee-611ed2`. Before beginning, verify:
1. Is this branch already merged to `main`? (`git branch --contains <sha> | grep main`)
2. If not merged: do the commits from that branch need to be cherry-picked, or is the intent to start fresh on `main` using the audit as the spec?
3. §01 is marked **resolved on branch** — if the branch is not merged, the fix needs to land first or be re-applied here.

### §14 — `SectionLabel flush` prop — hold until §11 is verified
Decision deferred. Ship Commit 1 (§11 hero theme-awareness) first and verify how the trailing "Artifacts" `SectionLabel` renders without the `flush` override. If the spacing is acceptable, skip the `flush` prop entirely and ship only §07 (folio numbers) in Commit 3. If a gap is visible, add the prop then.

Fallback if prop is not needed: keep `.labelFlush { margin-bottom: 0 !important }` in `PlatformHubPage.module.css` as-is — it is not wrong, just inelegant.

### ⚠ §11 — Sanity-hero path needs separate audit
`PlatformHero.jsx` defers to `<PageSections>` when a Sanity `platformHeroSection` exists. The dark band visible on `/platform/*` pages may come from that Sanity hero (bg-image + overlay), not the CSS module fallback. Both paths need to be theme-aware. If the Sanity hero is the live path, the CSS module fix only affects the fallback — the Sanity hero overlay token may need separate tuning. **Audit both code paths before declaring §11 done.**

### §02 — Mermaid theme helper — resolved, existing pattern identified
`PageSections.jsx` already has the full implementation: `getComputedStyle` token resolver, light/dark palette built from `--st-*` primitives, passed to `mermaid.initialize({ themeVariables })`, with inline `style`/`classDef` stripping. **No new file needed.** Commit 5 strips the hardcoded hex from the platform page diagram strings and adopts the same pattern. See reference: `apps/web/src/components/PageSections.jsx` at `// Read theme palette from CSS custom properties`.

### §16 — `useHashScroll` vs `useScrollspy` — resolved, action identified
`PlatformSidebar` already uses `useScrollspy` (from SUG-112, `lib/useScrollspy.js`) for IntersectionObserver-based active-section tracking. `PlatformLayout.jsx` has a separate **inline** `useHashScroll` hook that imperatively scrolls to a target on hash change using `element.scrollIntoView({ behavior: 'smooth', block: 'start' })`.

These are complementary (not duplicate):
- `useScrollspy` — passive, tracks which section is visible
- `useHashScroll` — imperative, scrolls to a section on URL hash change

They are not the same hook and `useHashScroll` should not be replaced by `useScrollspy`.

**Action for Commit 6:** Check whether `scrollIntoView({ block: 'start' })` in `useHashScroll` is clipping behind the sticky `PlatformSidebar` header. If yes, switch to `window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerOffset })` with the correct offset. If it renders cleanly, leave it. Verify visually at `/platform/cms` by clicking a sidebar hash link.

### ⚠ §05 — `usePlatformHero` import path
The audit diff shows `import usePlatformHero from '../../components/PlatformLayout/PlatformHero'` — but this imports from the component file, not a dedicated hook file. Confirm whether `usePlatformHero` is actually exported from `PlatformHero.jsx` (co-located hook export) or whether a dedicated `usePlatformHero.js` hook file exists. Do not guess the import path.

---

## Phases

### Phase 0 — Pre-flight checks (no code)
- [x] Confirm branch `claude/condescending-chatterjee-611ed2` merge status — **confirmed merged to main**
- [ ] Confirm §01 fix is on `main` — verify `white-space: pre` on `.diagramBlock` before Commit 4 deletes the class
- [ ] Confirm DS owner sign-off on `flush` prop (§14) or document fallback decision
- [ ] Grep for existing Mermaid helper (`grep -r "mermaid" apps/web/src/lib/`)
- [ ] Grep for `usePlatformHero` export (`grep -r "usePlatformHero" apps/web/src/`)
- [ ] Audit §11 Sanity-hero path vs CSS module fallback — which is live?

### Phase 1 — Commit 1: Hero + Registry stub (§05, §11)
### Phase 2 — Commit 2: Inline style strip (§06, §13)
### Phase 3 — Commit 3: SectionLabel flush + folio numbers (§07, §14)
### Phase 4 — Commit 4: CodeBlock + DataTable migrations (§03, §04, §12, §15)
### Phase 5 — Commit 5: Mermaid theme tokens (§02)
### Phase 6 — Commit 6: Token sweep + lint (§09, §10, §16)

---

## Final acceptance

After all commits:

1. All routes load without console errors: `/platform`, `/platform/cms`, `/platform/governance`, `/platform/monorepo`, `/platform/design-system`, `/platform/design-system/registry`
2. Theme toggle works on every page — hero band, all components, all diagrams re-render
3. `pnpm validate:tokens` passes
4. `pnpm validate:tokens --strict-colors` passes
5. `pnpm lint` passes
6. `pnpm build` succeeds
7. Visual diff against `Platform Audit.html` recommended columns — each finding's "Recommended" panel matches the live page

---

## Source files touched

| File | Commits |
|------|---------|
| `PlatformHero.module.css` | 1 |
| `PlatformHero.jsx` | 1 |
| `DesignSystemRegistryPage.jsx` | 1 |
| `GovernancePage.jsx` | 2, 3 |
| `PlatformHubPage.module.css` | 2, 3, 4, 6 |
| `SectionLabel.jsx` | 3 |
| `SectionLabel.module.css` | 3 |
| `CmsPage.jsx` | 3, 4, 6 |
| `MonorepoPage.jsx` | 3, 4, 6 |
| `DesignSystemPage.jsx` | 3, 4, 6 |
| `PlatformSidebar.module.css` | 6 |
| `apps/web/src/lib/mermaidTheme.js` (new) | 5 |
