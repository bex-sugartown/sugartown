# AI image provenance: stamping and attaching copies

**To label an AI-generated image so the label survives download, a Claude session stamps it and attaches the copies.** Bex asks in plain words ("stamp the image on <page>"); no terminal step is hers.

Why: the Sanity image CDN strips embedded metadata from every image URL, so the site serves flagged images from stamped file assets instead (ST-178 Phase 1 audit, `docs/backlog/ST-178-ai-image-provenance-metadata-and-watermark.md`).

## Steps for a session

| # | Step | How |
|---|---|---|
| 1 | Find the flagged image and its tool | Query `aiGenerated == true` on the image object (inline `richImage` in `content[]`, or hero `backgroundImage` in `sections[]`). Take `aiTool`. |
| 2 | Get the source pixels | The file Bex supplies, or the full-size Sanity image URL (pixels only; metadata is not needed from the source). |
| 2b | Suggest the tool | `python3 scripts/ai-provenance/stamp.py --detect SOURCE` reads the file's own metadata and suggests `aiTool` (prefill only: confirm with Bex before use; Claude and Claude Code leave no marker). If it reports `c2pa: true`, tell Bex that stamping drops the file's Content Credentials. |
| 3 | Stamp | `python3 scripts/ai-provenance/stamp.py SOURCE --tool <aiTool> [--tool-version <v>] --outdir <scratchpad dir> --name <slug>` writes `<slug>-480.jpg`, `-960.jpg` and `-1920.jpg` (never upscaled). For a social share image add `--share`: one `<slug>-share-1200.jpg` (1200 x 630 centre crop, Sanity hotspot not applied), attached as the only `provenanceFiles` entry on `seo.openGraph.image` or `defaultOgImage`. Needs Pillow. |
| 4 | Check each copy | `python3 scripts/ai-provenance/stamp.py --verify <file>` must report `digitalSourceType: true`. Open one copy and look at the mark. |
| 5 | Upload each copy as a **file** asset | Sanity MCP `dataset_assets_upload_from_file` with `assetType: file`, then POST the bytes. An image asset would strip the metadata. |
| 6 | Propose, then attach | Content Write Gate: show a before/after table for `provenanceFiles` (`width` plus `file` reference per copy) and wait for approval. Patch the image object. Do not publish. |
| 7 | Prove it | `curl` the file URL from the asset, then `--verify` the downloaded file. Report the result. |

## Rules

- The mark's look is `scripts/ai-provenance/label-spec.json`; `pnpm validate:ai-provenance` fails if `MediaLabel.module.css` or the AI wording in `apps/web/src/lib/provenance.js` disagrees.
- Re-stamp when `aiTool` changes or the source image is replaced. Old copies are replaced, not added.
- Never stamp an image that is not flagged `aiGenerated`.
- Invisible watermarking and C2PA signing are a recorded no-go (ST-178); revisit only through a new issue.
