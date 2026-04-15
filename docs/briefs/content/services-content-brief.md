# Services Page Content Brief

**Route:** `/services`
**Sanity type:** `page` document via section builder
**Status:** Draft brief, ready for copy authoring
**Source constraints:** IA Brief §5.5 (Services), §10 Decision #4, Brand Voice Guide, Master Voice Cheat Sheet, `services.html` (layout/copy reference)
**Created:** 2026-04-15

---

## What This Document Is

A section-by-section content brief for the Sugartown Digital services page. The services.html file provides the definitive content, copy, and structural reference. This brief translates that into Sanity section builder terms, adds authoring guidance per the brand voice system, and flags decisions that need to be made at implementation time.

This is the most commercially important page on the site. It ships before Platform (IA Brief Decision #4).

---

## Audience and Intent

Two visitors arrive at this page. The copy serves both without splitting into two voices.

**Hiring manager / recruiter:** Looking for a senior PM for a specific problem (CMS migration, design system mess, replatforming project). Needs to see domain expertise, engagement flexibility, and availability within 30 seconds. Likely arrived from LinkedIn, a job board, or the homepage Services CTA. Wants to know: "Can this person solve my problem, and can I hire them in the way I need to?"

**Agency or product lead:** Has an active engagement, client, or internal project that needs embedded product leadership. Wants specifics: what services, what engagement models, what scope. Probably already looked at Work or About. Wants to know: "Is this the right shape of help for what I'm dealing with?"

---

## Voice Dial

**Services / work-with-me:** Warm authority. Specific credentials, no desperation. The register is: "I know what I'm doing and I have room in my calendar."

The services.html hero nails this tone. The heading ("I know what I'm doing. I have room in my calendar.") is the Brand Voice Guide's own example for this page's register. That copy is the north star for everything else on the page.

**Anti-patterns to avoid on this page specifically:**
- No "passionate about" or "excited to help" (Brand Voice Guide: Credibility Without Chest-Thumping)
- No "extensive experience" or "proven track record" (unmeasurable, recruiter-speak)
- No third-person self-reference ("Bex Head is a senior product manager who...")
- No "we" unless describing a genuine collaborative engagement
- No em dashes (not node territory)
- No decorative emoji
- No hedging ("I think I could maybe help with...")
- No listing every tool or technology ever used (the tags do this work)

---

## Section Layout (Top → Bottom)

The services.html defines six content sections. Each maps to a Sanity section type.

---

### 1. Hero

**Section type:** `heroSection`
**services.html section:** `.hero`

**Content (from services.html, confirmed as target copy):**

- **Eyebrow:** "Services"
- **Heading:** "I know what I'm doing. I have room in my calendar."
- **Subheading:** Senior product leadership for digital teams navigating CMS migrations, design system governance, and AI workflow strategy. Fractional or contract. Remote-first.
- **Credential sidebar:** A compact list of background proof points (not a full CV).

**Credential list (from services.html):**
1. Enterprise CMS replatforming at a major beauty retailer
2. Webby Award-nominated flagship site at FX Networks (Lead PM, 2021)
3. Design system governance across headless/MACH stacks
4. Documented multi-agent AI collaboration framework
5. Sanity, React, Storybook, Turborepo in production

**Implementation note:** The hero in services.html uses a two-column layout (heading + sub on the left, credential card on the right). The current `heroSection` schema may not support a sidebar credential block. Options: (a) author the credential list as part of the subheading body text, (b) use an `htmlSection` for finer layout control, or (c) extend the hero schema with an optional sidebar field (separate epic). Flag this as a layout decision at implementation time.

**CTA buttons:** None in the hero. The credential list replaces the CTA position. CTAs appear at the bottom of the page. This is correct per the page's conversion architecture: the hero earns attention, the services grid builds specificity, the CTA section closes.

**Tone check:** The heading is first-person, declarative, unhurried. It does not sell. It states. The subheading is specific without being exhaustive. "Fractional or contract. Remote-first." are two fragments that communicate availability and terms in six words.

---

### 2. Services Grid (What I Do)

**Section type:** `cardBuilderSection` (grid layout) or `htmlSection` (if card builder doesn't support tags/numbering)
**services.html section:** `.services-section`

**Section header:**
- **Label:** "01"
- **Heading:** "What I do"

**Six service cards, each with: title, description (1–2 sentences), and tag chips.**

#### Card 01 — Fractional Product Leadership
**Description direction:** Embedded part-time PM for complex digital products. Runs discovery, owns roadmap, writes PRDs, ships with engineers. Emphasize: no ramp-up period, immediately productive.
**Tags:** Fractional, Roadmapping, Stakeholder alignment

#### Card 02 — CMS Architecture & Migration
**Description direction:** Headless CMS evaluation, content modeling, migration planning, vendor selection. Proof point: has migrated production systems and written the post-mortems. Name specific platforms (Sanity, Contentful) to signal depth without claiming to know everything.
**Tags:** Sanity, Contentful, MACH, Content modeling

#### Card 03 — Design System Governance
**Description direction:** Token architecture, component inventory, contribution models, team adoption. The emphasis is governance (keeping systems clean at scale), not pixel-pushing. The "mess of overrides" line signals real-world experience.
**Tags:** Tokens, Storybook, Figma, BEM / CSS Modules

#### Card 04 — AI Workflow Strategy
**Description direction:** Multi-agent framework design, prompt governance, tool selection, documented failure modes. The differentiator: practical AI integration, not hype. "No magic promises" is the Sugartown register.
**Tags:** AI, Agentic systems, Process design

#### Card 05 — RFP Support & Vendor Selection
**Description direction:** Requirements definition, vendor shortlisting, evaluation frameworks, stakeholder communication. The proof point is presence: "I've been in the room when production decisions were made." Knows what questions to ask.
**Tags:** RFP, Vendor evaluation, Requirements

#### Card 06 — Change Management & Enablement
**Description direction:** Getting teams to actually use the new system. Training materials, documentation, editorial governance, organizational alignment. The word "stick" is doing important work here: replatforming isn't done when the code ships, it's done when the team uses it.
**Tags:** Change management, Documentation, Enablement

**Tag color system (from services.html):**
- Pink-accented tags: primary identifiers (Fractional, AI)
- Seafoam-accented tags: specific platforms/tools (Sanity, Contentful)
- Default muted tags: domain/skill labels

**Implementation note:** The `cardBuilderSection` supports grid layout and cards with title + body. Tag chips may need to be authored as part of the card body text or the card builder schema may need a tags field. If the card builder doesn't support the numbered card + tags pattern from services.html, use `htmlSection` with the HTML structure from the epic file. Flag at implementation time.

---

### 3. How I Engage

**Section type:** `textSection` or `htmlSection` (the two-column sticky layout may exceed textSection's capabilities)
**services.html section:** `.how-section`

**Section heading:** "How I engage."

**Four engagement models, each with: type label, title, and description.**

#### Fractional — Embedded part-time PM
**Direction:** Fixed days per week, 3–12 months. Senior product leader without full-time overhead. Best for teams mid-replatforming or scaling a new product surface.

#### Sprint — Focused 2–4 week engagement
**Direction:** Scoped to a specific problem. Examples: CMS audit, design system health check, content model review, AI tooling assessment. You get a deliverable, not a retainer. "Good for unblocking a known bottleneck" is the right framing.

#### Advisory — Ongoing strategic review
**Direction:** Monthly sessions, clear agenda. Architecture decisions, roadmap review, team capability questions. For teams with internal delivery bandwidth who want a senior external perspective.

#### Contract — Project-based or short-term FTE equivalent
**Direction:** Full-time coverage for a defined phase: launch, migration, reorg, maternity cover. "I'm available for the right engagement" signals selectivity without arrogance.

**Tone check:** Each engagement model is direct and specific about what the client gets. No vague "let's explore" language. The engagement types are ordered from most common (fractional) to most specific (contract), which serves scanning. Note that the IA Brief and job search positioning place FTE intent first, contract availability second. The services page can keep "Contract" last because the page serves client-side hiring managers, not recruiters scanning for FTE keywords. The homepage and About page handle the FTE signal.

---

### 4. Is This a Fit?

**Section type:** `cardBuilderSection` (two cards) or `htmlSection`
**services.html section:** `.fit-section`

**Section header:**
- **Label:** "03"
- **Heading:** "Is this a fit?"

**Two cards: Good Fit and Probably Not.**

#### Good Fit
- Mid-market to enterprise teams navigating a CMS migration or replatform
- Engineering-led product orgs that need product leadership without another headcount
- Design teams that have built components but not governance
- Companies adopting AI tooling and wanting someone who's actually done it
- Teams with a working product and a messy roadmap
- Agencies needing an embedded senior PM for a complex client engagement

#### Probably Not
- Early-stage startups pre-product/market fit (not enough structure yet)
- Teams looking for someone to own all of engineering and design
- Pure execution work with no strategy component
- Engagements requiring full-time presence in a single physical office

**Why this section works:** It pre-qualifies. A hiring manager reading "good fit" sees their situation described and feels recognized. "Probably not" demonstrates self-awareness and saves both parties time. The parenthetical explanations (e.g., "not enough structure yet") are generous, not dismissive.

**Tone check:** Direct, not exclusionary. The "Probably not" items explain *why* it's not a fit, not just *that* it's not. This is warm authority in action: confident enough to say no, kind enough to explain.

---

### 5. CTA Section (Closing)

**Section type:** `ctaSection`
**services.html section:** `.cta-section`

**Content (from services.html, confirmed as target copy):**

- **Heading:** "If this sounds like your problem, my calendar is here."
- **Body:** The site itself is the portfolio. You can see how I think, what I've built, and how I document it. If that's the kind of PM you're looking for, let's talk.
- **Primary CTA:** "Book a call" → `/contact`
- **Secondary CTA:** "See the work" → `/case-studies`

**Tone check:** This is the Brand Voice Guide's CTA example verbatim. The heading is a conditional ("if this sounds like your problem") that respects the visitor's autonomy. The body copy points to the rest of the site as proof, then invites a conversation. Two CTAs: one to convert (contact), one to continue browsing (work). Correct hierarchy.

---

## SEO Considerations

- **Title tag:** "Services — Sugartown Digital" or "Product Leadership & CMS Architecture Services — Sugartown Digital"
- **Meta description:** ~155 characters. Name the top 3 service areas + availability signal. Something in the register of: "Fractional product leadership for CMS migration, design system governance, and AI workflow strategy. Senior PM, remote-first, available for the right engagement."
- **H1:** The hero heading ("I know what I'm doing. I have room in my calendar.")
- **Structured data:** `Service` or `ProfessionalService` JSON-LD (per AI search optimization strategy). Consider `Person` + `hasOccupation` for structured job-search discoverability.
- **Keyword targets (organic, not forced):** fractional product manager, CMS migration consultant, design system governance, headless CMS architecture, AI workflow strategy

---

## Content Inventory (What Needs Authoring)

The services.html file contains production-ready copy for every section. The authoring task is primarily *adaptation*, not creation.

| Section | Copy Status | Authoring Task |
|---------|------------|----------------|
| Hero heading + sub | ✅ Final in services.html | Transfer to Sanity |
| Credential list | ✅ Final in services.html | Transfer to Sanity (may need schema accommodation) |
| 6 service cards | ✅ Final in services.html | Transfer to Sanity; confirm tag implementation |
| 4 engagement models | ✅ Final in services.html | Transfer to Sanity |
| Good fit / Probably not | ✅ Final in services.html | Transfer to Sanity |
| CTA heading + body | ✅ Final in services.html | Transfer to Sanity |

**Estimated authoring time:** 1–2 hours (content transfer + section builder configuration), not 1–2 hours of writing. The writing is done.

---

## Implementation Decisions (Flagged for Epic)

These decisions need to be made when the page is built, not at brief stage.

1. **Hero sidebar layout.** The hero in services.html uses a two-column grid with a credential card. Current `heroSection` schema may not support this. Options: extend schema, use `htmlSection`, or simplify to single-column hero with credentials in the subheading body.

2. **Service card tags.** The `cardBuilderSection` cards may not support tag chips natively. Options: add tags to card body as styled text, extend card schema with a tags field, or use `htmlSection` for the services grid.

3. **Engagement model layout.** The two-column sticky heading layout in services.html (heading pinned left, engagement list scrolling right) exceeds `textSection` capabilities. Options: `htmlSection` with the layout from services.html, or simplified single-column `textSection` with engagement models as paragraphs.

4. **Fit section card styling.** The good/not-good visual treatment (seafoam border vs. muted border, checkmarks vs. dashes) may need `htmlSection` or card builder variant support.

5. **Section numbering.** The services.html uses "01", "03" section labels. This is visual hierarchy, not content. Decide whether to preserve numbering (requires `htmlSection` or section header customization) or drop it (section builder headings only).

---

## Authoring Checklist (Pre-Publish)

Before this page goes live, run every line through:

- [ ] Anti-AI-Generated Checklist (Brand Voice Guide)
- [ ] Structural Slop checklist (no em dashes, no decorative emoji, no adjective triads, no filler transitions)
- [ ] CTA labels follow CTA Copy Conventions (Brand Voice Guide)
- [ ] Every service card description is specific (names a tool, a deliverable, or a consequence)
- [ ] No service card starts with "I help teams..." or "I provide..." (passive, generic)
- [ ] Good Fit items describe the *visitor's situation*, not Bex's capabilities
- [ ] Probably Not items include a reason, not just a dismissal
- [ ] Credential list items are specific (role, year, or platform named)
- [ ] Read it aloud. If it sounds like a chatbot or a LinkedIn bio, rewrite it.
- [ ] The page works if a visitor reads only the hero + service card titles + CTA. Everything between is bonus.

---

## What This Brief Does NOT Cover

- Visual design, spacing, or responsive behavior (design system / component layer)
- Pricing, rates, or availability calendar (not on this page by design)
- Testimonials or client logos (no testimonial infrastructure exists; specificity is the social proof)
- Contact form behavior (separate epic: EPIC-0179)
- Mobile-specific content hierarchy adjustments

---

*This brief is a constraint document for copy authoring. The IA Brief remains the locked architectural source of truth. The Brand Voice Guide and Master Voice Cheat Sheet govern all copy produced from this brief. The services.html file is the definitive content and layout reference.*
