---
**Epic:** SUG-128 — Contentful POC — custom domain on Vercel (poc.sugartown.io)
**Linear Issue:** [SUG-128](https://linear.app/sugartown/issue/SUG-128/contentful-poc-custom-domain-on-vercel-pocsugartownio)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-128 — Contentful POC — custom domain on Vercel (poc.sugartown.io)

Add a custom subdomain (poc.sugartown.io or similar) to the contentful-poc Vercel deployment so the POC is accessible at a stable, shareable URL rather than a generated vercel.app address.

## Background

The `apps/contentful-poc` Next.js app is deployed to Vercel as part of SUG-127. It currently only has a generated `*.vercel.app` URL, which is not shareable as a professional reference or job interview artifact. A custom subdomain under `sugartown.io` makes the POC presentable, stable across redeployments, and consistent with the broader Sugartown domain identity.

The `sugartown.io` domain is managed via DNS (likely Cloudflare or similar). Vercel supports custom domains by adding a CNAME record pointing the subdomain to `cname.vercel-dns.com` and confirming it in the Vercel dashboard.

## Objective

After this epic, `poc.sugartown.io` (or an agreed alternative) resolves to the contentful-poc Vercel deployment over HTTPS. The URL is stable across future Vercel redeployments and can be shared as a live POC reference.

## Scope

- [ ] Agree on subdomain name — `poc.sugartown.io` is the proposal; confirm with Bex — layer: DNS / infra decision
- [ ] Add custom domain in Vercel dashboard for the contentful-poc project — layer: Vercel infra
- [ ] Add DNS CNAME record: `poc` → `cname.vercel-dns.com` — layer: DNS
- [ ] Verify SSL certificate auto-provisioned and domain resolves correctly — layer: infra validation
- [ ] Update `docs/briefs/SUG-127-architecture-decisions.md` to record the live URL — layer: docs

## Acceptance criteria

- [ ] `https://poc.sugartown.io` (or confirmed subdomain) loads the contentful-poc app with valid SSL
- [ ] URL is stable — a fresh Vercel deployment does not break it
- [ ] ADR doc updated with the live URL

## Technical notes

**Steps (Bex executes in Vercel dashboard + DNS provider):**
1. In Vercel: open the `contentful-poc` project → Settings → Domains → Add `poc.sugartown.io`
2. Vercel will show the required CNAME: `poc` → `cname.vercel-dns.com`
3. In DNS provider (Cloudflare or equivalent): add CNAME record for `poc` pointing to `cname.vercel-dns.com`
4. Wait for propagation (usually < 5 min on Cloudflare); Vercel auto-provisions SSL
5. Verify in browser

**No code changes required** — this is a pure infra/DNS task. The Next.js app does not need a `NEXT_PUBLIC_BASE_URL` update for the POC (no internal absolute URL references). If absolute URLs are needed in future (e.g. OG meta tags), add `NEXT_PUBLIC_BASE_URL=https://poc.sugartown.io` to the Vercel environment variables at that point.

**Model & Mode [REQUIRED]:** `/model sonnet` — no code changes, pure infra confirmation and doc update.

## Non-Goals

- No changes to `apps/web` or the main Sugartown Netlify deployment
- No redirect from `vercel.app` URL — the generated URL can remain active
- No environment variable changes unless absolute URLs are needed (see Technical notes)

## Related

- **Linear:** [SUG-128](https://linear.app/sugartown/issue/SUG-128/contentful-poc-custom-domain-on-vercel-pocsugartownio)
- **Parent epic:** [SUG-127](https://linear.app/sugartown/issue/SUG-127/contentful-vercel-poc-platform-vendor-evaluation) — Contentful + Vercel POC
- **Epic template:** `docs/epic-template.md`
