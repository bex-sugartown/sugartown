# PROMPT — EPIC-0146: Archive & Page Type Normalization
**Version:** v1.0
**Run with:** Claude Code (Sugartown monorepo, project context required)
**Epic brief:** `EPIC-0146-brief.html`
**Wireframes:** `EPIC-0146-mocks.html`

---

## Before You Start

This epic has 4 stories and touches 3 content types, 2 new design system components, and 1 schema change. The work is additive — nothing here should break existing archive or filter functionality.

Read the following before writing a single line:

```bash
cat CHANGELOG.md | head -80
cat apps/web/src/lib/queries.js
cat apps/web/src/pages/NodePage.jsx
cat apps/web/src/pages/ArticlePage.jsx
cat apps/web/src/pages/CaseStudyPage.jsx
cat apps/web/src/components/ItemCard.jsx
cat apps/studio/schemas/documents/archivePage.ts
```

Then confirm your understanding by outputting:

1. Where excerpts currently render (component + line numbers)
2. What fields `archivePage` schema currently has in its `display` group (or nearest equivalent)
3. What the current `st-card` CSS classes and modifiers are (search `apps/web/src` for `.st-card`)
4. Whether `ContentNav` or `MetadataCard` components already exist in any form

**Do not proceed to Phase 1 until you have answered all four.** If any answer is "I can't find it," say so explicitly — do not guess.

---

## Design System Rules (Non-Negotiable)

These apply to every line of CSS and HTML in this epic:

- All classes use `st-*` namespace and BEM structure
- All values use `--st-*` tokens — zero hardcoded hex or px
- No page-specific CSS — everything goes in the design system
- `st-chip` = filled pink (taxonomy tags — conceptual labels)
- `st-chip--outlined` = transparent with seafoam border (reference taxonomy — tools, platforms)
- New components: `st-card--metadata`, `st-content-nav` and its BEM children

If you are about to hardcode a color or write a `.page-*` class, stop and use a token instead.

---

## Phase 0 — Git Checkpoint

Before any changes:

```bash
git status
git log --oneline -5
```

Confirm you are on a feature branch. If you are on `main`, create one:

```bash
git checkout -b epic/archive-page-type-normalization
```

Output the branch name. Do not proceed until confirmed.

---

## Phase 1 — Story 1: Excerpt Scoping

**Goal:** Excerpts render on archive cards only. Single pages show zero excerpt.

### Tasks

**1.1** In `ArticlePage.jsx`, find where excerpt renders and remove it. Do not remove the variable — it may feed `<meta name="description">`. Only remove the JSX that renders excerpt as visible body text.

**1.2** Repeat for `NodePage.jsx`.

**1.3** Repeat for `CaseStudyPage.jsx`.

**1.4** In `ItemCard.jsx`, verify excerpt still renders. Do not change this — only confirm it.

**1.5** Check: does any shared component conditionally render excerpt based on context? If so, note the file and line. Do not change it yet.

### Confirm Before Moving On

Run the dev server and verify:
- A single node page: no excerpt visible
- The knowledge-graph archive: excerpt visible on cards

Output: "Story 1 complete. Excerpt removed from [list files changed]. Excerpt confirmed present in ItemCard at [line]."

**Wait for confirmation before starting Phase 2.**

---

## Phase 2 — Story 2: Archive Card Prop Controls

**Goal:** Studio editors can toggle excerpt and hero image visibility per archive, and optionally override the default card image.

### Tasks

**2.1** In `apps/studio/schemas/documents/archivePage.ts`, add a `cardOptions` field group. If a `display` group already exists, add it there. If not, create a `display` group first.

Add these fields inside `cardOptions`:

```ts
defineField({
  name: 'cardOptions',
  title: 'Card Display',
  type: 'object',
  group: 'display',
  fields: [
    defineField({
      name: 'showExcerpt',
      title: 'Show excerpt on cards?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showHeroImage',
      title: 'Show hero image on cards?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'imageOverride',
      title: 'Default card image (overrides per-item image)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
```

**2.2** In `apps/web/src/pages/ArchivePage.jsx`, extend the GROQ query to fetch `cardOptions` from the `archivePage` document. Add to the existing archivePage projection:

```groq
cardOptions {
  showExcerpt,
  showHeroImage,
  imageOverride { asset-> }
}
```

**2.3** In `ArchivePage.jsx`, pass `cardOptions` as a prop down to `ItemCard` (or whatever component renders the individual cards).

**2.4** In `ItemCard.jsx`, accept `showExcerpt`, `showHeroImage`, and `imageOverride` as props. Wire them:
- `showExcerpt === false` → do not render excerpt
- `showHeroImage === false` → do not render image
- `imageOverride` present → use it instead of the item's own `heroImage`

Default all three to the current behavior (i.e., `showExcerpt` defaults to `true` — no regression for existing archives).

### Confirm Before Moving On

Open Sanity Studio. Navigate to any archive page document. Confirm the "Card Display" fieldset is visible with the three controls.

Output: "Story 2 complete. Schema field added at [location]. GROQ updated in [file]. ItemCard props wired at [lines]."

**Wait for confirmation before starting Phase 3.**

---

## Phase 3 — Story 3: Metadata Card

**Goal:** A `MetadataCard` component renders between the page header and body on all article, node, and case study pages. Static `page` type gets nothing.

The metadata card is the **single metadata surface** on every content page. All taxonomy — including tools and tags — lives inside it. Nothing renders metadata below the body copy.

### Tasks

**3.1 — Design system CSS**

Add `st-card--metadata` to the appropriate CSS file (wherever `st-card` base styles live). Structure:

```css
/* st-card--metadata */
.st-card--metadata {
  /* Full width within st-content-constrained */
  /* Border-left: 3px solid var(--st-color-brand-primary) */
  /* Uses st-card base — modifier only adds the accent border and layout overrides */
}

.st-card--metadata__grid {
  /* Responsive grid: 3 columns desktop, 2 tablet, 1 mobile */
  /* Each cell is a metadata field */
}

.st-card--metadata__field {
  /* Field label + value pair */
}

.st-card--metadata__field-label {
  /* Monospace, uppercase, muted — matches existing st-label pattern */
}

.st-card--metadata__taxonomy {
  /* Row for chip groups (tools, tags) */
  /* Separated from grid by dashed divider: 1px dashed rgba of brand-primary */
}

.st-card--metadata__taxonomy-label {
  /* Same as field-label */
}

.st-card--metadata__taxonomy-chips {
  /* Flex row, gap, wrap */
}
```

Use only `--st-*` tokens. Reference existing token names from the codebase — do not invent new ones without checking they don't already exist.

**3.2 — MetadataCard component**

Create `apps/web/src/components/MetadataCard.jsx`.

Props contract:

```jsx
<MetadataCard
  contentType="node"         // "article" | "node" | "caseStudy"
  publishedAt="2025-01-15"   // ISO string
  categories={[{ _id, name, slug, colorHex }]}
  tags={[{ _id, name, slug }]}
  tools={["Sanity", "React", "Vite"]}  // string[] — enum values
  project={{ title: "PROJ-003", slug: { current: "proj-003" } }}
  // node-specific
  aiTool="Claude"
  status="Validated"
  conversationType="Code Review"
  // caseStudy-specific
  client="Acme Corp"
  role="Lead PM"
/>
```

Layout inside the component:

1. `st-card--metadata__grid` — structured fields (varies by contentType, see matrix below)
2. Dashed `<hr>` divider — only if `tools` has items
3. `st-card--metadata__taxonomy` for tools — `st-chip--outlined` chips
4. Dashed `<hr>` divider — only if `tags` has items
5. `st-card--metadata__taxonomy` for tags — `st-chip` (default filled) chips

**Field matrix by content type:**

| Field | node | article | caseStudy |
|---|---|---|---|
| AI Tool | ✓ | — | — |
| Status | ✓ | ✓ | ✓ |
| Category | ✓ | ✓ | ✓ |
| Project | ✓ | — | ✓ |
| Conv. Type | ✓ | — | — |
| Client | — | — | ✓ |
| Tools row | ✓ | ✓ | ✓ |
| Tags row | ✓ | ✓ | ✓ |

Render `categories` using `TaxonomyChips` if that component already exists. If not, render as `st-chip` elements directly.

**3.3** Integrate `MetadataCard` into `NodePage.jsx`. Place it between the page header/hero and the body content. Pass all node-specific fields from the GROQ query result.

Verify the GROQ query for `NodePage` fetches: `categories`, `tags`, `tools`, `project`, `aiTool`, `status`, `conversationType`. Add any missing fields to the query.

**3.4** Integrate into `ArticlePage.jsx`. Pass `categories`, `tags`, `tools`, `project`, `status`.

**3.5** Integrate into `CaseStudyPage.jsx`. Pass `categories`, `tags`, `tools`, `project`, `client`, `role`, `status`.

**3.6** Confirm `page` type (static pages, `PagePage.jsx` or equivalent) does NOT include `MetadataCard`. Do not add it.

**3.7** WCAG check: the muted label color used for field labels must have at least 3:1 contrast against the card background. Check the token value. If it fails, flag it — do not silently pass.

### Confirm Before Moving On

Navigate to:
- `/knowledge-graph/[any-slug]` — metadata card visible with AI Tool, Status, Category, Project, Conv. Type, Tools, Tags
- `/articles/[any-slug]` — metadata card visible with Status, Category, Tools, Tags
- `/case-studies/[any-slug]` — metadata card visible with Status, Category, Project, Client, Tools, Tags
- `/[any-static-page-slug]` — NO metadata card

At 320px width: grid stacks to single column, chips wrap.

Output: "Story 3 complete. MetadataCard at [path]. Integrated into [list pages]. WCAG: [pass/flag]."

**Wait for confirmation before starting Phase 4.**

---

## Phase 4 — Story 4: Next/Previous Navigation

**Goal:** Every article, node, and case study page has prev/next links to adjacent content of the same type, ordered chronologically by `publishedAt`. Static pages have nothing.

### Tasks

**4.1 — GROQ queries**

In `apps/web/src/lib/queries.js`, add adjacent-item queries. Pattern:

```groq
// Previous item (most recent before current)
"previous": *[
  _type == $contentType
  && publishedAt < $currentPublishedAt
  && defined(slug.current)
  && !(_id in path("drafts.**"))
] | order(publishedAt desc) [0] {
  title,
  "slug": slug.current,
  publishedAt
},

// Next item (earliest after current)
"next": *[
  _type == $contentType
  && publishedAt > $currentPublishedAt
  && defined(slug.current)
  && !(_id in path("drafts.**"))
] | order(publishedAt asc) [0] {
  title,
  "slug": slug.current,
  publishedAt
}
```

Export as a helper function `getAdjacentItemsQuery(contentType)` or fold into the existing per-type detail queries — whichever is consistent with how queries are currently structured in this project.

**4.2 — ContentNav component**

Create `apps/web/src/components/ContentNav.jsx`.

Props:

```jsx
<ContentNav
  contentType="node"   // "article" | "node" | "caseStudy" — drives URL prefix and label
  previous={{ title: "...", slug: "..." }}  // null if first item
  next={{ title: "...", slug: "..." }}      // null if last item
/>
```

URL construction must use the canonical route map (`routes.js` or equivalent). Do not hardcode paths.

Layout:
- Full width, placed below body content, above any footer
- Two-column grid: previous card left, next card right
- Each card: direction label ("← Previous Node" / "Next Article →"), then title
- Long titles truncate with ellipsis (CSS `text-overflow`)
- If `previous` is null, the left slot is empty (no orphaned arrow)
- If `next` is null, the right slot is empty
- On mobile (<640px): single column, previous on top

All elements are `<a>` tags — keyboard accessible by default.

**4.3 — Design system CSS**

Add to the design system CSS file:

```css
.st-content-nav { }
.st-content-nav__prev { }
.st-content-nav__next { }
.st-content-nav__label { }
.st-content-nav__title { }
```

Hover state: subtle translate + shadow, consistent with existing `st-card` hover pattern. Use `--st-*` tokens for shadow and transition values.

**4.4** Integrate into `NodePage.jsx`. Fetch adjacent nodes in the page query. Pass to `ContentNav` with `contentType="node"`.

**4.5** Integrate into `ArticlePage.jsx`. `contentType="article"`.

**4.6** Integrate into `CaseStudyPage.jsx`. `contentType="caseStudy"`.

**4.7** Confirm `page` type has NO `ContentNav`. Static pages have no sequence.

**4.8** Edge cases — confirm these work:
- The chronologically oldest node: `previous` is null, left slot is empty, right slot shows next
- The chronologically newest node: `next` is null, right slot is empty, left slot shows previous
- A node with neither neighbor (only node in system): both slots empty, component renders nothing or a minimal empty state

### Confirm Before Moving On

Navigate to a node page in the middle of the sequence. Confirm both prev and next links appear and navigate correctly. Navigate to the oldest and newest node. Confirm correct edge case behavior.

Output: "Story 4 complete. ContentNav at [path]. Queries in [file]. Integrated into [pages]."

**Wait for confirmation before starting Phase 5.**

---

## Phase 5 — Storybook

Create two Storybook stories.

### MetadataCard stories

File: `apps/storybook/stories/MetadataCard.stories.jsx` (or `.ts` — match existing convention)

Required stories:
- `NodeDefault` — full node with all fields, tools, and tags
- `ArticleDefault` — article with status, category, tools, tags
- `CaseStudyDefault` — case study with client, role, tools, tags
- `NoTools` — any content type without tools array (tools row hidden)
- `NoTags` — any content type without tags array (tags row hidden)
- `MinimalFields` — only required fields, no optional metadata

### ContentNav stories

File: `apps/storybook/stories/ContentNav.stories.jsx`

Required stories:
- `BothLinks` — prev and next both present
- `NoPrevious` — first item, only next
- `NoNext` — last item, only previous
- `LongTitles` — titles that exceed container width, verify ellipsis

### Confirm

```bash
pnpm --filter storybook dev
```

All six stories render without errors.

Output: "Phase 5 complete. Stories at [paths]. All render without error."

**Wait for confirmation before Phase 6.**

---

## Phase 6 — Validation & Cleanup

Run the full validator suite:

```bash
pnpm validate:urls
pnpm validate:filters
pnpm validate:taxonomy
```

All must pass. If any fail, fix before committing.

Then do a CSS audit of everything added in this epic:

- Search new CSS for any hardcoded hex values: `grep -r "#[0-9a-fA-F]" apps/web/src` (new files only)
- Search for any `px` values that should be tokens: `gap: 8px` → `gap: var(--st-spacing-2)`, etc.
- Search for any `.page-*` or `.app-*` classes in new code

Fix all violations before committing.

---

## Phase 7 — Commit

One commit per story is preferred. Use conventional commit format:

```bash
git add -p   # stage selectively — do not stage unrelated changes
git commit -m "feat(web): Story 1 — remove excerpt from single page views"
git commit -m "feat(studio): Story 2 — add cardOptions to archivePage schema"
git commit -m "feat(web): Story 3 — MetadataCard component with tools and tags taxonomy"
git commit -m "feat(web): Story 4 — ContentNav prev/next navigation on content pages"
git commit -m "feat(storybook): Story 3+4 — MetadataCard and ContentNav stories"
```

Then output the diff summary for release notes:

```bash
git diff main --stat
git log main.. --oneline
```

---

## Definition of Done Checklist

Run through this before declaring the epic complete:

- [ ] No excerpt visible on any single article, node, or case study page
- [ ] Excerpt still visible on archive cards
- [ ] Sanity Studio shows "Card Display" controls on archive page documents
- [ ] `showExcerpt: false` hides excerpt from all cards in that archive
- [ ] `showHeroImage: false` renders cards without images
- [ ] `imageOverride` replaces item images when set
- [ ] Metadata card renders on article, node, and case study pages
- [ ] Metadata card does NOT render on static `page` type
- [ ] Metadata card shows correct fields per content type (see matrix in Story 3)
- [ ] Tools render as `st-chip--outlined` (seafoam outlined)
- [ ] Tags render as `st-chip` (pink filled)
- [ ] Tools and Tags are both inside `st-card--metadata` — nothing below body copy
- [ ] Next/Previous renders on article, node, case study pages
- [ ] Next/Previous absent on static pages
- [ ] Edge cases handled: first item (no prev), last item (no next)
- [ ] URLs use canonical route map — no hardcoded paths
- [ ] All new CSS uses `st-*` namespace and `--st-*` tokens
- [ ] Zero hardcoded hex values in new CSS
- [ ] Responsive verified: 320px, 768px, 1024px+
- [ ] Storybook stories exist for `MetadataCard` (6 variants) and `ContentNav` (4 variants)
- [ ] All validators pass: `validate:urls`, `validate:filters`, `validate:taxonomy`
- [ ] Commits follow conventional commit format, one per story

---

## Rollback Plan

If any phase causes regressions in archive filtering or routing:

```bash
git stash        # stash current work
git checkout main
pnpm dev         # verify main is clean
git stash pop    # restore work to debug
```

Stories 1 and 2 are completely independent — they cannot affect filters or routing. Stories 3 and 4 add new components but do not modify existing query structure. The highest regression risk is in Story 4 GROQ query extensions — if adjacent-item queries time out or error, they must fail gracefully (null prev/next) and not break the page render.

---

## Out of Scope (Do Not Touch)

- Archive pagination — already functional, do not change
- Filter bar or FilterModel — already functional, do not change  
- Knowledge Graph visual/interactive view — separate epic
- Dark mode for new components — after Pink Moon theme epic
- Cross-type navigation (node → article) — explicitly excluded, same-type only
- `page` type metadata card — static pages are excluded by design
