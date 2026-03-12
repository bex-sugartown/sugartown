# Sugartown Pink Design System — Product Requirements Document (PRD) 2.0

| Metadata | Details |
| :--- | :--- |
| **Document** | Sugartown Pink Design System PRD |
| **PRD Version** | **2.0 — Sanity Claus** |
| **PRD Status** | 🟢 Active / Stable |
| **Owner** | Product |
| **Primary Repo** | `sugartown-frontend` |
| **Scope** | Design System (Portable, CMS-Agnostic) |
| **Related Standards** | Design System Contracts (Appendix A), Token Architecture Spec |
| **Related Gems** | [Gem 21: The Pre-Design System](/gem/design-ops-the-pre-design-system-surviving-the-css-chaos) |
| **Supersedes** | PRD v1.5 |
| **Last Reviewed** | 2026-01-19 |

> **Reference Implementation Note:** Known current token values and component behaviors in this PRD are grounded in the existing `sugartown-pink/style.css` theme implementation. :contentReference[oaicite:0]{index=0}
>
> **Versioning Note**
> PRD versions are semantic and track the evolution of system intent and constraints.
> Production releases follow calendar-based versioning (`vYYYY.MM.DD`) and are documented separately in `CHANGELOG.md`.
> 

---

## 1. Overview

Sugartown Pink is a **portable, stateless mini design system** designed to exist independently of any single CMS, theme, or rendering runtime. Today it is incubated inside a WordPress theme (based on Twenty Twenty-Five), but the north-star architecture is a **CMS-agnostic system** with a **single source of truth** for tokens, component contracts, and documentation.

Architectural philosophy:
- **Single Source of Truth:** Tokens and contracts are authoritative; renderers are implementation details.
- **Stateless Components:** Components render deterministically from input; no hidden platform dependencies.
- **Canonical + Idempotent:** Canonical component structures produce stable markup, enabling predictable styling and easy migration.
- **Subtle Tech:** Quiet precision, restrained color usage, standardized elevation, and interaction consistency.

---

## 2. Problem Statement

- The current state blends **theme styling** and **design system rules**, creating ambiguous ownership.
- Component behavior can drift across surfaces without a single canonical contract.
- Light mode needs explicit governance to avoid **contrast failures**, especially for brand pink usage.
- Token usage is partially standardized, but not fully enforced across all UI primitives.
- Lack of standardized scales (spacing, typography, radius) leads to one-off values and inconsistent rhythm.
- Migration risk increases when markup/styling depends on WordPress block wrappers or editor-generated DOM.

---

## 3. Goals & Non-Goals

| Goal | Description |
|---|---|
| Portability | System can be extracted from WordPress with minimal refactor; components do not require WP block classes. |
| Token Governance | Enforce a three-layer token architecture with restricted, documented scales (spacing, typography, radius). |
| Accessibility (a11y) | Light mode defaults meet contrast requirements via explicit color governance (decouple brand color from text color). |
| Atomic Components | Define a small set of atomic components (Card, Pill/Tag, Button, Callout, Media) with clear contracts. |
| Standardized Interaction & Elevation | Define canonical hover/focus/elevation patterns; avoid surface-specific interaction hacks. |
| Documentation First | Maintain authoritative documentation in Figma and Storybook; README/PRD provide contract summaries. |

| Goal | Description |
|---|---|
| Non-Goal: Full Enterprise DS | This is not intended to become a multi-product enterprise-scale system (Material/Carbon class). |
| Non-Goal: CMS API Abstraction | The system will not attempt to unify CMS APIs or content workflows across platforms. |
| Non-Goal: Pixel-Perfect WP Parity | WordPress editor quirks are not a design system feature; parity is not guaranteed. |
| Non-Goal: Dark Mode Default | Dark mode exists as a variant; light mode is the default canvas. |

---

## 4. User Stories

| Story ID | Title | User Story ("As a... I want... So that...") | Acceptance Criteria | Priority |
|---|---|---|---|---|
| DS-001 | Three-Layer Tokens | As a designer, I want base/semantic/component tokens so that system decisions are consistent and portable. | Token files exist, mapping is documented, and components consume semantic/component tokens only. | P0 |
| DS-002 | Canonical Card Contract | As a developer, I want a canonical card structure so that all card surfaces render consistently across platforms. | `st-card` contract exists, structure is validated, and no surface-specific variants are required. | P0 |
| DS-003 | Light Mode Governance | As a user, I want readable UI in light mode so that the interface is accessible and comfortable. | Text never uses raw brand pink on white; deep pink text token is enforced. | P0 |
| DS-004 | Restricted Scales | As a contributor, I want standardized scales for spacing/type/radius so that UI has consistent rhythm and fewer one-offs. | A single approved scale exists; off-scale values require explicit exception approval. | P0 |
| DS-005 | Interaction & Focus Standard | As a keyboard user, I want consistent focus states so that navigation is predictable. | Focus ring, offsets, and hover transforms are standardized; no component disables focus visibility. | P1 |
| DS-006 | Component Documentation | As a team member, I want Storybook + Figma docs so that components are discoverable and buildable without reverse-engineering. | All core components documented with anatomy, tokens used, and usage examples. | P1 |
| DS-007 | Migration Readiness | As a platform owner, I want phased migration so that we can decouple without breaking production. | Migration phases exist; each phase has exit criteria and a measurable adoption target. | P1 |

---

## 5. Technical Architecture

### 5.1 Data Flow (North Star)

- **Tokens** are the canonical source of visual truth (base → semantic → component).
- **Components** consume semantic/component tokens and produce canonical DOM structures.
- **Documentation** (Figma/Storybook) describes and validates component contracts.
- **Host platforms** (WordPress today, future CMS later) provide content and routing, not structure.

### 5.2 Tech Stack (Target)

- **Tokens:** JSON token files (base/semantic/component) designed to be tool-agnostic.
- **Styling:** CSS built from tokens (manually at first; eventually generated).
- **Components:** Canonical HTML structures; optional framework wrappers must not change DOM contracts.
- **Documentation:** Figma + Storybook as the authoritative reference.

### 5.3 Repository Structure (Target State)

The Sugartown Pink design system is implemented as a **token-first, component-scoped system** within a React frontend, with a clear separation between **system primitives**, **component contracts**, and **rendering concerns**.

The structure below reflects the **current frontend-aligned architecture**, while preserving portability for future extraction.

```text
sugartown-frontend/
├── src/
│   ├── design-system/
│   │   ├── tokens/
│   │   │   ├── base.json            (raw, brand-agnostic primitives)
│   │   │   ├── semantic.json        (intent-mapped tokens)
│   │   │   └── components.json      (component-level tokens)
│   │   │
│   │   ├── components/
│   │   │   ├── card/
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Card.module.css
│   │   │   │   └── card.contract.md
│   │   │   ├── button/
│   │   │   ├── pill/
│   │   │   ├── callout/
│   │   │   └── media/
│   │   │
│   │   ├── styles/
│   │   │   ├── tokens.css           (compiled / curated CSS variables)
│   │   │   └── globals.css          (minimal system-wide resets only)
│   │   │
│   │   └── index.ts                 (public design-system exports)
│   │
│   ├── components/
│   │   ├── Hero.jsx                 (application-level composition)
│   │   ├── Layout.jsx
│   │   └── …                        (non-system, page-specific components)
│   │
│   ├── lib/
│   │   ├── queries.js               (Sanity GROQ queries)
│   │   └── sanity.js                (Sanity client config)
│   │
│   └── pages/ / routes/             (application routing layer)
│
├── docs/
│   ├── figma/                       (design source of truth)
│   ├── storybook/                  (component contracts & usage)
│   └── prd/                         (canonical system documentation)
│
└── legacy/
    └── style_old_260119.css         (read-only migration reference)
```

src/styles is transitional. Only token outputs may live there during Phase 1–2; component styling must remain scoped to components (CSS Modules) and migrate into src/design-system/ as the system is extracted.

### 5.4 Standards & Restricted Scales (Authoritative)

These standards are required to reduce variance and enable portability.

### 5.5 Legacy CSS Reference (Migration Context)

The legacy global stylesheet from the prior WordPress implementation has been intentionally preserved as a **read-only reference artifact**, not as an implementation dependency.

- **File:** `style_old_260119.css`
- **Origin:** Pre-Sanity / pre-React Sugartown site
- **Status:** Reference only (not imported, not executed)

📎 **Download / Reference:**  
[`style_old_260119.css`](./style_old_260119.css)

This file exists to:
- Audit historical visual patterns (spacing, color usage, typography, layout)
- Identify design intent worth translating into tokens or components
- Support migration parity checks during system extraction and platform transitions

It is **not part of the active build** and must not be imported into the application or component styles.

---

#### Legacy-to-System Translation Rules

The Sugartown Pink design system is governed by **explicit tokens, scoped components, and canonical contracts**. As such:

- **Do not copy or paste raw CSS** from `style_old_260119.css` into the new codebase
- Legacy styles must be **interpreted and translated**, not reused verbatim

Approved migration paths:

1. **Design Tokens**
   - Colors → tokenized (`color.*`)
   - Spacing → restricted scale (`space.*`)
   - Radius → tokenized (`radius.*`)
   - Typography → governed type scale and families

2. **Component Styles**
   - Patterns become **component-scoped CSS modules**
   - No new global selectors introduced
   - Layout rules live with the component that owns the structure

3. **Documented Decisions**
   - Intentional departures from legacy behavior must be documented
   - Parity is a validation tool, not a constraint

---

#### Migration Principle (Authoritative)

> **Legacy CSS is a historical record, not a dependency.**

The source of truth for styling in the Sugartown platform is:
- Design tokens
- Component contracts
- Canonical documentation (this PRD, Figma, Storybook)

Legacy artifacts exist to inform decisions — not to bypass system governance.

#### Typography Standards

Approved typefaces:
- **Narrative / Editorial:** Playfair Display (headings, titles)
- **UI / Body:** Fira Sans (body, subtitles, UI prose)
- **Data / Code:** Menlo / Monaco / Consolas (labels, pills/tags, code)

Restricted type scale (recommended):
- `xs` = 0.75rem (pills, eyebrow labels)
- `sm` = 0.875rem (metadata, helper text)
- `md` = 1rem (body)
- `lg` = 1.125rem (subtitle)
- `xl` = 1.4rem (card titles)
- `2xl` = 1.75rem (feature titles)
- `display` = 3rem (archive headers / hero headings)

#### Radius Standards (Known)

Radius must come from tokens only. Known current values: :contentReference[oaicite:1]{index=1}
- `radius.xs` = 4px (buttons, tags)
- `radius.sm` = 8px (code, callouts)
- `radius.md` = 12px (cards)
- `radius.lg` = 16px (reserved / large containers)
- `radius.xl` = 35px (hero, featured media)

#### Spacing Standards (Restricted Scale)

All spacing must use a restricted scale (px-equivalent shown):
- `space.1` = 4
- `space.2` = 8
- `space.3` = 12
- `space.4` = 16
- `space.5` = 24
- `space.6` = 32
- `space.7` = 40
- `space.8` = 60

Off-scale values require explicit rationale and should be treated as temporary debt.

#### Aspect Ratio Standards (Encouraged)

Establish canonical ratios for media surfaces:
- `media.hero` = 3:1 (page hero)
- `media.article` = 21:9 (single-post feature)
- `media.cardIconStrip` = fixed height strip (48px) for card media row

(These align with current theme behavior and should become explicit DS standards.) :contentReference[oaicite:2]{index=2}

#### Interaction & Elevation Standards

- Hover transforms must be subtle and standardized (e.g., translateY(-2px to -4px)).
- Shadows must come from tokens, not ad hoc values.
- Focus styles must be visible, consistent, and never removed.

---

## 6. Dependencies & Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Brand color contrast failures in light mode | Accessibility violations, poor readability | Enforce “Deep Pink for text” semantic token; lint for violations. |
| Token drift / sprawl | Inconsistent UI, harder migration | Restricted scales; token review gate; ban hard-coded values in components. |
| WordPress DOM coupling | Migration becomes expensive | Prohibit dependency on WP block wrappers for component internals. |
| Incomplete documentation | Contributors reverse-engineer behavior | Storybook/Figma are required for core components; PR checklist enforces docs updates. |
| Parallel component implementations | Conflicting behavior across surfaces | Canonical components only; deprecate legacy patterns with a migration plan. |

---

## 7. Success Criteria

| Area | Metric (e.g., Performance: <90% API calls) |
|---|---|
| Accessibility | 100% compliance with minimum contrast thresholds for text in light mode (automated checks where possible). |
| Token Adoption | 0 hard-coded color/radius/spacing values inside canonical components. |
| Portability | Canonical components render correctly without WordPress-specific markup. |
| Consistency | >95% UI surfaces use canonical components (cards, pills/tags, callouts, buttons). |
| Documentation Coverage | 100% of core components documented in Figma + Storybook with anatomy and token references. |

---

# Appendix A: Light Mode Default Logic (Governed)

### Default Canvas (Light Mode is the baseline)

- Default Background: `#FFFFFF` (White)  
- Default Text: `#1e1e1e` (Charcoal)  
- Dark Mode Variant (“Deep Void”): `#0D1226` (Explicitly not default) :contentReference[oaicite:3]{index=3}

### Contrast Mitigation: The “Deep Pink Rule”

This PRD acknowledges that bright pink/cyan on white can fail accessibility. The system decouples **brand identity color** from **readable text color**:

Constraint:
- Do **not** use `color.brand.primary` (`#FE1295`) for text on light backgrounds.

Solution:
- Use `color.text.brand` (`#b91c68`) for text elements.

Semantic token mapping (known intent + current usage alignment):
| Intent | Token Name | Value (Light Mode) |
|---|---|---|
| Brand Identity | `color.brand.primary` | `#FE1295` |
| Readable Text | `color.text.brand` | `#b91c68` |
| Background | `color.bg.canvas` | `#FFFFFF` |
| Pill Background | `color.bg.subtle` | `#f1f2f4` |

---

# Appendix B: Core Component Constraints (North Star)

## B.1 ST Card

- Must render on a white canvas using `color.bg.canvas`.
- Must use a **physical border** for definition (not glow-first separation).
- Must standardize elevation and hover behavior via tokens.
- Must not assume WordPress wrappers for layout or spacing.

## B.2 Tech Pill

- Typeface: Menlo/Consolas
- Size: 0.75rem
- Background: `color.bg.subtle` (`#f1f2f4`)
- Text: `color.text.brand` (`#b91c68`)
- Border: `1px solid` tokenized border value (known current: `#e1e3e6`) :contentReference[oaicite:4]{index=4}

---

# Appendix C: Migration Phases (Planned)

Migration is phased to preserve production stability while increasing portability.

## Phase 0 — Incubation (Current)
- System primitives exist inside the WordPress theme.
- Token values live in CSS variables and WP presets.
- Canonical component structures begin to standardize.

Exit criteria:
- Token inventory documented (base/semantic/component).
- Core components have written contracts (Card, Pill/Tag, Button, Callout, Media).

## Phase 1 — Contract Hardening
- Canonical DOM structures are enforced for core components.
- Hard-coded values are removed from canonical components.
- Storybook is established as the component contract validator.

Exit criteria:
- Token files exist in JSON (base/semantic/component).
- Storybook contains at least Card + Pill + Button docs with anatomy and token references.

## Phase 2 — Extraction
- Tokens and component CSS are separated from WP theme-specific CSS.
- WordPress becomes a consumer of the design system, not the owner.
- Theme-specific overrides are isolated and minimized.

Exit criteria:
- `styles/tokens.css` and `styles/components.css` can be consumed outside WP.
- A non-WP render proof exists (static page or small demo app) with parity.

## Phase 3 — Platform Migration Enablement
- Design system can be consumed by a new CMS/frontend with minimal translation.
- WordPress theme becomes one of multiple possible render targets.

Exit criteria:
- New platform can render core pages using the system contracts and tokens.
- Decommissioning plan exists for WP-coupled patterns.

---

# Appendix D: Token JSON (Known Tokens + Standards)

> These JSON snippets represent the **known** tokens and standards currently visible in `style.css` plus the PRD’s governance intent for semantic mapping. :contentReference[oaicite:5]{index=5}

## D.1 `tokens/base.json`

```json
{
  "color": {
    "pink": { "500": "#FE1295" },
    "void": { "900": "#0D1226" },
    "charcoal": { "900": "#1e1e1e" },
    "grey": {
      "600": "#666666",
      "050": "#f8f8fa",
      "040": "#f1f2f4",
      "030": "#e1e3e6"
    }
  },
  "radius": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "35px"
  },
  "font": {
    "family": {
      "narrative": "Playfair Display, serif",
      "ui": "Fira Sans, sans-serif",
      "mono": "Menlo, Monaco, Consolas, monospace"
    }
  },
  "space": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "24px",
    "6": "32px",
    "7": "40px",
    "8": "60px"
  },
  "shadow": {
    "card": "0 4px 12px rgba(254, 18, 149, 0.05)"
  }
}
```

## D.2 `tokens/semantic.json`

```json
{
  "color": {
    "brand": {
      "primary": "{color.pink.500}"
    },
    "bg": {
      "canvas": "#FFFFFF",
      "subtle": "{color.grey.040}",
      "void": "{color.void.900}",
      "surface": "#FFFFFF",
      "surfaceAlt": "{color.grey.050}"
    },
    "text": {
      "default": "{color.charcoal.900}",
      "muted": "{color.grey.600}",
      "brand": "#b91c68"
    },
    "border": {
      "default": "rgba(0,0,0,0.08)",
      "subtle": "{color.grey.030}"
    }
  },
  "radius": {
    "button": "{radius.xs}",
    "tag": "{radius.xs}",
    "callout": "{radius.sm}",
    "code": "{radius.sm}",
    "card": "{radius.md}",
    "hero": "{radius.xl}"
  },
  "font": {
    "narrative": "{font.family.narrative}",
    "ui": "{font.family.ui}",
    "mono": "{font.family.mono}"
  }
}
```

## D.3 `tokens/components.json`

```json
{
  "card": {
    "bg": "{color.bg.surface}",
    "text": "{color.text.default}",
    "muted": "{color.text.muted}",
    "border": "{color.brand.primary}",
    "radius": "{radius.card}",
    "shadow": "0 10px 30px rgba(0,0,0,0.06)",
    "hover": {
      "translateY": "-4px",
      "shadow": "0 12px 40px rgba(254, 18, 149, 0.15)"
    },
    "media": {
      "height": "48px"
    }
  },
  "pill": {
    "bg": "{color.bg.subtle}",
    "text": "{color.text.brand}",
    "border": "{color.border.subtle}",
    "radius": "{radius.tag}",
    "font": "{font.mono}",
    "size": "0.75rem"
  },
  "callout": {
    "radius": "{radius.callout}"
  },
  "code": {
    "radius": "{radius.code}",
    "bg": "{color.text.default}"
  }
}
```
## D.4 Token Naming and Semantics

Tokens must be semantic, platform-agnostic, and stable over time.
We use a two-part model:

- Foundation scale tokens provide consistent measurement steps (e.g., --st-space-1…8)
- Semantic alias tokens map to the foundation scale for readability (e.g., --st-space-sm, --st-space-md)

**Rule:** Semantic aliases must always map to the foundation scale. No ad-hoc values may be introduced directly in semantic tokens.

# Appendix E: Design System vs Application Code — Ownership Rules

The following table defines authoritative ownership boundaries between the **Sugartown Pink Design System** and the **application layer**. This distinction is required to preserve portability, prevent styling drift, and support future platform extraction.

| Item | Belongs In | Reason |
|---|---|---|
| Design tokens (color, spacing, radius, typography) | **Design System** | Tokens are the canonical source of visual truth and must be portable and platform-agnostic. |
| Token JSON files (`base.json`, `semantic.json`, `components.json`) | **Design System** | These define intent and scale; CSS is a derived artifact. |
| Compiled token CSS variables | **Design System** | Tokens may be consumed by multiple renderers; generation is a system concern. |
| Atomic UI components (Button, Card, Pill, Callout, Media) | **Design System** | These have stable contracts and predictable DOM structures. |
| Component CSS Modules | **Design System** | Styling belongs with the component contract it implements. |
| Component anatomy / contracts | **Design System** | Required for documentation, Storybook, and long-term stability. |
| Global CSS resets (minimal) | **Design System** | Only if they are universally required (e.g., box-sizing). |
| Layout composition (Hero, Page sections) | **Application** | These assemble components into page-specific structures. |
| CMS-aware components (Sanity-driven layouts) | **Application** | CMS data shapes are not design system concerns. |
| GROQ queries / CMS clients | **Application** | Data fetching is platform-specific. |
| Page routing / templates | **Application** | Routing is not portable across platforms. |
| Editorial logic (e.g., “if CTA exists show button”) | **Application** | Business rules live above the design system. |
| Legacy CSS (`style_old_260119.css`) | **Neither (Reference Only)** | Historical artifact used for migration auditing only. |

**Rule of thumb:**  
If a component can be rendered without knowing *where the data came from*, it belongs in the **design system**.  
If it needs to know *what page it’s on or which CMS supplied it*, it belongs in the **application**.


---

**End of PRD**
