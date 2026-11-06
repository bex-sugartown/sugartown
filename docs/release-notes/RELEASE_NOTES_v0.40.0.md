# Release Notes — v0.40.0

**Date:** 2026-11-06
**Scope:** Sugartown monorepo (apps/web, packages/design-system, Sanity production data, process and tooling)

---

## What this release is

Image galleries now behave the same way in every layout: click an image, browse the whole set in a lightbox. The full resume is on the CV / Resume page, and a new check flags a release with steps left undone.

---

## What changed

### The carousel has visible controls and behaves predictably (#201)

The carousel arrows were invisible against some images, and clicking the peeking next slide opened that slide's linked post in a new tab instead of moving to it. The arrows now sit in a dark ring, the peeking slide advances the carousel, and the caption bar passes the contrast minimum. Clicking the active image opens the lightbox.

### The lightbox browses every slide (#205)

Opening an image used to show that one image. The lightbox now has next and previous buttons and an "n / 10" counter, and the carousel moves to the slide you stopped on when you close it. A slide that links to a post shows a "Read: post title" link below its caption.

### Grid and masonry galleries match the carousel (#208)

In grid and masonry layouts, a linked image skipped the lightbox and opened its link in a new tab. Every image now opens the lightbox, and the link appears there as a "Read" button. Checked in Storybook with a linked image; not yet checked on a live page with a linked grid gallery.

### The lightbox link is lime on light pages too (#207)

The "Read" button was pink on a light-themed page, because the button followed the page theme while the lightbox stays dark. The lightbox now carries the dark theme, and the token build writes the dark-theme values under the dark selector, so any future always-dark surface gets a complete reset from one source. The Button's short-lived `onDark` tone was removed.

### The resume, and a release completeness check (#193, #191, #192, #190)

The CV / Resume page carries the full six-page resume with a new hero and no phone number. Separately, `pnpm check:release` now lists missing release steps (notes file, tag, GitHub Release, milestone, published Sanity note), `/ship` says "incomplete" until they are done, and the ship prompt's four known defects are fixed. The export update ran after v0.39.0 (#190) and swapped in the released notes. Dark-mode article filter counts also pass the contrast minimum (#203).

---

## Not in this release

- Grid and masonry lightbox behaviour is verified in Storybook only (#208).
- The vspec template and rules epic is open (#202).
- AI image stamping automation is open (#204).
- This release's tag, GitHub Release, milestone and published Sanity note finish in the next `/ship`.

---

## Validator state at release

- CI run 42272206798 on `fbcbf476`: success.
- `pnpm test:smoke`: 28 passed (local, 2026-11-06).
- Chromatic build 108: 10 visual changes, approved at ship.
- Pre-commit validators: tokens, style mirror, strict colours, dead references, CSS names and lint passed on each commit.

---

## Issues in this release

Issue and epic numbers cited in the CHANGELOG entry for this version, as written there. `#n` and `ST-n` are GitHub issue n; `SUG-n` is a legacy ID from the retired tracker.

| ID | Title | State |
|---|---|---|
| #190 | Run the export update after v0.39.0 ships, to exercise the release note swap | Closed |
| #191 | Release completeness check: flag a release with steps left undone | Closed |
| #192 | Fix four defects in the ship prompt found on the v0.38.0 and v0.39.0 runs | Closed |
| #193 (ST-193) | Adapt the full resume to the sugartown.io CV / Resume page | Closed |
| #201 (ST-201) | Image carousel: invisible controls, peek slides open linked post, caption contrast | Closed |
| #203 | /articles dark mode: filter option counts fail color-contrast (axe smoke red) | Closed |
| #205 (ST-205) | Carousel lightbox: browse every slide with next/prev, keep carousel in sync | Closed |
| #207 | Always-dark surfaces use a dark-theme wrapper, not a per-component tone | Closed |
| #208 | Grid and masonry galleries: lightbox browses every image, linked images show the Read link | Closed |

---

## Related issues

| ID | Title | State | Relation |
|---|---|---|---|
| #166 | Axe and link-check coverage for case study, node and glossary pages (light theme) | Closed | related to #190 |
