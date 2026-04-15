# SUG-64 — Content & IA Audit: Homepage, Services, Product Pages — Portfolio Polish Pass

**Linear Issue:** SUG-64
**Created:** 2026-04-13
**Priority:** P3 Medium

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — this epic uses existing page infrastructure (section builder, hero treatments, CTA buttons, MetadataCard). No new interactive elements. Content authored in Sanity Studio using existing schemas.
- [x] **Use case coverage** — three pages in scope: homepage (`/`), services (`/services`), platform (`/platform`). Each has different content needs documented below.
- [x] **Layout contract** — homepage uses full-width sections (`context="full"`). Services uses full-width or detail layout (TBD during content brief). Platform: ship or defer decision required.
- [x] **All prop value enumerations** — N/A (no new enums)
- [x] **Correct audit file paths** — verified
- [x] **Dark / theme modifier treatment** — pages use existing theme system. No new theme work.
- [x] **Studio schema changes scoped** — no schema changes. Uses existing `page` type with section builder. SUG-62 (schema hygiene) should ship first to clean up page schema.
- [x] **Web adapter sync scoped** — N/A
- [x] **Composition overlap audit** — N/A
- [x] **Atomic Reuse Gate** — N/A (no new components; uses existing section types)

---

## Context

Sugartown is transitioning from build-phase dev project to live portfolio site for job and consulting searches. The IA brief (locked 2026-02-26, `docs/briefs/ia-brief.md`) defined the page structure and priority order:

> Services -> Contact -> About rewrite -> Platform -> Homepage teasers

The site has strong infrastructure (design system, section builder, hero treatments, archive pages, detail pages) but several key landing pages are empty, placeholder, or lack intentional content design. A hiring manager landing on the homepage today sees a site that's clearly under construction.

**The thesis from the IA brief:**
> Land -> See polished Work -> Notice Release Notes -> Realize this portfolio ships versions -> Click Architecture -> Understand you treat content like code -> Hire you.

This narrative arc requires the entry points (homepage, services) to be polished and intentional.

---

## Objective

Audit the current state of homepage, services, and platform pages. Produce content briefs with section-by-section structure, key messages, CTA strategy, and image/asset requirements. Author and publish content so that a hiring manager or prospective client sees a finished, intentional portfolio site. No schema changes, no new components. Pure content design and authoring using existing infrastructure.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | Yes | Homepage, services, and platform are all `page` type documents |
| `article` | No | Content exists, not part of polish pass |
| `caseStudy` | No | Content exists, not part of polish pass (may need image refresh, separate concern) |
| `node` | No | Content exists, not part of polish pass |
| `archivePage` | No | Archive pages render automatically from content |

---

## Scope

### Phase 0: Content inventory + gap analysis

- [ ] Audit current homepage content (sections, copy, CTAs, images, hero treatment)
- [ ] Audit current services page (exists? placeholder? content?)
- [ ] Audit current platform page (exists? linked in nav? content?)
- [ ] Document what exists vs what the IA brief specifies for each page
- [ ] Cross-reference with nav configuration (what's linked, what's missing)

### Phase 1: Content briefs

- [ ] **Homepage content brief** — section structure, key messages, CTA routing, image requirements
  - Value proposition (5-second clarity test)
  - Curated teasers into Work, Library, Services
  - Credibility signals (tools used, approach, output quality)
  - Primary CTA: route to Services or Contact
  - Hero treatment selection (from shipped SUG-59 options)

- [ ] **Services content brief** — offerings, positioning, structure
  - What I do / how I work / who I work with
  - Service categories (AI strategy, content architecture, platform engineering, etc.)
  - Proof points (link to relevant case studies/nodes per service)
  - CTA: contact form or consultation booking
  - Single page vs multi-section decision

- [ ] **Platform content brief** — ship or defer decision
  - If shipping: what "platform" means in Sugartown context (the site itself as a product)
  - If deferring: remove from nav, ensure no dead links

### Phase 2: Content authoring

- [ ] Author homepage content in Sanity Studio (sections, copy, images)
- [ ] Author services page content in Sanity Studio
- [ ] Platform page: implement decision from Phase 1
- [ ] Image sourcing and upload (hero images, any supporting visuals)
- [ ] CTA configuration (link targets, button text, styling)

### Phase 3: Cross-page narrative QA

- [ ] Walk the visitor journey: Homepage -> Services -> Work -> Contact
- [ ] Walk the visitor journey: Homepage -> Library -> Node detail -> Related
- [ ] Verify nav links match page content
- [ ] Verify CTAs route to correct destinations
- [ ] Visual QA at desktop and mobile breakpoints
- [ ] Brand voice check against `docs/brand/brand-voice-guide.md`

---

## Query Layer Checklist

No query changes. Pages use existing `pageBySlugQuery` which projects all section types.

- [x] `pageBySlugQuery` — already projects all fields needed
- [ ] Archive queries — N/A
- [ ] Slug queries for other types — N/A

---

## Schema Enum Audit

N/A. No enum fields touched. Page `template` field (default/full-width) already exists and is used by RootPage branching.

---

## Non-Goals

- No schema changes (SUG-62 handles page schema cleanup)
- No new section types or components (use existing section builder)
- No design system changes
- No case study content refresh (separate concern)
- No About page rewrite (IA brief priority order, but can be added as follow-up)
- No Contact page changes (shipped in EPIC-0179)

---

## Technical Constraints

**Content authoring**
- All content authored in Sanity Studio using existing `page` document type
- Section builder provides: heroSection, textSection, ctaSection, cardBuilderSection, imageSection, calloutSection, tableSection
- Hero treatments available: default, extreme-duotone, greyscale-panel (SUG-59)
- CTA buttons use `ctaButton` schema object with link resolution

**Image assets**
- Follow naming convention: `site-{subject}-{descriptor}.{ext}` (per `docs/conventions/image-naming-convention.md`)
- Upload as `.webp` for photos, `.png` for diagrams
- Hero images: recommend 1200x600 minimum for full-width heroes

**Brand voice**
- All copy must pass anti-slop checks (per CLAUDE.md and `docs/brand/brand-voice-guide.md`)
- No em dashes in non-node content
- No decorative emoji
- No AI vocabulary ("leverage", "utilize", "delve into")
- Bex's voice: direct, specific, occasionally dry

**Dependency on SUG-62**
- SUG-62 (schema hygiene) should ship first to clean up the page schema. This removes taxonomy clutter and adds `aiDisclosure` to pages, so the Studio editing experience is clean during content authoring.

---

## Migration Script Constraints

N/A. Content is authored manually in Studio, not migrated.

---

## Files to Modify

No code files modified. This is a content authoring epic.

**Sanity content (Studio)**
- Homepage document (slug: `home` or `/`)
- Services page document (slug: `services`) — may need to CREATE in Studio
- Platform page document (slug: `platform`) — ship or defer decision

**Documentation**
- `docs/backlog/SUG-64-content-ia-polish.md` — content briefs added during Phase 1
- Nav configuration in Sanity — verify links match authored pages

---

## Deliverables

1. **Content inventory table** — what exists vs what's needed per page
2. **Content brief: homepage** — section structure, messages, CTAs, image requirements
3. **Content brief: services** — offerings, structure, proof points
4. **Platform decision** — ship with content or defer and remove from nav
5. **Authored pages** — homepage and services live in production with intentional content
6. **Narrative QA** — verified visitor journey from homepage to conversion

---

## Acceptance Criteria

- [ ] Homepage has a clear value proposition visible within 5 seconds of landing
- [ ] Homepage routes to Work, Library, and Services within 2 clicks
- [ ] Services page exists with defined offerings and at least one CTA to Contact
- [ ] Platform page either has content or is removed from nav (no dead links)
- [ ] All copy passes brand voice / anti-slop checks
- [ ] All images follow naming convention and are uploaded as WebP
- [ ] Nav links match published pages (no broken links, no placeholder destinations)
- [ ] Visual QA passes at desktop (1440px) and mobile (375px) breakpoints
- [ ] Cross-page visitor journey makes sense: a hiring manager can understand what Bex does, see proof, and find contact info without confusion

---

## Risks / Edge Cases

- [ ] **Content bottleneck** — this epic requires Bex to write or approve copy. Claude can draft but cannot make positioning decisions. Phase 1 briefs should be reviewed before Phase 2 authoring begins.
- [ ] **Image sourcing** — hero images and supporting visuals need to be sourced or created. If none exist, text-only heroes (no image) are a valid fallback.
- [ ] **Services scope creep** — "what do I offer" is a business strategy question, not a content question. The brief should capture current offerings, not aspirational ones.
- [ ] **Platform ambiguity** — if the decision is to defer, ensure the nav item is removed cleanly (Sanity nav config, not code).
- [ ] **SEO impact** — new pages need SeoHead configuration (title, description, og:image). Use existing `resolveSeo()` utility.

---

## Success Metrics

A hiring manager or prospective client landing on the homepage can:

1. **Understand what Bex does** within 5 seconds (value prop in hero)
2. **See proof of quality** within 2 clicks (case studies, nodes)
3. **Find services and contact** without hunting (clear nav, CTAs)
4. **Perceive a finished product** (no placeholder pages, no "coming soon", no broken links)

---

## Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| SUG-62 schema hygiene | Shipped | Clean page schema before content authoring |
| SUG-59 hero treatments | Shipped | Hero options available for page heroes |
| EPIC-0179 contact form | Shipped | Contact page exists for CTA targets |
| SUG-52 margin column | Shipped | Not required for pages (margin column is detail-page only) |
| SUG-63 CWV audit | Backlog | Performance baseline should be run after content is published |

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-64-content-ia-polish.md` to `docs/shipped/SUG-64-content-ia-polish.md`
2. Confirm clean tree
3. Run `/release` (minor version bump, new content surface)
4. Transition SUG-64 to Done in Linear

---

## Phase 0 — Audit (completed 2026-04-15)

| Page | Slug | Doc ID | Status | Sections |
|------|------|--------|--------|----------|
| Homepage | `home` | `wp.page.957` | 🟡 WP leftover | textSection ("Atoms & Ecosystems") + calloutSection + cardBuilderSection (4 cards). NO hero. Title is legacy. |
| Services | `services` | `40df3ddc...` | 🔴 Placeholder | hero ("Services") + textSection (no heading) + ctaSection ("Get in Touch") |
| Platform | `platform` | `146e3afb...` | 🔴 Placeholder | hero ("Platform") + textSection (no heading) + ctaSection ("CTA Heading" — literal placeholder) |
| About | `about` | `b44f2b69...` | 🟡 Minimal (out of scope) | 2 sections |
| AI Ethics | `ai-ethics` | `wp.page.1644` | ✅ Complete | 9 sections (SUG-61) |
| Contact | `contact` | `wp.page.218` | ✅ Complete | EPIC-0179 |

**Nav fixes done in Phase 0:** Library > Blog label updated to "Articles" (post→article rename in Stage 6 left a stale label). Reference target was already correct.

---

## Phase 1 — Content Briefs

### Brief: Homepage

**Goal:** Within 5 seconds a hiring manager understands what Bex does and why this site itself is the credential.

**Suggested template:** `default` (currently `full-width` — change to `default` so MetadataCard could appear if useful, OR keep `full-width` for marketing-style layout. Decision needed.)

**Becky Note:** Template and metadata is now determined by page-type. "Page" has limited metadata and marginalia.

**Section structure (proposed):**

| # | Section type | Purpose | Status |
|---|---|---|---|
| 1 | `heroSection` | Value prop + primary CTA. Hero image optional (text-only is valid). | ⚠️ Not currently present — needs adding |
| 2 | `textSection` | "Why Sugartown" — 1-2 paragraphs framing the site as platform = portfolio + product. | Needs copy |
| 3 | `cardBuilderSection` (3 cards) | Curated teasers: Featured Case Study, Featured Node, Services entry point | Cards exist (4) — needs editorial review |
| 4 | `calloutSection` | Optional: pull a notable quote or methodology callout | Currently exists — review |
| 5 | `ctaSection` | Primary CTA to /services or /contact | Missing |

**Bex needs to decide:**
- [ ] **Value proposition** — one sentence answering "what do you do?" Suggestion based on services draft: _"Senior product leadership for digital teams navigating CMS migrations, design systems, and AI workflow strategy."_ Approve / rewrite.
- [ ] **Hero treatment** — image with greyscale-panel overlay (SUG-59)
- [ ] **Primary CTA** — Book a call (`/contact`) or See services (`/services`)?
- [ ] **3 teaser picks** — which case study, which node, which service category goes in the card grid?
- [ ] **Page title** — keep "Atoms & Ecosystems" (current — not obviously homepage) or rename to "Sugartown Digital" / "Home"?

**Image requirements:**
- Optional hero image: 1600×900 minimum, `.webp`, naming convention `site-home-hero.webp`
- Card thumbnails: auto-derived from referenced docs (per SUG-50 when shipped) or supplied per-card

**Copy guardrails:** anti-slop checks per `docs/brand/brand-voice-guide.md` — no em dashes, no AI vocabulary, no decorative emoji, direct/specific voice.

---

### Brief: Services (consulting framing)

**Source:** `docs/drafts/services.html` (local-only). The draft is well-developed and ships-ready content; this brief documents the structure for Sanity authoring.

**Goal:** Position Sugartown as senior fractional/consulting product leadership. Show offerings, engagement models, fit signal, clear booking CTA. The site itself is the proof.

**Suggested template:** `default` (single column, MetadataCard optional)

**Section structure (mapped from draft):**

| # | Section type | Mock element | Content |
|---|---|---|---|
| 1 | `heroSection` | Hero | Provide 3 different options: keep concise. Eyebrow: "Services". H1: _"I know what I'm doing. I have room in my calendar."_ Subhead: _"Senior product leadership for digital teams navigating CMS migrations, design system governance, and AI workflow strategy. Fractional or contract. Remote-first."|
| 1.5 | `textSection` | Side card | Provide 5-10 bullets of top achievements/strenghts. Final count=5. 5-bullet credential list (FX Networks, beauty retailer, design systems, multi-agent AI, stack listing). |
| 2 | `cardBuilderSection` (6 card list) | Services grid | The 6 offerings from draft: Fractional PM, CMS Architecture, Design System Governance, AI Workflow Strategy, RFP Support, Change Management. Each card: number badge, title, ~2 sentence body, 3–4 tags. |
| 3 | `textSection` | "How I engage" | 4 engagement models: Fractional, Sprint, Advisory, Contract. Each with type label + heading + ~2 sentence description. |
| 4 | `cardBuilderSection` (2 card grid) | "Is this a fit?" | Two cards: "Good fit" (6 bullets, seafoam accent) and "Probably not" (4 bullets, neutral). Card variant should be different from the 6-services grid above. |
| 5 | `ctaSection` | Final CTA | Heading: _"If this sounds like your problem, my calendar is here."_ Body: _"The site itself is the portfolio. You can see how I think, what I've built, and how I document it."_ Primary CTA: "Book a call" → `/contact`. Secondary: "See the work" → `/case-studies`. |

**Bex needs to decide:**
- [ ] **Approve all 6 service offerings as listed?** Trim, reorder, rename, expand?
- [ ] **Card variant choice for fit cards** — Card primitive supports `variant`, `accentColor`. Confirm seafoam accent for "Good fit", neutral for "Probably not".
- [ ] **Hero treatment** — image (greyscale-panel)

**Image requirements:**
- Optional hero image: `site-services-hero.webp`. TBD

**Copy guardrails:** Draft already passes anti-slop checks. Em dashes present in draft (e.g. "—") — these need replacement before authoring per CLAUDE.md.

---

### Brief: Platform — ship or defer

**Goal:** Decide whether `/platform` is a content surface for v1, or whether it's deferred to Phase 2 of the IA brief.

**Current state:** Hero ("Platform") + textSection (no heading) + ctaSection ("CTA Heading" placeholder). Linked from main nav. Live but empty.


position the site itself as "the platform"
- Hero: _"This site is a platform."_ or similar self-referential framing
- 3 sections explaining: the design system, the schema/CMS architecture, the AI collaboration framework
- Each section links to the corresponding artifact (Storybook, schema ERD page, AI Ethics page)
- Acts as a meta-tour of how the portfolio is built
- Light editorial lift; reuses existing surfaces


---

## Phase 1 status

Briefs are skeleton-complete and ready for Bex's editorial decisions. Phase 2 (Sanity authoring) cannot proceed until briefs are reviewed and the open decisions above are answered.

**Next session checkpoint:**
1. Bex reviews the 3 briefs above
2. Bex answers the open decisions (marked `[ ]`)
3. Phase 2 authoring begins: services first (most ready), then homepage, then platform per A/B decision

**Updated Content Briefs**
- /Users/beckyalice/SUGARTOWN_DEV/sugartown/docs/briefs/content/homepage-content-brief.md 
- /Users/beckyalice/SUGARTOWN_DEV/sugartown/docs/briefs/content/platform-content-brief.md 
- /Users/beckyalice/SUGARTOWN_DEV/sugartown/docs/briefs/content/services-content-brief.md

**Estimated Phase 2 effort once briefs are approved:**
- Services: 1–2 hours (content largely drafted)
- Homepage: 2–3 hours (needs hero copy, teaser picks, image sourcing)
- Platform: 1–2 hours if A, 15 min if B
