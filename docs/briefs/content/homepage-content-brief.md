# Homepage Content Brief

**Route:** `/` (root)
**Sanity type:** `page` document via section builder (curated)
**Status:** Draft brief, ready for copy authoring
**Source constraints:** IA Brief §5 (Homepage), §10 Decision #5, Brand Voice Guide, Master Voice Cheat Sheet
**Created:** 2026-04-15

---

## What This Document Is

A section-by-section content brief for the Sugartown Digital homepage. Each section maps to an available section type in the Sanity section builder. Copy direction, tone targets, and CTA guidance are included. This is a writing guide, not a design spec.

The homepage is a **composition of teasers**, not a unique content type. It pulls leader content from each major site section and serves two jobs: navigation device (get visitors to the right section fast) and design system showcase (prove the components work by using them).

---

## Visitor Arc (What the Homepage Proves)

The homepage answers one question in about 8 seconds of scrolling: **"Is this person worth my next click?"**

The conversion path for the two primary audiences:

**Hiring managers / recruiters:** Hero → Work teaser (she ships real things) → Library teaser (she thinks in systems) → Services CTA (she's available)

**Peers / practitioners:** Hero → Library teaser (sharp writing, real problems) → Platform teaser (she versions her own portfolio?) → pick a thread

---

## Voice Dial

**Homepage hero / nav-level:** Arresting, minimal, confident. No explanation. The site speaks first, you speak second.

**Section teasers:** One notch warmer than the hero. Enough personality to set expectations for the destination page, not enough to slow the visitor down. Each section teaser is a single breath: positioning line + proof point + CTA.

**Anti-patterns to avoid on this page specifically:**
- No "Welcome to my portfolio" energy
- No "I'm passionate about" (see Brand Voice Guide: Credibility Without Chest-Thumping)
- No third-person self-reference ("Bex is a product manager who...")
- No em dashes (homepage is not node territory)
- No decorative emoji
- No adjective triads ("robust, scalable, and maintainable")
- No filler transitions between sections (each section is self-contained)

---

## Section Layout (Top → Bottom)

### 1. Hero Section

**Section type:** `heroSection`
**Purpose:** Arrest. Identify. Set tone. No selling.

**Content direction:**

- **Heading:** Short. Declarative. First person or site-as-speaker. Should work at 48px+ and read in under 2 seconds. This is not a tagline; it's a positioning statement compressed into a breath.
- **Subheading:** One sentence max. Grounds the heading in specificity. Names what Bex does without listing everything. Hiring managers should immediately understand the domain.
- **CTA button(s):** Two max. Primary = strongest conversion destination (likely `/case-studies` or `/services`). Secondary/tertiary = browse destination (likely `/knowledge-graph` or `/about`).

**Copy targets (write 2–3 options for each, pick the sharpest):**

Heading candidates should aim for the register of:
- A confident statement of what this site (or person) is
- Something a visitor remembers after closing the tab
- Specificity over cleverness (but cleverness earns its spot if it's also specific)

Subheading candidates should ground the heading:
- Name the domain: CMS, design systems, content architecture, product management
- Signal seniority without saying "senior" or "15+ years"
- If the heading is abstract, the subheading is concrete. If the heading is concrete, the subheading adds dimension.

CTA labels (per Brand Voice Guide CTA conventions):
- Primary: "See the work" / "Here's what I've actually built."
- Secondary: "Pick a thread" / "Start anywhere"
- Avoid: "Learn more" / "Get started" / "Explore"

**Tone:** The site speaks first. No warm-up. No context-setting. If the heading needs a preamble, the heading is wrong.

---

### 2. Work Section (Case Studies Teaser)

**Section type:** `ctaSection` or `cardBuilderSection` (cards if featured case studies are ready; CTA banner if not)
**Purpose:** Prove she ships. This is the receipts section.

**Content direction:**

- **Section heading:** Short label, not a sentence. "Work" or "Selected Work" or nothing (let the cards speak).
- **Body copy:** 1–2 sentences max. The case studies carry their own weight; the homepage teaser just needs to frame them. Focus on the *type* of work (replatforming, design systems, content architecture) not the client list.
- **Proof points to surface:** Webby-nominated FX Networks flagship (Lead PM, 2021). Enterprise CMS replatforming. Content migration at scale. If case study cards are used, the card metadata (role, year, client) does this work automatically.
- **CTA:** "See the work" → `/case-studies`

**Copy target:**
Something in the register of: "I build the systems that content teams actually use. Here are the receipts." One sentence that communicates the work is real, specific, and recent, then get out of the way.

**Tone:** Show the receipts. Process + result, no fluff. Specificity is social proof.

---

### 3. Library Section (Knowledge Graph + Articles Teaser)

**Section type:** `cardBuilderSection` (Library Catalog Cards, per IA Brief) or `ctaSection` with two CTAs
**Purpose:** Signal depth. This person doesn't just ship; she writes about *why* things break and how to fix them.

**Content direction:**

- **Section heading:** "Library" or "From the Library" or a more characterful label that matches the Knowledge Graph / vintage card catalog aesthetic.
- **Body copy:** 1–2 sentences. Frame the two content types: Knowledge Graph nodes (technical forensics, system-building patterns) and Articles (PM perspective, process writing). The copy should make a hiring manager curious and a practitioner click.
- **Featured content:** Pull 2–4 items via GROQ (latest by `publishedAt`, or editorially featured). Mix of nodes and articles for variety.
- **CTA(s):** Two destinations. "Knowledge Graph" → `/knowledge-graph` and "Articles" → `/articles`. Or a single "Browse the Library" if a combined landing is preferred.

**Copy target:**
Something in the register of: "I document what I learn while building. The knowledge graph is the technical how. The articles are the strategic why." Enough to differentiate the two content types without explaining the taxonomy.

**Tone:** One notch nerdier than the Work section. This is the section that signals "I think about my work, not just execute it." But still brief. The content itself does the heavy lifting.

---

### 4. Platform Section (The Differentiator Teaser)

**Section type:** `ctaSection` or `textSection`
**Purpose:** This is the "wait, this portfolio ships versions?" moment. The thing that makes Sugartown different from every other PM portfolio.

**Content direction:**

- **Section heading:** Something that names the behavior, not the section. "This site ships versions" or "Built in public" or similar.
- **Body copy:** 2–3 sentences. Communicate that Sugartown is itself a product: versioned, documented, built on a governed monorepo with a design system, release notes, and an architecture spec. This is the section that converts technical hiring managers from "interesting portfolio" to "this person thinks like an engineer."
- **Version badge:** If possible, surface the current version number (e.g., "v0.19.x") as a concrete proof point. Static text or pulled from `siteSettings`.
- **CTA:** "How it's built" → `/platform`

**Copy target:**
Something in the register of: "Most portfolios are static brochures. This one has a changelog." One line that names the difference, then let the Platform page do the explaining.

**Tone:** Confident without being smug. The version number is the flex; the copy just points at it.

---

### 5. Services Section (Sales Path CTA)

**Section type:** `ctaSection`
**Purpose:** Convert. This is the section that exists for hiring managers and potential clients. It should feel like a natural conclusion to the page, not a sales pitch dropped from orbit.

**Content direction:**

- **Section heading:** "Work with me" or "Services" or something warmer that doesn't sound like a pricing page.
- **Body copy:** 2–3 sentences max. Name the core strengths without listing all seven (save the full list for `/services`). Lead with the thing most likely to match a hiring manager's search: CMS architecture, design systems, content strategy. Close with availability signal.
- **CTA:** Primary: "See how I can help" or "What I do" → `/services`. Optionally a secondary: "Book a call" or "Get in touch" → `/contact` (or calendar link).

**Copy target:**
Something in the register of the Brand Voice Guide's Services tone: "I know what I'm doing and I have room in my calendar." Warm authority. Specific credentials, no desperation. Not begging. Not explaining why you should hire me. The five sections above already did that.

**Tone:** Warm authority. The site has already shown the work, the thinking, and the infrastructure. This section just says: "and yes, I'm available."

---

### 6. About Teaser (Optional, Lightweight)

**Section type:** `textSection` or omit entirely
**Purpose:** Add a human beat before the footer. Not required if the hero already communicates enough personality.

**Content direction (if included):**

- **No heading** or a minimal one ("About" or just the name).
- **Body copy:** 1 sentence positioning line. Career arc in a breath. Link to `/about` for the full story.
- **CTA:** "The full story" → `/about`

**Copy target:**
Something in the register of: "I've been building content systems since before we called them headless. Currently shipping Sugartown and looking for the next thing worth building."

**Decision:** Include or omit based on whether the hero section already carries enough human warmth. If the hero is pure positioning (site-as-speaker), include the About teaser. If the hero is personal (Bex-as-speaker), this section may be redundant.

---

## SEO Considerations

- **Title tag:** Sugartown Digital (short, brandable, let the meta description do the explaining)
- **Meta description:** Name + domain + one specific credential. ~155 characters. Something in the register of: "Bex Head is a senior product manager specializing in CMS architecture, design systems, and content strategy. Portfolio, case studies, and knowledge graph."
- **H1:** The hero heading (one per page, this is it)
- **Structured data:** `Person` + `WebSite` JSON-LD (per AI search optimization strategy already defined)

---

## Authoring Checklist (Pre-Publish)

Before this page goes live, run every line of copy through:

- [ ] Anti-AI-Generated Checklist (Brand Voice Guide)
- [ ] Structural Slop checklist (no em dashes, no decorative emoji, no adjective triads, no filler transitions, no list-itis)
- [ ] CTA labels follow CTA Copy Conventions (no "Learn more", no "Get in touch!")
- [ ] Every section is intelligible at skim depth (heading + one-liner tells the story)
- [ ] No section requires reading the previous section to make sense
- [ ] Read it aloud. If it sounds like a chatbot, rewrite it.
- [ ] Specificity check: are there numbers, tool names, or version numbers where there could be vague adjectives?
- [ ] The page works if a visitor reads only the hero + CTAs + footer. Everything between is bonus.

---

## Section Builder Mapping (For Sanity Studio)

When authoring in Sanity, the homepage `page` document's `sections[]` array should contain:

| Order | Section Type | Notes |
|-------|-------------|-------|
| 1 | `heroSection` | Heading, subheading, 1–2 CTA buttons |
| 2 | `ctaSection` or `cardBuilderSection` | Work teaser. Cards if featured case studies are curated; CTA banner as fallback. |
| 3 | `cardBuilderSection` | Library teaser. Library Catalog Cards showing 2–4 featured/recent items. |
| 4 | `ctaSection` or `textSection` | Platform teaser. Version badge + positioning line + CTA. |
| 5 | `ctaSection` | Services CTA. Warm, direct, available. |
| 6 | `textSection` (optional) | About teaser. Omit if hero carries enough personality. |

---

## What This Brief Does NOT Cover

- Visual design, layout, or responsive behavior (design system / component layer)
- GROQ queries for dynamic content pulls (implementation layer)
- Image art direction or hero imagery (separate creative brief)
- Library Catalog Card component specification (separate epic, homepage blocker)
- Mobile-specific content hierarchy adjustments

---

*This brief is a constraint document for copy authoring. The IA Brief remains the locked architectural source of truth. The Brand Voice Guide and Master Voice Cheat Sheet govern all copy produced from this brief.*
