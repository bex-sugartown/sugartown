---
**Epic:** SUG-220 — Tool Taxonomy Metadata & Logo Backfill
**Linear Issue:** [SUG-220](https://linear.app/sugartown/issue/SUG-220)
**Status:** In Progress
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit/mini-release per phase
---

# SUG-220 — Tool Taxonomy Metadata & Logo Backfill

Backfill `description`/`url`/`logo` across the `tool` taxonomy (60 documents). Four are already done this session; this epic scopes and tiers the remaining 56.

## Already shipped (this session, before the epic existed)

| Tool | Field | Before | After |
|---|---|---|---|
| **Sanity** | `description` | *(empty)* | "Headless CMS with a structured content platform and a customizable Studio editing interface. Tag when referencing Sanity schema design, GROQ queries, Studio, or content modeling." |
| | `url` | *(empty)* | `https://www.sanity.io/` |
| | `logo` | *(none)* | simple-icons `sanity`, `#F03C2E` |
| **Contentful** | `description` | *(empty)* | "Headless CMS and content platform for managing structured content across channels. Tag when referencing Contentful-specific concepts, migrations, or comparisons to other CMS platforms." |
| | `url` | *(empty)* | `https://www.contentful.com/` |
| | `logo` | *(none)* | simple-icons `contentful`, `#2478CC` |
| **Vercel** | `description` | *(empty)* | "Cloud platform for deploying and hosting frontend applications, with built-in CI/CD from Git. Tag when referencing Vercel-specific deployment or infrastructure." |
| | `url` | `https://vercel.com/` | *(unchanged)* |
| | `logo` | *(none)* | simple-icons `vercel`, `#000000` |
| **Netlify** | `description` | *(empty)* | "Cloud platform for deploying and hosting static and JAMstack sites, with built-in CI/CD from Git. Sugartown's own production deploys run on Netlify." |
| | `url` | `https://netlify.com` | *(unchanged)* |
| | `logo` | *(none)* | simple-icons `netlify`, `#00C7B7` |

Written to `drafts.*` on all four, not yet published — human-publishes rule, pending Bex's go-ahead.

## Background

Sourcing pattern established this session: [simple-icons](https://simpleicons.org/) (MIT-licensed, official-brand-verified SVG marks, already a repo dependency via `@icons-pack/react-simple-icons`) for the icon, plus each vendor's own site for accurate, practical (not marketing-hype) description content. Full local dataset search (3,449 icons, exact-title/slug/alias match + substring fallback, cross-verified against the raw GitHub source, not just the CDN proxy) confirms which of the remaining 56 tools have a usable match and which don't.

**On "replacing existing icons":** verified, not assumed — of the 5 tools with a pre-existing logo (`AEM Assets`, `FileMaker Pro`, `SFCC`, `SFMC`, `Celum`), **none** have a simple-icons match. There is nothing to replace from this source. If Bex wants those five refreshed anyway, that's Tier B sourcing (below), not a simple-icons swap.

## Phase 1 shipped (2026-07-18)

All 30 Tier A tools patched — `description`, `url` (where findable), and `logo` (simple-icons SVG, brand-hex fill, `tool-{slug}-logo.svg`) — via Content Write Gate proposal, approved, written to `drafts.*`, not yet published.

**Discrepancy found during execution:** the audit table below claims a confirmed simple-icons match for **Claude Code** (`claudecode` #D97757). The installed package (`@icons-pack/react-simple-icons@13.12.0`) has no `SiClaudecode` icon — only `SiClaude` exists. All other 29 Tier A tools' simple-icons matches were verified accurate against the live package before use.

**Resolved 2026-07-18:** Bex opted to reuse the Claude mark (same vendor, same #D97757 brand color) for Claude Code. Sanity's asset store deduplicates by content hash — uploading the identical SVG under `tool-claude-code-logo.svg` resolved to the same existing asset (`image-71056c942ddf421824ed701cd6f8ea2dd9dccfb7-24x24-svg`) rather than creating a duplicate. Claude and Claude Code now share one logo asset. All 30/30 Tier A tools complete.

**Published:** all 30 Tier A drafts published live (explicit standalone approval, separate from the earlier content-write approval, per the site's human-publishes rule). Verified via fresh `drafts.*` existence check immediately before publish (all 30 present with description+logo populated) and a post-publish spot-check on three published documents. The original four (Sanity, Contentful, Vercel, Netlify) were already published earlier. **All 34 tools scoped so far (original 4 + Tier A 30) are now live.**

## Full audit — all 60 `tool` documents

Legend: **desc** = `description` populated · **url** = `url` populated · **logo** = `logo` populated · **SI match** = confirmed simple-icons entry (slug/hex) or "—"

| Tool | desc | url | logo | SI match |
|---|---|---|---|---|
| Sanity | ✅ | ✅ | ✅ | `sanity` #F03C2E *(shipped)* |
| Contentful | ✅ | ✅ | ✅ | `contentful` #2478CC *(shipped)* |
| Vercel | ✅ | ✅ | ✅ | `vercel` #000000 *(shipped)* |
| Netlify | ✅ | ✅ | ✅ | `netlify` #00C7B7 *(shipped)* |
| Apple | — | — | — | `apple` #000000 |
| CSS | — | — | — | `css` #663399 |
| Claude | — | — | — | `claude` #D97757 |
| Claude Code | — | — | — | `claudecode` #D97757 |
| Coda | — | — | — | `coda` #F46A54 |
| Confluence | — | — | — | `confluence` #172B4D |
| Contentstack | — | — | — | `contentstack` #E74C3D |
| Drupal | — | — | — | `drupal` #0678BE |
| Evernote | — | ✅ | — | `evernote` #00A82D |
| Figma / FigJam | — | — | — | `figma` #F24E1E |
| Gemini | — | — | — | `googlegemini` #8E75B2 |
| GitHub | — | — | — | `github` #181717 |
| Google | — | — | — | `google` #4285F4 |
| iOS | — | — | — | `ios` #000000 |
| JavaScript | — | — | — | `javascript` #F7DF1E |
| Jira | — | ✅ | — | `jira` #0052CC |
| Linear | — | — | — | `linear` #5E6AD2 |
| Mermaid | — | — | — | `mermaid` #FF3670 |
| Next.js | — | — | — | `nextdotjs` #000000 |
| Notion | — | — | — | `notion` #000000 |
| Python | — | — | — | `python` #3776AB |
| React | — | — | — | `react` #61DAFB |
| Shopify | — | — | — | `shopify` #7AB55C |
| Storyblok | — | — | — | `storyblok` #09B3AF |
| Storybook | — | — | — | `storybook` #FF4785 |
| Trello | — | ✅ | — | `trello` #0052CC |
| Turborepo | — | — | — | `turborepo` #FF1E56 |
| TypeScript | — | — | — | `typescript` #3178C6 |
| Vite | — | — | — | `vite` #9135FF |
| WordPress | — | — | — | `wordpress` #21759B |
| AEM | — | — | — | — |
| AEM Assets | — | ✅ | ✅ (existing PNG) | — |
| Acquia | — | — | — | — |
| ChatGPT | — | — | — | — |
| ChatGPT (Canvas) | — | — | — | — |
| DevTools | — | — | — | — |
| Eraser.io | — | — | — | — |
| Excel | — | — | — | — |
| FileMaker Pro | — | ✅ | ✅ (existing SVG) | — |
| Matplotlib | — | — | — | — |
| Monday.com | — | ✅ | — | — |
| NetworkX | — | — | — | — |
| OpenAI Codex | — | — | — | — |
| Oracle ATG | — | — | — | — |
| Powerpoint | — | — | — | — |
| Riversand | — | — | — | — |
| SFCC | ✅ | ✅ | ✅ (existing PNG) | — |
| SFMC | ✅ | ✅ | ✅ (existing PNG) | — |
| Slack | — | — | — | — |
| commercetools | — | ✅ | — | — |
| eWinery | — | — | — | — |
| CWV | — | — | — | — |
| Celum | — | ✅ | ✅ (existing PNG) | — |
| Claude Design | — | — | — | — |
| Forrester Wave | — | ✅ | — | — |
| Gartner | — | ✅ | — | — |

`No exact/alias/substring match` confirmed by local search of the full 3,449-icon dataset for: `slack`, `openai` (only "OpenAI Gym" exists, not OpenAI itself — likely a past trademark-driven removal, same story as Slack, both well-documented cases in simple-icons' history), `matplotlib`, `salesforce`, `acquia`, `monday`, `filemaker`, `oracle`, plus AEM, CWV, Celum, ChatGPT/Canvas, Claude Design, DevTools, Eraser.io, Excel, Forrester Wave, Gartner, NetworkX, Powerpoint, Riversand, commercetools, eWinery.

## Objective

After this epic: every `tool` document that plausibly can have a logo, has one — sourced from simple-icons where a match exists (Tier A), or from the vendor's own official brand/press page where it doesn't (Tier B, case-by-case, each needing its own download-permission ask per the site's file-download policy). Tools with no findable or appropriate public mark (Tier C) are explicitly left logo-less with the reasoning recorded, not silently skipped. Every tool also gets a practical, editor-facing `description` (what it is, when to tag it) and its official `url` where findable.

## Scope

### Phase 1 — Tier A: 30 tools, confirmed simple-icons match — ✅ Shipped 2026-07-18

- [x] For each of the 30 tools in the audit table with a confirmed `SI match`: draft `description` (practical/editorial register, same voice as the four shipped — not marketing copy), find/confirm `url`, download the simple-icons SVG, apply the correct brand-hex `fill` (none of simple-icons' raw SVGs ship with an explicit fill), upload as a Sanity image asset named `tool-{slug}-logo.svg`, patch all three fields. 30/30 complete — Claude Code reuses the Claude mark, see Phase 1 shipped note above.
- [x] Present as one Content Write Gate proposal table (or a few batches of ~10, to keep review manageable) before any write — same pattern as the four already shipped. Do not write descriptions for 30 tools unilaterally; get explicit approval first, per CLAUDE.md's Content Write Gate (AI-interpreted copy). Presented as 3 batches of 10, approved.
- [x] Leave all patches as `drafts.*` — publishing is a separate, explicit human action, not implied by content approval.

### Phase 2 — Tier B: ~14 tools, no simple-icons match, individually sourced

Candidates, each needing its own official-site logo lookup and its own download-permission ask (per-file, per the site's explicit-permission-required policy — this phase cannot be batch-approved the way Phase 1 can):

`ChatGPT` / `OpenAI Codex` (openai.com brand page — may cover both), `Slack` (slack.com brand guidelines — note: likely trademark-restricted given the simple-icons removal, verify usage terms before downloading, not just availability), `Excel` / `Powerpoint` (Microsoft brand center), `Monday.com` (monday.com press page), `Matplotlib` (matplotlib.org — open-source project, likely a permissively-licensed mark), `Acquia` (acquia.com), `Eraser.io` (eraser.io), `NetworkX` (networkx.org), `Riversand` (riversand.com), `commercetools` (commercetools.com), `AEM` / `AEM Assets` (adobe.com brand page — Assets already has a logo, this would be a refresh, not new), `FileMaker Pro` (claris.com — refresh of an existing logo), `SFCC` / `SFMC` (salesforce.com brand page — refresh of existing generic-looking PNGs, lower priority since they already have *a* logo).

- [x] Confirm Bex wants Phase 2 pursued before starting — it's materially higher-effort than Phase 1 (no shared source, no batch approval), and several targets (Forrester Wave, Gartner — see Tier C) raise real trademark-sensitivity questions worth a deliberate answer, not a default yes. **Confirmed 2026-07-18 ("execute phase 2").**

**Phase 2 shipped (2026-07-18).** Four parallel research agents (no downloads, research only) checked every candidate's actual official brand/press page and stated usage terms, rather than assuming availability implies permission. Findings split real into three groups:

- **Group A — 5 tools, logo + description + url, executed:** Monday.com, Matplotlib, NetworkX, Eraser.io, commercetools. Real official assets (SVG, verified fetch), no explicit third-party-use prohibition found. All already have baked-in brand colors (unlike Phase 1's monochrome simple-icons marks) — no fill-injection needed.
- **Group B — 7 tools, description + url only, deliberately no logo:** Slack, Excel, Powerpoint, ChatGPT, OpenAI Codex, AEM, AEM Assets. Each vendor's *own* stated terms explicitly prohibit third-party logo use — quoted directly, not inferred: Slack ("don't distribute or otherwise make available our logos... most uses require a specific written license"), Microsoft ("app icons... can never be used without an express license"), Adobe ("does not allow the use of its product icons by third parties... except through an Adobe partnership agreement"). OpenAI's brand page was bot-gated and no verified direct asset was found at all.
- **Group C — 4 case-by-case decisions, resolved 2026-07-18:**
  - **Acquia**: no formal brand kit exists (checked Newsroom, Press Releases, Brand Resources directly — none have download links). Bex approved using the live site-header SVG as a fallback. Logo + description + url executed.
  - **Riversand**: genuinely doesn't exist independently anymore — acquired by Syndigo in 2021, `riversand.com` redirects to `syndigo.com/riversand/`. Bex chose logo-less; description notes the acquisition, `url` points at the redirect destination.
  - **FileMaker Pro**: only available asset was a stale FileMaker-18-era icon bundle; Claris's current logo requires emailing them directly for permission. Bex chose to leave the existing entry untouched — no changes made.
  - **SFCC / SFMC**: Salesforce is actively rebranding these (Commerce Cloud → **Agentforce Commerce**, Marketing Cloud → **Agentforce Marketing**, confirmed via Salesforce's own Oct 2025 press release), and no distinct sub-product icon exists publicly, only the generic Salesforce cloud mark. Bex chose to keep the historical SFCC/SFMC names and skip the logo refresh — existing descriptions (which already carried real historical context: "DemandWare-that-was, acquired 2016" / "ExactTarget-that-was, acquired 2013") were **appended to, not replaced**, adding the rebrand fact as a new sentence.

**Description voice correction (2026-07-18):** Bex caught that my first draft of these 16 descriptions used a generic "Tag when referencing X" closing clause — inconsistent with the actual pattern already established across Phase 1's 30 published descriptions. Verified the real pattern directly (queried 10 live examples) rather than guess: plain factual definition, then a *specific* grounding fact — either "part of Sugartown's own [X]" for tools genuinely used to build the site, or "a platform Bex has worked within professionally, distinct from Sugartown's own Sanity-based stack" for tools that aren't. Rewrote all 16 against this pattern, using the `kind` field (`practitioner`/`platform`) as the honest anchor rather than inventing specific claims — and dropped an unverified assumption along the way (matplotlib/networkx are not actually used anywhere in this repo's own code, confirmed by grep; ChatGPT's grounding *is* real and verified via actual node references).

**Discrepancy noted, not resolved:** Bex stated commercetools was "updated and published" alongside AEM Assets. Verified AEM Assets (correct — new description live, logo removal live). Commercetools was **not** updated — `_updatedAt` still reads `2026-05-03`, untouched since before this epic existed. Flagged to Bex directly rather than silently writing over it or silently leaving the gap; not yet resolved as of this entry.

**Published:** all Group A/C additions with a logo, plus every description/url change, written to `drafts.*` — not yet published, pending the same explicit standalone publish approval Phase 1 required.

### Phase 3 — Tier C: flagged skip/defer, not scoped for execution

| Tool | Why flagged |
|---|---|
| `CWV` (Core Web Vitals) | A Google metric/concept, not a distinct branded product — recommend no dedicated logo. |
| `Claude Design` | Unclear if this is a distinct product or an internal label variant of Claude — a taxonomy question, not a logo-sourcing one. Flag for Bex before assuming either way. |
| `Forrester Wave` / `Gartner` | Analyst-firm marks tied to their own report branding — these firms are known to be protective of how their marks are used. Recommend explicit caution: verify usage terms before downloading anything, don't treat "found on their site" as "cleared to use." |
| `DevTools` | Generic browser-devtools concept (not a single vendor's distinct brand) — recommend no dedicated logo, or reconsider whether this needs to be its own `tool` entry. |
| `eWinery` | Appears to be a niche/client-specific system — unlikely to have a usable public brand asset. Low priority; may remain logo-less indefinitely. |
| `Oracle ATG` | ATG is a discontinued/legacy Oracle product line; a generic current Oracle mark would be historically inaccurate for what this tag actually represents. Recommend either no logo or an explicit note that any Oracle mark used is approximate. |

## Acceptance criteria

- [x] All 30 Tier A tools have `description`, `url` (where findable), and `logo` set, approved via Content Write Gate proposal before any write — 30/30 complete, published live
- [x] Tier B scope is either explicitly approved by Bex and executed tool-by-tool (each with its own download-permission ask), or explicitly deferred — not left ambiguous. Approved and executed 2026-07-18: 5 logo+desc+url, 7 desc+url-only (vendor terms explicitly prohibit logo use), 4 Group C case-by-case decisions resolved individually. FileMaker Pro explicitly left untouched per Bex's call.
- [x] Tier C tools are recorded as intentionally skipped with reasoning, not silently forgotten — Acquia/Riversand/FileMaker/SFCC-SFMC resolved above; CWV/Claude Design/Forrester/Gartner/DevTools/eWinery remain flagged skip/defer, unchanged from original scoping
- [x] No logo is uploaded without an explicit brand-hex `fill` applied first (raw simple-icons SVGs default to black/no-fill, which renders wrong as a standalone Sanity image asset — same fix applied to the first four)
- [x] Every new logo filename follows the `tool-{slug}-logo.svg` convention from `docs/conventions/image-naming-convention.md`

## Human QA Walkthrough — example local pages

Required — tool logos render on any page consuming `TaxonomyChips`/tool references (article/node/case-study detail pages, `/tools` archive, `/tools/:slug` detail pages).

> Activation audit: read `apps/web/src/App.jsx` for the live `/tools` and `/tools/:slug` routes, and spot-check 2-3 real published pages that already tag one of the 30 Tier A tools, before and after publish, per `docs/epic-template.md` §Human QA Walkthrough.

## Technical notes

- **Content Write Gate**: fires for every description (AI-interpreted copy). Does not fire for the pure `url`/`logo` fields alone, but since they're bundled into the same proposal table as description in practice, treat the whole row as gated.
- **Schema changes**: none — `tool.description`/`url`/`logo` already exist (see `apps/studio/schemas/documents/tool.ts`).
- **Asset upload**: no dedicated Sanity MCP tool for raw asset upload exists. Established path this session: a one-off Node script using `@sanity/client`'s `client.assets.upload('image', stream, {filename, contentType})`, run from inside the repo (ESM resolves `node_modules` relative to script location, not cwd) with the Sanity CLI's own already-authenticated token (`~/.config/sanity/config.json`'s `authToken`), never printed. Delete the script after use — it's a one-off utility, not permanent tooling.
- **Upstream dependencies**: none.
- **Model & Mode [REQUIRED]:** `/model sonnet` — content drafting + scripted asset upload + document patches, no architecture ambiguity.

## Model & Mode [REQUIRED]

`/model sonnet` — same reasoning as above.

## Non-Goals

- **Does not build a permanent asset-upload tool or script** — the one-off Node script pattern is documented here for reuse, not productized into repo tooling, unless this becomes a recurring need.
- **Does not resolve the `Claude Design` / `DevTools` taxonomy questions** — flagged in Tier C, not decided here.
- **Does not download or use Forrester/Gartner marks without an explicit, separate usage-terms check** — analyst-firm branding is treated as higher-sensitivity than vendor product logos by default.

## Related

- **Linear:** [SUG-220](https://linear.app/sugartown/issue/SUG-220)
- **Epic template:** `docs/epic-template.md`
- **Icon convention:** `docs/conventions/image-naming-convention.md` — `tool-` prefix
- **`apps/studio/schemas/documents/tool.ts`** — the schema this epic populates, unchanged
