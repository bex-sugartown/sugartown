# Repo map

What the repo is and where its load-bearing files are. Imported into every session by
`CLAUDE.md` (`@docs/ai/repo-map.md`), so it travels with the repo rather than living in one
machine's memory (ST-112). Facts only; rules live in `CLAUDE.md` and `.claude/rules/`. Every
path below exists; re-check with `ls` before adding one.

## Stack

| Layer | Where | What |
|---|---|---|
| Monorepo | root | pnpm workspaces + Turbo; `pnpm <task>` at root fans out |
| Web app | `apps/web` | React 19, Vite 7, react-router-dom 7 (BrowserRouter, SPA); deployed by Netlify from `main` |
| CMS | `apps/studio` | Sanity Studio v5; project `poalmzla`, dataset `production` |
| Design system | `packages/design-system` | tokens, primitives, patterns; consumed by `apps/web` |
| Storybook | `apps/storybook`, `packages/storybook-docs` | component stories and Guidelines docs; Chromatic VRT |
| Contentful POC | `apps/contentful-poc` | Next.js proof of concept, separate from the Sanity site |
| MCP server | `packages/mcp-server` | local tools: schema, tokens, component, boundary, rule, field, epic, changelog |

## Key files

| Concern | File |
|---|---|
| Route registry, URL authority | `apps/web/src/lib/routes.js` |
| GROQ queries | `apps/web/src/lib/queries.js` |
| Sanity client | `apps/web/src/lib/sanity.js` |
| Sanity data hooks | `apps/web/src/lib/useSanityDoc.js` |
| Filter model | `apps/web/src/lib/filterModel.js` |
| App router (all routes) | `apps/web/src/App.jsx` |
| Entry | `apps/web/src/main.jsx` |
| Page templates | `apps/web/src/pages/` |
| Section renderer | `apps/web/src/components/PageSections.jsx` |
| Token source of truth | `tokens/source/tokens.json` → `pnpm tokens:build` → both `tokens.css` copies |
| Studio schemas | `apps/studio/schemas/` |
| Generated stats (CI-committed) | `apps/web/src/generated/stats.json` |

## Validators

| Command | Script | Catches |
|---|---|---|
| `pnpm validate:urls` | `apps/web/scripts/validate-urls.js` | hard-coded paths outside the route registry |
| `pnpm validate:filters` | `apps/web/scripts/validate-filters.js` | filter model drift |
| `pnpm validate:content` | `apps/web/scripts/validate-content.js` | missing slugs and required fields, orphaned taxonomy refs, duplicate slugs, HTML entities in Portable Text |
| `pnpm validate:tokens` | `apps/web/scripts/validate-tokens.js` | `var(--st-*)` references that resolve to nothing; `--strict-colors` adds raw colour values |
| `pnpm validate:style-mirror` | `apps/web/scripts/validate-style-mirror.js` | drift between the two copies of the hand-authored style files |
| `pnpm validate:liveness-probes` | `scripts/validate-liveness-probes.js` | a gate that stays green on known-bad input |
| `pnpm docs:skills-index --check` | `scripts/build-skills-index.js` | a stale skills index |

## Docs

| Folder | Holds |
|---|---|
| `docs/backlog/`, `docs/shipped/` | epic docs, in flight and done |
| `docs/briefs/` | PRDs and briefs |
| `docs/conventions/` | the fuller Sugartown conventions the shared `conventions/` files were generalised from |
| `docs/workflows/`, `docs/ship-prompt.md` | the prompts behind `/morning`, `/ship`, `/release` |
| `docs/ai/` | skills index, agentic-caucus, this map |
| `docs/drafts/` | local only, gitignored |
