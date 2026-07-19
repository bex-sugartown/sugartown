# SUG-61 — AI Ethics Page Rebuild: Accordion Sections + Content Update

**Linear Issue:** SUG-61
**Status:** Backlog
**Priority:** Medium
**Source:** `docs/briefs/ai-ethics-and-operations.md` v2026.04.11

---

## Context

The AI Ethics & Operations page (`wp.page.1644`, `/ai-ethics`) is a single htmlSection blob. One of the 6 remaining htmlSection blocks from the SUG-54 inventory. The brief has been updated with a new principle (#13), regulatory context, and monorepo-specific "In practice" sections.

The page needs to be rebuilt using structured sections: text sections for narrative content, accordion sections for the 13 operating principles, and citations for external references.

---

## Page Structure (H2 = inline text, H3 = accordion)

The page has two types of content: narrative sections that should be read linearly, and reference sections where the reader scans and opens what they need. Two sections use accordion: Operating Principles (13 items) and Canonical References (5 categories).

```
Hero (heroSection)
  "AI Ethics & Operations"
  subtitle: "How Not To Build Skynet"

TL;DR (calloutSection, default/pink variant)
  The 30-second version — single paragraph

What This Is (textSection)
  H2 heading, inline body. Opening statement, "where AI shows up",
  "what this page isn't" bullets. NOT accordion — this is framing
  content the reader should see first.

The Operating Principles (accordionSection, multi=true)
  H2 heading: "The Operating Principles"
  13 accordion items, each with:
    title: "1. Humans Stay Accountable — every decision traces back to a name"
    body: principle text + bulleted criteria (where applicable)
          + "In practice:" with inline `code` for tool/file refs
          + citation refs for linked regulatory sources
          + *italicised regulatory context* (principles #3, #8, #13)

When Things Go Wrong (textSection)
  H2 heading, inline numbered list. NOT accordion — this is a
  sequential process, not scannable reference items.

Accessibility Commitment (textSection)
  H2 heading, inline bullets + body. NOT accordion — short enough
  to read inline, and the commitment should be visible, not hidden.

Canonical References (accordionSection, multi=true)
  H2 heading: "Canonical References"
  5 accordion items by category:
    "Standards & Frameworks" (NIST, OECD, ISO)
    "Regulatory & Policy" (EU AI Act, US Executive Order, state laws)
    "Model Providers & Safety Research" (Anthropic, OpenAI)
    "Practical Case Studies" (Partnership on AI)
    "Licensing & Copyright" (Creative Commons)
  Each panel: bulleted list of references with linked names
  and one-line descriptions. Citation refs for endnotes where
  applicable.

The Quiet Truth (textSection)
  H2 heading, closing statement. NOT accordion.

Changelog (textSection)
  H2 heading, inline versioned entries.
```

---

## Accordion Content Styleguide (Sugartown)

Accordion-optimized content is modular, not narrative. Each panel is a self-contained answer, not a chapter in a linear story.

### When to use accordion on Sugartown

| Use accordion | Don't use accordion |
|---------------|-------------------|
| Reference lists the reader scans (principles, FAQs, term definitions) | Narrative content meant to be read top-to-bottom |
| Items the reader searches for by name ("which principle covers bias?") | Sequential processes (incident response steps) |
| 5+ items of similar weight and structure | Short sections (< 3 items, or total content < 300 words) |
| Content that benefits from progressive disclosure under cognitive load | Content that loses meaning when sections are read in isolation |

### Accordion content rules

**1. Every panel must stand alone.** No "as mentioned above." No pronouns without clear referents. No dependencies on other panels being open. If a panel breaks when read in isolation, it's not accordion-ready.

**2. Titles do the navigation work.** The title is the only thing visible when collapsed. It must carry meaning independently and signal what problem is solved inside.

| Weak | Strong |
|------|--------|
| "Eligibility" | "Who is eligible for reimbursement" |
| "Bias" | "Bias Exists. Plan Accordingly." |
| "Data" | "Data Is Not a Free Buffet" |

For Sugartown, the pattern is: **principle name + summary sentence** separated by a dash. The name is the anchor; the sentence invites the click.

**3. Lead with the answer.** Users open a panel expecting resolution, not buildup. First sentence is a plain-English summary of what this panel covers. Then the detail.

**4. Flat hierarchy inside panels.** The accordion body uses `compactPortableText`: bold, italic, inline `code`, links, citation references, and bullet/numbered lists. No headings (h2/h3/h4), images, code blocks, tables, or blockquotes. Use bold text and lists for visual sub-structure. If you need headings or media, the content belongs in a text section, not an accordion.

**5. Consistent structure across panels.** Every principle follows the same pattern (use bullet lists for criteria, numbered lists for steps):

- Opening statement (the principle in one sentence)
- Explanation (2-3 sentences, why this matters)
- Criteria or rules as a bulleted list (where applicable)
- **In practice:** concrete examples from the Sugartown workflow, with inline `code` for tool/file names and citation references for linked sources
- *Regulatory/industry context* (if applicable, italicised)

**6. 100-400 words per panel.** Under 100 feels like padding. Over 400 defeats the purpose of collapsing. If a panel exceeds 400 words, consider splitting it or moving detail to a linked page.

**7. No cross-references between panels.** "See Principle 4 above" breaks non-linear reading. If two principles are related, each should contain enough context to stand alone, with an optional "See also" link.

**8. Default state: all collapsed.** For reference content with 5+ items, start collapsed. The reader scans titles, opens what they need. First-open is acceptable for guided reading with 3-4 items.

---

## Scope

### Phase 1: Page structure migration (1 commit)

Replace the single htmlSection with structured sections per the page structure above:
- 1 heroSection (title + subtitle)
- 1 calloutSection (TL;DR)
- 1 textSection (What This Is)
- 1 accordionSection (13 Operating Principles, multi=true)
- 1 textSection (When Things Go Wrong)
- 1 textSection (Accessibility Commitment)
- 1 accordionSection (Canonical References, 5 categories, multi=true)
- 1 textSection (The Quiet Truth)
- 1 textSection (Changelog)
- Citations array for external reference links

### Phase 2: Content update from brief v2026.04.11 (same commit or separate)

- Principle #13 (AI Content Labelling) added
- Regulatory context on #3 and #8
- Updated "In practice" sections reflecting monorepo architecture
- Updated canonical references (ISO 42001, G7, UK AISI, US Executive Order, Washington State)
- Opening statement with transparency rationale and AI usage categorisation

### Phase 3: Visual QA

- Verify accordion open/close behaviour
- Verify Section Layout Contract compliance (parent owns gap)
- Check mobile rendering (accordion touch targets)
- Verify callout variant renders correctly for TL;DR

---

## Files to Modify

- Sanity content: `wp.page.1644` (patch via MCP, replace sections array)
- No code changes expected (accordion renderer already exists)

---

## Acceptance Criteria

- [ ] htmlSection replaced with structured sections (reduces inventory from 6 to 5)
- [ ] 13 operating principles render as accordion items with titles that invite clicks
- [ ] Each accordion panel stands alone (no cross-references, no "as mentioned above")
- [ ] Canonical references render as accordion with 5 category groups
- [ ] All external links work
- [ ] Content matches brief v2026.04.11
- [ ] Accordion panels are 100-400 words each
- [ ] Mobile: accordion touch targets are tappable, panels expand cleanly

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-61-ai-ethics-rebuild.md` to `docs/shipped/`
2. Transition SUG-61 to Done in Linear
