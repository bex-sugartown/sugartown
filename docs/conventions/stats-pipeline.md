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

| Namespace       | Source                                | Freshness      | Phase | Env guard           |
|-----------------|---------------------------------------|----------------|-------|---------------------|
| `release`       | `CHANGELOG.md`                        | Every build    | 1a    | —                   |
| `ds`            | `tokens.css` + component CSS dirs     | Every build    | 1a    | —                   |
| `storybook`     | `*.stories.*` file walk               | Every build    | 1a    | —                   |
| `repo`          | `git rev-list` + `docs/shipped/`      | Every build    | 1a    | —                   |
| `security`      | `pnpm audit --json`                   | Daily CI       | 1b    | —                   |
| `sanity`        | Sanity GROQ count queries             | Daily CI       | 1b    | `VITE_SANITY_TOKEN` |
| `github`        | GitHub REST API (public)              | Daily CI       | 1b    | `GITHUB_TOKEN`      |
| `crux`          | Chrome UX Report API (origin)         | Daily CI       | 1b    | `CRUX_API_KEY`      |
| `perf`          | Lighthouse CI JSON (`.lighthouseci/`) | Daily CI       | 1b    | —                   |
| `siteGraph`     | Sanity GROQ relationship queries      | Daily CI       | 1b    | `VITE_SANITY_TOKEN` |
| `githubRoadmap` | GitHub Projects v2 GraphQL API        | Daily CI       | 1b    | `GH_PROJECTS_TOKEN` |
| `ga4`           | Google Analytics Data API             | Phase 2        | 2     | —                   |
| `gsc`           | Google Search Console API             | Phase 2        | 2     | —                   |

---

## How it works

```
 LOCAL (every build)          NETWORK (daily CI)
 ───────────────────          ──────────────────
 CHANGELOG.md         ──┐    pnpm audit          ──┐
 tokens.css           ──┤    Sanity GROQ          ──┤
 *.stories.*          ──┤    GitHub REST API      ──┤
 docs/shipped/        ──┤    CrUX API             ──┤
 git rev-list         ──┘    .lighthouseci/       ──┤
                             GitHub Projects GraphQL──┘
          │                          │
          └──────────┬───────────────┘
                     ▼
          scripts/collect-stats.js
          (orchestrator)
                     │
          ┌──────────┴──────────┐
          │  for each network   │
          │  collector:         │
          │                     │
          │  success? ──────────┼──► write key to last-good.json
          │                     │    (never overwritten on failure)
          │  stale/skip? ───────┼──► read from last-good.json
          │                     │    └─► fallback: existing stats.json
          └──────────┬──────────┘
                     │
          ┌──────────┴─────────────────────────────┐
          │                                        │
          ▼                                        ▼
  src/generated/stats.json            src/generated/stats.last-good.json
  (full merged output,                (per-collector success cache —
   read by all pages)                  write-once-on-success only,
                                       survives keyless CI runs)
          │
   ┌──────┴──────┐
   │  static     │  stats.js (lib)
   │  import     │
   └──────┬──────┘
          │  interpolateStatsVars(text, data)
          │  preprocessPortableText(blocks)
          ▼
  <PortableText value={...} />
  GovernancePage, PlatformHubPage, etc.
```

---

## File locations

| File | Purpose |
|------|---------|
| `apps/web/scripts/collect-stats.js` | Orchestrator — runs all collectors, merges output, manages last-good cache |
| `apps/web/scripts/stats/changelog.js` | `release` namespace |
| `apps/web/scripts/stats/design-system.js` | `ds` namespace |
| `apps/web/scripts/stats/storybook.js` | `storybook` namespace |
| `apps/web/scripts/stats/repo.js` | `repo` namespace |
| `apps/web/scripts/stats/security.js` | `security` namespace |
| `apps/web/scripts/stats/sanity.js` | `sanity` namespace |
| `apps/web/scripts/stats/github.js` | `github` namespace |
| `apps/web/scripts/stats/crux.js` | `crux` namespace |
| `apps/web/scripts/stats/perf.js` | `perf` namespace (reads `.lighthouseci/`) |
| `apps/web/scripts/stats/github-projects.js` | `githubRoadmap` namespace |
| `apps/web/scripts/stats/graph.js` | `siteGraph` namespace |
| `apps/web/src/lib/stats.js` | Exports `stats`, helpers, `interpolateStatsVars`, `useStats` |
| `apps/web/src/lib/portableTextStatsVars.js` | `preprocessPortableText(blocks)` |
| `apps/web/vite.config.js` | `sugartown:stats` plugin — runs collector on `buildStart` |
| `lighthouserc.cjs` | Lighthouse CI config (pages to audit, thresholds) |
| `.github/workflows/stats.yml` | Daily CI workflow — network collectors + commit |
| `apps/web/src/generated/stats.json` | Full merged output (gitignored — regenerated every build) |
| `apps/web/src/generated/stats.last-good.json` | Per-collector success cache (gitignored — write-once-on-success) |

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
| Network — fresh success | Writes to `stats.json` + `stats.last-good.json` | Full data |
| Network — stale/failed | Reads from `stats.last-good.json`, then `stats.json` | Previous good data |
| Network — env var missing, last-good exists | Skips collector entirely | Previous good data, no API call |
| Network — env var missing, no last-good | Writes empty/stale to `stats.json` | Page shows "pending" |

**The last-good cache** (`stats.last-good.json`) is the key defence against data loss.
It is written only when a collector returns fresh data — a failed or keyless CI run
never touches it. This means a CI run with a missing `GH_PROJECTS_TOKEN` cannot overwrite
a previously successful roadmap fetch. The fallback chain is:

```
fresh collector result
    → last-good (most recent successful fetch, per collector)
        → existing stats.json (full previous run)
            → stale marker (page renders "pending" state)
```

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
| `GH_PROJECTS_TOKEN` | `githubRoadmap` collector — fine-grained PAT with Projects read access. The default `GITHUB_TOKEN` cannot reach Projects v2 data; no `permissions:` block scope covers it (ST-117). |

---

## Collector-specific notes

### `githubRoadmap`

- Env var name in collector: `GH_PROJECTS_TOKEN`
- GitHub secret name: `GH_PROJECTS_TOKEN` (mapped in `stats.yml`)
- Auth: `Authorization: Bearer <token>` header against `api.github.com/graphql`
- Query: fetches project 1's items via `user(login:) { projectV2(number:) { items } }` — `bex-sugartown` is a user account, not an org, so `user(login:)` is required (`organization(login:)` 404s). Groups by the board's own `Status` field (`In Progress`, `Todo`/`Backlog`, `Done`/`Shipped`); `On Hold`/`Canceled` excluded from every bucket.
- Diagnosis: if `githubRoadmap.stale === true` in stats.json after a CI run, check the `Collect all stats` step log for `[stats] githubProjects: GH_PROJECTS_TOKEN not set` or a GraphQL error. Replaced `linearRoadmap`/`linear.js` (ST-117, 2026-09-05).

### `crux`

- Env var: `CRUX_API_KEY`
- GitHub secret name: `CRUX_API_KEY`
- When the origin has insufficient real-user traffic, the API returns 404 → collector sets `available: false, reason: "no-data"`. This is expected for new sites. The UI falls back to `CRUX_BACKUP` (pre-launch estimated values) and labels them "estimated · pre-launch".
- When the API key is missing entirely, the API returns 403 → collector sets `available: false, reason: "no-api-key"`.
- Real CrUX data will appear automatically once sugartown.io has sufficient Chrome user traffic.
