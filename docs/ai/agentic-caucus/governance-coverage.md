# Agentic Caucus — Governance Coverage

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** June 2026
**Related:** [[methodology]] (`docs/ai/agentic-caucus/methodology.md`), [[failure-modes]] (`docs/ai/agentic-caucus/failure-modes.md`), [[incident-log]] (`docs/ai/agentic-caucus/incident-log.md`), [[data-handling]] (`docs/ai/agentic-caucus/data-handling.md`)

---

## Purpose

This document maps the Agentic Caucus against a common six-layer AI governance model
(AI Inventory, Data Foundation, Data Security and Access, Model Assurance, Human
Oversight, Compliance and Audit). It records what the Caucus owns, what it inherits from
its platforms, and what is out of scope by design.

The point of writing it down is legibility. An implicit posture reads as an oversight to
anyone who did not build it. A documented posture reads as a decision.

---

## The Shape of This Coverage

The six-layer model assumes an organisation that trains and deploys its own models on its
own data. The Agentic Caucus does neither. It consumes third-party frontier models (Claude,
ChatGPT, Gemini) as a development methodology. Nothing is trained here; the only models
deployed to end users are the absence of any (the site runs no inference at request time).

That changes which layers apply:

- **Strong, owned in code:** the layers about inventory, human judgement, and audit. These
  are where a one-person platform's real risk lives, and they are exactly the layers the
  source model says most teams skip.
- **Inherited from platform:** data security primitives (encryption, key management). Owned
  by Sanity, GitHub, Netlify, and the model providers, not rebuilt locally.
- **Not applicable by design:** the model-training layers (bias screening, fairness testing,
  model benchmarking) and regulatory mapping for high-risk AI systems. There is no training
  corpus to screen and no high-risk system to map.

The Caucus's compliance layer is enforced policy, not a policy document. `CLAUDE.md`,
pre-commit hooks, and the validator suite are the enforcement. A rule that cannot be enforced
is not governance, and the Caucus does not keep rules it cannot enforce.

---

## Coverage Map

Each of the 30 components is marked: **Strong** (owned in code), **Partial** (covered but
informal), **Inherited** (delegated to a platform), **Gap** (worth filling, see below), or
**N/A** (out of scope by design).

### Layer 1 — AI Inventory · Strong

| Component | Status | What covers it |
|---|---|---|
| Shadow-AI detection | Strong | Every agent is named and deliberately deployed. The methodology is itself the inventory. |
| System classification | Strong | Agents classified by role (Architect, Integrator, Strategist) in [[methodology]]. |
| Risk tiering | Strong | Four tiers (A–D) mapped to gates in [[risk-tiers]]. |
| Ownership assignment | Strong | Single owner (Bex). Decision authority is explicit in `CLAUDE.md`. |
| Model registry | Strong | Per-agent cards with model and surface in [[agent-cards]]. |

### Layer 2 — Data Foundation · Partial

| Component | Status | What covers it |
|---|---|---|
| Source tracking | Strong | Git is source of truth. Content is written verbatim, no AI rewriting pipeline. |
| Lineage mapping | Partial | Epic doc, commit, ship doc trace decision lineage. The node schema documents session lineage. |
| Quality validation | Strong | `validate:tokens`, `validate:content`, `validate:urls`, lint, anti-slop checks. |
| Freshness monitoring | Partial | "Context degrades" is a documented failure mode; `/morning` re-establishes ground truth. No systematic monitor. |
| Data bias screening | N/A | No training corpus. Editorial bias is human-reviewed at the Content Write Gate. |

### Layer 3 — Data Security and Access · Inherited

| Component | Status | What covers it |
|---|---|---|
| Encryption | Inherited | Owned by Sanity, GitHub, Netlify, and the model providers. |
| Anonymization | N/A | No PII pipeline of consequence. |
| Role-based access | Partial | Draft and published separation; Sanity perspectives; human-publishes gate. |
| Least privilege | Strong | Agents propose; the human commits and publishes. MCP write gates. |
| Key management | Inherited | Platform-level. |

### Layer 4 — Model Assurance · Partial

| Component | Status | What covers it |
|---|---|---|
| Model cards | Strong | Per-agent cards with model, surface, and failure-mode cross-refs in [[agent-cards]]. |
| Performance benchmarks | N/A | Tool selection is observed-heuristic, which is right-sized. Product perf (Chromatic, CWV) is separate. |
| Fairness testing | N/A | No model fairness in scope. |
| Red-teaming | Partial | Adversarial verify patterns, no-speculative-fixes rule, validators acting as adversaries. |
| Drift detection | Strong | "Context degrades mid-session" is a documented drift mode with mitigation. `validate:style-mirror` catches token and style drift. |

### Layer 5 — Human Oversight · Strong (signature layer)

| Component | Status | What covers it |
|---|---|---|
| Decision review | Strong | Epic gates, Phase 0 mock gate, Visual QA gate, Content Write Gate. |
| Escalation paths | Strong | Stop-and-surface rules; incomplete-epic hard stops. |
| Override authority | Strong | "Agents propose. Bex decides." In writing, in `CLAUDE.md`. |
| Output validation | Strong | Validator suite, human QA gates, anti-slop checks. |
| Accountability mapping | Strong | Single owner; Linear tracking; ship docs; commit attribution. |

### Layer 6 — Compliance and Audit · Strong on enforcement and audit

| Component | Status | What covers it |
|---|---|---|
| EU AI Act mapping | N/A | No high-risk AI system deployed, nothing trained. |
| GDPR alignment | Partial | Site-level privacy policy plus a data-handling note for the AI layer ([[data-handling]]): collection points, processors, build-only AI boundary. Not a formal DPIA. |
| Policy enforcement | Strong | `CLAUDE.md` is enforced policy: pre-commit hooks, validators, gates. |
| Incident reporting | Strong | Standing append-only [[incident-log]] with a defined format; `failure-modes.md` and session post-mortems feed it. No longer ad hoc. |
| Audit trails | Strong | Git history, Linear, ship docs, CHANGELOG, the node schema. Everything is logged. |

### Tally

| Status | Count |
|---|---|
| Strong (owned in code) | 18 |
| Partial | 5 |
| Inherited from platform | 2 |
| Gap to fill | 0 |
| N/A by design | 5 |

Over half the components are strongly owned, with the strong coverage concentrated on the
inventory, oversight, and audit layers. Both previously-open fills are now closed: the GDPR
data-handling note ([[data-handling]]) and the standing incident log ([[incident-log]]). No
Gap-status components remain; what is left is Partial coverage that is informal by choice and
the layers that are N/A by design.

---

## Gaps Worth Filling

Cheap, high-leverage, and they close coverage that is already most of the way built.

1. **Risk tiering (Layer 1).** Done. Four tiers mapped to existing gates in [[risk-tiers]].

2. **Agent cards (Layer 4).** Done. Per-agent registry with model, surface, and failure-mode
   cross-references in [[agent-cards]].

3. **Standing incident log (Layer 6).** Done. Confirmed failures now have one append-only
   home in [[incident-log]], with a defined format and the failure-mode/incident distinction
   documented. Markdown doc (no schema), seeded with two dated incidents.

4. **Data-handling note (Layer 6, GDPR).** Done. [[data-handling]] records the three
   collection points (contact form, analytics, hosting logs), the verified analytics
   behaviour, the build-only AI boundary, and the third-party processor list.

---

## Gaps Not Worth Filling

Named here so they read as decisions, not oversights.

- **EU AI Act mapping.** No high-risk AI system is deployed and nothing is trained. Premature.
- **Bias screening, fairness testing, model benchmarking.** No training pipeline exists. These
  are N/A, not gaps.
- **Encryption, key management, anonymization.** Correctly inherited from Sanity, GitHub,
  Netlify, and the model providers. The right action is to document the reliance, not rebuild it.

---

## Changelog

### v1.1 — 30 June 2026
SUG-198. Closed the two remaining fills: GDPR row Gap → Partial ([[data-handling]]) and
Incident reporting Partial → Strong ([[incident-log]]). Tally updated (Strong 17 → 18, Gap
1 → 0). "Gaps Worth Filling" items 3 and 4 marked Done.

### v1.0 — June 2026
Initial document. Coverage mapped against a six-layer AI governance model. Tally, four
recommended fills, and an explicit out-of-scope list recorded.
