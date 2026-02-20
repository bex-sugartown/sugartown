# Sanity Data Flow

## Purpose

Documents how content flows from Sanity Studio through the Content API to the frontend. Reference for understanding the CMS integration architecture.

## Context

Sugartown uses Sanity as a headless CMS. All structured content is authored in `apps/studio`, stored in the Sanity-hosted `production` dataset (`poalmzla`), and consumed by `apps/web` via GROQ queries through `@sanity/client`.

## Details

### System Diagram

```
┌──────────────────────────────────────────────────────┐
│                   CONTENT LAYER                      │
│  apps/studio — Sanity Studio (authoring)             │
│  ┌──────────────────────────────────────────────┐    │
│  │  Content Management Interface                │    │
│  └──────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌──────────────────────────────────────────────┐    │
│  │  Sanity Content API                          │    │
│  │  - GROQ queries                              │    │
│  │  - CDN-cached responses                      │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
                        ↓ HTTP / JSON
┌──────────────────────────────────────────────────────┐
│                PRESENTATION LAYER                    │
│  apps/web — React + Vite SPA                         │
│  ┌──────────────────────────────────────────────┐    │
│  │  @sanity/client → GROQ queries               │    │
│  │  useSanityDoc() / useSanityList() hooks      │    │
│  └──────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌──────────────────────────────────────────────┐    │
│  │  Page components render structured content   │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Data Flow Steps

1. **Authoring** — editors create and publish content in Sanity Studio (`apps/studio`)
2. **Storage** — content is stored in the `production` dataset on Sanity's hosted infrastructure
3. **Querying** — `apps/web` fetches content via GROQ queries using `@sanity/client`
4. **Hooks** — `useSanityDoc()` and `useSanityList()` in `apps/web/src/lib/useSanityDoc.js` wrap client calls
5. **Rendering** — page components receive data as props and render it; image assets resolve via Sanity CDN

### Sanity Project Coordinates

| Field | Value |
|---|---|
| Project ID | `poalmzla` |
| Dataset | `production` |
| API version | configured via `VITE_SANITY_API_VERSION` env var |
| Studio URL | `http://localhost:3333` (local) |

### Key Source Files

| File | Role |
|---|---|
| `apps/web/src/lib/sanity.js` | Sanity client instance, reads from Vite env vars |
| `apps/web/src/lib/queries.js` | All GROQ query definitions |
| `apps/web/src/lib/useSanityDoc.js` | `useSanityDoc()` and `useSanityList()` hooks |
| `apps/studio/sanity.config.ts` | Studio configuration, desk structure |
| `apps/studio/schemas/index.ts` | Schema registry |

### Architectural Constraints

- `apps/web` accesses Sanity **only** through `apps/web/src/lib/sanity.js` and `queries.js`
- `packages/design-system` is CMS-agnostic — no Sanity imports permitted
- `apps/web` does **not** import from `apps/studio` — schemas are not shared at runtime

## Related Files

- `apps/web/src/lib/sanity.js` — client instance
- `apps/web/src/lib/queries.js` — GROQ query library
- `apps/web/src/lib/useSanityDoc.js` — data-fetching hooks
- `apps/studio/schemas/index.ts` — schema registry
- `docs/queries/groq-reference.md` — query cookbook
- `docs/schemas/schema-reference.md` — schema inventory

## Change History

| Date | Change |
|---|---|
| 2026-01-24 | Initial Sanity integration established |
| 2026-02-19 | v0.8.0 — hooks, full query library, taxonomy fragments added |
| 2026-02-20 | Consolidated from `apps/studio/schemas/sugartown_architecture_blueprint.md` |
