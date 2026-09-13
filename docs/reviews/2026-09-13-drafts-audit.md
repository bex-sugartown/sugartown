# docs/drafts audit — 2026-09-13

**Issue:** [#120](https://github.com/bex-sugartown/sugartown/issues/120)
**Scope:** every markdown file in `docs/drafts/` (71 files, top level and subfolders), classified, checked against Sanity where the class is content, and given a disposition.
**Gates honored:** the audit itself was read-only — no Sanity writes, no file moves, nothing deleted or touched. Every item this report marked "Archive locally" was moved (not deleted) into `docs/drafts/zArchive/2026-09-13/` in a follow-up pass the same day, on Bex's explicit go-ahead. `docs/drafts/` is gitignored either way, so this is a local reorganization, not a git operation.

## How to read this

- **Class:** content draft (article/node/case study/page copy), outline, spec/vspec, handoff package, working note, or superseded.
- **Sanity state:** checked only for content drafts and outlines, via `*[_type == "..."]` queries against `poalmzla/production`, raw perspective. Handoff packages and working notes aren't content, so they carry `n/a`.
- **Disposition:** file an issue, create a Sanity draft (none needed here — issues cover that step), archive locally (moved into `zArchive/2026-09-13/`, not deleted — see the follow-up note below), or flag (needs a decision this audit can't make).

## Content drafts and outlines — the reason this audit exists

| File | Class | Sanity state | Last modified | Disposition |
|---|---|---|---|---|
| `article-aeo-geo-case-study-schema-ai.md` | article | none — no title match in `*[_type=="article"]` | 2026-05-02 | **File issue** → [#123](https://github.com/bex-sugartown/sugartown/issues/123) |
| `article-claude-ds-setup.md` | article, incomplete (one open `[PLACEHOLDER]`) | none | 2026-04-24 | **File issue** → [#124](https://github.com/bex-sugartown/sugartown/issues/124) |
| `article-site-built-itself.md` | article | **published**, `5b0046ad…`, slug `site-that-built-itself` — title matches verbatim | 2026-05-04 | **Archived** → `zArchive/2026-09-13/` — already shipped |
| `relaunch-post-draft.md` | article | none, but content is dated (specific Lighthouse scores and version numbers from 2026-04-20, since superseded by later releases) | 2026-04-20 | **Flag** — resurrect with current numbers or archive; your call |
| `homepage-draft-copy.md` | page copy | n/a (page copy, not a document type this query covers) — but the live Home page's hero heading (`"I build the systems behind the content."`) matches this draft's Option A verbatim | 2026-04-15 | **Archived** → `zArchive/2026-09-13/` — already shipped |
| `services-copy-proposal.md` | page copy | n/a — Services page last updated 2026-08-08, three months after this proposal (2026-05-04); the proposal itself says most copy was "already there" | 2026-05-04 | **Archived** → `zArchive/2026-09-13/` — very likely already actioned; skim the live page once before deleting |
| `node-flex-wrap-magic-word-draft.md` | node | none — no title match in `*[_type=="node"]` | 2026-04-18 | **File issue** → [#121](https://github.com/bex-sugartown/sugartown/issues/121) |
| `node-sug68-token-architecture-big-miss.md` | node | none | 2026-04-22 | **File issue** → [#122](https://github.com/bex-sugartown/sugartown/issues/122) — see note below |
| `node-outline-somebody-else-built-it.md` | node outline (Part 2 of the fire-alarm pair) | none | 2026-08-15 | **File issue** → [#125](https://github.com/bex-sugartown/sugartown/issues/125) — was the unowned decision from SUG-259's 2026-08-15 impact review |
| `node-diagram-cloudflare-vs-sugartown.md` | diagram notes, companion to the above | none | 2026-08-15 | Folded into [#125](https://github.com/bex-sugartown/sugartown/issues/125) — not a separate piece |
| `node-outline-the-fire-alarm.md` | node outline | **draft exists**, `drafts.1ae1eb70…`, slug `the-fire-alarm-was-wired-to-nothing` — SUG-259 / [#87](https://github.com/bex-sugartown/sugartown/issues/87) | 2026-08-15 | Already tracked, On Hold on the board — no new issue |
| `node-the-great-disconnection.md` | node | **published**, `84d31e26…`, slug `the-great-disconnection`, status `validated` | 2026-04-05 | **Archived** → `zArchive/2026-09-13/` — already shipped |
| `gem-three-white-screens.md` | node | **published**, `node-we-fixed-the-same-white-screen`, status `deprecated` | 2026-02-20 | **Archived** → `zArchive/2026-09-13/` — already shipped (and since deprecated) |
| `pink-moon-manifesto.md` | spec / working philosophy, explicitly "backend thinking for PRD" — not itself publishable | n/a | 2026-04-08 | Keep as reference — feeds design-system decisions, not a content draft |
| `ai-slop-manifesto.md` | spec / working doc, explicitly "not for PRD yet" | n/a | 2026-04-05 | Keep as reference |
| `the-agentic-caucus-multi-agent-ai-governance.md` | case study draft | **likely superseded** — published article "The Agentic Caucus" exists (`0f8eab6b…`, 2026-05-28), near-identical title; body not diffed | 2026-04-01 | **Flag** — confirm the published article covers this before archiving |
| `sugartown-platform-case-study-notes.md` | case study source notes | **likely superseded** — published case study "Sugartown: The Platform Is the Portfolio" exists (`d34d2a54…`, 2026-07-13, 6 sections); this file was last touched 2026-07-14, one day after | 2026-07-14 | **Flag** — confirm before archiving |
| `table-ux-content-split-mockup.md` | spec / content-split mockup | **both halves already published** — node `sanity-custom-table-input` ("...47 Clicks of Pure Suffering") and article `sanity-table-authoring-ux` ("I Built a Spreadsheet Inside My CMS...") both exist, titles matching this mockup's two pieces verbatim | 2026-03-31 | **Archived** → `zArchive/2026-09-13/` — already shipped, in full |

**Note on `node-sug68-token-architecture-big-miss.md`:** its title, *"The Validator Said Zero Errors. It Was Watching the Wrong Door,"* is the exact phantom node CLAUDE.md once cited (resolved 2026-08-15 by removing the dead citation, since no such node existed in drafts or published content at that time per SUG-259's Background). This draft exists now. Whichever came first, it's worth a look — see [#122](https://github.com/bex-sugartown/sugartown/issues/122).

## Working notes and audits (not content — no Sanity check applies)

| File | Class | Last modified | Disposition |
|---|---|---|---|
| `TODO-florid-grep-cleanup.md` | working note, still live (grep re-verified 2026-09-13) | 2026-08-07 | **File issue** → [#126](https://github.com/bex-sugartown/sugartown/issues/126) |
| `content-audit-backlog-burn.md` | working note, superseded (built on Linear tracking, retired 2026-09-05 by ST-117) | 2026-07-23 | **Archived** → `zArchive/2026-09-13/` |
| `governance-layer-unwind-plan.md` | working note, superseded (the unwind it planned shipped as SUG-284, 2026-08-15) | 2026-08-13 | **Archived** → `zArchive/2026-09-13/` |
| `HANDOFF-sug-268-phase-2.md` | handoff package, superseded (SUG-268 cancelled by SUG-284) | 2026-08-06 | **Archived** → `zArchive/2026-09-13/` |
| `RESTART-2026-07-30.md` | working note, stale session handoff | 2026-07-30 | **Archived** → `zArchive/2026-09-13/` |
| `schema-content-model-documentation-audit.md` | working note / spec (ERD refresh plan, was "8+ schema changes stale" as of 2026-05-10 — considerably staler now) | 2026-05-10 | **Flag** — still wanted, or superseded by whatever `/platform/schema` shows now? |
| `workflow-audit-v0.3-grounded.md` | working note / audit, historical, predates several since-shipped process changes | 2026-07-24 | **Archived** → `zArchive/2026-09-13/` |
| `SUG-196/README.md`, `SUG-196/failure-modes.md`, `SUG-196/methodology.md`, `SUG-196/skills-index.md` | working note — a stray, stale mirror of `docs/ai/agentic-caucus/` (diffed: both `methodology.md` and `failure-modes.md` differ from the live copies) | 2026-06-24 | **Archived** → `zArchive/2026-09-13/` — superseded by the real `docs/ai/agentic-caucus/` |

## Handoff packages (design/component work, decisions already locked or shipped)

All of the following are "handoff package" class: README/CHANGES/AUDIT/ADDENDUM/decisions files documenting a design decision that was locked and handed to engineering. None are content bound for Sanity, so no Sanity check applies. Several are exact-duplicate folders (same package copied more than once under a different name) — flagged explicitly.

| File | Note | Disposition |
|---|---|---|
| `Component rework _ explore_ decide_ handoff/README.md` | Backroads case-study component rework, locked 2026-05-04 | **Archived** → `zArchive/2026-09-13/` — already implemented (live at `/case-studies/charting-a-new-course-for-backroads-com`) |
| `Component rework _ explore_ decide_ handoff/SUG-XX-decisions.md` | same package | **Archived** → `zArchive/2026-09-13/` |
| `Component rework _ explore_ decide_ handoff/predecessor/SUG-88-decisions.md` | predecessor decision doc (MetadataCard + chip system), also locked and shipped | **Archived** → `zArchive/2026-09-13/` |
| `handoff_platform_audit/README.md`, `AUDIT.md`, `CHANGES.md` | platform stats page audit handoff | **Archived** → `zArchive/2026-09-13/` |
| `Project_Section_extracted/handoff_platform_audit/README.md`, `AUDIT.md`, `CHANGES.md` | **exact duplicate of `handoff_platform_audit/` above** | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_governance_tweaks_1/README.md`, `CHANGES.md` | governance tweaks round 1 | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_governance_tweaks_2/README.md`, `CHANGES.md` | round 2 — **overlaps round 1 and round 3** | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_governance_tweaks_3/README.md`, `CHANGES.md`, `ADDENDUM-prior-work.md`, `ADDENDUM-prior-work-changes.md` | round 3, most current of the three | **Archived** → `zArchive/2026-09-13/` (or keep this one only, if the tweaks shipped and a record is wanted) |
| `platform-stats-page-ii/README.md` + nested `project/design_handoff_governance_tweaks/README.md`, `CHANGES.md`, `ADDENDUM-prior-work.md`, `ADDENDUM-prior-work-changes.md` | **another copy of the governance-tweaks package**, nested inside a "page ii" folder | **Archived** → `zArchive/2026-09-13/` |
| `platform-stats-page-ii/project/uploads/SUG-119-table-audit-converge-st-table.md` | a design-tool upload artifact — a copy of the SUG-119 table-audit epic doc, which already shipped and is archived at `docs/shipped/zArchive/2026/SUG-119-table-audit-converge-st-table.md` | **Archived** → `zArchive/2026-09-13/` — superseded, already shipped |
| `design_handoff_PageHeader/README.md`, `COMPONENT_README.md` | PageHeader component handoff | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_TermDetail/README.md` | glossary term-detail handoff | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_content_list/README.md` | content-list view handoff | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_iconbutton_form-inputs/README.md` | icon button / form inputs handoff | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_ledger_button_update/README.md` | Ledger button update handoff | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_site_graph/README.md`, `SUG-105-phase-2-handoff-notes.md`, `SUG-81-site-wide-knowledge-graph.md` | knowledge-graph site-graph handoff, Phase 2 notes | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_site_graph_2/README.md`, `SUG-81-site-wide-knowledge-graph.md` | **duplicate of `design_handoff_site_graph/`** | **Archived** → `zArchive/2026-09-13/` |
| `knowledge-graph-claude-design-2/README.md` + 3 nested copies of `design_handoff_site_graph/README.md` and `SUG-81-site-wide-knowledge-graph.md` (in `project/`, `project/design_handoff_site_graph/`, `project/uploads/`) | **a Claude Design export bundling yet another copy of the same site-graph handoff**, three times over, plus image uploads | **Archived** → `zArchive/2026-09-13/` |
| `design_handoff_storybook_docs_template/README.md`, `SECTION-RULES.md` | Storybook docs template handoff | **Archived** → `zArchive/2026-09-13/` |
| `ledger-listviews/README.md`, `ledger-listviews/project/handoff.md` | Ledger listviews handoff | **Archived** → `zArchive/2026-09-13/` |

## Acceptance criteria check

- [x] Every markdown file in `docs/drafts/` appears above with a class, a Sanity state (or `n/a`), and a disposition — 71 files: 18 content drafts/outlines, 11 working notes, 42 handoff-package files (across 20 rows, several rows bundling multiple files from the same package)
- [x] Every "file an issue" disposition has an issue number: [#121](https://github.com/bex-sugartown/sugartown/issues/121), [#122](https://github.com/bex-sugartown/sugartown/issues/122), [#123](https://github.com/bex-sugartown/sugartown/issues/123), [#124](https://github.com/bex-sugartown/sugartown/issues/124), [#125](https://github.com/bex-sugartown/sugartown/issues/125), [#126](https://github.com/bex-sugartown/sugartown/issues/126)
- [x] The Part 2 node ("Somebody Else Built It", working title retired) has a tracking issue — [#125](https://github.com/bex-sugartown/sugartown/issues/125)
- [x] This report is committed under `docs/reviews/`; the original audit pass touched nothing in `docs/drafts/` — confirmed via `git status` before and after. A same-day follow-up, on Bex's explicit request, moved every "Archive locally" item into `docs/drafts/zArchive/2026-09-13/` (29 top-level items: 11 files + 18 folders, covering 57 of the 71 audited files: 6 content drafts, 9 working notes, 42 handoff-package files). Nothing was deleted; `docs/drafts/` stays gitignored throughout.

## Not resolved by this audit — flagged for Bex

Four items need a human call this audit can't make on its own:

1. **`relaunch-post-draft.md`** — rewrite with current numbers, or archive as a snapshot of an old release.
2. **`the-agentic-caucus-multi-agent-ai-governance.md`** — confirm the published "The Agentic Caucus" article already covers this case-study-angle draft before archiving it.
3. **`sugartown-platform-case-study-notes.md`** — same check against the published "Sugartown: The Platform Is the Portfolio" case study.
4. **`schema-content-model-documentation-audit.md`** — still wanted (the ERD is now considerably staler than the "8+ schema changes" it flagged in May), or superseded by whatever `/platform/schema` renders today.

Everything else marked "Archived" has been moved into `docs/drafts/zArchive/2026-09-13/`, unchanged and un-deleted — reversible with a single `mv` back if any of it turns out to still be wanted.
