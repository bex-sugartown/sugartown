# Card & Tile decomposition — a law-02 case study + implementation plan

> Status: proposed · Owner: DS · Source of record: the Component Naming Audit + `uploads/component-registry.md`
> Governing rules: the Naming & Composition Charter (`docs/README.md`, `CLAUDE.md`).

This is the worked example the charter exists for: two overloaded components (`Card`, `Tile`) that each
re-implement primitives inline and have accreted use-case-named variants. We pull the primitives out, codify
`Card` as a pure container, and re-express everything else as **compositions** of it. Nothing new is invented —
the primitives already exist in our stories; they've just never been extracted.

---

## 1. The problem

Today these are tangled together:

- **`Tile`** carries `Metric` (value/label/trend), `Meter` (the bar), and `Skeleton` (loading) **inline**, inside
  its stories. It is otherwise just a container.
- **`Card`** bundles the base container **and** the ledger footer (`NEXT STEP:` / `AI:` / `KPIs:` / date), **and** a
  listing layout, **and** media.
- **`ContentCard`**, **`MetadataCard`**, and the **listing / "ListView"** view each re-declare container logic on top.

Result: four+ "card-ish" components that overlap, plus three primitives hidden inside `Tile`. Changing card
padding means touching five files; the ledger footer can't be reused off a card; `Tile` and `Card` duplicate the
same box.

**Audit rows in play** (current status):

| Concept | Audit status | Becomes |
|--------|--------------|---------|
| Card | In system (overloaded) | **re-codified** — pure container primitive |
| Tile | Diverges → fold into Card | a `Card` **variant**; contents extracted |
| Metric (Statistic) | To codify | **primitive** (extract from Tile) |
| Meter | To codify | **primitive** (extract from Tile) |
| Skeleton | To codify | **primitive** (extract from Tile) |
| Description list | Not yet | **primitive** — the MetadataCard field grid |
| Avatar | To codify | **primitive** (person/metadata surfaces) |
| CardGrid | In system | composite pattern — grid of `Card` |

---

## 2. Target architecture

```
CardGrid                         pattern · grid of Cards (existing)
└─ Card                          PRIMITIVE · container only
   │                             variants: elevated | listing | accent
   ├─ Media                      primitive (existing)
   ├─ ▢ header slot              → SectionLabel · Chip · heading
   ├─ ▢ body slot                → any composition:
   │                                · Metric (+ Meter)          ← was Tile
   │                                · DescriptionList            ← MetadataCard field grid
   │                                · ContentMeta / excerpt      ← ContentCard
   │                                · Skeleton                   ← loading state
   └─ ▢ footer slot              → ledger rule + Metadata row
                                    (NEXT STEP: / AI: / KPIs: / date)

Patterns composed ON the Card primitive (no container logic of their own):
  ContentCard   = query → Card( Media + Chip + heading + excerpt )      thin data adapter
  MetadataCard  = Card( DescriptionList + Chip )                        the metadata surface
  StatCard      = Card( Metric + Meter )            ← replaces Tile / statTileSection
  ListView      = CardGrid with Card variant="listing"   ← a CONFIG, not a component
```

**The rule made concrete:** `Card` owns the box and its slots. Anything *inside* a card is a primitive or a
composition of primitives. Anything *named for what it holds* (Content, Metadata, Stat, Tile) is a **pattern or a
config**, never a second container.

---

## 3. Naming decisions of record

| Old | Verdict | New |
|-----|---------|-----|
| `Tile` | Redundant container (Carbon proves Tile≡Card) | `Card` variant; extract Metric/Meter/Skeleton |
| `ListView` / listing card | Use-case/layout name | `Card variant="listing"` (a config) |
| ledger footer (baked into Card) | A composition, not a card feature | `Card` **footer slot** composing a `Metadata` row |
| `ContentCard` | "Content" is a domain noun — keep ONLY as a thin query→Card adapter; it must add **no** container UI | stays a pattern, audited to ensure it's binding-only |
| `MetadataCard` | Structural enough to keep as a pattern | `Card` + `DescriptionList` primitive |
| `statTileSection` (schema) | Named for the old Tile | `cardSection` rendering `StatCard` (Card+Metric) |

> Reviewer test for any survivor: *does it render its own box, or does it compose `Card`?* If it renders its own
> box, it's a duplicate — delete the box, compose `Card`.

---

## 4. Implementation — end to end

**Order is non-negotiable: primitives first (law 02). A pattern PR cannot merge before its primitives are codified.**

### Phase 0 — extract the leaf primitives  *(unblocks everything)*
- [ ] `packages/ds/Metric/` — value + label + optional trend. Story `Primitives/Metric`. Registry row.
- [ ] `packages/ds/Meter/` — `role="meter"`, value-in-range bar (confirm vs Progress). Story + registry.
- [ ] `packages/ds/Skeleton/` — greyed loading shapes (text / block / circle). Story + registry.
- [ ] `packages/ds/DescriptionList/` — `<dl>` key/value grid (the MetadataCard field grid). Story + registry.
- [ ] `packages/ds/Avatar/` — image/initials, sizes. Story + registry. *(used on person pages today)*
- [ ] Tokens only; `pnpm validate:tokens --strict-colors` green for each.

### Phase 1 — re-codify the Card primitive
- [ ] `packages/ds/Card/` reduced to **container + slots** (`media`, `header`, `body`, `footer`).
- [ ] Variants as props: `elevated | listing | accent` (accent = 3px left rule + tinted header).
- [ ] Remove inlined ledger-footer content; expose `footer` slot only.
- [ ] Stories: `Primitives/Card` (base, listing, accent, with-media, with-footer).
- [ ] Web adapter unchanged except `<Link to>` (no new story per the registry's story rule).

### Phase 2 — fold Tile in, build StatCard
- [ ] `StatCard` = `Card( Metric + Meter )` in `web/components/`. Story `Patterns/StatCard`.
- [ ] Point `statTileSection` renderer at `StatCard`; **deprecate `packages/ds/Tile`** (codemod below).
- [ ] Loading state = `Card( Skeleton )` — retire Tile's inline loading story.

### Phase 3 — recompose the smooshed patterns
- [ ] `MetadataCard` → `Card( DescriptionList + Chip )`; delete its private container markup.
- [ ] `ContentCard` → assert it's a **binding-only** adapter: `query → Card( Media + Chip + heading + excerpt )`.
      Any UI it still owns must move to `Card` slots / primitives.
- [ ] Listing/"ListView" → `CardGrid` with `Card variant="listing"`; remove any bespoke list-card component.
- [ ] Ledger footer → a `Metadata` row composed into `Card`'s footer slot (NEXT STEP / AI / KPIs / date).

### Phase 4 — schema + content
- [ ] Rename `statTileSection` → `cardSection` (or fold into `cardBuilderSection`) in Studio; migrate documents.
- [ ] Update `PageSections.jsx` `switch (_type)` mapping.
- [ ] `imageGallery` / carousel remain separate tickets (SUG-98) — not in this epic.

### Phase 5 — close out
- [ ] Registry rows added/updated for every new primitive + pattern.
- [ ] Audit rows flipped: Metric/Meter/Skeleton/DescriptionList/Avatar → **In system**; Tile → retired-into-Card.
- [ ] Delete deprecated `Tile`, bespoke list-card, duplicated container CSS.

---

## 5. Deprecations & codemods

| Remove | Replace with | Migration |
|--------|--------------|-----------|
| `Tile` | `StatCard` (or `Card` + content) | codemod `import { Tile }` → `Card`; map `metric`→`<Metric>` |
| listing card component | `<CardGrid><Card variant="listing">` | codemod props → variant |
| inline ledger footer | `<Card footer={<Metadata …/>}>` | manual; ~N call sites |
| `statTileSection` type | `cardSection` | Sanity migration script + content backfill |

Keep deprecated exports for **one** minor with a console warning, then delete.

---

## 6. Definition of done

1. `Card` renders **no** domain content of its own — only slots + variants.
2. No component other than `Card`/`CardGrid` renders a card box.
3. `Metric`, `Meter`, `Skeleton`, `DescriptionList`, `Avatar` each have a primitive + Storybook story + registry row.
4. `Tile` is deleted; `statTileSection` renders `StatCard`.
5. `ContentCard`/`MetadataCard` contain **zero** container/box CSS — they compose `Card`.
6. The audit's Data-display section shows the composition tree above, not a pile of overlapping cards.

> One line for the inevitable review thread: *the box is `Card`; everything else composes it. Charter, law 02.*
