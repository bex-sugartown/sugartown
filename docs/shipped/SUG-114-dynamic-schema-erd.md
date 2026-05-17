---
**Epic:** SUG-114 — Dynamic schema ERD
**Linear Issue:** [SUG-114](https://linear.app/sugartown/issue/SUG-114/dynamic-schema-erd-generate-content-model-from-deployed-sanity-schema)
**Status:** Shipped
**Shipped:** 2026-05-17
**Version:** v0.23.36
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-114 — Dynamic schema ERD

`schemaManifest.js` is now auto-generated at build time. The content model diagram at `/platform/cms` stays accurate without manual intervention.

## What shipped

**Phase 1 — Build pipeline wiring**

- [x] `generate-schema-manifest.mjs` was already wired into `apps/web/package.json` build script — confirmed and documented
- [x] `apps/web/src/data/schemaManifest.js` added to `.gitignore` and untracked from git (`git rm --cached`)
- [x] Generator header comment updated to clarify it runs automatically at build time
- [x] Count assertion added: generator exits non-zero if `entities.length < 42` (baseline at ship)
- [x] `docs/conventions/schema-conventions.md` updated with pipeline documentation

**Phase 2 — Generator accuracy pass**

- [x] Accuracy audit against Studio schema for representative types
- [x] Found: `answerBlock.ts` filename is stale — file defines `citedBlock` (repurposed). `citedBlock` IS in the manifest. No generator fix needed.
- [x] Found: `portableTextConfig` not in manifest — expected exclusion (config, not a type). Documented.
- [x] Count assertion set to 42 (current entity baseline)

## Acceptance criteria

- [x] `pnpm build` in `apps/web` regenerates `schemaManifest.js` without a manual command
- [x] `schemaManifest.js` is gitignored (not committed)
- [x] A new Sanity schema type added to `apps/studio/schemas/documents/` appears in the ERD after the next build with no other intervention
- [x] Generator count assertion catches regressions (fails loudly if entity count drops below 42)
- [ ] Netlify build log shows generator running — will confirm on next Netlify deploy
- [x] `docs/conventions/schema-conventions.md` updated

## Known state at ship

- 42 entities, 73 relationships at time of ship
- `answerBlock.ts` filename stale (defines `citedBlock`) — low priority cleanup
- Netlify build log verification: next deploy will confirm the generator runs in CI

## Chromatic

<!-- Chromatic: pending — tooling/data change, no visual component modified -->
