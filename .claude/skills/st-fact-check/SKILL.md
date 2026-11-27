---
name: st-fact-check
description: Verify the factual claims in a draft against primary sources and produce a claim table plus a human handoff list. Use when Bex says "fact-check", "check the claims", "verify this", "are these numbers right", or before publishing anything carrying figures, dates, votes, statutes or quotes. Also invoked by the write pipeline (§3d) and by /st-red-pen Pass 1. Reviews claims, never rewrites copy.
---

# Fact Check — claims against primary sources

## The rule

**Open the primary source. A secondary source is a lead, not a citation.**

A claim is verified when someone opened the document that makes it true. Not a summary of
that document, not a search snippet quoting it, not an earlier draft citing it.
(#218, 2026-11-27: five claims taken from credible secondary sources, five wrong.)

## What counts as a source

| Class | Examples | Use |
|---|---|---|
| Primary | Enacted statute on govinfo, a roll call on senate.gov, the study's own PDF, a bill record, the repo, Sanity, a command's output | Cite it |
| Secondary | News reporting, a think tank summarising its own paper, an advocacy outlet, a law firm blog, Wikipedia | Follow it to the primary, then cite that |
| Not a source | A search snippet, a prior draft, an earlier audit's table, your own memory of the field | Never cite |

A secondary source is the right place to *find* a claim and the wrong place to *rest* one.
Where no primary exists, say so in the citation rather than promoting the secondary.

## Steps

1. **List every checkable claim.** Figures, dates, counts, votes, statute and section numbers,
   quotes, names, version numbers, who did what, what shipped. A caption and an alt text are claims.
2. **Open the primary for each.** Record the document and the page, table or line.
3. **Record the outcome per claim.** `/st-red-pen` Pass 1 defines the three outcomes
   (verified, wrong, unverifiable); use those words so the two reports read the same.
4. **Produce the claim table** (below).
5. **Produce the human handoff list** (below) for whatever a session cannot reach.

## The claim table

One row per claim. Goes in the draft's citations, the epic doc, or the review report.

| Claim | Primary source opened | Page/table/line | Outcome |
|---|---|---|---|

Rules for the table:

- **A figure carries what produced it.** CLAUDE.md §Verify before citing already requires this;
  this table is where it lands for content.
- **Quote the source's own wording** for anything contested. A paraphrase of a number is a
  second chance to get it wrong.
- **Name the window.** Two studies with the same headline figure over different decades are not
  comparable, and saying so is often the finding.
- **A living fact carries a measurement date.** Positions, tallies, counts and prices go stale
  silently. CLAUDE.md §Technical diagram red-pen gate has the standing rule.

## When the primary will not open

Try these before downgrading a claim to unverifiable. All three worked on #218.

| Obstacle | Route |
|---|---|
| A PDF returns raw bytes or unreadable text to a web fetch | Copy it into `~/Downloads` and read it with the PDF reader tool, which is sandboxed to Documents, Downloads and Desktop |
| congress.gov returns 403, or a bot check | Use govinfo.gov for anything enacted, and senate.gov or clerk.house.gov for roll calls. govinfo does not carry pending bills |
| A page is paywalled or 404s | Try the publisher's own PDF, the author's copy, or a different primary. Do not quote the snippet |

**Never bypass a CAPTCHA or bot detection.** It is prohibited, and the honest alternative is a
handoff line telling Bex to open the page herself. Say "I will not" rather than "I cannot", per
`SUGARTOWN_DEV/conventions/human-instruction-style.md` (a Cowork bridge session mounts folders
separately and may not resolve it; say so rather than guessing at the standard).

## The human handoff list

Anything still unverified goes in a list written for Bex, not for a session. Follow
`human-instruction-style.md`: one action per step, name the menu before the shortcut, say what
she should see, and never send her to a terminal where a click-path exists.

Each item says: what to check, the exact URL or place, why a session could not, and what in the
draft changes if the answer differs. Separate it from a table of what is already verified, so
nothing gets checked twice.

## Output

State plainly: how many claims, how many verified against a primary, how many unverifiable, and
which ones need Bex. Then say **"Fact check complete: N claims, M verified against primary
sources, K awaiting a human."**

Never report a claim as verified because it appears in several secondary sources. Agreement
among summaries is not evidence; they usually share one upstream source, and on #218 they shared
one wrong section number.

## Scope

Claims, not prose. Voice, sharpness and structure belong to `/st-red-pen`. This skill does not
rewrite copy and does not write to Sanity.
