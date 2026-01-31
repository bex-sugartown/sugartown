# Product Requirements Document (PRD)
## Sugartown Sanity CMS — V1 Strategy

---

## 1. Executive Summary

**What:** Establish the V1 content strategy and schema direction for Sugartown’s Sanity CMS, replacing the MVP-only framing with a scalable, future-proof content model.

**Why:** The MVP validated that Sanity can power Sugartown’s content layer. V1 formalizes the long-term CMS strategy (knowledge graph + content publishing + site infrastructure) and provides a shared definition of scope, success, and evolution.

**Scope:** This document defines the **current and future CMS direction** for the V1 schema set (not the MVP). It aligns stakeholders on goals, priorities, and what “done” means for the updated schema strategy.

---

## 2. Problem Statement

The MVP proved the technical feasibility of Sanity for Sugartown, but it did not define a durable, expandable content system. We now need a V1 strategy that:

1. **Standardizes the canonical content model** (knowledge graph, publishing, taxonomy, settings)
2. **Supports future content growth** without rework
3. **Aligns schema design with product goals** (Resume Factory, portfolio, editorial content)
4. **Establishes clear success criteria** for implementation and adoption

---

## 3. Goals & Success Criteria

| Goal | Success Criteria |
| :--- | :--- |
| **Canonical schema strategy** | One documented schema set governs all new content types |
| **Knowledge graph foundation** | `node` schema supports AI collaboration documentation workflows |
| **Scalable content publishing** | Posts, pages, and case studies cover editorial + portfolio needs |
| **Structured taxonomy** | Categories/tags/projects support consistent classification and linking |
| **Site infrastructure coverage** | Navigation + site settings support site-wide configuration |
| **Migration-ready** | Schemas support WordPress → Sanity migration with minimal rework |

---

## 4. V1 CMS Strategy (Current → Future)

### 4.1 Content Model Focus

V1 formalizes a **three-layer content system**:

1. **Knowledge Graph** (nodes documenting AI collaboration)
2. **Publishing & Portfolio** (posts, pages, case studies)
3. **Site Infrastructure** (navigation, site settings)

This is a **structured, composable system** that prioritizes references, reusability, and query efficiency.

### 4.2 Architectural Principles

- **References over strings** to keep data normalized and queryable
- **Atomic objects** for reuse (links, images, CTAs)
- **Composable sections** for page/case study layouts
- **Validation-first design** to enforce quality and consistency
- **Migration readiness** for legacy content ingestion

---

## 5. V1 Schema Scope (Canonical)

### 5.1 Core Content Types

- **Knowledge Graph:** `node`
- **Publishing:** `post`, `page`
- **Portfolio:** `caseStudy`
- **Taxonomy:** `category`, `tag`, `project`
- **Infrastructure:** `navigation`, `siteSettings`

### 5.2 Reusable Objects & Sections

- **Objects:** `link`, `richImage`, `ctaButton`, `editorialCard`
- **Sections:** `hero`, `textSection`, `imageGallery`, `ctaSection`

These define the baseline for V1 and should be treated as the **single source of truth** for new content modeling.

---

## 6. Out of Scope (for V1)

- Full Resume Factory product requirements
- Multi-tenant or multi-site CMS architecture
- Advanced personalization or segmentation
- Complex workflow automation

---

## 7. Success Metrics (Implementation)

- ✅ All V1 schemas compiled and deployed without errors
- ✅ Studio navigation reflects the canonical schema groupings
- ✅ Sample content created for each V1 type
- ✅ GROQ query patterns validated for core content flows
- ✅ Documentation unified into a single canonical strategy

---

## 8. Dependencies & Inputs

V1 strategy is informed by:

- **Schema intent and structure** described in `schemas/README.md`
- **Architecture context** from the legacy blueprint docs

---

## 9. Next Steps

1. Align all documentation to this V1 strategy
2. Archive MVP-only docs as legacy references
3. Implement/validate schema coverage in Studio
4. Use V1 schemas as the baseline for Resume Factory expansion
