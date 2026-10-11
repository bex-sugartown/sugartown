# Release Notes — v0.37.0

**Date:** 2026-10-11
**Scope:** Sugartown monorepo (apps/web, apps/studio, packages/design-system, apps/storybook, process/tooling)

---

## What this release is

Pink Moon now passes WCAG 2.2 AA contrast and semantics checks across tokens, chips, badges and rich text, as two audit passes. Release notes become their own content type with a public `/releases` archive. A `/code` landing page, a rebuilt cookie consent banner and canonical-URL fixes round out the site.

---

## What changed

### Pink Moon accessibility, passes 1 and 2

Pink is now the one hot colour. Small pink text on light backgrounds is maroon, the primary button and accent table header use pink-600 with white labels, and chips and the featured tag are neutral with a pink hover. Status dots are pink, with a ring for draft.

Rich text follows. Inline code is maroon in light theme and pink in dark. Glossary terms are ink on a pale pink fill with a dotted underline, and body links carry a thin pink underline. Each glossary term is a single tab stop that opens its popover, and citation markers and notes are announced as citations with a back-link.

Cards and badges pass too: card status badges are the neutral chip with a pink dot, the dark card label row is a shade darker than the page, release-type badges and the imageless hero eyebrow meet contrast, and only weight 700 and above counts as bold for large text. Storybook controls now work on Table, Chip, SegmentedControl and Citation.

### Release notes as a content type

Studio has a `releaseNote` document type. The site has a `/releases` archive and `/releases/<slug>` pages with Author and Type filters, and Library lists them. Seventeen notes covering v0.20.0 to v0.36.0 were drafted as backdated articles and moved into the new type; v0.36.0's old URL redirects. Release note dates render on the right day.

### Cookie consent and the /code page

The consent banner is white with a strong edge in light theme and a brighter edge in dark, and no longer covers the footer's version and toolchain rows. Callout banner text sits centred on its row. A `/code` landing page is live, every CMS button sends a consent-guarded `cta_click` GA4 event, and `/github` redirects to `/code`.

### Canonical URLs and content fixes

Prerendered article, node and case-study pages are written as `<slug>.html`, so canonical no-slash URLs answer 200 instead of a 301. Content Terms rows show only glossary terms linked in the text; 11 live articles gain a Terms row, and the content-level `relatedTerms` field is gone. `llms.txt` role, location, surname, profile link and review date are corrected.

### Studio, tokens and tooling

Studio has `lint` and `typecheck` scripts, with 7 schema type errors fixed and the schema unchanged. apps/web lints its 33 TypeScript files. `textSection` tone and align fields are replaced by Subtle and Subtle Centered per-block styles. `validate:tokens` fails any raw `var(--st-*, value)` fallback, and all 144 were removed from app and design-system CSS. ScoreRing follows a reduced-motion change mid-session.

Cloud runs launch with `/cloud-launch` and finish with `/handback`, with a read-only reviewer on every cloud branch. Seven dead allowlist entries and 17 links to a retired governance doc were removed.

---

## Not in this release

- Chromatic review, VoiceOver checks and a live 301 check for the `/releases` redirect are owed at ship.
- GA4 Explore report check for `cta_click` is owed.
- Surfaces with no changes: none.

---

## Validator state at release

- `pnpm validate:tokens`: all references resolve, no raw fallbacks.
- `pnpm validate:filters`: all filter models produced.
- `pnpm validate:style-mirror`: mirrors byte-identical.
- `pnpm validate:liveness-probes`: 0 gates inert.
- `pnpm validate:urls`: exit 0 with 24 warnings (missing slugs and nav items, known).
