# docs/diagrams/

Committed sources for every technical or architecture diagram published anywhere (Sanity, articles, case studies, social). Governed by the **technical diagram red-pen gate** in CLAUDE.md §Visual Verification Rules:

1. The source (SVG or Mermaid) is committed here **before** the diagram is uploaded or published. `docs/drafts/` does not count — it is local-only and gitignored.
2. Every diagram ships with a red-pen claim table (`redpen-*.md` in this directory, or in the owning epic doc): one row per box/arrow/label, each with named evidence and a class — enforced-by-code / measured / convention / roadmap.
3. Roadmap items are drawn dashed or labelled, never as current state.
4. **Keep the bottom-left corner of every diagram clear.** Reserve the bottom-left 26% of the width by 13% of the height (229 x 67 units on an 880 x 512 canvas). The site draws an "AI-generated" label there on flagged images, and the mark baked into the file sits in the same spot. Put legends, notes and footers on the right, right-aligned (`text-anchor="end"`), or anywhere outside the zone. (ST-181: the label plus its inset measures 25.0% x 12.3% of the artwork at 620 px wide.) Check: no text, line or box starts inside the zone.

Naming follows the image asset convention (`docs/conventions/image-naming-convention.md`): `diagram-{subject}-{descriptor}.svg`.

A published diagram with no source in this directory cannot be fact-checked by a later session except by forensic reconstruction — which is exactly how this directory came to exist.
