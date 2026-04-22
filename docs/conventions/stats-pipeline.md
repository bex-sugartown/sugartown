# Stats Pipeline — SUG-67

The trust reporting pipeline collects build-time and network data from six+ sources
and makes it available to any page or PortableText body via a `{{token}}` syntax.

---

## Token syntax

Anywhere a PortableText body is rendered, you can write:

```
{{release.current.version}}     → "0.22.1"
{{ds.tokens.total}}             → "593"
{{storybook.stories}}           → "5"
{{repo.commits}}                → "679"
{{repo.epicsShipped}}           → "63"
{{sanity.counts.article}}       → "8"
{{security.vulnerabilities.total}} → "0"
{{github.openIssues}}           → "11"
{{perf.runs.homepage.lcp}}      → "1820"
{{crux.lcp.rating}}             → "good"
```

Tokens use dot-path notation into `stats.json`. Unknown tokens render as their
literal `{{token}}` form in dev (fail-visible), and are stripped in production.

---

## Namespaces

| Namespace   | Source                                | Freshness      | Phase |
|-------------|---------------------------------------|----------------|-------|
| `release`   | `CHANGELOG.md`                        | Every build    | 1a    |
| `ds`        | `tokens.css` + component CSS dirs     | Every build    | 1a    |
| `storybook` | `*.stories.*` file walk               | Every build    | 1a    |
| `repo`      | `git rev-list` + `docs/shipped/`      | Every build    | 1a    |
| `security`  | `pnpm audit --json`                   | Daily CI       | 1b    |
| `sanity`    | Sanity GROQ count queries             | Daily CI       | 1b    |
| `github`    | GitHub REST API (public)              | Daily CI       | 1b    |
| `crux`      | Chrome UX Report API (origin)         | Daily CI       | 1b    |
| `perf`      | Lighthouse CI JSON (`.lighthouseci/`) | Daily CI       | 1b    |
| `ga4`       | Google Analytics Data API             | Phase 2        | 2     |
| `gsc`       | Google Search Console API             | Phase 2        | 2     |

---

## How it works

```
CHANGELOG.md         ──┐
tokens.css           ──┤
*.stories.*          ──┤   scripts/collect-stats.js
docs/shipped/        ──┤   (orchestrator)
git rev-list         ──┘         │
                                 │
pnpm audit           ──┐         │  writes
Sanity GROQ          ──┤   (CI)  │
GitHub REST API      ──┤  stats  │
CrUX API             ──┤  workflow
.lighthouseci/       ──┘         │
                                 ▼
                     apps/web/src/generated/stats.json
                                 │
                          stats.js (lib)
                                 │
                     interpolateStatsVars(text, data)
                                 │
                     preprocessPortableText(blocks)
                                 │
                         <PortableText value={...} />
```

---

## File locations

| File | Purpose |
|------|---------|
| `apps/web/scripts/collect-stats.js` | Orchestrator — runs all collectors, merges output |
| `apps/web/scripts/stats/changelog.js` | `release` namespace |
| `apps/web/scripts/stats/design-system.js` | `ds` namespace |
| `apps/web/scripts/stats/storybook.js` | `storybook` namespace |
| `apps/web/scripts/stats/repo.js` | `repo` namespace |
| `apps/web/scripts/stats/security.js` | `security` namespace |
| `apps/web/scripts/stats/sanity.js` | `sanity` namespace |
| `apps/web/scripts/stats/github.js` | `github` namespace |
| `apps/web/scripts/stats/crux.js` | `crux` namespace |
| `apps/web/scripts/stats/perf.js` | `perf` namespace (reads `.lighthouseci/`) |
| `apps/web/src/lib/stats.js` | Exports `stats`, helpers, `interpolateStatsVars`, `useStats` |
| `apps/web/src/lib/portableTextStatsVars.js` | `preprocessPortableText(blocks)` |
| `apps/web/vite.config.js` | `sugartown:stats` plugin — runs collector on `buildStart` |
| `lighthouserc.js` | Lighthouse CI config (pages to audit, thresholds) |
| `.github/workflows/stats.yml` | Daily CI workflow — network collectors + commit |

---

## Adding a new collector

1. Create `apps/web/scripts/stats/<namespace>.js` exporting `async function collect<Namespace>()`.
2. Return an object with `fetchedAt` (for network collectors) and your data.
3. Register it in `collect-stats.js`:
   - **Local (no network):** add to the local section at the top — failure throws and fails the build.
   - **Network:** add to `networkCollectors` map — failure marks as `stale: true`, does not block.
4. Add the namespace to the table in this doc.
5. If it's a scheduled/CI collector, add any required secrets to the `stats.yml` workflow.

---

## Fail modes

| Collector type | On failure | Effect |
|----------------|-----------|--------|
| Local (`release`, `ds`, `storybook`, `repo`) | Throws | Build fails |
| Network (`perf`, `crux`, `security`, `github`, `sanity`) | `stale: true` | Build continues with stale or missing data |

Stale data from a previous CI run is preserved when the current run fails — the
orchestrator falls back to the existing `stats.json` value if the fresh result
marks itself stale.

---

## Required secrets (CI)

| Secret | Required for |
|--------|-------------|
| `VITE_SANITY_PROJECT_ID` | `sanity` collector |
| `VITE_SANITY_DATASET` | `sanity` collector |
| `VITE_SANITY_API_VERSION` | `sanity` collector |
| `VITE_SANITY_TOKEN` | `sanity` collector |
| `GITHUB_TOKEN` | `github` collector (auto-provided by Actions) |
| `CRUX_API_KEY` | `crux` collector (free-tier Google API key) |
