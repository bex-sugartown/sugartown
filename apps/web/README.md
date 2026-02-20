# apps/web

React 19 + Vite 7 SPA frontend for Sugartown.

## Overview

This workspace is the public-facing frontend. It fetches content from Sanity via GROQ queries and renders it as a client-side SPA using React Router v7.

## Dev

```bash
pnpm dev        # from repo root — starts at http://localhost:5173
```

Or from this directory:

```bash
pnpm dev
```

## Key Commands

```bash
pnpm lint               # ESLint
pnpm build              # Production build
pnpm validate:urls      # Validate canonical URLs and nav items
pnpm validate:filters   # Validate archive filter models
```

## Key Files

| File | Role |
|---|---|
| `src/App.jsx` | React Router `<Routes>` tree |
| `src/main.jsx` | Entry point — BrowserRouter wraps App |
| `src/lib/routes.js` | Canonical URL registry (`getCanonicalPath`) |
| `src/lib/queries.js` | All GROQ query definitions |
| `src/lib/sanity.js` | Sanity client instance |
| `src/lib/useSanityDoc.js` | Data-fetching hooks |
| `src/lib/filterModel.js` | Archive filter model builder |
| `src/pages/` | Page-level components |
| `scripts/validate-urls.js` | URL validation script |
| `scripts/validate-filters.js` | Filter model validation script |

## Documentation

- **URL namespace:** `docs/routing/url-namespace.md`
- **GROQ queries:** `docs/queries/groq-reference.md`
- **Schema reference:** `docs/schemas/schema-reference.md`
- **Data flow:** `docs/architecture/sanity-data-flow.md`
- **CI pipeline:** `docs/operations/ci.md`
