# Lightroom Publish Adapter (Sugartown Asset Pipeline) — Product Requirements Document

**PRD Version:** v1.0
**Status:** Draft
**Author:** Bex Head
**Domain:** Mixed (Platform / Asset Ingestion / CMS)
**Last updated:** 2026-06-21
**Related epics:** TBD
**Reference prior art:** WP/LR Sync (Meow Apps) — the WordPress equivalent being replaced

---

## 1. Problem Statement

The current image workflow depends on WP/LR Sync: a Lightroom Classic Publish Service that pushes photos and metadata straight into WordPress and keeps them in sync on edit. Sugartown has left WordPress. There is no equivalent path from Lightroom Classic into Sanity, so publishing images means manual export, manual upload to Sanity, and manual metadata re-entry. Lightroom collection structure is lost in that gap.

This adapter restores direct-from-Lightroom publishing against Sanity, preserves collection structure as queryable documents, and keeps the pipeline CMS-agnostic so Contentful or another headless CMS can be targeted later without rewriting the Lightroom plugin.

---

## 2. Goals and Non-Goals

### Goals

| Goal | Description |
|------|-------------|
| Direct publish from Lightroom Classic | A photographer selects images in a Lightroom Publish Service and publishes them to Sanity without leaving Lightroom |
| Metadata sync | Lightroom metadata (title, caption, keywords, capture date, copyright) maps to Sanity document fields on publish |
| Collection structure preserved | Lightroom collections map to Sanity gallery documents; collection membership is queryable |
| Web-derivative export contract | The plugin publishes web-optimized derivatives, not full-resolution masters; masters remain in Lightroom |
| Re-publish on edit | Editing an image or its metadata in Lightroom and re-publishing updates the existing Sanity asset and document, not a duplicate |
| CMS-agnostic adapter boundary | The Lightroom plugin speaks to an adapter interface; Sanity is one implementation behind it |
| Free-tier viable | The pipeline stays within Sanity free-tier asset and API quotas for a library of a couple thousand web-derivative images |

### Non-Goals

| Non-Goal | Why excluded |
|----------|--------------|
| Full-resolution master storage in Sanity | Masters stay in Lightroom. Sanity holds web derivatives only. Sanity is not a backup. This keeps the library inside the free-tier asset ceiling. |
| Contentful implementation | Deferred. The adapter interface is designed for it, but only the Sanity implementation ships in v1. Contentful's three-call asset flow and 10 req/s CMA limit make it a poor free-tier first target. |
| Two-way sync (Sanity edits flow back to Lightroom) | Lightroom is the source of truth for images and their metadata. Sanity edits do not propagate back. One-directional by design. |
| Bulk migration of the existing WordPress media library | Separate concern. This adapter handles new publishing from Lightroom forward. Existing WP assets are a migration epic, not this. |
| Perceptual-hash file matching (WP/LR Sync's pHash) | Not needed. Lightroom's own published-photo tracking provides the LR-to-Sanity identity link. No fuzzy matching required. |
| Video assets | Images only in v1. Video has different quota handling and is out of scope. |

---

## 3. User Stories

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | Publish a gallery | As a photographer, I want to select up to 300 images in a Lightroom collection and publish them to Sanity so that a gallery exists on the site without manual upload | All selected images upload as Sanity assets; one gallery document is created referencing them; metadata is populated | P0 |
| US-002 | Web-derivative export | As a photographer, I want the plugin to export at a defined max dimension and quality so that masters stay in Lightroom and Sanity storage stays within free tier | Published assets are at or below the configured max long-edge dimension; original files are not uploaded | P0 |
| US-003 | Metadata mapping | As a photographer, I want Lightroom title, caption, keywords, capture date, and copyright to map to Sanity fields so that I do not re-enter metadata | Each mapped field is present on the Sanity document after publish, matching the Lightroom value | P0 |
| US-004 | Re-publish on edit | As a photographer, I want re-publishing an edited image to update its existing Sanity asset rather than create a duplicate so that the gallery stays clean | Re-publishing updates the existing document; Sanity asset count does not increase; no duplicate gallery entry | P0 |
| US-005 | Collection-to-gallery mapping | As a photographer, I want a Lightroom collection to map to a Sanity gallery document so that collection structure is preserved and queryable | Collection name and membership are reflected in the gallery document; querying the gallery returns its member images | P1 |
| US-006 | Remove on unpublish | As a photographer, I want removing an image from the Lightroom published collection to remove it from the Sanity gallery so that the gallery reflects intent | Removing from the LR collection removes the reference from the gallery document on next publish; asset deletion is configurable | P1 |
| US-007 | Publish progress and failure visibility | As a photographer, I want to see which images published and which failed so that I can retry failures | Plugin reports per-image success/failure; failed uploads can be retried without re-uploading successes | P1 |
| US-008 | Adapter swap readiness | As Bex, I want the Lightroom plugin to call an adapter interface rather than Sanity directly so that a future Contentful adapter requires no Lightroom plugin changes | The Sanity-specific code is isolated behind a defined adapter contract; the plugin imports the contract, not the implementation | P2 |

---

## 4. Technical Architecture

### Two-half system

This is not a single program. It is two halves connected by an adapter contract.

**Half 1: The Lightroom plugin (Lua).** Lightroom Classic plugins are written in Lua against Adobe's Lightroom Classic SDK. The Publish Service API is the relevant SDK surface. This half handles image selection, derivative export, metadata extraction, and calling the adapter endpoint. There is no way around the Lua SDK for "publish from inside Lightroom" — it is the same work regardless of destination CMS.

**Half 2: The adapter service (TypeScript/Node).** A small service that receives the plugin's publish requests and translates them into Sanity asset uploads and document mutations. This is where CMS-specific logic lives. Swapping to Contentful means replacing this half, not the Lightroom plugin.

### Data flow

```
Lightroom Classic
  → Publish Service (Lua plugin)
  → exports web derivative + extracts metadata
  → HTTP request to adapter service
  → adapter: upload asset to Sanity → create/update document → link to gallery
  → returns per-image result to plugin
  → plugin records LR-to-Sanity ID mapping
```

### The adapter contract

The Lightroom plugin calls a defined interface, not Sanity directly. The contract (the surface a future Contentful adapter must also satisfy):

| Operation | Input | Output |
|-----------|-------|--------|
| `publishAsset` | image binary, metadata object, gallery id | `{ assetId, documentId, status }` |
| `updateAsset` | existing documentId, image binary, metadata object | `{ documentId, status }` |
| `removeFromGallery` | documentId, gallery id | `{ status }` |
| `ensureGallery` | collection name, collection LR id | `{ galleryId }` |

The Sanity implementation of this contract uses the asset upload endpoint plus document mutations. The Lightroom plugin never imports Sanity-specific code.

### Sanity implementation specifics

- **Asset upload:** Sanity's two-step model — upload the binary to the asset endpoint, receive an asset reference, then reference it from a document. No three-step dance (that is Contentful's model).
- **Identity link:** the plugin stores the Sanity `documentId` against the Lightroom published-photo record. Re-publish uses this id to update rather than create. This replaces WP/LR Sync's pHash matching entirely.
- **Write API ceiling:** mutations hit the direct API (`api.sanity.io`), not the CDN. A 300-image gallery is roughly 600 write operations (asset + document per image), well within free-tier limits and an infrequent event.
- **No Sanity client in the Lightroom plugin:** all Sanity SDK usage is in the adapter service. The plugin makes plain HTTP requests to the adapter.

### Authentication

The adapter service holds the Sanity write token (server-side only). The Lightroom plugin authenticates to the adapter service, not to Sanity. The Sanity token never lives in the Lightroom plugin or on the photographer's machine. This is a deliberate security boundary.

### Hosting the adapter service

The adapter service runs somewhere with the Sanity write token. Options in Open Decisions. It is stateless except for nothing — all state lives in Sanity and in the Lightroom catalog.

---

## 5. Content Model (Sanity)

### New or modified document types

| Field name | Sanity type | Required? | Validation | Notes |
|------------|-------------|-----------|-----------|-------|
| `photoAsset` | document type | — | — | One per published image |
| `photoAsset.title` | `string` | No | — | From Lightroom title |
| `photoAsset.caption` | `text` | No | — | From Lightroom caption |
| `photoAsset.image` | `image` | Yes | — | The uploaded web-derivative asset reference |
| `photoAsset.keywords` | `array` of `reference` to `tag` | No | — | Maps LR keywords to existing Sanity `tag` documents; reference-over-string per taxonomy principle |
| `photoAsset.captureDate` | `datetime` | No | — | From Lightroom EXIF capture date |
| `photoAsset.copyright` | `string` | No | — | From Lightroom copyright metadata |
| `photoAsset.lrId` | `string` | Yes | unique | The Lightroom published-photo identity link; drives update-vs-create |
| `gallery` | document type | — | — | One per Lightroom collection |
| `gallery.title` | `string` | Yes | — | From Lightroom collection name |
| `gallery.lrCollectionId` | `string` | Yes | unique | Lightroom collection identity link |
| `gallery.images` | `array` of `reference` to `photoAsset` | No | — | Ordered membership; preserves collection order |

### Keyword mapping note

Lightroom keywords map to existing Sanity `tag` reference documents, consistent with the taxonomy-as-first-class-documents principle. The adapter must resolve a keyword to an existing `tag` or flag it for manual review. It must not silently create new tags (gatekeeping rule from the node style guide). Auto-creation vs flag-for-review is an Open Decision.

`featuredImage` is deprecated and does not appear in this model. Gallery thumbnails derive from `gallery.images[0]` or a future explicit cover field, not `featuredImage`.

---

## 6. Design Constraints

This is an ingestion pipeline, not a UI surface. Pink Moon component constraints do not apply. These do:

- **Derivative export contract:** the plugin exports at a configured max long-edge dimension (default proposal: 2560px) and JPEG quality (default proposal: 80). Both configurable in the Publish Service settings. Masters are never uploaded.
- **CMS-agnostic boundary:** the Lightroom plugin imports the adapter contract, never Sanity SDK code. Sanity specifics are isolated in the adapter service.
- **Reference-over-string:** keywords resolve to `tag` references, not free strings.
- **One-directional sync:** Lightroom is the source of truth. No Sanity-to-Lightroom write path exists.
- **Token isolation:** the Sanity write token lives only in the adapter service, never client-side.

---

## 7. Open Decisions

| Decision | Options | Owner | Target resolution |
|----------|---------|-------|------------------|
| Where the adapter service is hosted | Netlify Function / serverless, a small always-on Node service, or local-only on Bex's machine | Bex | Before implementation epic |
| Derivative max dimension and quality defaults | 2560px/q80, 2048px/q80, or other | Bex | Before implementation epic |
| Unresolved-keyword behaviour | Auto-create `tag` document, or flag for manual review and skip | Bex | Before implementation epic |
| Asset deletion on unpublish | Remove gallery reference only (keep orphan asset), or delete the Sanity asset too | Bex | Before implementation epic |
| Whether the adapter service is a monorepo package | `packages/lr-adapter` in the Sugartown monorepo, or a separate repo | Bex | Implementation epic |
| Lightroom plugin distribution | Personal install only, or packaged for others later | Bex | Defer to post-v1 |

---

## 8. Dependencies and Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Lightroom Classic SDK (Lua) is unfamiliar territory | High: this is the bulk of the work and a new language surface | Scope the plugin against Adobe's official Publish Service sample plugin first; prove a single-image publish end to end before building batch/metadata features |
| Full-resolution exports blow the free-tier asset ceiling | High: 2,000 full-res images can exceed ~20 GB; free tier hard-caps and blocks uploads | The derivative export contract (US-002) is the mitigation and is P0. Masters never upload. |
| New tag auto-creation pollutes the taxonomy | Med: silent tag sprawl violates the gatekeeping rule | Default to flag-for-review until the keyword vocabulary is mapped; revisit once stable |
| Sanity free-tier write API limit during a 300-image batch | Low: ~600 writes is within limits but worth confirming | Sequential publish with retry-on-error; verify current free-tier write quota in the project dashboard before first large batch |
| Adapter contract leaks Sanity specifics into the plugin | Med: defeats the CMS-agnostic goal, makes Contentful a rewrite | Code review gate: the Lightroom plugin must contain zero Sanity-specific field names or endpoints; all of it lives behind the contract |
| Sanity free-tier quota numbers vary by source and have changed recently | Low: planning on stale numbers | Confirm live asset/bandwidth/write quotas in the Sanity project management page, not from third-party articles |

---

## 9. Success Criteria

| Area | Metric |
|------|--------|
| Direct publish | A single image publishes from inside Lightroom Classic to Sanity with zero manual steps outside Lightroom |
| Batch publish | A 300-image collection publishes in one operation; per-image success/failure is reported |
| Derivative contract | Published assets are at or below the configured max dimension; zero full-resolution originals in Sanity |
| Metadata fidelity | Title, caption, keywords, capture date, copyright match the Lightroom source on spot-check of 10 images |
| Re-publish integrity | Editing and re-publishing an image updates its document; Sanity asset count is unchanged; no duplicate created |
| Collection mapping | A Lightroom collection produces one queryable gallery document with correct ordered membership |
| Free-tier headroom | A full library of a couple thousand derivatives stays within the Sanity free-tier asset ceiling, confirmed in the dashboard |
| Adapter boundary | The Lightroom plugin source contains no Sanity SDK imports or Sanity field names |

---

## 10. Out of Scope (Deferred)

- **Contentful adapter implementation:** designed for, not built. Separate epic once Sanity is proven.
- **WordPress media library migration:** existing assets are a migration concern, not this forward-publishing tool.
- **Video assets:** different quota handling; image-only in v1.
- **Two-way sync:** Lightroom stays the source of truth; no Sanity-to-LR path.
- **Public distribution of the Lightroom plugin:** personal use first; packaging for others is a later decision.
- **Perceptual-hash matching:** replaced by Lightroom's own published-photo identity tracking.

---

## 11. Authoring Checklist

- [x] Every claim references a real system, not an aspiration
- [x] Field types are explicit — no TBD in the content model table
- [x] Non-goals name the reason for exclusion
- [x] Open decisions have owners
- [x] Success criteria are independently verifiable
- [x] `featuredImage` does not appear as an active field (named only as deprecated)
- [x] Brand voice check: no em dashes, no adjective triads, no future-tense promises on shipped surfaces
- [x] A senior engineer could start writing epics from this doc without a meeting
