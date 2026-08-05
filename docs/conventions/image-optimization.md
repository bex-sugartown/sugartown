# Image Optimization — Sugartown Web

Reference doc for image delivery strategy, current gaps, and the work needed to address
the mobile Lighthouse performance score (currently 70).

---

## Current performance baseline (2026-05-10)

| Context | Source | Performance | LCP |
|---------|--------|-------------|-----|
| Mobile (CI headless Lighthouse) | Lab | 70 | 6.5 s |
| Desktop (browser Lighthouse, incognito) | Lab | ~96 | 1.4 s |
| Mobile field data (CrUX p75) | Field | — | 3.2 s |
| Desktop field data (CrUX p75) | Field | — | 1.9 s |

### Why mobile lab LCP is 6.5 s (structural, not image-related)

The site is a fully client-rendered SPA. Every detail page follows this sequence before
any content paints:

1. Browser downloads and parses the JS bundle (~500 KB+ gzip)
2. React mounts and `useSanityDoc` fires a Sanity CDN API call
3. API responds, React rerenders with content
4. LCP element (hero heading or hero image) paints

Steps 1–3 are serial and unavoidable without SSR or ISR. Lighthouse measures LCP at step 4,
which is 5–6 seconds after navigation start on simulated mobile throttling.

Image optimization cannot fix this. It shaves ~200–400 ms off LCP at best. The structural
ceiling for this SPA on mobile is roughly 3–4 s LCP lab score until the rendering model changes.

**The 3.2 s CrUX field LCP is the real-world number.** Users on real connections with a warm
cache or CDN edge hit land in the "needs improvement" band (2.5–4.0 s). The lab score of
6.5 s reflects Lighthouse's simulated 4G throttling with a cold cache — it is not representative
of actual user experience.

---

## Image delivery infrastructure

### What exists

`SanityImage` (`apps/web/src/components/atoms/SanityImage.jsx`) is the canonical responsive
image component. It:

- Generates a `srcset` at 400 / 800 / 1200 w
- Applies `.auto('format')` via `urlFor()` (serves WebP/AVIF to supporting browsers)
- Accepts `sizes`, `loading`, `decoding`, and `fetchPriority` props
- Defaults to `loading="lazy"` and `decoding="async"`

`SanityMedia` wraps `SanityImage` for the section builder image type.

### What is NOT wired up

| Surface | Current pattern | Gap |
|---------|-----------------|-----|
| `Hero.jsx` hero image | `urlFor().width(1920)` → CSS `background-image` | Background images cannot use `fetchpriority`. No srcset. No preload. |
| `CardBuilderSection.jsx` card images | `urlFor().width(600)` → raw `<img src>` | No srcset, no sizes, no SanityImage |
| `PageSections.jsx` inline images | `urlFor().width(900)` → raw `<img src>` | No srcset, no sizes, no SanityImage |
| `PageSections.jsx` section backgrounds | `urlFor().width(1920)` → CSS `background-image` | Same as Hero — CSS background, no hints |
| DS `Card.jsx` hero media slot | `<img loading="lazy">` | No srcset, no sizes |
| DS `Media.jsx` | `<img loading="lazy">` | No srcset, no sizes |
| `Logo.jsx` | `urlFor().width(width * 2)` | Single size, no srcset — acceptable for logos |

The `fetchPriority` prop on `SanityImage` exists but **no callsite passes it**. The LCP
image always loads at default priority.

---

## What to fix (priority order)

### 1. Hero LCP image — convert from CSS background to `<img fetchpriority="high">`

**Impact:** medium-high. Background images block `fetchpriority` and are not
considered for LCP preload hinting.

Current `Hero.jsx` pattern:
```js
backgroundStyles.backgroundImage = `url(${urlFor(img.asset).width(1920).quality(90).url()})`
```

Target pattern: render the hero image as a foreground `<img>` (absolutely positioned to fill
the hero container) with:
- `fetchpriority="high"` (browser starts fetching before it renders the page)
- `loading="eager"` (overrides default lazy)
- `srcset` via `SanityImage`
- `sizes="100vw"` (hero is full-width)

Alternatively, add a `<link rel="preload" as="image" fetchpriority="high">` in `SeoHead` when
the page has a hero image. This is harder to thread through the data layer but works without
changing the Hero layout.

### 2. CardBuilderSection and PageSections inline images — migrate to `SanityImage`

**Impact:** low-medium. Reduces bandwidth on smaller viewports.

Replace:
```js
urlFor(card.image.asset).width(600).quality(85).url()
```

With:
```jsx
<SanityImage
  asset={card.image.asset}
  sizes="(max-width: 768px) 100vw, 600px"
  width={600}
/>
```

### 3. DS Card and Media components — add srcset

**Impact:** low (these are proxied through the web adapter; the fix belongs in the DS layer).

`Card.jsx` renders a raw `<img>` in the hero slot. It doesn't have access to Sanity's
image transform API — the `src` is passed in as a pre-baked URL. Fix: accept `srcSet` and
`sizes` as props alongside `src`, and thread them through the adapter.

---

## What `.auto('format')` buys today

`urlFor()` in `apps/web/src/lib/sanity.js` already applies `.auto('format')`:

```js
export function urlFor(source) {
  return imageBuilder.image(source).auto('format')
}
```

This means every `urlFor()` call — including the raw ones in CardBuilderSection and Hero —
already serves WebP (or AVIF in supporting browsers). The format optimization is global. The
remaining gap is **responsive sizing** (srcset/sizes) and **LCP priority hints** (fetchpriority).

---

## Quick wins vs structural work

| Fix | Effort | Expected LCP gain | Blocks on |
|-----|--------|-------------------|-----------|
| `fetchpriority="high"` on hero image | Low (1 component) | 200–500 ms | Hero refactor to foreground `<img>` |
| `<link rel="preload">` for hero | Medium (data threading) | 200–400 ms | SeoHead + hero media prop |
| srcset on CardBuilderSection | Low | Bandwidth only, not LCP | — |
| srcset in DS Card | Medium (DS + adapter) | Bandwidth only | DS epic |
| SSR / ISR | High (architecture change) | 3–5 s LCP | Full rendering model change |

The field LCP of 3.2 s on mobile is already in "needs improvement" — not "poor". The structural
SPA ceiling means a significant lab score improvement (70 → 85+) requires SSR. Image-only
fixes can close perhaps 5–8 Lighthouse points.

---

## Tracking

Image-specific fixes (hero fetchpriority, CardBuilderSection srcset) can ship as a single
low-risk epic. SSR is a separate architectural decision.

Open epics that touch this surface: none currently in backlog. File via `/new-epic` when
mobile lab score becomes a stakeholder concern.
