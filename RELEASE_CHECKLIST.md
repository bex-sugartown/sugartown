# Release Checklist

Use this checklist before every merge to `main`. All items must pass before the PR is approved.

---

## 1. Branch Hygiene

- [ ] Working from a feature branch (not directly on `main`)
- [ ] Branch is up to date with `main` (`git pull origin main`)
- [ ] No unresolved merge conflicts

---

## 2. Version Bump

- [ ] `package.json` version updated (root and/or `apps/web`) following SemVer:
  - `MAJOR.MINOR.PATCH` — breaking / feature / fix
- [ ] Version bump committed separately, or included in final commit

---

## 3. CHANGELOG

- [ ] `CHANGELOG.md` updated under the correct version heading
- [ ] Entry follows [Keep a Changelog](https://keepachangelog.com/) format: `Added`, `Changed`, `Fixed`, `Removed`
- [ ] Date is correct (`YYYY-MM-DD`)

---

## 4. Validation Scripts

Run each script and confirm it exits 0:

```bash
pnpm validate:urls
pnpm validate:filters
```

- [ ] `validate:urls` passes (no duplicate slugs, no broken nav items)
- [ ] `validate:filters` passes (all archive pages produce valid FilterModel)

If either script fails, fix the underlying content or schema issue before proceeding.

---

## 5. Lint & Type Check

```bash
pnpm lint
pnpm typecheck
```

- [ ] `pnpm lint` — no ESLint errors in any workspace
- [ ] `pnpm typecheck` — no TypeScript errors in any workspace

---

## 6. Build

```bash
pnpm build
```

- [ ] Build succeeds across all workspaces

---

## 7. Smoke Test (local)

- [ ] `pnpm dev` starts without errors
- [ ] Key routes load in browser:
  - [ ] `/` — homepage
  - [ ] `/articles` — article archive
  - [ ] `/knowledge-graph` — knowledge graph archive
  - [ ] One article detail page (`/articles/:slug`)
  - [ ] One node detail page (`/nodes/:slug`)
- [ ] No console errors on any route above

---

## 8. CI

- [ ] GitHub Actions CI passes on the PR (`Lint · Typecheck · Validate · Build`)
- [ ] All status checks green before merge

---

## 9. Deployment (manual — post-merge)

Deployment is not automated. After merging to `main`:

- [ ] Verify deployment completes (check hosting dashboard)
- [ ] Spot-check production URL for the primary change
- [ ] Confirm no regressions on `/`, `/articles`, `/knowledge-graph`

---

## Notes

- `pnpm format` (Prettier) is **not** a CI gate — run locally before committing
- Storybook build is **not** included in the release pipeline
- Sanity Studio deployment is **separate** from `apps/web` deployment

---

*See `docs/operations/ci.md` for full CI pipeline documentation.*
