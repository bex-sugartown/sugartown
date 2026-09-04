---
paths:
  - "apps/storybook/**"
  - "packages/storybook-docs/**"
  - "**/*.stories.*"
  - "packages/design-system/**"
---
# Storybook and DS documentation

Loads when a session reads Storybook config, stories, or the DS documentation helpers. Moved verbatim from `CLAUDE.md` on 2026-09-04 (ST-112); rule-file edits go through the Instruction & Rule File Write Gate exactly as `CLAUDE.md` does.

## DS Documentation Authoring — Pre-Authoring Gates (blocking)

Full rules and rationale: `docs/conventions/usage-doc-style-guide.md`.

### Gate 1 — API stability (hard stop)

Before writing any section of a Guidelines helper or usage doc beyond Overview:

- Is the component's prop API frozen for this release cycle? No pending renames, no deprecated props without confirmed replacements, no open decisions about adding or removing props?

If **no**: write the Overview section only. Mark detail sections `<!-- PENDING: API not frozen -->`. Do not write Usage Guidelines, Accessibility, or Token sections until the API is stable.

A doc written during an API redesign will contradict itself within the same session. See SUG-152 Chip docs failure.

### Gate 2 — Template lock (hard stop before any content)

Before writing content for a component doc, present a structure table and wait for explicit sign-off:

| Section | Applicable? | Scope (one sentence) |
|---------|-------------|----------------------|
| Overview | Yes | … |
| Usage Guidelines | Yes/No | … |
| Accessibility | Yes/No | … |
| Design Tokens | Yes/No | … |

Wait for "yes", "looks good", or equivalent before writing section content.

**Response mechanism:** a select-list gate per `docs/conventions/human-gate-conventions.md` — present the structure table, then ask via a single select option rather than requiring a typed word.

### Gate 3 — Framework-agnostic constraint

Component docs describe prop API and visual behaviour only. Do not reference:
- Sanity field names (`project.colorHex`, `colorHex` as a CMS field)
- Schema type names or document types
- CMS lifecycle vocabulary (draft, published, versioned)

Use the **prop name**, not the data source. `dotColor` is a component concern. `project.colorHex` is a data concern — exclude it.

### Section dependency map

When writing a new component helper (`helpers/*Docs.tsx`), add a comment block at the top of the component function declaring cross-section fact dependencies. Update it when any referenced section changes:

```tsx
// Section dependencies:
// Overview lists the four modes → Usage Guidelines §Tag and §Badge must match exactly
// Usage Guidelines §dot rule → Accessibility §color-not-only-signal must reference it
// Design Tokens table → Overview deprecation callout must reference the same token names
```

When the Overview is updated, treat this map as a checklist — every downstream section that references the same fact must be reviewed in the same edit.

### Storybook — build-time globals must be frozen

Any `__VARIABLE__` injected by `vite.config.js` `define:` that changes at build time (dates, commit SHAs, env-specific values, **version numbers**) **must be overridden to a fixed sentinel in Storybook's `viteFinal` define block**. Otherwise Chromatic will diff the story on every build even when nothing visual changed.

**Freeze every instance, not just the one that prompted the fix.** `apps/web/vite.config.js`'s `define` block currently has two build-time globals, and Storybook's `viteFinal` must freeze both:
```ts
// apps/storybook/.storybook/main.ts — viteFinal
viteConfig.define = {
  ...viteConfig.define,
  __BUILD_DATE__: JSON.stringify('2026-01-01'),
  __APP_VERSION__: JSON.stringify('0.0.0-storybook'),
}
```

When a `define:` entry is added to `apps/web/vite.config.js`, check whether it produces visible output in any story. If it does, add the freeze in the same commit, and re-check every *existing* entry at the same time.

### Storybook coverage requirement

Every new or modified component that has visual output must have a Storybook story before close-out. The story must cover: default state, all meaningful variants, and at least one edge case (long text, missing fields, empty arrays). Components without stories are invisible to Chromatic VRT.

**Dark mode is a shipping AC, not a follow-up.** Before close-out, confirm in Storybook — not by assumption — that every story renders correctly on both `default` and `dark-pink-moon`. "Untested" in the registry's dark mode column is a blocking state, and a component entered that way needs an open issue before the epic closes.
