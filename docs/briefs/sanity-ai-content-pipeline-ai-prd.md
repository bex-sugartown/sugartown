# Sanity AI content pipeline: AI PRD

| Field | Value |
|---|---|
| Status | Draft |
| Date | 2026-11-10 |
| Owner | Bex |
| Issue | [#219](https://github.com/bex-sugartown/sugartown/issues/219) |
| Human PRD | None. See Assumptions. |
| Review date | 2027-02-10 |

## Assumptions standing in for the human PRD

| Assumption | Why it holds | Flag if wrong |
|---|---|---|
| Governance outranks convenience: a governance criterion is pass/fail, UX is scored | Stated by Bex on 2026-11-10; `docs/briefs/ai-ethics-and-operations.md` §6, §7, §8 | Yes |
| Editors work in Studio, not in a terminal | `../conventions/human-instruction-style.md` | Yes |
| The AI drafts into a Sanity draft and a human publishes | CLAUDE.md §The Human-Publishes Rule | No (Tier 1) |
| This is a decision-and-POC, not a rollout. A no-go is a valid result | SUG-95 backed out `@sanity/assist` once already | Yes |
| The site does not change visually | POC touches Studio config and schema options only | Yes |

## Why this exists

SUG-95 installed `@sanity/assist`, then removed it after a document-context injection bug.
`docs/conventions/ai-assist-conventions.md` records the plugin as uninstalled and classes
`excerpt` as Tier 3 (human only). Since then Sanity ships: Agent Actions `image-description`
(alt text), custom field actions in AI Assist, Content Agent with a Confirm step, AI credit
spending limits, and Workflows (early access). The decision is re-made on current facts.

**Size of the gap, measured 2026-11-10** (published perspective, project `poalmzla`):

| Fact | Value | Command |
|---|---|---|
| Articles / case studies / nodes | 17 / 8 / 52 | `count(*[_type==X])` |
| Missing excerpt (article / case study / node) | 0 / 0 / 2 | `count(*[_type==X && (!defined(excerpt) \|\| excerpt=="")])` |
| Empty alt strings | 0 | `count(*[defined(alt) && alt==""])` |
| Image assets | 187 | `count(*[_type=="sanity.imageAsset"])` |

**There is almost no backfill to do.** The POC value is authoring-time speed and quality,
and the governance pattern it proves for later fields. Alt is already required by schema
(`richImage.ts`, `galleryImage.ts`), so AI drafts a value the editor must still supply.

## 2. Agent context

| Path | Why | Verified |
|---|---|---|
| `docs/conventions/ai-assist-conventions.md` | Field tiers, exclude pattern, human-in-the-loop flows, plugin status | `ls`, 2026-11-10 |
| `docs/shipped/zArchive/2026/SUG-95-sanity-ai-assist-poc-case-study-fields.md` | The first attempt: scope, plan gating, free-plan backup | `ls`, 2026-11-10 |
| `docs/briefs/ai-ethics-and-operations.md` | Principles 6, 7, 8, 13 (judgment, fail softly, governance, labelling) | `ls`, 2026-11-10 |
| `apps/studio/sanity.config.ts` | Plugin list; no `assist` today | `grep`, 2026-11-10 |
| `apps/studio/schemas/objects/richImage.ts`, `galleryImage.ts`, `media.ts` | Alt fields: `string`, required, soft max 125 | `ls`, 2026-11-10 |
| `apps/studio/schemas/documents/article.ts`, `node.ts`, `caseStudy.ts` | `excerpt` (`text`, soft max 300); `aiDisclosure` on article and node | `grep`, 2026-11-10 |
| `.claude/rules/sanity-schema.md` | Schema rules, loads on schema read | `ls`, 2026-11-10 |
| `docs/brand/brand-voice-guide.md` | Anti-slop checks that excerpt output must pass | `ls`, 2026-11-10 |
| `docs/conventions/human-gate-conventions.md` | Gate tiers this work hits | `ls`, 2026-11-10 |
| `docs/briefs/axe-link-coverage-ai-prd.md` | Worked example of this document's format | `ls`, 2026-11-10 |

Rules apply from CLAUDE.md §Content Write Gate, §The Human-Publishes Rule, §Instruction &
Rule File Write Gate and §Building a mechanism. Not restated here.

## 3. Option map

Six routes to AI-assisted fields. Cells are claims from Sanity docs (URLs in §4), not test
results, until a POC row says otherwise.

| # | Option | Where the editor meets it | Human gate before write | Instruction lives in | Cost | Maturity |
|---|---|---|---|---|---|---|
| A | AI Assist plugin (`@sanity/assist`), `imageDescriptionField` | Sparkle on the field in Studio | Editor reads value in the field, then saves | Studio "AI Context" documents (content, per dataset) | Growth plan; Agent Action credits | GA. Backed out once (SUG-95) |
| B | AI Assist custom field actions calling Agent Actions `transform` / `generate` | Field action menu in Studio | Same as A; Agent Actions write to a draft, not published, unless `forcePublishedWrite` is set | Repo code (`sanity.config.ts`), versioned | 1 AI credit per request | GA plugin; Agent Actions need API `vX` (experimental) |
| C | Content Agent (Dashboard) | Chat panel, outside the document | Proposed changes sit in a Changes tab until Confirm; Confirm makes drafts or a content release; never publishes, never deletes | Org and user "custom instructions", 5 each, guidance only | 4 credits per message + 2 per tool run | GA |
| D | Sanity Function on a document event calling Agent Actions | None. Runs in the background | None unless built in. Writes a draft with no one watching | Repo code | 1 credit per request + Function runtime | GA, but ungated by default |
| E | Workflows (AI content pipeline cookbook) | Stage and approve actions | Explicit "Human verification" stage; automated checks route flagged work to a person | Repo code | Agent Action credits + runtime you host | Early access, pre-1.0. Engine checks are advisory; guards not enforced |
| F | Baseline: Claude Code + MCP `patch_documents` | Terminal | Content Write Gate before/after table, then Human-Publishes Rule | CLAUDE.md and skills | Claude usage | In use today |

**Working hypothesis, to be confirmed or killed by the POC:** B is the strongest candidate
(in-context for the editor, instruction under version control, draft-only writes). A is the
low-effort control. C suits audits and bulk backfill, not authoring. D and E are desk
research only: D has no human gate by default, E is pre-1.0.

## 3a. Criteria

Governance criteria are gates: an option that fails one is out, whatever its UX score.

| ID | Governance gate | Passes when |
|---|---|---|
| G1 | Human gate | A person sees the proposed value before it lands in a draft, or can discard the draft |
| G2 | Never publishes | The tool cannot publish; verified by test, not by docs alone |
| G3 | Provenance | Someone can tell which field values an AI drafted, and which instruction produced them |
| G4 | Spend control | An organisation cap exists and the tool stops at it |
| G5 | Scope control | Tier 1 fields (`ai-assist-conventions.md`) can be excluded and the exclusion holds |
| G6 | Reversible | A bad run is undone from Studio document history |
| G7 | Data terms | Sub-processors and retention are known and acceptable |
| G8 | Removable | Uninstalling leaves no stray documents, tokens or dependencies |

| ID | UX criterion (scored 0 to 2) | 2 means |
|---|---|---|
| U1 | In context | The action sits on the field being edited |
| U2 | Clicks | One click to a draft value |
| U3 | Visible instruction | The editor can see what the AI was told |
| U4 | Edit in place | Output lands in the real field, not a side panel |
| U5 | Failure is legible | A timeout or refusal says so in plain words |
| U6 | No terminal | Nothing here needs a command line |

## 4. Requirements

| ID | Requirement | Source | Check | Class |
|---|---|---|---|---|
| SAI-1 | The option matrix scores options A to F against G1 to G8 and U1 to U6, each cell citing a docs URL or a test ID | Assumptions, row 1 | `grep -c "^| " ` over the matrix returns rows; a reviewer confirms no cell lacks a `https://` or `T-` reference | convention |
| SAI-2 | No AI-written value reaches the published perspective without a human Publish click | Human-Publishes Rule | After a POC run, the published document's `_rev` is unchanged and the draft carries the value (GROQ on `perspective: "published"` vs `"drafts"`) | measured |
| SAI-3 | AI-drafted field values are identifiable as such until a human accepts them | `ai-ethics-and-operations.md` §13 | Decision recorded: where the marker lives (field, `aiDisclosure`, or document history only). Until then | roadmap |
| SAI-4 | Each production AI instruction exists as a file in the repo, not only as a Studio AI Context document | `ai-assist-conventions.md` §Field instruction authoring (instructions are content and do not migrate between datasets) | The instruction text in the Studio run equals the repo file (diff) | measured |
| SAI-5 | An organisation spending limit is set before any editor can run an AI action | How AI Credits work (Sanity docs) | Value read from Manage > Billing > Spending limits and pasted into the issue with the date | measured |
| SAI-6 | Tier 1 fields stay out of reach of AI actions | `ai-assist-conventions.md` §Tier 1 | On `slug`, `publishedAt` and a `caseStudy.client` field the AI action is absent or refuses (known-bad input in §6) | measured |
| SAI-7 | Generated alt text is 125 characters or fewer, describes what is visible, and starts without "image of" or "picture of" | `richImage.ts` alt description; WCAG practice | Length by script on N=20 images; human rates each against the existing hand-written alt (pass = at least as good) | measured |
| SAI-8 | The schema `required` rule on `alt` still fires when the field is empty | `richImage.ts` | Clear `alt` on a test doc; Studio shows the validation error | measured |
| SAI-9 | Generated excerpts are 300 characters or fewer and pass the anti-slop list | `brand-voice-guide.md`; `article.ts` excerpt rule | Length by script; anti-slop checklist by a reviewer on N=10 docs; accept-without-edit rate recorded | measured |
| SAI-10 | The Tier 3 status of `excerpt` is confirmed or changed, with a reason | `ai-assist-conventions.md` §Tier 3 | `ai-assist-conventions.md` diff approved under the Rule File Write Gate | convention |
| SAI-11 | The shortlist decision names one verdict per option (adopt, hold, reject) with its failed gates | Assumptions, row 4 | Verdict table exists; every reject names a G-number or a U-score | convention |
| SAI-12 | A no-go leaves no residue | G8 | `grep -c assist apps/studio/package.json` is 0, and `count(*[_type=="assist.instruction.context"])` is 0 | measured |
| SAI-13 | The POC runs only on named test documents, and its drafts are discarded afterwards | CLAUDE.md §Content Write Gate | Test document IDs listed in the issue; `discard_drafts` result recorded | convention |

No requirement is `enforced-by-code`: no validator is specified, per CLAUDE.md §Building a
mechanism (no reader named).

## 5. Research and verification plan

Rows are settled before the epic that depends on them starts.

| ID | Claim | Command or source that settles it | Run by | Done before |
|---|---|---|---|---|
| R1 | The SUG-95 document-context injection bug is fixed in current `@sanity/assist` (v6.0.0, 2026-03-06) | Read the changelog entries; then install on a branch and run on a test doc (prototype) | Claude, then prototype | E2 |
| R2 | The project is on a plan that includes AI features | `whoami` + `list_projects`, then Manage > Plan | Claude; Bex confirms in Manage | E1 |
| R3 | Agent Actions write to a draft and never to the published document | https://www.sanity.io/docs/agent-actions/transform-cheatsheet says so; confirm by SAI-2 test | Prototype | E2 |
| R4 | Agent Action runs are attributable to a person (audit trail) | Sanity docs search; Manage > Usage > AI per-user view; test | Claude | E1 |
| R5 | Sub-processors and data retention for Agent Actions and AI Assist | https://www.sanity.io/legal/tos-ai (the docs reader cannot open it; fetch with a browser) | Claude via browser; Bex reads the verdict | E1 |
| R6 | `image-description` honours a custom instruction (length, tone) | Prototype on 5 images | Prototype | E2 |
| R7 | The `vX` API version is stable enough for a pilot | https://www.sanity.io/docs/changelog; note any `vX` breaking entries in the last 90 days | Claude | E1 |
| R8 | Workflows early access is not a candidate this quarter | https://www.sanity.io/docs/workflows/prerelease: pre-1.0, guards not enforced, you run the runtime | Claude (done, 2026-11-10) | E1 |
| R9 | A second dataset or a branch can host the POC (Growth allows 2 datasets) | `list_datasets` | Claude | E2 |

A prototype (`sugartown-prototype-writer`) settles R1, R3 and R6 together. Its findings
update this table and the SAI IDs.

## 6. Test and eval plan

| ID | Runs where | Known-bad input it must fail |
|---|---|---|
| SAI-1 | Reviewer, E1 | A matrix cell with no URL or test ID |
| SAI-2 | Local, via MCP `query_documents` | A run with `forcePublishedWrite: true` on a test doc: the check must flag the published `_rev` change |
| SAI-3 | Human decision | Value drafted by AI with no marker anywhere |
| SAI-4 | Local diff | A Studio-only instruction edit not mirrored in the repo |
| SAI-5 | Human, Manage | A blank spending limit |
| SAI-6 | Studio, human | The AI action offered on `slug` |
| SAI-7 | Local script + human | An alt of 140 characters; an alt reading "image of a dog" |
| SAI-8 | Studio, human | `alt` cleared and no validation error |
| SAI-9 | Local script + human | An excerpt of 340 characters; one containing "leverage" or an em dash in customer-facing copy |
| SAI-10 | Rule File Write Gate | A convention edit made without the diff shown |
| SAI-11 | Reviewer, E3 | A reject verdict with no gate named |
| SAI-12 | Local | `@sanity/assist` still in `package.json` after a no-go |
| SAI-13 | Human | A POC write to a non-test document |

## 7. Human gates this work will hit

| Gate | When | Tier |
|---|---|---|
| Content Write Gate | Any MCP write while testing option F | 1 |
| Human-Publishes Rule | Every POC draft; nothing is published | 1 |
| Instruction & Rule File Write Gate | Editing `docs/conventions/ai-assist-conventions.md` (SAI-10) | 1 |
| Deploy schema | Any `options.aiAssist` change to `apps/studio/schemas/` (close-out step 2) | 2 |
| Phase 0 vspec | Does not fire: no rendered site change. Recorded here per CLAUDE.md. Fires if a custom Studio component reaches editors | 1 |
| Visual QA, Chromatic | Do not fire: no `apps/web` or Storybook change | 1 |

No new Tier 1 gate is added.

## 8. Decomposition

| Epic slug | Requirement IDs | Order | Depends on |
|---|---|---|---|
| `sanity-ai-options-research` | SAI-1, SAI-5, SAI-13 | 1 | none |
| `sanity-ai-poc-alt-text` | SAI-2, SAI-3, SAI-4, SAI-6, SAI-7, SAI-8 | 2 | `sanity-ai-options-research` (R1, R2, R5, R9 settled) |
| `sanity-ai-poc-excerpt-and-decision` | SAI-9, SAI-10, SAI-11, SAI-12 | 3 | `sanity-ai-poc-alt-text` (same harness) |

Each epic's Scope cites its IDs (close-out step 5b checks the handoff).

## 9. Improvement loop

- After each epic: record the friction line in its close-out review.
- At PRD close: re-read each SAI requirement against what shipped and mark it Match, Drift
  or Gap (`alignment-audit`).
- Three equal friction lines is a process fix (`process-feedback-loop.md`).
- Review date: 2027-02-10, because Agent Actions is on an experimental API and Workflows is
  pre-1.0. Re-check R7 and R8 then.

## 10. Open decisions

| Decision | Options | Owner | Target date |
|---|---|---|---|
| Which options go into the POC | **Decided 2026-11-10: B + A + C.** D and E stay desk research | Bex | closed |
| POC environment | **Decided 2026-11-10: named test docs on production, drafts discarded** (SAI-13) | Bex | closed |
| Provenance marker (SAI-3) | Document history only; `aiDisclosure` on the doc; a per-field marker | Bex | E2 |
| Monthly AI spend cap (SAI-5) | A dollar figure for Manage > Billing | Bex | E1 |

## 11. Non-goals

| Not doing | Reason | Owner |
|---|---|---|
| Rolling AI out to body copy, case-study narrative or node text | Narrative needs a full rewrite; Tier 3 | `ai-assist-conventions.md` |
| Auto-publishing anything | Human-Publishes Rule is Tier 1 | CLAUDE.md |
| Building on Workflows now | Pre-1.0, guards not enforced (R8) | Revisit 2027-02-10 |
| Replacing Claude Code + MCP for developer-side writes | Option F stays the baseline and the free-plan fallback | n/a |
| Image generation or image transforms | Provenance labelling for images is ST-181 | ST-181 |
| Backfill of existing content | Measured gap is 0 to 2 documents | n/a |

## Checklist before "In Review"

- [ ] Every requirement has a check and a class
- [ ] Every path exists; every number names its command
- [ ] No rule text copied; links only
- [ ] Every requirement ID is in exactly one epic (SAI-1 to SAI-13: checked above)
- [ ] No em dashes in customer-facing text; none used here
- [ ] An agent could start `sanity-ai-options-research` from this and the issue with no meeting
