#!/usr/bin/env python3
"""Tests for stamp.py, including the check that fails when AiLabel.module.css drifts from label-spec.json."""
import os, re, sys, tempfile, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import stamp
from PIL import Image

CSS = os.path.join(stamp.ROOT, "packages", "design-system", "src", "components", "AiLabel", "AiLabel.module.css")
TOKENS = os.path.join(stamp.STYLES, "tokens.css")


class SpecMatchesCss(unittest.TestCase):
    """One fact, two places: the CSS and the stamping spec must agree."""

    def setUp(self):
        self.css = open(CSS).read()
        self.spec = stamp.load_spec()

    def test_anchor(self):
        a = self.spec["anchorPct"]
        self.assertIn(f"left: {a}cqw;", self.css)
        self.assertIn(f"bottom: {a}cqw;", self.css)

    def test_type_size_and_cap(self):
        s, c = self.spec["sizePct"], self.spec["capPx"]
        self.assertRegex(self.css, rf"font-size: clamp\(\d+px, {s}cqw, {c}px\);")

    def test_width_tiers(self):
        self.assertIn(f"@container (min-width: {self.spec['minWidthShort']}px)", self.css)
        self.assertIn(f"@container (min-width: {self.spec['minWidthFull']}px)", self.css)

    def test_padding(self):
        self.assertIn(f"padding: {self.spec['padYEm']}em {self.spec['padXEm']}em;", self.css)

    def test_tracking_token(self):
        self.assertIn("letter-spacing: var(--st-label-tracking);", self.css)
        tokens = stamp._tokens(TOKENS)
        self.assertEqual(tokens["--st-label-tracking"], f"{self.spec['trackingEm']}em")

    def test_colour_tokens(self):
        for key, var in self.spec["tokens"].items():
            self.assertIn(f"var({var})", self.css, f"{key} token {var} not used in AiLabel.module.css")

    def test_texts(self):
        tsx = open(CSS.replace("module.css", "tsx")).read()
        self.assertIn(f">{self.spec['textShort']}<", tsx)
        self.assertIn(f">{self.spec['textFull']}<", tsx)


class Rendering(unittest.TestCase):
    def make(self, w, h, d):
        p = os.path.join(d, f"src{w}.png")
        Image.new("RGB", (w, h), (200, 120, 160)).save(p)
        return p

    def test_widths_never_upscale(self):
        with tempfile.TemporaryDirectory() as d:
            r = stamp.render(self.make(1000, 600, d), "midjourney", d)
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
            r = stamp.render(self.make(80, 60, d), "midjourney", d)
            self.assertIsNone(r[0]["mark"])
            self.assertTrue(stamp.verify(r[0]["path"])["digitalSourceType"])

    def test_mark_is_inside_the_image(self):
        with tempfile.TemporaryDirectory() as d:
            for w in (200, 480, 1920):
                r = stamp.render(self.make(w, int(w * .6), d), "midjourney", d)[-1]
                x0, y0, x1, y1 = r["mark"]["box"]
                self.assertGreaterEqual(x0, 0); self.assertGreaterEqual(y0, 0)
                self.assertLessEqual(x1, r["width"]); self.assertLessEqual(y1, r["height"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
