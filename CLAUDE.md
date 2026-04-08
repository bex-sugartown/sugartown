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
2. **Move epic doc** from `docs/backlog/` to `docs/shipped/` — commit: `docs: ship SUG-{N} {name}`
3. **Mini-release** — run `/mini-release` to produce a patch version bump and CHANGELOG stub
4. **Update Linear** — transition the SUG-{N} issue to **Done**
5. **Clean tree** — confirm `git status` is clean before starting the next epic

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

### Linear Done = code in remote

Before transitioning any Linear issue to **Done**, verify that at least one commit referencing the issue exists on a remote branch (pushed to GitHub). No exceptions.

A Linear issue marked Done with zero code on remote is a process failure. The close-out sequence enforces this naturally (commit → push → move doc → Done), but if the close-out is skipped, this rule is the backstop.

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

Two `docs/` subdirectories are **local-only** — gitignored and never committed:

- **`docs/drafts/`** — working drafts, manifestos, HTML mocks, GIFs, exploration docs. Content here is in flux and stays on Bex's machine until it's ready to move elsewhere (Sanity, `docs/briefs/`, `docs/shipped/`).
- **`docs/brand/`** — brand voice guides, node style guide, voice cheatsheets. Private editorial reference, not published to the repo.

**Rules:**
- Never `git add` files in these directories. They are gitignored for a reason.
- Never ask "should we commit these drafts?" — the answer is always no.
- If a draft graduates to a brief or a Sanity document, copy it to the destination and leave the draft in place as a local archive.
- If git shows these files as "deleted" in `git status`, it means they were previously tracked and need to be untracked with `git rm --cached`.

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

### CSS layout fix escalation rule

When a CSS layout fix fails and requires a follow-up commit, **stop and diagnose before patching**. Write a 1-paragraph root-cause analysis covering the full cascade (containment → flex/grid → margin → max-width → child sizing) before writing the next fix.

If 2+ fix commits address the same layout surface in sequence, treat it as a signal to step back, map the full constraint chain, and fix the root cause — not the symptom.

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

### Paired schema convention

When an **object schema** and a **document schema** represent the same logical concept, they are a linked pair. Any change to option labels, field names, validation rules, or field descriptions on one must be reviewed against the other in the same commit.

Known pairs:
- `ctaButton` (object, `schemas/objects/ctaButton.ts`) ↔ `ctaButtonDoc` (document, `schemas/documents/ctaButtonDoc.ts`)

When adding a new object/document pair, register it in this list. A fix to one half of a pair that misses the other is a bug, not a follow-up.

### Single Field Authority

Each user-facing concept (label, title, description, URL) must resolve from **exactly one field**. If a sub-object (e.g. `linkItem`) brings a field that overlaps with a parent schema field (e.g. `ctaButton.text` vs `linkItem.label`), one must be canonical and the other must be hidden or removed in the same commit.

Two fields that could plausibly hold the same value is a bug, not a feature. When composing a sub-object into an existing schema, audit the parent for field-purpose overlap before merging.

### Section Layout Contract

All page sections rendered by `PageSections.jsx` must share:

1. **Horizontal containment** — inherited from parent when inside a detail page (`context="detail"`). Sections must not define their own `max-width` or `padding-inline` in this context.
2. **Vertical rhythm** — `padding-block` only, using `--st-spacing-stack-lg` (32px) for standard sections in detail context.
3. **Typography** — body text uses `var(--st-font-heading-4)`, headings use `var(--st-font-heading-*)` scale, h2 colour is `var(--st-color-brand-primary)`.

When adding a new section type, verify it renders correctly:
- Adjacent to existing section types on a real page (not just in isolation)
- Inside both `context="detail"` (detail pages) and `context="full"` (standalone pages)
- Check `.detailContext` overrides in `PageSections.module.css` and add the new section class if it has its own `max-width` / `padding-inline`

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

## Atomic Reuse Gate (blocking)

Before creating ANY new component, schema object, CSS surface, or utility, answer three questions **in writing** (in the epic doc, commit message, or inline comment):

1. **Does this pattern already exist?** — Search all 5 layers per MEMORY.md §Before You Build. If yes, extend via props — do not fork.
2. **Will this be consumed by more than one caller?** — If yes, it must live in a shared location (`lib/`, `design-system/`, `schemas/objects/`), never inline in a page file.
3. **Is the API composable?** — Props/fields should be named so the component can be extended without forking. Prefer `children` over fixed slots. Prefer token-driven styling over hardcoded values.

This is the "Before You Build" reuse audit formalized as a **blocking checklist**, not a suggestion. A new component that fails any of these three checks is a process failure.

---

## Pre-Commit Checklist for CSS Token Changes

Whenever `apps/web/src/design-system/styles/tokens.css` **or** `packages/design-system/src/styles/tokens.css` is edited:

1. Run `pnpm validate:tokens` from `apps/web/` and confirm **zero errors** before committing.
2. Update **both** token files in the same commit — they must stay in sync at all times.

This catches: duplicate definitions, renamed tokens with lingering references, and cross-file drift. See MEMORY.md §Token Drift Rules for background.
