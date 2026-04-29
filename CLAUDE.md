# Sugartown — Claude Code Conventions

> These conventions apply to all sessions in this repo. They supplement MEMORY.md
> (auto-loaded) and docs/epic-template.md (used for epic authoring).
>
> **Pink Moon is the canonical design system identity.** PRD v3.0:
> `docs/briefs/design-system/design-system-prd.md`. Visual direction: sharp
> neutral surfaces, hot colour signal, EB Garamond headings,
> Courier Prime metadata, zero/minimal radius. Default mode: light.

---

## Session Discipline

### Epic close-out sequence

When an epic is complete, run these steps in order before starting the next epic:

1. **Commit** all epic changes with a scoped message (`feat(...)`, `refactor(...)`, etc.)
2. **Deploy schema** (if epic touched `apps/studio/schemas/`) — run `npx sanity schema deploy` from `apps/studio/`. Schema changes are not live until deployed. MCP tools, the Content Lake API, and embedded Studios all validate against the deployed schema, not local code. Skipping this step causes silent write failures.
3. **Move epic doc** from `docs/backlog/` to `docs/shipped/` — commit: `docs: ship SUG-{N} {name}`
4. **Mini-release** — run `/mini-release` to produce a patch version bump and CHANGELOG stub
5. **Update Linear** — transition the SUG-{N} issue to **Done**
6. **Clean tree** — confirm `git status` is clean before starting the next epic

Do not carry uncommitted changes across epic boundaries. If the working tree is dirty when a new epic begins, stop and commit or stash (`git stash push -m "WIP: SUG-{N} — <reason>"`) before proceeding.

A dirty tree at epic start is a process failure, not a starting condition.

### Epic authoring — Linear-first workflow

When creating a new epic in `docs/backlog/`:

1. **Create a Linear backlog item first** — this assigns the SUG-{N} tracking ID
2. **Name the file** `docs/backlog/SUG-{N}-{descriptive-name}.md`
3. **Link the Linear issue** in the file header (`**Linear Issue:** SUG-{N}`)
4. **Prioritize in Linear** — the Linear queue is the single source of truth for priority order

The `docs/shipped/` folder holds shipped epics. The `docs/backlog/` folder holds unscheduled and in-flight epics. Legacy `EPIC-NNNN` numbered files in `docs/shipped/` are retained as-is.

### Mid-epic commit checkpoints

Within a multi-feature epic, commit after each independently-working feature. Do not accumulate all changes for a single end-of-epic commit.

**After each commit checkpoint, push the feature branch to remote.** Feature branch pushes do not trigger Netlify deploys — they are free. Code that exists only on a local machine is one hardware failure away from being lost.

If a session may run out of context, commit work-in-progress with `wip(epic):` prefix before the session ends. Uncommitted code that survives a session break is lost context — treat it as a process failure.

### Linear Done = code on main

Before transitioning any Linear issue to **Done**, verify that the work is merged to `origin/main` — not merely pushed to a feature branch. A branch that exists at `origin/<feat-branch>` but is not merged into `main` is **not shipped**.

Verification command:
```bash
git branch --contains <commit-sha> | grep -qE '^(\*|\s)+ main$' && echo "on main" || echo "NOT on main"
```

A Linear issue marked Done with commits only on a feature branch is a process failure. The close-out sequence enforces this naturally (merge → mini-release → ship doc → Linear Done), but if the close-out is skipped or partial (e.g. multi-phase epic where one phase didn't merge), this rule is the backstop.

### Multi-phase epic merge cadence

When an epic has numbered phases (e.g. SUG-63 Phase 1 / 1b / 1c), pick **one** of two strategies at the start of the epic and stick with it:

**(a) Merge-as-you-go** — each phase merges to `main` on completion with its own mini-release. All phases ship independently. Phase N is "Done" in Linear only after its own merge.

**(b) Single close-out** — all phases accumulate on one long-lived feature branch. Nothing merges until the full epic ships. One mini-release at the end.

**Do not mix.** Merging Phase 1 + 1b to main but leaving Phase 1c on a side branch is the failure mode that stranded SUG-63 Phase 1c invisibly for days. If you start with strategy (a), every subsequent phase uses (a). If strategy (b), no phase merges until the epic closes.

Declare the strategy in the epic doc header when the epic is opened. At `/eod`, any branch with commits ahead of main that belongs to an (a)-strategy epic must be resolved (merge, hold with explicit reason, or abandon) before the day closes.

### Merge conflict cleanup

Never end a session with an unresolved merge conflict. If a merge conflicts:
1. Resolve it and commit the merge, OR
2. Abort the merge (`git merge --abort`) and document why

An unresolved merge left overnight will block the next session's morning housekeeping and create confusion about the working tree state.

### Browser testing pre-flight

Before asking the user to test anything in their browser:

1. **Confirm they have pulled the latest code** — "Have you pulled the branch? `git pull origin <branch>`"
2. **Never claim a dev server is reachable at `localhost`** unless the session is running on the user's local machine. If the environment is remote/cloud, tell the user to start the server from their local terminal.

A white-screen debug cycle caused by local ↔ remote divergence is a process failure.

### Local-only directories (gitignored)

One `docs/` subdirectory is **local-only** — gitignored and never committed:

- **`docs/drafts/`** — working drafts, manifestos, HTML mocks, GIFs, exploration docs. Content here is in flux and stays on Bex's machine until it's ready to move elsewhere (Sanity, `docs/briefs/`, `docs/shipped/`).

**Rules:**
- Never `git add` files in these directories. They are gitignored for a reason.
- Never ask "should we commit these drafts?" — the answer is always no.
- If a draft graduates to a brief or a Sanity document, copy it to the destination and leave the draft in place as a local archive.
- If git shows these files as "deleted" in `git status`, it means they were previously tracked and need to be untracked with `git rm --cached`.

### Phase 0 hard-stop (mockup gate)

For any epic that includes a mockup/design phase (Phase 0 or equivalent):

**No code in `apps/web/src/`, `apps/studio/schemas/`, or any other implementation path may be written until:**
1. The HTML mock exists on disk at `docs/drafts/SUG-{N}-*.html`
2. The user has reviewed the mock and Phase 0 checkboxes are marked complete

Permitted before Phase 0 sign-off: backlog doc edits, schema planning notes, query design notes.
Not permitted: any JSX, CSS, schema TypeScript, or migration scripts.

Updating the backlog spec (e.g. in response to user feedback) triggers a corresponding mock update in the same response — backlog doc and mock must stay in sync. If the user asks to update the spec, update the mock too before closing the response.

A Phase 0 violation (FE code committed before mock approval) is a process failure, not a shortcut.

### No speculative fixes

When the user reports a bug (white screen, crash, visual regression):

1. **Request the error first** — ask for the browser console output or a screenshot before writing code.
2. **Do not commit a fix based on a guess.** Speculative patches add noise commits and can mask the real issue.
3. If a fix commit turns out to be wrong, squash it into the original commit before merging.

### CSS Triage Protocol

Before writing a CSS fix for overflow, scrollbar, or layout collapse: **identify the exact DOM element** that owns the misbehavior (via DevTools screenshot or `preview_inspect`). Document:
1. The element's class name
2. Its computed `overflow`, `width`, and `box-sizing` values
3. Its parent's containment context

Do not write CSS until this is documented. Guessing which container has the overflow leads to multi-round blind patching.

**bg-through-gap pattern documentation rule:** When a container uses `background-color: var(--st-color-rule-accent)` with `gap: 1px` to produce hairline dividers, every child element that covers the gap background must carry an explicit `background` declaration — even if it looks redundant. Annotate it:

```css
background: var(--st-card-bg); /* covers parent --st-color-rule-accent gap bg */
```

Removing this annotation-less `background` declaration is a recurring mistake: the repair looks like dead code but is load-bearing. If a bg-through-gap pattern is not serving the layout (because all dividers can be expressed as `border` rules on adjacent siblings), replace the pattern entirely with `> * + *` adjacent-sibling border rules — and document the replacement in the commit message — so it cannot be misread as dead code in future.

### CSS layout fix escalation rule

When a CSS layout fix fails and requires a follow-up commit, **stop and diagnose before patching**. Write a 1-paragraph root-cause analysis covering the full cascade (containment → flex/grid → margin → max-width → child sizing) before writing the next fix.

If 2+ fix commits address the same layout surface in sequence, treat it as a signal to step back, map the full constraint chain, and fix the root cause, not the symptom.

**Self-check after every CSS fix commit:** grep for the same selector(s) in the prior 3 commits. If the same surface appears in a recent fix, halt and write the root-cause paragraph before the next fix. Two consecutive fix commits on the same CSS surface without a documented root-cause analysis is a process failure.

### `container-type` guardrail

`container-type: inline-size` establishes size containment that can interfere with flex-grow negotiation. Before applying it:

1. Verify the element does **not** use `margin: auto` on the inline axis (auto margins + containment prevents stretch)
2. Verify the element's parent flex/grid context does not rely on the child growing beyond its basis
3. If the element is a flex child, add `width: 100%` explicitly — do not rely on `align-items: stretch` surviving containment

If a layout collapses after adding `container-type`, remove the containment first and replace the `@container` query with a `@media` query or intrinsic grid sizing (`minmax()`).

### Studio schema changes get their own commit

Any change to `apps/studio/schemas/` that is **not** a direct consequence of a DS component API decision belongs in a separate commit scoped to a studio concern — it must **not** be bundled into a component, tooling, or web epic commit.

Commit prefix: `feat(studio):` or `fix(studio):`.

If a schema change is needed to unblock a component epic, commit the schema change first, then begin the component work in a subsequent commit.

**Schema changes are not live until deployed.** The local Studio uses your code directly, but MCP tools (`create_documents_from_json`, `patch_document_from_json`, etc.) and the Content Lake API validate against the **deployed** schema. After any schema change, run:

```bash
npx sanity schema deploy
```

If you skip this step, MCP writes will fail with validation errors listing the old allowed types, even though Studio works fine locally. This is the single most common cause of "the schema has the field but MCP rejects it" confusion.

### Paired schema convention

When an **object schema** and a **document schema** represent the same logical concept, they are a linked pair. Any change to option labels, field names, validation rules, or field descriptions on one must be reviewed against the other in the same commit.

Known pairs:
- `ctaButton` (object, `schemas/objects/ctaButton.ts`) ↔ `ctaButtonDoc` (document, `schemas/documents/ctaButtonDoc.ts`)

When adding a new object/document pair, register it in this list. A fix to one half of a pair that misses the other is a bug, not a follow-up.

### Single Field Authority

Each user-facing concept (label, title, description, URL) must resolve from **exactly one field**. If a sub-object (e.g. `linkItem`) brings a field that overlaps with a parent schema field (e.g. `ctaButton.text` vs `linkItem.label`), one must be canonical and the other must be hidden or removed in the same commit.

Two fields that could plausibly hold the same value is a bug, not a feature. When composing a sub-object into an existing schema, audit the parent for field-purpose overlap before merging.

### Section Layout Contract

All page sections rendered by `PageSections.jsx` must follow these layout rules:

**1. Parent Owns Gap (the foundational rule)**

In detail page context (`context="detail"`), the parent `.detailContext` container owns inter-section spacing via `display: flex; flex-direction: column; gap: var(--st-space-section-break-detail)`. Individual sections must have **zero vertical margin and zero vertical padding** in this context. Internal component padding (box inset for callouts, code blocks, etc.) is allowed; external margin is not.

This prevents double-padding at section boundaries (the original failure mode: each section had its own padding-block, so adjacent sections stacked 40+40=80px).

**2. Flex Child Width Contract**

All direct children of `.detailContext` must have `width: 100%`. Without it, flex children shrink to their content width (heroes collapse to their inner max-width, callouts hug text, CTA sections shrink to button width). The parent `.detailPage` container controls max-width (760px); children stretch to fill it.

**3. Catch-All Over Whitelist**

The `.detailContext` override uses `> *` (catch-all) rather than a named selector list. This ensures new section types (including those with their own CSS modules, like CardBuilderSection) automatically inherit the layout rules without needing explicit registration. Targeted exceptions (e.g. hero `overflow: visible` for overlays) are applied as named overrides after the catch-all.

**4. Component Margin Zero**

When a component renders inside a layout container that uses `gap`, the component must zero its own external margin. Components like the callout `<aside>` have their own `margin-block` in standalone context, but this conflicts with the parent gap in detail context. Override with `.detailContext .calloutSection :global(aside) { margin-block: 0 }`.

The rule: **internal padding = component's concern. External spacing = layout's concern.** If a component has `margin-block` in its own CSS module, it needs a zero-margin override in detail context.

**5. Boundary Elements**

Elements that sit between two spacing contexts (e.g. MetadataCard between the hero and detailContext) belong to neither flex container. They need explicit margin: `.detailPage > aside:first-child { margin-bottom: var(--st-space-section-break-detail) }`. When adding a new element to a detail page template, check whether it falls inside or outside the detailContext wrapper.

**6. Typography** (unchanged)

Body text uses `var(--st-font-heading-4)`, headings use `var(--st-font-heading-*)` scale, h2 colour is `var(--st-color-brand-primary)`.

**When adding a new section type:**
- Verify it renders correctly adjacent to existing section types on a real page (not just in isolation)
- Test inside both `context="detail"` (detail pages) and `context="full"` (standalone pages)
- Confirm it stretches to full width in detail context (the `> *` catch-all should handle this automatically)
- If the component has its own `margin-block` in its CSS module, add a zero-margin override in the `.detailContext` section of `PageSections.module.css`
- **Visual QA:** verify spacing against the test preview post at `/articles/test-preview-post`, which covers every section type and spacing transition

### GROQ projection audit for nested image types

When writing a GROQ projection for an array of objects that contain image fields, verify the depth of the asset reference. Schema types that wrap `image` in another object (like `richImage`) require flattening:

```groq
// richImage: asset is a field of type 'image', which itself contains asset._ref
images[] {
  "asset": asset.asset->,   // dereference the INNER reference
  "hotspot": asset.hotspot,
  "crop": asset.crop,
  alt,
  caption
}
```

Do **not** write `asset->` on a `richImage` — that dereferences the `image` object, not the reference inside it, and silently returns null.

### Taxonomy pre-flight (blocking)

Before creating **any** new taxonomy document (`tag`, `category`, `person`, `tool`, `project`), run a pre-flight query:

```groq
*[_type == "tag"]{ _id, name, slug }          // or category / person / tool / project
```

Then:

1. **Diff the requested label against existing `name` values.** If an 80%+ semantic match exists, use the existing document — do not create a new one.
2. **Check Linear/backlog for an active cleanup or dedup epic** (e.g. SUG-74). If one is in-flight, do not add new taxonomy without explicit user approval.
3. **Check the field is correct for the type** — all five taxonomy primitives use `name` as the display field (not `title`). GROQ projects `"title": name` in fragments. Querying `title` directly will return null and make existing docs look empty.
4. **Flag tool/platform names** — the tag schema vocabulary says tool names (Figma, Sanity, Shopify, etc.) belong in `tools[]` on content documents, not as `tag` docs. If a requested tag label is a tool or platform name, surface this before creating: "This is a platform name — confirm it should be a tag rather than a tool ref."

Shape content to the schema, not the schema to the content. If a requested label has no good match, note what doesn't exist and create only those — not everything on the list.

### Sanity MCP content writes — no AI rewriting

When writing content to Sanity via MCP tools, **assume all content is final, proofed copy**. Do not use tools that pass content through Sanity's AI pipeline unless the user explicitly requests AI-assisted drafting.

**Default tools (verbatim, no rewriting):**
- `patch_document_from_json` — sets exact field values
- `create_documents_from_json` — creates docs with precise content
- `@sanity/client` via migration scripts — direct API, no intermediary

**AI-assisted tools (rewrite content — require explicit user consent):**
- `patch_document_from_markdown` — Sanity AI interprets and may reword
- `create_documents_from_markdown` — same; AI restructures prose
- `create_version` with `instruction` param — intentional AI rewrite
- `generate_image` / `transform_image` — AI image generation

**Rule:** If a user provides copy to write to Sanity, use `_from_json` tools or the Sanity client directly. Never route authored content through an AI rewriting layer without saying so. If AI-assisted drafting would be helpful, ask first: "Want me to use Sanity AI to help draft this, or should I save it exactly as written?"

### Anti-Slop Content Rules

All AI-drafted content (copy, descriptions, alt text, commit messages, doc prose) must pass the anti-slop checks documented in `docs/brand/brand-voice-guide.md`. The key enforcement rules:

**Banned in all non-node content:**
- **Em dashes** (`—`). Use commas, parentheses, colons, or separate sentences. Em dashes are the single most reliable structural AI tell.
- **Decorative emoji/icons.** No `🚀`, `✨`, `🌟` garnish. If an emoji doesn't earn its place through humour or irony, it doesn't appear.
- **Filler transitions:** "That said," / "With that in mind," / "That being said," / "It's worth noting that" / "At the end of the day." If the next paragraph follows logically, it doesn't need a bridge.
- **AI vocabulary:** "delve into", "leverage", "utilize", "facilitate", "synergize", "ideate", "learnings", "passionate about", "excited to announce", "in today's landscape."
- **Hedge stacking:** "I think maybe this could possibly" — pick a position.
- **Empty adjective triads:** "robust, scalable, and maintainable" — use one specific adjective or a number.
- **Sentence-opening repetition:** Three consecutive sentences starting with the same word is a rewrite signal.
- **List-itis:** Bullets are for parallel items, not for avoiding prose.

**Node exemptions:** Nodes (AI-narrated, forensic storyteller voice) are exempt from the em dash and emoji bans. Em dashes are part of the register. Emoji in nodes is used sarcastically or as deadpan humour only.

**Source of truth:** `docs/brand/brand-voice-guide.md` (full checklist with examples and rationale).

---

## Schema Conventions

Full schema authoring rules are in `docs/conventions/schema-conventions.md`. Key rules enforced here:

- **Taxonomy primary field is `name`** — all five taxonomy types (`tag`, `category`, `person`, `project`, `tool`) use `name` as the field identifier, not `title`. GROQ queries use `->name`; never `->title`. The `queries.js` fragments alias it as `"title": name` for component consumption.
- **Preview block** must use `select: { title: 'name' }` so Studio lists display correctly.
- When creating a new taxonomy type, follow the required-fields table in `docs/conventions/schema-conventions.md`.

---

## Image Asset Naming

All images uploaded to Sanity must follow the naming convention in `docs/conventions/image-naming-convention.md`:

```
{docType}-{subject}-{descriptor}[-{index}].{ext}
```

- Prefixes: `article-`, `cs-`, `node-`, `project-`, `tool-`, `diagram-`, `site-`
- Formats: `.webp` (photos), `.png` (diagrams), `.svg` (icons/logos)
- Never upload with default camera/screenshot names (`IMG_1234.jpg`, `Screenshot 2026-...`)

---

## URL Authority Rule (blocking)

All internal URLs must be built via `getCanonicalPath({ docType, slug })` from `apps/web/src/lib/routes.js`. This applies everywhere — components, pages, config maps, and constants.

**Specifically prohibited:**
- Hard-coded path strings like `'/ai-ethics'` or `'/contact'` outside of `routes.js`
- A `LEGAL_LINKS`, `NAV_LINKS`, or similar constant array inside a component file that contains path strings
- Any `to="..."` or `href="..."` with a literal path that isn't derived from `getCanonicalPath()` or a registered route constant

**The only exception:** redirects in `App.jsx` that explicitly map legacy routes (e.g. `/blog → /articles`). These are route definitions, not link targets.

If a utility link set (e.g. footer legal row) needs hardcoded paths, those paths must be registered as named constants in `routes.js` and imported from there — not defined inline in the component.

---

## Atomic Reuse Gate (blocking)

Before creating ANY new component, schema object, CSS surface, utility, **or taxonomy document**, answer these questions **in writing** (in the epic doc, commit message, or inline comment):

1. **Does this pattern already exist?** — Search all 5 layers per MEMORY.md §Before You Build. For taxonomy: run the pre-flight query (see §Taxonomy pre-flight above). If yes, extend — do not fork or duplicate.
2. **Will this be consumed by more than one caller?** — If yes, it must live in a shared location (`lib/`, `design-system/`, `schemas/objects/`), never inline in a page file.
3. **Is the API composable?** — Props/fields should be named so the component can be extended without forking. Prefer `children` over fixed slots. Prefer token-driven styling over hardcoded values.

This is the "Before You Build" reuse audit formalized as a **blocking checklist**, not a suggestion. A new component or taxonomy item that fails any of these three checks is a process failure.

---

## DS Component Authoring — Token-First Rule (blocking)

When writing or modifying any component CSS file (in `apps/web/src/design-system/` or `packages/design-system/src/`):

**No raw color value may appear in a component CSS file.** Every color must resolve through a `--st-*` token reference. If the token doesn't exist yet, add it to `tokens.css` first — in a separate commit — before writing the component CSS.

**Fallback syntax rule:** `var(--st-token, #hex)` is banned. The only permitted fallback form is `var(--st-token, var(--st-primitive))`. If a matching primitive doesn't exist, add it to `tokens.css` first. If no fallback is needed, omit it entirely.

**Token naming — concept not placement:** Token names are contracts, not descriptions. A token used in 2+ distinct surfaces must have a name that works for all of them, not just the first. If a name is placement-specific (e.g. `--st-card-folio-bg`) but the token is also used in FilterBar headers and MetadataCard label cells, rename it to reflect the shared concept (`--st-card-label-bg`). Full naming rules: `docs/conventions/token-naming.md`.

**Theme files are override-only:** `theme.light.css`, `theme.pink-moon.css`, and any future theme files may only *override* existing `--st-*` token names with other token references. They may not introduce a color value (hex, rgba, hsla) that has no primitive anchor in `tokens.css`. If a theme-specific color value (e.g. a shadow, a glow, a callout wash) doesn't exist as a named primitive, add the primitive first.

These rules exist because a hardcoded value in a component bypasses the token graph entirely — the theme system cannot override it, the validator cannot audit it, and every DS mirror compounds the violation. One inline rgba in a first-pass component becomes four violations by the time both mirrors and both theme overrides are written. 386 of them became an epic. See: node *"The Validator Said Zero Errors. It Was Watching the Wrong Door."*

**When creating a component with chip/badge/status color states** (any enumerated set of visual states with distinct colors): define all `--st-status-<state>-{bg,fg,border}` tokens for every state in `tokens.css` before writing the component CSS. Add light-theme overrides in the same commit. This is not deferrable — the status chip system in Card accumulated 90 hardcoded values by skipping this step.

**Theme cascade audit before using any background token:** The Pink Moon theme has a glassmorphism layer in its dark block that overrides semantic `--st-color-bg-surface*` tokens to semi-transparent `rgba()` values, not the solid dark primitives from `tokens.css`. Before using any `--st-*` token for a `background` or `background-color` declaration in a component, trace the full override chain:

1. `tokens.css` — default value
2. `theme.pink-moon.css` light block — light-theme override
3. `theme.pink-moon.css` dark block — dark-theme override (most likely to surprise)

If the dark-block value is `rgba(...)`, using that token for a label cell or header bg will produce a glassmorphism wash, not a solid surface. Switch to a raw primitive token (e.g. `--st-color-midnight-800`) or a semantic alias that points directly to a primitive with no glassmorphism override.

Tokens with glassmorphism overrides in dark-pink-moon: `--st-color-bg-surface`, `--st-color-bg-surface-strong`, `--st-card-bg`.

---

## Pre-Commit Checklist for CSS Token Changes

Whenever `apps/web/src/design-system/styles/tokens.css` **or** `packages/design-system/src/styles/tokens.css` is edited, or whenever any component CSS file is created or modified:

1. Run `pnpm validate:tokens` from `apps/web/` and confirm **zero errors** before committing.
2. Run `pnpm validate:tokens --strict-colors` from `apps/web/` and confirm **zero hardcoded color violations** before committing.
3. Update **both** token files in the same commit — they must stay in sync at all times.

`validate:tokens` catches: undefined `var(--st-*)` references, renamed tokens with lingering references, cross-file drift.
`validate:tokens --strict-colors` catches: raw hex, rgba, or hsla values in any component or theme CSS file outside `tokens.css`. This is the rule that SUG-68 enforced retroactively — run it proactively so the audit never needs to happen again.

---

## Visual Verification Rules

Build success does not equal visual correctness. Never declare CSS or layout work "done" based solely on a clean build or runtime error absence.

### Pre-audit branch check

Before running any **post-deploy verification** against production (Lighthouse, Chromatic prod, link checker, CWV audit, etc.), confirm the commits under test are on `origin/main`. Auditing production for an effect that lives on an unmerged feature branch wastes time and produces misleading "no improvement" readings.

Recipe:
```bash
git branch --contains <commit-sha>     # must list main
git log origin/main..<branch>          # must be empty (branch merged)
```

If the commits are not on `origin/main`, halt the audit and surface the gap to the user before running anything.

### When a visual mock or spec exists

Produce a **mock-to-implementation comparison table** before requesting close-out. The table must list every visual element in the mock (field order, spacing values, chip styles, typography, colours) and flag each as Match, Drift, or Missing. Present this table to Bex for review. Do not close the epic until "Visual QA approved."

### For every CSS property you write

Confirm:
1. The value is a token reference (`var(--st-*)`) not a hardcoded value. If hardcoded, state why.
2. The computed layout matches the dimensional contract. Show the arithmetic (e.g. "Mock: 3-col grid at 1200px. Card 340px, gap 24px. 340x3 + 24x2 = 1068px + padding = 1200px").
3. Spacing and gap values match the mock or spec. Numbers, not vibes.

### Dark mode surface work — pre-flight

Before any structured-surface dark mode CSS pass (MetadataCard, Card, FilterBar, any component with label or folio strips), **inspect the reference component's computed values in the browser first**:

1. Open the reference component (e.g. standard `Card`) in Storybook on `dark-pink-moon` theme
2. Use DevTools to inspect computed `background-color`, `border-color`, and `color` on each visual zone (card bg, folio/label strip, body, dividers)
3. Record the exact computed values and trace them back to their tokens via `tokens.css` and `theme.pink-moon.css`

Only then write the target component's CSS to match. Working forward from token names ("I'll use `--st-card-bg`") without verifying what those tokens resolve to in dark theme leads to glassmorphism surprises. The MetadataCard dark mode repair cycle (3+ correction rounds) was caused by this exact failure.

### Storybook coverage requirement

Every new or modified component that has visual output must have a Storybook story before close-out. The story must cover: default state, all meaningful variants, and at least one edge case (long text, missing fields, empty arrays). Components without stories are invisible to Chromatic VRT.

### Honesty over confidence

List visual elements you cannot verify without a browser. "I cannot confirm the hover state transition timing matches the mock" is acceptable. "Everything looks good" without evidence is not.
