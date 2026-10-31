#!/usr/bin/env python3
"""Tests for stamp.py, including the check that fails when MediaLabel.module.css drifts from label-spec.json."""
import os, re, sys, tempfile, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import stamp
from PIL import Image

CSS = os.path.join(stamp.ROOT, "packages", "design-system", "src", "components", "MediaLabel", "MediaLabel.module.css")
# ST-183: the AI wording and the tool names live in the web app, not the design system.
WEB_LABEL = os.path.join(stamp.ROOT, "apps", "web", "src", "lib", "provenance.js")
CHIP_CSS = os.path.join(stamp.ROOT, "packages", "design-system", "src", "components", "Chip", "Chip.module.css")
TOKENS = os.path.join(stamp.STYLES, "tokens.css")


class SpecMatchesCss(unittest.TestCase):
    """One fact, two places: the CSS and the stamping spec must agree."""

    def setUp(self):
        self.css = open(CSS).read()  # placement and width tiers
        self.chip = open(CHIP_CSS).read()  # ST-181: type, padding, tracking, fill and border live in Chip
        self.spec = stamp.load_spec()

    def test_anchor(self):
        a = self.spec["anchorPct"]
        self.assertIn(f"left: {a}cqw;", self.css)
        self.assertIn(f"bottom: {a}cqw;", self.css)

    def test_type_size_and_cap(self):
        s, c = self.spec["sizePct"], self.spec["capPx"]
        self.assertRegex(self.chip, rf"\.sizeFluid \{{[^}}]*font-size: clamp\(\d+px, {s}cqw, {c}px\);")

    def test_width_tiers(self):
        self.assertIn(f"@container (min-width: {self.spec['minWidthShort']}px)", self.css)
        self.assertIn(f"@container (min-width: {self.spec['minWidthFull']}px)", self.css)

    def test_padding(self):
        self.assertRegex(self.chip, rf"\.sizeFluid \{{[^}}]*padding: {self.spec['padYEm']}em {self.spec['padXEm']}em;")

    def test_tracking(self):
        self.assertRegex(self.chip, rf"\.variantStatus \{{[^}}]*letter-spacing: {self.spec['trackingEm']}em;")

    def test_colour_tokens(self):
        inverse = re.search(r"\.chip\.toneInverse \{([^}]*)\}", self.chip).group(1)
        for key, var in self.spec["tokens"].items():
            self.assertIn(f"var({var})", inverse if key != "border" else inverse, f"{key} token {var} not used by Chip tone inverse")

    def test_texts(self):
        with open(WEB_LABEL) as f:
            js = f.read()
        self.assertIn(f"short: '{self.spec['textShort']}'", js)
        self.assertIn(f"full: '{self.spec['textFull']}'", js)


class ToolList(unittest.TestCase):
    """One list, three places: label-spec.json, the Studio dropdown and the web app's provenance.js must agree."""

    def test_lists_agree(self):
        spec = stamp.load_spec()
        with open(WEB_LABEL) as f:
            tsx = f.read()
        studio = open(os.path.join(stamp.ROOT, "apps", "studio", "schemas", "objects", "aiImageFields.ts")).read()
        for value, name in spec["tools"].items():
            key = f"'{value}'" if "-" in value else value
            self.assertIn(f"{key}: '{name}'", tsx, f"{value} missing from apps/web/src/lib/provenance.js")
            self.assertIn(f"{{title: '{name}', value: '{value}'}}", studio, f"{value} missing from the Studio dropdown")
        for value in spec["legacyTools"]:
            self.assertNotIn(f"value: '{value}'", studio, f"legacy {value} must not be offered in Studio")


class Detect(unittest.TestCase):
    def write(self, d, data):
        p = os.path.join(d, "src.bin")
        open(p, "wb").write(data)
        return p

    def test_iptc_ai_system_used_wins(self):
        with tempfile.TemporaryDirectory() as d:
            p = self.write(d, b"xx<Iptc4xmpExt:AISystemUsed>Gemini 2.5</Iptc4xmpExt:AISystemUsed>xx")
            r = stamp.detect(p)
            self.assertEqual(r["tool"], "gemini")
            self.assertIn("AISystemUsed", r["evidence"])

    def test_marker_and_c2pa_flag(self):
        with tempfile.TemporaryDirectory() as d:
            r = stamp.detect(self.write(d, b"JUMBF c2pa claim_generator Adobe Firefly"))
            self.assertEqual(r["tool"], "adobe-firefly")
            self.assertTrue(r["c2pa"])

    def test_nothing_found_returns_no_tool(self):
        with tempfile.TemporaryDirectory() as d:
            r = stamp.detect(self.write(d, b"plain bytes"))
            self.assertIsNone(r["tool"])
            self.assertFalse(r["c2pa"])


class Rendering(unittest.TestCase):
    def make(self, w, h, d):
        p = os.path.join(d, f"src{w}.png")
        Image.new("RGB", (w, h), (200, 120, 160)).save(p)
        return p

    def test_share_rendition_is_1200_by_630_with_metadata(self):
        with tempfile.TemporaryDirectory() as d:
            r = stamp.render_share(self.make(2000, 2000, d), "gemini", d, tool_version="v6.1")
            self.assertEqual(len(r), 1)
            self.assertEqual((r[0]["width"], r[0]["height"]), (1200, 630))
            im = Image.open(r[0]["path"])
            self.assertEqual(im.size, (1200, 630))
            self.assertIsNotNone(r[0]["mark"], "share image carries the baked mark")
            self.assertTrue(stamp.verify(r[0]["path"])["digitalSourceType"])
            b = open(r[0]["path"], "rb").read()
            self.assertIn(b"<Iptc4xmpExt:AISystemVersionUsed>v6.1</Iptc4xmpExt:AISystemVersionUsed>", b)

    def test_version_tag_absent_when_no_version(self):
        self.assertNotIn(b"AISystemVersionUsed", stamp.build_xmp("gemini", stamp.load_spec()))

    def test_version_tag_is_escaped(self):
        self.assertIn(b"v1 &lt;b&gt;", stamp.build_xmp("gemini", stamp.load_spec(), "v1 <b>"))

    def test_widths_never_upscale(self):
        with tempfile.TemporaryDirectory() as d:
            r = stamp.render(self.make(1000, 600, d), "gemini", d)
            self.assertEqual([x["width"] for x in r], [480, 960, 1000])

    def test_metadata_written_and_verified(self):
        with tempfile.TemporaryDirectory() as d:
            r = stamp.render(self.make(1200, 800, d), "adobe-firefly", d)
            for x in r:
                v = stamp.verify(x["path"])
                self.assertTrue(v["digitalSourceType"])
                self.assertTrue(v["xmpPresent"])
                self.assertIn(b"Adobe Firefly", open(x["path"], "rb").read())

    def test_unknown_tool_has_no_ai_system_tag(self):
        with tempfile.TemporaryDirectory() as d:
            r = stamp.render(self.make(600, 400, d), "other", d)
            self.assertNotIn(b"AISystemUsed", open(r[0]["path"], "rb").read())

    def test_label_tiers(self):
        spec = stamp.load_spec()
        self.assertEqual(stamp.label_text(95, spec), "")
        self.assertEqual(stamp.label_text(96, spec), "AI")
        self.assertEqual(stamp.label_text(199, spec), "AI")
        self.assertEqual(stamp.label_text(200, spec), "AI-generated")

    def test_type_is_capped(self):
        spec = stamp.load_spec()
        self.assertEqual(stamp.type_px(1920, spec), 14)
        self.assertEqual(stamp.type_px(200, spec), 6)

    def test_tiny_source_gets_no_mark_but_keeps_metadata(self):
        with tempfile.TemporaryDirectory() as d:
            r = stamp.render(self.make(80, 60, d), "gemini", d)
            self.assertIsNone(r[0]["mark"])
            self.assertTrue(stamp.verify(r[0]["path"])["digitalSourceType"])

    def test_mark_is_inside_the_image(self):
        with tempfile.TemporaryDirectory() as d:
            for w in (200, 480, 1920):
                r = stamp.render(self.make(w, int(w * .6), d), "gemini", d)[-1]
                x0, y0, x1, y1 = r["mark"]["box"]
                self.assertGreaterEqual(x0, 0); self.assertGreaterEqual(y0, 0)
                self.assertLessEqual(x1, r["width"]); self.assertLessEqual(y1, r["height"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
