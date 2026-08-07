# Red Pen — Prestige Beauty Pilot (case study, "show the receipts")

**Reviewed:** 2026-08-07
**Document:** `wp.caseStudy.388` (published; **no draft exists**)
**Slug:** `/case-studies/prestige-beauty-pilot-headless-cms-enterprise-design-system`
**Last content edit:** 2026-07-14
**Origin:** WordPress import 2026-02-21 (`legacySource.wpId 388`), predates `/write-casestudy`

## Sources consulted

| Source | Used for |
|---|---|
| `docs/brand/master-voice-cheatsheet.md` | five principles, anti-pattern checklist |
| `docs/brand/brand-voice-guide.md` | tone spectrum (case study row), Do This / Not This, structural slop |
| `docs/write-casestudy-prompt.md` | canonical section order, receipts check, enterprise-deck ban, length band |
| `docs/write-pipeline-prompt.md` §3–§4 | banned-vocabulary superset, self-checks, em dash / emoji matrix |
| Resume Factory: `Becky-Head_PROTOTYPE_CMS-DesignSystem_2026_r7.docx` | ELC role, dates, brand count, team size, the 3-month/60% receipts |
| Resume Factory: `Becky-Head_STORY-BANK_Master_2026.md` modules 2, 3, 6, 9, 10 | token-hierarchy story, replatform comparison, RFP sequence |
| Resume Factory: `Story-Library_Module9_CORRECTION-PENDING.md` | what actually ended the Storyblok pilot |
| Sanity `wp.article.814` ("LUXURY DOT COM") | published receipts about this same engagement |

---

## Editor's verdict

This is a WordPress-era artifact wearing a Sanity schema. The structure is right, the schema
fields are mostly populated, and the FAQ accordion carries `semantic: "faq"` correctly. What
is missing is the case study. There is no narrator: across 397 words of Overview, nobody does
anything. Things "were validated," pilots "transformed delivery friction," lessons "shaped
roadmaps." The one register on this site that requires "I" is the only one where it never
appears.

The weak link is the receipts, and it is not a small gap. The strongest number in this
engagement is on Becky's own resume in two separate places: a luxury brand replatformed in
under three months against a nine-to-twelve-month organizational average. It is not in this
case study at all. Neither is the 60% cut to legacy Drupal 7 fields, the rollout to 5+
flagship brands, the team of 6 developers and up to 12 designers, or the best story in the
whole engagement (engineering had collapsed a three-tier token hierarchy into one; Becky
argued for four-to-six sprints of rework by naming what breaks at brand two, won it, and the
system scaled to all five brands). In their place sits "JSON modeling replaced typical 30k
lines of legacy Drupal code," flagged `measured`, with the word "typical" quietly admitting
it is not.

The candour instinct is genuinely here, and it is the best thing about the piece: the tech
debt is named, the failures get equal billing with the wins, and "Reader: we succeeded" is a
real voice moment. But candour without specificity reads as modesty rather than credibility.
The linked article on this same site tells this engagement's tech-debt story far better than
the case study does, with 75 hand-coded hero banners and a six-sprint token refactor. The
case study is currently the weaker telling of its own story.

**Publishable as-is:** it is already published. It should not stay in this state. The
accuracy rows are the blocking set; the receipts rows are what turn it from a summary into a
case study.

---

## Narrative map

**Thesis:** A compliance deadline forced a composable-stack pilot, and naming the tech debt
out loud is what kept the shortcuts from becoming permanent.

That thesis is real, defensible, and interesting. The document does not commit to it. It
hedges toward a second, weaker thesis ("the pilot validated a Composable Content & Design
Ecosystem as a scalable enterprise strategy") which is deck language and which the sources
do not fully support.

**Beats** (case-study arc: challenge → process → receipts):

| Beat | Present? | Note |
|---|---|---|
| Hook / stakes | Yes | The Challenge callout is the strongest block in the piece |
| Challenge (expanded) | Partial | Six fragments, no business cost attached to any of them |
| My Role | Partial | Six fragments, no scale, no first person |
| Process | **Weak** | Four fragments, ~35 words. This is where the story lives and it is nearly empty |
| Receipts | **Weak** | Three tiles, no `valueBefore` on any, strongest number absent |
| Reflection / aftermath | Duplicated | "Strategic Impact" and "Reflection" say the same thing twice |
| What happened next | **Missing** | An enterprise-wide Shopify decision ended the composable path. Not mentioned |

**Skim skeleton** (what a 30-second reader gets):

> **Prestige Beauty Pilot — Headless CMS + Enterprise Design System**
> *Case Study*
> "A newly acquired prestige beauty brand came with a legal mandate: migrate to company
> infrastructure within 3 months or breach compliance… Reader: we succeeded."
> **Outcomes:** JSON modeling · 30k lines replaced / Regional rollout enablement · US, UK, AU
> / Editorial workflow validation · In-page preview
> **Overview** → Challenge → My Role → Process → Key Outcomes → Visuals / Artifacts →
> Strategic Impact → Reflection
> *Closer:* "Retooling tokens and content models post-pilot wasn't just cleanup; it was the
> crucial step that made the ecosystem sustainable for the long haul."

The callout does real work. Everything after it is generic. The section headings are
category labels, not meaning ("Process" tells you nothing; "Won a four-sprint argument about
token architecture" tells you everything). Two of three outcome tiles lead with a process
noun rather than a number. A skimmer leaves without a single fact that distinguishes this
engagement from any other replatform.

**Length:** Overview is **397 words** against the register band of **500–1,200**. Under
budget, and the deficit is diagnostic rather than virtuous: the piece is a bullet skeleton,
not a tight narrative. 16 of its 21 content blocks are fragment bullets.

| Structure | Rating | Why |
|---|---|---|
| Thesis clarity | adequate | A real thesis exists (name the debt out loud) but competes with a deck thesis |
| Beat completeness | weak | Process is ~35 words; the aftermath beat is missing entirely |
| Momentum | weak | The callout earns attention, then the piece switches to fragment lists for 350 words |
| Payoff | weak | Reflection restates Strategic Impact; neither spends what the callout earned |
| Skim integrity | weak | Every distinguishing fact is invisible at skim depth |
| Length economy | adequate | Under band, but the shortfall is missing narrative, not efficiency |
| Theme discipline | n/a | No controlling metaphor. See note below |

**Theme note (Pass 3.5):** no controlling metaphor is present, so this rates n/a rather than
weak. Worth recording, though: "Reader: we succeeded" is a Jane Eyre allusion doing real
work in a piece with no other figurative register around it. It reads as a good line stranded
in a document that gave it nothing to belong to. The related article ("LUXURY DOT COM") runs
a fully committed metaphor on this exact engagement (a decorative unicorn powered internally
by hamsters on wheels, duct tape and Band-Aids, "the hamster becomes an FTE employee with a
pension"). That is the register this case study could have had.

---

## What worked

**The Challenge callout.** The single best block in the document, and it does four things at
once:

> "A newly acquired prestige beauty brand came with a legal mandate: migrate to company
> infrastructure within 3 months or breach compliance… The clock was non-negotiable. So was
> getting it right: we baked in the follow-up roadmap to fix every shortcut the deadline
> forced. Reader: we succeeded."

Why it works: it names a hard external constraint (compliance, not preference), states the
stakes in the client's terms, admits that shortcuts happened before anyone can accuse, and
lands the punchline in four words. "The clock was non-negotiable. So was getting it right" is
a genuine Sugartown sentence: parallel, compressed, no hedging. This is Do This table
material.

**Failures given equal billing.** Three wins and three losses in the Key Outcomes block, with
the losses stated plainly ("Compressed timelines created rework and delivery strain"). Most
portfolio case studies would bury these. Keep the honesty; fix the delivery mechanism
(finding #17).

**Tech debt as a named deliverable, not an apology.** "Explicitly flagged tech debt
carve-outs… ensuring leadership acknowledged the need to retool post-launch" reframes debt
from a confession into a thing Becky made leadership sign. That is the actual product-manager
skill on display and it is the most under-sold line in the piece.

**FAQ mechanics are correct.** `semantic: "faq"` is set, so the FAQPage JSON-LD emits. Three
items, all third person, all questions a prospective client would actually ask. This section
needs fact fixes (#4) but the shape is right.

---

## Findings

Legend — Tier: **Accuracy** (blocking) · **Voice** (blocking-ish) · **Sharpness** (advisory).
Location refers to Sanity field paths / block keys.

| # | Tier | Location | Current | Proposed | Why |
|---|------|----------|---------|----------|-----|
| 1 | Accuracy | outcome tile `1b7f35de7bc6` | metric "JSON modeling", valueAfter "30k lines replaced", `evidenceType: measured` | metric "Legacy Drupal 7 fields", valueBefore "Full legacy field set", valueAfter "60% removed", `evidenceType: measured` | The 30k figure appears in no primary source, and its own impactStatement says "typical", which is an estimate, not a measurement. The 60% cut is on resume r7 verbatim ("cutting legacy Drupal 7 fields by 60%"). Swap an unsourced number flagged `measured` for a sourced one. |
| 2 | Accuracy | outcome tiles (new) | *(absent)* | New lead tile: metric "Time to replatform", valueBefore "9–12 months (org average)", valueAfter "Under 3 months", `evidenceType: measured` | The strongest receipt in the engagement, on resume r7 in two places (Leadership & Impact + the ELC bullet). Its absence is the single biggest gap in the document. |
| 3 | Accuracy | `aeoSummary`, `geoSummary`, callout `fe0ad8d3ed2f` | "a multi-brand, multi-region portfolio of 20+ brands" / "20+ brand portfolio" | "5+ flagship brands" (or confirm the 20+ figure and cite what it counts) | Every primary source says 5+ flagship brands (resume r7: "rollout of design system to 5+ flagship brands"; story bank #2: "across 5+ flagship brands"). 20+ may be the ELC corporate portfolio rather than the design system's scope, but as written it reads as the pilot's target. |
| 4 | Accuracy | FAQ item `3a92c8dd8971` | "Post-pilot retooling of the token schema and content model was budgeted and executed." | "The remediation roadmap was budgeted; leadership acknowledged the retooling as required follow-on investment." | Contradicts the Overview, which says the debt "required dedicated re-architecture efforts post-pilot" (unresolved). One of these is wrong; the FAQ is the one asserting completion. Needs Becky's answer on what actually shipped. |
| 5 | Accuracy | `vargnzonf` (Strategic Impact) | "legacy Drupal7" | "legacy Drupal 7" | Typo, and inconsistent with the doc's own Challenge bullet ("Legacy Drupal CMS", no version). Resume r7 uses "Drupal 7". Pick the versioned form and use it in both places. |
| 6 | Accuracy | `aeoSummary`, `geoSummary` | "…a live site on headless CMS, in-house ecommerce, PIM, and a token-driven design system" | Drop `in-house ecommerce` and `PIM` unless the body supports them | The body never mentions PIM or in-house ecommerce anywhere. These are the two fields AI answer engines quote directly. A retrieval summary asserting stack components the case study cannot back is the worst place for an unsupported claim. |
| 7 | Accuracy | `client` field + hero image + `vargnzonf` | `client: <Redacted>`, but hero asset is `tfb-light-bg.png`, alt text describes the product, and the copy says "The Brand.com pilot" | Decide once: either name Tom Ford Beauty (resume r7 names `tomfordbeauty.com` openly) or scrub the tells | The redaction does not hold. The image filename, the hero photography, and the linked "LUXURY DOT COM" article together identify the brand, while the client field claims otherwise. Half-redaction is worse than either choice. |
| 8 | Accuracy | `excerpt`, `seo.description` | Both open with the stray word "Overview" ("Overview From 2023 to 2025, …") | Rewrite the excerpt to lead with the strongest receipt; regenerate the SEO description | WordPress import artifact. The excerpt is the archive-listing card and the meta description. It currently leads with a heading fragment and trails off in an ellipsis at 296 chars. |
| 9 | Accuracy | `seo.title` | "Prestige Beauty Pilot — Headless CMS + Enterprise Design Sys" | "Prestige Beauty Pilot — Headless CMS and Design System" | Truncated mid-word. Whatever generated it cut at a character limit without a word boundary. |
| 10 | Accuracy | body (all sections) | Storyblok never named | Name Storyblok in the Process section | Storyblok is already attached as a `tools` reference on this document, and resume r7 and story bank #9 both name it openly. The machine-readable metadata names the CMS while the prose hides it. |
| 11 | Voice | `vargnzonf` (Strategic Impact) | "…informed enterprise planning **—** carving out time and budget…" | "…informed enterprise planning, carving out time and budget…" | Em dash. Case studies get zero tolerance and no node exemption (`write-pipeline-prompt.md` §4 register matrix). Only em dash in the body; the title's `Title — Subtitle` is permitted. |
| 12 | Voice | `awayl1r7x` (Key Outcomes) | `✅ ✅ ✅ ❌ ❌ ❌` prefixes | Remove all six | No emoji in case studies, decorative or functional (`master-voice-cheatsheet.md` anti-pattern checklist; `write-casestudy-prompt.md` Step 2.5). See #17 for what replaces the block. |
| 13 | Voice | `awayl1r7x`, `vargnzonf` | "enabled **scalable** regional rollout"; "as a **scalable** enterprise strategy" | "rolled out to US, UK and AU without per-region rebuilds"; "proved CMS and design-system integration held across brands" | `scalable` is on the banned-vocabulary list in `write-pipeline-prompt.md` §4, no register exemption. Both uses are doing an adjective's job where the sources offer a fact. |
| 14 | Voice | `5qk6cjvvm` (Reflection) | "…a foundation for enterprise-wide speed, scalability, and systemized design + content operations." | "…a foundation the next brand could launch on in a quarter instead of a year." | Adjective/noun triad, and it contains a third banned-vocabulary hit (`scalability`). Test from the guide: swap the three nouns for any other three and the sentence reads the same. Replace with the number. |
| 15 | Voice | Overview, all blocks | No first person anywhere. "the pilot transformed delivery friction", "Lessons shaped governance", "Explicit acknowledgement of tech debt also informed enterprise planning" | Restore Becky as the actor: "I flagged the debt in the delivery plan so leadership had to budget for it before launch, not after." | The largest voice defect. Case studies are first-person PM (`brand-voice-guide.md` §First Person). "My Role" is a heading over six agentless fragments. Agentless prose is the register the guide calls corporate, and it erases exactly the judgment a hiring manager is reading for. |
| 16 | Voice | Overview headings + tile labels | "Composable Content & Design Ecosystem" (Title Case), "Strategic Impact", "Regional rollout enablement", "Editorial workflow validation", "long-term resilience" | Translate each into what happened | Enterprise-deck register, the case-study-specific slop the skill names in Step 0 ("It reads like the client's own pitch deck"). Title-Cased phrases read as a product a vendor is selling rather than work someone did. |
| 17 | Voice | `awayl1r7x` (Key Outcomes) | One text block of six emoji-prefixed lines mixing wins and losses | A `tableBlock`: rows = What worked / What didn't, columns = Outcome, Why | Show-don't-tell: six items across two dimensions narrated as a list is a table (`brand-voice-guide.md` Do This / Not This, final row). This is also the block duplicating the outcome tiles' numbers, which the skill explicitly forbids. |
| 18 | Voice | Overview, Challenge + My Role + Process | 16 of 21 content blocks are fragment bullets | Convert Challenge and Process to prose; keep My Role bulleted but make it verb-first and parallel | List-itis: "bullets are for parallel items, not for avoiding prose." "Product Lead across CMS + EDS workstreams" (noun phrase) sits in the same list as "Defined scope, sequencing, and vendor evaluation" (verb-first). Not parallel. |
| 19 | Voice | `aiDisclosure` | "Written by human." | Leave blank | Schema convention is that blank means fully human-authored (`write-casestudy-prompt.md` Step 2.6). A non-canonical string here is a value no consumer of the field is checking for. |
| 20 | Sharpness | outcome tiles, all three | No `valueBefore` on any tile | Add a before value to each, or mark the tile qualitative and drop the pretence | A before/after with no before is not a receipt, it is a status. The tile schema's whole argument is the delta. |
| 21 | Sharpness | Process section | Four fragments, ~35 words | Expand to 150–250 words and put the token-hierarchy fight here | The engagement's best story is missing entirely: engineering, new to design tokens, had collapsed a three-tier hierarchy (global, alias, component) into one; Becky made the case for four-to-six sprints of rework by naming what breaks at brand two and what the debt costs; won alignment; the system scaled to all five brands (story bank #2, Lens B). This is the "candor is credibility" beat the piece is currently gesturing at instead of telling. |
| 22 | Sharpness | `f2f16o5fo` + `ghndkdlf6` (Strategic Impact / Reflection) | Two sections, ~160 words, saying the same thing | Merge into one Reflection of 3–4 sentences | Both conclude "naming the tech debt made it survivable". The duplication costs the closer its force. The skill's guidance: the Reflection is where the best line lives; do not waste it on summary. |
| 23 | Sharpness | Reflection | "…wasn't just cleanup; it was the crucial step that made the ecosystem sustainable for the long haul." | Take the register from the linked article | `wp.article.814` ("LUXURY DOT COM"), published on this site, tells this engagement's tech-debt story with 75 manually coded hero banners (one-year refactor), tokens defined at component level instead of system level (six sprints), and a half-built URL engine still needing a CSV upload per edit, two years on. The case study is the weaker telling of its own story. Borrow from yourself. |
| 24 | Sharpness | My Role section | No scale stated | Add: cross-functional team of 6 developers and up to 12 designers; design system rolled out to 5+ flagship brands; WCAG 2.2/ARIA standards defined | All three on resume r7, all absent here. Specificity is social proof; "Product Lead across CMS + EDS workstreams" gives the reader no way to size the job. |
| 25 | Sharpness | end of Overview | No aftermath beat | Add 2–3 sentences on what happened after the pilot | The composable path ended not on its own merits but because of an enterprise-wide decision to move the portfolio onto Shopify, a call made above the content layer (`Story-Library_Module9_CORRECTION-PENDING.md`, confirmed by Becky 2026-08-04). Also relevant: the ELC headless CMS RFP shortlisted Contentful, Contentstack and Acquia and delivered a requirements framework before being cut short by the same decision. As published, "validated as a replicable template" implies a template that went on to be used. **Note:** the same correction doc warns that the content model's portability is design intent, never demonstrated, because Shopify does not share the data shape. Do not write the portability claim in either direction. |
| 26 | Sharpness | section structure | Image sits inline under a "Visuals / Artifacts" `h2` inside the Overview `textSection`; subsection headings are `h2` | Move the image to an `imageGallery` section; demote subsection headings to `h3` | Canonical order in `write-casestudy-prompt.md` Step 2 puts the gallery as its own section between Overview and the FAQ, and specifies `h3` for Overview subsections. Current `h2`s sit at the same level as the section heading they are nested under, which is a real heading-hierarchy defect for screen readers, not just a convention miss. |

---

## Notes to the writer (no edit proposed)

**On the two theses.** The document is trying to be two things: a case study about delivering
under a compliance deadline, and a proof-of-concept writeup for a "Composable Content &
Design Ecosystem." The second one is what a vendor writes. The first one is what a hiring
manager reads. The Challenge callout already commits to the first. If you take only one
structural note from this review, take that one, and let the deck thesis go.

**On redaction.** This needs a decision, not an edit. Resume r7 names `tomfordbeauty.com`
openly in the ELC bullet, and the case study's own hero asset is `tfb-light-bg.png`. If the
redaction is a real client obligation, the image and the "Brand.com" phrasing have to go too.
If it isn't, naming the brand roughly doubles the credibility of every claim in the piece.
The current state has the cost of redaction and none of the benefit.

**Cross-source date discrepancy (not a defect in this document).** The case study's
`dateRange` (Sep 2023 – Dec 2025) matches resume r7 exactly. The story bank's career-arc
module says Estée Lauder ran "through 2024" in two places (lines 93–94). The resume is the
more precise source and the case study agrees with it, so nothing to fix here, but the story
bank line is worth correcting on its own next pass, since it feeds interview answers.

**Employer and contract type need confirming.** The case study records `employer: "Lorien"`
and `contractType: "contract"`. Resume r7 lists Estée Lauder Companies Inc. directly with no
contract marker, while explicitly marking Tatcha "(Contract)". Both can be true (agency of
record on a contract engagement, presented as the client on the resume), but the two artifacts
currently disagree in a way a recruiter cross-referencing them would notice.

**On the write-casestudy skill.** This document predates the skill (WordPress import,
Feb 2026) and it shows: no `imageGallery` section, `h2` subsections, an emoji outcomes block,
missing `valueBefore` values. Worth deciding whether the other six imported case studies get
the same pass. If they share these defects, that is an epic, not six red-pen sessions.

**Related-content opportunity.** `relatedTerms` is empty. This document uses design tokens,
headless CMS, MACH, composable, and tech debt as load-bearing concepts, several of which are
live glossary terms. Out of scope for this review, but it is free retrieval surface.

---

## Unverifiable claims

Each needs Becky's confirmation. None can be checked against the repo, Sanity, or the
Resume Factory sources consulted.

| Claim | Where | Status |
|---|---|---|
| "legal mandate: migrate to company infrastructure within 3 months or breach compliance" | Challenge callout, `aeoSummary`, FAQ Q1 | Could not verify. Resume r7 confirms "under 3 months" but frames it as a replatform timeline, not a compliance deadline. The legal framing is the callout's whole hook, so it matters. |
| "30k lines of legacy Drupal code" | Outcome tile 1 | Could not verify in any source. Flagged `measured`. See finding #1. |
| "20+ brands" | `aeoSummary`, `geoSummary`, callout | Contradicted by every source found (5+ flagship brands). See finding #3. |
| "US, UK, AU" regional rollout | Outcome tile 2, `region`, `geoSummary` | Could not verify. Internally consistent across the document. |
| "Parallel stacks (Liquid vs. Elixir/Phoenix)" | Challenge bullet | Could not verify. Note that Liquid is Shopify's template language, which sits oddly with a headless-CMS pilot and may be worth a sentence of explanation for the reader either way. |
| "in-house ecommerce, PIM" in the stack | `aeoSummary`, `geoSummary` | Could not verify, and unsupported by the document's own body. See finding #6. |
| "in-page preview critical to editorial workflows" | Outcome tile 3 | Could not verify. Marked `qualitative`, which is honest. |
| Post-pilot retooling "budgeted and executed" | FAQ Q3 | Could not verify, and contradicted by the Overview. See finding #4. |

---

## Gate 2 application log

**Write target note (decide before applying anything):** this document has **no draft**;
`wp.caseStudy.388` exists only as published. Patching it directly changes the live page,
which is a publish-equivalent action and is not the agent's to take under CLAUDE.md's
Human-Publishes Rule. Approved edits will be written to `drafts.wp.caseStudy.388` for Becky
to publish from Studio.

**2026-08-07 — Gate 1 closed, no rows approved.** Becky elected to discuss before approving
any finding. All 26 rows remain `pending`. Nothing written to Sanity.

| # | Decision |
|---|---|
| 1 | pending |
| 2 | pending |
| 3 | pending |
| 4 | pending |
| 5 | pending |
| 6 | pending |
| 7 | pending |
| 8 | pending |
| 9 | pending |
| 10 | pending |
| 11 | pending |
| 12 | pending |
| 13 | pending |
| 14 | pending |
| 15 | pending |
| 16 | pending |
| 17 | pending |
| 18 | pending |
| 19 | pending |
| 20 | pending |
| 21 | pending |
| 22 | pending |
| 23 | pending |
| 24 | pending |
| 25 | pending |
| 26 | pending |

## Feedback log

*(Empty.)*
