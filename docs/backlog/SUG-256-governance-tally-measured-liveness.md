---
**Epic:** SUG-256 — Re-derive the GovernancePage coverage tally from measured enforcement liveness
**Linear Issue:** [SUG-256](https://linear.app/sugartown/issue/SUG-256/re-derive-governancepage-coverage-tally-from-measured-enforcement)
**Status:** In Review (2026-08-02) — Ph1–2 shipped and CI-verified; Ph3 rescoped, not started
**Priority:** 🟢 Next — High. Reputational exposure, not technical debt
**Merge strategy:** (a) Merge-as-you-go. Phase 1 is a research output and ships on its own.
---

# SUG-256 — Governance tally from measured liveness

> ## ⚑ HANDOFF — read this first (2026-08-02)
>
> **Phases 1 and 2 are shipped and verified in CI.** Phase 3 was scoped, reviewed, and
> **deliberately not written** — the blocking review returned 4 blockers that reshaped it.
>
> **The plan changed on 2026-08-02.** Rather than fixing §05 in place on a live indexed page,
> **§05 moves to its own standalone `noindex` page** and is worked there until it is provably
> correct. Rationale: the section publishes claims about the platform's own rigour, three of
> which are currently measurable as false or unbacked, and iterating on them in public costs
> credibility on every deploy. See §Phase 3 (rescoped).
>
> **Do not start by writing code.** Start by reading §Phase 3 (rescoped) and §Open decisions.
> Two decisions are unresolved and change what gets built.
>
> **What is already true and must not be re-derived:**
> - `validate:governance-tally` (CTL-027) is live in CI — run `30745403529`, `success` on
>   `0411b5fc`, step *Validate governance tally* confirmed `completed / success`
> - Liveness: **14 gates proven live, 0 inert**
> - The published tally (18 / 5 / 2 / 5) agrees across all three sources **today**
> - 5 of the 30 coverage components are control-dependent; 25 are artifact-backed

**Doc created 2026-08-01**, backfilling a gap: this epic reached In Progress on 2026-07-29 with
its Background and Scope living only in Linear and no `docs/backlog/` file at all. Creating it
satisfies SUG-262 Phase 1's "Stub for SUG-256" item, ticked there in the same commit.

## Background

`/platform/governance` §05 published **"30 checkpoints · 0 gaps"** with no measurement date and
no source, while the pipeline behind the claim had failed every CI run on `main` since
2026-05-10.

A partial fix landed 2026-07-27 in `52a86dbb`: the kicker became `30 checkpoints · mapped
2026-07-26`, `governance-coverage.md` went to v1.3 with a liveness caveat and three ⚠️ rows, and
the tally was deliberately **not** re-asserted. This epic does the other half — replacing "not
asserted" with a measured number.

The failure was never the wrong number. It was a claim about the platform's own rigour that
nothing re-verified. SUG-245 ran a GovernancePage accuracy pass on 2026-07-26 and closed it
"re-verified accurate as of this entry, not carried forward unchecked" — one day before the
pipeline was found red for three months. That re-verification was real, but it checked
validators were *wired*, not that anything *ran*.

## The blocker found before execution (2026-08-01 audit)

**The epic as scoped in Linear is not executable as written.** Linear says "re-measure all 30
components against real liveness data". There is no path from the liveness data to those 30
components, because they are counted in a different registry.

| Source | Holds | Used by the page? | Measured 2026-08-01 by |
|---|---|---|---|
| `docs/ai/agentic-caucus/governance-coverage.md` v1.3 | ~30 components; tally **18 / 5 / 2 / 5** | **yes** — copied verbatim into `GovernancePage.jsx:191` | reading the file |
| `docs/ai/agentic-caucus/control-register.md` | **26** controls, each with probe / reader / bypass (25 when this was first measured; CTL-027 landed in Phase 2) | no | `grep -c "^| CTL-"` |
| `pnpm validate:enforcement-liveness` | **13 gates proven live**, 0 inert, 1 skipped | no | running it |

**Two registries, two taxonomies, no mapping.** Liveness describes the control register's rows.
The published tally describes governance-coverage's components. Deriving a number in one from
measurements in the other is not possible until something maps them, and nothing does.

It is not simply "13 of 30 are measurable" either. **15 of the 26 control rows have no probe**,
nine of them `enforced-by-code` — CTL-008, 009, 010, 011, 013, 014, 016, 017, 018. They are wired
and they run; nothing proves they would fail against broken input. So even inside the control
register, most rows carry no liveness evidence.

```bash
# reproduce both figures
grep -c "^| CTL-" docs/ai/agentic-caucus/control-register.md
node scripts/validate-enforcement-liveness.js | grep -E "proven live|inert|skipped"
```

## Objective

`/platform/governance` publishes a coverage claim that carries a measurement date and a named
reproducing command, where every number is derived from something that ran — and where anything
not measurable is shown as such rather than folded into a total.

## Scope

**Phase 1 — Map the two registries (research; no page changes)**

- [ ] Produce a mapping table: each `governance-coverage.md` component → the `CTL-NNN` row(s)
      that enforce it, or `no control` where none exists
- [ ] For each mapped row, record whether it has a probe and whether that probe passed
- [ ] **Name the unmeasurable set explicitly.** Components with no control, and controls with no
      probe, cannot contribute to a measured tally. The size of that set is a finding in itself
- [ ] Decide where the mapping lives so it cannot drift: a column in `governance-coverage.md`, a
      column in `control-register.md`, or a third file. **Whichever is chosen, name what keeps it
      current** — an unmaintained mapping recreates this epic

**Phase 1 output — the mapping (completed 2026-08-01)**

All 30 components classified by whether their status depends on a control *firing* or on an
artifact *existing*. Measured by parsing the six layer tables in `governance-coverage.md` v1.3
and cross-referencing `control-register.md`.

**5 of 30 are control-dependent. 25 are not.**

| # | Component | Layer | Status | Controls it rests on | Liveness evidence |
|---|---|---|---|---|---|
| 1 | Quality validation | 2 | Strong ⚠️ | CTL-001 `validate:tokens`, CTL-007 `pnpm lint`, CTL-008 `validate:urls` | 2 of 3 probed — **CTL-008 has none** |
| 2 | Performance benchmarks | 4 | N/A ⚠️ | CTL-019 Chromatic | probe proves *reachability*, not detection |
| 3 | Drift detection | 4 | Strong | CTL-003 `validate:style-mirror` | probed, passing |
| 4 | Output validation | 5 | Strong | validator suite + human QA gates | suite mostly probed; gates are `convention` |
| 5 | Policy enforcement | 6 | Strong ⚠️ | 6 pre-commit validators + the CI gates | pre-commit probed; **most CI gates unprobed** |

The other 25 rest on an artifact existing — a document, a git property, or a platform
guarantee. Liveness data says nothing about them, and no probe ever will. Examples: Risk
tiering rests on `risk-tiers.md`; Encryption rests on Sanity/GitHub/Netlify; Override authority
rests on a sentence in `CLAUDE.md`.

**This reframes the epic.** "Re-derive the tally from measured liveness" moves **5 rows at
most**. The remaining 25 need a different check — does the named artifact still exist and still
say what the row claims — which is artifact verification, not liveness. Conflating the two is
what produced an undated "0 gaps" in the first place.

Two corrections found while mapping, both by reading files rather than trusting a search:

- A `grep` of `.husky/pre-commit` appeared to show `validate:urls` and `validate:content`
  running at pre-commit, contradicting CTL-008, CTL-012 and the coverage doc. Reading the file
  showed both names appear only in a **comment** on line 3. The hook invokes six `validate:*`
  scripts plus `pnpm lint`. All three sources were correct; the search was not.
- That same comment says `validate:urls` runs "manually pre-PR", while CTL-008 records it in CI
  at `ci.yml:76`. The comment is stale. Cosmetic, but it is the kind of stale note that becomes
  a false premise later.

**Where the mapping lives — decided.** A `Enforced by` column in `governance-coverage.md`
itself, naming the `CTL-NNN` rows or `artifact` for the other 25. Not a third file: two
registries already disagree, and an unmaintained third would make it worse. What keeps it
current: **decided 2026-08-01 after testing the assumption and finding it false.**

The Phase 1 draft of this section claimed `validate:controls` already fails on a dangling
`CTL-NNN` reference, so the coverage doc would fall inside an existing gate's reach for free.
**It does not.** `scripts/validate-control-register.js` reads exactly two files —
`control-register.md` and `validate-enforcement-liveness.js` — and checks that *probe*
references inside the register resolve against the `PROBES` array. It has no concept of a
`CTL-NNN` cited from anywhere else, so a dangling reference in `governance-coverage.md` would be
invisible to it. Verified by reading the script's `REGISTER`/`LIVENESS` constants and its
`COLUMNS` check.

The alternative placement is no cheaper: `COLUMNS` enforces exact column names and count
(`validate-control-register.js:99,183`), so adding a `Covers` column to the register would fail
the validator until the script is updated too.

**Chosen: extend `validate:controls` to scan `governance-coverage.md` and require every
`CTL-NNN` it cites to exist in the register.** Small — one more file read, one more check — and
it extends an existing control rather than adding one. Only 5 of the 30 rows carry a `CTL-NNN`,
so the policed surface is deliberately tiny.

This changes a gate, so `verification-reviewer` runs first and is blocking
(CLAUDE.md §Verification review).

**Verification review — 2026-08-01, `verification-reviewer` subagent, blocking**

Returned **1 Blocker** and resequenced this epic. Findings, all verified against files:

- **Blocker.** The existing `validate:controls` probe mutates only `control-register.md`
  (`validate-enforcement-liveness.js:399-419`). The proposed cross-reference check would have
  shipped with its new code path unexercised — the same `STAYED GREEN against a known
  violation` shape SUG-243 hit when a hardcoded probe injection stopped violating a tightened
  cap.
- **The cross-reference check guards the wrong drift mode.** The register is append-only with
  never-reused IDs, so a dangling reference needs a deliberate deletion. The drift that has
  *already happened* is the page drifting from its source doc: `GovernancePage.jsx` cited
  coverage-doc v1.1, a version that never existed.
- **A whole-file `CTL-\d{3}` scan would break on history.** `governance-coverage.md` carries a
  45-line append-only Changelog, and Phase 3 adds an entry naming CTL-021. Retiring any control
  later would turn a correct historical sentence into an unfixable CI failure.
- **Latent false positive in the gate itself.** `readProbeGates`
  (`validate-control-register.js:125`) matches `/gate:\s*'([^']+)'/g` — single quotes only. The
  four `boundary:` probes use a template literal, so the validator sees 10 probes where 14
  exist and would reject a legitimate row citing `boundary: apps/web`.
- **Four `Reader` cells already cite the wrong `ci.yml` line** — CTL-011, CTL-014, CTL-017,
  CTL-018. The same drift class this epic proposes to police, already live inside the register.

**Resequenced accordingly.** Deriving the tally makes page-vs-doc drift impossible to ship and
supplies the reproducing command AC 2 requires, because the command is the script name. The
cross-reference check drops to Phase 4 with the reviewer's four required changes recorded.

Baseline verified 2026-08-01 — all three sources agree, which is why this is the moment to lock
it:

```bash
awk '/^### Layer/{inl=1;next} /^### Tally|^---/{inl=0} inl && /^\|/ {split($0,a,"|"); s=a[3]; gsub(/[⚠️ ]/,"",s); if(s!="Status" && s !~ /^-*$/) print s}' \
  docs/ai/agentic-caucus/governance-coverage.md | sort | uniq -c
# 18 Strong · 5 Partial · 5 N/A · 2 Inherited  — matches the doc's Tally and GovernancePage.jsx:192
```

**Phase 2 — Derive the tally and enforce it (CTL-027)**

- [x] `scripts/validate-governance-tally.js`: parses the six layer tables, compares against the
      doc's own `### Tally` block **and** `COVERAGE_TALLY` in `GovernancePage.jsx`. Fails on any
      disagreement. Verified both directions: injecting `18→19` on the page, and flipping one
      layer row's status, each produce a named failure. Wired into CI as *Validate governance
      tally*
- [x] Probe added, asserting on output text. **The first version was wrong**: it passed an
      `assert` key that `gateProbe` does not accept, so it would have been silently ignored and
      the probe would have passed on any non-zero exit — the exact false-assurance path the
      review flagged. Rewritten to post-process `result.out` per the boundary-probe precedent
- [x] `CTL-027` row added. Liveness now reports **14 gates proven live, 0 inert** (was 13)
- [x] `readProbeGates` blind spot fixed. It matched single quotes only, so the four
      `` `boundary: ${scope}` `` probes were invisible and a legitimate row citing one would
      have been rejected as dangling. Now handles all three quote styles; a template literal
      captures source text rather than its resolved value, so interpolated gates are matched by
      the literal prefix before `${`. Verified it accepts `boundary: apps/web` and still rejects
      `validate:nonexistent`
- [x] **Stale `Reader` references fixed by changing their format, not their digits.** The review
      found four cells citing the wrong `ci.yml` line. Correcting the numbers broke itself:
      inserting the new CI step shifted every line below it, so four freshly-corrected
      references were wrong again before being committed. All eight now name the CI step
      (`ci.yml` step *Build*), matched against the workflow's own `- name:` values — a
      reference that survives insertion. Each of the nine cited names verified to exist

**Phase 3 verification review — 2026-08-01, blocking. 4 Blockers. PAUSED.**

Phase 3 is **not written**. The review reshaped it beyond what the phase was scoped to hold, so
scope is being decided fresh rather than absorbed silently.

| # | Blocker | Evidence |
|---|---|---|
| 1 | **`validate:governance-tally` has never run in CI.** The proposed kicker cites it as the command behind a published number, while the gate has no CI artifact — wiring, not liveness, which is the distinction this epic exists to fix | `gh run list` latest `30550425440` @ `1a498e3f`; the script does not exist at that commit |
| 2 | **The change touches two files the plan said it would not.** `STATUS_TO_LABEL` hardcodes `Strong → 'Automated checks'`; the probe's `breakIt` hardcodes the same string twice. Renaming a tile breaks both — loudly, but unlisted | `validate-governance-tally.js:41`, `validate-enforcement-liveness.js:465-466` |
| 3 | **Tile 1's body would be the strongest liveness sentence on the page, in the one cell nothing checks.** 2 of the 4 control-backed rows still carry the ⚠️ "re-measure after SUG-255" caveat, and Quality validation rests on CTL-008, which has no probe. The page would read more confident than its source doc | `governance-coverage.md:6,79,119`; `control-register.md` CTL-008 |
| 4 | **`Vulnerabilities · 0` is a string literal** inside CTL-021's page-wide scope — no date, no source, nothing fails when it stops being true. Structurally identical to the "0 gaps" claim this epic corrects, three sections above it | `GovernancePage.jsx:227` |

**Where it corrected this epic's own judgement**

- `Owned in code` is a softer mechanism claim, not the absence of one. `risk-tiers.md` is not code. Adopting the source doc's phrase *after* Phase 1 measured it false for 14 of 18 is worse than inheriting it unexamined.
- `committed artifacts` covers roughly 7 of the 14. Five rest on **convention** — human discipline a document describes but does not create — and two cite Linear, which is committed nowhere. Phase 1 said "a document, a git property, or a platform guarantee"; the proposed copy compressed three categories into the most flattering one and dropped the register's own word.
- One date was covering two things: today's count and 2026-07-27's status judgements. `counted`, not `derived`, and the status date stated separately.
- On withholding "0 gaps": **ban the phrase, not the number.** Otherwise a future session reads "we do not publish gaps" and omits a real one. The honest rigour statistic is available and measured — **15 of 26 controls have no probe.**
- "CTL-027 makes drift unshippable" is **false**, and this doc said it. CI-only, `[skip ci]` commits are routine, and Netlify publishes regardless of CI (CTL-020). Drift is detectable after publication, not unshippable. The cheap close is `.husky/pre-commit` — the script runs in 0.08s, filesystem-only.

**Proposed copy, held for the rescope** (reviewer's wording, better than this epic's):

```js
{ label: 'Owned here', value: 18, body: '4 backed by validators; 14 by documents and process.' }
```

plus a `Callout` under the tally stating what the command does not prove, and
`kicker="30 components · counted 2026-08-01 by pnpm validate:governance-tally"`.

**Rows the review proposes, held with it:** CTL-021 amended (values only; body copy and kicker
unparsed by anything), **CTL-028** (`governance-coverage.md` status values — `convention`, no
machine can assert a status), **CTL-029** (hero statistics, incl. the hardcoded
`Vulnerabilities · 0`).

**Also found: this doc's own figures were stale.** It said 25 controls and "15 of the 25";
`grep -c "^| CTL-"` returns **26** as of 2026-08-01, because CTL-027 landed in Phase 2 after the
text was written. Corrected above. Same class the epic corrects.

**Blocker 1 got worse before it got better — CI was skipped by the commit that described the skip (2026-08-02).**

The commit recording this review carried the line *"CI-only, `[skip ci]` is routine"*, quoting the
reviewer's finding about the CTL-020 bypass. GitHub scans the **entire commit message** for that
marker, not just its first line. So the commit documenting the bypass triggered the bypass, and
CI never ran on `8cdb74fa`.

Confirmed: CodeQL ran on that SHA (it fires on a different event) while the CI workflow, which
triggers on `push`, produced no run at all.

**This is a live trap, not a one-off.** Any commit message that explains this bypass disables
the run that would have caught the change. Prose in *files* is safe — `control-register.md`
CTL-025 and CTL-027 both discuss it harmlessly. Commit **messages** are not.

**How to write about it:** spell the marker as `skip-ci`, or split it, so the message describes
the mechanism without invoking it. This doc does that above.

Filed to SUG-265 Part B, which already covers the close-out-needs-CI problem.

**Phase 3 (RESCOPED 2026-08-02) — move §05 to a standalone `noindex` page**

Supersedes the original "fix the published surface" plan, which is preserved below as
§Phase 3 (superseded) because its individual fixes still apply once §05 has somewhere safe to
live.

**Why the change.** Three of §05's claims are currently measurable as false or unbacked, and
the blocking review found a fourth on the same page. Fixing them in place means iterating on
public claims about the platform's own rigour, on an indexed page, one deploy at a time. Moving
§05 to a `noindex` page decouples "getting it right" from "publishing it", so the work can take
as long as it needs without the wrong version being live meanwhile.

**Mechanisms confirmed 2026-08-02 by reading the code — do not re-derive:**

| Need | Mechanism | Evidence |
|---|---|---|
| `noindex` | `SeoHead` takes `robots: { index: false, follow: true }` | `apps/web/src/components/SeoHead.jsx:87-95`; precedent at `ToolDetailPage.jsx:93` for thin pages |
| Route registration | `PLATFORM_ROUTES` in `apps/web/src/lib/routes.js:80` | URL Authority Rule — never hard-code the path |
| Routing | nested under `platform` in `App.jsx` | existing `<Route path="governance" …>` at `App.jsx:158` |
| Sitemap exclusion | **nothing to do** — `build-sitemap.js` uses a hand-maintained `STATIC_ROUTES` array (`apps/web/scripts/build-sitemap.js:115`), so a new route is not auto-added | verified; the risk is a later session *adding* it |

**Scope**

- [x] Route decided: `/platform/governance-draft`, registered as `PLATFORM_ROUTES.governanceDraft`
      (`routes.js:83`). Reserved namespaces in `ia-brief.md:297` are top-level only, and
      `/platform` has explicit children with no `*` or `:slug`, so no collision. `validate:urls`
      inlines its own registry and never reads `PLATFORM_ROUTES`, so registering it triggers nothing
- [x] **Only the tally moved, not all of §05** — decided 2026-08-02, superseding the four-block
      plan drafted above. The tally publishes **sufficiency** (how many components are Strong), and
      all three ⚠️ liveness caveats attach to sufficiency rows. The workflow diagram publishes
      **attribution** (which layer a phase belongs to), which no ⚠️ row disputes, and the doc index
      is a link table. Moving accurate week-old artifacts off a public page makes the visible
      retraction larger than the actual problem
- [x] `robots: { index: false, follow: false }` — plus two mechanisms the plan did not have. See
      **CTL-030** below; the meta alone was not sufficient
- [x] `COVERAGE_TALLY` removed from `GovernancePage.jsx`, with a comment naming where it went and
      forbidding a re-add without a fresh verification review
- [x] **What `/platform/governance` shows in its place — resolved by Bex 2026-08-02.** A
      `Callout variant="warn"` in §05's slot, keeping the folio number so §06 needs no renumbering.
      Copy approved: *"The AI-governance coverage tally is being re-measured and is not published
      here while that work runs. Tracked as SUG-256, started 2026-08-02."* Section retitled
      `AI GOVERNANCE WORKFLOW` / `Epic lifecycle, layer-tagged` / kicker `8 phases`
- [x] Confirmed unlinked: `PlatformSidebar` never listed `#ai-governance` and lists no draft route;
      `SitemapPage` reads from Sanity; `llms.txt` does not enumerate platform routes;
      `build-sitemap.js` `STATIC_ROUTES` untouched
- [x] `validate:governance-tally` followed the tally. **8 filename sites**, not the one the plan
      named. `:15` deliberately still says `GovernancePage.jsx` — it is a historical statement about
      the v1.1 drift that already happened, and remains accurate
- [x] `pnpm validate:enforcement-liveness` → **14 proven live, 0 inert, 1 skipped**, with
      `validate:governance-tally` proven live against the relocated file

**Phase 3 gates — assessed and recorded**

- **Phase 0: does not fire.** Recorded per the gate's own instruction rather than assumed. The new
  page reuses `PlatformLayout`, `usePlatformHero`, and `PlatformHubPage.module.css` with **zero new
  CSS classes**, and composes only already-reviewed primitives (`SectionLabel`, `Grid`, `StatCard`,
  `Callout`). The `warn` callout is an existing variant of an existing primitive dropped into an
  existing section slot. No new visual format is invented, so nothing renders that a human has not
  signed off on. Had either introduced a new class or a new arrangement, the gate would fire.
- **Verification review: run 2026-08-02**, `verification-reviewer` subagent, blocking. Returned
  **5 blockers**, all closed below.

**Phase 3 verification review — 2026-08-02. 5 Blockers, all closed.**

| # | Blocker | How it was closed |
|---|---|---|
| 1 | **CTL-027's probe hardcoded `18`, `19`, and the array's four-space alignment.** A stale needle makes `mutateFile`'s `String.replace` a no-op, the gate runs on a clean tree, exits 0, and the harness reports **the gate inert** — when the probe is what broke. That misattribution invites a future session to weaken a working gate. Same class as CTL-025's fixed-size injection | Probe now reads the current `Automated checks` value out of the page and injects `value + 1`, building its assertion string from the same two numbers. `mutateFile` throws on a no-op transform. **Verified by deliberately staling the needle**: the harness reported `PROBE INVALID — cannot vouch for this gate` and *"fix the probe, not the gate"* |
| 2 | **8 filename sites, not 1** | All updated; `:15` correctly left as history |
| 3 | **`noindex` is JS-injected on a non-prerendered route** (`prerender-content.mjs` covers article/node/caseStudy only), so a non-JS crawler gets the SPA shell with no robots directive | Three mechanisms shipped together: `X-Robots-Tag: noindex, nofollow` in `netlify.toml` (load-bearing, needs no JS), `Disallow` in `robots.txt`, and the `SeoHead` meta. The Disallow-blocks-the-noindex tradeoff does not bite: it only matters when de-indexing an already-indexed URL, and this one never was |
| 4 | **The WIP callout would be an undated claim** — the exact shape this epic corrects | Copy carries `2026-08-02` and the tracking ID in rendered text. CTL-021's `Next read` pulled in to **2026-09-02**, since that date is the only reader that will ever notice it going stale |
| 5 | **CTL-028 must come along** — the draft page publishes 18/5/2/5 derived from three ⚠️-caveated rows that CTL-027 explicitly does not validate | CTL-028 added. The draft page also carries a second `warn` callout stating exactly what the command does and does not prove |

**Register rows: CTL-021 narrowed, CTL-027 amended, CTL-028 / CTL-029 / CTL-030 added.**
CTL-026 remains reserved for Phase 4 and was not reallocated. Diff shown and approved under the
Instruction & Rule File Write Gate before writing.

**Three things found while building that the review could not have caught**

1. **`SeoHead` ignored the `robots` prop.** It is only honoured inside the `seo` object; the
   top-level `title`/`description` shorthand silently drops it. The page shipped with **no robots
   meta at all** until this was caught **in the browser** — the one mechanism the whole rescope
   depends on. A build-passes check would have missed it entirely.
2. **The new page's own doc comment broke the gate.** `validate-governance-tally.js` locates the
   array by a plain `indexOf` on its declaration and reads to the first `]`. A comment above it
   restating that declaration and a `label: … value:` example made the parser lock onto the prose
   and drop the first tile. **The gate caught it**, which is the first evidence CTL-027 does useful
   work on a real change rather than a synthetic probe.
3. **The platform rail highlights `Overview` on an unlisted route.** Recorded as an observation, not
   filed: no item falsely activates as *Governance*, only the `/platform` prefix match, and this is
   pre-existing behaviour for any unlisted `/platform` child. It surfaces only on a deliberately
   unlinked page.

**Correction to this doc's own AC.** "Confirm 14 gates still proven live" is environment-dependent:
15 probes exist, and the chromatic probe skips locally (`apps/storybook/.env` present) while running
in CI (`.env` is gitignored). The durable AC is **exit 0 with 0 inert**, recording the live/skipped
split and the environment it was measured in.

**Phase 3 (superseded) — fix the published surface in place**

- [ ] Recompute `Automated / Documented / Vendor-owned / Out-of-scope` from the Phase 1 mapping
- [ ] Decide the true `Gap` count. **0 remains a legitimate outcome** — but measured, not carried
      forward
- [ ] Update the tally on `/platform/governance` with a measurement date and named source
- [ ] **Fix the `AUTOMATED CHECKS · 18` tile.** It reads "Enforced by code and pre-commit hooks",
      which overstates: only 6 validators run at pre-commit; the rest are CI-only, and CI-only is
      unenforced locally. Flagged in `52a86dbb` and deliberately left
- [ ] Update CTL-021's register row — it currently carries a liveness caveat pending this epic
- [ ] Decide whether the tally should be generated rather than hand-maintained. It is a hardcoded
      array at `GovernancePage.jsx:191` sourced verbatim from markdown, and that copy has already
      drifted once: the page cited v1.1, a version that never existed, while the doc header read
      v1.0 and its changelog ran to v1.2

**Phase 4 — Coverage cross-reference (CTL-026), with the review's required changes**

- [ ] Scan the `Enforced by` column of the six layer tables only, never the whole file
- [ ] Widen the pattern to `/\bCTL-\d+\b/i` once column-scoped, catching `CTL-01`/`ctl-021` typos
- [ ] Allocate **CTL-026** rather than widening CTL-015, so the new probe is cited by a row
- [ ] Dedicated probe, gate string `validate:controls (coverage xref)`, sentinel `CTL-998` —
      not `CTL-999`, which the existing probe already uses
- [ ] State the residual gap in the row and the doc: **dangling IDs only.** An ID that resolves
      but names the wrong control is invisible to it

## Linear dependencies

Verified against Linear 2026-08-02. **None of these block starting Phase 3** — recorded so the
next session knows what is upstream, what is downstream, and what merely overlaps.

**Upstream — shipped, this epic consumes their output**

| Issue | Status | What this epic depends on |
|---|---|---|
| [SUG-255](https://linear.app/sugartown/issue/SUG-255/restore-green-ci-zero-passing-runs-on-main-since-2026-05-10) | Done | Restored CI and shipped `validate:enforcement-liveness`. Without it there is no liveness data to derive from, which is why SUG-256 waited |
| [SUG-198](https://linear.app/sugartown/issue/SUG-198/gap-analysis-6-layers-of-effective-ai-governance) | Done | Created the six-layer model and the 30 components. The taxonomy this epic is trying to map |
| [SUG-245](https://linear.app/sugartown/issue/SUG-245/governancepage-accuracy-pass-ai-governance-tiles-release-diagram-stale) | Done | The accuracy pass that closed "re-verified accurate" one day before CI was found red for three months. The cautionary precedent, not a dependency |
| [SUG-244](https://linear.app/sugartown/issue/SUG-244/governancepage-add-workflow-lifecycle-diagram-governance-doc-index) | Done | Added the workflow diagram and doc index that live inside §05 and must move with it |
| [SUG-243](https://linear.app/sugartown/issue/SUG-243/shrink-claudemd-rule-ids-plain-english-and-a-size-cap) | Done | Added the rule that any reported figure names the command producing it — the standard Phase 2 was built to |

**Downstream / sibling — filed from this epic's findings, not blocking**

| Issue | Status | Relationship |
|---|---|---|
| [SUG-262](https://linear.app/sugartown/issue/SUG-262/linear-backlog-doc-parity-backfill-6-orphaned-issues-validateepic-docs) | Backlog · High | Owned "Stub for SUG-256" — **satisfied 2026-08-01** by this doc, and ticked in SUG-262's Scope. Its Phase 2 (`validate:epic-docs`) would have caught this epic running with no doc |
| [SUG-265](https://linear.app/sugartown/issue/SUG-265/release-flow-release-skips-mini-release-steps-and-close-out-costs-two) | Backlog · Medium | Part B carries the two findings that cost this epic two deploys: close-out needs a CI run but pushing deploys, and a commit message can silently suppress its own CI run |
| [SUG-264](https://linear.app/sugartown/issue/SUG-264/wire-the-banned-word-check-as-validatebanned-words) | Backlog · Low | Sibling governance-tooling work. Its Scope carries the derive-the-probe-from-output lesson |
| [SUG-267](https://linear.app/sugartown/issue/SUG-267/rule-file-write-gate-has-no-artifact-between-edit-and-commit) | Backlog · Low | Same class: a `convention` control with no artifact |

**Not a dependency, but will collide**

Anything touching `apps/web/src/pages/platform/GovernancePage.jsx`. Phase 3 removes a section
from it, and `validate:governance-tally` plus its probe both hardcode strings from that file.

## Open decisions — both resolved 2026-08-02 by Bex

1. **Widen. RESOLVED — yes, include the hero statistic.** It turned out materially cheaper than
   this doc assumed: `stats.json` already carries `security.vulnerabilities.total` with
   `security.fetchedAt`, derived from `pnpm audit` via `apps/web/scripts/stats/security.js`, in the
   object `GovernancePage.jsx:9` already imports. The fix was one line replacing the string literal
   with the derived value, so **CTL-029 is `measured`, not `convention`**. The register row still
   records the residual gap: no hero tile renders its measurement date, so a reader cannot tell how
   fresh any of the four are.
2. **RESOLVED — a `warn` callout carrying a date, not silence.** See Phase 3 above.

The original text of both, preserved:

1. **Does Phase 3 stay narrow or widen to every published statistic on the page?**
   The review's position, which I share: `Vulnerabilities · 0` is a string literal at
   `GovernancePage.jsx:227` — no date, no source, nothing fails when it becomes false — sitting
   inside CTL-021's page-wide Control cell. Fixing §05 while leaving it makes CTL-021 claim
   coverage it does not have. The review proposes **CTL-028** (status values, `convention`) and
   **CTL-029** (hero statistics) to close that. Widening is the honest scope and materially more
   work.

2. **What does `/platform/governance` say where §05 used to be?**
   Silent removal reads as an unexplained retraction of a section published since SUG-198.

## Non-Goals

- **Building probes for the 15 unprobed controls.** That is SUG-256 follow-up work already named
  in the control register's §Known coverage gaps. This epic reports the gap honestly; it does not
  close it.
- **Re-measuring anything CI cannot reach.** If a control has no probe, the honest output is
  "unmeasured", not an estimate.
- Redesigning `/platform/governance`. Numbers and their evidence only.

## Technical Constraints

- Any published figure carries a measurement date and a reproducing command.
- A number that cannot be derived from something that ran is not published as if it were.
- Phase 3 touches a rendered page, so the Phase 0 visual-spec gate must be assessed before any
  JSX change — see Pre-Execution Gate below.

## Files to Modify

- `docs/ai/agentic-caucus/governance-coverage.md` (mapping + tally)
- `docs/ai/agentic-caucus/control-register.md` (CTL-021 row) — **gated**
- `apps/web/src/pages/platform/GovernancePage.jsx` (tally array ~:191, kicker ~:319, tile copy)

## Pre-Execution Completeness Gate

- [x] **Background** — from the Linear issue, 2026-07-27
- [x] **Scope** — three phases, sequenced 2026-08-01
- [x] **Audit file paths verified** — `GovernancePage.jsx:191` and `:319` confirmed by `grep -n`;
      `governance-coverage.md` v1.3 confirmed by reading its header
- [x] **Figures measured, not quoted** — 25 control rows, 15 without a probe, 13 gates proven
      live, all measured 2026-08-01 with the commands recorded above
- [ ] **Phase 0 assessment** — Phase 3 changes rendered output on `/platform/governance`. The
      gate's test is "would this change render something a human has not signed off on?" Changing
      numbers and one tile's body copy inside an existing, already-reviewed layout is arguably
      not a new visual format — **but that decision must be recorded before Phase 3 starts**, not
      assumed here
- [ ] **Verification review** — Phase 3 changes a published claim, which CLAUDE.md
      §Verification review makes blocking. Run `verification-reviewer` as a subagent before
      Phase 3

## Acceptance Criteria

- [ ] Every component in the published tally traces to a control, or is shown as having none
- [ ] The claim carries a measurement date and a command that reproduces it
- [ ] The unmeasurable set is stated on the page or in its linked doc, not omitted
- [ ] `AUTOMATED CHECKS · 18`'s body copy matches what actually enforces those checks
- [ ] A named mechanism keeps the mapping current, or a recorded decision says why none is needed

## Risks

- **Publishing a smaller, honest number reads as a regression.** It is not — it is the first
  number with evidence behind it. Say so on the page rather than letting the drop speak.
- **The mapping becomes a third thing that drifts.** Two registries already disagree; a third
  artifact with no maintainer makes it worse. Phase 1's last item exists for this.
- **Scope pull toward building the 15 missing probes.** Explicitly a Non-Goal. Filing them is
  fine; building them here is not.

## Post-Epic Close-Out

1. Visual QA: required if Phase 3 changes rendered output beyond numbers
2. Record before/after tally figures with their commands
3. Move to `docs/shipped/`
4. `/mini-release`
5. Transition SUG-256 to Done in Linear
6. **Incident log:** likely yes. This corrects a published claim found false — the log's stated
   bar. Needs `Introduced` (when "0 gaps" was first published) and `Noticed` (2026-07-27)
