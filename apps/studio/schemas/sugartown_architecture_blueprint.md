# Sugartown Sanity CMS — Architecture Overview

**Purpose:** A thin, evergreen reference for how Sanity fits into the system, how data flows, and how the frontend consumes content.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CONTENT LAYER                          │
│  Sanity Studio (authoring)                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Content Management Interface                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Sanity Content API                                   │   │
│  │ - GROQ queries                                       │   │
│  │ - CDN-cached responses                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
                     HTTP / JSON API
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│  Frontend Application                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ @sanity/client                                       │   │
│  │ - Fetches content via GROQ                           │   │
│  │ - Resolves image references via CDN URLs             │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ UI Components                                        │   │
│  │ - Render structured content                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow (High-Level)

1. **Authoring:** Editors create and publish content in Sanity Studio.
2. **Storage:** Content is stored in Sanity’s hosted dataset and exposed via the Content API.
3. **Consumption:** The frontend fetches content using GROQ queries via `@sanity/client`.
4. **Rendering:** UI components render structured content and resolve asset URLs through the Sanity CDN.

---

## Where Sanity Fits

- **Source of Truth:** All structured content lives in Sanity.
- **Schema-Driven:** Schemas define content structure, validation, and relationships.
- **API-First:** The frontend reads content from Sanity’s APIs; no CMS rendering occurs in production.

---

## Frontend Consumption

- Uses `@sanity/client` for GROQ queries.
- Uses Sanity’s CDN for optimized image delivery.
- Renders content based on schema-defined shapes (documents + objects).

---

## Related Docs

- **Integration & setup:** `schemas/INTEGRATION_GUIDE.md`
- **Schema reference:** `schemas/README.md`
- **Query cookbook:** `schemas/QUICK_REFERENCE.md`
