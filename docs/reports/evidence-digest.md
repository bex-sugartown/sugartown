# Evidence Digest — monthly product signal

Moved here 2026-08-05 from `docs/backlog/sugartown-backlog-priorities.md`, which was
retired. That file duplicated Linear by hand; this digest was the only content in it with
no other home, because it is generated from the stats pipeline rather than from Linear.

Written by `scripts/monthly-evidence-digest.js` (SUG-241). Pairs with the process feedback
loop in `docs/conventions/feedback-loop.md`.

---

## 📊 Evidence Digest — monthly product signal

> Written by `scripts/monthly-evidence-digest.js` (SUG-241) from real `stats.json`
> pipeline data. Every number traces to a live source; a source that's down writes
> `unavailable`, never a defaulted zero. Newest first.

### 2026-08-05

- **Performance:** 84/100 (homepage, desktop Lighthouse)
- **Security:** 0 known vulnerabilities
- **Content:** 85 published documents (article + node + caseStudy + page)
- **Backlog:** 59 open Linear items
- **Gate liveness:** last CI run on `main` concluded `success` (2026-08-04, run 30931492015)

Homepage Lighthouse performance held at 84/100 (desktop) with 0 known dependency vulnerabilities. 85 published documents across article, node, case study, and page types; the Linear backlog holds 59 open items not yet started. Field data (CrUX) remains unavailable this month (no-api-key) — this loop still runs on lab data (Lighthouse) alone. Source: stats.json generated 2026-08-05. The most recent CI run on `main` passed (run 30931492015, 2026-08-04), so the figures above were measured by a pipeline known to be working.

### 2026-07-25

- **Performance:** 95/100 (homepage, desktop Lighthouse)
- **Security:** 0 known vulnerabilities
- **Content:** 85 published documents (article + node + caseStudy + page)
- **Backlog:** 44 open Linear items

Homepage Lighthouse performance held at 95/100 (desktop) with 0 known dependency vulnerabilities. 85 published documents across article, node, case study, and page types; the Linear backlog holds 44 open items not yet started. Field data (CrUX) remains unavailable this month (no-api-key) — this loop still runs on lab data (Lighthouse) alone. Source: stats.json generated 2026-07-25.

### 2026-06-25

- **Performance:** 85/100 (homepage, desktop Lighthouse)
- **Security:** 0 known vulnerabilities
- **Content:** 85 published documents (article + node + caseStudy + page)
- **Backlog:** 29 open Linear items

Homepage Lighthouse performance held at 85/100 (desktop) with 0 known dependency vulnerabilities. 85 published documents across article, node, case study, and page types; the Linear backlog holds 29 open items not yet started. Field data (CrUX) remains unavailable this month (no-data) — this loop still runs on lab data (Lighthouse) alone. Source: stats.json generated 2026-06-25.

---
