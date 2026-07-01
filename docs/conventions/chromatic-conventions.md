# Chromatic VRT Conventions

How Sugartown manages Chromatic snapshot budget on the free tier.

---

## Budget context

The free Chromatic plan provides ~5,000 Chrome snapshots per billing cycle. At ~450 stories, each full run consumes the entire monthly budget in roughly 11 runs (~1 week of active development). Three levers reduce this:

1. **TurboSnap** — snapshots only stories affected by the diff
2. **Skip gate** — skips Chromatic entirely for non-visual commits
3. **Story discipline** — caps stories per component; excludes docs stories from snapshotting

---

## 1. TurboSnap (`--only-changed`)

Enabled by default in `apps/storybook/scripts/chromatic.sh`.

TurboSnap traces the component dependency graph from the git diff. Only stories whose dependency chain includes a changed file are re-snapshotted. A push touching 2 components typically captures 20–40 snapshots instead of 450.

**First run on a new branch is always a full run** — TurboSnap needs a baseline. Subsequent runs on the same branch are incremental.

**TurboSnap bail reasons** (shown in the Chromatic dashboard CSV as `TurboSnap Bail Reason`):
- `package.json changed` — full run; dependency tree may have shifted
- `storybook config changed` — full run; story registration may have changed
- `no git history` — full run; baseline unavailable

When TurboSnap bails, a full run is correct behaviour — don't fight it.

---

## 2. Skip gate

The `scripts/chromatic.sh` runner checks `git diff --name-only HEAD~1` before invoking Chromatic. If all changed files fall into non-visual paths, it exits early with a log message and 0 snapshot cost.

**Non-visual paths (always skipped):**

| Path pattern | Why skipped |
|---|---|
| `apps/studio/**` | Sanity CMS schema — no Storybook story renders schema |
| `apps/contentful-poc/**` | Next.js POC app — separate deploy, not in Storybook |
| `docs/**` | Markdown documentation |
| `.claude/**` | Claude Code session files |
| `apps/web/src/lib/**` | GROQ queries, hooks, route utils |
| `apps/web/src/generated/**` | CI-produced stats files |
| `apps/web/scripts/**` | Build/validate scripts |
| `*.md` | Any markdown file |

**Visual paths (always trigger Chromatic):**

- `apps/web/src/components/**`
- `apps/web/src/design-system/**`
- `packages/design-system/src/**`
- `apps/storybook/.storybook/**`
- `tokens/**`
- Any `*.css` file
- Any `*.stories.*` file

If a push mixes visual and non-visual files, Chromatic runs (TurboSnap then narrows what's snapshotted).

---

## 3. `disableSnapshot: true` — docs and audit stories

Stories that render documentation prose, token reference tables, or historical audit output have no visual regression value — they're text that changes when someone edits the story file, not when a component changes. Add `chromatic: { disableSnapshot: true }` to exclude them permanently.

```ts
// In the meta default export:
const meta: Meta = {
  title: 'Docs/Welcome',
  parameters: {
    chromatic: { disableSnapshot: true },
  },
}
```

**Currently opted out** (as of SUG-191):

| Story file | Reason |
|---|---|
| `Docs/Welcome` | Pure prose — no DS components rendered |
| `Docs/Contributing` | Pure prose |
| `Docs/Story Template` | Boilerplate reference |
| `Docs/Component Contracts` | Architecture documentation |
| `Docs/Theme Guide` | Prose + inline swatches (not DS Swatch component) |
| `Docs/Token Reference` | Token table prose |
| `Docs/Typography Conventions` | Typography reference prose |
| `Docs/Section Spacing` | Spacing reference prose |
| `Patterns/IconButtonAudit` | Historical SUG-174 migration audit |

**Do NOT add `disableSnapshot` to:**
- Any story that renders actual DS components
- Foundations stories (Colors, Icons, Typefaces) — these show real visual output that should be VRT'd when token files change

---

## 4. Stories = variants. Props = everything else.

**One story per named visual variant.** Button has three variants (Primary, Secondary, Tertiary) — three stories. That is the ceiling, not the floor. States (disabled, loading), sizes, icon positions, edge cases, and content variations are explored through the Controls panel on any story — not through additional story exports.

**Dark mode is the theme toolbar, not a story.** Switch to `dark-pink-moon` in the Storybook theme dropdown. Do not add a `DarkMode` story export.

**`+ Snapshot (Chromatic)`** — a single catch-all story that renders all variant × state combinations in one frame, permanently preserved for VRT. This is the only story that needs to show multiple states together. Named `Snapshot (Chromatic)` by convention.

| What you need to show | How to show it |
|---|---|
| Named visual variants (Primary, Secondary…) | One story per variant |
| States: disabled, loading, error | Controls panel — `disabled: true` toggle |
| Sizes | Controls panel — `size` select |
| Icon start/end | Controls panel — `icon` / `iconAfter` / `iconPosition` selects |
| Long label edge case | Controls panel — `children` text input |
| All states at once for VRT | `Snapshot (Chromatic)` story |
| Dark mode | Theme toolbar — `dark-pink-moon` |

**Icon controls** — when a component accepts a React node for an icon slot, expose it as a select with a named mapping to 5 common Lucide icons (`ArrowRight`, `Check`, `X`, `ExternalLink`, `Plus`) plus `none`. This keeps the control serialisable and lets reviewers test icon combinations without separate stories:

```ts
icon: {
  control: { type: 'select' },
  options: ['none', 'ArrowRight', 'Check', 'X', 'ExternalLink', 'Plus'],
  mapping: {
    none: undefined,
    ArrowRight: <ArrowRight size={14} aria-hidden />,
    // …
  },
}
```

**Story count audit** (SUG-191 Phase 4, completed by SUG-192 — closed 2026-07-01):

| File | Before | Now | Status |
|---|---|---|---|
| `Chip.stories.tsx` | 11 | 5 | ✅ Done — SUG-191 |
| `Media.stories.tsx` | 11 | 4 | ✅ Done — SUG-191 |
| `Grid.stories.tsx` | 10 | 3 | ✅ Done — SUG-191 |
| `DescriptionList.stories.tsx` | 9 | 2 | ✅ Done — SUG-191 |
| `CodeBlock.stories.tsx` | 13 | 3 | ✅ Done — SUG-191 |
| `Button.stories.tsx` | 12 | 4 | ✅ Done — SUG-191 |
| `Avatar.stories.tsx` | 11 | 4 | ✅ Done — SUG-191 |
| `Hero.stories.tsx` | 9 | 3 | ✅ Done — SUG-191 |
| `PageSidebar.stories.tsx` | 9 | 2 | ✅ Done — SUG-191 |
| `SidebarNav.stories.tsx` | 8 | 2 | ✅ Done — SUG-191 |
| `apps/web/src/design-system/components/callout/Callout.stories.tsx` | 7 | 3 | ✅ Done — SUG-192 |
| `apps/web/src/components/StatCard.stories.jsx` | 4 | 1 | ✅ Done — SUG-192 |
| `packages/design-system/src/components/ScoreRing/ScoreRing.stories.tsx` | 7 | 2 | ✅ Done — SUG-192 |
| `packages/design-system/src/components/FilterBar/FilterBar.stories.tsx` | 5 | 2 | ✅ Done — SUG-192 |
| `apps/web/src/design-system/components/accordion/Accordion.stories.tsx` | 5 | 2 | ✅ Done — SUG-192 |
| `apps/web/src/components/PageSections.stories.tsx` | 11 | 9 | ✅ Done — SUG-192 (one story per section *type*, not per variant — see note below) |
| **Total (16 files, SUG-191 + SUG-192)** | **142** | **51** | **−91 stories (−64.1%)** |

**PageSections is the one file that legitimately sits above 3.** It's a section-builder registry, not a single component with visual variants — each story documents a distinct section *type* (Hero, Text, CTA, Callout, Accordion, StatCard, Mermaid, CardBuilder), so one story per type plus one combined `Snapshot (Chromatic)` is the correct shape, not a violation of the rule above. Don't flag it in a future audit pass.

**Naming trap found during SUG-192** — three of the six original audit rows named the wrong file, because a differently-named or deprecated component shared the visual name:
- "Tile (StatCard)" → the *actual* live pattern is `apps/web/src/components/StatCard.stories.jsx`. `apps/web/src/design-system/components/tile/Tile.stories.tsx` is a **deprecated, unrelated** component (`Legacy/Tile`, see SUG-149) — still at 7 stories, intentionally out of scope, not a lingering violation.
- "ScoreRing" and "FilterBar" — both rows originally pointed at `apps/web/src/design-system/components/{score-ring,FilterBar}/`, which have no `.stories.tsx` at all (that's the web-adapter directory). The real story files live in `packages/design-system/src/components/`.

Before auditing a component's story count, confirm the path actually resolves and renders in Storybook — don't trust a prior audit's file reference without checking.

Chromatic VRT was not re-run to confirm these reductions produce clean diffs (credits constraint at SUG-192 close-out) — every change was verified manually in Storybook instead. See `docs/shipped/SUG-192-chromatic-story-count-audit-remainder.md` for the full before/after breakdown and the pending-Chromatic note. Full narrative for both epics: `docs/shipped/SUG-191-chromatic-snapshot-budget-optimisation.md`, `docs/shipped/SUG-192-chromatic-story-count-audit-remainder.md`.

---

## Push cadence

Chromatic runs once per `git push` to `main`. The EOD-only push convention (established in session rules) is the single most effective budget lever — 3 pushes/day at 450 snapshots each burns the monthly budget in 4 days.

**Rule:** hold all commits locally during the day. One push at EOD. Chromatic runs once.

---

## Where the script lives

`apps/storybook/scripts/chromatic.sh` — the authoritative runner. Edit this file to adjust skip-gate paths or Chromatic flags. Do not put Chromatic flags directly in `package.json`.
