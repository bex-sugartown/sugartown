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

## 4. Three-story rule (going forward)

New component stories should cover exactly three cases:

| Story name | What it covers |
|---|---|
| `Default` | The canonical rendered state — what the component looks like in the most common use |
| `DarkMode` | The `dark-pink-moon` theme variant |
| `EdgeCase` | One meaningful edge: long text, empty/null state, or a visually distinct variant |

More than three stories is permitted when the component has genuinely distinct visual states that cannot be combined (e.g. Button with 4 `tone` values, each with a distinct colour). In that case, document why in a comment above the extra stories.

**Story count audit** (files exceeding 3 stories as of SUG-191 — review individually before removing):

Files with 6+ stories warrant a pass to confirm each story represents a genuinely distinct visual state:

| File | Count | Action |
|---|---|---|
| `CodeBlock.stories.tsx` | 13 | Review — may need consolidation |
| `Button.stories.tsx` | 12 | Justified — covers 4 tones × sizes |
| `Avatar.stories.tsx` | 11 | Review |
| `Callout.stories.tsx` | 11 | Review |
| `Chip.stories.tsx` | 11 | Review |
| `Media.stories.tsx` | 11 | Review |
| `PageSections.stories.tsx` | 10 | Review |
| `Grid.stories.tsx` | 10 | Already has 1 `disableSnapshot: true` |
| `DescriptionList.stories.tsx` | 9 | Review |
| `Hero.stories.tsx` | 9 | Review — hero has many variants |
| `PageHeader.stories.jsx` | 9 | Review |
| `PageSidebar.stories.tsx` | 9 | Review |

Each of these needs a per-story decision, not a blanket reduction. This list is a starting point for the Phase 4 audit pass in SUG-191.

---

## Push cadence

Chromatic runs once per `git push` to `main`. The EOD-only push convention (established in session rules) is the single most effective budget lever — 3 pushes/day at 450 snapshots each burns the monthly budget in 4 days.

**Rule:** hold all commits locally during the day. One push at EOD. Chromatic runs once.

---

## Where the script lives

`apps/storybook/scripts/chromatic.sh` — the authoritative runner. Edit this file to adjust skip-gate paths or Chromatic flags. Do not put Chromatic flags directly in `package.json`.
