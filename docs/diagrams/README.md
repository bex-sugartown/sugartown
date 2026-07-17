# docs/diagrams/

Committed sources for every technical or architecture diagram published anywhere (Sanity, articles, case studies, social). Governed by the **technical diagram red-pen gate** in CLAUDE.md §Visual Verification Rules:

1. The source (SVG or Mermaid) is committed here **before** the diagram is uploaded or published. `docs/drafts/` does not count — it is local-only and gitignored.
2. Every diagram ships with a red-pen claim table (`redpen-*.md` in this directory, or in the owning epic doc): one row per box/arrow/label, each with named evidence and a class — enforced-by-code / measured / convention / roadmap.
3. Roadmap items are drawn dashed or labelled, never as current state.

Naming follows the image asset convention (`docs/conventions/image-naming-convention.md`): `diagram-{subject}-{descriptor}.svg`.

A published diagram with no source in this directory cannot be fact-checked by a later session except by forensic reconstruction — which is exactly how this directory came to exist.
