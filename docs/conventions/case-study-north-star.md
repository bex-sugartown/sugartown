# Case Study North Star

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Approved:** 2026-08-07
**Related:** `docs/write-casestudy-prompt.md`, `docs/brand/brand-voice-guide.md`,
`docs/conventions/instruction-writing-style.md`

How to shape a Sugartown case study. `write-casestudy-prompt.md` covers the mechanics: the
schema fields, the gates, the write sequence. This covers the shape, which is the part that
was previously copied from a WordPress template and is the reason all seven legacy case
studies read identically.

---

## The contract is fixed. The surface is not.

Two layers, and only one of them is the same every time.

**Fixed, because machines read it.** The section types and their order drive the FAQPage
JSON-LD, the archive card, the metadata rail, and the retrieval fields. Do not vary these.

| Order | Section type | Job |
|---|---|---|
| 1 | `heroSection` | `eyebrow: "Case Study"`, title, subtitle |
| 2 | `calloutSection` | the challenge, one paragraph, written to stand alone |
| 3 | `cardSection` | 3 to 4 `outcomeItem` tiles, strongest first |
| 4 | `textSection` | the narrative |
| 5 | `imageGallery` | only if real artifacts exist |
| 6 | `accordionSection` | `semantic: "faq"`, 3 to 4 questions, third person |

**Variable, because humans read it.** Everything inside the narrative `textSection`: how many
beats, what order, what weight, and above all what the headings say. This is where each case
study earns its own shape.

The previous standard fixed both layers. That is what produced seven documents with the same
five headings.

---

## The five jobs a narrative must do

Every case study delivers these, under whatever headings suit the engagement. The jobs are
the requirement; the headings are the writing.

| Job | The question it answers | Fails when |
|---|---|---|
| **Stakes** | What was breaking, and what was it costing? | Named as a technical condition with no business cost attached |
| **Judgment** | What did I decide that someone else would have got wrong? | Replaced by a list of responsibilities |
| **Mechanism** | How did the work actually go? | Compressed to four fragments while the reader wanted this part |
| **Receipts** | What changed, with numbers and a source | Adjectives standing in for figures |
| **Candour** | What would I do differently, or what did the deadline cost? | Spent on summary instead of hindsight |

**"My Role" is not one of the jobs.** A bulleted responsibilities list tells the reader what
the job title was, which they already read in the metadata rail. Judgment is what they came
for: the call that was contested, the debt that was named out loud, the scope that was
widened against the brief. If a case study has no judgment beat, it is a project description.

---

## Headings

Write the heading last, after the beat it labels exists.

Three rules:

1. **A heading carries a noun or verb from this engagement**, not from the template. "Three
   Tiers, One Hierarchy" belongs to exactly one case study. "Process" belongs to all of them.
2. **A heading states the turn, not the topic.** "What Discovery Actually Found" beats
   "Discovery".
3. **Headings are not required to be parallel across case studies.** They are required to be
   parallel within one.

**The test.** Cover the body. Read only the headings. If that heading set could sit on top of
a different case study in the portfolio without anyone noticing, rewrite it. Run the test
against the other published case studies, not against an abstraction.

---

## Engagement archetypes

An engagement's shape follows what kind of work it was. These six cover the portfolio. Pick
one, or say why none fits.

| Archetype | Beat order that usually works | Where the weight goes |
|---|---|---|
| **Replatform / migration** | stakes → the platform call → the model → migration mechanics → receipts → what the timeline cost | The model and the migration mechanics. This is the archetype most likely to run long, and Process detail pays first |
| **Constrained refresh** | why a replatform was off the table → what was possible inside the constraint → what shipped → the roadmap left behind | The constraint. A refresh case study with no named constraint is a redesign case study, and weaker |
| **Ops turnaround** | throughput problem → what the audit found → the process change → the numbers | The numbers, which in this archetype are usually the cleanest ones available |
| **Internal tool build** | who was blocked → what was built → who used it and how → what it changed | Adoption. A tool nobody used is not an outcome |
| **Fixed-date delivery** | the immovable date and why → what was cut and how it was decided → what shipped → what the compression cost | The triage. What was cut is more interesting than what shipped |
| **Platform evaluation** | the decision the org was facing → how the field was narrowed → the call and its reasoning → what happened next | The reasoning. An evaluation that only names the winner teaches nothing |

An engagement can be two archetypes. Say which one leads, and let the second one be a beat
rather than a second spine.

---

## Receipts

Every `outcomeItem` tile:

- Carries a `valueBefore`, or is honestly marked `evidenceType: qualitative`. A before/after
  with no before is a status line.
- Marked `measured` only when a named source exists. Record the source in the epic doc or
  the fact register, not in the tile.
- Marked `estimated` when the figure is a reasonable reconstruction. This is not a weaker
  claim, it is a more honest one.

**Do not narrate the tile numbers again in prose.** The tiles are the table. A paragraph
walking the reader across the same figures is the show-don't-tell defect
(`brand-voice-guide.md` Do This / Not This, final row).

**A comparison across two or more options along two or more dimensions is a `tableBlock`**,
not a paragraph. A pipeline or architecture described in sentence form is a candidate for
`mermaidSection`.

---

## Skim skeleton

Before the compliance gate, extract and read alone: the title, the challenge callout, the
three tile labels, every narrative heading, and the last sentence.

Ask of the skeleton, not of the case study: can a reader who sees only this reconstruct what
happened and why it mattered? If the strongest fact in the engagement is not visible in the
skeleton, it is in the wrong place.

---

## Length

The narrative band is 500 to 1,200 words. Under 500 usually means a skeleton of fragments
rather than a tight case study; check for that before congratulating yourself on brevity.

When it runs over, mechanism detail pays first. Stakes, receipts, and candour are never the
cut.

---

## Worked heading sets

Candidate heading sets for the portfolio, showing the archetype and the shape. **These are
proposals, not approved copy.** Every one depends on facts still open in SUG-187's Fact
Litigation Register, and none may be written until those rows close.

| Case study | Archetype | Candidate headings |
|---|---|---|
| Prestige Beauty Pilot | Fixed-date delivery | The Compliance Clock · Three Tiers Collapsed Into One · What We Signed For Before Launch · What The Quarter Cost |
| Beauty Retail | Replatform / migration | Why The Monolith Had To Go · Attributes, Components, Modules, Views · 496 Entries On One Page · The Utility Nobody Asked For |
| FX Networks | Fixed-date delivery | Four Months, No Extension · Running MoSCoW Three Times · Accessibility As A Gate, Not A Review |
| Backroads | Replatform / migration | They Asked For A Website · What Nine Lifecycle Stages Showed · Widening The Brief · Print And Digital, One Source |
| Bare Minerals | Ops turnaround | A Redesign, A Relocation, And BAU · Where The Eight Weeks Went · Ways Of Working |
| Beringer | Constrained refresh | Seven Years On One Platform · Designing Around The Backend · The Roadmap Left Behind |
| Launching Lunar Landing | Internal tool build | Hundreds Of Pages A Week · The Tiger Team · What Marketing Did With It |

Read them as a set. That is the test in the Headings section, applied.

---

## Changelog

### v1.0

- Split the fixed schema contract from the variable narrative surface. The previous standard
  (`write-casestudy-prompt.md` Step 2, "one canonical section order... do not invent a new
  shape") fixed both, which is why all seven legacy case studies carry the identical five
  headings Challenge / My Role / Process / Key Outcomes / Reflection.
- Replaced the fixed heading list with the five jobs, the heading test, and six engagement
  archetypes.
- Retired "My Role" as a required beat, in favour of judgment.
