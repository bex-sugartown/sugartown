# Ecom / Platform Reference — PRD Writer

Use this file when writing a PRD for work that touches commerce integrations, platform
architecture, multi-system data flows, or capability/services positioning.

---

## Core Principle: Data Authority Map

Every ecom/platform PRD must define which system **owns** each piece of data.
Ownership is singular. A field cannot be "managed in both" — that's a sync problem waiting
to happen.

| Data type | Owner | Read by | Write by | Notes |
|-----------|-------|---------|----------|-------|
| Editorial copy | Sanity | Frontend | Editors in Studio | Title, description, rich text |
| Price | Commerce API | Frontend | Commerce platform | Never cache longer than ISR interval |
| Inventory / stock | Commerce API | Frontend | Commerce platform | Real-time or near-real-time |
| Product images | Sanity or Commerce | Frontend | State explicitly | Must not be ambiguous |
| SKU / variant structure | Commerce API | Frontend + Sanity refs | Commerce platform | Sanity may reference by ID |

Fill this table for every new integration. Ambiguity here becomes a production incident.

---

## Integration Contract Requirements

For every third-party API in scope, specify:

| Contract element | Required in PRD |
|-----------------|-----------------|
| API name + version | Yes |
| Auth method (API key, OAuth, webhook secret) | Yes |
| Endpoint pattern (base URL + relevant paths) | Yes |
| Rate limits (requests/second or requests/day) | Yes — drives caching strategy |
| Payload shape (key fields only, not full schema) | Yes — enough to write the GROQ projection |
| Error response shape | Yes — needed for fallback behaviour spec |

Do not leave "TBD" on rate limits or auth method. These block implementation.

---

## Cache / Revalidation Strategy

State one of these three patterns explicitly. "TBD" blocks the render layer decision.

| Pattern | When to use | ISR interval |
|---------|-------------|-------------|
| **ISR (time-based)** | Data changes infrequently; eventual consistency acceptable | State the interval (e.g. 60s, 3600s) |
| **Webhook-triggered revalidation** | Data changes are event-driven; near-real-time expected | Name the webhook source and target endpoint |
| **Static** | Data never changes post-build | — |
| **Client-side (CSR)** | Real-time required; SEO not a concern for this data | Name which fields are client-side only |

Mixed patterns are common (editorial = ISR/static; price/inventory = CSR). State each
field's strategy if they differ.

---

## Fallback Behaviour

Required for every integration. "Show an error" is not a fallback spec.

Specify:
- What renders if the API returns a non-200 response
- What renders if the API times out
- What renders if a required field is null or absent
- Whether the page renders at all, or 404s/500s

---

## Platform Architecture Patterns

### Headless Commerce

- Sanity owns editorial; commerce API owns transactional
- Product detail pages are driven by a Sanity document that **references** the commerce product by ID
- Price and inventory are fetched client-side or at revalidation time — never stored in Sanity
- Cart and checkout live outside the Sugartown front-end (external checkout, or commerce platform handles)

### Services / Consulting Positioning

- Sugartown is FTE-first; consulting is secondary and stated confidently, not urgently
- "Available for contract" not "seeking contract"
- Platform page framing: site-as-platform, cross-references to real shipped governance artifacts
- No future-tense promises on shipped pages; deferments stated as "not in scope"

### Capability Pages

For pages that describe what Sugartown does (services, platform, about):
- Every capability claim must link to a real, shipped artifact
- Version numbers on the page must match actual current release
- Governance artifacts inventory must be checked before writing (see `platform-content-brief.md`)

---

## Common PRD Failure Modes (Ecom/Platform Domain)

- Data authority map missing — engineers implement caching for data the commerce API owns;
  staleness bugs in production
- Rate limits not specified — caching strategy chosen without knowing the constraint; API
  quota exceeded in first week
- Fallback behaviour unspecified — product detail page throws a 500 when commerce API is slow
- "Both systems manage this" — split-brain data problem; avoid by assigning clear ownership
- Future-tense promises on services/platform pages — "will support X" when X is not in scope;
  violates the brand voice hard rule on shipped surfaces
