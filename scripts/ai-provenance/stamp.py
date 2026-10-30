#!/usr/bin/env python3
"""
ST-178: stamp the AI-generated label into an image and write provenance metadata.

For one source image, writes sized JPEG copies (480, 960, 1920 wide, never upscaled) that each
carry (1) the visible mark baked into the pixels, the same label the site renders as AiLabel,
and (2) IPTC/XMP provenance: DigitalSourceType = trainedAlgorithmicMedia, AISystemUsed, and a
description. The Sanity image CDN strips embedded metadata, so these copies are uploaded as
file assets and served directly (Phase 1 audit, docs/backlog/ST-178-*.md).

Usage:
  python3 scripts/ai-provenance/stamp.py SOURCE --tool midjourney --outdir DIR [--name BASE]
  python3 scripts/ai-provenance/stamp.py --verify FILE

Needs Pillow. The mark's look comes from label-spec.json and the design tokens; the test in
test_stamp.py fails if AiLabel.module.css drifts from them.
"""
import argparse, io, json, os, re, struct, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
STYLES = os.path.join(ROOT, "apps", "web", "src", "design-system", "styles")

TOOL_NAMES = {
    "dall-e": "DALL-E",
    "midjourney": "Midjourney",
    "stable-diffusion": "Stable Diffusion",
    "adobe-firefly": "Adobe Firefly",
}


def load_spec():
    with open(os.path.join(HERE, "label-spec.json")) as f:
        return json.load(f)


def _tokens(path, first_only=False):
    out = {}
    for m in re.finditer(r"(--[\w-]+)\s*:\s*([^;]+);", open(path).read()):
        if first_only and m.group(1) in out:
            continue
        out[m.group(1)] = m.group(2).strip()
    return out


def resolve_colour(name, base, theme):
    """Follow var(--x) chains. The theme file's first occurrence wins over tokens.css."""
    seen = set()
    cur = name
    while cur not in seen:
        seen.add(cur)
        val = theme.get(cur) or base.get(cur)
        if val is None:
            raise KeyError(f"token {cur} not found")
        m = re.fullmatch(r"var\((--[\w-]+)\)", val)
        if not m:
            return val
        cur = m.group(1)
    raise ValueError(f"token cycle at {name}")


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def colours(spec):
    base = _tokens(os.path.join(STYLES, "tokens.css"))
    theme = _tokens(os.path.join(STYLES, "theme.pink-moon.css"), first_only=True)
    return {k: hex_to_rgb(resolve_colour(v, base, theme)) for k, v in spec["tokens"].items()}


def label_text(width, spec):
    if width < spec["minWidthShort"]:
        return ""
    return spec["textShort"] if width < spec["minWidthFull"] else spec["textFull"]


def type_px(width, spec):
    return max(1, round(min(width * spec["sizePct"] / 100, spec["capPx"])))


def load_font(px, spec):
    for path in spec["fonts"]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, px, index=1) if path.endswith(".ttc") else ImageFont.truetype(path, px)
            except Exception:
                try:
                    return ImageFont.truetype(path, px)
                except Exception:
                    pass
    return ImageFont.load_default(px)


def draw_mark(im, spec, cols):
    w, h = im.size
    text = label_text(w, spec).upper()
    if not text:
        return im, None
    px = type_px(w, spec)
    font = load_font(px, spec)
    track = spec["trackingEm"] * px
    d = ImageDraw.Draw(im)
    adv = [d.textlength(c, font=font) + track for c in text]
    text_w = sum(adv) - track
    pad_x, pad_y = spec["padXEm"] * px, spec["padYEm"] * px
    box_w = text_w + 2 * pad_x + 2 * spec["borderPx"]
    box_h = px + 2 * pad_y + 2 * spec["borderPx"]
    left = w * spec["anchorPct"] / 100
    bottom = h - w * spec["anchorPct"] / 100
    x0, y1 = left, bottom
    x1, y0 = x0 + box_w, y1 - box_h
    d.rectangle([x0, y0, x1, y1], fill=cols["fill"], outline=cols["border"], width=spec["borderPx"])
    x = x0 + spec["borderPx"] + pad_x
    y = y0 + spec["borderPx"] + pad_y
    for c, a in zip(text, adv):
        d.text((x, y), c, font=font, fill=cols["text"])
        x += a
    return im, {"text": text, "typePx": px, "box": [round(x0), round(y0), round(x1), round(y1)]}


def build_xmp(tool, spec):
    tool_name = TOOL_NAMES.get(tool or "")
    desc = "AI-generated image" + (f" ({tool_name})" if tool_name else "")
    ai_sys = f"\n<Iptc4xmpExt:AISystemUsed>{tool_name}</Iptc4xmpExt:AISystemUsed>" if tool_name else ""
    return (
        '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>\n'
        '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n'
        '<rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
        'xmlns:dc="http://purl.org/dc/elements/1.1/">\n'
        f'<Iptc4xmpExt:DigitalSourceType>{spec["digitalSourceType"]}</Iptc4xmpExt:DigitalSourceType>{ai_sys}\n'
        f'<dc:description><rdf:Alt><rdf:li xml:lang="x-default">{desc}</rdf:li></rdf:Alt></dc:description>\n'
        '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>'
    ).encode("utf-8")


def insert_xmp(jpeg_bytes, xmp):
    hdr = b"http://ns.adobe.com/xap/1.0/\x00"
    if len(hdr) + len(xmp) + 2 > 65535:
        raise ValueError("XMP packet too large for one APP1 segment")
    seg = b"\xff\xe1" + struct.pack(">H", len(hdr) + len(xmp) + 2) + hdr + xmp
    return jpeg_bytes[:2] + seg + jpeg_bytes[2:]


def render(source_path, tool, outdir, name=None):
    spec = load_spec()
    cols = colours(spec)
    src = Image.open(source_path)
    src = src.convert("RGB")
    base = name or os.path.splitext(os.path.basename(source_path))[0]
    os.makedirs(outdir, exist_ok=True)
    widths = [w for w in spec["renditionWidths"] if w < src.width] + [min(src.width, max(spec["renditionWidths"]))]
    results = []
    for w in sorted(set(widths)):
        h = round(src.height * w / src.width)
        im = src.resize((w, h), Image.LANCZOS) if w != src.width else src.copy()
        im, mark = draw_mark(im, spec, cols)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=spec["jpegQuality"], optimize=True, progressive=True)
        data = insert_xmp(buf.getvalue(), build_xmp(tool, spec))
        path = os.path.join(outdir, f"{base}-{w}.jpg")
        with open(path, "wb") as f:
            f.write(data)
        results.append({"width": w, "height": h, "path": path, "bytes": len(data), "mark": mark})
    return results


def verify(path):
    spec = load_spec()
    b = open(path, "rb").read()
    im = Image.open(path)
    return {
        "path": path,
        "width": im.width,
        "digitalSourceType": spec["digitalSourceType"].encode() in b,
        "xmpPresent": b"http://ns.adobe.com/xap/1.0/" in b,
        "expectedLabel": label_text(im.width, spec) or None,
    }


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("source", nargs="?")
    p.add_argument("--tool", default="", help="aiTool schema value, e.g. midjourney")
    p.add_argument("--outdir")
    p.add_argument("--name")
    p.add_argument("--verify", metavar="FILE")
    a = p.parse_args(argv)
    if a.verify:
        r = verify(a.verify)
        print(json.dumps(r, indent=2))
        return 0 if r["digitalSourceType"] else 1
    if not a.source or not a.outdir:
        p.error("SOURCE and --outdir are required")
    print(json.dumps(render(a.source, a.tool, a.outdir, a.name), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
