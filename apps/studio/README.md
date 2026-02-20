# apps/studio

Sanity Studio v5 for the Sugartown monorepo.

## Overview

This workspace is the authoring environment for all Sugartown structured content. It connects to the `production` dataset on Sanity project `poalmzla`.

## Dev

```bash
pnpm dev        # from repo root — starts Studio at http://localhost:3333
```

Or from this directory:

```bash
pnpm dev
```

## Schema

All schema types are registered in `schemas/index.ts`. See canonical documentation:

- **Schema reference:** `docs/schemas/schema-reference.md`
- **GROQ queries:** `docs/queries/groq-reference.md`
- **Data flow:** `docs/architecture/sanity-data-flow.md`

## Key Files

| File | Role |
|---|---|
| `sanity.config.ts` | Studio configuration and desk structure |
| `schemas/index.ts` | Schema registry — all active types registered here |
| `schemas/documents/` | Document type definitions |
| `schemas/objects/` | Reusable object definitions |
| `schemas/sections/` | Page builder section definitions |

## Sanity Project Coordinates

| Field | Value |
|---|---|
| Project ID | `poalmzla` |
| Dataset | `production` |
| Studio URL (local) | `http://localhost:3333` |
