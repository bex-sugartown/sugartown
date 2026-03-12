# Sugartown Design System Ruleset
**Strategic Principles + Tactical Implementation + AI Agent Guidelines**

**Version:** v2025.12.29  
**Namespace:** `st-*` (Sugartown Pink)  
**For:** Human developers, AI collaborators, design system maintainers

---

## Table of Contents

1. [Philosophy Layer: Why Design Systems Exist](#philosophy-layer-why-design-systems-exist)
2. [Tactical Layer: Implementation Guidance](#tactical-layer-implementation-guidance)
3. [Validation Layer: Pre-Ship Checklist](#validation-layer-pre-ship-checklist)
4. [AI Agent Guidelines](#ai-agent-guidelines)

---

## Philosophy Layer: Why Design Systems Exist

### Core Purpose

Design systems solve **consistency at scale** - they are the shared language between design, engineering, and product that prevents the entropy of organic growth from creating unmaintainable interfaces.

### Problems Solved

- **Duplication & drift:** Without a system, every team reinvents buttons, forms, modals
- **Design debt:** Ad-hoc solutions compound into thousands of lines of orphaned CSS
- **Cross-platform incoherence:** Mobile, web, email each speak different visual languages
- **Onboarding friction:** New team members face steep learning curves with no canonical reference
- **Slow iteration:** Changes require touching dozens of files instead of one source of truth

### Architectural Principles

#### 1. Dependency Direction (Inward Flow)
- Components depend on tokens, never vice versa
- Pages depend on components, components never know about pages
- Platform implementations depend on platform-agnostic contracts
- **Rule:** If A depends on B, B must never import or reference A

#### 2. Separation of Concerns
- Structure (HTML/component tree) ≠ Presentation (CSS/styling) ≠ Behavior (JS/interactions)
- Tokens define values, components apply them semantically
- Layout systems handle space/position, components handle content
- **Rule:** A single change should touch a single layer

#### 3. Progressive Enhancement
- Core functionality works without JavaScript
- Visual polish degrades gracefully without modern CSS
- Semantic HTML provides accessible baseline
- **Rule:** Disable CSS and JS - the interface should still be usable

#### 4. Composition Over Inheritance
- Build complex patterns from simple primitives
- Favor slots/children over prop-drilling variants
- **Rule:** If you're adding a 6th variant, you need composition instead

### Success Criteria

A design system succeeds when:

- New features ship 40%+ faster (measured from design → production)
- Visual regressions drop to near-zero between releases
- Cross-functional teams self-serve without designer hand-holding
- Designers spend 80% time on problems, 20% on components
- A new engineer can ship compliant UI on day one
- Accessibility audits find zero structural issues
- Platform teams can swap CSS frameworks without touching HTML

---

## Tactical Layer: Implementation Guidance

### 1. Naming Conventions

#### Semantic Over Presentational

❌ `.red-button`, `.big-text`, `.left-sidebar`  
✅ `.st-button--danger`, `.st-heading--primary`, `.st-nav--sidebar`

**Rationale:** `.red-button` breaks when brand color changes from red to blue. `.st-button--danger` maintains semantic meaning.

#### BEM Methodology (Block, Element, Modifier)

**Structure:**
```css
.st-card { }                  /* Block */
.st-card__header { }          /* Element */
.st-card__body { }            /* Element */
.st-card__footer { }          /* Element */
.st-card--featured { }        /* Modifier */
.st-card--compact { }         /* Modifier */
```

**Rules:**
- **Block:** Standalone component (`.st-card`)
- **Element:** Child part of block (`.st-card__header`)
- **Modifier:** Variant or state (`.st-card--featured`, `.st-button--disabled`)
- Elements cannot exist outside their block
- Never nest elements: `.st-card__header__title` → should be `.st-card__title`
- Modifiers affect the block, not isolated elements
- Boolean modifiers use `--modifier`, value-based use `--modifier-value`

#### Namespacing Strategy

Prefix all system classes to prevent collisions:

```css
/* Sugartown design system namespace */
.st-*           /* Core components */
.st-token-*     /* Design tokens (when exposed as CSS) */
.st-util-*      /* Utility classes */
.st-layout-*    /* Layout primitives */

/* Application namespace */
.app-*          /* Application-specific components */
.page-*         /* Page-level layouts */
```

**State Prefixes:**
```css
.is-active, .is-disabled, .is-loading    /* State classes */
.has-error, .has-icon                    /* Conditional classes */
```

#### Token Naming (Tiered System)

```css
/* Tier 1: Primitive (raw values) */
--st-color-pink-500: #FF69B4;
--st-spacing-4: 1rem;

/* Tier 2: Semantic (purpose-based) */
--st-color-brand-primary: var(--st-color-pink-500);
--st-color-danger: var(--st-color-red-500);
--st-spacing-stack-sm: var(--st-spacing-2);

/* Tier 3: Component (scoped) */
--st-button-bg-primary: var(--st-color-brand-primary);
--st-button-padding-x: var(--st-spacing-4);
```

---

### 2. Token Architecture

#### Three-Tier System

**Tier 1: Primitives (Raw values - rarely change)**

```css
/* Colors: Use numeric scale (100-900) */
--st-color-pink-100: #ffe6f2;
--st-color-pink-500: #FF69B4;
--st-color-pink-900: #661145;

--st-color-green-500: #2BD4AA;

/* Spacing: Numeric scale (4px base unit) */
--st-spacing-1: 0.25rem;   /* 4px */
--st-spacing-4: 1rem;      /* 16px */
--st-spacing-12: 3rem;     /* 48px */

/* Typography: Absolute sizes */
--st-font-size-sm: 0.875rem;
--st-font-weight-bold: 700;
--st-line-height-tight: 1.25;
```

**Tier 2: Semantic (Purpose-based - reference primitives)**

```css
/* Map meaning to primitives */
--st-color-text-primary: var(--st-color-gray-900);
--st-color-text-secondary: var(--st-color-gray-600);
--st-color-bg-surface: var(--st-color-white);
--st-color-border-default: var(--st-color-gray-300);

/* Contextual spacing */
--st-spacing-inline-sm: var(--st-spacing-2);
--st-spacing-stack-md: var(--st-spacing-4);
--st-spacing-inset-lg: var(--st-spacing-6);
```

**Tier 3: Component (Scoped tokens - reference semantic)**

```css
/* Component-specific overrides */
--st-button-bg-primary: var(--st-color-brand-primary);
--st-button-text-primary: var(--st-color-white);
--st-button-border-radius: var(--st-radius-md);
--st-button-padding-block: var(--st-spacing-2);
--st-button-padding-inline: var(--st-spacing-4);
```

#### Token Organization Patterns

**Color System:**
```
Base colors → Semantic roles → Component scopes
--st-color-pink-500 → --st-color-brand-primary → --st-button-bg-primary
```

**Spacing System (Stack, Inline, Inset):**
```css
/* Stack: vertical margin between elements */
--st-spacing-stack-xs: var(--st-spacing-1);
--st-spacing-stack-sm: var(--st-spacing-2);

/* Inline: horizontal spacing between elements */
--st-spacing-inline-sm: var(--st-spacing-2);

/* Inset: padding inside containers */
--st-spacing-inset-md: var(--st-spacing-4);
```

**Typography System:**
```css
/* Size scale */
--st-font-size-xs: 0.75rem;
--st-font-size-base: 1rem;
--st-font-size-2xl: 1.5rem;

/* Semantic roles */
--st-font-body: var(--st-font-size-base);
--st-font-heading-1: var(--st-font-size-3xl);
--st-font-caption: var(--st-font-size-xs);
```

**Rules:**
- Primitives use literal values
- Semantic tokens MUST reference primitives
- Component tokens MUST reference semantic (never skip to primitives)
- Theme switching happens at primitive/semantic boundary
- Never hardcode values in components - always use tokens

**CSS Modules must not introduce new spacing values.**
Use tokens only. If a needed value is missing:

- add a foundation step (--st-space-N), or
- map a semantic alias to an existing step. Never hardcode px values in component CSS unless explicitly approved as an exception.

---

### 3. Component Contracts

#### Anatomy: Required Structure

Every component must define:

**1. HTML Structure (Platform-agnostic contract)**
```html
<!-- Required elements and hierarchy -->
<div class="st-card">
  <div class="st-card__header">   <!-- Optional element -->
    <h3 class="st-card__title"></h3>
  </div>
  <div class="st-card__body">     <!-- Required element -->
    <!-- Content -->
  </div>
  <div class="st-card__footer">   <!-- Optional element -->
    <!-- Actions -->
  </div>
</div>
```

**2. Variants (Predictable modifications)**
```css
/* Size variants */
.st-button--sm { }
.st-button--md { }  /* Default */
.st-button--lg { }

/* Style variants */
.st-button--primary { }    /* Default */
.st-button--secondary { }
.st-button--ghost { }

/* Combine variants via classes */
<button class="st-button st-button--lg st-button--secondary">
```

**3. States (Interactive conditions)**
```css
/* Interaction states */
.st-button:hover { }
.st-button:focus { }
.st-button:active { }

/* Declarative states */
.st-button.is-disabled { }
.st-button.is-loading { }
.st-button[aria-pressed="true"] { }
```

**4. Invariants (Things that never change)**
```css
/* These properties are locked */
.st-button {
  display: inline-flex;       /* Always flex */
  align-items: center;        /* Always centered */
  justify-content: center;
  font-family: inherit;       /* Always inherit */
  cursor: pointer;            /* Unless disabled */
  border: 0;                  /* Never native border */
}

/* Variants can modify size, color, spacing */
/* Variants CANNOT modify display, font-family, cursor */
```

#### Composition Patterns

**Slots/Children (Preferred for flexibility):**
```html
<!-- HTML example -->
<div class="st-card">
  <div class="st-card__header">
    <h3 class="st-card__title">Title</h3>
  </div>
  <div class="st-card__body">
    <p>Content goes here</p>
  </div>
</div>
```

**Compound Components (Related elements):**
```css
✅ .st-input + .st-input-label + .st-input-helper
✅ .st-tabs + .st-tab-list + .st-tab-panel
❌ Monolithic component with 20 props
```

#### Documentation Contract

Every component must specify:
- Required HTML structure
- Available variants (size, style, state)
- Accessibility requirements (ARIA, focus, keyboard)
- Content constraints (max-width, character limits)
- Composition examples
- Migration guide (if replacing deprecated component)

---

### 4. Layout Systems

#### Container Patterns

**Stack Layout (Vertical spacing):**
```css
/* Automatic vertical rhythm */
.st-layout-stack {
  display: flex;
  flex-direction: column;
  gap: var(--st-spacing-stack, var(--st-spacing-4));
}

/* Usage */
<div class="st-layout-stack" style="--st-spacing-stack: var(--st-spacing-2)">
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>  /* Automatic spacing */
  <p>Paragraph 3</p>
</div>
```

**Cluster Layout (Inline wrapping):**
```css
.st-layout-cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--st-spacing-inline, var(--st-spacing-2));
  align-items: center;
}

/* Usage: Pills, tags, button groups */
<div class="st-layout-cluster">
  <span>Tag 1</span>
  <span>Tag 2</span>
  <span>Tag 3</span>
</div>
```

**Grid Layout (Repeating columns):**
```css
.st-layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--st-grid-min, 250px), 1fr));
  gap: var(--st-spacing-gutter, var(--st-spacing-6));
}
```

**Rules:**
- Layout components provide structure, not styling
- Never set width, height, margin on components - use layout primitives
- Responsive changes happen at layout level, not component level
- Gap/spacing via CSS custom properties for easy overrides

---

### 5. Platform Independence

#### HTML + CSS as Source of Truth

**Contract:** If it works in plain HTML/CSS, it works everywhere.

**Zero-Dependency Architecture:**
```html
<!-- This must work without React, Vue, or any framework -->
<button class="st-button st-button--primary st-button--lg">
  <span class="st-button__icon">
    <svg>...</svg>
  </span>
  <span class="st-button__label">Click Me</span>
</button>
```

**CSS Implementation:**
```css
/* Pure CSS - no preprocessor required */
.st-button {
  /* All styling in vanilla CSS */
  display: inline-flex;
  background: var(--st-button-bg-primary);
  color: var(--st-button-text-primary);
  border-radius: var(--st-button-border-radius);
  padding-block: var(--st-button-padding-block);
  padding-inline: var(--st-button-padding-inline);
}

/* No Sass mixins, no Less functions, no CSS-in-JS */
/* Everything via CSS custom properties */
```

**Rules:**
- HTML structure is platform-agnostic
- CSS uses only standard properties (no vendor prefixes without fallbacks)
- JavaScript is progressive enhancement only
- Each platform adapter maps to same HTML contract

---

### 6. Accessibility

#### Structural Requirements (Every Component)

**1. Semantic HTML First**
```html
✅ <button>Click me</button>
❌ <div class="button">Click me</div>

✅ <nav aria-label="Main navigation">
❌ <div class="nav">

✅ <h2>Section Title</h2>
❌ <div class="heading">Section Title</div>
```

**2. Focus Management**
```css
/* Visible focus indicator */
.st-button:focus-visible {
  outline: 2px solid var(--st-color-focus);
  outline-offset: 2px;
}

/* Never remove focus without replacement */
❌ .st-button:focus { outline: none; }
✅ .st-button:focus-visible { outline: 2px solid; }
```

**3. Keyboard Navigation**
```html
<!-- Interactive elements must be keyboard accessible -->
✅ <button>             /* Natively focusable */
✅ <a href="#">         /* Natively focusable */
❌ <div onclick="...">  /* Not focusable */

<!-- If using non-semantic elements, add role + tabindex -->
<div role="button" tabindex="0" onKeyPress={...}>
```

**4. ARIA Attributes (When semantic HTML insufficient)**
```html
<!-- Button with loading state -->
<button aria-busy="true" aria-live="polite">
  Loading...
</button>

<!-- Expandable section -->
<button aria-expanded="false" aria-controls="section-1">
  Show More
</button>
```

**5. Text Alternatives**
```html
<!-- Images -->
<img src="chart.png" alt="Sales increased 40% in Q4">

<!-- Icon buttons -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Decorative elements -->
<div aria-hidden="true" class="st-divider"></div>
```

#### WCAG 2.1 AA Baseline

**Color Contrast:**
```css
/* Text contrast minimums */
--st-color-text-primary: #1a1a1a;    /* 4.5:1 on white (AA) */
--st-color-text-secondary: #595959;  /* 4.5:1 on white */

/* Never rely on color alone */
❌ <span style="color: red;">Error</span>
✅ <span class="st-text-error">
     <svg aria-hidden="true">⚠️</svg> Error
   </span>
```

**Touch Targets:**
```css
/* Minimum 44x44px touch target */
.st-button {
  min-height: 44px;
  min-width: 44px;
  padding: var(--st-spacing-3) var(--st-spacing-4);
}
```

**Motion & Animation:**
```css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Rules:**
- Every component must pass axe-core with zero violations
- Screen reader testing on NVDA (Windows) + VoiceOver (Mac/iOS)
- Keyboard-only navigation must access all functionality
- Color is never the sole indicator of state/meaning
- Forms must have labels, error states, and validation messages

---

## Validation Layer: Pre-Ship Checklist

### Anti-Patterns

#### ❌ Presentational Classes
```html
❌ <div class="red-text bold large">Error</div>
✅ <div class="st-text-error st-text--emphasis st-text--lg">Error</div>
```
**Why:** Presentation changes require HTML edits instead of CSS updates.

#### ❌ Magic Numbers
```css
❌ .st-card { padding: 1.375rem; }
✅ .st-card { padding: var(--st-spacing-inset-md); }
```
**Why:** Unmaintainable values that don't scale with design changes.

#### ❌ Nested BEM Elements
```css
❌ .st-card__header__title { }
✅ .st-card__title { }
```
**Why:** Over-nesting creates fragile selectors tied to DOM structure.

#### ❌ Component-Level Media Queries
```css
❌ .st-button {
     font-size: 14px;
     @media (min-width: 768px) {
       font-size: 16px;
     }
   }

✅ :root {
     --st-button-font-size: 0.875rem;
     @media (min-width: 768px) {
       --st-button-font-size: 1rem;
     }
   }
   .st-button {
     font-size: var(--st-button-font-size);
   }
```
**Why:** Token-level breakpoints allow consistent scaling across all components.

#### ❌ Coupling to Application
```css
❌ .st-modal .app-header { }  /* Design system knows about app */
✅ .st-modal { }               /* System is self-contained */
```
**Why:** Design system must remain portable across projects.

#### ❌ Variant Explosion
```html
❌ <Button primary large rounded shadow elevated animated />
✅ <Button variant="primary" size="large">
     <!-- Compose smaller primitives instead -->
   </Button>
```
**Why:** 6+ variants indicates need for composition, not more props.

#### ❌ !important Overuse
```css
❌ .st-button { color: blue !important; }
✅ .st-button { color: var(--st-button-text-primary); }
```
**Why:** `!important` is a red flag for specificity issues or architectural problems.

#### ❌ Framework Lock-In
```javascript
❌ export function Button({ variant, onClick, children }) {
     const [isPressed, setIsPressed] = useState(false);
     // Component logic tightly coupled to React
   }

✅ <!-- HTML contract first, framework wraps it -->
   <button class="st-button st-button--primary">
     {children}
   </button>
```
**Why:** Platform-agnostic HTML enables use across any framework.

---

### Page-Level Styling: When You're Doing It Wrong

#### The 10-Line Rule

If you're writing more than 10 lines of CSS for a single page, you're probably:
1. Missing a design system component
2. Hardcoding values that should be tokens
3. Creating page-specific variants of existing patterns

#### What Page CSS Should Look Like

```html
<!-- ✅ GOOD: Compose from Sugartown primitives -->
<main class="st-layout-stack" style="--st-spacing-stack: var(--st-spacing-6)">
  <header class="st-content-header">
    <h1 class="st-heading-1">Page Title</h1>
    <p class="st-text-secondary">Subtitle</p>
  </header>
  
  <div class="st-metadata">
    <dl>
      <dt>Version:</dt><dd>v2025.12.29</dd>
      <dt>Status:</dt><dd>Active</dd>
    </dl>
  </div>
  
  <article class="st-content-body">
    <!-- Content uses Sugartown typography classes -->
  </article>
</main>
```

```css
/* ✅ GOOD: Minimal page wrapper */
.page-ai-ethics {
  /* Only page-specific overrides, if absolutely necessary */
}
```

#### When to Add to Design System vs Page CSS

**Add to Design System if:**
- You'll use it on 2+ pages
- It's a distinct content pattern (metadata block, callout, breadcrumb)
- It has reusable structure/behavior
- It needs variants (sizes, colors, states)

**Allow Page CSS if:**
- Truly one-off layout quirk
- Simple utility override (e.g., `gap: var(--st-spacing-8)` instead of default)
- Less than 10 lines total

**Never Allow:**
- Hardcoded colors, spacing, typography
- Recreating existing Sugartown components with different names
- Page-specific variants of Sugartown patterns

#### Litmus Test: "Could Another Page Use This?"

If yes → Add to design system  
If no → Question why it exists  
If unsure → Build as Sugartown component anyway (you'll thank yourself later)

---

### Litmus Test Questions

Answer **YES** to all before shipping:

1. **Can this work in plain HTML/CSS?**
   - If you strip React/Vue, does the component still function?
   - Test: Save as `.html` file and open in browser

2. **Can a colorblind user distinguish states?**
   - Is color the ONLY indicator of error/success/warning?
   - Test: Use colorblind simulator on interface

3. **Can I navigate with keyboard only?**
   - Can I reach every interactive element via Tab?
   - Can I activate via Enter/Space?
   - Test: Unplug mouse, complete user flow

4. **Does it pass axe-core with zero violations?**
   - Run automated accessibility checker
   - Test: `npm run test:a11y` should return clean

5. **Can I delete the CSS and still understand the page?**
   - Is semantic HTML providing structure?
   - Test: Disable CSS in DevTools - is hierarchy clear?

6. **Will this work in 3 years without changes?**
   - Am I using stable APIs, not experimental features?
   - Are there fallbacks for modern CSS?
   - Test: Check caniuse.com for browser support

7. **Can a new engineer use this in 5 minutes?**
   - Is the documentation complete?
   - Are there copy-paste examples?
   - Test: Give docs to junior dev, observe time-to-first-use

8. **Can I theme this without touching the component?**
   - Are all colors/spacing via CSS custom properties?
   - Test: Override tokens - does component adapt?

---

### Decision Framework for Edge Cases

#### "Should this be a variant or a new component?"

**New Variant if:**
- Shares 80%+ of structure/behavior
- Same use case, different visual weight
- Example: `st-button--primary` vs `st-button--secondary`

**New Component if:**
- Different interaction model
- Different accessibility requirements
- Different use cases
- Example: `<Button>` vs `<IconButton>` (different semantics)

#### "Should this be a token or a hardcoded value?"

**Use Token if:**
- Value could change based on brand/theme
- Value is used 2+ times
- Value has semantic meaning
- Example: `var(--st-color-danger)`, `var(--st-spacing-4)`

**Hardcode if:**
- Value is mathematically derived (e.g., `calc(100% - 2rem)`)
- Value is truly one-off and non-semantic
- Value is a browser default you're explicitly setting

#### "Should this be inline CSS or a class?"

**Inline if:**
- Value is dynamic/user-generated
- Example: `style="width: ${progress}%"`

**Class if:**
- Value is part of design system
- Value could be reused
- Example: `.st-progress-bar` instead of inline

#### "Should this CSS live in the component or layout primitive?"

**Component if:**
- Intrinsic to component identity (button padding, border-radius)
- Required for component to function

**Layout Primitive if:**
- Controls position/space between elements
- Could apply to any component
- Example: margin, grid columns, flex-basis

#### "Should I add this accessibility feature?"

**Always Add if:**
- Required by WCAG 2.1 AA
- Improves keyboard navigation
- Provides text alternatives
- Adds semantic meaning

**Consider if:**
- Going beyond AA (reaching AAA)
- Experimental ARIA patterns
- May conflict with screen reader behavior

---

### Implementation Checklist

#### For New Components
- [ ] Philosophy: Does this solve a real user problem?
- [ ] Naming: BEM structure, semantic names, proper namespace (`st-*`)
- [ ] Tokens: All values via CSS custom properties
- [ ] Structure: HTML contract defined, documented
- [ ] Variants: Minimal set, composable, documented
- [ ] States: All interactive states styled
- [ ] Accessibility: Semantic HTML, ARIA, keyboard, focus
- [ ] Platform-Agnostic: Works in plain HTML/CSS
- [ ] Responsive: Mobile-first, tested at 3+ breakpoints
- [ ] Documentation: Component spec written
- [ ] Testing: Visual regression snapshots captured
- [ ] Governance: RFC approved, version planned

#### For Token Changes
- [ ] Impact Analysis: Which components reference this token?
- [ ] Backward Compatibility: Will this break existing usage?
- [ ] Semantic Meaning: Is this a primitive, semantic, or component token?
- [ ] Documentation: Updated token reference guide
- [ ] Migration: Deprecation path if breaking

#### For Breaking Changes
- [ ] RFC Approved: Core team sign-off
- [ ] Deprecation Notice: Published 6+ months prior
- [ ] Migration Guide: Written with before/after examples
- [ ] Stakeholder Buy-In: Teams notified, timelines agreed
- [ ] Major Version Bump: Semantic versioning followed
- [ ] Changelog: Breaking changes section complete

---

## AI Agent Guidelines

### For All AI Collaborators (Claude, ChatGPT, Gemini, etc.)

**Context:** You're helping build Sugartown CMS, which uses the Sugartown Pink design system. All design system classes use the `st-*` namespace.

#### Critical Rules

1. **Always use `st-` namespace**
   - ✅ `.st-button`, `--st-color-brand-primary`
   - ❌ `.ds-button`, `--ds-color-*` (generic, not Sugartown)

2. **Check existing components first**
   - Before creating new CSS, search `style.css` for existing `.st-*` classes
   - Ask: "Does a component already exist for this?"

3. **Use tokens, never hardcode**
   - ✅ `color: var(--st-color-text-primary);`
   - ❌ `color: #0D1226;`

4. **Semantic naming only**
   - ✅ `.st-metadata` (what it is)
   - ❌ `.ethics-metadata` (where it's used)

5. **Apply the 10-line rule**
   - If page CSS >10 lines, you're doing it wrong
   - Solution: Add to design system, don't create page-specific CSS

#### Before Writing Any CSS

**Decision Tree:**

```
User asks for styling
    ↓
1. Does component exist in style.css?
    ├─ YES → Use existing component
    └─ NO → Continue
    ↓
2. Could another page use this?
    ├─ YES → Add to design system
    └─ NO → Question if it's needed
    ↓
3. Is this truly one-off?
    ├─ YES → Use inline override with tokens
    └─ NO → Add to design system
```

#### Response Template

When user asks for page styling:

```markdown
## Analysis

1. **Existing Components:** [List any `.st-*` classes that apply]
2. **New Components Needed:** [List what's missing from design system]
3. **Approach:** [Compose from design system vs. create new component]

## Recommendation

[Either compose from existing OR propose adding to design system]

## HTML (Using Sugartown Components)

[Show HTML using `.st-*` classes]

## CSS (If Adding to Design System)

[Show component CSS with `--st-*` tokens]
```

#### Red Flags to Avoid

Stop and reconsider if you're about to:

- Create `.page-specific-thing` classes
- Use hardcoded `#hex` colors or `px` values
- Duplicate existing Sugartown patterns
- Write page CSS >10 lines
- Scope element styles to a class (e.g., `.st-page-content a { }`)
- Skip checking for existing components

#### Prompting Patterns

**Good prompts from users:**
- "Style this using Sugartown components"
- "What Sugartown classes should I use for X?"
- "Is there a Sugartown component for Y?"

**When you should search project knowledge:**
- User mentions styling, layout, components
- User references "design system" or "DS"
- User asks about colors, spacing, typography
- Unclear what classes to use

**When you should propose adding to design system:**
- User asks for styling used on 2+ pages
- User asks for a reusable pattern
- User describes a new content block type

#### Example Interactions

**❌ Bad Response:**
```
User: "Style the metadata block on the ethics page"
AI: "Here's custom CSS for the ethics page..."
```

**✅ Good Response:**
```
User: "Style the metadata block on the ethics page"
AI: "I'll check if a metadata component exists in Sugartown...

Found: `.st-metadata` component exists!

Use this HTML:
<dl class="st-metadata">
  <dt>Version</dt><dd>v2025.12.29</dd>
</dl>

No new CSS needed. This component is reusable across all pages."
```

---

**❌ Bad Response:**
```
User: "Make the links blue"
AI: "Add this CSS:
.page-ethics a { color: blue; }
"
```

**✅ Good Response:**
```
User: "Make the links blue"
AI: "Links should use the global Sugartown token:

a {
  color: var(--st-color-link);
}

This is already in `st-base-styles.css`. Links are blue by default 
everywhere. No page-specific CSS needed.

If you want a different shade, update the token:
--st-color-link: var(--st-color-blue-600);
"
```

---

### Namespace Quick Reference for AI

| Element | Namespace | Example |
|---------|-----------|---------|
| Component class | `.st-*` | `.st-card` |
| Element class | `.st-block__element` | `.st-card__header` |
| Modifier class | `.st-block--modifier` | `.st-card--featured` |
| Primitive token | `--st-primitive-*` | `--st-color-pink-500` |
| Semantic token | `--st-semantic-*` | `--st-color-brand-primary` |
| Component token | `--st-component-*` | `--st-button-bg-primary` |
| Layout primitive | `.st-layout-*` | `.st-layout-stack` |
| Utility class | `.st-util-*` | `.st-util-sr-only` |
| State class | `.is-*` or `.has-*` | `.is-active`, `.has-error` |

**State classes** (`.is-*`, `.has-*`) do NOT use the `st-` namespace because they're universal.

---

### AI Self-Check Before Responding

Run this mental checklist:

1. ✓ Did I search for existing `.st-*` components?
2. ✓ Did I use tokens (`--st-*`) instead of hardcoded values?
3. ✓ Is my class naming semantic (`.st-metadata` not `.page-metadata`)?
4. ✓ Did I check if this should be added to the design system?
5. ✓ Is page CSS <10 lines (or zero)?
6. ✓ Did I avoid scoping element styles to wrapper classes?
7. ✓ Did I use proper BEM structure?
8. ✓ Are base HTML elements styled globally (not scoped to classes)?

If you answer **NO** to any, revise your response.

---

### Special Cases for AI

#### **Case: User Uploads a Design System Doc**

**Do:**
- Read it carefully
- Note namespace (should be `st-*` for Sugartown)
- Note any project-specific patterns
- Reference it in future responses

**Don't:**
- Contradict established patterns
- Use generic `ds-*` examples from the doc if Sugartown uses `st-*`

---

#### **Case: User Asks to "Fix" or "Style" a Page**

**Do:**
1. Ask what's not working or what style is needed
2. Check for existing Sugartown components
3. Propose composing from design system
4. Only if truly necessary, suggest minimal page overrides

**Don't:**
- Jump straight to creating page-specific CSS
- Assume you need new classes
- Create wrapper classes for element styling

---

#### **Case: User Says "This Doesn't Look Right"**

**Do:**
1. Check if correct Sugartown classes are applied
2. Check if base styles are loaded
3. Check if tokens are defined
4. Verify browser inspector for actual rendered CSS

**Don't:**
- Add `!important` overrides
- Create duplicate component with different name
- Scope styles to page classes

---

### Final Principle for AI

> "When in doubt, add to the design system. When very sure it's one-off, question that certainty again."

A successful AI collaboration means:
- Zero page-specific CSS files created
- All new patterns documented in design system
- Future pages can reuse everything built today
- The design system grows systematically, not organically

---

## Appendix: Quick Reference

### File Structure

```
sugartown-pink/
├── style.css                          # Main stylesheet
│   ├── 1. Design tokens               # --st-* variables
│   ├── 2. Base styles                 # Global HTML element styles
│   ├── 3. Components                  # .st-* component classes
│   └── 4. Utilities                   # .st-util-*, .st-layout-*
│
sugartown-cms/
├── content_store.py                   # Gem data management
├── layout_engine.py                   # Graph visualization
├── publish_gem.py                     # WordPress publisher
└── docs/                              # Documentation
    └── SUGARTOWN_DESIGN_SYSTEM_RULESET.md  # This file
```

### Common Components

```css
/* Content containers */
.st-content-constrained      /* Max-width wrapper */
.st-content-constrained--narrow
.st-content-constrained--wide

/* Layout primitives */
.st-layout-stack             /* Vertical spacing */
.st-layout-cluster           /* Horizontal wrapping */
.st-layout-grid              /* Responsive grid */

/* Content blocks */
.st-metadata                 /* Key-value pairs */
.st-prose                    /* Vertical rhythm utility */
.st-content-footer           /* Page footer */

/* Cards */
.st-card
.st-card__header
.st-card__body
.st-card__footer
.st-card--featured
.st-card--compact
```

### Common Tokens

```css
/* Brand colors */
--st-color-brand-primary: #FF69B4;      /* Sugartown Pink */
--st-color-brand-secondary: #2BD4AA;    /* Seafoam */

/* Text colors */
--st-color-text-primary
--st-color-text-secondary
--st-color-text-muted

/* Spacing scale */
--st-spacing-1    /* 4px */
--st-spacing-4    /* 16px */
--st-spacing-8    /* 32px */

/* Typography */
--st-font-size-base
--st-font-heading-1
--st-line-height-normal
```

---

**Last Updated:** December 29, 2025  
**Version:** v2025.12.29  
**Status:** Canonical Reference  
**For Questions:** Reference project documentation or ask maintainer

---

**Remember:** A boring, predictable design system is a successful design system. The goal is to make building interfaces so consistent and mechanical that teams can focus on solving real user problems, not reinventing buttons.
