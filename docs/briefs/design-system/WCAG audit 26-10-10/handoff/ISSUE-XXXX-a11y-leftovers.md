# ISSUE-XXXX — Pink Moon accessibility: leftovers

Updated 10 Oct 2026 for the approved v4 direction (Pass 1 and Pass 2 rewritten to match). Items here need a decision or a code read before they can join an epic.

## 1. Open decisions (Bex)

- [ ] **Bold threshold.** Treat only 700+ as bold for WCAG large text (matches axe and Stark), or accept tooling flags on 600.
- [ ] **Hero eyebrow.** Size and colour are governed by the hero image; it was not found reading `--st-color-text-eyebrow`. Locate the component, then decide.
- [ ] **Card titles in pink.** Would need `--st-card-title-size` ≥ 24px (or 18.66px at 700). At 18px / 600 they stay ink.
- [ ] **Knowledge-graph filter chips.** Pass 1 makes the article and case filter chips neutral, so they no longer echo the graph's node colours. Confirm, or add a pink/ink dot to tie each chip to its node type.

## 2. Follow-up code work

- [ ] **Retire chip colour presets.** After Pass 1 the `.pink`, `.seafoam`, `.lime`, `.violet`, `.amber`, `.grey` classes and the `color` / `colorHex` props no longer change a chip's appearance. Find every caller, then remove them from Chip and its stories.
- [ ] **Legacy status badges (`--st-status-*`).** Card `.statusBadge` / `.folioStatus` still use per-status tints, and several fail: draft light 2.72, designing light 3.76, testing light 4.14, validated dark 4.12. To match v4, move them to the rule-dot chassis (neutral chip, pink dot), or retire the tokens if no caller remains.
- [ ] **Dark label strip.** `--st-card-label-bg` on dark is midnight-800, the same as the surrounding surface, so the strip only shows through its rule. Propose a distinct value.
- [ ] **Sidebar duplication (bug).** On knowledge-graph node pages the right sidebar repeats and overlaps "Related" and "AI Disclosure" entries.

## 3. Decided 10 Oct (v4), now in the epics

- Pink is the one hot colour; chips neutral; status dots pink with a draft ring.
- Rich text in pink and maroon only; SUG-211 Option E superseded.
- Dark eyebrow and folio label white.
- Primary button and accent table header white on pink-600; hover pink-700.
- Small pink text on light uses `--st-color-text-brand`.
