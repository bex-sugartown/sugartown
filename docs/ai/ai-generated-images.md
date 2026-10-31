# When an image counts as AI-generated

**Flag an image `aiGenerated` when an AI tool authored its content, not when a tool only captured or exported it.** Decided by Bex on 2026-10-31 (issue #180).

## The cases

| Case | Flag it? | Why |
|---|---|---|
| An image an image model made (ChatGPT, Gemini, Adobe Firefly, Canva AI, Stable Diffusion) | Yes | The tool authored the pixels. |
| A diagram or SVG an AI tool wrote (for example Claude Code) | Yes | The tool authored the content, even though it is vector art. |
| A screenshot of an AI-authored diagram or page | Yes | The content shown is AI-authored. |
| A screenshot of human-authored content that an AI tool happened to capture | No | A person authored the content. The caption can say how it was captured. |
| A human-authored diagram that an AI tool exported or tidied without changing what it says | No | A person authored the content. |
| A human image that an AI tool retouched, upscaled or extended | Ask Bex | There is no "AI-edited" state yet (declined in ST-181). Record the decision here when one is made. |

## How to record it

1. Set **AI-Generated** on the image in Studio, and pick the **AI Tool**.
2. Ask a Claude session to stamp the image so the label also travels with the file. Steps: `docs/workflows/ai-image-provenance.md`. It can suggest the tool from the source file's own metadata (`stamp.py --detect`), and you confirm it.
3. A flagged image shows an "AI-generated" label on the page and in the lightbox. Keep diagram legends out of the label's corner: `docs/diagrams/README.md` rule 4.

## Where this fits

Public principle: Principle 13 in `docs/briefs/ai-ethics-and-operations.md` (also on the `/ai-ethics` page). Studio field: `apps/studio/schemas/objects/aiImageFields.ts`.
