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

**Story count audit** (SUG-191 Phase 4 — updated 2026-06-21):

| File | Before | Now | Status |
|---|---|---|---|
| `Chip.stories.tsx` | 11 | 5 | ✅ Done |
| `Media.stories.tsx` | 11 | 4 | ✅ Done |
| `Grid.stories.tsx` | 10 | 3 | ✅ Done |
| `DescriptionList.stories.tsx` | 9 | 2 | ✅ Done |
| `CodeBlock.stories.tsx` | 13 | 3 | ✅ Done (prior session) |
| `Button.stories.tsx` | 12 | 4 | ✅ Done (prior session) |
| `Avatar.stories.tsx` | 11 | 4 | ✅ Done (prior session) |
| `Callout.stories.tsx` | 11 | 7 | ⏳ Pending — target 3 |
| `Tile.stories.tsx` (StatCard) | — | 7 | ⏳ Pending — target 3 |
| `ScoreRing.stories.tsx` | — | 7 | ⏳ Pending — target 3 |
| `SidebarNav.stories.tsx` | — | 8 | ⏳ Pending — target 3 |
| `FilterBar.stories.tsx` | — | 5 | ⏳ Pending — target 3 |
| `Accordion.stories.tsx` | — | 5 | ⏳ Pending — target 3 |
| `Hero.stories.tsx` | 9 | — | ⏳ Pending — hero has many variants, review carefully |
| `PageHeader.stories.jsx` | 9 | — | ⏳ Pending |
| `PageSidebar.stories.tsx` | 9 | — | ⏳ Pending |
| `PageSections.stories.tsx` | 10 | — | ⏳ Pending |

Each remaining file needs a per-story decision, not a blanket reduction. Pending items continue in the next SUG-191 session.

---

## Push cadence

Chromatic runs once per `git push` to `main`. The EOD-only push convention (established in session rules) is the single most effective budget lever — 3 pushes/day at 450 snapshots each burns the monthly budget in 4 days.

**Rule:** hold all commits locally during the day. One push at EOD. Chromatic runs once.

---

## Where the script lives

`apps/storybook/scripts/chromatic.sh` — the authoritative runner. Edit this file to adjust skip-gate paths or Chromatic flags. Do not put Chromatic flags directly in `package.json`.
