# Agentic Caucus — Data-Handling Note

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 30 June 2026
**Related:** [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`), site Privacy / Terms / Accessibility pages

---

## Purpose

A plain-language record of what `sugartown.io` collects, who processes it, and how AI is
used in building the site. It closes the Layer 6 GDPR row in [[governance-coverage]], which
previously had a site-level privacy policy but no data-handling note for the AI layer.

This is the engineering-side source of truth. The public Privacy page is the visitor-facing
statement; this note is what it should align to. Where the two disagree, that is a finding
for the alignment pass, not a fact about the site.

---

## What the site collects

The site runs **no inference at request time** — there is no AI model in the request path
and no visitor data is sent to any model provider when a page loads or a form is submitted.
Three collection points exist:

| Source | What it collects | Mechanism | Processor |
|---|---|---|---|
| Contact form | The information you enter (your name, email address, and message) plus a reCAPTCHA token | Netlify Forms (`Form.jsx` posts `form-name` + fields + `g-recaptcha-response` to `/`) | Netlify (form storage), Google (reCAPTCHA verification) |
| Analytics | Standard Google Analytics page-view and event data, plus GA cookies | `gtag.js` loaded in `index.html` (`G-00MF2Q9YJW`) | Google Analytics |
| Hosting logs | Standard server request logs (IP, user agent, timestamp) | Netlify edge | Netlify |

**Analytics behaviour (verified, not assumed):** the GA snippet in `index.html` is
suppressed on `localhost`, `127.0.0.1`, and `*.local`, so it runs for production visitors
only. It loads on page load with the default `gtag('config', …)` — there is currently **no
cookie-consent banner and no GA consent-mode gating**. That is a fact to reconcile on the
public Privacy page during the alignment pass, not to paper over here.

The site sets no first-party accounts, stores no passwords, and runs no e-commerce checkout
at this address (the shop is a separate, parallel surface).

---

## How AI is used in the build

AI is a **development methodology**, not a site feature. The Agentic Caucus (Claude,
ChatGPT, Gemini) operates on the repository and its content during authoring and
implementation. Visitor data never enters that pipeline:

- The models read code, schemas, docs, and editorial content. They do not read form
  submissions, analytics data, or hosting logs.
- Content is written verbatim through `_from_json` tools or the Sanity client; there is no
  AI rewriting layer between authored copy and what publishes (see `CLAUDE.md` §Sanity MCP
  content writes).
- Every AI-generated output passes a human checkpoint before it ships (the Content Write
  Gate, the Visual QA gate, the human-publishes rule).

The boundary is clean: AI touches the *build*, never the *visitor*.

---

## Third-party processors

| Processor | Role | Data it sees |
|---|---|---|
| Sanity | Content Lake (CMS) | Published and draft editorial content. No visitor PII. |
| Netlify | Hosting + Forms | Request logs; contact-form submissions. |
| Google | Analytics + reCAPTCHA | Page-view/event analytics; reCAPTCHA challenge data on form submit. |
| GitHub | Source control | Repository code and history. No visitor data. |
| Anthropic / OpenAI / Google (model providers) | Build-time AI tooling | Repository and content only, at authoring time. No visitor data. |

Encryption, key management, and anonymisation primitives are inherited from these platforms,
not rebuilt locally (see [[governance-coverage]] Layer 3).

---

## User rights and contact

Data-subject requests (access, correction, deletion) and any privacy question route through
the site contact form or the address listed on the Privacy page. Retention follows each
processor's defaults: Netlify form submissions persist until manually cleared; GA data
follows the property's configured retention window.

This note is the AI-layer record. The binding public statement is the Privacy page; keeping
the two aligned is an ongoing obligation, audited in the SUG-198 Phase 3 alignment pass.

---

## Changelog

### v1.0 — 30 June 2026
Initial document (SUG-198). Records the three collection points (contact form, analytics,
hosting logs), the verified GA suppression-but-no-consent-banner behaviour, the build-only
AI boundary, and the third-party processor list. Closes the Layer 6 GDPR data-handling gap
in [[governance-coverage]].
