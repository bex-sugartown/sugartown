---
**Epic:** SUG-72 — Shopify MVP — /platform + /services content sections (follow-on)
**Linear Issue:** [SUG-72](https://linear.app/sugartown/issue/SUG-72/shopify-mvp-platform-services-content-sections-follow-on)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go. Scope re-evaluated at activation (see below).
---

# SUG-72 — Shopify platform services + content sections

Follow-on to SUG-71 (Shopify Stage 2). Platform services and content sections for the
Shopify integration: collections, filtering, search, and a content-section pattern for
editorial content embedded in a Shopify storefront.

## Background

Updated 2026-06-18 to reflect the platform evolution re-scope
(`docs/briefs/platform-evolution-prd.md`). **Blocked by SUG-71** (Shopify Stage 2
re-scope) — must complete before platform services and content sections can layer in.
**SUG-181** (Stage 3 — `apps/shop` rename and Storefront API) must also be evaluated
before this epic's scope is finalised; some content-section work may belong in Stage 3
instead of here.

## Objective

At activation: read `docs/briefs/platform-evolution-prd.md` Area 3 and SUG-71's shipped
doc to determine which items belong here vs. in SUG-181 (Stage 3 composition epic). Do
not execute without that review — the original scope below predates both blockers and
is preserved for reference, not as a ready-to-run plan.

## Scope (original, pre-blocker — re-evaluate at activation)

- [ ] Collections — layer: Shopify theme / storefront
- [ ] Filtering — layer: Shopify theme / storefront
- [ ] Search — layer: Shopify theme / storefront
- [ ] Content-section pattern for editorial content embedded in a Shopify storefront —
      layer: schema/theme seam

## Non-Goals

- Executing before SUG-71 and the SUG-181 scope review are both settled
- Deciding the `apps/contentful-poc` → `apps/shop` rename — that is SUG-181's scope

## Related

- **Linear:** [SUG-72](https://linear.app/sugartown/issue/SUG-72)
- **Blocked by:** SUG-71 (Shopify Stage 2), pending SUG-181 scope review
- **PRD:** `docs/briefs/platform-evolution-prd.md` Area 3
