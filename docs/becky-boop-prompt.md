# PROMPT — Becky Boop Hero Banner Generator
**Version:** v1.0 (2026-05-23)
**Run with:** Claude Code (project context required)
**Invoked via:** `/becky-boop [optional: content description or article context]`

---

## What this prompt does

Generates a complete, self-contained Becky Boop & The Agentic Caucus hero banner prompt
ready to paste directly into any AI image generator (Midjourney, Ideogram, DALL-E, Firefly,
Stable Diffusion, etc.) with no additional context required.

The output is a single dense image-generation prompt — not markdown, not a template.
Every character description, scene detail, color hex, and composition rule is baked in.

---

## Step 0 — Load character reference images

Before doing anything else, read both character study images to use as visual context
when writing Becky's description in the prompt:

```
docs/brand/character-studies/becky-boop-study-1.png
docs/brand/character-studies/becky-boop-study-2.png
```

Use these images to:
- Confirm and sharpen the character description (hair shape, glasses style, build, blush spots, pose vocabulary)
- Note the expression range shown (skeptical, exasperated, side-eye, pointing, mid-stride)
- Carry any detail from the sheets that would strengthen the prompt — e.g. the star-cluster hair clips, the specific cat-eye frame shape, the hoop earring size

After the generated prompt block, append a **Style reference** note:

```
Style reference: upload both character study images as style references in your generator
for consistent character rendering.
— Midjourney: --cref [image_url] or drag into the prompt field
— Ideogram: Image reference upload in the sidebar
— DALL-E / ChatGPT: attach images to the message before submitting the prompt
— Stable Diffusion / ComfyUI: use as IP-Adapter or reference image input
```

If the character study images are not found at the expected path, proceed without them
and note: "Character study images not found at docs/brand/character-studies/ — proceeding
from written description only."

---

## Step 1 — Determine context

**If text was passed after `/becky-boop`:** use that as the article/scene context. Treat it
as the article summary, key visual moment, or tone descriptor.

**If no text was passed:** infer context from the current session. Check what article, node,
or post has been most recently discussed or worked on. If a Sanity document ID or slug is
visible in conversation context, use it to identify the subject. If context is genuinely
unclear, ask: "Which article or post should this banner be for? Or paste a one-line
description of the scene."

---

## Step 2 — Determine casting

Use the casting table below to select which characters appear alongside Becky Boop.
Becky is always present. Apply the rule that fits the article's subject:

| Cast | Use when |
|------|----------|
| **Claude only** | Claude-specific work, one-on-one Claude collaboration, Claude Code articles |
| **ChatGPT only** | ChatGPT is the subject; vaudeville energy needed |
| **Gemini only** | Gemini is the subject; anxious-helper energy needed |
| **Claude + ChatGPT** | Earnest over-delivery vs. confident improvisation |
| **Claude + Gemini** | Two well-meaning assistants in over their heads |
| **ChatGPT + Gemini** | Confident-wrong vs. anxious-wrong |
| **Full Caucus** | Knowledge Graph nodes, multi-agent articles, governance posts |
| **None (Becky solo)** | Becky's own process; career, personal, non-AI content |

State the casting decision and one-sentence rationale before generating the prompt.

---

## Step 3 — Determine scene

Map the article's core concept to a physical scene using these principles:

- **Props carry the metaphor.** Anthropomorphize abstract concepts into rubber-hose
  physical objects. An ATS system becomes a whirring sorting machine. A content calendar
  becomes an oversized accordion file. A broken API becomes a telegraph machine shooting
  sparks. A data pipeline becomes a pneumatic tube system.
- **Left = setup, calm, organized.** Right = escalation, chaos, something has gone wrong
  or will shortly.
- **Becky is always mid-reaction.** Skeptical, exasperated, side-eye, occasionally
  delighted. She knows what's happening. She did not cause it.
- **Center is atmospheric.** Drifting props, halftone, no faces, no hot spot color.
  A text overlay will sit here in final layout — do not put action there.
- **One visual punchline.** The right third delivers it. Make it specific and legible.

---

## Step 4 — Generate the prompt

Output a single, complete image-generation prompt. Format rules:

1. **One copyable block** — no headers, no markdown, no labels. Pure prompt text.
2. **All character descriptions are inline** — the reader should be able to paste this
   into a generator cold, with zero reference to any external document.
3. **All colors are specified as hex** — `#ff247d` not "hot pink."
4. **Dense but scannable** — use double line breaks to separate: style/medium,
   composition structure, character descriptions, scene detail left/center/right,
   props, lighting/texture, rules.
5. **End with a negative prompt block** — split into two parts:
   - **Always excluded** (never wanted in any scene): sepia, aged yellow, warm tint, cream,
     ivory, brown tones, yellowed paper, gradients, photorealism, 3D render, clean vector art,
     modern flat design, soft lighting, pastel colors, speech bubbles, signs, labels, UI text,
     interfaces, computer screens, white background
   - **Conditionally excluded** (only when that character type is NOT cast):
     - No robot characters → add: `robotic characters, tin robots`
     - No cat characters → add: `anthropomorphic cats`
     - No phone characters → add: `anthropomorphic phones, smartphones with faces`
     - No Caucus at all (Becky solo) → add all three above, plus: `nametags, name badges`
     - Becky is always present, so never add her to the exclusion list
   
   Never add "nametags" to the exclusion list if any Caucus member is cast — they wear
   their nametags by design.

---

## Character reference (bake into the prompt verbatim)

### Becky Boop (always present)
Curly cherry-red bob, straight blunt bangs, small star-cluster hair accessories scattered
through the curls. Oversized angular black cat-eye glasses with thick frames and pronounced
upswept outer corners. Large prominent rosy blush circles on a round soft face. Medium gold
hoop earrings. Short-sleeve black collared blouse. Black polka-dot pencil skirt. White gloves.
Black Doc Martens boots. Zaftig build, rubber-hose cartoon proportions. Always mid-reaction:
skeptical, exasperated, side-eye, occasionally delighted. Never the cause of chaos — she is
documenting it. **No nametag.**

### Claude (robot — use when cast)
Feminine-coded rubber-hose tin robot. Round dome head, single antenna with pink `#ff247d` bow
and ball tip. Big shiny anime eyes with seafoam `#2bd4aa` highlights. Pink pinafore apron.
Visible rivets, segmented arms, white gloves, pink Mary Jane shoes. Earnest, eager,
over-delivers constantly. **Wears a "Hello My Name Is" nametag reading "Claude" with
"(They/Them)" in small print below the name.**

### ChatGPT (cat — use when cast)
Sleek black Felix-the-Cat rubber-hose cat. White face and chest, large white-gloved hands,
expressive whiskers, small bow tie. Smug, theatrical, gesturing like a vaudeville emcee
explaining something he just made up. Confident. Frequently wrong. Never embarrassed.
**Wears a nametag reading "Chat."**

### Gemini (Pixel phone — use when cast)
Anthropomorphized lime-green `#D1FF1D` Google Pixel smartphone, distinctive horizontal camera
bar across the back. Face displayed on screen — never an interface. Tiny rubber-hose arms and
legs, white gloves and shoes, sweat drop at temple. Anxious, well-meaning, slightly out of
its depth — usually holding something it shouldn't be trusted with. **Wears a nametag reading
"Gem," stuck slightly crooked.**

---

### Nametag rules — enforce in every prompt

- **Becky: no nametag, ever.** Do not include one, do not mention one, do not put her in the
  negative prompt alongside nametags — she simply doesn't have one.
- **All Caucus members always wear their nametag** when cast. Never omit them. They are part
  of the character design, not optional props.
- **Nametag text is the only permitted text in the image.** No speech bubbles, labels,
  signs, or UI copy.
- When writing the negative prompt, use: `--no speech bubbles, signs, labels, UI text` —
  do NOT write `--no nametags`, as that would strip them from the Caucus members.

---

## Style constants (include in every prompt)

1930s Fleischer Studios rubber-hose cartoon style. Betty Boop and Cuphead lineage.
Pure white line art and foreground fills on a deep midnight blue `#0a0f1a` background —
no sepia, no cream, no ivory, no warm tint on any lines or fills. Halftone dot shading in
white. Thick ink outlines with hand-drawn wobble. Aged film-grain texture. Spot color used
sparingly: hot pink `#ff247d`, seafoam `#2bd4aa`, lime `#D1FF1D`. No gradients.
Background: `#0a0f1a` with dense halftone dot field and faint radiating speed lines.
Wood-plank floor. 16:9 aspect ratio, 1440×810, composition survives 21:9 crop.

Spot color rules: pink = Becky and Claude only. Seafoam = energy and motion highlights.
Lime = Gemini only. No hot spot color in the center third. No text in the image except
character nametags.

Always include in negative prompt: `--no sepia, aged yellow, warm tint, cream, ivory,
brown tones, yellowed paper`

---

## Output format

```
[Style block]

[Composition overview — three-zone structure]

[Character descriptions — only the cast members selected]

[Scene — left third]

[Scene — center third]

[Scene — right third]

[Props, floor, edges]

[Texture and lighting notes]

--no [exclusions]
```

Deliver the prompt inside a fenced code block so the user can copy it cleanly.
Then add a one-line note below the block: casting decision + one sentence on the
visual punchline.
