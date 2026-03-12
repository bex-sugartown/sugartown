# Sugartown.io — Information Architecture Brief

| Field | Value |
|---|---|
| **Document** | IA Brief v1.0 |
| **Status** | 🟢 Approved — Decisions Locked 2026-02-26 |
| **Owner** | Becky Head (Product / Platform) |
| **Scope** | Top-level site structure, page-type mapping, phasing |
| **Inputs** | Manifesto ("I Am a Maximalist"), Monorepo PRD, Sanity MVP PRD, CHANGELOG through v0.11.0 |
| **Constrains** | Epic 1 (Routing & 301s), Epic 3 (Archive Normalization), all content creation work |
| **Last Reviewed** | 2026-02-26 |

---

## 1. What This Document Does

This Brief locks the outer-level information architecture for Sugartown.io. It maps the manifesto's vision to the infrastructure already built, identifies gaps, and phases what ships when.

After approval, this becomes the constraint document for routing decisions, navigation configuration, content creation, and archive setup. No new top-level section gets built without updating this Brief first.

---

## 2. The Thesis (From the Manifesto)

Sugartown is a **knowledge organism wearing a cardigan** — a professional platform that operates on three simultaneous layers:

1. **Public Narrative** — Portfolio, case studies, services (sells your brain)
2. **Product Layer** — Release notes, changelog, architecture (signals systems thinking)
3. **Infrastructure Layer** — AI ethics, governance, documentation (signals legitimacy)

The visitor experience arc: Land → See polished Work → Notice Release Notes → Realize this portfolio ships versions → Click Architecture → Understand you treat content like code → Hire you.

---

## 3. Current State Audit

### What's Built and Working (v0.11.0)

| Capability | Status | Evidence |
|---|---|---|
| **Routing system** | ✅ Canonical | `routes.js` as single source of truth; `pnpm validate:urls` enforces |
| **Content types** | ✅ Deployed | `article`, `node`, `caseStudy`, `page` — all with unified taxonomy surface |
| **Archives** | ✅ Sanity-driven | 3 archive pages live: `/articles`, `/case-studies`, `/knowledge-graph` |
| **Taxonomy** | ✅ Governed | Categories (max 2), tags (controlled vocab), tools (30-item enum), projects, people |
| **SEO** | ✅ End-to-end | Per-page overrides → siteSettings fallback chain |
| **Navigation** | ✅ CMS-driven | `siteSettings` drives Header + Footer; no hardcoded nav |
| **Homepage** | ⚠️ Exists | `HomePage` component renders, but content/sections TBD |
| **Page builder** | ✅ Available | `page` type supports hero + textSection + imageGallery + ctaSection |
| **WP migration** | ✅ Complete | 327 documents imported; parity checked; redirects generated |
| **Redirect infra** | ✅ Wired | `redirect` schema + build-time `_redirects` generation |

### Canonical Route Namespace (Current)

```
/                              → HomePage
/:slug                         → Page (catch-all)
/articles                      → Archive (article)
/articles/:slug                → ArticlePage
/case-studies                  → Archive (caseStudy)
/case-studies/:slug            → CaseStudyPage
/knowledge-graph               → Archive (node)
/knowledge-graph/:slug         → NodePage
/tags/:slug                    → TaxonomyDetailPage
/categories/:slug              → TaxonomyDetailPage
/projects/:slug                → TaxonomyDetailPage
/people/:slug                  → TaxonomyDetailPage
/blog, /post(s)/*              → redirect → /articles
/nodes/*                       → redirect → /knowledge-graph
```

### Content Inventory (Sanity Production)

| Type | Count | Notes |
|---|---|---|
| Articles | ~50+ | Migrated from WP posts |
| Nodes | ~40+ | Migrated from WP gems |
| Case Studies | ~5 | Migrated; sections now render |
| Pages | ~10 | Migrated; section builder available |
| Categories | ~15 | With color coding |
| Tags | ~100+ | Post-taxonomy migration cleanup |
| Projects | ~8 | PROJ-XXX format with slugs |
| People | 1+ | Bex + any collaborators |
| Redirects | ~50+ | WP legacy URL mappings |

---

## 4. Proposed Top-Level IA

The manifesto proposed 8 sections. Here's the reality check — what maps to existing infrastructure, what needs new content, and what's deferred.

### The Structure

| # | Section | Primary Route | Sanity Type | Status |
|---|---|---|---|---|
| 1 | **Work** | `/case-studies` | `caseStudy` + `archivePage` | ✅ Built — needs content polish |
| 2 | **Library** | `/knowledge-graph`, `/articles` | `node`, `article` + `archivePage` | ✅ Built — needs IA framing |
| 3 | **Platform** | `/platform` | `page` (section builder) | 🟡 New — content creation needed |
| 4 | **About** | `/about` | `page` (section builder) | 🟡 Exists as page — needs rewrite |
| 5 | **Services** | `/services` | `page` (section builder) | 🔴 New page required |
| 6 | **Documentation** | `/docs` | `page` (section builder) | 🔴 New — Phase 2 |
| 7 | **Governance** | `/governance` | `page` (section builder) | 🔴 New — Phase 2 |
| 8 | **Contact** | `/contact` | `page` (section builder) | 🔴 New page required |

---

## 5. Section Details & Decisions

### 5.1 Work (Conversion Path)

**Route:** `/case-studies` (existing archive) + individual case study pages

**What exists:** Archive page with filter support. Case study detail pages now render featured images and sections (fixed in v0.10.0). ~5 case studies migrated from WP.

**What's needed:**
- Content polish on existing case studies (add measurable outcomes, structure for scanning)
- Possible homepage "selected highlights" pulling featured case studies
- Consider whether `/work` should be a distinct landing page that links to `/case-studies`, or whether `/case-studies` IS the Work section

**Decision (locked):** Nav label is **"Work"**, URL stays `/case-studies`. No wrapper page. The archive page's hero + description fields provide narrative framing. Update the nav item label in `siteSettings` only — the `archivePage` document title and URL remain unchanged for SEO continuity.

---

### 5.2 Library (The Vintage Veneer)

**Routes:** `/knowledge-graph` (nodes), `/articles` (essays/field notes)

**What exists:** Both archives operational with taxonomy chips, filter infrastructure ready. 90+ combined pieces of content migrated.

**What's needed:**
- Determine whether Library is a **nav grouping** (dropdown containing Knowledge Graph + Articles) or a **landing page** with its own route
- Content classification refinement — which articles are "Essays" vs "Field Notes" (or is that a tag/category distinction rather than a type distinction?)
- Optional future: Reading Lists, Glossary, Talks (all achievable as filtered archive views or pages)

**Decision (locked):** Library is a **nav dropdown** grouping two existing archives — not a landing page. Dropdown contains: Knowledge Graph | Articles. If Reading Lists, Glossary, or Talks are added later, they slot into this dropdown as new items without IA restructuring.

---

### 5.3 Platform (The Differentiator)

**Route:** `/platform` (new page)

**What exists:** The content exists conceptually (release notes, changelog, architecture docs) but lives in git repos, not on the website. No Sanity content for this yet.

**Manifesto vision:** Release Notes, Changelog, Roadmap, Architecture, Design System docs, CMS Blueprint, Knowledge Graph explanation.

**What's needed:**
- A `/platform` page using the section builder, linking to sub-pages
- Decide which sub-content gets its own page vs. section on the parent page
- Release notes could be a new content type or a filtered view of articles tagged "release"

**Decision (locked):** Single `/platform` page at launch with links out to existing artifacts (CHANGELOG, architecture docs, design system docs, release notes in the repo). No sub-pages until content volume justifies them.

**Launch content:**
- Hero: "Sugartown ships versions. Here's how."
- Section: Architecture overview (text + diagram description)
- Section: Current version + link to CHANGELOG
- Section: Design System philosophy summary with link to PRD/Storybook
- Section: Links to relevant nodes/articles tagged with system-building topics
- Outbound links to GitHub/repo artifacts where appropriate

---

### 5.4 About (Human + Thesis)

**Route:** `/about` (existing page)

**What exists:** A `page` document likely migrated from WP. Section builder is available.

**What's needed:**
- Rewrite with the manifesto's framing: Philosophy → Background → Agentic Caucus → Why Sugartown → Services link
- This is the human warmth counterweight to the Platform section's systems rigor

**Decision required:** None — this is a content task, not an architecture task.

**Recommendation:** Rewrite as a section-built page. No new schemas needed. Priority: ship after Work and Platform are framed, since About links to both.

---

### 5.5 Services (Sales Path)

**Route:** `/services` (new page)

**What exists:** Nothing published. This is a net-new content creation task.

**What's needed:**
- A clear, scannable page: Fractional Product Leadership, CMS Architecture, Design System Governance, AI Workflow Strategy, Change Management
- CTA linking to Contact
- No archive needed — this is a single page

**Decision (locked):** Services ships **before** Platform. Single page with a clear list of strengths/services: RFP support, content modelling, design workflow ops, CMS architecture, fractional product leadership, AI workflow strategy, change management. Hero + service list + CTA to Contact. This is the most commercially important page that doesn't exist yet.

---

### 5.6 Documentation (Phase 2)

**Route:** `/docs` (deferred)

**What exists:** Governance docs, SOPs, and process templates exist in repos but not as website content.

**Recommendation:** Defer to Phase 2. The Platform section's single page can tease this. When ready, this could be a new `archivePage` filtering `page` documents tagged with a "Documentation" category, or a dedicated content type if volume warrants.

---

### 5.7 Governance & Legal (Phase 2)

**Route:** `/governance` or individual pages (`/ai-ethics`, `/privacy`, `/accessibility`)

**What exists:** AI Ethics doc exists in project knowledge. Legal pages may exist as WP migrated pages.

**Recommendation:** Defer structured governance section to Phase 2. For launch, ensure `/privacy` and `/terms` exist as simple pages (legal minimum). `/ai-ethics` ships when the About page references it. These are all `page` documents — no new architecture needed.

---

### 5.8 Contact (Launch Requirement)

**Route:** `/contact` (new page)

**What exists:** Nothing published.

**What's needed:** Minimal page. Email, LinkedIn, optional calendar link, positioning line.

**Recommendation:** Create as a simple `page` document. 30 minutes of content work. Ship with Services.

---

## 6. Primary Navigation (Proposed)

Based on the decisions above, here's the locked nav structure:

```
┌─────────────────────────────────────────────────────┐
│  Work    Library ▾    Platform    About    Services  │
│          ├ Knowledge Graph                          │
│          └ Articles                                 │
└─────────────────────────────────────────────────────┘
```

**Footer nav adds:** Contact, Privacy, Terms, Accessibility Statement

**Notes:**
- "Work" links to `/case-studies`
- "Library" is a dropdown grouping `/knowledge-graph` and `/articles`
- "Platform" links to `/platform`
- "About" links to `/about`
- "Services" links to `/services`
- No "Documentation" or "Governance" in primary nav until Phase 2

---

## 7. Route Namespace (Extended)

Additions to the existing canonical namespace:

```
# New routes (Phase 1)
/platform                      → Page (section builder)
/services                      → Page (section builder)
/contact                       → Page (section builder)

# Confirmed unchanged
/case-studies                  → Archive (Work section)
/knowledge-graph               → Archive (Library section)
/articles                      → Archive (Library section)
/about                         → Page (existing, rewrite)

# Phase 2 (deferred, reserved)
/docs                          → TBD (archivePage or page)
/platform/release-notes        → TBD (archivePage or new type)
/platform/architecture         → Page
/platform/design-system        → Page
/platform/roadmap              → Page
/governance                    → TBD
/ai-ethics                     → Page
```

**Reserved namespace additions for `validate-urls.js`:**
- `platform`, `services`, `contact`, `docs`, `governance`, `ai-ethics`

---

## 8. Phase Gates

### Phase 1 — Launch IA (Target: Pre-DNS cutover)

| Deliverable | Type | Effort | Epic Dependency |
|---|---|---|---|
| Navigation updated in siteSettings (Work label, Library dropdown) | Studio config | 30 min | Epic 1 (Routing) |
| Reserved namespaces added to URL validator | Code | 15 min | Epic 1 (Routing) |
| Redirect rules for any WP pages that moved | Config | 30 min | Epic 1 (Routing) |
| `/case-studies` archive hero/description polished | Content | 1 hr | Epic 3 (Archive) |
| `/knowledge-graph` archive hero/description polished | Content | 1 hr | Epic 3 (Archive) |
| `/articles` archive hero/description polished | Content | 1 hr | Epic 3 (Archive) |
| `/services` page created (strength/service list + CTA) | Content | 1-2 hrs | — |
| `/contact` page created | Content | 30 min | — |
| `/about` page rewritten | Content | 2-3 hrs | — |
| `/platform` page created (single page, links to artifacts) | Content + build | 2-3 hrs | — |
| Homepage — leader content per section, Library Catalog Cards | Content + component | 3-4 hrs | Library Catalog Card epic |
| `/privacy` + `/terms` pages confirmed/created | Content | 1 hr | — |

**Phase 1 total estimated effort:** ~15-18 hours of content + config + component work

### Phase 2 — Depth (Post-Launch)

| Deliverable | Trigger |
|---|---|
| `/docs` section with documentation archive | When 5+ documentation pages exist |
| Platform sub-pages (`/platform/*`) | When single page feels cramped |
| `/governance` section | When AI Ethics + Accessibility Statement are written |
| Glossary page | When Library section traffic warrants |
| Release Notes as content type | When manual release note publishing cadence is established |

---

## 9. IA → Epic Mapping

| Epic | IA Brief Dependency |
|---|---|
| **1. Routing & 301s** | Section 7 (Route Namespace) — defines the complete URL map including new pages and reserved namespaces |
| **2. Content State & Taxonomy** | Section 5.2 — Library nav grouping relies on clean taxonomy to distinguish content types |
| **3. Archive Normalization** | Sections 5.1, 5.2 — archive hero/description polish; confirms 3 archives, no new archives in Phase 1 |
| **4. Site Settings & Config** | Section 6 — navigation structure must be configurable in siteSettings |
| **Library Catalog Card** | Section 5.2 — card component serves Knowledge Graph + Articles archives |
| **Content State Governance** | Section 5.3 — Platform section will surface release/version information that depends on clean content states |

---

## 10. Decisions Log (Locked 2026-02-26)

| # | Question | Decision |
|---|---|---|
| 1 | Work section naming | Nav label = **"Work"**, URL stays `/case-studies` |
| 2 | Library dropdown vs flat | **Dropdown**: Library → Knowledge Graph \| Articles |
| 3 | Platform depth at launch | **Single page** with links to existing platform artifacts |
| 4 | Services priority | **Services ships before Platform** — single page, strength/service list |
| 5 | Homepage | **Phase 1 homepage** — leader content per section via promo banners or Library Catalog Card component |

### Homepage (Phase 1 Scope)

The homepage is a **composition of teasers** — not a unique content type. It pulls leader content from each major section:

| Section | Homepage Representation | Source |
|---|---|---|
| Work | Featured case study card(s) or promo banner | `caseStudy` with featured flag or `archivePage` featured items |
| Library | Recent/featured nodes + articles | GROQ query, latest by `publishedAt` |
| Platform | Version badge + "This site ships versions" teaser | Static or `siteSettings` field |
| Services | Single CTA banner → `/services` | Static section or `page` reference |
| About | Short positioning line + link | Static or `siteSettings` |

The **Library Catalog Card** component (from the epic backlog) is the primary card format for homepage content teasers. This makes the homepage both a navigation device and a design system showcase.

**Implementation:** The homepage is either a `page` document with section builder (curated) or a dedicated `HomePage` component with GROQ queries (dynamic). Decision deferred to execution — both approaches work with existing schemas.

---

*All open questions resolved. This Brief is now a locked constraint document.*
