# Red-pen review — case study diagrams, "Sugartown: The Platform Is the Portfolio"

**Target document:** `caseStudy` slug `sugartown-platform-is-the-portfolio` (Sanity)
**Diagram sources:** `diagram-portfolio-agnostic-stack.svg`, `diagram-portfolio-ai-governance.svg`, `diagram-portfolio-read-path.svg`
**Date:** 2026-07-17
**Origin:** Pre-publication accuracy audit of the three published v1 SVGs (which had no committed sources) found one overstated claim per diagram. These v2 sources correct all three and are the first diagrams reviewed under the technical diagram red-pen gate (CLAUDE.md §Visual Verification Rules).

Classes: **enforced-by-code** (validator, hook, build step, or platform guarantee) · **measured** (empirical result with a committed record) · **convention** (documented rule, true by discipline) · **roadmap** (not true yet — must be drawn dashed/labelled, never as current state).

---

## Diagram 1 — Agnostic stack (`diagram-portfolio-agnostic-stack.svg`)

| Diagram element | Evidence (file / mechanism) | Class |
|---|---|---|
| Design tokens: one source, generated ×2 | `tokens/source/tokens.json` → `pnpm tokens:build` (Style Dictionary) → both `tokens.css` outputs | enforced-by-code |
| Generated copies byte-identical (style files) | `apps/web/scripts/validate-style-mirror.js` (pre-commit) | enforced-by-code |
| `@sugartown/design-system` → POC: direct dependency | `apps/contentful-poc/package.json` (`workspace:*`); direct imports in `apps/contentful-poc/src/components/*.tsx` | enforced-by-code |
| POC: 0 component changes, 0 schema rebuild, 2 packaging gaps fixed, 15 ADRs | `docs/shipped/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md` | measured |
| Content model ported unchanged | same SUG-127 record | measured |
| Production consumes the package | **Not true yet** — `apps/web` has no dependency on `@sugartown/design-system`; mirror components at `apps/web/src/design-system/` (see TODO in `Card.jsx`). Drawn as a **dashed** arrow, named in the legend as "hand-synced mirror … roadmap: consume the package" | roadmap |
| Production mirror: components hand-synced, styles validator-checked | CLAUDE.md §Mirrored File Registry — component mirrors are a manual drift rule; only style files are validator-enforced. Legend wording reflects this split | convention |

**v1 → v2 change:** v1 drew one design system serving both stacks as current state. v2 splits the claim: tokens + content model are genuinely single-sourced (solid); package consumption is direct for the POC (solid pink) and a dashed roadmap item for production.

## Diagram 2 — AI governance (`diagram-portfolio-ai-governance.svg`)

| Diagram element | Evidence (file / mechanism) | Class |
|---|---|---|
| Risk tiers A–D exist and differ | `docs/ai/agentic-caucus/risk-tiers.md` | convention |
| Tier A: no pre-execution gate, async review | same doc — drawn explicitly, not hidden | convention |
| Tier B: epic / Phase 0 mock / visual QA gates | CLAUDE.md §Phase 0 hard-stop, §Visual Verification Rules | convention |
| Tier C: Content Write Gate (approve before write) | CLAUDE.md §Content Write Gate | convention |
| Tier D: publish + destructive ops stay human | Sanity draft/published document split — platform behaviour, not discipline | enforced-by-code |
| "Nothing goes live without a human" footnote | same platform guarantee | enforced-by-code |

**v1 → v2 change:** v1 drew "one guardrail layer". v2 draws the four documented tiers with per-row class chips (CONVENTION vs ENFORCED), including Tier A's absence of a pre-execution gate. The one platform-enforced claim (human publishes) is promoted to the headline guarantee.

## Diagram 3 — Read path (`diagram-portfolio-read-path.svg`)

| Diagram element | Evidence (file / mechanism) | Class |
|---|---|---|
| Content Lake → GROQ layer → client | `apps/web/src/lib/sanity.js` (`useCdn` in prod), `apps/web/src/lib/queries.js` | enforced-by-code |
| Images fetched direct; GROQ returns refs | `urlFor()` builds `cdn.sanity.io` URLs the browser fetches directly | enforced-by-code |
| Stats pipeline: daily cron, separate from GROQ | `.github/workflows/stats.yml` → `apps/web/scripts/collect-stats.js` → collectors in `apps/web/scripts/stats/` | enforced-by-code |
| `stats.json` committed, imported not queried | `apps/web/src/generated/stats.json`; direct `import` in `TrustReportSection.jsx`, `CwvSnapshot.jsx`, `PageSections.jsx`, others | enforced-by-code |
| Build output shipped via Netlify CDN | Vite build → Netlify deploy | enforced-by-code |

**v1 → v2 change:** v1 drew build-time data feeding the GROQ query layer. v2 gives it its own build-time lane joining at the bundle — it never touches GROQ. Also corrected: the image CDN now feeds the client directly (GROQ only returns refs) rather than feeding the query layer.

---

## Not verified from this session

These sources were authored in a remote session with no browser: rendered typography (EB Garamond / Courier Prime availability when viewed standalone), text overflow at the stated coordinates, and visual parity with the published v1 style are **unverified**. Human visual QA required before upload — open each SVG locally, check label fit and font fallbacks, then re-export/upload to Sanity per the image naming convention.
