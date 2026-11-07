# Vspec rules

**Copy `docs/conventions/vspec-template.html` to `docs/drafts/ST-{N}-{slug}.vspec.html` and fill every section.** A vspec is the Phase 0 visual spec: what the change looks like and does, signed off by Bex before any implementation file changes. The trigger is in `CLAUDE.md` §Phase 0 visual spec gate. This file says what a vspec contains and how it is judged. Written for ST-202 (#202), 2026-11-07.

## What a vspec contains

The template has eleven sections, in this order. A section that does not apply keeps its heading and says "Not applicable" with the reason, so a reviewer can tell skipped from forgotten.

| # | Section | Holds |
|---|---|---|
| 1 | Interactive prototype | Whatever the change touches, shown whole |
| 2 | Before and after | A dated image of the live page, and the after |
| 3 | Behaviour annotations | The six nav rows |
| 4 | Contrast, measured | A ratio per text pair, in both themes, with the command |
| 5 | Class naming table | Every new class, its closest existing pattern, the decision |
| 6 | Component choice audit | What exists, extend or replace, why |
| 7 | Token list | Every token the design uses |
| 8 | Governance checks | Which gates applied and the evidence each was met |
| 9 | Decisions answered | Each decision, the answer, the date |
| 10 | Change-specific sections | Content that belongs to this change only and fits none of sections 1 to 9 |
| 11 | Phase 0 checklist | Four boxes, ticked by Bex |

## Change-specific content

**Content that belongs to one change goes in section 10, under its own heading, not into a fixed section.** Example: #201's table of caption and credit rules per image treatment. The other ten sections keep one meaning in every vspec so a reviewer finds the same thing in the same place.

## Show the whole thing

**A prototype shows whatever the change touches, whole: a page layout, a section, a component, a style or a token.** For a carousel that is the arrows, dots, caption and the peek slides, not the image alone. Show it in both themes with the toggle. (#201's first prototype showed one theme only.)

## Before is real

**A Before is a dated screenshot of the live page, or a render of the live component. It is never hand-built markup.** Save the image beside the vspec as `ST-{N}-before-live-{YYYY-MM-DD}.webp` and put the capture date in the caption. A state that is not live today is never shown as Before. Every Before and After carries a BEFORE or AFTER tag. (#205: a hypothetical Before panel showed buttons and a counter that do not exist on the live page.)

## When a vspec becomes interactive

**Build the interaction as vanilla JS in a script tag when any of these fires:** scroll-spy, filtering, expand or collapse, tab or panel switching, sticky positioning that depends on scroll, drag or reorder, persisted state. No framework, no build step. It is the same file and the same gate. If none fires, add no JS. The theme toggle is not an interaction trigger.

## Behaviour annotations

**Any sidebar, nav rail, tab bar or anchor-bearing surface annotates all six rows:** active state, hash and anchor, scroll-spy, sticky or fixed, mobile collapse, click side-effects. "Same as PageSidebar scrollspy" is allowed. A blank row is not.

## Class names

**A class in a vspec is the class that ships.** Use the semantic name you intend to use in production. If it is not settled, use a generic placeholder marked `/* TBD */`. Never name a class after a content type. Template-only classes, which never ship to the site, use the `vspec` prefix. The CSS reuse audit in `.claude/rules/css-layout.md` applies to every class in section 5.

## Evidence per claim

**Each claim about the current system names the command or file that shows it.** A count, a size or a measurement without its command is removed or marked "unmeasured". Do not copy a figure from an earlier doc.

## Contrast

**Measure every text pair in both themes, and name the command.** Text needs 4.5:1, non-text 3:1. Record the date measured.

- `pnpm validate:contrast` checks token pairs across the themes. It does not check a pair the vspec composes itself, so it does not replace the browser script below.
- The dark theme's surfaces are translucent (`--st-color-bg-surface` is a white wash), so a measurement must composite every ancestor background over white before comparing.

Run the script in the browser console on the served vspec (serve the repo root with `python3 -m http.server`, then open the page, because opening the file directly can drop the stylesheets in some previews). Edit the `pairs` list to the vspec's own pairs.

```js
(function () {
  const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const over = (t, b) => { const a = t.a + b.a * (1 - t.a); return { r: (t.r*t.a + b.r*b.a*(1-t.a))/a, g: (t.g*t.a + b.g*b.a*(1-t.a))/a, b: (t.b*t.a + b.b*b.a*(1-t.a))/a, a }; };
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = c => 0.2126*lin(c.r) + 0.7152*lin(c.g) + 0.0722*lin(c.b);
  const ratio = (f, b) => { const x = lum(f), y = lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
  const bgOf = el => { const ch = []; for (let e = el; e; e = e.parentElement) ch.push(parse(getComputedStyle(e).backgroundColor)); let acc = { r: 255, g: 255, b: 255, a: 1 }; for (let i = ch.length - 1; i >= 0; i--) acc = over(ch[i], acc); return acc; };
  const pairs = [['Body text on canvas', 'main > p'] /* FILL: [name, selector] per pair */];
  const out = {};
  for (const theme of ['light-pink-moon', 'dark-pink-moon']) {
    document.documentElement.setAttribute('data-theme', theme);
    out[theme] = pairs.map(([n, s]) => { const el = document.querySelector(s), bg = bgOf(el); return n + ': ' + ratio(over(parse(getComputedStyle(el).color), bg), bg).toFixed(2); });
  }
  document.documentElement.setAttribute('data-theme', 'light-pink-moon');
  return out;
})()
```

A text pair under 4.5:1 is fixed before sign-off, not noted. (ST-202: pass and fail words in the signal colours measured 3.54 and 3.20 in light; the words moved to default text colour and the signal colour to a border.)

## Decisions answered

**List each decision with its answer and date. An unanswered decision stays in section 9, marked open.** Ask open decisions in one batch before the Phase 0 sign-off. An approval of the vspec as drawn takes the answer drawn for each open decision, and the checklist line says so.

## Where a vspec lives

| Stage | Location |
|---|---|
| While the epic runs | `docs/drafts/ST-{N}-{slug}.vspec.html` (gitignored, local) |
| Before images | beside it in `docs/drafts/` |
| After close-out | copied to `docs/shipped/ST-{N}-{slug}.vspec.html`, committed with the step 6 doc move (`CLAUDE.md` §Epic close-out sequence, step 6b) |

The template itself lives in `docs/conventions/` because that folder is tracked.
