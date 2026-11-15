#!/usr/bin/env python3
"""Evidence generator for docs/reports/property-cluster-drift-audit.md (SUG-206, #68).

Run from the repo root:
    python3 -I docs/reports/property-cluster-drift-audit.sweep.py > /tmp/sweep.md

Prints the report's appendix tables as markdown. Every count in the report comes from
this output. It reads CSS only and writes nothing. It is an audit record, not a
validator: nothing runs it in CI or pre-commit.

Files scanned (same roots as `pnpm validate:tokens`):
    apps/web/src/**/*.css, packages/design-system/src/**/*.css, apps/storybook/.storybook/**/*.css
Excluded:
    tokens.css, theme.pink-moon.css, theme.shop.css (definition layer)
    apps/web/src/design-system/styles/{globals,utilities}.css (byte-identical mirrors of the
    DS-package copies, per `pnpm validate:style-mirror`; counted once, under packages/)
"""
import collections, os, re, sys

ROOT = "."
DIRS = ["apps/web/src", "packages/design-system/src", "apps/storybook/.storybook"]
EXCLUDE_NAMES = {"tokens.css", "theme.pink-moon.css", "theme.shop.css"}
MIRROR_SKIP = {"apps/web/src/design-system/styles/globals.css",
               "apps/web/src/design-system/styles/utilities.css"}


# ── parse ────────────────────────────────────────────────────────────────────
def css_files():
    out = []
    for d in DIRS:
        for dp, _, fns in os.walk(os.path.join(ROOT, d)):
            for fn in fns:
                rel = os.path.relpath(os.path.join(dp, fn), ROOT)
                if fn.endswith(".css") and fn not in EXCLUDE_NAMES and rel not in MIRROR_SKIP:
                    out.append(rel)
    return sorted(out)


def parse(rel):
    src = open(os.path.join(ROOT, rel)).read()
    src = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)), src, flags=re.S)
    blocks, stack, buf, buf_line, line = [], [], "", 1, 1
    for ch in src:
        if ch == "{":
            stack.append({"header": " ".join(buf.split()), "line": buf_line, "decls": []})
            buf = ""
        elif ch in ";}":
            if buf.strip() and stack:
                stack[-1]["decls"].append((buf, buf_line))
            buf = ""
            if ch == "}" and stack:
                b = stack.pop()
                decls = []
                for text, ln in b["decls"]:
                    if ":" in text:
                        p, v = text.split(":", 1)
                        decls.append((p.strip().lower(), " ".join(v.split()), ln))
                if decls and not b["header"].startswith("@"):
                    blocks.append({"file": rel, "line": b["line"], "sel": b["header"],
                                   "media": any(s["header"].startswith("@media") for s in stack),
                                   "decls": decls})
        else:
            if not buf.strip() and not ch.isspace():
                buf_line = line
            buf += ch
        if ch == "\n":
            line += 1
    return blocks


FILES = css_files()
BLOCKS = [b for f in FILES for b in parse(f)]


def short(path):
    return path.replace("apps/web/src/", "web/").replace("packages/design-system/src/", "ds/")


def tok(v):
    return v.replace("var(--st-", "").replace(")", "") if v else "–"


def props(b, names):
    out = {}
    for p, v, ln in b["decls"]:
        if p in names:
            out[p] = (v, ln)
    return out


def table(header, rows):
    print("| " + " | ".join(header) + " |")
    print("|" + "---|" * len(header))
    for r in rows:
        print("| " + " | ".join(str(c).replace("|", "\\|") for c in r) + " |")
    print()


def is_raw(v):
    return "var(" not in v and v not in ("inherit", "normal", "initial", "unset", "none", "0", "auto")


print(f"Scanned {len(FILES)} files, {len(BLOCKS)} rule blocks, "
      f"{sum(len(b['decls']) for b in BLOCKS)} declarations.\n")

# ── A. typography ────────────────────────────────────────────────────────────
TYPO = {"font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color", "text-transform"}
HEADING_TOKENS = ["font-page-h1", "font-heading-1", "font-heading-2", "font-heading-3", "font-heading-4"]

print("### A1. Heading bundles: every block that sets a heading font-size token\n")
print("`@media` rows are responsive size-only overrides of a bundle above them, listed so the count is complete.\n")
for t in HEADING_TOKENS:
    rows = []
    for b in BLOCKS:
        p = props(b, TYPO)
        if p.get("font-size", ("",))[0] == f"var(--st-{t})":
            rows.append([f"`{short(b['file'])}:{p['font-size'][1]}`", f"`{b['sel'][:48]}`" + (" (@media)" if b["media"] else ""),
                         tok(p.get("font-family", (None,))[0]), tok(p.get("font-weight", (None,))[0]),
                         tok(p.get("line-height", (None,))[0]), tok(p.get("color", (None,))[0])])
    files = {r[0].split(":")[0] for r in rows}
    print(f"**`--st-{t}`: {len(rows)} blocks in {len(files)} files**\n")
    table(["Site", "Selector", "family", "weight", "line-height", "color"], rows)

print("### A2. Label bundle: every block that sets `font-size: var(--st-label-size)`\n")
rows = []
for b in BLOCKS:
    p = props(b, TYPO)
    if p.get("font-size", ("",))[0] == "var(--st-label-size)":
        rows.append([f"`{short(b['file'])}:{p['font-size'][1]}`", f"`{b['sel'][:44]}`" + (" (@media)" if b["media"] else ""),
                     tok(p.get("font-family", (None,))[0]), tok(p.get("font-weight", (None,))[0]),
                     tok(p.get("letter-spacing", (None,))[0]), tok(p.get("text-transform", (None,))[0]),
                     tok(p.get("color", (None,))[0])])
print(f"**{len(rows)} blocks in {len({r[0].split(':')[0] for r in rows})} files**\n")
table(["Site", "Selector", "family", "weight", "letter-spacing", "transform", "color"], rows)

print("### A3. Raw typography values per file (not cluster instances; counted, not listed)\n")
cnt = collections.defaultdict(collections.Counter)
for b in BLOCKS:
    for p, v, _ in b["decls"]:
        if p in ("font-size", "font-weight", "line-height", "letter-spacing") and is_raw(v):
            cnt[b["file"]][p] += 1
rows = [[f"`{short(f)}`", c["font-size"], c["font-weight"], c["line-height"], c["letter-spacing"], sum(c.values())]
        for f, c in sorted(cnt.items(), key=lambda kv: -sum(kv[1].values()))]
tot = collections.Counter()
for c in cnt.values():
    tot.update(c)
print(f"**{sum(tot.values())} raw values in {len(cnt)} files:** font-size {tot['font-size']}, "
      f"font-weight {tot['font-weight']}, line-height {tot['line-height']}, letter-spacing {tot['letter-spacing']}\n")
table(["File", "font-size", "font-weight", "line-height", "letter-spacing", "total"], rows)

# ── B. spacing ───────────────────────────────────────────────────────────────
SP = lambda p: p in ("gap", "row-gap", "column-gap") or p.startswith(("padding", "margin"))
print("### B1. Multi-token spacing values repeated in 2 or more files\n")
vals = collections.defaultdict(list)
for b in BLOCKS:
    for p, v, ln in b["decls"]:
        if SP(p) and v.count("var(--st-") >= 2:
            vals[(p, v)].append(f"`{short(b['file'])}:{ln}` `{b['sel'][:36]}`")
rows = [[f"`{p}: {v}`", len(sites), "<br>".join(sites)]
        for (p, v), sites in sorted(vals.items(), key=lambda kv: -len(kv[1]))
        if len({s.split(':')[0] for s in sites}) >= 2]
table(["Value", "Sites", "Where"], rows)

print("### B2. Spacing token scales in use\n")
scale = collections.Counter()
raw_sp = collections.Counter()
for b in BLOCKS:
    for p, v, _ in b["decls"]:
        if SP(p):
            for m in re.findall(r"var\(--st-(space-\d+|spacing-[a-z]+|[a-z-]+)", v):
                fam = "space-N" if m.startswith("space-") else ("spacing-stack/inset" if m.startswith("spacing-") else "component-scoped")
                scale[fam] += 1
            if re.search(r"\d(px|rem|em)\b", v) and "var(" not in v:
                raw_sp[b["file"]] += 1
table(["Token family", "References"], [[k, v] for k, v in scale.most_common()])
print(f"Raw spacing values with units (no token at all): {sum(raw_sp.values())} in {len(raw_sp)} files.\n")

# ── C. surfaces ──────────────────────────────────────────────────────────────
def surf(b):
    out = {}
    for p, v, ln in b["decls"]:
        if p in ("background", "background-color"):
            out["bg"] = v
        elif p in ("border", "border-color"):
            out.setdefault("border", v)
        elif p == "border-radius":
            out["radius"] = v
        elif p == "box-shadow":
            out["shadow"] = v
    return out

print("### C1. Surface signatures (2+ of background, border, radius, shadow) repeated in 2 or more files\n")
sig = collections.defaultdict(list)
for b in BLOCKS:
    s = surf(b)
    if len(s) >= 2:
        sig[tuple(sorted(s.items()))].append(f"`{short(b['file'])}:{b['line']}` `{b['sel'][:36]}`")
rows = [["; ".join(f"{k} `{v}`" for k, v in s), len(sites), "<br>".join(sites)]
        for s, sites in sorted(sig.items(), key=lambda kv: -len(kv[1]))
        if len({x.split(':')[0] for x in sites}) >= 2]
n_multi = sum(len(v) for v in sig.values())
print(f"{n_multi} blocks carry 2+ surface properties, in {len(sig)} distinct combinations; "
      f"{len(rows)} combinations repeat across files.\n")
table(["Signature", "Sites", "Where"], rows)

print("### C2. bg-through-gap hairline containers (1px gap plus a background on the same block)\n")
rows = []
for b in BLOCKS:
    p = props(b, {"gap", "background", "background-color"})
    g = p.get("gap", ("",))[0]
    if (g.startswith("1px") or "space-0" in g) and ("background" in p or "background-color" in p):
        bg = p.get("background", p.get("background-color"))
        rows.append([f"`{short(b['file'])}:{b['line']}`", f"`{b['sel']}`", f"`{g}`", f"`{bg[0]}`"])
table(["Site", "Selector", "gap", "background"], rows)

# ── D. motion ────────────────────────────────────────────────────────────────
print("### D1. Transition values repeated in 2 or more files\n")
tr = collections.defaultdict(list)
dur = collections.Counter()
for b in BLOCKS:
    for p, v, ln in b["decls"]:
        if p == "transition":
            tr[v].append(f"`{short(b['file'])}:{ln}`")
            for m in re.findall(r"(?<![\w-])(\d*\.?\d+m?s)\b", v):
                dur["raw " + m] += 1
            dur["token"] += len(re.findall(r"var\(--st-transition", v))
rows = [[f"`{v}`", len(s), "<br>".join(s)] for v, s in sorted(tr.items(), key=lambda kv: -len(kv[1]))
        if len({x.split(':')[0] for x in s}) >= 2]
print(f"{sum(len(v) for v in tr.values())} `transition` declarations in "
      f"{len({x.split(':')[0] for v in tr.values() for x in v})} files, {len(tr)} distinct values.\n")
table(["Value", "Sites", "Where"], rows)
print("Duration sources across all transitions:\n")
table(["Duration", "Uses"], [[k, v] for k, v in dur.most_common()])

print("### D2. Hover transforms\n")
rows = []
for b in BLOCKS:
    if ":hover" in b["sel"]:
        for p, v, ln in b["decls"]:
            if p == "transform":
                rows.append([f"`{short(b['file'])}:{ln}`", f"`{b['sel'][:48]}`", f"`{v}`"])
table(["Site", "Selector", "transform"], rows)

# ── E. focus rings ───────────────────────────────────────────────────────────
print("### E1. Focus-ring declarations (selectors containing `focus`)\n")
sig = collections.defaultdict(list)
for b in BLOCKS:
    if "focus" in b["sel"]:
        s = tuple(sorted((p, v) for p, v, _ in b["decls"] if p in ("outline", "outline-offset", "box-shadow")))
        if s:
            sig[s].append(f"`{short(b['file'])}:{b['line']}`")
rows = [["; ".join(f"{p} `{v}`" for p, v in s), len(sites), "<br>".join(sites)]
        for s, sites in sorted(sig.items(), key=lambda kv: -len(kv[1]))]
print(f"{sum(len(v) for v in sig.values())} focus blocks in "
      f"{len({x.split(':')[0] for v in sig.values() for x in v})} files, {len(sig)} distinct rings.\n")
table(["Ring", "Sites", "Where"], rows)
