---
**Epic:** SUG-187 — Legacy case study rebuild and engagement-fact reconciliation
**Linear Issue:** [SUG-187](https://linear.app/sugartown/issue/SUG-187)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
**Scope widened:** 2026-08-07, from 2 case studies to all 7 legacy imports plus the
Studio ↔ Resume Factory fact reconciliation. Prior scope preserved in §Carried forward.
---

# SUG-187 — Legacy case study rebuild and engagement-fact reconciliation

Rebuild the seven WordPress-imported case studies to the `/write-casestudy` standard, and
make Sanity and the Resume Factory agree on one set of engagement facts.

## Background

All seven live case studies at `/case-studies/*` predate `/write-casestudy` (WordPress
import, 2026-02-21, `legacySource.wpId` present on each). A red-pen review of
`prestige-beauty-pilot-headless-cms-enterprise-design-system` on 2026-08-07 produced 26
findings, which prompted a corpus-wide measurement of the other six. The defects are
systematic, not per-document.

**Measured 2026-08-07.** Text counts across every string field in each document, via the
Sanity query API with `SANITY_AUTH_TOKEN`; `Sugartown: The Platform Is the Portfolio` is
included as the non-legacy control.

| Case study | Em dash (sections) | Emoji | Banned / deck words | Tiles w/o `valueBefore` | First-person "I" | `excerpt` | `seo.title` |
|---|---|---|---|---|---|---|---|
| `launching-lunar-landing` | 12 | 0 | `scalable` | 2/4 | yes | clean | ok |
| `beringer-com-raising-a-glass-to-a-digital-refresh` | 8 | 0 | — | 3/3 | yes | heading fragment | truncated |
| `bare-minerals-from-bottlenecks-to-brilliance` | 14 | 0 | — | 2/4 | yes | heading fragment | truncated |
| `charting-a-new-course-for-backroads-com` | 6 | 0 | `scalability` | 2/3 | yes | em dash | ok |
| `fx-networks-website-redesign-nominated-for-webby` | 5 | 1 | `facilitate`, `scalable` | 2/3 | **none** | em dash | truncated |
| `beauty-retail-from-monolith-to-microservice` | 8 | 0 | `facilitate`, `scalability`, `omnichannel`, `unified model powering` | 2/4 | **none** | heading fragment | truncated |
| `prestige-beauty-pilot-headless-cms-enterprise-design-system` | 1 | 6 | `scalable`, `scalability` | 3/3 | **none** | heading fragment | truncated |
| **7 legacy totals** | **54** | **7** | — | **16 / 24** | 3 with none | 6 of 7 broken | 5 of 7 |
| `sugartown-platform-is-the-portfolio` (control) | 1 | 0 | — | n/a | yes | clean | n/a |

Reproduce with:

```bash
TOKEN=$(grep '^SANITY_AUTH_TOKEN=' apps/web/.env | cut -d= -f2) && curl -s -H "Authorization: Bearer $TOKEN" "https://poalmzla.api.sanity.io/v2025-02-02/data/query/production?query=%2A%5B_type%3D%3D%22caseStudy%22%5D" | python3 -c "import sys,json,re; [print(d['slug']['current'], json.dumps(d).count('—')) for d in json.load(sys.stdin)['result']]"
```

Nine corpus-level defects, worst first:

1. **54 em dashes** in a register with zero tolerance and no node exemption
   (`write-pipeline-prompt.md` §4 register matrix). Not slips: a house style the import
   carried over intact.
2. **`write-casestudy-prompt.md` Step 2.5 bans `omnichannel enablement` and
   `unified model powering` by name.** `beauty-retail` still contains both verbatim, one as
   an `h3` heading, one as a bullet. The ban list was evidently written from that document.
   This epic's predecessor scope flagged them in June 2026 and they are still live.
3. **All seven use the identical five headings** (Challenge / My Role / Process / Key
   Outcomes / Reflection). No heading in the portfolio carries meaning. A reader who opens
   three gets the same skeleton three times.
4. **16 of 24 outcome tiles have no `valueBefore`.** `beringer` and `prestige-beauty` have
   none across all six of their tiles. A before/after with no before is a status line.
5. **The three most senior engagements are the three with no narrator.** `beauty-retail`
   opens on a headless verb ("Guided a premium beauty retailer's leap") with no subject.
   Case studies are first-person PM (`brand-voice-guide.md` §First Person).
6. **5 of 7 `seo.title` values cut mid-word at exactly 60 characters** (`| Sugarto`,
   `| Sugartown Di`, `Design Sys`). This is the meta title tag.
7. **6 of 7 excerpts are broken:** four open with a heading fragment scraped from the WP
   body, two contain em dashes. The excerpt is both the archive card and the meta
   description.
8. **`relatedTerms` empty on all 8**, and `citations` present on only one (`fx-networks`, 3).
9. **`dateRange` is used inconsistently.** `launching-lunar-landing` spans 2004-11 → 2011-09
   (full Lyris tenure) for a project built in 2011; `beringer` spans the full TWE tenure;
   the rest are engagement-scoped. Nothing can filter or sort on the field as it stands.

**The second half of the problem** is that Sanity and the Resume Factory disagree about the
same engagements. Cross-referenced 2026-08-07 against
`03 RESUME FACTORY/00 PROMPT + PROTOTYPE/Becky-Head_PROTOTYPE_CMS-DesignSystem_2026_r7.docx`
and `Becky-Head_STORY-BANK_Master_2026.md`:

| Engagement | Sanity | Resume r7 / story bank | Conflict |
|---|---|---|---|
| Sephora | `role: Senior Technical Product Manager` | Senior Product Manager | title |
| Sephora | `contractType: contract` | presented as a regular role | contract type |
| FX Networks | `dateRange.startDate: 2021-03-01` | May 2021 – Aug 2021 | start date, and the document's own My Role bullet says "(May 2021 – Aug 2021)", contradicting its own field |
| FX Networks | `employer: Huge / Elephant` | Elephant | employer name |
| Backroads | `role: Product Manager` | Product Manager | matches the field, but the body and `geoSummary` both say "Lead Product Manager" |
| Beringer | `role: Interactive Services Manager` | not on r7 | three titles inside one document (role field, `excerpt`, `geoSummary`) |
| Estée Lauder | Sep 2023 – Dec 2025 | resume r7 agrees; **story bank lines 93–94 say "through 2024"** | story bank is wrong, and it feeds interview answers |
| Estée Lauder | `employer: Lorien`, `contractType: contract` | r7 lists ELC directly, no contract marker | employer / contract type |
| all | `employer` null on 5 of 7 | — | unpopulated |
| StubHub (2019–20) | **no case study** | on r7 | missing |
| Tatcha (2026) | **no case study** | on r7, most recent role, sharpest numbers | missing |

**Blocking upstream, not owned here:**
`03 RESUME FACTORY/00 PROMPT + PROTOTYPE/Story-Library_Module9_CORRECTION-PENDING.md`
(raised 2026-08-04, unresolved) records that story bank module 9 is wrong in two ways about
the Estée Lauder engagement: what ended the Storyblok pilot (an enterprise-wide Shopify
decision, not the headless CMS RFP), and whether the atomic content model's portability was
demonstrated (it was design intent, never tested, because Shopify does not share the data
shape). Both bear directly on the Prestige Beauty rewrite. Phase 0 resolves it or the
Prestige Beauty rebuild does not start.

### Carried forward from the pre-2026-08-07 scope

Retained because the source material and the review notes are still valid:

- **Source notes:** `/Volumes/Angelique/Google Drive Archive 26`. Local external volume;
  confirm it is mounted before Phase 3 begins, and surface to Bex if it is not.
- **Cowork review notes on `beauty-retail` (June 2026), still open:** the commercetools/MACH
  scope decision is a dropped thread (decide: fold in, or spin off as its own case study);
  the design-system POD action item needs one sentence in Key Outcomes connecting it to what
  actually shipped (Calepinage / naming).
- **Keep verbatim:** `beauty-retail`'s closing line, "Content governance isn't glamorous, but
  without it, personalization topples." It is the best sentence in the corpus.
- **Keep and foreground:** the migration utility receipt and the 496-atomic-entries detail.

## Objective

After this epic, all seven legacy case studies read as first-person Bex, carry sourced
receipts with an honest `evidenceType` and a real `valueBefore`, and pass the
`write-casestudy` compliance gate mechanically (zero em dashes, zero banned vocabulary, zero
emoji, no enterprise-deck phrasing). Every engagement fact that appears in both Sanity and
the Resume Factory resolves to one agreed value, recorded in a single canonical place that
both consume, so a recruiter cross-referencing the portfolio against the resume finds no
disagreement.

**Layers touched:** content (Sanity `caseStudy` documents, all 7), tooling (the fact
reconciliation mechanism and its export), docs (the fact register).
**Layers explicitly excluded:** no `caseStudy` schema change, no GROQ change, no React
component change, no CSS, no new design tokens. If Phase 2's chosen mechanism turns out to
need a schema field, that is a spin-off epic, not a scope amendment here.

## Fact litigation register

**This is the epic's centre of gravity. Phase 0 resolves every row before any content is
written.** Each row is a question only Bex can answer; none can be resolved from the repo,
Sanity, or the Resume Factory, because the sources disagree or are silent. No row may be
closed by inference.

### Resolved rows

| # | Answer | Answered |
|---|---|---|
| **P9** | **Sequence at Estée Lauder: (1) Storyblok pilot, (2) CMS RFP, (3) Shopify decision and migration to non-modular Shopify.** The RFP followed the pilot. The Shopify decision came third and ended the composable path. | 2026-08-07, Bex |

**New fact volunteered with the answer, not previously recorded anywhere:** the migration
target was **non-modular Shopify**. This is stronger than the correction doc's framing
("Shopify does not share the data shape") and it settles P10 by a cleaner route: an atomic,
deliberately portable content model could not have carried to a non-modular target, so the
portability claim is untestable in principle here, not merely untested in practice. Frame it
as design intent, never as a demonstrated outcome.

Two sub-questions from `Story-Library_Module9_CORRECTION-PENDING.md` remain open and are
**not** inferable from the ordering above. Do not close them by reasoning from the sequence:

- **P9a** — Did the Storyblok pilot feed the CMS RFP's requirements framework? Resume r7 says
  the RFP "delivered a requirements framework as a foundation for future CMS strategy"; it
  does not say where the requirements came from.
- **P9b** — Was the Shopify decision made independently of the RFP, or did it emerge from it
  and override the shortlist? Story bank #6 says the RFP "was cut short by a leadership
  decision to migrate to Shopify instead", which is consistent with either.

### Cross-cutting policy (decide once, applies to all 7)

| # | Question | Why it blocks | Current state |
|---|---|---|---|
| C1 | Does `dateRange` mean the **engagement window** or the **employment tenure**? | The field is currently both. Until it means one thing, it cannot drive filtering, sorting, or a resume export. | 5 engagement-scoped, 2 tenure-scoped |
| C2 | **Redaction policy:** which clients are named, which redacted, on what rule? | Sephora and ELC are `<Redacted>` while Bare Minerals, Beringer, Backroads, FX and Lyris are named, and resume r7 names all of them openly. | inconsistent |
| C3 | Is `<Redacted>` even holding on the two that use it? | On `prestige-beauty`: the hero asset is `tfb-light-bg.png`, the alt text describes the product, the copy says "The Brand.com pilot", and resume r7 names `tomfordbeauty.com`. Half-redaction has the cost of redaction and none of the benefit. | leaking |
| C4 | What does `employer` hold: the client's own company, or the agency / staffing firm that placed you? | Null on 5 of 7; `Lorien` on one; `Huge / Elephant` on another. Two different conventions already in use. | undefined |
| C5 | Same question for `contractType` — does an agency placement make the engagement `contract` even when the resume presents it as a role? | Affects Sephora and ELC, the two most senior entries. | inconsistent |
| C6 | Direction of truth: does Sanity feed the Resume Factory, the reverse, or do both read a third canonical file? | Determines Phase 2's whole design. See §Technical notes for three options and a recommendation. | undecided |
| C7 | `aiDisclosure`: replace `"Written by human."` (5 docs) with blank per schema convention, or make the literal string canonical and document it? | The convention is blank = fully human-authored. A non-canonical string is a value nothing checks for. | non-canonical |

### Prestige Beauty Pilot (Estée Lauder)

| # | Question | Source of the conflict |
|---|---|---|
| P1 | Is the 3-month deadline a **legal / compliance mandate**, or just the replatform timeline? | Resume r7 confirms "under 3 months" as a timeline. The compliance framing appears nowhere else and is the callout's entire hook. |
| P2 | Where does "30k lines of legacy Drupal code" come from? | No source found. Flagged `evidenceType: measured`; its own impactStatement says "typical", which is an estimate. |
| P3 | "20+ brands" or "5+ flagship brands", and what does each count? | Resume r7 and story bank #2 both say 5+ flagship. 20+ may be the ELC corporate portfolio, but reads as the pilot's target. |
| P4 | Post-pilot retooling: **budgeted only, or budgeted and executed?** | FAQ Q3 says "budgeted and executed". The Overview says it "required dedicated re-architecture efforts post-pilot". One is wrong. |
| P5 | Does the **9–12 month organisational average** go on a public page? | On resume r7 twice. It is the strongest receipt in the engagement and is currently absent from the case study entirely. |
| P6 | Does the **Shopify aftermath** go in? | An enterprise-wide decision moved the portfolio to Shopify, ending the composable path (Module 9 correction doc). As published, "validated as a replicable template" implies a template that went on to be used. |
| P7 | Are `in-house ecommerce` and `PIM` genuinely part of the stack? | Asserted in `aeoSummary` and `geoSummary`; the body never mentions either. These are the fields AI answer engines quote. |
| P8 | Is "Parallel stacks (Liquid vs. Elixir/Phoenix)" accurate as written? | Liquid is Shopify's template language, which sits oddly in a headless-CMS pilot. Either it needs a clause of explanation or it is wrong. |
| ~~P9~~ | **Answered 2026-08-07.** See §Resolved rows. | — |
| P9a | Did the Storyblok pilot feed the CMS RFP's requirements framework? | Open. Not inferable from the sequence. |
| P9b | Was the Shopify decision independent of the RFP, or did it override the shortlist? | Open. Story bank #6's "cut short by a leadership decision" is consistent with either. |
| P10 | Confirm the guardrail holds: the content model's portability is **design intent, never demonstrated**. | Settled by the non-modular Shopify fact (see §Resolved rows), but confirm the wording before it is written. |

### Beauty Retail (Sephora)

| # | Question | Source of the conflict |
|---|---|---|
| S1 | `Senior Technical Product Manager` or `Senior Product Manager`? | Sanity vs resume r7. |
| S2 | Was Sephora a contract engagement? | `contractType: contract` in Sanity; r7 presents it as a role and marks only Tatcha "(Contract)". |
| S3 | Migration utility receipt: "hundreds of hours → under 2 hours", or "months → hours"? | Case study says the first, resume r7 and story bank #4 say the second. Both may describe different measures. |
| S4 | commercetools / MACH: fold into this case study, or spin off? | Carried forward, still open since June 2026. |
| S5 | Design-system POD: what actually shipped against that action item? | Carried forward, still open. |
| S6 | Is 496 atomic entries still the hero number? | Currently a tile, `measured`, and the best receipt in the corpus. Confirming it stays first. |

### FX Networks

| # | Question | Source of the conflict |
|---|---|---|
| F1 | Start date: **March or May 2021?** | `dateRange.startDate: 2021-03-01` vs resume r7 "May 2021" vs the document's own My Role bullet "(May 2021 – Aug 2021)". Three values, two of them inside the same document. |
| F2 | Four-month or five-month window? | The copy says "four-month contract window" and the tile says "4 months"; the `dateRange` as stored spans five. Falls out of F1. |
| F3 | Webby category: **Entertainment** or **Television, Film & Streaming**? | `aeoSummary`/`geoSummary`/tile say Entertainment; the `excerpt` says Television, Film & Streaming. |
| F4 | `employer`: "Huge / Elephant" or "Elephant"? | Sanity vs resume r7. |

### Backroads

| # | Question | Source of the conflict |
|---|---|---|
| B1 | `Product Manager` or `Lead Product Manager`? | The `role` field says the first; the Overview body and `geoSummary` both say the second. |
| B2 | Does the pre-RFI discovery detail go in? | Story bank #6 has nine guest-lifecycle stages, a formal Guest Content Audit, personas and competitor analysis. None of it is in the case study, and it is the part that makes the "discovery revealed the real problem" hook land. |

### Beringer (Treasury Wine Estates)

| # | Question | Source of the conflict |
|---|---|---|
| T1 | Canonical title: `Interactive Services Manager`, `Digital Project Manager`, or both? | All three forms appear in this one document (role field, excerpt, geoSummary). |
| T2 | Engagement window for the Beringer redesign specifically? | `dateRange` currently spans the whole TWE tenure. Falls out of C1. |

### Launching Lunar Landing (Lyris)

| # | Question | Source of the conflict |
|---|---|---|
| L1 | Engagement window for Lunar Launch Pad specifically? | `dateRange` spans 2004-11 → 2011-09 (whole tenure) for a 2011 project. Falls out of C1. |
| L2 | Lyris management era end: 2011 or 2012? | Sanity `endDate: 2011-09-01`; story bank says Lyris 2008–2012. |
| L3 | Are the **Cathy Sullivan testimonial quotes cleared for publication**? | Three direct quotes, attributed by name and title. They are the only third-party social proof on the site and the best material in the corpus. Also confirm the wording is verbatim. |

### Bare Minerals

| # | Question | Source of the conflict |
|---|---|---|
| M1 | Source for "40% productivity increase" and "8 weeks → 5 weeks"? | Both flagged `measured`; neither appears on resume r7 or in the story bank. |
| M2 | Should Bare Minerals be on resume r7 at all? | Currently in the older-roles reference only, while carrying the corpus's cleanest measured receipts. |

## The template is the defect

Added 2026-08-07, after the red-pen review's finding that all seven case studies carry the
identical five headings (Challenge / My Role / Process / Key Outcomes / Reflection).

**That finding was aimed at the wrong target.** `docs/write-casestudy-prompt.md` Step 2 says,
verbatim:

> All 7 live case studies follow one canonical section order (this is also the SUG-207
> north-star template). Use it — do not invent a new shape

and then prescribes those exact five headings. The seven documents are not failing the
standard. They comply with it. SUG-207 took the shape of the WordPress imports, named it the
north star, and the skill locked it in, so every future case study would reproduce it.

Two consequences for this epic:

1. **The north star has to be rewritten before any case study is.** Rewriting seven documents
   against the standard that caused the problem reproduces the problem seven times.
2. **These are from-scratch rewrites, not patches.** A patch keeps the heading skeleton, and
   the heading skeleton is the defect. The surviving material is the facts (once Phase 0
   settles them), the artifacts, the Cathy Sullivan testimonials if cleared, and a small
   number of sentences named in §Carried forward.

The fix splits the **fixed schema contract** (section order, which drives the FAQPage
JSON-LD, the archive card, and the metadata rail) from the **variable narrative surface**
(headings, beat order, weight). The previous standard fixed both.

## Scope

- [ ] **Phase 0 — resolve the fact litigation register.** Every row above answered by Bex and
      recorded in the register with its answer and date. No content written until it is
      clean. Layer: docs
- [ ] **Resolve the Module 9 correction upstream** (P9, P10) and apply the fix to the story
      bank master, the reader HTML, and the `sugartown-resume-tailor` skill bundle per
      `Skill-Update_Workflow.md`. Layer: Resume Factory (outside this repo)
- [ ] **Write the case study north star and unfix the heading template.** Blocks every
      rewrite below. See §The template is the defect. Layer: docs
- [ ] **Write down the cross-cutting field policy** (C1–C7) as a short convention doc, so the
      next case study written does not re-litigate it. Layer: docs
- [ ] **Metadata and retrieval field sweep across all 7** — 6 broken excerpts, 5 truncated
      `seo.title` values, `aiDisclosure`, and the `role` / `employer` / `contractType` /
      `dateRange` values settled in Phase 0. Content Write Gate fires. Layer: content
- [ ] **Build the Studio ↔ Resume Factory fact reconciliation** per the C6 decision. Layer:
      tooling
- [ ] **Rewrite `prestige-beauty` and `beauty-retail` from scratch** against the north star.
      Layer: content
- [ ] **Rewrite `fx-networks`, `backroads`, `bare-minerals` from scratch.** Layer: content
- [ ] **Rewrite `beringer`, `launching-lunar-landing` from scratch.** Layer: content
- [ ] **Retrieval and linking pass across all 7** — rewrite `aeoSummary` / `geoSummary` /
      `excerpt` against the resolved facts, populate `relatedTerms`, fill `related` on the
      four documents that have none. Layer: content
- [ ] **`/red-pen` each rebuilt document** before it is proposed for publish. Layer:
      editorial QA

### User-story decomposition

Ten Scope items and numbered phases, so this decomposes into user-story sub-issues per
`docs/conventions/user-story-conventions.md`. One sub-issue per Scope item, parented to
SUG-187. The epic doc stays authoritative on conflict.

**The Linear workspace hit its free issue limit on 2026-08-07 after two sub-issues.** The two
that exist are the blocking ones; the remaining eight are recorded here and created when the
workspace allows. Do not treat their absence from Linear as a scope reduction.

| Scope item | Sub-issue | State |
|---|---|---|
| Resolve the fact litigation register (Phase 0 hard stop) | [SUG-278](https://linear.app/sugartown/issue/SUG-278) | created |
| Resolve the Module 9 correction upstream | [SUG-279](https://linear.app/sugartown/issue/SUG-279) | created |
| **Write the case study north star and unfix the heading template** | — | **blocked on Linear issue limit.** Blocks every rewrite below |
| Case-study engagement-fact field policy convention | — | blocked on Linear issue limit |
| Metadata and retrieval field sweep across all 7 | — | blocked on Linear issue limit |
| Studio ↔ Resume Factory fact reconciliation | — | blocked on Linear issue limit |
| Rewrite `prestige-beauty` + `beauty-retail` from scratch | — | blocked on Linear issue limit |
| Rewrite `fx-networks` + `backroads` + `bare-minerals` from scratch | — | blocked on Linear issue limit |
| Rewrite `beringer` + `launching-lunar-landing` from scratch | — | blocked on Linear issue limit |
| Retrieval and linking pass across all 7 | — | blocked on Linear issue limit |
| `/red-pen` each rewritten document | — | blocked on Linear issue limit |

## Phases

Single close-out: all phases accumulate on one feature branch and merge once. The work is
Sanity content, not code, so the deploy-triggering pushes that make merge-as-you-go worth its
overhead barely apply here. Push the feature branch at every checkpoint anyway — branch
pushes do not trigger Netlify deploys and are therefore free, and content drafts that exist
only on one disk are one hardware failure from gone.

**Do not run `/mini-release` until the branch is merged to `main`.** One mini-release at the
end, from `main`.

| Phase | Ships | Gate |
|---|---|---|
| **0** | Fact register fully answered; field-policy convention doc; Module 9 correction applied upstream | **Hard stop.** No Sanity write of any kind until every register row is closed |
| **0b** | `case-study-north-star.md`; `write-casestudy-prompt.md` Step 2 unfixed | **Hard stop.** Instruction & Rule File Write Gate. No rewrite starts before this lands |
| **1** | Metadata and retrieval field sweep across all 7 (`excerpt`, `seo.title`, `aiDisclosure`, `role`, `employer`, `contractType`, `dateRange`) | Content Write Gate proposal per document |
| **2** | Fact reconciliation mechanism built and both sides agreeing | Verification review if it lands as a validator (see §Technical notes) |
| **3** | `prestige-beauty` + `beauty-retail` rewritten from scratch | Content Write Gate, then `/red-pen`, then Bex publishes |
| **4** | `fx-networks` + `backroads` + `bare-minerals` rewritten from scratch | same |
| **5** | `beringer` + `launching-lunar-landing` rewritten from scratch | same |
| **6** | Retrieval and linking pass across all 7 | Content Write Gate |

**Phase 0b is a hard stop for the reason in §The template is the defect:** rewriting seven
documents against the standard that produced the problem reproduces it seven times.

**Phase 1 narrowed on 2026-08-07 to metadata and retrieval fields only.** The original phase
included a body-level sweep of 54 em dashes, 7 emoji and the banned vocabulary. From-scratch
rewrites make that sweep wasted work, since none of that body copy survives. The fields in
Phase 1 are the ones a narrative rewrite does not touch, and they sit live on the archive and
in search results for however long the rewrites take. The corpus-wide acceptance criteria
(zero em dashes, zero emoji, zero banned vocabulary) still hold, measured at close-out
against the rewritten documents.

## Acceptance criteria

- [ ] Every row of the fact litigation register carries an answer and a date. Zero rows
      resolved by inference; any row Bex cannot answer is marked `unresolved` and the claim
      it governs is cut from the copy rather than published unsourced
- [ ] `grep`-equivalent count of `—` across all `caseStudy` section content returns **0**
      (`Title — Subtitle` in `title` / `seo.title` excepted), measured by re-running the
      Background command
- [ ] Zero emoji in any `caseStudy` field
- [ ] Zero hits against the `write-pipeline-prompt.md` §4 banned list and the
      `write-casestudy-prompt.md` Step 2.5 enterprise-deck list, both measured by re-running
      the Background command
- [ ] Every outcome tile has either a `valueBefore` or an `evidenceType` of `qualitative`.
      No tile claims `measured` without a named source in the register
- [ ] `docs/conventions/case-study-north-star.md` exists, and `write-casestudy-prompt.md`
      Step 2 no longer prescribes a heading set
- [ ] **No two of the seven share a narrative heading**, and each document's heading set
      passes the north star's heading test read against the other six
- [ ] Every rewritten narrative does all five jobs (stakes, judgment, mechanism, receipts,
      candour), and none of them contains a "My Role" responsibilities list
- [ ] Every rewritten document contains at least one first-person sentence attributable to
      Bex directing, deciding, or aligning, and no headless-verb sentence openers
- [ ] No two of {Sanity `caseStudy`, resume r7 prototypes, story bank master} disagree on any
      role title, date, employer, or contract type. Verified by running the Phase 2 mechanism
      and getting zero diffs
- [ ] All 7 `excerpt` values are hand-written, lead with the strongest receipt, and contain
      no heading fragment or em dash
- [ ] All 7 `seo.title` values are complete words within the character limit
- [ ] `semantic: "faq"` still set on all 7 accordions after the rebuild (regression guard —
      losing it silently drops the FAQPage JSON-LD)
- [ ] **Content Write Gate:** a before/after proposal table shown and approved before every
      Sanity patch, per document
- [ ] **Human-Publishes Rule:** every document left as a draft. Publishing is Bex's separate,
      explicit instruction, never inferred from approval of the copy
- [ ] Each rebuilt document passes a `/red-pen` review with zero Accuracy-tier findings before
      it is proposed for publish

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This is a
content-only epic against existing, already-reviewed section types.

Spot-check each rebuilt document at `http://localhost:5173`:

- `/case-studies/prestige-beauty-pilot-headless-cms-enterprise-design-system`
- `/case-studies/beauty-retail-from-monolith-to-microservice`
- `/case-studies/fx-networks-website-redesign-nominated-for-webby`
- `/case-studies/charting-a-new-course-for-backroads-com`
- `/case-studies/bare-minerals-from-bottlenecks-to-brilliance`
- `/case-studies/beringer-com-raising-a-glass-to-a-digital-refresh`
- `/case-studies/launching-lunar-landing`
- `/case-studies` (archive — regression guard on the rewritten excerpts)

## Technical notes

- **Phase 0 (visual spec gate) does not fire.** No new visual format. The rebuild uses
  section types already shipped and reviewed (`imageGallery`, `tableBlock` inside
  `textSection`, `cardSection`). Decision recorded here per CLAUDE.md §Phase 0 hard-stop.
- **Content Write Gate fires on every phase from 1 onward.** The copy is derived from
  interpretation of source notes, not dictated word-for-word, and Phase 1 removes content
  (emoji, bullets). Before/after table per document, per CLAUDE.md.
- **Human-Publishes Rule.** These are live pages. Write to `drafts.<id>`, never patch the
  published document directly, and never publish. **Six of the seven currently have no draft**
  (checked 2026-08-07); creating one is the correct move, not a workaround.
- **`/write-casestudy` is the standard**, not a suggestion: canonical section order, `h3` for
  Overview subsections (all 7 currently use `h2` nested under a section heading, which is a
  real heading-hierarchy defect for screen readers), `imageGallery` as its own section
  (`prestige-beauty` is missing it entirely; `backroads` and `fx-networks` carry raw
  `htmlSection` blocks from the import that need assessing).
- **Portable Text mechanics.** Every block needs `markDefs: []`, every span needs `marks: []`,
  or the block renders read-only in Studio. Re-fetch the live document immediately before any
  `set` on a PT array — `_key` values do not reliably survive prior patches, and a human
  Studio edit found in place of expected content means ask, do not overwrite.
- **Instruction & Rule File Write Gate fires on three files:**
  `docs/conventions/case-study-north-star.md` (new), the field-policy convention (new), and
  `docs/write-casestudy-prompt.md` (Step 2 edit). Produce each diff from a scratchpad copy,
  not by editing in place and reverting, and get explicit approval before any of them lands.
  No other Scope item in this epic touches a rule-defining file.
- **Doc budget.** A file in `docs/conventions/` counts against `pnpm validate:doc-budget`
  only when CLAUDE.md references it. The north star is referenced from
  `write-casestudy-prompt.md`, not CLAUDE.md, so it does not load into every session and does
  not consume budget. Keep it that way; if a reference is added to CLAUDE.md later, re-run
  the budget check in the same commit.
- **`/write-casestudy` was written from the imported documents, not against them.** Treat
  every other instruction in it as suspect until checked the same way the heading list was.
  Worth a deliberate pass during Phase 0b rather than trusting it by default.
- **Live-site read gap, discovered 2026-08-07.** An unauthenticated query of
  `*[_type=="caseStudy"]` returns **1 of 8 documents** — only the native
  `sugartown-platform-is-the-portfolio`. The seven `wp.caseStudy.NNN` dotted IDs are
  invisible to anonymous reads, which is exactly the defect
  [SUG-260](SUG-260-migrate-wp-dotted-document-ids.md) describes ("133 docs invisible to
  anonymous reads"). Every measurement in this epic must be taken with `SANITY_AUTH_TOKEN`
  set, or it silently undercounts to near-zero. This is also independent evidence for
  SUG-260's severity, reproduced live rather than inferred.
- **Verification review (conditional).** If Phase 2 lands as a validator (e.g.
  `pnpm validate:engagement-facts`), it is a control: the `verification-reviewer` subagent is
  blocking and a `CTL-NNN` row in `docs/ai/agentic-caucus/control-register.md` is required
  before it is built. If Phase 2 lands as a plain export with no failing check, it is not a
  control and no register row applies. Decide in Phase 2, record which.
- **Upstream dependency, not blocking:** [SUG-260](docs/backlog/SUG-260-migrate-wp-dotted-document-ids.md)
  migrates the `wp.caseStudy.NNN` dotted document IDs. It touches the same seven documents. If
  SUG-260 runs first, every ID in this epic changes. Sequence them at activation; do not run
  both concurrently.
- **Source notes:** `/Volumes/Angelique/Google Drive Archive 26`. Confirm mounted before
  Phase 3; surface to Bex if not.
- **Resume Factory paths** (second working directory, outside this repo):
  - `00 PROMPT + PROTOTYPE/Becky-Head_PROTOTYPE_CMS-DesignSystem_2026_r7.docx` and the five
    sibling prototypes
  - `00 PROMPT + PROTOTYPE/Becky-Head_STORY-BANK_Master_2026.md` (master) and
    `Becky-Head_STORY-BANK_Reader_2026.html` (generated from it)
  - `00 PROMPT + PROTOTYPE/Story-Library_Module9_CORRECTION-PENDING.md` (blocking, P9/P10)
  - `.claude/skills/sugartown-resume-tailor/references/story-library.md` (ships as a
    re-uploaded bundle per `Skill-Update_Workflow.md`, not editable in session)
- **Activation audit:** re-run the Background measurement command on the day Phase 1 starts
  and act on that day's output, not the table above. Do not copy these figures forward.
- **Activation audit:** read `apps/studio/schemas/documents/caseStudy.ts` and confirm the
  field list before writing, per `write-pipeline-prompt.md` §2. Deprecated fields that must
  never be written: `challengeSummary`, `outcomes[]`, `keyQuestions[]`, `cardImage`,
  `relatedProjects`.

### C6 — fact reconciliation mechanism, three options

Decide in Phase 0; build in Phase 2. Recommendation: **option 2**.

| Option | Shape | For | Against |
|---|---|---|---|
| 1. Sanity is canonical | Resume Factory reads an exported JSON of engagement facts from Sanity | One editing surface, already has Studio validation | The resume prototypes are `.docx`; nothing there can consume JSON without a build step Bex does not want |
| **2. A third canonical file** | `engagement-facts.json` (or YAML) in this repo, one entry per engagement. Sanity documents and the resume prototypes are both checked against it | Neither side wins by accident; the file is diffable, reviewable, and lives in git; a check can fail on drift | One more artifact to keep current |
| 3. Resume Factory is canonical | Sanity is patched from the resume prototypes | The resume is the most-updated artifact (r7/r8/r9) | Extracting facts from `.docx` is brittle, and the story bank is already demonstrably wrong (ELC "through 2024") |

## Model & Mode [REQUIRED]

`/model opus` with plan mode (Shift+Tab) for Phase 0 and Phase 2. Phase 0 is judgment under
conflicting sources across two repositories, and Phase 2 is a design decision with three
viable shapes. Exit plan mode to execute Phases 1 and 3–6, which are content work Sonnet
handles directly once the facts are settled.

## Non-Goals

- **No `caseStudy` schema change.** If Phase 2 needs a field, that is a spin-off epic.
- **No GROQ, React, CSS, or design-token change.** Content and tooling only.
- **No new case studies.** StubHub (Mar 2019 – Mar 2020, CMS RFP and API-first Drupal 8) and
  Tatcha (Jan – Feb 2026, Shopify migration, 500+ test cases triaged to 51 in 3 weeks) are
  both on resume r7 with no case study, and Tatcha is the most recent role with the sharpest
  numbers in the story bank. That is `/write-casestudy` authoring, not a rebuild, and it is a
  different job. **Spin off via `/new-epic` at close-out** per CLAUDE.md §Scope creep — file
  it, do not fold it in.
- **No changes to `sugartown-platform-is-the-portfolio`.** It is the native, already-reviewed
  control and it stays the reference implementation.
- **No rewriting of historical narrative** in `docs/shipped/` or `docs/reviews/`.
- **No publishing.** Every document ends this epic as a draft awaiting Bex.

## Related

- **Linear:** [SUG-187](https://linear.app/sugartown/issue/SUG-187)
- **Red-pen review that triggered the widening:** [2026-08-07-prestige-beauty-pilot.md](../reviews/red-pen/2026-08-07-prestige-beauty-pilot.md) — 26 findings, all `pending`
- **Prior red-pen on the control document:** [2026-07-16-sugartown-platform-is-the-portfolio.md](../reviews/red-pen/2026-07-16-sugartown-platform-is-the-portfolio.md)
- **Standard:** `docs/write-casestudy-prompt.md` · `docs/write-pipeline-prompt.md`
- **Voice:** `docs/brand/brand-voice-guide.md` · `docs/brand/master-voice-cheatsheet.md`
- **Sequencing:** SUG-260 (dotted document ID migration, same 7 documents)
- **Upstream history:** SUG-90 (consulting pivot editorial pass), SUG-95 (Sanity AI Assist POC)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer
  Checklist, Schema Enum Audit, and Files to Modify at activation
