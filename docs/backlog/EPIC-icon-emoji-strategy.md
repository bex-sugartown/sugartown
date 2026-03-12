# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

---

## Epic Lifecycle

**Status:** BACKLOG (unscheduled — awaiting prioritization)

**Epic ID:** EPIC-0000
## EPIC NAME: Icon & Emoji Preload Strategy

**Backlog ref:** Icon & Emoji Preload Strategy (Deferred tier)
**Downstream dependents:** EPIC-footer-ia-brief (footer social link icons depend on this epic's icon library choice)

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — `SocialLink.jsx` (emoji fallbacks for 8 platforms), `ThemeToggle.jsx` (2 inlined SVG icons for sun/moon), `Callout.jsx` (5 lucide-react icons), `NodesExample.jsx` (4 emoji icons for AI tools). No icon font or sprite system exists. This epic replaces emoji fallbacks with SVG icon components and establishes the project's icon strategy.
- [x] **Use case coverage** — Three icon needs: (1) Social/brand icons in footer SocialLink (LinkedIn, GitHub, X, Instagram, YouTube, Facebook, Dribbble, Behance, RSS, Email), (2) UI icons for navigation/actions (currently minimal — only Callout and ThemeToggle), (3) Studio schema icons (`@sanity/icons`, 25 unique icons — out of scope, Studio-only). This epic covers (1) and establishes conventions for (2).
- [x] **Layout contract** — SocialLink renders icons in 40×40px circular containers. Icon SVG should be 20–24px to sit comfortably within. No layout change — icon replacement is visual only.
- [x] **All prop value enumerations** — `link.icon` schema field (`apps/studio/schemas/objects/link.ts` line 46): `twitter`, `linkedin`, `github`, `email`, `rss`, `external`. SocialLink.jsx currently maps a different set: `linkedin`, `github`, `twitter`, `instagram`, `youtube`, `facebook`, `dribbble`, `behance`. These must be reconciled.
- [x] **Correct audit file paths** — All paths verified.
- [x] **Dark / theme modifier treatment** — Social icons in footer render on `--st-color-bg-midnight` (always dark). Icons use `currentColor` and inherit text colour from parent. No per-theme overrides needed for social icons. Callout icons already use `var(--st-callout-icon-color)` per variant — no change needed.
- [x] **Studio schema changes scoped** — Yes: update `link.icon` enum to include all social platforms currently in use. Own commit prefix: `feat(studio):`.
- [x] **Web adapter sync scoped** — Callout web adapter already uses lucide-react. If Callout icon source changes, the web adapter CSS module must be verified (icon sizing). Otherwise N/A.

---

## Context

### Current icon usage (audit results)

| Surface | File | Current implementation | Icons |
|---------|------|-----------------------|-------|
| Social links (footer) | `SocialLink.jsx` | Emoji map (`💼`, `🐙`, `🐦`, etc.) + `🔗` fallback | 8 platforms + fallback |
| AI tool badges | `NodesExample.jsx` | Emoji map (`🤖`, `💬`, `✨`, `🔀`) | 4 tool types |
| Callout variants | `Callout.jsx` (web + DS) | `lucide-react` named imports | 5 icons (Heart, Info, Lightbulb, AlertTriangle, AlertOctagon) |
| Theme toggle | `ThemeToggle.jsx` | Inlined SVG JSX | 2 icons (Sun, Moon) |
| Studio schemas | 37 schema files | `@sanity/icons` | 25 unique icons |
| Storybook toolbar | `preview.ts` | Built-in Storybook icon | 1 icon (`circlehollow`) |
| Navigation | `Header.jsx`, `NavigationItem.jsx` | None | No icons |

### Installed icon packages

| Package | Location | Version |
|---------|----------|---------|
| `lucide-react` | `apps/web`, `packages/design-system` | ^0.575.0 |
| `@sanity/icons` | `apps/studio` | ^3.7.4 |

### Problems with current approach

1. **Emoji rendering inconsistency** — Emoji social icons render differently across OS/browser combinations. LinkedIn shows as `💼` (briefcase), not a LinkedIn logo. Users cannot visually identify the platform.
2. **No brand recognition** — Emoji is not a brand icon. A `🐙` is not the GitHub octocat. Social links lack professional appearance.
3. **Schema/component enum drift** — `link.icon` schema has 6 values (`twitter`, `linkedin`, `github`, `email`, `rss`, `external`), but `SocialLink.jsx` maps 8 different platforms (includes `instagram`, `youtube`, `facebook`, `dribbble`, `behance` which are NOT in the schema enum). This means Studio editors can't select these platforms.
4. **No FOUT risk today** — Inline SVG icons and emoji have no font-loading FOUT. This epic must preserve that zero-FOUT property.

---

## Objective

After this epic, the web app has a defined icon strategy using **two complementary libraries**: `lucide-react` (UI icons, already installed) and `@icons-pack/react-simple-icons` (brand/social icons, new dependency). All emoji icon fallbacks in `SocialLink.jsx` and `NodesExample.jsx` are replaced with inline SVG icon components. The `link.icon` schema enum is updated to cover all platforms in active use. The project has a documented convention for where to source icons going forward (brand → Simple Icons, UI → Lucide, Studio → `@sanity/icons`).

**Data layer:** Update `link.icon` enum in `link.ts` to include all social platforms.
**Query layer:** No query changes — `icon` field is already projected as a string.
**Render layer:** Replace emoji maps with SVG icon component maps in `SocialLink.jsx` and `NodesExample.jsx`.

---

## Icon Library Decision

### Recommended: Lucide + Simple Icons (two-library strategy)

| Need | Library | Rationale |
|------|---------|-----------|
| **Social/brand icons** | `@icons-pack/react-simple-icons` | 3,150+ brand icons. CC0 license. Tree-shakeable ESM. Covers all 10 needed platforms including X (new Twitter) and Behance. Lucide officially defers to Simple Icons for brand icons. |
| **UI icons** | `lucide-react` (already installed) | 1,500+ icons. ISC license. Best-in-class tree-shaking. ESM-first. Already used by Callout component. No new dependency. |
| **Studio** | `@sanity/icons` (already installed) | Studio-only. Do not import into `apps/web`. No change needed. |

### Why not alternatives

| Library | Why excluded |
|---------|-------------|
| `react-icons` | Well-documented tree-shaking problems with Vite. Importing one icon from a set can pull in the entire set (~30 KB+). |
| `@mui/icons-material` | Requires MUI peer dependencies (`@emotion/react`, `@emotion/styled`, `@mui/material`). Massive dependency overhead for icons alone. |
| `@heroicons/react` | No brand/social icons at all. Only 316 UI icons. |
| `@radix-ui/react-icons` | Only ~300 icons. Missing YouTube, Facebook, Dribbble, Behance, X. |
| `@phosphor-icons/react` | Viable alternative (9,000+ icons, has all social platforms). Larger install than Lucide + Simple Icons combined. Would replace lucide-react, creating unnecessary churn since lucide-react is already in use. |
| `@tabler/icons-react` | Full social coverage (5,600+ icons). Reported bundle size issues with some bundlers. Not as focused as Simple Icons for brand icons. |

### Why inline SVG components (not icon fonts or sprites)

- **Zero FOUT guarantee** — SVG is in the DOM at render time. Icon fonts can flash or show fallback glyphs during load.
- **Tree-shaking** — Only imported icons hit the bundle. Icon fonts load the entire set.
- **Full CSS control** — `currentColor`, `className`, responsive sizing all work natively.
- **No Vite plugin needed** — Sprite sheets require `vite-plugin-svg-sprite`. Inline SVG works out of the box.
- **Scale appropriate** — Project uses ~10 social + ~20 UI icons. Inline SVG is the right approach under ~100 icons.

### Bundle impact estimate

~10 Simple Icons + ~5 additional Lucide icons = ~15 new icon imports.
Each icon: ~1 KB ungzipped, ~300 bytes gzipped.
**Total: ~4–5 KB gzipped.** Negligible.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | No | Footer icon rendering is site-level, not page-level |
| `article` | No | Same — icons are in the site shell, not article content |
| `caseStudy` | No | Same |
| `node` | No | `NodesExample.jsx` uses emoji for AI tool badges — in scope for icon replacement, but no schema or query change needed (values come from the existing `aiTool` field) |
| `archivePage` | No | Same as page |
| `siteSettings` | Indirect | `link.icon` enum used by `socialLinks[]` on siteSettings is updated, but the change is to the `link` object schema, not `siteSettings` itself |

---

## Scope

- [ ] **Install `@icons-pack/react-simple-icons`** in `apps/web` and `packages/design-system`
- [ ] **Studio schema change** — Update `link.icon` enum in `link.ts` to cover all social platforms: add `instagram`, `youtube`, `facebook`, `dribbble`, `behance`, `bluesky`, `mastodon`. Rename `twitter` title to "X (Twitter)" (keep value as `twitter` for backward compat, or add `x` as new value). Own commit: `feat(studio):`.
- [ ] **Replace SocialLink emoji map** — Replace emoji lookup with Simple Icons components. Map `link.icon` string values to `<Si{Platform} />` components.
- [ ] **Replace NodesExample emoji map** — Replace AI tool emoji map with Lucide icons (already installed). `claude` → `Bot`, `chatgpt` → `MessageSquare`, `gemini` → `Sparkles`, `mixed` → `Shuffle` (or similar appropriate icons).
- [ ] **Migrate ThemeToggle inlined SVGs** — Replace hand-coded Sun/Moon SVGs with `lucide-react` `Sun` and `Moon` imports (already installed, reduces maintenance burden).
- [ ] **Document icon convention** — Add icon sourcing rules to CLAUDE.md or MEMORY.md: brand → Simple Icons, UI → Lucide, Studio → `@sanity/icons`. Never mix.
- [ ] **Performance validation** — Measure before/after bundle size delta. Confirm zero layout shift on social links (CLS = 0 for icon swap).

**Not in scope:**
- [ ] Migration script — no data migration needed, schema enum change is additive
- [ ] Web adapter sync for Callout — Callout already uses lucide-react, no change needed

---

## Query Layer Checklist

- [ ] `siteSettingsQuery` — **not affected.** `socialLinks[]{...icon}` already projects the `icon` string. The render layer maps the string to a component; the query is unchanged.
- [ ] `pageBySlugQuery` — not affected
- [ ] `articleBySlugQuery` — not affected
- [ ] `caseStudyBySlugQuery` — not affected
- [ ] `nodeBySlugQuery` — not affected
- [ ] Archive queries — not affected

No GROQ changes in this epic.

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title (copy from `options.list`) |
|-----------|-------------|-----------------------------------------------------|
| `icon` | `link.ts` (line 46) | **Current:** `twitter → Twitter/X`, `linkedin → LinkedIn`, `github → GitHub`, `email → Email`, `rss → RSS`, `external → External Link` |
| | | **Proposed additions:** `instagram → Instagram`, `youtube → YouTube`, `facebook → Facebook`, `dribbble → Dribbble`, `behance → Behance`, `bluesky → Bluesky`, `mastodon → Mastodon`, `x → X (Twitter)` |

**Note:** Keep `twitter` value for backward compat (existing socialLinks may use it). Add `x` as a new value for the new X brand. SocialLink component should map both `twitter` and `x` to the X icon (Simple Icons `SiX`).

---

## Metadata Field Inventory

Not applicable — this epic does not touch MetadataCard or any metadata surface.

---

## Themed Colour Variant Audit

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| Social icons (footer) | Inherits `currentColor` from `.socialLink` — `var(--st-color-text-muted)`, hover: `var(--st-color-white)` | N/A (footer is always midnight) | N/A | No new tokens |
| AI tool icons (NodesExample) | Inherits from parent context | Inherits from parent context | N/A | No new tokens |
| Theme toggle (Sun/Moon) | Already uses `currentColor` | Already uses `currentColor` | Already uses `currentColor` | No new tokens |
| Callout icons | Already uses `var(--st-callout-icon-color)` per variant | Same | Same | No change |

All icon components use `currentColor` — they inherit from their parent's text colour. No new tokens or theme overrides needed.

---

## Non-Goals

- **Icon fonts** — No icon font will be loaded. All icons are inline SVG components. This eliminates FOUT by design.
- **SVG sprite sheet** — Not needed at current scale (~25 icons). If icon count exceeds ~100, revisit.
- **`@sanity/icons` in web app** — Studio icons stay in Studio. Do not cross the boundary. `@sanity/icons` is designed for Sanity's admin UI, not public-facing web pages.
- **Custom SVG icon design** — This epic uses established open-source icon libraries. No custom icon design or illustration work.
- **Emoji polyfill** — Emoji rendering in content body (Portable Text) is out of scope. This epic only replaces emoji used as *icon substitutes* in UI components.
- **Navigation icons** — Header/NavigationItem currently has no icons. Adding nav icons is a separate UX decision, not part of this epic.
- **`<link rel="preload">` for icons** — Not needed. Inline SVG components are bundled in JS — they're available at render time. Preload hints are for external resources (fonts, stylesheets, separate SVG files).

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`, `packages/design-system`
- `@icons-pack/react-simple-icons` installed in both `apps/web` and `packages/design-system` (Callout may add social-flavoured variants in future)
- `lucide-react` already installed in both locations

**Schema (Studio)**
- `link.icon` enum in `link.ts` is additive — new values are appended, no existing values removed
- Existing `socialLinks` data using `twitter` must continue to work (backward compat)
- Field type: `string` with `options.list` — no type change

**Query (GROQ)**
- No query changes. `icon` is already projected as a plain string.

**Render (Frontend)**
- `SocialLink.jsx` replaces emoji map with icon component map. Component map keys are `link.icon` enum values.
- All icon components render as inline `<svg>` elements. They accept `size`, `color`, `className` props.
- Simple Icons components are prefixed `Si*` (e.g., `SiLinkedin`, `SiGithub`, `SiX`).
- Lucide components are unprefixed (e.g., `Bot`, `Sun`, `Moon`).
- Icon sizing: `size={20}` for social icons (within 40×40 container), `size={24}` default for UI icons.

**Design System → Web Adapter Sync**
- Callout web adapter already uses lucide-react — no change needed unless icon source changes.
- If `NodesExample` icon changes are DS-level, the web adapter must be updated. Currently `NodesExample` is app-level only (`apps/web/src/components/`), so no adapter sync needed.

---

## Migration Script Constraints

N/A — no data migration. Schema change is additive (new enum values). Existing data is compatible.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/objects/link.ts` — UPDATE `icon` field `options.list` to add new platform values

**Frontend**
- `apps/web/src/components/atoms/SocialLink.jsx` — REPLACE emoji map with Simple Icons component map
- `apps/web/src/components/atoms/SocialLink.module.css` — VERIFY icon sizing works with SVG (may need minor adjustments — emoji `font-size` → SVG `width`/`height`)
- `apps/web/src/components/NodesExample.jsx` — REPLACE emoji map with Lucide icon components
- `apps/web/src/components/ThemeToggle.jsx` — REPLACE inlined SVG with Lucide `Sun` and `Moon` imports
- `apps/web/package.json` — ADD `@icons-pack/react-simple-icons` dependency
- `packages/design-system/package.json` — ADD `@icons-pack/react-simple-icons` dependency

**Docs**
- CLAUDE.md or MEMORY.md — ADD icon sourcing convention (brand → Simple Icons, UI → Lucide, Studio → @sanity/icons)

---

## Deliverables

1. **Dependency** — `@icons-pack/react-simple-icons` installed in `apps/web` and `packages/design-system`
2. **Schema** — `link.icon` enum updated with all social platform values (additive, no breaking changes)
3. **SocialLink** — Emoji map replaced with Simple Icons SVG components. All 8+ platforms render recognizable brand icons.
4. **NodesExample** — Emoji map replaced with Lucide SVG icons. AI tool types render with consistent icon style.
5. **ThemeToggle** — Inlined SVGs replaced with Lucide `Sun`/`Moon` imports. Same visual, less code.
6. **Convention doc** — Icon sourcing rules documented for future contributors.
7. **Performance** — Bundle size delta measured and documented. No layout shift introduced.

---

## Acceptance Criteria

- [ ] `pnpm install` completes without errors after adding `@icons-pack/react-simple-icons`
- [ ] Studio: `link.icon` dropdown shows all social platforms (LinkedIn, GitHub, X, Instagram, YouTube, Facebook, Dribbble, Behance, Bluesky, Mastodon, Email, RSS, External)
- [ ] Studio: existing `socialLinks` entries with `icon: "twitter"` still display correctly (backward compat)
- [ ] Frontend: SocialLink renders SVG brand icons (not emoji) for all 8+ platforms
- [ ] Frontend: Social icons are visually recognizable as platform logos (not generic shapes)
- [ ] Frontend: Social icons inherit `currentColor` and respond to hover state (muted → white)
- [ ] Frontend: Social icons maintain 40×40 container sizing, icon centered at 20px
- [ ] Frontend: Footer renders correctly with SVG social icons at desktop and mobile breakpoints
- [ ] Frontend: `NodesExample` AI tool icons render as Lucide SVG (not emoji)
- [ ] Frontend: ThemeToggle sun/moon icons render identically to current inlined SVGs
- [ ] Performance: No FOUT (Flash of Unstyled Text) — icons visible on first paint
- [ ] Performance: No CLS (Cumulative Layout Shift) — icon swap does not cause reflow
- [ ] Performance: Bundle size increase < 10 KB gzipped (expected ~4–5 KB)
- [ ] Convention: Icon sourcing rules documented in CLAUDE.md or MEMORY.md
- [ ] Visual QA: Screenshot comparison of footer social links before/after — improved visual quality, no layout regression

---

## Risks / Edge Cases

**Schema risks**
- [ ] Adding new enum values to `link.icon` is additive — no collision with existing values
- [ ] `twitter` value kept for backward compat. New `x` value added. SocialLink maps both to X icon.

**Query risks**
- [ ] No query changes — zero risk

**Render risks**
- [ ] What renders if `icon` value is unrecognized? — Fallback to generic link icon (Lucide `ExternalLink` or similar). Must not render `undefined` or empty space.
- [ ] Simple Icons uses brand-specific colours by default (`color` prop). In the footer context, icons should use `currentColor` instead of brand colours for visual consistency. Pass `color="currentColor"` explicitly.
- [ ] SVG icons vs emoji have different sizing models. Emoji uses `font-size`; SVG uses `width`/`height`. SocialLink.module.css `.icon` rule may need adjustment from `font-size: var(--st-text-lg)` to `width: 20px; height: 20px` or `display: flex; align-items: center`.
- [ ] ThemeToggle inlined SVGs may have custom `viewBox` or `strokeWidth` values that differ from Lucide defaults. Compare before replacing.

**Performance risks**
- [ ] `@icons-pack/react-simple-icons` install size is ~26 MB (3,000+ icons). But with tree-shaking, only ~10 icons hit the bundle. Verify Vite production build only includes imported icons.
- [ ] Dev server cold start may slow slightly with large node_modules. Monitor `pnpm dev` start time.

**Dependency risks**
- [ ] Simple Icons package is actively maintained (weekly releases tracking new brands). Pin version to avoid unexpected icon changes.
- [ ] CC0 license on icon SVGs is permissive. Individual brand trademarks still apply (using LinkedIn's logo requires compliance with their brand guidelines). This is a legal/editorial concern, not a code concern.

---

## Post-Epic Close-Out

1. **Activate the epic file:**
   - Assign the next sequential EPIC number
   - Move: `docs/backlog/EPIC-icon-emoji-strategy.md` → `docs/prompts/EPIC-{NNNN}-icon-emoji-strategy.md`
   - Update the **Epic ID** field to match
   - Commit: `docs: activate EPIC-{NNNN} Icon & Emoji Strategy`
2. **Confirm clean tree** — `git status` must show nothing staged or unstaged
3. **Run mini-release** — `/mini-release EPIC-{NNNN} Icon & Emoji Strategy`
4. **Start next epic** — only after mini-release commit is confirmed

---

## Appendix: Icon Library Quick Reference

### Simple Icons — social platform map

```jsx
// Import pattern: import { Si{Platform} } from '@icons-pack/react-simple-icons'
import { SiLinkedin, SiGithub, SiX, SiInstagram, SiYoutube, SiFacebook, SiDribbble, SiBehance, SiBluesky, SiMastodon } from '@icons-pack/react-simple-icons'

const SOCIAL_ICONS = {
  linkedin:  SiLinkedin,
  github:    SiGithub,
  twitter:   SiX,       // backward compat — old "twitter" value → X icon
  x:         SiX,
  instagram: SiInstagram,
  youtube:   SiYoutube,
  facebook:  SiFacebook,
  dribbble:  SiDribbble,
  behance:   SiBehance,
  bluesky:   SiBluesky,
  mastodon:  SiMastodon,
}
```

### Lucide — UI icon replacements

```jsx
// Already installed — import from 'lucide-react'
import { Sun, Moon } from 'lucide-react'           // ThemeToggle
import { Bot, MessageSquare, Sparkles, Shuffle } from 'lucide-react'  // NodesExample AI tools
import { ExternalLink, Mail, Rss } from 'lucide-react'               // SocialLink fallbacks
```

### Convention summary

| Context | Library | Import pattern |
|---------|---------|---------------|
| Brand/social icons (web) | `@icons-pack/react-simple-icons` | `import { SiPlatform } from '@icons-pack/react-simple-icons'` |
| UI icons (web + DS) | `lucide-react` | `import { IconName } from 'lucide-react'` |
| Studio schema icons | `@sanity/icons` | `import { IconNameIcon } from '@sanity/icons'` |
| Storybook toolbar | Built-in | String name (e.g., `'circlehollow'`) |
