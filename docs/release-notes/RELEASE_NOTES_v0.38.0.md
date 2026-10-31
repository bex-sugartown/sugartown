# Release Notes — v0.38.0

**Date:** 2026-10-31
**Scope:** Sugartown monorepo (apps/web, apps/studio, packages/design-system, apps/storybook, Sanity content, process/tooling)

---

## What this release is

Images flagged as AI-generated are now labelled everywhere they appear on the site, and once a session stamps them, in the image file itself. The label is one reusable design-system component built on Chip. Two test gates (colour contrast and links) and a diagram drift check now guard what ships.

---

## What changed

### AI images are labelled on the page

A flagged image shows an "AI-generated" label in its lower-left corner on article and case-study images, the detail-page hero, card thumbnails, gallery images and the click-through lightbox. Hover or focus shows the tool that made it. Small images show "AI", and very small ones show nothing. Studio records the flag, the tool (ChatGPT, Claude, Claude Code, Gemini, Adobe Firefly, Photoshop Generative Fill, Canva AI, Microsoft Copilot or Stable Diffusion) and, optionally, the tool's version.

### And in the file, once stamped

The Sanity image CDN strips embedded metadata from every image URL, which was measured rather than assumed. So a flagged image is served from stamped copies instead: the label is baked into the pixels and IPTC metadata (digital source type, tool, version) is written into the file. Share images (og:image) get the same treatment. Studio warns when an AI image has no stamped copies yet. C2PA signing and invisible watermarking were evaluated and are not done: both need a signing product that has passed C2PA conformance, a trusted certificate and a lookup service.

### One label component

The label began as its own component, `AiLabel`, which repeated most of the design system's Chip. It is now `MediaLabel`, a placement wrapper around Chip's new `tone="inverse"` and `size="fluid"` variants, and the AI wording comes from the web app. For design-system consumers, Media takes `label` and Card takes `thumbnailLabel` (breaking). Nothing on screen changed: sizes were re-measured at every width, and Chromatic showed only the renamed stories.

### Diagrams and the lightbox

SVG diagrams opened in the lightbox rendered at about 258 x 150, because an SVG with only a viewBox has no natural size. The lightbox now sizes images from their stored dimensions, so diagrams fill the view. Diagrams now reserve their bottom-left corner for the label and put legends on the right, and the three case-study diagrams were redrawn to match. A new check, `pnpm validate:diagram-assets`, confirms that each published diagram still matches its committed source; it found the old live diagram had drifted.

### Accessibility and tests

A new CI check fails when any colour token pair drops below WCAG 2.2 AA (198 pairs across five themes; 25 known failures allowlisted). The smoke suite runs axe on five routes and crawls every internal link from its seed pages, and a weekly job checks outbound links. The preheader banner, neutral chip borders and responsive tables on phones now pass.

### Content

"Bait and Switch, or Just a Bug" was published and later republished after a second edit, with ATS and Funnel added to the glossary. The AI Ethics page now says what EU AI Act Article 50 actually asks of a publisher, and what this site's labels do and don't do.

---

## Not in this release

- No image is stamped yet: the tooling is live, and the first stamped image is owed after this release.
- C2PA signing, invisible watermarking, and keeping a generator's own Content Credentials (stamping re-encodes and drops them).
- An "AI-edited" label state, blocking publish of an unstamped AI image, and hotspot-aware cropping for share images.
- 25 colour pairs below AA remain allowlisted against #169, #170 and #171.

---

## Validator state at release

- CI run 41228938174 on `d28bfe1f`: success.
- `pnpm test:smoke`: 13 passed (local, 2026-10-31).
- `pnpm validate:tokens` and `validate:style-mirror`: clean.
- `pnpm validate:ai-provenance`: 21 tests passed.
- `pnpm validate:diagram-assets`: 3 published diagrams match their sources.
- Chromatic build 107: 4 changes (renamed stories), approved.
