---
**Epic:** SUG-128 — Contentful POC — custom domain on Vercel (poc.sugartown.io)
**Linear Issue:** [SUG-128](https://linear.app/sugartown/issue/SUG-128/contentful-poc-custom-domain-on-vercel-pocsugartownio)
**Status:** Done
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

- [x] Subdomain confirmed: `poc.sugartown.io` — layer: DNS / infra decision
- [x] Add custom domain in Vercel dashboard for the contentful-poc project — layer: Vercel infra
- [x] Add DNS CNAME record in your DNS provider (Pair) — layer: DNS
- [x] Verify SSL certificate auto-provisioned and domain resolves correctly — layer: infra validation
- [x] Update `docs/briefs/SUG-127-architecture-decisions.md` to record the live URL — layer: docs

## Acceptance criteria

- [x] `https://poc.sugartown.io` loads the contentful-poc app with valid SSL
- [x] URL is stable — a fresh Vercel deployment does not break it
- [x] ADR doc updated with the live URL

## Step-by-step: Bex executes

### Step 1 — Vercel dashboard (2 min)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and open the **contentful-poc** project
2. Click **Settings** (top nav) → **Domains** (left sidebar)
3. In the "Add Domain" field, type `poc.sugartown.io` and click **Add**
4. Vercel will show a verification panel — note the CNAME values it gives you (needed in Step 2)

### Step 2 — DNS provider (2 min)

Vercel will show one of two options. Use **Option A (CNAME)** for a subdomain:

| Type | Name | Value |
|------|------|-------|
| CNAME | `poc` | `cname.vercel-dns.com` |

In your DNS provider (Cloudflare, etc.):
1. Go to the DNS records for `sugartown.io`
2. Add a new **CNAME** record:
   - Name/Host: `poc`
   - Target/Value: `cname.vercel-dns.com`
   - TTL: Auto (or 1 min on Cloudflare for fast propagation)
3. Save

**Cloudflare users:** set the proxy status to **DNS only** (grey cloud, not orange) — Vercel manages SSL itself and the orange cloud proxy interferes with certificate provisioning.

### Step 3 — Wait and verify (2–5 min)

1. Back in the Vercel Domains panel, the status will show "Pending" then flip to a green checkmark once DNS propagates
2. Vercel auto-provisions an SSL certificate via Let's Encrypt — no action needed
3. Open `https://poc.sugartown.io` in a browser — you should see the contentful-poc app

### Step 4 — Tell Claude

Once it's live, tell Claude and the ADR doc (`docs/briefs/SUG-127-architecture-decisions.md`) will be updated with the live URL, and this epic can be closed out.

## Technical notes

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
